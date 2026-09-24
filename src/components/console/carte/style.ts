/**
 * Carte Console : palette et style MapLibre.
 *
 * Une seule palette pour les deux thèmes : le style MapLibre ci-dessous et le
 * thème Snazzy Maps (`theme-snazzy.json`), vérifiés ensemble par
 * `carte.test.mjs`. Couleurs pleines (sans transparence) parce que le format
 * Google Maps n'en accepte pas : chaque trait néon est le néon du système
 * (#7dd3fc) mélangé à la terre dans la proportion indiquée.
 *
 * Tuiles : OpenFreeMap (https://openfreemap.org), schéma OpenMapTiles, sans
 * clé ni compte. Aucune couche de texte ni d'icône : ni glyphes ni sprites à
 * charger, la surcouche porte ses propres repères.
 *
 * Seules des importations de types : le module se teste avec `node --test`.
 */

import type { MapOptions } from "maplibre-gl";

/** Style MapLibre complet (le type accepté par l'option `style` de la carte). */
export type StyleCarte = Exclude<NonNullable<MapOptions["style"]>, string>;

/** Couleurs de la carte. */
export const PALETTE_CARTE = {
  /** Terre quasi noire bleutée, le fond. */
  terre: "#06101b",
  /** Eau, plus sombre que la terre. */
  eau: "#01050b",
  /** Forêts, à peine distinctes de la terre. */
  vegetation: "#08131f",
  /** Bâtiments : néon à 8 %. */
  batiment: "#10202d",
  /** Autoroutes et voies rapides : néon à 32 %. */
  routeMajeure: "#2c4e63",
  /** Routes principales : néon à 21 %. */
  route: "#1f394a",
  /** Rues : néon à 12 %. */
  routeLocale: "#142736",
  /** Voies ferrées : néon à 15 %. */
  voieFerree: "#182d3d",
  /** Frontières : néon à 44 %. */
  limitePays: "#3a667e",
  /** Limites de régions : néon à 26 %. */
  limiteRegion: "#254356",
} as const;

export type CouleurCarte = keyof typeof PALETTE_CARTE;

/** Libellés des pastilles de la vitrine, dans l'ordre d'affichage. */
export const PASTILLES_CARTE: readonly { cle: CouleurCarte; nom: string }[] = [
  { cle: "terre", nom: "Terre" },
  { cle: "eau", nom: "Eau" },
  { cle: "vegetation", nom: "Forêts" },
  { cle: "batiment", nom: "Bâtiments" },
  { cle: "routeMajeure", nom: "Voies rapides" },
  { cle: "route", nom: "Routes" },
  { cle: "routeLocale", nom: "Rues" },
  { cle: "voieFerree", nom: "Voies ferrées" },
  { cle: "limitePays", nom: "Frontières" },
  { cle: "limiteRegion", nom: "Régions" },
];

/** Orange rouge de la surcouche : zones et repères qui alertent. */
export const COULEUR_ALERTE = "#ff6b3d";

/** TileJSON OpenFreeMap du monde entier. */
export const SOURCE_TUILES = "https://tiles.openfreemap.org/planet";

const P = PALETTE_CARTE;

/** Largeur de trait qui s'épaissit avec le zoom. */
function largeur(z0: number, l0: number, z1: number, l1: number) {
  return ["interpolate", ["exponential", 1.4], ["zoom"], z0, l0, z1, l1] as ["interpolate", ["exponential", number], ["zoom"], number, number, number, number];
}

const LIGNES = ["==", ["geometry-type"], "LineString"] as ["==", ["geometry-type"], string];

function classes(...valeurs: string[]) {
  return ["in", ["get", "class"], ["literal", valeurs]] as ["in", ["get", string], ["literal", string[]]];
}

/** Style MapLibre de la palette Console, sur les tuiles OpenFreeMap. */
export function styleCarte(): StyleCarte {
  return {
    version: 8,
    name: "Console",
    sources: {
      openmaptiles: { type: "vector", url: SOURCE_TUILES },
    },
    layers: [
      { id: "terre", type: "background", paint: { "background-color": P.terre } },
      {
        id: "forets",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: classes("wood"),
        paint: { "fill-color": P.vegetation },
      },
      {
        id: "eau",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        filter: ["!=", ["get", "brunnel"], "tunnel"],
        paint: { "fill-color": P.eau },
      },
      {
        id: "cours-eau",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        minzoom: 7,
        filter: classes("river", "canal"),
        paint: { "line-color": P.eau, "line-width": largeur(7, 0.6, 14, 2.4) },
      },
      {
        id: "batiments",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 13,
        paint: { "fill-color": P.batiment },
      },
      {
        id: "rues",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 11,
        filter: ["all", LIGNES, classes("tertiary", "minor", "service")],
        paint: { "line-color": P.routeLocale, "line-width": largeur(11, 0.5, 15, 2) },
      },
      {
        id: "voies-ferrees",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 9,
        filter: ["all", LIGNES, classes("rail")],
        paint: { "line-color": P.voieFerree, "line-width": 1, "line-dasharray": [3, 3] },
      },
      {
        id: "routes",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 7,
        filter: ["all", LIGNES, classes("primary", "secondary")],
        paint: { "line-color": P.route, "line-width": largeur(7, 0.5, 14, 1.8) },
      },
      {
        id: "voies-rapides",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        minzoom: 5,
        filter: ["all", LIGNES, classes("motorway", "trunk")],
        paint: { "line-color": P.routeMajeure, "line-width": largeur(5, 0.5, 14, 2.4) },
      },
      {
        id: "limites-regions",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        minzoom: 4,
        filter: ["all", ["==", ["get", "admin_level"], 4], ["==", ["get", "maritime"], 0]],
        paint: { "line-color": P.limiteRegion, "line-width": 0.8, "line-dasharray": [4, 3] },
      },
      {
        id: "frontieres",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["all", ["==", ["get", "admin_level"], 2], ["==", ["get", "maritime"], 0]],
        paint: { "line-color": P.limitePays, "line-width": largeur(3, 0.8, 10, 1.4) },
      },
    ],
  };
}
