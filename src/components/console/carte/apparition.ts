/**
 * Carte Console : chorégraphie de l'attente et de l'apparition.
 *
 * Une seule source pour la feuille de style (`StylesCarte.tsx`) et pour la
 * minuterie du composant (`CarteGeo.tsx`) : la carte passe à l'état « prête »
 * seulement quand la dernière animation est finie, ce qui retire le filtre de
 * flou sans saut visible.
 *
 * Seules des constantes : le module se teste avec `node --test`.
 */

/** Une étape de l'apparition : départ et durée, en millisecondes. */
export interface Etape {
  delai: number;
  duree: number;
}

/**
 * Mise au point d'objectif, instants comptés depuis le début de l'apparition :
 *  - opaque : la carte est là, très floue (24 px) et un peu trop grande ;
 *  - netTot : l'objectif passe net trop tôt ;
 *  - reflou : il repart légèrement flou (3 px) ;
 *  - verrou : il se cale net, avec un bref sursaut de luminosité.
 */
export const MISE_AU_POINT = {
  opaque: 120,
  netTot: 560,
  reflou: 780,
  verrou: 980,
  /** Flou de départ et flou de la reprise, en pixels. */
  flouDepart: 24,
  flouReprise: 3,
  /** Recul d'échelle : de 1,06 à 1. */
  echelle: 1.06,
  /** Sursaut de luminosité au verrouillage. */
  eclat: 1.4,
} as const;

/**
 * Apparition, comptée depuis le moment où la carte est prête à être vue.
 *  - attente   : la mire d'attente s'éteint ;
 *  - fond      : la mise au point (jusqu'au verrou), puis la luminosité retombe ;
 *  - viseur    : les quatre crochets se referment ensemble, suivent l'objectif,
 *                s'illuminent au verrou, puis s'effacent ;
 *  - surcouche : la grille, les règles et les repères s'allument, une fois net ;
 *  - commandes : les boutons de zoom s'allument en dernier.
 */
export const APPARITION = {
  attente: { delai: 0, duree: 260 },
  fond: { delai: 0, duree: 1180 },
  viseur: { delai: 0, duree: 1340 },
  surcouche: { delai: 1020, duree: 420 },
  commandes: { delai: 1120, duree: 360 },
} as const satisfies Record<string, Etape>;

/** Apparition en mouvement réduit : un fondu court, sans flou ni déplacement. */
export const FONDU_REDUIT = 200;

/** Fin de la dernière étape. */
export function finApparition(etapes: Record<string, Etape> = APPARITION): number {
  return Math.max(...Object.values(etapes).map((e) => e.delai + e.duree));
}

/** Passage à l'état « prête » : la dernière étape finie, avec une marge. */
export const DUREE_APPARITION = finApparition() + 40;

/** Position d'un instant dans une étape, en pour cent (images clés CSS). */
export function pourcent(instant: number, etape: Etape): string {
  const p = ((instant - etape.delai) / etape.duree) * 100;
  return `${Math.round(Math.min(100, Math.max(0, p)) * 10) / 10}%`;
}

/** Au-delà, la carte se dévoile même si des tuiles manquent encore. */
export const PLAFOND_ATTENTE = 8000;

/** Le chargement n'est annoncé aux lecteurs d'écran que s'il dure. */
export const DELAI_ANNONCE = 1000;

/** « Carte prête » reste lisible par les lecteurs d'écran, puis s'efface. */
export const DUREE_ANNONCE = 4000;
