/**
 * Gestionnaire de licences ISOMORPH
 *
 * Stockage MVP : fichier JSON local (data/licenses.json)
 * Migration V2 prévue vers Neon Postgres
 *
 * Format de clé : ISOMORPH-COMMENTS-XXXX-XXXX-XXXX-XXXX
 * où XXXX sont des segments hexadécimaux de 4 caractères.
 * Le dernier segment contient un checksum de parité (somme paire).
 *
 * Sécu : toutes les fonctions s'exécutent côté serveur uniquement.
 * Ce module ne doit jamais être importé dans un Client Component.
 */

import { randomBytes, randomUUID } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Plan d'abonnement disponible */
export type LicensePlan = "pro" | "enterprise";

/** Statut d'une licence */
export type LicenseStatus = "active" | "expired" | "revoked";

/** Identifiant du plugin concerné */
export type PluginId = "comments";

/** Structure complète d'une licence */
export interface License {
  /** Identifiant unique UUID v4 */
  id: string;
  /** Clé lisible : ISOMORPH-COMMENTS-XXXX-XXXX-XXXX-XXXX */
  key: string;
  /** Email de l'acheteur */
  email: string;
  /** Plan souscrit */
  plan: LicensePlan;
  /** Plugin concerné */
  plugin: PluginId;
  /** Statut courant */
  status: LicenseStatus;
  /** ID client Stripe */
  stripeCustomerId: string;
  /** ID abonnement Stripe */
  stripeSubscriptionId: string;
  /** Date de création (ISO 8601) */
  createdAt: string;
  /** Date d'expiration (ISO 8601) — 1 an après création */
  expiresAt: string;
  /** Date de dernière vérification par le plugin (ISO 8601) */
  lastVerifiedAt?: string;
  /** Domaine du site utilisant la licence */
  domain?: string;
}

/** Données nécessaires pour créer une nouvelle licence */
export interface CreateLicenseInput {
  email: string;
  plan: LicensePlan;
  plugin: PluginId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  domain?: string;
}

/** Champs modifiables d'une licence */
export type UpdateLicenseInput = Partial<
  Pick<License, "status" | "domain" | "expiresAt" | "lastVerifiedAt">
>;

// ---------------------------------------------------------------------------
// Chemin du fichier de stockage
// ---------------------------------------------------------------------------

/** Résolution du chemin absolu vers data/licenses.json */
const DB_PATH = join(process.cwd(), "data", "licenses.json");

// ---------------------------------------------------------------------------
// Génération de clé
// ---------------------------------------------------------------------------

/**
 * Génère une clé de licence au format ISOMORPH-{PLUGIN}-XXXX-XXXX-XXXX-XXXX
 *
 * Les 3 premiers segments (XXXX) sont aléatoires (hex).
 * Le dernier segment est calculé pour que la somme de tous les octets
 * hexadécimaux soit paire (checksum simple de cohérence).
 *
 * @param plugin - Identifiant du plugin (ex: "comments")
 * @returns Clé formatée en majuscules
 *
 * @example
 * generateLicenseKey("comments")
 * // → "ISOMORPH-COMMENTS-A3F1-B2C4-D5E6-F7A8"
 */
export function generateLicenseKey(plugin: PluginId = "comments"): string {
  // Générer 6 octets aléatoires → 3 segments hex de 4 caractères
  const rawBytes = randomBytes(6);
  const seg1 = rawBytes.slice(0, 2).toString("hex").toUpperCase();
  const seg2 = rawBytes.slice(2, 4).toString("hex").toUpperCase();
  const seg3 = rawBytes.slice(4, 6).toString("hex").toUpperCase();

  // Calculer le checksum : somme de tous les octets des 3 segments
  const sum = rawBytes.reduce((acc, byte) => acc + byte, 0);

  // Générer 2 octets pour le segment de checksum et ajuster la parité
  const checksumBytes = randomBytes(2);
  // Forcer la parité paire du dernier octet selon la somme courante
  if ((sum + checksumBytes[0] + checksumBytes[1]) % 2 !== 0) {
    checksumBytes[1] = checksumBytes[1] % 2 === 0 ? checksumBytes[1] + 1 : checksumBytes[1] - 1;
    // Éviter le dépassement d'octet
    if (checksumBytes[1] > 255) checksumBytes[1] = checksumBytes[1] - 2;
    if (checksumBytes[1] < 0) checksumBytes[1] = 0;
  }
  const seg4 = checksumBytes.toString("hex").toUpperCase();

  return `ISOMORPH-${plugin.toUpperCase()}-${seg1}-${seg2}-${seg3}-${seg4}`;
}

/**
 * Valide le format et le checksum d'une clé de licence
 *
 * Vérifie :
 * 1. Le format ISOMORPH-{PLUGIN}-XXXX-XXXX-XXXX-XXXX
 * 2. Que chaque segment contient exactement 4 caractères hexadécimaux
 * 3. Que le checksum (somme des octets) est pair
 *
 * @param key - Clé à valider
 * @returns true si la clé est valide
 *
 * @example
 * validateLicenseKey("ISOMORPH-COMMENTS-A3F1-B2C4-D5E6-F7A8") // → true
 * validateLicenseKey("invalid-key") // → false
 */
export function validateLicenseKey(key: string): boolean {
  if (typeof key !== "string") return false;

  // Vérification du format général
  const pattern = /^ISOMORPH-[A-Z]+-([0-9A-F]{4})-([0-9A-F]{4})-([0-9A-F]{4})-([0-9A-F]{4})$/i;
  const match = key.toUpperCase().match(pattern);
  if (!match) return false;

  // Extraire les 4 segments hexadécimaux
  const [, s1, s2, s3, s4] = match;

  // Convertir chaque segment en octets et sommer
  const toBytes = (seg: string): number[] => [
    parseInt(seg.slice(0, 2), 16),
    parseInt(seg.slice(2, 4), 16),
  ];

  const allBytes = [...toBytes(s1), ...toBytes(s2), ...toBytes(s3), ...toBytes(s4)];
  const checksum = allBytes.reduce((acc, b) => acc + b, 0);

  // Vérifier la parité paire
  return checksum % 2 === 0;
}

// ---------------------------------------------------------------------------
// Lecture / Écriture JSON
// ---------------------------------------------------------------------------

/**
 * Lit toutes les licences depuis le fichier JSON
 *
 * @returns Tableau de toutes les licences
 * @throws Error si le fichier est illisible ou malformé
 */
export function getLicenses(): License[] {
  try {
    const raw = readFileSync(DB_PATH, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Le fichier licenses.json ne contient pas un tableau valide");
    }
    return parsed as License[];
  } catch (error) {
    // Si le fichier n'existe pas encore, retourner un tableau vide
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * Persiste le tableau de licences dans le fichier JSON
 *
 * @param licenses - Tableau complet des licences à sauvegarder
 */
function saveLicenses(licenses: License[]): void {
  writeFileSync(DB_PATH, JSON.stringify(licenses, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// CRUD licences
// ---------------------------------------------------------------------------

/**
 * Crée et enregistre une nouvelle licence
 *
 * La date d'expiration est automatiquement fixée à 1 an après la création.
 *
 * @param data - Données nécessaires à la création
 * @returns La licence créée avec son id et sa clé
 */
export function createLicense(data: CreateLicenseInput): License {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const license: License = {
    id: randomUUID(),
    key: generateLicenseKey(data.plugin),
    email: data.email,
    plan: data.plan,
    plugin: data.plugin,
    status: "active",
    stripeCustomerId: data.stripeCustomerId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...(data.domain ? { domain: data.domain } : {}),
  };

  const licenses = getLicenses();
  licenses.push(license);
  saveLicenses(licenses);

  return license;
}

/**
 * Recherche une licence par sa clé lisible
 *
 * @param key - Clé au format ISOMORPH-COMMENTS-XXXX-XXXX-XXXX-XXXX
 * @returns La licence trouvée, ou undefined
 */
export function getLicenseByKey(key: string): License | undefined {
  const licenses = getLicenses();
  return licenses.find(
    (l) => l.key.toUpperCase() === key.toUpperCase()
  );
}

/**
 * Recherche une licence par son ID Stripe d'abonnement
 *
 * @param subscriptionId - ID Stripe de l'abonnement
 * @returns La licence trouvée, ou undefined
 */
export function getLicenseBySubscriptionId(subscriptionId: string): License | undefined {
  const licenses = getLicenses();
  return licenses.find((l) => l.stripeSubscriptionId === subscriptionId);
}

/**
 * Met à jour les champs modifiables d'une licence
 *
 * @param id - UUID de la licence à modifier
 * @param data - Champs à mettre à jour (partiels)
 * @returns La licence mise à jour, ou undefined si introuvable
 */
export function updateLicense(id: string, data: UpdateLicenseInput): License | undefined {
  const licenses = getLicenses();
  const index = licenses.findIndex((l) => l.id === id);
  if (index === -1) return undefined;

  licenses[index] = { ...licenses[index], ...data };
  saveLicenses(licenses);

  return licenses[index];
}

/**
 * Révoque une licence (status → "revoked")
 *
 * @param id - UUID de la licence à révoquer
 * @returns La licence révoquée, ou undefined si introuvable
 */
export function revokeLicense(id: string): License | undefined {
  return updateLicense(id, { status: "revoked" });
}

// ---------------------------------------------------------------------------
// Tests unitaires minimaux (Vitest)
// ---------------------------------------------------------------------------
// describe("generateLicenseKey", () => {
//   it("génère une clé au bon format", () => {
//     const key = generateLicenseKey("comments");
//     expect(key).toMatch(/^ISOMORPH-COMMENTS-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
//   });
//   it("génère des clés uniques", () => {
//     const keys = new Set(Array.from({ length: 100 }, () => generateLicenseKey("comments")));
//     expect(keys.size).toBe(100);
//   });
// });
//
// describe("validateLicenseKey", () => {
//   it("valide une clé correctement formée", () => {
//     const key = generateLicenseKey("comments");
//     expect(validateLicenseKey(key)).toBe(true);
//   });
//   it("rejette une clé malformée", () => {
//     expect(validateLicenseKey("INVALID-KEY")).toBe(false);
//     expect(validateLicenseKey("")).toBe(false);
//   });
//   it("est insensible à la casse", () => {
//     const key = generateLicenseKey("comments").toLowerCase();
//     expect(validateLicenseKey(key)).toBe(true);
//   });
// });
