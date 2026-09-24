"use client";

/**
 * Fond en relief « Terrain ombré » : un relief ombré seul, comme une carte en
 * relief. Terrain de crêtes déformé (arêtes vives, vallées larges), éclairé
 * du nord-ouest, en bleu-gris très sombre.
 *
 * Lecture du volume :
 * - ombrage de relief (lumière du nord-ouest, rasante) ;
 * - creux et bosses : un point plus bas que son voisinage s'assombrit, un
 *   point plus haut s'éclaircit, les vallées et les arêtes se détachent ;
 * - quelques arêtes, les plus hautes, rehaussées d'un filet néon très discret.
 *
 * Carte des hauteurs calculée en basse résolution (un point pour 4 px) puis
 * agrandie lissée. « use client » : dessin dans un canvas après le montage
 * (toile.ts).
 *
 * Arbitrages :
 * - RGAA : décor pur, `aria-hidden`, aucune information portée (critère 1.2).
 *   Aucun mouvement.
 * - Éco-conception et performance : calculé une fois à l'affichage et au
 *   redimensionnement, aucune image téléchargée.
 */

import { useRef } from "react";

import { champLent, creerBruit, cretes, fbm, flouBoite, normaliser, ombrage, segmentsDeCrete } from "./bruit";
import type { Bruit2D } from "./bruit";
import { StylesRelief } from "./styles";
import { useToileStatique } from "./toile";
import type { Surface } from "./toile";

export interface TerrainOmbreProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

const GRAINE = 0x19d4b867;

/** Côté d'une cellule de la carte des hauteurs, en pixels CSS. */
const CELLULE = 4;
/** Fréquence du terrain, par pixel. */
const FREQ = 1 / 280;
/** Déformation du terrain, en unités de bruit. */
const DEFORMATION = 0.6;
/** Ombrage : lumière du nord-ouest, assez basse pour creuser les vallées. */
const AZIMUT = (7 * Math.PI) / 4;
const ELEVATION = (32 * Math.PI) / 180;
const EXAGERATION = 110;
/** Creux et bosses : rayon du voisinage (en cellules) et force de l'effet. */
const RAYON_CREUX = 4;
const FORCE_CREUX = 3.2;
/** Filets néon : courbure minimale en travers de l'arête, hauteur minimale, part retenue. */
const COURBURE_FILET = 0.018;
const SEUIL_FILET = 0.55;
const SEUIL_MASQUE = 0.18;

/** Couleurs : fond Console et teinte la plus claire du relief (bleu-gris très sombre). */
const FOND = [2, 6, 13] as const;
const CLAIR = [30, 44, 62] as const;
const NEON = "125, 211, 252";

/* ------------------------------------------------------------------ */
/* Dessin                                                              */
/* ------------------------------------------------------------------ */

let bruitPartage: Bruit2D | null = null;
const bruit = () => (bruitPartage ??= creerBruit(GRAINE));

function dessinerTerrain({ ctx, largeur: W, hauteur: H }: Surface) {
  const b = bruit();
  const gl = Math.ceil(W / CELLULE) + 2;
  const gh = Math.ceil(H / CELLULE) + 2;

  // Carte des hauteurs. Déformation et socle, lents, calculés un point sur quatre.
  const f = CELLULE * FREQ;
  const dx = champLent(gl, gh, 4, (i, j) => fbm(b, i * f * 0.5 + 11.3, j * f * 0.5 + 2.9, 3) * DEFORMATION);
  const dy = champLent(gl, gh, 4, (i, j) => fbm(b, i * f * 0.5 - 4.4, j * f * 0.5 - 8.8, 3) * DEFORMATION);
  const socle = champLent(gl, gh, 4, (i, j) => (fbm(b, i * f * 0.35 + 20.5, j * f * 0.35 - 20.5, 2) + 1) / 2);
  const hauteurs = new Float32Array(gl * gh);
  for (let j = 0; j < gh; j += 1) {
    for (let i = 0; i < gl; i += 1) {
      const k = j * gl + i;
      const x = i * f + dx[k];
      const y = j * f + dy[k];
      hauteurs[k] = cretes(b, x, y, 5) * (0.55 + 0.45 * socle[k]);
    }
  }
  normaliser(hauteurs);

  const eclairement = ombrage(hauteurs, gl, gh, {
    azimut: AZIMUT,
    elevation: ELEVATION,
    exageration: EXAGERATION,
    pas: CELLULE,
  });
  const voisinage = flouBoite(hauteurs, gl, gh, RAYON_CREUX);

  const petite = document.createElement("canvas");
  petite.width = gl;
  petite.height = gh;
  const pctx = petite.getContext("2d");
  if (pctx) {
    const image = pctx.createImageData(gl, gh);
    const px = image.data;
    for (let k = 0; k < gl * gh; k += 1) {
      const creux = Math.min(1.25, Math.max(0.35, 1 + (hauteurs[k] - voisinage[k]) * FORCE_CREUX));
      const v = Math.min(1, Math.pow(eclairement[k], 1.5) * creux);
      px[k * 4] = FOND[0] + (CLAIR[0] - FOND[0]) * v;
      px[k * 4 + 1] = FOND[1] + (CLAIR[1] - FOND[1]) * v;
      px[k * 4 + 2] = FOND[2] + (CLAIR[2] - FOND[2]) * v;
      px[k * 4 + 3] = 255;
    }
    pctx.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(petite, -CELLULE / 2, -CELLULE / 2, gl * CELLULE, gh * CELLULE);
  }

  // Filets : les arêtes visibles (lignes de crête du relief à peine lissé),
  // seulement en hauteur et par endroits.
  const filets = new Path2D();
  const garder = (i: number, j: number) =>
    hauteurs[j * gl + i] >= SEUIL_FILET &&
    fbm(b, i * CELLULE * 0.004 + 50.5, j * CELLULE * 0.004 - 50.5, 2) >= SEUIL_MASQUE;
  segmentsDeCrete(flouBoite(hauteurs, gl, gh, 1), gl, gh, COURBURE_FILET, garder, (x1, y1, x2, y2) => {
    filets.moveTo(x1 * CELLULE, y1 * CELLULE);
    filets.lineTo(x2 * CELLULE, y2 * CELLULE);
  });
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = `rgba(${NEON}, 0.28)`;
  ctx.stroke(filets);
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/** Fond « Terrain ombré ». Remplit son parent (à positionner). */
export function TerrainOmbre({ className = "" }: TerrainOmbreProps) {
  const toile = useRef<HTMLCanvasElement>(null);
  useToileStatique(toile, dessinerTerrain);

  return (
    <div aria-hidden="true" className={`csRel ${className}`}>
      <StylesRelief />
      <canvas ref={toile} className="csRelToile" />
      <div className="csRelVoile" />
    </div>
  );
}
