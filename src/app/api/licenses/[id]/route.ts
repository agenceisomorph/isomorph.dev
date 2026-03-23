/**
 * Route API : Actions sur une licence spécifique (admin)
 *
 * PATCH  /api/licenses/:id → Met à jour une licence (status, domain, expiresAt)
 * DELETE /api/licenses/:id → Révoque une licence
 *
 * Sécu :
 * - Protection par header x-admin-key (comparaison timing-safe)
 * - Validation des champs modifiables pour éviter les injections de propriétés
 * - Fail-closed : sans clé valide → 401
 */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { updateLicense, revokeLicense, getLicenses } from "@/lib/license";
import type { UpdateLicenseInput, LicenseStatus } from "@/lib/license";

// ---------------------------------------------------------------------------
// Utilitaire de vérification de clé admin (timing-safe)
// ---------------------------------------------------------------------------

function isValidAdminKey(provided: string | null): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !provided) return false;

  try {
    const expectedBuf = Buffer.from(expected, "utf-8");
    const providedBuf = Buffer.from(provided, "utf-8");
    if (expectedBuf.length !== providedBuf.length) return false;
    return timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Typage des paramètres de route
// ---------------------------------------------------------------------------

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Handler PATCH — Mise à jour partielle
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const adminKey = request.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  // Vérifier que la licence existe
  const licenses = getLicenses();
  const existing = licenses.find((l) => l.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Licence introuvable" }, { status: 404 });
  }

  // Lire et valider le corps
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide" },
      { status: 400 }
    );
  }

  const rawBody = body as Record<string, unknown>;

  // Construire les champs autorisés uniquement (whitelist stricte)
  const allowedStatuses: LicenseStatus[] = ["active", "expired", "revoked"];
  const updates: UpdateLicenseInput = {};

  if ("status" in rawBody) {
    if (!allowedStatuses.includes(rawBody.status as LicenseStatus)) {
      return NextResponse.json(
        { error: `status doit être l'une des valeurs : ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    updates.status = rawBody.status as LicenseStatus;
  }

  if ("domain" in rawBody) {
    if (typeof rawBody.domain !== "string" && rawBody.domain !== null) {
      return NextResponse.json(
        { error: "domain doit être une chaîne de caractères ou null" },
        { status: 400 }
      );
    }
    updates.domain = rawBody.domain as string | undefined;
  }

  if ("expiresAt" in rawBody) {
    if (typeof rawBody.expiresAt !== "string" || isNaN(Date.parse(rawBody.expiresAt as string))) {
      return NextResponse.json(
        { error: "expiresAt doit être une date ISO 8601 valide" },
        { status: 400 }
      );
    }
    updates.expiresAt = rawBody.expiresAt as string;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Aucun champ modifiable fourni (status, domain, expiresAt)" },
      { status: 400 }
    );
  }

  const updated = updateLicense(id, updates);
  return NextResponse.json({ license: updated }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Handler DELETE — Révocation
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const adminKey = request.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  // Vérifier que la licence existe avant de révoquer
  const licenses = getLicenses();
  const existing = licenses.find((l) => l.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Licence introuvable" }, { status: 404 });
  }

  if (existing.status === "revoked") {
    return NextResponse.json(
      { error: "La licence est déjà révoquée" },
      { status: 409 }
    );
  }

  const revoked = revokeLicense(id);
  return NextResponse.json({ license: revoked }, { status: 200 });
}

// Méthodes non autorisées
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
