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
  checkDomain,
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
  reason: "invalid_format" | "not_found" | "inactive" | "domain_limit";
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
  const license = await getLicenseByKey(key);

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
    // Statut/expiration sont pilotés par Stripe (source de vérité) — rien à
    // réécrire, on refuse simplement.
    return NextResponse.json(
      { valid: false, reason: "inactive" } as VerifyResponseInvalid,
      { status: 200 }
    );
  }

  // Enforcement multi-sites : le domaine appelant doit tenir dans le quota
  // de sites du plan (seats). Domaine déjà connu → OK ; nouveau sous le quota
  // → ajouté ; quota atteint → refus (la licence est déjà utilisée ailleurs).
  const domainStr = typeof domain === "string" && domain.trim() ? domain.trim() : undefined;
  const updates: Parameters<typeof updateLicense>[1] = {
    lastVerifiedAt: now.toISOString(),
  };

  if (domainStr) {
    const { check, domains } = checkDomain(license, domainStr);
    if (!check.ok) {
      // Quota de sites atteint → ce site n'est pas couvert. On trace la dernière
      // vérif mais on ne débloque pas le Pro pour ce domaine.
      await updateLicense(license.id, updates);
      return NextResponse.json(
        { valid: false, reason: "domain_limit" } as VerifyResponseInvalid,
        { status: 200 }
      );
    }
    if (check.added) {
      updates.domains = domains;
    }
    updates.domain = domainStr.trim().toLowerCase();
  }

  await updateLicense(license.id, updates);

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
