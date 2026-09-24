"use client";

/**
 * Fond animé « Crêtes en marche » : une cinquantaine de lignes horizontales
 * empilées, soulevées par un relief montagneux, qui avancent très lentement
 * vers le spectateur.
 *
 * Le volume vient de l'occlusion : les lignes sont dessinées de l'arrière
 * vers l'avant et chacune est remplie de la couleur de la section sous son
 * tracé, ce qui masque les lignes de derrière. Premier plan plus clair et
 * plus épais, lointain plus sombre et légèrement bleuté. Le relief se creuse
 * au centre, derrière le texte.
 *
 * « use client » : dessin canvas après le montage.
 *
 * Arbitrages :
 * - RGAA : décor pur (`aria-hidden`), aucune information. Mouvement réduit :
 *   une image fixe du relief (critère 13.8).
 * - Performance : le profil de chaque ligne est calculé une seule fois, à sa
 *   naissance au fond de la scène, puis seulement relu et mis à l'échelle de
 *   sa profondeur à chaque image. Le remplissage s'arrête à la base de la
 *   ligne : aucune surface peinte deux fois pour rien.
 */

import { adoucir, creerBruit2D, melanger } from "./bruit";
import { rgba, useToile } from "./toile";
import type { FabriqueScene, Rgb } from "./toile";
import { StylesFondsAnimes } from "./styles";

/** Nombre de lignes dans la profondeur. */
const LIGNES = 48;
/** Profondeurs : la plus proche (sortie par le bas) et la plus lointaine. */
const Z_PROCHE = 0.5;
const Z_LOIN = 3.2;
/** Secondes pour qu'une ligne prenne la place de sa voisine. */
const DUREE_PAS = 2.4;
/** Distance focale horizontale, en pixels CSS. */
const FOCALE = 640;
/** Pas d'échantillonnage horizontal, en pixels CSS. */
const PAS_X = 5;
/** Finesse du profil en unités de terrain. */
const PAS_PROFIL = 0.006;
/** Fréquence du relief. */
const FREQUENCE = 1.25;
const GRAINE = 0x6a09e667;

/** Couleur du premier plan : blanc gris. */
const PREMIER_PLAN: Rgb = [226, 234, 242];

interface Ligne {
  /** Profondeur actuelle, qui diminue à mesure que la ligne approche. */
  z: number;
  /** Position de la ligne sur le terrain, fixe : elle garde son relief en approchant. */
  terrain: number;
  profil: Float32Array;
}

const sceneCretes: FabriqueScene = (ctx, couleurs) => {
  const bruit = creerBruit2D(GRAINE);
  const pasZ = (Z_LOIN - Z_PROCHE) / LIGNES;
  const vitesse = pasZ / DUREE_PAS;
  const remplissage = rgba(couleurs.fond, 1);

  let l = 0;
  let h = 0;
  let cx = 0;
  let y0 = 0;
  let K = 0;
  let amplitude = 0;
  let xMax = 0;
  let echantillons = 0;
  let lignes: Ligne[] = [];
  let ys = new Float32Array(0);
  let enveloppe = new Float32Array(0);

  /** Relief en un point du terrain, dans [0, 1] : vallées plates, crêtes marquées. */
  const relief = (x: number, z: number) => {
    const fx = x * FREQUENCE;
    const fz = z * FREQUENCE;
    const n = bruit(fx, fz) * 0.62 + bruit(fx * 2.1 + 17, fz * 2.1) * 0.26 + bruit(fx * 4.3 + 41, fz * 4.3) * 0.12;
    const m = adoucir(-0.28, 0.72, n);
    return m * m;
  };

  /** Profil d'une ligne à la profondeur de terrain `zTerrain`, échantillonné en X. */
  const profiler = (zTerrain: number, cible?: Float32Array) => {
    const p = cible && cible.length === echantillons ? cible : new Float32Array(echantillons);
    for (let i = 0; i < echantillons; i += 1) p[i] = relief(-xMax + i * PAS_PROFIL, zTerrain);
    return p;
  };

  const peindre = () => {
    ctx.clearRect(0, 0, l, h);
    const n = ys.length;
    // De l'arrière vers l'avant : le tableau est tenu trié par profondeur décroissante.
    for (const ligne of lignes) {
      const s = 1 / ligne.z;
      const base = y0 + K * s;
      const hauteurMax = amplitude * s;
      if (base - hauteurMax > h + 2) continue;
      // u : 0 au premier plan, 1 au fond.
      const u = (ligne.z - Z_PROCHE) / (Z_LOIN - Z_PROCHE);
      const apparition = adoucir(1, 0.84, u);
      if (apparition <= 0) continue;
      const echelle = ligne.z / FOCALE;
      for (let i = 0; i < n; i += 1) {
        const x = (-PAS_X + i * PAS_X - cx) * echelle;
        const f = (x + xMax) / PAS_PROFIL;
        const k = f | 0;
        const r = f - k;
        const v = ligne.profil[k] + (ligne.profil[k + 1] - ligne.profil[k]) * r;
        ys[i] = base - v * hauteurMax * enveloppe[i];
      }
      const epaisseur = melanger(1.9, 0.75, Math.pow(u, 0.7));
      // Remplissage sous le tracé, jusqu'à la base de la ligne : masque les lignes de derrière.
      ctx.beginPath();
      ctx.moveTo(-PAS_X, ys[0]);
      for (let i = 1; i < n; i += 1) ctx.lineTo(-PAS_X + i * PAS_X, ys[i]);
      ctx.lineTo(l + PAS_X, base + epaisseur + 1);
      ctx.lineTo(-PAS_X, base + epaisseur + 1);
      ctx.closePath();
      ctx.fillStyle = remplissage;
      ctx.fill();
      // Le tracé : plus clair et plus épais devant, plus sombre et bleuté au loin.
      const teinte = Math.pow(u, 1.4) * 0.75;
      const couleur: Rgb = [
        Math.round(melanger(PREMIER_PLAN[0], couleurs.neon[0], teinte)),
        Math.round(melanger(PREMIER_PLAN[1], couleurs.neon[1], teinte)),
        Math.round(melanger(PREMIER_PLAN[2], couleurs.neon[2], teinte)),
      ];
      ctx.beginPath();
      ctx.moveTo(-PAS_X, ys[0]);
      for (let i = 1; i < n; i += 1) ctx.lineTo(-PAS_X + i * PAS_X, ys[i]);
      ctx.lineWidth = epaisseur;
      ctx.strokeStyle = rgba(couleur, melanger(0.74, 0.13, Math.pow(u, 0.8)) * apparition);
      ctx.stroke();
    }
  };

  const avancer = (dt: number) => {
    for (const ligne of lignes) ligne.z -= vitesse * dt;
    // La ligne la plus proche est sortie par le bas : elle repart au fond avec un relief neuf.
    while (lignes.length > 0 && lignes[lignes.length - 1].z < Z_PROCHE) {
      const sortie = lignes.pop() as Ligne;
      sortie.z += LIGNES * pasZ;
      sortie.terrain += LIGNES * pasZ;
      sortie.profil = profiler(sortie.terrain, sortie.profil);
      lignes.unshift(sortie);
    }
  };

  const installer = () => {
    lignes = Array.from({ length: LIGNES }, (_, k) => {
      const z = Z_LOIN - k * pasZ;
      return { z, terrain: z, profil: profiler(z) };
    });
  };

  return {
    dimensionner(largeur, hauteur) {
      l = largeur;
      h = hauteur;
      cx = l / 2;
      // Le fond de la scène se pose à mi-hauteur, la ligne de profondeur 1 au ras du bas.
      const yLoin = 0.52 * h;
      const yUn = 1.0 * h;
      K = (yUn - yLoin) / (1 - 1 / Z_LOIN);
      y0 = yUn - K;
      amplitude = 0.34 * h;
      // Terrain nécessaire : la largeur vue au plus loin, plus une marge.
      xMax = ((l / 2 + 2 * PAS_X) / FOCALE) * Z_LOIN * 1.02 + PAS_PROFIL * 2;
      echantillons = Math.ceil((2 * xMax) / PAS_PROFIL) + 2;
      const n = Math.ceil((l + 2 * PAS_X) / PAS_X) + 1;
      ys = new Float32Array(n);
      enveloppe = new Float32Array(n);
      for (let i = 0; i < n; i += 1) {
        // Relief abaissé au centre, derrière le texte ; plein sur les côtés.
        const ecart = Math.abs(-PAS_X + i * PAS_X - cx) / Math.max(l, 1);
        enveloppe[i] = 0.3 + 0.7 * adoucir(0.1, 0.38, ecart);
      }
      // Un changement de taille garde l'avancée en cours : seuls les profils sont rééchantillonnés.
      if (lignes.length === 0) installer();
      else for (const ligne of lignes) ligne.profil = profiler(ligne.terrain);
    },
    image(dt) {
      if (dt > 0) avancer(dt);
      peindre();
    },
    fixe() {
      installer();
      peindre();
    },
  };
};

export function FondCretes() {
  const toile = useToile(sceneCretes);
  return (
    <div aria-hidden="true" className="csFa" data-fond-anime="cretes">
      <StylesFondsAnimes />
      <canvas ref={toile} className="csFaToile" />
      <span className="csFaVoile" />
    </div>
  );
}
