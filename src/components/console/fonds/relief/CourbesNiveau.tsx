"use client";

/**
 * Fond en relief « Courbes de niveau » : une carte topographique de décor,
 * sans donnée réelle ni légende. Terrain de bruit fractal déformé, seize
 * niveaux tracés par carrés marchants, une courbe maîtresse tous les cinq.
 *
 * Lecture du volume :
 * - ombrage de relief très sombre sous les courbes, lumière du nord-ouest ;
 * - courbes éclairées : plus claires sur les versants tournés vers la
 *   lumière, presque éteintes à l'opposé ;
 * - la plus haute courbe maîtresse tracée au néon, seul accent de couleur.
 *
 * « use client » : dessin dans un canvas après le montage (toile.ts).
 *
 * Arbitrages :
 * - RGAA : décor pur, `aria-hidden`, aucune information portée (critère 1.2).
 *   Aucun mouvement.
 * - Éco-conception et performance : ombrage calculé sur une grille de 4 px
 *   puis agrandi lissé ; calculé une fois à l'affichage et au redimensionnement.
 */

import { useRef } from "react";

import { champLent, courbes, creerBruit, fbm, normaliser, ombrage } from "./bruit";
import type { Bruit2D } from "./bruit";
import { StylesRelief } from "./styles";
import { useToileStatique } from "./toile";
import type { Surface } from "./toile";

export interface CourbesNiveauProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

const GRAINE = 0x7c2e19a5;

/** Côté d'une cellule de la grille de hauteurs, en pixels CSS. */
const CELLULE = 4;
/** Fréquence du terrain, par pixel : trois à quatre collines sur la largeur. */
const FREQ = 1 / 380;
/** Déformation du terrain, en unités de bruit : des formes moins rondes. */
const DEFORMATION = 0.45;
/** Nombre de niveaux tracés, écart des courbes maîtresses, rang de la courbe au néon. */
const NIVEAUX = 16;
const MAITRESSE = 5;
const RANG_NEON = 14;
/** Ombrage : lumière du nord-ouest. */
const AZIMUT = (7 * Math.PI) / 4;
const ELEVATION = (38 * Math.PI) / 180;
const EXAGERATION = 110;
/** Direction de la lumière dans le plan de la carte (vers le nord-ouest). */
const LUMIERE_X = -Math.SQRT1_2;
const LUMIERE_Y = -Math.SQRT1_2;

/** Couleurs : fond Console et teinte la plus claire de l'ombrage (bleu-gris très sombre). */
const FOND = [2, 6, 13] as const;
const CLAIR = [26, 40, 58] as const;
const NEON = "125, 211, 252";

/* ------------------------------------------------------------------ */
/* Dessin                                                              */
/* ------------------------------------------------------------------ */

let bruitPartage: Bruit2D | null = null;
const bruit = () => (bruitPartage ??= creerBruit(GRAINE));

function dessinerCourbes({ ctx, largeur: W, hauteur: H }: Surface) {
  const b = bruit();
  const gl = Math.ceil(W / CELLULE) + 2;
  const gh = Math.ceil(H / CELLULE) + 2;

  // Carte des hauteurs. La déformation, lente, est calculée un point sur quatre.
  const f = CELLULE * FREQ;
  const dx = champLent(gl, gh, 4, (i, j) => fbm(b, i * f * 0.6 + 5.2, j * f * 0.6 - 1.3, 2) * DEFORMATION);
  const dy = champLent(gl, gh, 4, (i, j) => fbm(b, i * f * 0.6 - 7.9, j * f * 0.6 + 3.1, 2) * DEFORMATION);
  const hauteurs = new Float32Array(gl * gh);
  for (let j = 0; j < gh; j += 1) {
    for (let i = 0; i < gl; i += 1) {
      const k = j * gl + i;
      hauteurs[k] = fbm(b, i * f + dx[k], j * f + dy[k], 4);
    }
  }
  normaliser(hauteurs);

  // Ombrage de relief, peint sur la grille puis agrandi lissé.
  const eclairement = ombrage(hauteurs, gl, gh, {
    azimut: AZIMUT,
    elevation: ELEVATION,
    exageration: EXAGERATION,
    pas: CELLULE,
  });
  const petite = document.createElement("canvas");
  petite.width = gl;
  petite.height = gh;
  const pctx = petite.getContext("2d");
  if (pctx) {
    const image = pctx.createImageData(gl, gh);
    const px = image.data;
    for (let k = 0; k < gl * gh; k += 1) {
      const v = Math.pow(Math.min(1, eclairement[k]), 1.6);
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

  // Courbes : trois éclairements, courbes ordinaires et maîtresses, sommets.
  const traits = Array.from({ length: 7 }, () => new Path2D());
  const niveaux = Array.from({ length: NIVEAUX }, (_, k) => (k + 1) / (NIVEAUX + 1));
  courbes(hauteurs, gl, gh, niveaux, (rang, x1, y1, x2, y2, gx, gy) => {
    const g = Math.hypot(gx, gy) || 1;
    // Le versant regarde vers l'aval (-g) : face à la lumière ou dos à elle.
    const face = (-gx * LUMIERE_X - gy * LUMIERE_Y) / g;
    const eclaire = face < -0.35 ? 0 : face < 0.35 ? 1 : 2;
    const maitresse = (rang + 1) % MAITRESSE === 0;
    const chemin = traits[rang === RANG_NEON ? 6 : (maitresse ? 3 : 0) + eclaire];
    chemin.moveTo(x1 * CELLULE, y1 * CELLULE);
    chemin.lineTo(x2 * CELLULE, y2 * CELLULE);
  });

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const styles: readonly [number, string][] = [
    [0.7, "rgba(255, 255, 255, 0.06)"],
    [0.7, "rgba(255, 255, 255, 0.14)"],
    [0.8, "rgba(255, 255, 255, 0.3)"],
    [1.1, "rgba(255, 255, 255, 0.1)"],
    [1.1, "rgba(255, 255, 255, 0.24)"],
    [1.3, "rgba(255, 255, 255, 0.5)"],
    [1.1, `rgba(${NEON}, 0.55)`],
  ];
  styles.forEach(([largeurTrait, couleur], k) => {
    ctx.lineWidth = largeurTrait;
    ctx.strokeStyle = couleur;
    ctx.stroke(traits[k]);
  });
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/** Fond « Courbes de niveau ». Remplit son parent (à positionner). */
export function CourbesNiveau({ className = "" }: CourbesNiveauProps) {
  const toile = useRef<HTMLCanvasElement>(null);
  useToileStatique(toile, dessinerCourbes);

  return (
    <div aria-hidden="true" className={`csRel ${className}`}>
      <StylesRelief />
      <canvas ref={toile} className="csRelToile" />
      <div className="csRelVoile" />
    </div>
  );
}
