/**
 * Carte Console : types publics des repères et des zones.
 */

import type { Case, PointGeo } from "./geometrie";

/** Repère posé sur la carte par ses coordonnées. */
export interface RepereCarte {
  id: string;
  point: PointGeo;
  /** Nom affiché à côté du repère et lu par les lecteurs d'écran. Sans nom, le repère reste muet. */
  libelle?: string;
  /** `neon` : un lieu (losange) ; `alerte` : ce qui demande l'attention (triangle orange rouge). */
  ton?: "neon" | "alerte";
}

/**
 * Zone hachurée, au contour en escalier sur la grille.
 *
 * - `polygone` : contour géographique ; les cases de la grille affichée dont
 *   le centre tombe dedans sont hachurées (le tracé suit le zoom).
 * - `cases` : cases d'une grille géographique fixe de pas `pas` (degrés de
 *   longitude), obtenues par `caseContenant(point, pas)`. Elles tombent sur
 *   la grille affichée dès que son pas divise celui de la zone.
 */
export type ZoneCarte =
  | { id: string; polygone: readonly PointGeo[] }
  | { id: string; pas: number; cases: readonly Case[] };
