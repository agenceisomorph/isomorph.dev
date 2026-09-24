/**
 * Données des expérimentations visuelles et techniques présentées sur
 * isomorph.dev/experimentations.
 *
 * Source : inventaire-contenu-2026-09-25.md §3
 * Aucune donnée inventée : chaque entrée correspond à un composant existant
 * dans le dépôt `isomorph` (lecture seule) ou dans les composants Console.
 *
 * Champs obligatoires (forme de base) :
 *   slug    — identifiant URL (kebab-case)
 *   titre   — nom FR
 *   resume  — description courte FR (une phrase)
 *   techno  — pile technique principale
 *
 * Champs optionnels :
 *   titreEn  — nom EN
 *   resumeEn — description courte EN
 *   source   — chemin du composant de démonstration (relatif à src/components)
 *   groupe   — catégorie d'affichage dans la galerie
 */

export type Groupe = "hero" | "instrument" | "terrain";

export interface Experimentation {
  slug: string;
  titre: string;
  resume: string;
  techno: string;
  titreEn: string;
  resumeEn: string;
  source: string;
  groupe: Groupe;
}

/**
 * Liste des expérimentations, dans l'ordre d'affichage de la galerie.
 * Le jeu de la Lune est exclu (composant `Astronaute.tsx` supprimé dans
 * le commit `dbc0bd9`).
 */
export const EXPERIMENTATIONS: Experimentation[] = [
  {
    slug: "carte-mere",
    titre: "Carte mère",
    resume:
      "Vol rapide à basse altitude au-dessus d'une carte mère procédurale animée, puis atterrissage sur la puce principale.",
    techno: "React Three Fiber · shaders inline",
    titreEn: "Motherboard",
    resumeEn:
      "Fast low-altitude flight over a procedural animated motherboard, then landing on the main chip.",
    source: "experimentations/carte-mere/HeroCarteMere",
    groupe: "hero",
  },
  {
    slug: "coeur-quantique",
    titre: "Coeur quantique",
    resume:
      "Coeur pulsant entouré de particules et d'arcs électriques, registre circuit vivant.",
    techno: "React Three Fiber · particules BufferAttribute · blending additif",
    titreEn: "Quantum heart",
    resumeEn: "Pulsating heart surrounded by particles and electric arcs, living-circuit aesthetic.",
    source: "experimentations/coeur-quantique/HeroCoeurQuantique",
    groupe: "hero",
  },
  {
    slug: "montagnes-russes",
    titre: "Montagnes russes",
    resume:
      "Impulsion électrique parcourant un rail CatmullRomCurve3 depuis une piste cuivre jusqu'au coeur d'un réseau neuronal, puis vue d'ensemble en orbite lente.",
    techno: "React Three Fiber · courbes Catmull-Rom · réseau neuronal",
    titreEn: "Neural rollercoaster",
    resumeEn:
      "Electric pulse travelling a CatmullRomCurve3 rail from a copper track to a neural network core, then slow orbit overview.",
    source: "experimentations/montagnes-russes/HeroMontagnesRusses",
    groupe: "hero",
  },
  {
    slug: "terminal",
    titre: "Terminal",
    resume:
      "Ecran cathodique qui s'allume, défilé hexadécimal, barres vertes puis journal de commandes. Canvas 2D pur à 12 images par seconde.",
    techno: "Canvas 2D · aucune bibliothèque 3D",
    titreEn: "Terminal",
    resumeEn:
      "CRT monitor turning on, hexadecimal scroll, green bars then a command journal. Pure Canvas 2D at 12 fps.",
    source: "experimentations/terminal/HeroTerminal",
    groupe: "hero",
  },
  {
    slug: "tunnel-donnees",
    titre: "Tunnel de données",
    resume:
      "Filaments et cible de calibrage en tunnel, puis émergence d'un réseau neuronal en rotation lente.",
    techno: "React Three Fiber",
    titreEn: "Data tunnel",
    resumeEn:
      "Filaments and calibration target in a tunnel, then emergence of a slowly rotating neural network.",
    source: "experimentations/tunnel-donnees/HeroTunnel",
    groupe: "hero",
  },
  {
    slug: "globe",
    titre: "Globe",
    resume:
      "Globe terrestre en semis de points avec repère de Toulon, habillage d'instrument (graduations, étiquettes).",
    techno: "three.js WebGL · Server Component pour l'habillage",
    titreEn: "Globe",
    resumeEn:
      "Point-cloud Earth globe with Toulon marker, instrument dressing (graduations, labels).",
    source: "console/globe/Globe",
    groupe: "instrument",
  },
  {
    slug: "carte",
    titre: "Carte géographique",
    resume:
      "Carte géographique stylisée thème Snazzy, avec chargeur et surcouche animée.",
    techno: "MapLibre GL",
    titreEn: "Map",
    resumeEn: "Styled geographic map with Snazzy theme, loader and animated overlay.",
    source: "console/carte/CarteGeo",
    groupe: "instrument",
  },
  {
    slug: "decors-instruments",
    titre: "Décors d'instruments",
    resume:
      "Bibliothèque de petits widgets animés façon tableau de bord : radar, oscilloscope, jauge, viseur, cadran, engrenage, pulsation, orbites.",
    techno: "CSS · SVG · React",
    titreEn: "Instrument widgets",
    resumeEn:
      "Dashboard-style animated widgets: radar, oscilloscope, gauge, crosshair, dial, gear, pulse, orbits.",
    source: "console/decors",
    groupe: "instrument",
  },
  {
    slug: "fonds-console",
    titre: "Fonds Console",
    resume:
      "Fonds de section du système Console : Crêtes (courbes de niveau animées) et relief en Canvas.",
    techno: "Canvas 2D · CSS",
    titreEn: "Console backgrounds",
    resumeEn: "Console section backgrounds: animated contour lines and canvas relief.",
    source: "console/fonds",
    groupe: "terrain",
  },
];

/**
 * Variante anglaise complète, même forme que EXPERIMENTATIONS.
 * Préférer les champs `titreEn` / `resumeEn` pour un accès inline.
 */
export const EXPERIMENTATIONS_EN: Experimentation[] = EXPERIMENTATIONS.map((e) => ({
  ...e,
  titre: e.titreEn,
  resume: e.resumeEn,
}));

/** Accès rapide par slug. */
export function getExperimentation(slug: string): Experimentation | undefined {
  return EXPERIMENTATIONS.find((e) => e.slug === slug);
}
