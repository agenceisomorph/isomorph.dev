/**
 * Gestionnaire de licences ISOMORPH
 *
 * Stockage : **Stripe est la base de données** (2026-07-12).
 * La clé de licence et ses métadonnées (plan, plugin, domaines) vivent dans les
 * `metadata` de l'abonnement Stripe. Raisons :
 *   - Vercel est serverless → pas d'écriture fichier durable (l'ancien
 *     `data/licenses.json` ne persistait pas). Stripe évite toute base annexe.
 *   - Stripe devient la **source de vérité** : statut (actif/annulé) et expiration
 *     (`current_period_end`) sont lus en direct → révocation/expiration automatiques.
 *   - Aucune clé secrète nouvelle : réutilise `STRIPE_SECRET_KEY` déjà en env.
 *
 * Les fonctions CRUD sont donc **asynchrones** (appels Stripe). `generateLicenseKey`
 * et `validateLicenseKey` restent des utilitaires purs.
 *
 * Sécu : module SERVEUR uniquement (STRIPE_SECRET_KEY). Jamais dans un Client Component.
 */

import Stripe from "stripe";
import { randomBytes } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Plan d'abonnement disponible.
 * - `pro`        : 1 site (79 €/an)
 * - `pro-multi`  : 5 sites (199 €/an) — cible agences
 * - `enterprise` : sites illimités (349 €/an)
 */
export type LicensePlan = "pro" | "pro-multi" | "enterprise";

/** Représente un nombre de sites illimité (Enterprise). */
export const UNLIMITED_SEATS = 0;

/**
 * Nombre de sites (domaines distincts) autorisés par plan.
 * `UNLIMITED_SEATS` (0) = illimité.
 */
export const PLAN_SEATS: Record<LicensePlan, number> = {
  pro: 1,
  "pro-multi": 5,
  enterprise: UNLIMITED_SEATS,
};

/** Retourne le nombre de sites autorisés pour un plan (0 = illimité). */
export function seatsForPlan(plan: LicensePlan): number {
  return PLAN_SEATS[plan] ?? 1;
}

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
  /** Domaine du site utilisant la licence (legacy — dernier domaine vu). */
  domain?: string;
  /**
   * Nombre de sites (domaines distincts) autorisés. Dérivé du plan à la création.
   * 0 = illimité (Enterprise).
   */
  seats: number;
  /** Domaines distincts ayant activé cette licence (enforcement multi-sites). */
  domains: string[];
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
  Pick<License, "status" | "domain" | "expiresAt" | "lastVerifiedAt" | "domains" | "seats">
>;

/**
 * Résultat d'une tentative d'activation d'un domaine sur une licence.
 * - `ok`    : le domaine est autorisé (déjà connu, ou ajouté sous le quota).
 * - `limit` : quota de sites atteint — ce domaine n'est pas couvert.
 */
export type DomainCheck =
  | { ok: true; added: boolean }
  | { ok: false; reason: "domain_limit" };

/**
 * Vérifie/active un domaine sur une licence en respectant le quota de sites.
 * PURE (ne persiste pas) — retourne l'état et la nouvelle liste de domaines.
 *
 * Règles :
 *   - Domaine déjà présent → ok, pas d'ajout.
 *   - Seats illimités (0) → ok, ajout.
 *   - Sous le quota → ok, ajout.
 *   - Quota atteint → refus (domain_limit).
 */
export function checkDomain(
  license: Pick<License, "seats" | "domains">,
  domain: string
): { check: DomainCheck; domains: string[] } {
  const current = license.domains ?? [];
  const d = domain.trim().toLowerCase();

  if (!d) {
    // Domaine vide (best effort) : on ne bloque pas, on n'ajoute rien.
    return { check: { ok: true, added: false }, domains: current };
  }
  if (current.includes(d)) {
    return { check: { ok: true, added: false }, domains: current };
  }
  const unlimited = (license.seats ?? 1) === UNLIMITED_SEATS;
  if (unlimited || current.length < (license.seats ?? 1)) {
    return { check: { ok: true, added: true }, domains: [...current, d] };
  }
  return { check: { ok: false, reason: "domain_limit" }, domains: current };
}

// ---------------------------------------------------------------------------
// Client Stripe (base de données des licences)
// ---------------------------------------------------------------------------

function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY n'est pas défini");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia", typescript: true });
}

/** Convertit un statut d'abonnement Stripe en statut de licence. */
function mapStatus(s: Stripe.Subscription.Status): LicenseStatus {
  // active/trialing → active ; past_due → active (grâce, Stripe n'a pas encore
  // annulé) ; tout le reste (canceled/unpaid/incomplete*) → révoquée.
  if (s === "active" || s === "trialing" || s === "past_due") return "active";
  return "revoked";
}

/**
 * Reconstruit une `License` depuis un abonnement Stripe.
 * Retourne `undefined` si l'abonnement ne porte pas de licence (`license_key` absent).
 */
function subToLicense(sub: Stripe.Subscription): License | undefined {
  const md = sub.metadata ?? {};
  const key = md["license_key"];
  if (!key) return undefined;

  const plan = (md["plan"] as LicensePlan) || "pro";
  const plugin = (md["plugin"] as PluginId) || "comments";
  let domains: string[] = [];
  try {
    domains = md["domains"] ? (JSON.parse(md["domains"]) as string[]) : [];
  } catch {
    domains = [];
  }
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  return {
    id: sub.id,
    key,
    email: md["email"] ?? "",
    plan,
    plugin,
    status: mapStatus(sub.status),
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    createdAt: new Date(sub.created * 1000).toISOString(),
    expiresAt: new Date(sub.current_period_end * 1000).toISOString(),
    seats: seatsForPlan(plan),
    domains,
    ...(md["last_verified_at"] ? { lastVerifiedAt: md["last_verified_at"] } : {}),
    ...(domains[0] ? { domain: domains[0] } : {}),
  };
}

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
// CRUD licences (backend Stripe — asynchrone)
// ---------------------------------------------------------------------------

/**
 * Crée une licence en écrivant sa clé + métadonnées dans l'abonnement Stripe
 * (déjà créé par le Checkout). L'expiration = `current_period_end` de Stripe.
 *
 * @returns La licence créée (avec sa clé). Lève si l'abonnement est introuvable.
 */
export async function createLicense(data: CreateLicenseInput): Promise<License> {
  const key = generateLicenseKey(data.plugin);
  const seedDomain = data.domain?.trim().toLowerCase();
  const domains = seedDomain ? [seedDomain] : [];

  // Stripe FUSIONNE les métadonnées : on ajoute nos clés sans écraser les autres.
  const sub = await stripe().subscriptions.update(data.stripeSubscriptionId, {
    metadata: {
      license_key: key,
      plan: data.plan,
      plugin: data.plugin,
      email: data.email,
      domains: JSON.stringify(domains),
    },
  });

  const license = subToLicense(sub);
  if (!license) throw new Error("createLicense : métadonnées de licence non appliquées");
  return license;
}

/**
 * Recherche une licence par sa clé (via l'index de recherche Stripe sur metadata).
 * NB : l'index Stripe a une latence de quelques secondes après écriture — sans
 * impact réel (le client installe la clé après réception de l'email).
 */
export async function getLicenseByKey(key: string): Promise<License | undefined> {
  const normalized = key.toUpperCase().replace(/'/g, "");
  const res = await stripe().subscriptions.search({
    query: `metadata['license_key']:'${normalized}'`,
    limit: 1,
  });
  const sub = res.data[0];
  return sub ? subToLicense(sub) : undefined;
}

/** Recherche une licence par l'ID de son abonnement Stripe. */
export async function getLicenseBySubscriptionId(
  subscriptionId: string
): Promise<License | undefined> {
  try {
    const sub = await stripe().subscriptions.retrieve(subscriptionId);
    return subToLicense(sub);
  } catch {
    return undefined;
  }
}

/**
 * Met à jour une licence. `id` = ID d'abonnement Stripe.
 * - `domains` / `domain` / `lastVerifiedAt` → écrits en métadonnées (fusion).
 * - `status: "revoked"` → **annule l'abonnement** Stripe.
 * - `expiresAt` / autres → ignorés (dérivés de Stripe, non modifiables ici).
 */
export async function updateLicense(
  id: string,
  data: UpdateLicenseInput
): Promise<License | undefined> {
  try {
    if (data.status === "revoked") {
      const canceled = await stripe().subscriptions.cancel(id);
      return subToLicense(canceled);
    }

    const md: Stripe.MetadataParam = {};
    if (data.domains) md["domains"] = JSON.stringify(data.domains);
    if (data.domain) md["last_domain"] = data.domain;
    if (data.lastVerifiedAt) md["last_verified_at"] = data.lastVerifiedAt;

    if (Object.keys(md).length === 0) {
      const sub = await stripe().subscriptions.retrieve(id);
      return subToLicense(sub);
    }

    const sub = await stripe().subscriptions.update(id, { metadata: md });
    return subToLicense(sub);
  } catch {
    return undefined;
  }
}

/** Révoque une licence en annulant l'abonnement Stripe. */
export async function revokeLicense(id: string): Promise<License | undefined> {
  try {
    const canceled = await stripe().subscriptions.cancel(id);
    return subToLicense(canceled);
  } catch {
    return undefined;
  }
}

/**
 * Liste les licences (abonnements Stripe portant une `license_key`).
 * Usage admin — limité aux 100 derniers abonnements.
 */
export async function getLicenses(): Promise<License[]> {
  const res = await stripe().subscriptions.list({ status: "all", limit: 100 });
  return res.data
    .map(subToLicense)
    .filter((l): l is License => l !== undefined);
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
