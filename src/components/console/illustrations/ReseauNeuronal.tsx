"use client";

/**
 * Illustration « Réseau neuronal » du système Console : un réseau de neurones
 * en trois dimensions, en action, qui passe périodiquement sous contrôle.
 *
 * Scène : grille bleue, nuage de points cyan en ellipse, masse filaire
 * blanche maillée de triangles (dense et lumineuse au cœur, fine et rare en
 * périphérie, filaments qui s'échappent), cadres à crochets accrochés à des
 * nœuds, deux faisceaux de lumière tombant des coins supérieurs.
 *
 * Rendu : les facettes du cœur accrochent une lumière venue du haut à gauche
 * (verre à peine teinté, plus claire quand une facette fait face à la
 * lumière) ; traits, nœuds et couleurs suivent la profondeur en continu
 * (près : blanc, épais, net ; loin : bleu, fin, éteint) ; un nœud sur six
 * luit en permanence et respire à son rythme.
 *
 * Vie : rotation lente, respiration de la forme, impulsions en traînées qui
 * parcourent les arêtes et allument les nœuds traversés. Toutes les 10 à
 * 14 secondes, une prise de contrôle : une onde part d'un nœud et gagne tout
 * le réseau de proche en proche, les cadres se verrouillent (ils se
 * referment, clignotent, leur code change), puis tout revient au calme.
 *
 * « use client » : tout le dessin vit dans un canvas piloté par
 * requestAnimationFrame et par quatre observateurs (taille, présence à
 * l'écran, onglet masqué, réglage de mouvement réduit) qui n'existent que
 * dans le navigateur. Le serveur rend le conteneur vide, le premier rendu
 * navigateur est identique, le dessin commence après le montage.
 *
 * Arbitrages :
 * - RGAA : décor pur, `aria-hidden` sur la racine, aucune information portée
 *   par l'image (critère 1.2). Mouvement réduit : une seule image fixe,
 *   réseau au repos, aucune boucle (critère 13.8). Le clignotement des
 *   cadres couvre une surface bien inférieure au seuil du critère 13.7.
 * - Éco-conception : aucune dépendance, aucune image téléchargée. Grille et
 *   faisceaux en dégradés CSS, peints une fois par le navigateur. Boucle
 *   arrêtée hors écran et onglet masqué, densité de pixels plafonnée à 2.
 * - Performance : aucun flou d'ombre (`shadowBlur`) ; les lueurs sont une
 *   petite image préparée une fois puis recopiée. Traits et facettes groupés
 *   par niveau, profondeur et éclairage (une cinquantaine de tracés par image
 *   pour plus de cinq cents arêtes), aucune allocation dans la boucle hormis
 *   les codes des cadres, régénérés quelques fois par seconde.
 * - Couleur : blanc et néon de la palette Console ; l'ambre (`--cs-alerte`)
 *   ne marque que le nœud d'entrée de la prise de contrôle et le réticule des
 *   cadres pendant leur verrouillage.
 *
 * Le composant remplit son conteneur : lui donner une taille (et une
 * position si besoin) par `className`.
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import {
  choisirRepartis,
  codeGroupe,
  genererNuage,
  genererReseau,
  lisser,
  mulberry32,
  propager,
} from "./reseau-neuronal-modele";

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

/** Graines : le réseau, le nuage et le déroulé des animations. */
const GRAINE_RESEAU = 0x2f6a91c3;
const GRAINE_NUAGE = 0x71b3e5d9;
const GRAINE_ANIMATION = 0x0c4e8a27;

/** Un tour complet du réseau, en secondes. */
const PERIODE_ROTATION = 70;
/** Angle de départ : la vue la plus lisible de la masse, choisie à l'œil. */
const ANGLE_DEPART = 0.6;
/** Inclinaison de l'axe de rotation vers l'observateur, en radians. */
const INCLINAISON = 0.34;
/** Recul de la caméra en rayons de masse : plus il est court, plus la perspective est forte. */
const RECUL = 3.6;
/** Respiration : amplitude relative et pulsation de l'onde qui déforme la masse. */
const RESPIRATION = 0.032;
const PULSATION_RESPIRATION = (Math.PI * 2) / 6.5;

/** Déroulé d'une prise de contrôle, en secondes depuis son début. */
const ECLAIR = 0.5; // le nœud d'entrée s'allume seul
const ONDE = 2.4; // l'onde gagne tout le réseau
const MAINTIEN = 1.7; // réseau sous contrôle
const RETOUR = 1.9; // retour au calme
const DEBUT_RETOUR = ECLAIR + ONDE + MAINTIEN;
const DUREE_PRISE = DEBUT_RETOUR + RETOUR;
/** Écart entre deux prises de contrôle, tiré à chaque fois dans cet intervalle. */
const CYCLE_MIN = 10;
const CYCLE_MAX = 14;
/** Calme avant la toute première prise, pour qu'elle arrive vite à l'écran. */
const PREMIER_CALME = 2.5;
/** Une arête embrasée retombe vers ce palier tant que le réseau est sous contrôle. */
const PALIER_FEU = 0.18;
const DECLIN_FEU = 0.45;
const NIVEAUX_FEU = 5;

/** Verrouillage d'un cadre, en secondes depuis l'arrivée de l'onde sur son nœud. */
const SERRAGE = 0.22;
const FIN_CLIGNOTEMENT = 0.82;
const BROUILLAGE = 0.6;
const PAS_BROUILLAGE = 0.06;

/** Quantités, grand format. Le format compact (moins de 600 px) en montre moins. */
const NUAGE_MAX = 460;
const IMPULSIONS_MAX = 36;
const CADRES_MAX = 5;

/** Trait des arêtes par niveau, du cœur (0) à la périphérie (3). */
const TRAITS = [
  { largeur: 1.15, alpha: 0.62 },
  { largeur: 0.9, alpha: 0.44 },
  { largeur: 0.72, alpha: 0.3 },
  { largeur: 0.62, alpha: 0.22 },
] as const;

/**
 * Profondeur en cinq tranches, du plus loin au plus près : la couleur passe du
 * bleu au blanc, le trait s'épaissit et s'allume (perspective atmosphérique).
 */
const TRANCHES = 5;
const PROFONDEUR_COULEURS = ["#4f7fae", "#7aa9d3", "#a9cdec", "#d8ebfb", "#ffffff"] as const;
const PROFONDEUR_ALPHAS = [0.26, 0.42, 0.62, 0.84, 1] as const;
const PROFONDEUR_LARGEURS = [0.7, 0.82, 0.96, 1.14, 1.4] as const;

/** Facettes : lumière venue du haut, de la gauche et de devant (repère de la masse). */
const LUMIERE = (() => {
  const l = [-0.45, 0.72, 0.53];
  const n = Math.hypot(l[0], l[1], l[2]);
  return [l[0] / n, l[1] / n, l[2] / n] as const;
})();
/** Facettes éclairées : paliers d'intensité et opacité maximale d'une facette. */
const PALIERS_FACETTE = 6;
const ALPHA_FACETTE = 0.2;
/** Part des nœuds qui luisent en permanence. */
const PART_LUISANTS = 0.16;

const NEON = "#7dd3fc";
const BLANC = "#ffffff";
/** Teinte des facettes : blanc de verre à peine bleuté. */
const VERRE = "#cfe8ff";

/** Du néon (niveau bas) au blanc (niveau haut) pour les arêtes embrasées. */
const COULEURS_FEU = Array.from({ length: NIVEAUX_FEU }, (_, q) => {
  const t = q / (NIVEAUX_FEU - 1);
  const r = Math.round(125 + 130 * t);
  const g = Math.round(211 + 44 * t);
  const b = Math.round(252 + 3 * t);
  return `rgb(${r}, ${g}, ${b})`;
});

/* ------------------------------------------------------------------ */
/* Styles : grille, halo central, faisceaux                            */
/* ------------------------------------------------------------------ */

/* Dans la couche `components` : les utilitaires Tailwind passés par
   `className` (position, taille, découpe) l'emportent toujours. */
const STYLES = `
@layer components {
  .csRn {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    contain: paint;
    background-color: #02060d;
    background-image:
      radial-gradient(ellipse 78% 72% at 50% 50%, transparent 52%, rgba(2, 6, 13, 0.82) 100%),
      radial-gradient(ellipse 20% 26% at 50% 50%, rgba(220, 238, 255, 0.07), transparent 75%),
      radial-gradient(ellipse 40% 46% at 50% 50%, rgba(56, 189, 248, 0.1), transparent 72%),
      linear-gradient(rgba(125, 211, 252, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(125, 211, 252, 0.12) 1px, transparent 1px),
      linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 100% 100%, 160px 160px, 160px 160px, 32px 32px, 32px 32px;
    background-position: center;
  }
  .csRnToile { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  .csRnFaisceaux { position: absolute; inset: 0; pointer-events: none; }
  .csRnFaisceaux::before, .csRnFaisceaux::after { content: ""; position: absolute; inset: 0; }
  .csRnFaisceaux::before {
    background:
      radial-gradient(circle at 6% -8%, rgba(226, 240, 255, 0.2), transparent 26%),
      conic-gradient(from 122deg at 6% -8%, transparent 0deg, rgba(214, 233, 255, 0.07) 7deg, rgba(230, 242, 255, 0.15) 13deg, rgba(214, 233, 255, 0.07) 19deg, transparent 27deg);
    -webkit-mask-image: radial-gradient(ellipse 110% 140% at 6% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
    mask-image: radial-gradient(ellipse 110% 140% at 6% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
  }
  .csRnFaisceaux::after {
    background:
      radial-gradient(circle at 94% -8%, rgba(226, 240, 255, 0.2), transparent 26%),
      conic-gradient(from 211deg at 94% -8%, transparent 0deg, rgba(214, 233, 255, 0.07) 8deg, rgba(230, 242, 255, 0.15) 14deg, rgba(214, 233, 255, 0.07) 20deg, transparent 27deg);
    -webkit-mask-image: radial-gradient(ellipse 110% 140% at 94% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
    mask-image: radial-gradient(ellipse 110% 140% at 94% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
  }
}
`;

/* ------------------------------------------------------------------ */
/* Types internes                                                      */
/* ------------------------------------------------------------------ */

/** Un cadre à crochets accroché à un nœud. */
interface Cadre {
  noeud: number;
  /** Code affiché au calme, et celui qui le remplacera à la prochaine prise. */
  code: string;
  suivant: string;
  affiche: string;
  tranche: number;
}

/** Halo radial préparé une fois, redessiné à l'échelle voulue. */
function creerHalo(coeur: string, milieu: string, bord: string): HTMLCanvasElement {
  const toile = document.createElement("canvas");
  toile.width = 32;
  toile.height = 32;
  const ctx = toile.getContext("2d");
  if (!ctx) return toile;
  const degrade = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  degrade.addColorStop(0, coeur);
  degrade.addColorStop(0.2, milieu);
  degrade.addColorStop(0.5, bord);
  degrade.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, 32, 32);
  return toile;
}

/** Lueur à deux étages : point vif et large auréole pâle, comme un point lumineux photographié. */
function creerLueur(): HTMLCanvasElement {
  const toile = document.createElement("canvas");
  toile.width = 64;
  toile.height = 64;
  const ctx = toile.getContext("2d");
  if (!ctx) return toile;
  const degrade = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  degrade.addColorStop(0, "rgba(255, 255, 255, 1)");
  degrade.addColorStop(0.07, "rgba(230, 246, 255, 0.95)");
  degrade.addColorStop(0.18, "rgba(125, 211, 252, 0.5)");
  degrade.addColorStop(0.42, "rgba(56, 189, 248, 0.13)");
  degrade.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, 64, 64);
  return toile;
}

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */

/**
 * Monte la scène dans le canvas : modèle, boucle et observateurs. Appelée à la
 * première approche de l'écran seulement ; renvoie de quoi tout arrêter.
 */
function monterScene(conteneur: HTMLDivElement, canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  /* ---------------- Modèle (calculé une fois) ---------------- */

  const reseau = genererReseau(GRAINE_RESEAU);
  const { aretes, niveaux, longueurs, debutsIncidences, incidences, positions, phases } = reseau;
  const n = reseau.nombreNoeuds;
  const m = longueurs.length;
  const nuage = genererNuage(GRAINE_NUAGE, NUAGE_MAX);
  const alea = mulberry32(GRAINE_ANIMATION);

  const tailles = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const e = reseau.eloignements[i];
    tailles[i] = e < 0.5 ? 1.9 : e < 0.85 ? 1.5 : 1.2;
  }

  // Facettes : triangles du maillage de la masse (trois nœuds reliés deux à
  // deux), tirés du réseau tel quel. Poids : pleines au cœur, nulles au bord,
  // pour que la masse soit dense sans dessiner d'enveloppe.
  const voisins = new Set<number>();
  for (let a = 0; a < m; a += 1) {
    const u = aretes[a * 2];
    const v = aretes[a * 2 + 1];
    voisins.add(u < v ? u * 65536 + v : v * 65536 + u);
  }
  const relies = (u: number, v: number) => voisins.has(u < v ? u * 65536 + v : v * 65536 + u);
  const listeFacettes: number[] = [];
  const listePoids: number[] = [];
  for (let a = 0; a < m; a += 1) {
    const u0 = aretes[a * 2];
    const v0 = aretes[a * 2 + 1];
    const u = u0 < v0 ? u0 : v0;
    const v = u0 < v0 ? v0 : u0;
    if (v >= reseau.nombreCoeur) continue;
    for (let k = debutsIncidences[u]; k < debutsIncidences[u + 1]; k += 1) {
      const b = incidences[k];
      const w = aretes[b * 2] === u ? aretes[b * 2 + 1] : aretes[b * 2];
      if (w <= v || w >= reseau.nombreCoeur || !relies(v, w)) continue;
      const e = (reseau.eloignements[u] + reseau.eloignements[v] + reseau.eloignements[w]) / 3;
      const poids = 1 - lisser((e - 0.45) / 0.5);
      if (poids < 0.05) continue;
      listeFacettes.push(u, v, w);
      listePoids.push(poids);
    }
  }
  const facettes = Uint16Array.from(listeFacettes);
  const poidsFacettes = Float32Array.from(listePoids);
  const nf = poidsFacettes.length;
  const paliersFacettes = new Int8Array(nf);

  // Nœuds qui luisent en permanence, chacun à son rythme.
  const luisants = new Uint8Array(n);
  const phasesLueur = new Float32Array(n);
  for (let i = 0; i < reseau.nombreCoeur; i += 1) {
    luisants[i] = alea() < PART_LUISANTS ? 1 : 0;
    phasesLueur[i] = alea() * Math.PI * 2;
  }

  // Projections : x, y en pixels CSS, profondeur dans [0, 1] (1 = au plus près).
  const ecran = new Float32Array(n * 3);
  // Positions après rotation, pour l'éclairage des facettes.
  const monde = new Float32Array(n * 3);
  const ecranNuage = new Float32Array(NUAGE_MAX * 3);
  const seaux = new Uint8Array(m);
  const lueurs = new Float32Array(n);
  const eclats = new Float32Array(n);
  const feuNiveau = new Int8Array(m);
  const feuFraction = new Float32Array(m);
  const feuInverse = new Uint8Array(m);
  const distances = new Float32Array(n);
  const figes = new Uint8Array(n);

  // Impulsions : un tableau par propriété, aucune allocation en boucle.
  const impArete = new Int16Array(IMPULSIONS_MAX).fill(-1);
  const impSens = new Uint8Array(IMPULSIONS_MAX);
  const impProgres = new Float32Array(IMPULSIONS_MAX);
  const impVitesse = new Float32Array(IMPULSIONS_MAX);
  const impSauts = new Uint8Array(IMPULSIONS_MAX);
  const impAttente = new Float32Array(IMPULSIONS_MAX);

  const halo = creerHalo("rgba(255, 255, 255, 1)", "rgba(186, 230, 253, 0.75)", "rgba(56, 189, 248, 0.18)");
  const lueur = creerLueur();
  const haloAmbre = creerHalo("rgba(255, 244, 214, 1)", "rgba(251, 191, 36, 0.7)", "rgba(251, 191, 36, 0.16)");

  const creerCadres = (nombre: number, groupes: number): Cadre[] =>
    choisirRepartis(reseau, nombre, 0.5, 0.95).map((noeud) => {
      const code = codeGroupe(alea, groupes);
      return { noeud, code, suivant: codeGroupe(alea, groupes), affiche: code, tranche: -1 };
    });
  const cadresLarges = creerCadres(CADRES_MAX, 2);
  const cadresCompacts = creerCadres(3, 1);

  // Police mono du site (Geist Mono), lue sur la variable posée par la mise en page.
  const famille =
    getComputedStyle(conteneur).getPropertyValue("--font-geist-mono").trim() || "ui-monospace, monospace";

  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- État ---------------- */

  let largeur = 0;
  let hauteur = 0;
  let densite = 1;
  let cx = 0;
  let cy = 0;
  let rayon = 0;
  let compact = false;
  let nombreNuage = NUAGE_MAX;
  let nombreImpulsions = IMPULSIONS_MAX;
  let cadres = cadresLarges;
  let policeCadre = "";
  let coeur: CanvasGradient | null = null;
  let largeurCadre = 0;
  let hauteurCadre = 0;
  let ecartCadre = 0;
  let bordGauche = 0;
  let bordDroit = 0;

  // Position des cadres (lissée) et cible de l'image en cours, en pixels CSS.
  const cadreX = new Float32Array(CADRES_MAX);
  const cadreY = new Float32Array(CADRES_MAX);
  const cibleX = new Float32Array(CADRES_MAX);
  const cibleY = new Float32Array(CADRES_MAX);
  let cadresAPoser = true;
  let horlogeCadres = 0;

  let horloge = 0;
  let debutPrise = PREMIER_CALME;
  let source = 0;
  let distanceMax = 1;
  let activite = 0;

  let image = 0;
  let instantPrecedent = 0;
  let visible = true;
  let dansLeCadre = true;
  let demonte = false;

  /* ---------------- Prise de contrôle ---------------- */

  /** Choisit le nœud d'entrée (en périphérie) et calcule l'avancée de l'onde. */
  const preparerPrise = () => {
    let essai = 0;
    do {
      source = Math.floor(alea() * n);
      essai += 1;
    } while (reseau.eloignements[source] < 0.6 && essai < 50);
    distanceMax = Math.max(1e-6, propager(reseau, source, distances, figes));
  };

  /** Instant où l'onde atteint le nœud i, en secondes depuis le début de la prise. */
  const arrivee = (i: number) => ECLAIR + (ONDE * distances[i]) / distanceMax;

  const terminerPrise = () => {
    for (const liste of [cadresLarges, cadresCompacts]) {
      for (const cadre of liste) {
        cadre.code = cadre.suivant;
        cadre.suivant = codeGroupe(alea, liste === cadresLarges ? 2 : 1);
        cadre.affiche = cadre.code;
        cadre.tranche = -1;
      }
    }
    debutPrise += CYCLE_MIN + alea() * (CYCLE_MAX - CYCLE_MIN);
    preparerPrise();
  };

  /* ---------------- Mesure ---------------- */

  const mesurer = () => {
    const rect = conteneur.getBoundingClientRect();
    const l = Math.round(rect.width);
    const h = Math.round(rect.height);
    // Densité plafonnée à 2 : au delà, quatre fois plus de pixels à peindre
    // pour des traits d'un pixel, sans gain visible.
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (l === largeur && h === hauteur && d === densite) return false;
    largeur = l;
    hauteur = h;
    densite = d;
    if (largeur === 0 || hauteur === 0) return false;

    canvas.width = Math.round(largeur * densite);
    canvas.height = Math.round(hauteur * densite);

    compact = largeur < 600;
    cx = largeur / 2;
    cy = hauteur * 0.5;
    rayon = Math.min(largeur * (compact ? 0.4 : 0.37), hauteur * 0.53);
    nombreNuage = compact ? 240 : NUAGE_MAX;
    nombreImpulsions = compact ? 18 : IMPULSIONS_MAX;
    cadres = compact ? cadresCompacts : cadresLarges;
    policeCadre = `400 ${compact ? 7.5 : 8.5}px ${famille}`;
    hauteurCadre = compact ? 15 : 19;
    ecartCadre = compact ? 22 : 40;

    ctx.font = policeCadre;
    ctx.letterSpacing = "0.08em";
    largeurCadre = Math.ceil(ctx.measureText(compact ? "0000" : "0000 0000").width) + (compact ? 10 : 14);

    bordGauche = compact ? 12 : 24;
    bordDroit = largeur - bordGauche;

    // Lueur du cœur : la lumière que la masse diffuse autour d'elle.
    coeur = ctx.createRadialGradient(cx, cy, 0, cx, cy, rayon * 1.3);
    coeur.addColorStop(0, "rgba(125, 211, 252, 0.16)");
    coeur.addColorStop(0.35, "rgba(56, 189, 248, 0.07)");
    coeur.addColorStop(1, "rgba(56, 189, 248, 0)");
    cadresAPoser = true;
    return true;
  };

  /* ---------------- Impulsions ---------------- */

  const naitre = (p: number, progres: number) => {
    const noeud = Math.floor(alea() * reseau.nombreCoeur);
    const debut = debutsIncidences[noeud];
    const degre = debutsIncidences[noeud + 1] - debut;
    if (degre === 0) {
      impArete[p] = -1;
      impAttente[p] = 0.3;
      return;
    }
    const a = incidences[debut + Math.floor(alea() * degre)];
    impArete[p] = a;
    impSens[p] = aretes[a * 2] === noeud ? 0 : 1;
    impProgres[p] = progres;
    impVitesse[p] = 0.5 + alea() * 0.45;
    impSauts[p] = 3 + Math.floor(alea() * 6);
  };
  for (let p = 0; p < IMPULSIONS_MAX; p += 1) naitre(p, alea());

  const avancerImpulsions = (dt: number, acceleration: number) => {
    for (let p = 0; p < nombreImpulsions; p += 1) {
      let a = impArete[p];
      if (a < 0) {
        impAttente[p] -= dt;
        if (impAttente[p] <= 0) naitre(p, 0);
        continue;
      }
      impProgres[p] += (impVitesse[p] * acceleration * dt) / longueurs[a];
      while (impProgres[p] >= 1) {
        const atteint = impSens[p] === 0 ? aretes[a * 2 + 1] : aretes[a * 2];
        lueurs[atteint] = 1;
        impSauts[p] -= 1;
        if (impSauts[p] === 0) {
          impArete[p] = -1;
          impAttente[p] = 0.2 + alea() * 1.4;
          break;
        }
        // Arête suivante, sans rebrousser chemin quand le nœud en offre une autre.
        const debut = debutsIncidences[atteint];
        const degre = debutsIncidences[atteint + 1] - debut;
        let rang = Math.floor(alea() * degre);
        if (incidences[debut + rang] === a && degre > 1) rang = (rang + 1) % degre;
        const suivante = incidences[debut + rang];
        impProgres[p] = ((impProgres[p] - 1) * longueurs[a]) / longueurs[suivante];
        a = suivante;
        impArete[p] = a;
        impSens[p] = aretes[a * 2] === atteint ? 0 : 1;
      }
    }
  };

  /* ---------------- Temps ---------------- */

  const avancer = (dt: number) => {
    horloge += dt;
    if (horloge >= debutPrise + DUREE_PRISE) terminerPrise();
    const tp = horloge - debutPrise;
    const active = tp >= 0 && tp < DUREE_PRISE;
    const relache = tp < DEBUT_RETOUR ? 1 : 1 - lisser((tp - DEBUT_RETOUR) / RETOUR);
    activite = active ? Math.min(lisser((tp - 0.2) / 0.8), relache) : 0;

    const extinction = Math.exp(-dt * 2.6);
    for (let i = 0; i < n; i += 1) lueurs[i] *= extinction;
    avancerImpulsions(dt, 1 + 0.8 * activite);

    // Codes des cadres : brouillés à l'arrivée de l'onde, puis fixés sur le suivant.
    for (const cadre of cadres) {
      if (!active) {
        cadre.affiche = cadre.code;
        continue;
      }
      const tau = tp - arrivee(cadre.noeud);
      if (tau < 0) {
        cadre.affiche = cadre.code;
      } else if (tau < BROUILLAGE && tp < DEBUT_RETOUR) {
        const tranche = Math.floor(tau / PAS_BROUILLAGE);
        if (tranche !== cadre.tranche) {
          cadre.tranche = tranche;
          cadre.affiche = codeGroupe(alea, compact ? 1 : 2);
        }
      } else {
        cadre.affiche = cadre.suivant;
      }
    }
  };

  /* ---------------- Dessin ---------------- */

  const cosI = Math.cos(INCLINAISON);
  const sinI = Math.sin(INCLINAISON);

  const projeter = () => {
    const angle = ANGLE_DEPART + (horloge * Math.PI * 2) / PERIODE_ROTATION;
    const cosT = Math.cos(angle);
    const sinT = Math.sin(angle);
    const souffle = horloge * PULSATION_RESPIRATION;
    const ensemble = 1 + 0.012 * Math.sin(souffle * 0.61);
    for (let i = 0; i < n; i += 1) {
      const r = ensemble + RESPIRATION * Math.sin(souffle + phases[i]);
      const x = positions[i * 3] * r;
      const y = positions[i * 3 + 1] * r;
      const z = positions[i * 3 + 2] * r;
      const x1 = x * cosT + z * sinT;
      const z1 = z * cosT - x * sinT;
      const y2 = y * cosI - z1 * sinI;
      const z2 = y * sinI + z1 * cosI;
      const k = RECUL / (RECUL - z2);
      monde[i * 3] = x1;
      monde[i * 3 + 1] = y2;
      monde[i * 3 + 2] = z2;
      ecran[i * 3] = cx + x1 * rayon * k;
      ecran[i * 3 + 1] = cy - y2 * rayon * k;
      const prof = (z2 + 1) / 2;
      ecran[i * 3 + 2] = prof < 0 ? 0 : prof > 1 ? 1 : prof;
    }
    for (let j = 0; j < nombreNuage; j += 1) {
      const x = nuage[j * 3];
      const y = nuage[j * 3 + 1];
      const z = nuage[j * 3 + 2];
      const x1 = x * cosT + z * sinT;
      const z1 = z * cosT - x * sinT;
      const y2 = y * cosI - z1 * sinI;
      const z2 = y * sinI + z1 * cosI;
      const k = RECUL / (RECUL - z2);
      ecranNuage[j * 3] = cx + x1 * rayon * k;
      ecranNuage[j * 3 + 1] = cy - y2 * rayon * k;
      const prof = (z2 + 2.3) / 4.6;
      ecranNuage[j * 3 + 2] = prof < 0 ? 0 : prof > 1 ? 1 : prof;
    }
  };

  const seauDe = (prof: number) => (prof < 0.36 ? 0 : prof < 0.64 ? 1 : 2);

  /** Aligne un trait d'un pixel CSS sur la grille de pixels de l'écran. */
  const aligner = (v: number) => {
    const w = Math.max(1, Math.round(densite));
    return (Math.round(v * densite - w / 2) + w / 2) / densite;
  };

  /** Tranche de profondeur continue, du plus loin (0) au plus près (TRANCHES - 1). */
  const trancheDe = (prof: number) => {
    const t = Math.floor(prof * TRANCHES);
    return t < 0 ? 0 : t >= TRANCHES ? TRANCHES - 1 : t;
  };

  const dessinerCoeur = () => {
    if (!coeur) return;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1 + 0.5 * activite;
    ctx.fillStyle = coeur;
    ctx.fillRect(cx - rayon * 1.3, cy - rayon * 1.3, rayon * 2.6, rayon * 2.6);
  };

  const dessinerFacettes = () => {
    // Chaque facette prend la lumière selon son orientation (des deux côtés :
    // le verre se voit par transparence), puis s'éteint avec la distance.
    for (let f = 0; f < nf; f += 1) {
      const a = facettes[f * 3] * 3;
      const b = facettes[f * 3 + 1] * 3;
      const c = facettes[f * 3 + 2] * 3;
      const ux = monde[b] - monde[a];
      const uy = monde[b + 1] - monde[a + 1];
      const uz = monde[b + 2] - monde[a + 2];
      const vx = monde[c] - monde[a];
      const vy = monde[c + 1] - monde[a + 1];
      const vz = monde[c + 2] - monde[a + 2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const norme = Math.hypot(nx, ny, nz);
      if (norme < 1e-9) {
        paliersFacettes[f] = -1;
        continue;
      }
      const eclairage = Math.abs(nx * LUMIERE[0] + ny * LUMIERE[1] + nz * LUMIERE[2]) / norme;
      const prof = (ecran[a + 2] + ecran[b + 2] + ecran[c + 2]) / 3;
      const intensite = poidsFacettes[f] * (0.12 + 0.88 * eclairage * eclairage * eclairage) * (0.3 + 0.7 * prof);
      const palier = Math.floor(intensite * PALIERS_FACETTE);
      paliersFacettes[f] = palier < 1 ? -1 : palier >= PALIERS_FACETTE ? PALIERS_FACETTE - 1 : palier;
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = VERRE;
    for (let q = 1; q < PALIERS_FACETTE; q += 1) {
      ctx.beginPath();
      for (let f = 0; f < nf; f += 1) {
        if (paliersFacettes[f] !== q) continue;
        const a = facettes[f * 3] * 3;
        const b = facettes[f * 3 + 1] * 3;
        const c = facettes[f * 3 + 2] * 3;
        ctx.moveTo(ecran[a], ecran[a + 1]);
        ctx.lineTo(ecran[b], ecran[b + 1]);
        ctx.lineTo(ecran[c], ecran[c + 1]);
        ctx.closePath();
      }
      ctx.globalAlpha = (ALPHA_FACETTE * (q + 0.5)) / PALIERS_FACETTE;
      ctx.fill();
    }
  };

  const dessinerNuage = () => {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = NEON;
    for (let s = 0; s < 3; s += 1) {
      const cote = s === 0 ? 1.1 : s === 1 ? 1.5 : 1.9;
      ctx.beginPath();
      for (let j = 0; j < nombreNuage; j += 1) {
        if (seauDe(ecranNuage[j * 3 + 2]) !== s) continue;
        ctx.rect(ecranNuage[j * 3] - cote / 2, ecranNuage[j * 3 + 1] - cote / 2, cote, cote);
      }
      ctx.globalAlpha = s === 0 ? 0.3 : s === 1 ? 0.52 : 0.8;
      ctx.fill();
    }
  };

  const dessinerMaillage = () => {
    // Addition des lumières : là où les traits se croisent, le cœur blanchit.
    ctx.globalCompositeOperation = "lighter";
    for (let a = 0; a < m; a += 1) {
      const prof = (ecran[aretes[a * 2] * 3 + 2] + ecran[aretes[a * 2 + 1] * 3 + 2]) / 2;
      seaux[a] = niveaux[a] * TRANCHES + trancheDe(prof);
    }
    for (let s = 0; s < TRAITS.length * TRANCHES; s += 1) {
      const trait = TRAITS[Math.floor(s / TRANCHES)];
      const tranche = s % TRANCHES;
      ctx.beginPath();
      let vide = true;
      for (let a = 0; a < m; a += 1) {
        if (seaux[a] !== s) continue;
        vide = false;
        const ia = aretes[a * 2] * 3;
        const ib = aretes[a * 2 + 1] * 3;
        ctx.moveTo(ecran[ia], ecran[ia + 1]);
        ctx.lineTo(ecran[ib], ecran[ib + 1]);
      }
      if (vide) continue;
      ctx.lineWidth = trait.largeur * PROFONDEUR_LARGEURS[tranche];
      ctx.strokeStyle = PROFONDEUR_COULEURS[tranche];
      ctx.globalAlpha = trait.alpha * PROFONDEUR_ALPHAS[tranche];
      ctx.stroke();
    }
  };

  const dessinerFeu = (tp: number, relache: number) => {
    ctx.globalCompositeOperation = "lighter";
    for (let a = 0; a < m; a += 1) {
      const ta = arrivee(aretes[a * 2]);
      const tb = arrivee(aretes[a * 2 + 1]);
      const t0 = ta < tb ? ta : tb;
      const t1 = ta < tb ? tb : ta;
      if (tp < t0) {
        feuNiveau[a] = -1;
        continue;
      }
      let intensite = relache;
      if (tp < t1) {
        feuFraction[a] = (tp - t0) / (t1 - t0);
      } else {
        feuFraction[a] = 1;
        intensite *= PALIER_FEU + (1 - PALIER_FEU) * Math.exp(-(tp - t1) / DECLIN_FEU);
      }
      feuInverse[a] = ta > tb ? 1 : 0;
      feuNiveau[a] = intensite < 0.04 ? -1 : Math.min(NIVEAUX_FEU - 1, Math.floor(intensite * NIVEAUX_FEU));
    }
    for (let q = 0; q < NIVEAUX_FEU; q += 1) {
      ctx.beginPath();
      let vide = true;
      for (let a = 0; a < m; a += 1) {
        if (feuNiveau[a] !== q) continue;
        vide = false;
        const depart = aretes[a * 2 + feuInverse[a]] * 3;
        const fin = aretes[a * 2 + 1 - feuInverse[a]] * 3;
        const f = feuFraction[a];
        ctx.moveTo(ecran[depart], ecran[depart + 1]);
        ctx.lineTo(ecran[depart] + (ecran[fin] - ecran[depart]) * f, ecran[depart + 1] + (ecran[fin + 1] - ecran[depart + 1]) * f);
      }
      if (vide) continue;
      // Deux passes : une lueur large et pâle, puis le filament vif.
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.06 + 0.04 * q;
      ctx.stroke();
      ctx.strokeStyle = COULEURS_FEU[q];
      ctx.lineWidth = 0.9 + 0.22 * q;
      ctx.globalAlpha = 0.35 + 0.15 * q;
      ctx.stroke();
    }
    // Pointe blanche du front de l'onde sur les arêtes en cours d'embrasement.
    for (let a = 0; a < m; a += 1) {
      if (feuNiveau[a] < 0 || feuFraction[a] >= 1) continue;
      const depart = aretes[a * 2 + feuInverse[a]] * 3;
      const fin = aretes[a * 2 + 1 - feuInverse[a]] * 3;
      const f = feuFraction[a];
      const x = ecran[depart] + (ecran[fin] - ecran[depart]) * f;
      const y = ecran[depart + 1] + (ecran[fin + 1] - ecran[depart + 1]) * f;
      ctx.globalAlpha = 0.85 * relache;
      ctx.drawImage(halo, x - 5, y - 5, 10, 10);
    }
  };

  /** Traînées : l'arête parcourue s'éclaire, puis une queue qui s'effile jusqu'à une tête vive. */
  const TRAINEE = [
    { debut: 0.62, fin: 0.34, largeur: 1.1, alpha: 0.16, couleur: NEON },
    { debut: 0.34, fin: 0.14, largeur: 1.3, alpha: 0.4, couleur: NEON },
    { debut: 0.14, fin: 0, largeur: 1.5, alpha: 0.9, couleur: BLANC },
  ] as const;

  const dessinerImpulsions = () => {
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    for (let p = 0; p < nombreImpulsions; p += 1) {
      const a = impArete[p];
      if (a < 0) continue;
      const ia = aretes[a * 2] * 3;
      const ib = aretes[a * 2 + 1] * 3;
      ctx.moveTo(ecran[ia], ecran[ia + 1]);
      ctx.lineTo(ecran[ib], ecran[ib + 1]);
    }
    ctx.strokeStyle = NEON;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.14;
    ctx.stroke();

    for (const troncon of TRAINEE) {
      ctx.beginPath();
      for (let p = 0; p < nombreImpulsions; p += 1) {
        const a = impArete[p];
        if (a < 0) continue;
        const depart = aretes[a * 2 + impSens[p]] * 3;
        const fin = aretes[a * 2 + 1 - impSens[p]] * 3;
        const t = impProgres[p];
        const t0 = t - troncon.debut > 0 ? t - troncon.debut : 0;
        const t1 = t - troncon.fin;
        if (t1 <= t0) continue;
        const dx = ecran[fin] - ecran[depart];
        const dy = ecran[fin + 1] - ecran[depart + 1];
        ctx.moveTo(ecran[depart] + dx * t0, ecran[depart + 1] + dy * t0);
        ctx.lineTo(ecran[depart] + dx * t1, ecran[depart + 1] + dy * t1);
      }
      ctx.strokeStyle = troncon.couleur;
      ctx.lineWidth = troncon.largeur;
      ctx.globalAlpha = troncon.alpha;
      ctx.stroke();
    }

    for (let p = 0; p < nombreImpulsions; p += 1) {
      const a = impArete[p];
      if (a < 0) continue;
      const depart = aretes[a * 2 + impSens[p]] * 3;
      const fin = aretes[a * 2 + 1 - impSens[p]] * 3;
      const t = impProgres[p];
      const x = ecran[depart] + (ecran[fin] - ecran[depart]) * t;
      const y = ecran[depart + 1] + (ecran[fin + 1] - ecran[depart + 1]) * t;
      const prof = ecran[depart + 2] + (ecran[fin + 2] - ecran[depart + 2]) * t;
      const cote = 14 + 12 * prof;
      ctx.globalAlpha = 0.55 + 0.4 * prof;
      ctx.drawImage(lueur, x - cote / 2, y - cote / 2, cote, cote);
    }
  };

  const dessinerNoeuds = (anime: boolean, active: boolean, tp: number, relache: number) => {
    // Éclat de prise de contrôle : flash à l'arrivée de l'onde, puis palier.
    for (let i = 0; i < n; i += 1) {
      let e = 0;
      if (active) {
        const tau = tp - arrivee(i);
        if (tau >= 0) e = (0.35 + 0.65 * Math.exp(-tau / 0.35)) * relache;
      }
      eclats[i] = e;
    }

    ctx.globalCompositeOperation = "source-over";
    for (let s = 0; s < TRANCHES; s += 1) {
      ctx.beginPath();
      let vide = true;
      for (let i = 0; i < n; i += 1) {
        const prof = ecran[i * 3 + 2];
        if (trancheDe(prof) !== s) continue;
        vide = false;
        const r = tailles[i] * (0.36 + 0.4 * prof);
        ctx.moveTo(ecran[i * 3] + r, ecran[i * 3 + 1]);
        ctx.arc(ecran[i * 3], ecran[i * 3 + 1], r, 0, Math.PI * 2);
      }
      if (vide) continue;
      ctx.fillStyle = PROFONDEUR_COULEURS[s];
      ctx.globalAlpha = 0.3 + 0.66 * PROFONDEUR_ALPHAS[s];
      ctx.fill();
    }

    // Nœuds qui luisent au calme : lueur qui respire, plus grande de près.
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i += 1) {
      if (luisants[i] === 0) continue;
      const prof = ecran[i * 3 + 2];
      const souffle = anime ? 0.5 + 0.5 * Math.sin(horloge * 1.3 + phasesLueur[i]) : 0.6;
      const cote = (9 + 13 * prof) * (0.85 + 0.3 * souffle);
      ctx.globalAlpha = (0.25 + 0.55 * souffle) * (0.35 + 0.65 * prof);
      ctx.drawImage(lueur, ecran[i * 3] - cote / 2, ecran[i * 3 + 1] - cote / 2, cote, cote);
    }

    // Nœuds allumés par une impulsion ou par l'onde : lueur vive.
    for (let i = 0; i < n; i += 1) {
      const b = lueurs[i] > eclats[i] ? lueurs[i] : eclats[i];
      if (b < 0.2) continue;
      const cote = 10 + 16 * b;
      ctx.globalAlpha = b > 1 ? 1 : b;
      ctx.drawImage(lueur, ecran[i * 3] - cote / 2, ecran[i * 3 + 1] - cote / 2, cote, cote);
    }

    // Nœud d'entrée : seul accent chaud, de l'éclair jusqu'au retour au calme.
    if (active) {
      const force = lisser(tp / ECLAIR) * relache;
      if (force > 0.01) {
        const cote = 16 + 10 * force;
        ctx.globalAlpha = force;
        ctx.drawImage(haloAmbre, ecran[source * 3] - cote / 2, ecran[source * 3 + 1] - cote / 2, cote, cote);
      }
    }
  };

  const coinsCrochets = (gauche: number, haut: number, droite: number, bas: number, bras: number) => {
    ctx.moveTo(gauche, haut + bras);
    ctx.lineTo(gauche, haut);
    ctx.lineTo(gauche + bras, haut);
    ctx.moveTo(droite - bras, haut);
    ctx.lineTo(droite, haut);
    ctx.lineTo(droite, haut + bras);
    ctx.moveTo(droite, bas - bras);
    ctx.lineTo(droite, bas);
    ctx.lineTo(droite - bras, bas);
    ctx.moveTo(gauche + bras, bas);
    ctx.lineTo(gauche, bas);
    ctx.lineTo(gauche, bas - bras);
  };

  const dessinerCadres = (active: boolean, tp: number) => {
    ctx.globalCompositeOperation = "source-over";
    ctx.font = policeCadre;
    ctx.letterSpacing = "0.08em";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;
    const demiL = largeurCadre / 2;
    const demiH = hauteurCadre / 2;

    // Placement : hors de la masse, dans l'axe centre-nœud. Le décalage suit la
    // demi-étendue du cadre dans cette direction, donc la position varie sans
    // saut quand le nœud passe d'un côté à l'autre.
    for (let c = 0; c < cadres.length; c += 1) {
      const noeud = cadres[c].noeud;
      let ux = ecran[noeud * 3] - cx;
      let uy = ecran[noeud * 3 + 1] - cy;
      const d = Math.hypot(ux, uy);
      if (d < 1) {
        ux = 1;
        uy = 0;
      } else {
        ux /= d;
        uy /= d;
      }
      const portee = Math.max(d + ecartCadre, rayon * 1.02) + Math.abs(ux) * demiL + Math.abs(uy) * demiH;
      cibleX[c] = cx + ux * portee;
      cibleY[c] = cy + uy * portee * 0.82;
    }
    // Deux cadres ne se recouvrent jamais, crochets ouverts compris : écartés
    // verticalement.
    for (let passe = 0; passe < 3; passe += 1) {
      for (let a = 0; a < cadres.length; a += 1) {
        for (let b = a + 1; b < cadres.length; b += 1) {
          const recouvreX = largeurCadre + 18 - Math.abs(cibleX[a] - cibleX[b]);
          const recouvreY = hauteurCadre + 16 - Math.abs(cibleY[a] - cibleY[b]);
          if (recouvreX <= 0 || recouvreY <= 0) continue;
          const sens = cibleY[a] <= cibleY[b] ? -1 : 1;
          cibleY[a] += (sens * recouvreY) / 2;
          cibleY[b] -= (sens * recouvreY) / 2;
        }
      }
    }
    // Les cadres rejoignent leur place en douceur ; ils s'y posent d'un coup
    // au premier dessin et après un redimensionnement.
    const suivi = cadresAPoser ? 1 : 1 - Math.exp(-(horloge - horlogeCadres) * 6);
    cadresAPoser = false;
    horlogeCadres = horloge;

    for (let c = 0; c < cadres.length; c += 1) {
      const cadre = cadres[c];
      const px = ecran[cadre.noeud * 3];
      const py = ecran[cadre.noeud * 3 + 1];
      cadreX[c] += (cibleX[c] - cadreX[c]) * suivi;
      cadreY[c] += (cibleY[c] - cadreY[c]) * suivi;

      // État : ouvert au calme, serré et clignotant au verrouillage.
      let serrage = 0;
      let alpha = 0.55;
      let verrouille = false;
      let alerte = false;
      if (active) {
        const tau = tp - arrivee(cadre.noeud);
        if (tp >= DEBUT_RETOUR) {
          const r = lisser((tp - DEBUT_RETOUR) / 0.6);
          serrage = 1 - r;
          alpha = 1 - 0.45 * r;
          verrouille = r < 1;
        } else if (tau >= 0) {
          serrage = lisser(tau / SERRAGE);
          alpha = 1;
          verrouille = true;
          if (tau >= SERRAGE && tau < FIN_CLIGNOTEMENT) {
            alerte = true;
            if (Math.floor((tau - SERRAGE) / 0.1) % 2 === 1) alpha = 0.22;
          }
        }
      }

      const bx = Math.round(Math.min(Math.max(cadreX[c], bordGauche + demiL), bordDroit - demiL));
      const by = Math.round(Math.min(Math.max(cadreY[c], demiH + 10), hauteur - demiH - 10));
      // Trait de rappel : du nœud au point du cadre le plus proche.
      const ancreX = Math.min(Math.max(px, bx - demiL), bx + demiL);
      const ancreY = Math.min(Math.max(py, by - demiH), by + demiH);

      const gauche = aligner(bx - demiL);
      const droite = aligner(bx + demiL);
      const haut = aligner(by - demiH);
      const bas = aligner(by + demiH);

      // Fond sombre pour la lisibilité du code, bord fin.
      ctx.globalAlpha = 0.6 * alpha;
      ctx.fillStyle = "#02060d";
      ctx.fillRect(gauche, haut, droite - gauche, bas - haut);
      ctx.globalAlpha = 0.28 * alpha;
      ctx.strokeStyle = NEON;
      ctx.strokeRect(gauche, haut, droite - gauche, bas - haut);

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ancreX, ancreY);
      ctx.globalAlpha = 0.5 * alpha;
      ctx.stroke();

      // Crochets : écartés au calme, posés sur les coins une fois serrés.
      const jeu = (1 - serrage) * 5;
      ctx.beginPath();
      coinsCrochets(gauche - jeu, haut - jeu, droite + jeu, bas + jeu, compact ? 4 : 5);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = verrouille ? BLANC : NEON;
      ctx.stroke();

      // Réticule sur le nœud verrouillé.
      if (verrouille) {
        const r = 4 + (1 - serrage) * 5;
        ctx.beginPath();
        coinsCrochets(px - r, py - r, px + r, py + r, 3);
        ctx.strokeStyle = alerte ? "#fbbf24" : NEON;
        ctx.stroke();
      }

      ctx.fillStyle = BLANC;
      ctx.globalAlpha = alpha;
      ctx.fillText(cadre.affiche, gauche + (compact ? 5 : 7), by + 0.5);
    }
  };

  const dessiner = (anime: boolean) => {
    if (largeur === 0 || hauteur === 0) return;
    ctx.setTransform(densite, 0, 0, densite, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, largeur, hauteur);

    const tp = horloge - debutPrise;
    const active = anime && tp >= 0 && tp < DUREE_PRISE;
    const relache = tp < DEBUT_RETOUR ? 1 : 1 - lisser((tp - DEBUT_RETOUR) / RETOUR);

    projeter();
    dessinerCoeur();
    dessinerNuage();
    dessinerFacettes();
    dessinerMaillage();
    if (active) dessinerFeu(tp, relache);
    if (anime) dessinerImpulsions();
    dessinerNoeuds(anime, active, tp, relache);
    dessinerCadres(active, tp);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  /* ---------------- Boucle ---------------- */

  const peutAnimer = () => !mouvementReduit.matches && visible && dansLeCadre;

  // Mesure de développement : temps moyen de calcul et de dessin par image,
  // lu sur `data-ms-image`. Code retiré de la version de production.
  let mesureCumul = 0;
  let mesureImages = 0;

  const boucle = (maintenant: number) => {
    // Pas plafonné : un onglet qui revient ne rattrape pas le temps perdu d'un coup.
    const dt = instantPrecedent === 0 ? 1 / 60 : Math.min(0.05, (maintenant - instantPrecedent) / 1000);
    instantPrecedent = maintenant;
    if (process.env.NODE_ENV === "development") {
      const debut = performance.now();
      avancer(dt);
      dessiner(true);
      mesureCumul += performance.now() - debut;
      mesureImages += 1;
      if (mesureImages === 120) {
        canvas.dataset.msImage = (mesureCumul / mesureImages).toFixed(3);
        mesureCumul = 0;
        mesureImages = 0;
      }
    } else {
      avancer(dt);
      dessiner(true);
    }
    image = window.requestAnimationFrame(boucle);
  };

  const demarrer = () => {
    if (image !== 0 || !peutAnimer()) return;
    instantPrecedent = 0;
    image = window.requestAnimationFrame(boucle);
  };

  const arreter = () => {
    if (image === 0) return;
    window.cancelAnimationFrame(image);
    image = 0;
  };

  const synchroniser = () => {
    if (peutAnimer()) {
      demarrer();
      return;
    }
    arreter();
    // Mouvement réduit : une image fixe, réseau au repos.
    if (mouvementReduit.matches) dessiner(false);
  };

  /* ---------------- Branchements ---------------- */

  const observateurTaille = new ResizeObserver(() => {
    if (!mesurer()) return;
    dessiner(!mouvementReduit.matches);
  });
  observateurTaille.observe(conteneur);

  const observateurCadre = new IntersectionObserver(
    (entrees) => {
      dansLeCadre = entrees.some((entree) => entree.isIntersecting);
      synchroniser();
    },
    { rootMargin: "120px" },
  );
  observateurCadre.observe(conteneur);

  const surVisibilite = () => {
    visible = document.visibilityState === "visible";
    synchroniser();
  };
  document.addEventListener("visibilitychange", surVisibilite);
  mouvementReduit.addEventListener("change", synchroniser);

  // Banc d'essai de développement : `canvas.dispatchEvent(new CustomEvent("csrn-banc", { detail: 600 }))`
  // calcule et dessine autant d'images d'affilée, puis écrit la moyenne dans `data-banc`.
  const banc =
    process.env.NODE_ENV === "development"
      ? (evenement: Event) => {
          const images =
            evenement instanceof CustomEvent && typeof evenement.detail === "number" ? evenement.detail : 600;
          const debut = performance.now();
          for (let k = 0; k < images; k += 1) {
            avancer(1 / 60);
            dessiner(true);
          }
          ctx.getImageData(0, 0, 1, 1);
          canvas.dataset.banc = ((performance.now() - debut) / images).toFixed(3);
        }
      : null;
  if (banc) canvas.addEventListener("csrn-banc", banc);

  // La police mono peut arriver après le premier dessin : les cadres sont
  // alors repeints avec elle.
  document.fonts
    .load(`400 9px ${famille}`)
    .then(() => {
      if (demonte) return;
      largeur = 0;
      if (mesurer() && image === 0) dessiner(!mouvementReduit.matches);
    })
    .catch(() => undefined);

  preparerPrise();
  visible = document.visibilityState === "visible";
  mesurer();
  dessiner(!mouvementReduit.matches);
  synchroniser();

  return () => {
    demonte = true;
    arreter();
    observateurTaille.disconnect();
    observateurCadre.disconnect();
    document.removeEventListener("visibilitychange", surVisibilite);
    mouvementReduit.removeEventListener("change", synchroniser);
    if (banc) canvas.removeEventListener("csrn-banc", banc);
  };
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export interface ReseauNeuronalProps {
  className?: string;
  style?: CSSProperties;
}

export function ReseauNeuronal({ className = "", style }: ReseauNeuronalProps) {
  const boite = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const conteneur = boite.current;
    const canvas = toile.current;
    if (!conteneur || !canvas) return;
    // Rien n'est calculé tant que l'illustration n'approche pas de l'écran :
    // une page qui ne descend jamais jusqu'à elle ne paie ni le modèle ni la boucle.
    let demonter: (() => void) | null = null;
    const guet = new IntersectionObserver(
      (entrees) => {
        if (demonter || !entrees.some((entree) => entree.isIntersecting)) return;
        guet.disconnect();
        demonter = monterScene(conteneur, canvas);
      },
      { rootMargin: "240px" },
    );
    guet.observe(conteneur);
    return () => {
      guet.disconnect();
      demonter?.();
    };
  }, []);

  return (
    <div ref={boite} aria-hidden="true" className={`csRn ${className}`} style={style}>
      {/* React 19 place cette feuille une seule fois dans le <head> (même `href`). */}
      <style href="console-illustration-reseau" precedence="ds">
        {STYLES}
      </style>
      <canvas ref={toile} className="csRnToile" />
      <span className="csRnFaisceaux" />
    </div>
  );
}
