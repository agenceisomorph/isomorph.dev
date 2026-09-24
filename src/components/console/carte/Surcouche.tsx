/**
 * Carte Console : surcouche d'interface posée sur le canevas.
 *
 * Un seul SVG décoratif (`aria-hidden`, sans pointeur) : règles graduées le
 * long des bords haut et gauche, grille géographique, zones hachurées au
 * contour en escalier, repères, réticule du centre. Tout se recalcule depuis
 * la vue à chaque déplacement (voir `geometrie.ts`) ; aucune mesure du DOM.
 * La classe `csCarteSurcouche` sert à son allumage (`StylesCarte.tsx`).
 *
 * Traits d'un pixel nets : les positions sont arrondies au demi-pixel, les
 * mêmes pour la grille et pour les contours de zones, qui se superposent.
 */

import {
  calculerGrille,
  casesDuPolygone,
  contourCases,
  dansFenetre,
  decimalesPas,
  dedoublonner,
  ecrireLatitude,
  ecrireLongitude,
  fenetreVisible,
  projection,
  versEcran,
  type Case,
  type Taille,
  type Vue,
} from "./geometrie";
import type { RepereCarte, ZoneCarte } from "./types";

/** Épaisseur des règles graduées, en pixels. */
export const REGLE = 24;

/** Côté visé pour une case : environ douze colonnes sur grand écran, jamais moins de 56 px. */
export function cibleCase(largeur: number): number {
  return Math.max(56, largeur / 12);
}

const NEON = "var(--cs-neon)";
const ALERTE = "var(--cs-carte-alerte)";
const TRAIT_GRILLE = "rgba(186, 230, 253, 0.16)";
const CROIX = "rgba(186, 230, 253, 0.5)";
const GRADUATION = "rgba(125, 211, 252, 0.6)";
const FOND_REGLE = "rgba(2, 6, 13, 0.82)";

/** Arrondi au demi-pixel : un trait d'un pixel reste net. */
const net = (v: number) => Math.round(v) + 0.5;

export interface SurcoucheProps {
  vue: Vue;
  taille: Taille;
  reperes: readonly RepereCarte[];
  zones: readonly ZoneCarte[];
  /** Identifiant unique du motif de hachures dans la page. */
  idMotif: string;
}

export function Surcouche({ vue, taille, reperes, zones, idMotif }: SurcoucheProps) {
  const { largeur: L, hauteur: H } = taille;
  const p = projection(vue, taille);
  const g = calculerGrille(vue, taille, cibleCase(L));
  const s = g.pas / 360;
  const dec = decimalesPas(g.pas);

  /* Zones : un chemin de remplissage et un chemin de contour chacune. */
  const traces = zones.map((zone) => {
    const pas = "polygone" in zone ? g.pas : zone.pas;
    const sz = pas / 360;
    const fenetre = fenetreVisible(p, pas);
    const cases: Case[] =
      "polygone" in zone
        ? casesDuPolygone(zone.polygone, pas, fenetre)
        : dedoublonner(zone.cases).filter((c) => dansFenetre(c, fenetre));
    const fx = (i: number) => net(p.x(i * sz));
    const fy = (j: number) => net(p.y(j * sz));
    const remplissage = cases.map(([i, j]) => `M${fx(i)} ${fy(j)}H${fx(i + 1)}V${fy(j + 1)}H${fx(i)}Z`).join("");
    const contour = contourCases(cases)
      .map(({ a, b }) => `M${fx(a[0])} ${fy(a[1])}L${fx(b[0])} ${fy(b[1])}`)
      .join("");
    return { id: zone.id, remplissage, contour };
  });

  /* Hachures accrochées au monde : elles glissent avec la carte. */
  const periode = 8;
  const mod = (v: number) => ((v % periode) + periode) % periode;
  const ancrage = `translate(${mod(p.x(0))} ${mod(p.y(0))})`;

  /* Grille : lignes, croix aux intersections, graduations des règles. */
  let lignes = "";
  for (const c of g.colonnes) if (c.position > REGLE) lignes += `M${net(c.position)} ${REGLE}V${H}`;
  for (const l of g.lignes) if (l.position > REGLE) lignes += `M${REGLE} ${net(l.position)}H${L}`;

  let croix = "";
  for (const c of g.colonnes) {
    for (const l of g.lignes) {
      const x = net(c.position);
      const y = net(l.position);
      if (x > REGLE + 4 && y > REGLE + 4) croix += `M${x - 3} ${y}h7M${x} ${y - 3}v7`;
    }
  }

  let graduations = "";
  for (let i = g.fenetre.i0; i <= g.fenetre.i1; i++) {
    for (let k = 0; k < 5; k++) {
      const x = p.x((i + k / 5) * s);
      if (x > REGLE && x < L) graduations += `M${net(x)} ${REGLE}v${k === 0 ? -9 : -4}`;
    }
  }
  for (let j = g.fenetre.j0; j <= g.fenetre.j1; j++) {
    for (let k = 0; k < 5; k++) {
      const y = p.y((j + k / 5) * s);
      if (y > REGLE && y < H) graduations += `M${REGLE} ${net(y)}h${k === 0 ? -9 : -4}`;
    }
  }

  /* Une étiquette sur deux quand les cases sont serrées. */
  const saut = g.cote < 76 ? 2 : 1;
  const etiquettesX = g.colonnes.filter((c) => c.indice % saut === 0 && c.position > REGLE && c.position < L - 72);
  const etiquettesY = g.lignes.filter((l) => l.indice % saut === 0 && l.position > REGLE + 80 && l.position < H);

  const cx = L / 2;
  const cy = H / 2;

  return (
    <svg
      aria-hidden="true"
      className="csCarteSurcouche pointer-events-none absolute inset-0 h-full w-full"
      width={L}
      height={H}
      viewBox={`0 0 ${L} ${H}`}
    >
      <defs>
        <pattern id={idMotif} width={periode} height={periode} patternUnits="userSpaceOnUse" patternTransform={ancrage}>
          <path d="M0 8L8 0M-2 2L2 -2M6 10L10 6" stroke={ALERTE} strokeWidth="1" strokeOpacity="0.75" />
        </pattern>
      </defs>

      {/* Zones hachurées */}
      {traces.map((t) => (
        <g key={t.id}>
          <path d={t.remplissage} fill={`url(#${idMotif})`} />
          <path d={t.remplissage} fill={ALERTE} fillOpacity="0.07" />
          <path d={t.contour} fill="none" stroke={ALERTE} strokeWidth="1" shapeRendering="crispEdges" />
        </g>
      ))}

      {/* Grille */}
      <g shapeRendering="crispEdges" fill="none">
        <path d={lignes} stroke={TRAIT_GRILLE} strokeWidth="1" />
        <path d={croix} stroke={CROIX} strokeWidth="1" />
      </g>

      {/* Réticule du centre */}
      <path
        d={`M${net(cx) - 12} ${net(cy)}h8M${net(cx) + 4} ${net(cy)}h8M${net(cx)} ${net(cy) - 12}v8M${net(cx)} ${net(cy) + 4}v8`}
        stroke={NEON}
        strokeWidth="1"
        shapeRendering="crispEdges"
      />

      {/* Repères */}
      {reperes.map((r) => {
        const { x, y } = versEcran(r.point, p);
        if (x < -40 || x > L + 40 || y < -40 || y > H + 40) return null;
        const alerte = r.ton === "alerte";
        const couleur = alerte ? ALERTE : NEON;
        const aGauche = x > L - 180;
        const tx = aGauche ? x - 14 : x + 14;
        const ancre = aGauche ? "end" : "start";
        return (
          <g key={r.id}>
            <circle cx={x} cy={y} r="12" fill="none" stroke={couleur} strokeWidth="1" className="csCarteOnde" />
            {alerte ? (
              <path d={`M${x} ${y - 6}L${x + 6} ${y + 5}H${x - 6}Z`} fill={couleur} />
            ) : (
              <rect x={x - 4} y={y - 4} width="8" height="8" fill={couleur} transform={`rotate(45 ${x} ${y})`} />
            )}
            {r.libelle ? (
              <>
                <text x={tx} y={y - 2} textAnchor={ancre} fill={couleur} className="csCarteTexte type-caption uppercase tracking-[0.22em]">
                  {r.libelle}
                </text>
                <text x={tx} y={y + 16} textAnchor={ancre} fill="var(--cs-texte-2)" className="csCarteTexte type-caption tabular-nums">
                  {`${ecrireLatitude(r.point[1], 4)}  ${ecrireLongitude(r.point[0], 4)}`}
                </text>
              </>
            ) : null}
          </g>
        );
      })}

      {/* Règles graduées : haut (longitudes) et gauche (latitudes) */}
      <rect x="0" y="0" width={L} height={REGLE} fill={FOND_REGLE} />
      <rect x="0" y={REGLE} width={REGLE} height={H - REGLE} fill={FOND_REGLE} />
      <path
        d={`M${REGLE} ${REGLE - 0.5}H${L}M${REGLE - 0.5} ${REGLE}V${H}${graduations}`}
        stroke={GRADUATION}
        strokeWidth="1"
        fill="none"
        shapeRendering="crispEdges"
      />
      <path d={`M7 ${REGLE / 2 + 0.5}h11M${REGLE / 2 + 0.5} 7v11`} stroke={NEON} strokeWidth="1" shapeRendering="crispEdges" />
      {etiquettesX.map((c) => (
        <text key={c.indice} x={net(c.position) + 5} y="15" fill={NEON} className="type-caption tabular-nums">
          {ecrireLongitude(c.valeur, dec, true)}
        </text>
      ))}
      {etiquettesY.map((l) => (
        <text
          key={l.indice}
          transform={`translate(17 ${net(l.position) - 6}) rotate(-90)`}
          fill={NEON}
          className="type-caption tabular-nums"
        >
          {ecrireLatitude(l.valeur, Math.min(4, dec + 2), true)}
        </text>
      ))}
    </svg>
  );
}
