/**
 * Curseurs de souris de l'atelier Console. CSS seul, aucun suiveur en
 * JavaScript : le navigateur dessine le curseur, sans décalage ni coût.
 *
 * Dessin sur une grille de 31 px (plafond de 32 px) : le pixel 15 est le
 * centre exact, le point actif y tombe. Chaque trait néon d'un pixel est
 * bordé d'un pixel sombre pour rester visible sur fond clair. Coordonnées
 * entières et `crispEdges` : net en 1x, et la version 2x (même dessin
 * rastérisé en 62 px) reste nette sur écran haute densité.
 */

import type { CSSProperties } from "react";

/** x, y, largeur, hauteur, en pixels de la grille. */
type Trait = readonly [number, number, number, number];

export const GRILLE = 31;
export const POINT_ACTIF = 15;

const NEON = "#7dd3fc";
const OMBRE = "#02060d";

/** Croix de visée : quatre branches fines, un vide, un point de 3 px. */
const VISEE: readonly Trait[] = [
  [15, 2, 1, 9],
  [15, 20, 1, 9],
  [2, 15, 9, 1],
  [20, 15, 9, 1],
  [14, 14, 3, 3],
];

/** Quatre crochets autour du même point. */
const CROCHETS: readonly Trait[] = [
  [5, 5, 6, 1],
  [5, 5, 1, 6],
  [20, 5, 6, 1],
  [25, 5, 1, 6],
  [5, 25, 6, 1],
  [5, 20, 1, 6],
  [20, 25, 6, 1],
  [25, 20, 1, 6],
  [14, 14, 3, 3],
];

export const FORMES = { visee: VISEE, crochets: CROCHETS } as const;
export type FormeCurseur = keyof typeof FORMES;

function rectangles(traits: readonly Trait[], marge: number): string {
  return traits
    .map(([x, y, l, h]) => `<rect x="${x - marge}" y="${y - marge}" width="${l + 2 * marge}" height="${h + 2 * marge}"/>`)
    .join("");
}

function svg(traits: readonly Trait[], echelle: 1 | 2): string {
  const cote = GRILLE * echelle;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cote}" height="${cote}" viewBox="0 0 ${GRILLE} ${GRILLE}" shape-rendering="crispEdges">` +
    `<g fill="${OMBRE}" opacity="0.9">${rectangles(traits, 1)}</g>` +
    `<g fill="${NEON}">${rectangles(traits, 0)}</g>` +
    `</svg>`
  );
}

function url(source: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(source)}")`;
}

/**
 * Trois déclarations, du plus simple au plus précis : chaque navigateur garde
 * la dernière qu'il comprend. Le mot-clé final sert si l'image ne charge pas.
 */
function declarations(forme: FormeCurseur, repli: string): string {
  const u1 = url(svg(FORMES[forme], 1));
  const u2 = url(svg(FORMES[forme], 2));
  const point = `${POINT_ACTIF} ${POINT_ACTIF}`;
  return [
    `cursor: ${u1} ${point}, ${repli};`,
    `cursor: -webkit-image-set(${u1} 1x, ${u2} 2x) ${point}, ${repli};`,
    `cursor: image-set(${u1} 1x, ${u2} 2x) ${point}, ${repli};`,
  ].join(" ");
}

const CLIQUABLES = [
  "a[href]",
  "button",
  "summary",
  "label",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="menuitem"]',
  '[role="slider"]',
  'input:is([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="reset"], [type="file"], [type="color"])',
].join(", ");

const SAISIES = [
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="reset"], [type="file"], [type="color"], [type="hidden"])',
  "textarea",
  '[contenteditable]:not([contenteditable="false"])',
].join(", ");

const DESACTIVES = ':is(:disabled, [aria-disabled="true"], [data-desactive="true"])';

/**
 * Règles des curseurs, appliquées à `[data-atelier-console]`.
 *
 * Poids : `:root [data-atelier-console] :where(…)` vaut deux attributs, assez
 * pour passer devant le `cursor: pointer` d'une classe de composant, et le
 * désactivé (trois) passe devant le cliquable.
 */
export const CSS_CURSEURS = `
[data-atelier-console] { ${declarations("visee", "crosshair")} }
:root [data-atelier-console] :where(${CLIQUABLES}) { ${declarations("crochets", "pointer")} }
:root [data-atelier-console] :where(${SAISIES}) { cursor: text; }
:root [data-atelier-console] ${DESACTIVES},
:root [data-atelier-console] ${DESACTIVES} * { cursor: not-allowed; }

/* Planche d'essai : chaque tuile porte son curseur. */
:root [data-atelier-console] .csIdEssai[data-curseur="visee"] { ${declarations("visee", "crosshair")} }
:root [data-atelier-console] .csIdEssai[data-curseur="crochets"] { ${declarations("crochets", "pointer")} }
:root [data-atelier-console] .csIdEssai[data-curseur="text"] { cursor: text; }
:root [data-atelier-console] .csIdEssai[data-curseur="not-allowed"] { cursor: not-allowed; }
`;

/** Le dessin d'un curseur agrandi, pour la planche. */
export function ApercuCurseur({ forme, echelle, fond }: { forme: FormeCurseur; echelle: number; fond: string }) {
  const traits = FORMES[forme];
  const cote = GRILLE * echelle;
  const style: CSSProperties = { background: fond };
  return (
    <svg
      aria-hidden="true"
      width={cote}
      height={cote}
      viewBox={`0 0 ${GRILLE} ${GRILLE}`}
      shapeRendering="crispEdges"
      className="block"
      style={style}
    >
      <g fill={OMBRE} opacity={0.9}>
        {traits.map(([x, y, l, h]) => (
          <rect key={`o${x}-${y}-${l}-${h}`} x={x - 1} y={y - 1} width={l + 2} height={h + 2} />
        ))}
      </g>
      <g fill={NEON}>
        {traits.map(([x, y, l, h]) => (
          <rect key={`n${x}-${y}-${l}-${h}`} x={x} y={y} width={l} height={h} />
        ))}
      </g>
    </svg>
  );
}
