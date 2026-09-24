import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

/* Formes de données des sections, reprises de l'ancien système `ds/` au
   retrait de celui-ci (24 septembre 2026) : seul le rendu a changé. */

export interface ComparatifPanel {
  /** Étiquette de la colonne, ex. "Avant" ou "Après". */
  label: string;
  visual?: ReactNode;
  items?: string[];
}

export interface EtapeItem {
  label: string;
  description?: string;
  current?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FeatureItem {
  icon: ReactNode;
  title: string;
  body: string;
  href?: string;
}

export interface FonctionnaliteItem {
  title: string;
  body: string;
  features: string[];
  visual: ReactNode;
  cta?: { label: string; href?: string };
}

export interface IntegrationCard {
  initial: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}

export interface SectionScindeeItem {
  icon: ReactNode;
  label: string;
  description?: string;
}

/**
 * Vocabulaire des sections d'une page de compétence.
 *
 * Refonte du 17 septembre 2026. Une page de compétence ne compose plus ses
 * sections à la main : elle décrit une suite de sections typées, et
 * `PageCompetence` les rend avec les composants du système de design. C'est la
 * quatrième leçon du benchmark du 11 septembre : les cent pages de service de
 * Yield Studio tiennent parce qu'elles suivent un gabarit unique, alors que le
 * visiteur d'isomorph.fr changeait de décor d'une page à l'autre.
 *
 * Ajouter un type de section ici veut dire ajouter son rendu dans
 * `PageCompetence`. Aucun composant nouveau ne se crée pour l'occasion : le
 * besoin se signale et le travail s'arrête.
 */

/**
 * Fond de la section.
 *
 * Omis, il est calculé : les sections claires alternent blanc et gris de haut
 * en bas, de sorte que deux sections voisines ne partagent jamais le même fond.
 * Une section sombre se déclare, parce qu'elle sert d'accent dans la page et
 * que sa place est un choix de composition, jamais un tour de rôle.
 */
export type FondSection = "blanc" | "gris" | "sombre";

/**
 * Fond d'une section rendue par un composant clair.
 *
 * La plupart des composants du système écrivent en gris foncé sur blanc, sans
 * variante sombre : posés sur `sombre`, leur texte devient illisible. Seules
 * `centree` et `schema` savent tenir un fond sombre, et elles seules l'ouvrent.
 */
export type FondClair = "blanc" | "gris";

interface Commun {
  /** Fond imposé. Omis : alternance automatique (voir `FondSection`). */
  fond?: FondClair;
  /**
   * Ancre de la section, pour un lien direct ou un sommaire.
   * Écrite en minuscules et sans accent.
   */
  ancre?: string;
}

/** Cartes à icône : ce que la compétence couvre, en trois à six points. */
export interface SectionCartes extends Commun {
  type: "cartes";
  surtitre?: string;
  titre: string;
  texte?: string;
  items: FeatureItem[];
  appel?: { label: string; href?: string };
}

/** Blocs texte et visuel en alternance : le détail d'une compétence. */
export interface SectionAlternees extends Commun {
  type: "alternees";
  titre: string;
  texte?: string;
  items: FonctionnaliteItem[];
}

/**
 * Déroulé d'une mission, en étapes numérotées.
 *
 * La figure est facultative : sans elle, les étapes occupent toute la largeur,
 * là où `scindee` garde toujours sa colonne visuelle.
 */
export interface SectionEtapes extends Commun {
  type: "etapes";
  titre: string;
  texte?: string;
  etapes: EtapeItem[];
  visuel?: ReactNode;
  appel?: { label: string; href?: string };
}

/**
 * Texte et panneau visuel côte à côte.
 *
 * La figure est obligatoire : la colonne visuelle existe toujours, et une
 * section scindée sans figure affiche un panneau gris vide. Sans figure
 * disponible, prendre `cartes` ou `centree`.
 */
export interface SectionScindee extends Commun {
  type: "scindee";
  surtitre?: string;
  titre: string;
  texte?: string;
  cote?: "droite" | "gauche";
  visuel: ReactNode;
  items?: SectionScindeeItem[];
  appel?: { label: string; href?: string };
}

/**
 * Bloc centré : une idée, un visuel.
 *
 * Son panneau est gris très clair sur fond clair : le fond de la section se
 * déclare donc, et ne peut pas être le gris de la page, où le panneau
 * disparaîtrait.
 */
export interface SectionCentree extends Omit<Commun, "fond"> {
  type: "centree";
  fond: "blanc" | "sombre";
  badge?: ReactNode;
  titre: string;
  texte?: string;
  visuel?: ReactNode;
}

/**
 * Deux colonnes comparées : la situation, puis ce qu'elle devient.
 *
 * Réservée à un vrai avant et après : chaque ligne de la colonne `avant` est
 * marquée d'une croix, chaque ligne de `apres` d'une coche. Employée pour
 * comparer deux options valables, la section fait dire à la page que la
 * première ne sait rien faire. Dans ce cas, prendre `scindee`.
 */
export interface SectionComparatif extends Commun {
  type: "comparatif";
  titre: string;
  texte?: string;
  avant: ComparatifPanel;
  apres: ComparatifPanel;
}

/**
 * Section sombre avec un schéma au centre : un raccordement, une chaîne.
 *
 * Elle est sombre par construction, et le déclare pour que l'enveloppe pose le
 * bon fond derrière elle.
 */
export interface SectionSchema extends Omit<Commun, "fond"> {
  type: "schema";
  fond: "sombre";
  titre: string;
  texte?: string;
  visuel?: ReactNode;
}

/** Cartes de renvoi vers les outils ou les pages voisines. */
export interface SectionRenvois extends Commun {
  type: "renvois";
  titre: string;
  texte?: string;
  cartes: IntegrationCard[];
}

/**
 * Questions fréquentes. Sans JSON-LD `FAQPage` : les résultats enrichis FAQ
 * sont arrêtés depuis le 7 mai 2026, décision tenue sur tout le site.
 */
export interface SectionFaq extends Commun {
  type: "faq";
  titre: string;
  items: FaqItem[];
  contact?: ReactNode;
}

/**
 * Bloc fourni par la page elle-même.
 *
 * Réservée aux sections qui ne sont pas du texte : le relevé PageSpeed en
 * direct, le tableau de coûts par clic. Elle ne sert pas à échapper au
 * vocabulaire : une section de texte se décrit avec les types ci-dessus.
 */
export interface SectionLibre extends Omit<Commun, "fond"> {
  type: "libre";
  /** Le bloc porte ses propres couleurs : il choisit son fond, sombre compris. */
  fond?: FondSection;
  contenu: ReactNode;
}

export type SectionCompetence =
  | SectionCartes
  | SectionAlternees
  | SectionEtapes
  | SectionScindee
  | SectionCentree
  | SectionComparatif
  | SectionSchema
  | SectionRenvois
  | SectionFaq
  | SectionLibre;

/** Les trois familles de compétences (plan du site, §2.1). */
export type Famille = "developpement" | "integrations" | "visibilite";

/** Une page de compétence, de son héros à son appel final. */
export interface PageCompetenceData {
  /** Adresse servie, sans barre oblique finale. Ex. `/integrations/shopify`. */
  chemin: string;
  famille: Famille;
  /**
   * Langue de la page. Omise : français. Une page anglaise porte son propre
   * appel final, celui de la famille étant écrit en français.
   */
  locale?: Locale;
  /** Titre de l'onglet. Garde la requête visée. */
  metaTitre: string;
  metaDescription: string;
  /** H1. Garde la requête visée, comme le titre de l'onglet. */
  titre: string;
  /** Chapeau du héros. Première phrase = la réponse. */
  chapeau: string;
  /** Badge au-dessus du H1. Omis, le nom de la famille est utilisé. */
  badge?: string;
  /** Figure du héros. */
  visuelHeros?: ReactNode;
  sections: SectionCompetence[];
  /** Appel final. Omis, l'appel commun de la famille est utilisé. */
  appelFinal?: { titre: string; texte?: string };
}
