/**
 * Forme de navigation des trois familles, dérivée de la source unique.
 *
 * Les libellés, adresses, lignes descriptives et miroirs anglais vivent dans
 * `src/components/site/familles.ts`. Ce fichier ne déclare aucun contenu : il
 * met la même matière dans la forme attendue par la barre, le méga-menu et le
 * pied de page (familles, sous-groupes, résolution de locale), et il ajoute
 * l'adresse de l'accueil de famille sur laquelle le titre de colonne renvoie
 * depuis la refonte du 17 septembre 2026.
 *
 * Règle architecture RSC : ce fichier reste neutre (pas de « use client »), de
 * sorte qu'un composant serveur (`Footer.tsx`) et un composant client
 * (`NavBar.tsx`) puissent l'importer tous les deux sans que le compilateur RSC
 * remplace les exports par des références client.
 */

import type { Locale } from "@/lib/i18n";
import type { Famille } from "@/components/site/sections";
import {
  DISPOSITIF_BPIFRANCE,
  FAMILLES,
  ORDRE_FAMILLES,
  groupesDeFamille,
  itemsDuGroupe,
  type ItemFamille,
} from "@/components/site/familles";

export interface ExpertiseLink {
  label: string;
  href: string;
  /** Ligne descriptive affichée dans le panneau d'aperçu du mega menu. */
  desc?: string;
  /** Clé identifiant la mini-illustration SVG de l'aperçu. */
  vizKey?: string;
  /** Miroir EN : présent uniquement pour les pages existant en anglais. */
  en?: { href: string; label: string; desc?: string };
}

export interface ExpertiseSubGroup {
  /** Intitulé du sous-groupe (ex. "Technologies"). */
  heading: string;
  items: ExpertiseLink[];
}

export interface ExpertiseFamily {
  /** Clé de la famille dans la source unique. */
  key: Famille;
  /** Intitulé FR de la famille. */
  heading: string;
  /** Intitulé EN de la famille (si différent). Absent = famille masquée en EN. */
  headingEn?: string;
  /** Accueil de famille : le titre de colonne y renvoie. */
  hub: string;
  /** Accueil de famille en EN. Absent = titre non cliquable sur les pages EN. */
  hubEn?: string;
  /** Items principaux de la famille. */
  items: ExpertiseLink[];
  /** Sous-groupes (ex. Technologies : Strapi, Next.js). */
  subGroups?: ExpertiseSubGroup[];
}

function versLien(item: ItemFamille): ExpertiseLink {
  return {
    label: item.libelle,
    href: item.chemin,
    desc: item.description,
    vizKey: item.vizKey,
    en: item.en
      ? { href: item.en.chemin, label: item.en.libelle, desc: item.en.description }
      : undefined,
  };
}

export const EXPERTISE_FAMILIES: ExpertiseFamily[] = ORDRE_FAMILLES.map((key) => {
  const famille = FAMILLES[key];
  const groupes = groupesDeFamille(famille);
  return {
    key,
    heading: famille.nom,
    headingEn: famille.nomEn,
    hub: famille.chemin,
    hubEn: famille.cheminEn,
    items: itemsDuGroupe(famille).map(versLien),
    subGroups: groupes.length
      ? groupes.map((heading) => ({
          heading,
          items: itemsDuGroupe(famille, heading).map(versLien),
        }))
      : undefined,
  };
});

/**
 * Lien Bpifrance : mis à part des trois familles.
 * État d'ouverture de l'aperçu + lien permanent en bas de la colonne aperçu
 * + pied de page colonne Agence. Masqué sur les pages EN.
 */
export const BPIFRANCE_LINK: ExpertiseLink = {
  label: DISPOSITIF_BPIFRANCE.libelle,
  href: DISPOSITIF_BPIFRANCE.chemin,
  desc: DISPOSITIF_BPIFRANCE.description,
  vizKey: DISPOSITIF_BPIFRANCE.vizKey,
};

export interface ResolvedExpertiseLink {
  href: string;
  label: string;
  desc?: string;
  vizKey?: string;
  /** true si l'item est FR uniquement : ne devrait plus être utilisé pour l'affichage
   *  (les items sans miroir EN sont masqués), conservé pour hrefLang si besoin. */
  isFrOnly: boolean;
}

/**
 * Résout un lien du menu pour une locale donnée.
 * Retourne null pour les items sans miroir EN sur les pages EN :
 * ils sont masqués, pas affichés avec "(FR)".
 */
export function resolveExpertiseLink(item: ExpertiseLink, locale: Locale): ResolvedExpertiseLink | null {
  if (locale === "fr") {
    return { href: item.href, label: item.label, desc: item.desc, vizKey: item.vizKey, isFrOnly: false };
  }
  // Locale EN : items sans miroir → masqués.
  if (!item.en) return null;
  return { href: item.en.href, label: item.en.label, desc: item.en.desc ?? item.desc, vizKey: item.vizKey, isFrOnly: false };
}

/**
 * Retourne tous les items d'une famille (principaux + sous-groupes), à plat.
 * Utilisé par Footer.tsx pour la colonne de liens sans structure de sous-groupe.
 */
export function familyAllItems(family: ExpertiseFamily): ExpertiseLink[] {
  return [...family.items, ...(family.subGroups?.flatMap((sg) => sg.items) ?? [])];
}

/**
 * Indique si une famille est visible pour une locale donnée.
 * Une famille est visible en EN si headingEn existe et qu'au moins un item
 * (principal ou sous-groupe) a un miroir EN.
 */
export function isFamilyVisible(family: ExpertiseFamily, locale: Locale): boolean {
  if (locale === "fr") return true;
  if (!family.headingEn) return false;
  return familyAllItems(family).some((item) => Boolean(item.en));
}

/**
 * Accueil de famille pour une locale, ou `undefined` quand il n'existe pas
 * dans cette langue : le titre de colonne reste alors du texte.
 */
export function familyHubHref(family: ExpertiseFamily, locale: Locale): string | undefined {
  return locale === "fr" ? family.hub : family.hubEn;
}
