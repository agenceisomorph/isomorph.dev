/**
 * Route API : Vérification publique d'une licence
 *
 * POST /api/licenses/verify
 * Body: { key: string, domain?: string }
 *
 * Réponse : { valid: boolean, plan?: string, expiresAt?: string }
 *
 * Cette route est publique (appelée par le plugin Strapi en V2).
 * Elle ne retourne que les informations nécessaires à la validation,
 * sans exposer les données sensibles (email, stripeCustomerId, etc.)
 *
 * Sécu :
 * - Pas d'authentification requise (conçue pour être appelée par le plugin)
 * - Ne divulgue JAMAIS l'email, les IDs Stripe ou les données internes
 * - Réponse identique pour clé introuvable et clé révoquée (pas de fuite d'info)
 * - Mise à jour du champ lastVerifiedAt pour traçabilité
 * - Rate limiting à implémenter en V2 (middleware Vercel Edge)
 *
 * Perf : Server Route — aucun JS côté client
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getLicenseByKey,
  updateLicense,
  validateLicenseKey,
} from "@/lib/license";

// ---------------------------------------------------------------------------
// Types de réponse
// ---------------------------------------------------------------------------

/** Réponse en cas de licence valide */
interface VerifyResponseValid {
  valid: true;
  plan: string;
  plugin: string;
  expiresAt: string;
}

/** Réponse en cas de licence invalide */
interface VerifyResponseInvalid {
  valid: false;
  reason: "invalid_format" | "not_found" | "inactive";
}

type VerifyResponse = VerifyResponseValid | VerifyResponseInvalid;

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
  // Lecture et validation du corps
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { valid: false, reason: "invalid_format" } as VerifyResponseInvalid,
      { status: 400 }
    );
  }

  const rawBody = body as Record<string, unknown>;
  const key = rawBody.key;
  const domain = rawBody.domain;

  // Validation du champ key
  if (!key || typeof key !== "string") {
    return NextResponse.json(
      { valid: false, reason: "invalid_format" } as VerifyResponseInvalid,
      { status: 400 }
    );
  }

  // Validation du format et checksum de la clé
  if (!validateLicenseKey(key)) {
    return NextResponse.json(
      { valid: false, reason: "invalid_format" } as VerifyResponseInvalid,
      { status: 200 } // 200 intentionnel : la requête est valide, la clé ne l'est pas
    );
  }

  // Recherche de la licence
  const license = getLicenseByKey(key);

  // Réponse identique pour "introuvable" et "révoquée" — pas de fuite d'info
  if (!license) {
    return NextResponse.json(
      { valid: false, reason: "not_found" } as VerifyResponseInvalid,
      { status: 200 }
    );
  }

  // Vérifier le statut
  if (license.status === "revoked" || license.status === "expired") {
    return NextResponse.json(
      { valid: false, reason: "inactive" } as VerifyResponseInvalid,
      { status: 200 }
    );
  }

  // Vérifier la date d'expiration
  const now = new Date();
  const expiresAt = new Date(license.expiresAt);
  if (expiresAt < now) {
    // Mettre à jour le statut si expiré mais pas encore marqué
    if (license.status === "active") {
      updateLicense(license.id, { status: "expired" });
    }
    return NextResponse.json(
      { valid: false, reason: "inactive" } as VerifyResponseInvalid,
      { status: 200 }
    );
  }

  // Mise à jour du domaine si fourni (et différent du domaine enregistré)
  const domainStr = typeof domain === "string" && domain.trim() ? domain.trim() : undefined;
  const updates: Parameters<typeof updateLicense>[1] = {
    lastVerifiedAt: now.toISOString(),
  };
  if (domainStr && domainStr !== license.domain) {
    updates.domain = domainStr;
  }
  updateLicense(license.id, updates);

  // Retourner uniquement les informations nécessaires
  return NextResponse.json(
    {
      valid: true,
      plan: license.plan,
      plugin: license.plugin,
      expiresAt: license.expiresAt,
    } as VerifyResponseValid,
    { status: 200 }
  );
}

// Méthodes non autorisées
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
