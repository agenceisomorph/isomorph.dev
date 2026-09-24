/**
 * Relief de la section Parallaxe en relief : les lignes de crête du fond
 * « Crêtes » (fonds/animes/Cretes.tsx), figées et rangées en cinq plans, du
 * lointain au premier plan. Chaque plan est dessiné à part pour que la
 * section le déplace à sa propre vitesse.
 *
 * Calcul fait au rendu serveur, une seule fois par processus : même graine,
 * même relief. Coordonnées dans une boîte de 1600 x 800, bas calé sur le bas
 * de la section.
 *
 * Chaque ligne est un seul tracé : la crête, puis un retour par le bas, hors
 * de la boîte. Le remplissage à la couleur de la section cache les lignes de
 * derrière (volume plein, jamais de vide sous une crête) ; le retour du tracé
 * passe toujours hors champ, même quand un plan se déplace.
 */

import { adoucir, creerBruit2D, melanger } from "../fonds/animes/bruit";

export const LARGEUR_RELIEF = 1600;
export const HAUTEUR_RELIEF = 800;
export const NOMBRE_PLANS = 5;

/** Débord horizontal du dessin : il couvre les glissements et les reculs des plans. */
const X_MIN = -480;
const X_MAX = 2080;
const PAS_X = 20;
/** Bas du remplissage, loin sous la boîte. */
const BAS = 1400;

const Z_LOIN = 3.4;
/** Ligne la plus proche entièrement dans le cadre au repos. */
const Z_CADRE = 0.9;
/** Pas entre deux lignes : 31 intervalles entre le fond et le bas du cadre. */
const PAS_Z = (Z_LOIN - Z_CADRE) / 31;
/** Trois lignes de plus sous le cadre : quand le premier plan remonte, il reste
    du relief jusqu'en bas de la section, jamais une bande vide. */
const LIGNES = 35;
/** Base de la ligne la plus lointaine, et base d'une ligne à la profondeur 1. */
const Y_LOIN = 410;
const Y_UN = 800;
const K = (Y_UN - Y_LOIN) / (1 - 1 / Z_LOIN);
const Y0 = Y_UN - K;
const AMPLITUDE = 320;
const FOCALE = 700;
const FREQUENCE = 1.25;
const GRAINE = 0x6a09e667;

/** Couleurs de Crêtes : premier plan blanc gris, lointain néon. */
const PREMIER_PLAN = [226, 234, 242] as const;
const NEON = [125, 211, 252] as const;

export interface LigneRelief {
  d: string;
  couleur: string;
  epaisseur: number;
}

export type PlanRelief = LigneRelief[];

/** Relief en un point du terrain, dans [0, 1] : vallées plates, crêtes marquées. */
function creerRelief() {
  const bruit = creerBruit2D(GRAINE);
  return (x: number, z: number) => {
    const fx = x * FREQUENCE;
    const fz = z * FREQUENCE;
    const n = bruit(fx, fz) * 0.62 + bruit(fx * 2.1 + 17, fz * 2.1) * 0.26 + bruit(fx * 4.3 + 41, fz * 4.3) * 0.12;
    const m = adoucir(-0.28, 0.72, n);
    return m * m;
  };
}

/** Relief abaissé à gauche, sous le texte ; plein à droite. */
const enveloppe = (x: number) => 0.34 + 0.66 * adoucir(0.12, 0.64, x / LARGEUR_RELIEF);

function calculer(): PlanRelief[] {
  const relief = creerRelief();
  const hauteurPlan = (Y0 + K / Z_CADRE - Y_LOIN) / NOMBRE_PLANS;
  const plans: PlanRelief[] = Array.from({ length: NOMBRE_PLANS }, () => []);

  // Du fond vers l'avant : chaque ligne recouvre celles de derrière.
  for (let k = 0; k < LIGNES; k += 1) {
    const z = Z_LOIN - k * PAS_Z;
    const base = Y0 + K / z;
    const hauteur = AMPLITUDE / z;
    // u : 1 au fond, 0 au premier plan (et sous le cadre).
    const u = Math.max(0, (z - Z_CADRE) / (Z_LOIN - Z_CADRE));

    let d = "";
    let yPrec = 0;
    for (let x = X_MIN; x <= X_MAX; x += PAS_X) {
      const v = relief(((x - LARGEUR_RELIEF / 2) * z) / FOCALE, z);
      // Arrondi au dixième, écarts calculés entre valeurs arrondies : aucune dérive.
      const y = Math.round((base - v * hauteur * enveloppe(x)) * 10) / 10;
      d += x === X_MIN ? `M${X_MIN} ${y}` : `l${PAS_X} ${Math.round((y - yPrec) * 10) / 10}`;
      yPrec = y;
    }
    d += `V${BAS}H${X_MIN}Z`;

    const teinte = Math.pow(u, 1.4) * 0.75;
    const rgb = PREMIER_PLAN.map((c, i) => Math.round(melanger(c, NEON[i], teinte)));
    const alpha = Math.round(melanger(0.74, 0.13, Math.pow(u, 0.8)) * 100) / 100;
    const plan = Math.min(NOMBRE_PLANS - 1, Math.floor((base - Y_LOIN) / hauteurPlan));
    plans[plan].push({
      d,
      couleur: `rgba(${rgb.join(",")},${alpha})`,
      epaisseur: Math.round(melanger(1.9, 0.75, Math.pow(u, 0.7)) * 100) / 100,
    });
  }
  return plans;
}

let cache: PlanRelief[] | null = null;

/** Les cinq plans, du plus lointain au plus proche. */
export function plansRelief(): PlanRelief[] {
  cache ??= calculer();
  return cache;
}
