/**
 * Carte Console : thème Snazzy Maps.
 *
 * `theme-snazzy.json` suit le format des styles Google Maps (tableau de règles
 * `featureType`, `elementType`, `stylers`) : il se colle tel quel sur
 * snazzymaps.com ou dans l'option `styles` d'une carte Google Maps. Couleurs
 * de `PALETTE_CARTE` (`style.ts`), comme le style MapLibre ; l'accord des deux
 * et la validité des types sont vérifiés par `carte.test.mjs`.
 *
 * Référence du format : documentation Google Maps JavaScript API, « Styling
 * reference » (MapTypeStyle, MapTypeStyler).
 */

import brut from "./theme-snazzy.json";

/** Entités stylables d'une carte Google Maps. */
export type EntiteGoogle =
  | "all"
  | "administrative"
  | "administrative.country"
  | "administrative.land_parcel"
  | "administrative.locality"
  | "administrative.neighborhood"
  | "administrative.province"
  | "landscape"
  | "landscape.man_made"
  | "landscape.natural"
  | "landscape.natural.landcover"
  | "landscape.natural.terrain"
  | "poi"
  | "poi.attraction"
  | "poi.business"
  | "poi.government"
  | "poi.medical"
  | "poi.park"
  | "poi.place_of_worship"
  | "poi.school"
  | "poi.sports_complex"
  | "road"
  | "road.arterial"
  | "road.highway"
  | "road.highway.controlled_access"
  | "road.local"
  | "transit"
  | "transit.line"
  | "transit.station"
  | "transit.station.airport"
  | "transit.station.bus"
  | "transit.station.rail"
  | "water";

/** Parties stylables d'une entité. */
export type ElementGoogle =
  | "all"
  | "geometry"
  | "geometry.fill"
  | "geometry.stroke"
  | "labels"
  | "labels.icon"
  | "labels.text"
  | "labels.text.fill"
  | "labels.text.stroke";

/** Un réglage : une seule propriété par objet, comme l'exige le format. */
export type RegleurGoogle =
  | { color: string }
  | { visibility: "on" | "off" | "simplified" }
  | { weight: number }
  | { hue: string }
  | { lightness: number }
  | { saturation: number }
  | { gamma: number }
  | { invert_lightness: boolean };

export interface RegleStyleGoogle {
  featureType?: EntiteGoogle;
  elementType?: ElementGoogle;
  stylers: readonly RegleurGoogle[];
}

/** Le thème, typé. Le fichier JSON reste la source à copier. */
export const THEME_SNAZZY = brut as readonly RegleStyleGoogle[];

/** Le thème en texte, indenté, prêt à coller. */
export const JSON_SNAZZY = JSON.stringify(THEME_SNAZZY, null, 2);
