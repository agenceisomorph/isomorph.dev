/**
 * Route API : Liste des licences (admin)
 *
 * GET /api/licenses           → Liste toutes les licences
 * GET /api/licenses?key=XXXX  → Recherche par clé
 * GET /api/licenses?email=... → Recherche par email
 *
 * Sécu :
 * - Protection par header x-admin-key (comparaison timing-safe via timingSafeEqual)
 * - Fail-closed : sans clé valide → 401, pas de fuite d'information
 * - Ne jamais exposer cette route publiquement sans reverse proxy + IP filtering en V2
 */

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getLicenses, getLicenseByKey } from "@/lib/license";

// ---------------------------------------------------------------------------
// Utilitaire de vérification de clé admin (timing-safe)
// ---------------------------------------------------------------------------

/**
 * Vérifie la clé admin de manière résistante aux attaques de timing
 *
 * @param provided - Clé fournie dans le header
 * @returns true si la clé est valide
 */
function isValidAdminKey(provided: string | null): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !provided) return false;

  try {
    // Comparaison en temps constant pour éviter les attaques de timing
    const expectedBuf = Buffer.from(expected, "utf-8");
    const providedBuf = Buffer.from(provided, "utf-8");

    // Les buffers doivent avoir la même longueur pour timingSafeEqual
    if (expectedBuf.length !== providedBuf.length) return false;

    return timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Handler GET
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Vérification de la clé admin
  const adminKey = request.headers.get("x-admin-key");
  if (!isValidAdminKey(adminKey)) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  // Utilisation de request.nextUrl (URL enrichie Next.js) — synchrone en v15
  const keyQuery = request.nextUrl.searchParams.get("key");
  const emailQuery = request.nextUrl.searchParams.get("email");

  // Recherche par clé
  if (keyQuery) {
    const license = getLicenseByKey(keyQuery);
    if (!license) {
      return NextResponse.json(
        { error: "Licence introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ license }, { status: 200 });
  }

  // Liste complète avec filtre email optionnel
  const allLicenses = getLicenses();

  if (emailQuery) {
    const filtered = allLicenses.filter((l) =>
      l.email.toLowerCase().includes(emailQuery.toLowerCase())
    );
    return NextResponse.json({ licenses: filtered, total: filtered.length }, { status: 200 });
  }

  return NextResponse.json(
    { licenses: allLicenses, total: allLicenses.length },
    { status: 200 }
  );
}

// Méthodes non autorisées
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
