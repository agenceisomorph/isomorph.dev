"use client";

/**
 * Illustration « Isomorphisme » du système Console : un même réseau de
 * 89 points et 267 liens qui passe par 50 formes. Les liens ne changent
 * jamais, seule l'apparence change (ISOMORPH vient d'isomorphisme).
 *
 * Validée par Florent sous forme de maquette
 * (`~/ISOMORPH/_docs/illustrations/isomorphisme-fibonacci.html`), portée ici
 * dans l'écriture de `ReseauNeuronal` : même fond (grille, halo, faisceaux),
 * même garde de montage, mêmes observateurs.
 *
 * Mouvement : continu, 2,2 s par forme, chaque forme étant un point de
 * passage d'une courbe de Catmull-Rom ; léger ralenti d'environ 50 ms sur
 * chaque forme, jamais d'arrêt. Lumière additive et traînée courte. Rotation
 * d'ensemble très lente.
 *
 * Rejeté par Florent, à ne pas remettre : étiquettes sur les points, compteur
 * ou nom de forme, bandeau sous l'écran, blanc pur, gros points, arrêts.
 *
 * Arbitrages :
 * - RGAA : décor pur, `aria-hidden`, aucune information portée par l'image
 *   (critère 1.2). Mouvement réduit : une seule image fixe, le tournesol
 *   (critère 13.8).
 * - Éco-conception : aucune dépendance, aucune image téléchargée. Boucle
 *   arrêtée hors écran et onglet masqué, densité de pixels plafonnée à 2.
 * - Performance : lueurs préparées une fois puis recopiées, couleurs des
 *   liens calculées une fois, positions dans un tableau réutilisé : aucune
 *   allocation dans la boucle.
 *
 * Le composant remplit son conteneur : lui donner une taille par `className`.
 */

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { NOMBRE_POINTS, creerTableTemps, genererLiens, genererParcours } from "./isomorphisme-formes";

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

/** Durée d'un passage d'une forme à la suivante, en millisecondes. */
const PASSAGE = 2200;
/** Tension de la courbe de Catmull-Rom. */
const TENSION = 0.5;
/** Rotation d'ensemble, en radians par milliseconde. */
const ROTATION = 0.00005;
/** Part de l'image précédente effacée à chaque image (traînée). */
const EFFACEMENT = 0.5;
/** Rayon du dessin, en part du plus petit côté. */
const ECHELLE = 0.44;
/** Coupe des coins de l'écran, en pixels (coupe « l » de la Console). */
const COUPE = 22;

/** Couleur par rang, dans la charte Console : néon vif, néon, néon clair, néon, néon vif. */
const PALIERS: readonly (readonly [number, number, number])[] = [
  [56, 189, 248],
  [125, 211, 252],
  [168, 228, 253],
  [125, 211, 252],
  [56, 189, 248],
];
/** Opacité d'un lien selon son écart de rang. */
const ALPHA_LIEN: Record<number, number> = { 1: 0.42, 21: 0.2, 34: 0.14 };

function couleurRang(t: number): [number, number, number] {
  const s = t * (PALIERS.length - 1);
  const k = Math.min(PALIERS.length - 2, Math.floor(s));
  const f = s - k;
  const a = PALIERS[k];
  const b = PALIERS[k + 1];
  return [0, 1, 2].map((j) => Math.round(a[j] + (b[j] - a[j]) * f)) as [number, number, number];
}

function creerLueur([r, g, b]: readonly [number, number, number]): HTMLCanvasElement {
  const toile = document.createElement("canvas");
  toile.width = 48;
  toile.height = 48;
  const ctx = toile.getContext("2d");
  if (!ctx) return toile;
  const degrade = ctx.createRadialGradient(24, 24, 0, 24, 24, 24);
  degrade.addColorStop(0, `rgba(${r},${g},${b},1)`);
  degrade.addColorStop(0.08, `rgba(${r},${g},${b},0.9)`);
  degrade.addColorStop(0.3, `rgba(${r},${g},${b},0.22)`);
  degrade.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, 48, 48);
  return toile;
}

const STYLES = `
@layer components {
  .csIso {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    contain: paint;
    background-color: #02060d;
    background-image:
      radial-gradient(ellipse 78% 72% at 50% 50%, transparent 52%, rgba(2, 6, 13, 0.82) 100%),
      radial-gradient(ellipse 20% 26% at 50% 50%, rgba(220, 238, 255, 0.06), transparent 75%),
      radial-gradient(ellipse 40% 46% at 50% 50%, rgba(56, 189, 248, 0.1), transparent 72%),
      linear-gradient(rgba(125, 211, 252, 0.12) 1px, transparent 1px),
      linear-gradient(90deg, rgba(125, 211, 252, 0.12) 1px, transparent 1px),
      linear-gradient(rgba(125, 211, 252, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(125, 211, 252, 0.05) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 100% 100%, 160px 160px, 160px 160px, 32px 32px, 32px 32px;
    background-position: center;
    clip-path: polygon(${COUPE}px 0, 100% 0, 100% calc(100% - ${COUPE}px), calc(100% - ${COUPE}px) 100%, 0 100%, 0 ${COUPE}px);
  }
  .csIsoToile { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
  .csIsoFaisceaux { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
  .csIsoFaisceaux::before, .csIsoFaisceaux::after { content: ""; position: absolute; inset: 0; }
  .csIsoFaisceaux::before {
    background:
      radial-gradient(circle at 6% -8%, rgba(226, 240, 255, 0.18), transparent 26%),
      conic-gradient(from 122deg at 6% -8%, transparent 0deg, rgba(214, 233, 255, 0.06) 7deg, rgba(230, 242, 255, 0.13) 13deg, rgba(214, 233, 255, 0.06) 19deg, transparent 27deg);
    -webkit-mask-image: radial-gradient(ellipse 110% 140% at 6% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
    mask-image: radial-gradient(ellipse 110% 140% at 6% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
  }
  .csIsoFaisceaux::after {
    background:
      radial-gradient(circle at 94% -8%, rgba(226, 240, 255, 0.18), transparent 26%),
      conic-gradient(from 211deg at 94% -8%, transparent 0deg, rgba(214, 233, 255, 0.06) 8deg, rgba(230, 242, 255, 0.13) 14deg, rgba(214, 233, 255, 0.06) 20deg, transparent 27deg);
    -webkit-mask-image: radial-gradient(ellipse 110% 140% at 94% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
    mask-image: radial-gradient(ellipse 110% 140% at 94% -8%, #000 12%, rgba(0, 0, 0, 0.35) 55%, transparent 92%);
  }
  .csIsoBord { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 4; }
  .csIsoBord path { fill: none; stroke: var(--cs-neon-doux, rgba(125, 211, 252, 0.34)); stroke-width: 1; vector-effect: non-scaling-stroke; }
}
`;

/* ------------------------------------------------------------------ */
/* Scène                                                               */
/* ------------------------------------------------------------------ */

function monterScene(conteneur: HTMLDivElement, canvas: HTMLCanvasElement, bord: SVGPathElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => undefined;

  /* ---------------- Modèle (calculé une fois) ---------------- */

  const n = NOMBRE_POINTS;
  const parcours = genererParcours();
  const nombreFormes = parcours.length;
  const liens = genererLiens();
  const nombreLiens = liens.length / 3;
  const temps = creerTableTemps();

  const couleurs = Array.from({ length: n }, (_, i) => couleurRang(i / n));
  const lueurs = couleurs.map(creerLueur);
  const traits = Array.from({ length: nombreLiens }, (_, l) => {
    const [r, g, b] = couleurs[liens[l * 3]];
    return `rgba(${r},${g},${b},${ALPHA_LIEN[liens[l * 3 + 2]]})`;
  });

  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const pz = new Float32Array(n);
  const forme = (k: number) => parcours[((k % nombreFormes) + nombreFormes) % nombreFormes].points;

  /* ---------------- Mesure ---------------- */

  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");
  let largeur = 0;
  let hauteur = 0;

  const mesurer = () => {
    const l = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (l === 0 || h === 0) return false;
    const densite = Math.min(2, window.devicePixelRatio || 1);
    largeur = l;
    hauteur = h;
    canvas.width = Math.round(l * densite);
    canvas.height = Math.round(h * densite);
    ctx.setTransform(densite, 0, 0, densite, 0, 0);
    // Bord qui suit la découpe de l'écran, en coordonnées 0 à 100.
    const cx = (COUPE / l) * 100;
    const cy = (COUPE / h) * 100;
    bord.setAttribute("d", `M ${cx} 0.1 L 99.9 0.1 L 99.9 ${100 - cy} L ${100 - cx} 99.9 L 0.1 99.9 L 0.1 ${cy} Z`);
    return true;
  };

  /* ---------------- Dessin ---------------- */

  const dessiner = (t: number, fixe: boolean) => {
    const k = Math.floor(t / PASSAGE);
    const s = fixe ? 0 : temps((t % PASSAGE) / PASSAGE);
    const F0 = forme(k - 1);
    const F1 = forme(k);
    const F2 = forme(k + 1);
    const F3 = forme(k + 2);
    const ech = Math.min(largeur, hauteur) * ECHELLE;
    const cx = largeur / 2;
    const cy = hauteur / 2;
    const cg = Math.cos(t * ROTATION);
    const sg = Math.sin(t * ROTATION);
    const s2 = s * s;
    const s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1;
    const h10 = s3 - 2 * s2 + s;
    const h01 = -2 * s3 + 3 * s2;
    const h11 = s3 - s2;

    for (let i = 0; i < n; i += 1) {
      const a = F0[i];
      const b = F1[i];
      const c = F2[i];
      const d = F3[i];
      const x = h00 * b[0] + h10 * TENSION * (c[0] - a[0]) + h01 * c[0] + h11 * TENSION * (d[0] - b[0]);
      const y = h00 * b[1] + h10 * TENSION * (c[1] - a[1]) + h01 * c[1] + h11 * TENSION * (d[1] - b[1]);
      const z = h00 * b[2] + h10 * TENSION * (c[2] - a[2]) + h01 * c[2] + h11 * TENSION * (d[2] - b[2]);
      px[i] = cx + (x * cg - y * sg) * ech;
      py[i] = cy + (x * sg + y * cg) * ech;
      pz[i] = Math.max(-1, Math.min(1, z));
    }

    // Traînée : l'image précédente s'efface vers la transparence, la grille reste visible.
    if (fixe) {
      ctx.clearRect(0, 0, largeur, hauteur);
    } else {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${EFFACEMENT})`;
      ctx.fillRect(0, 0, largeur, hauteur);
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    for (let l = 0; l < nombreLiens; l += 1) {
      const a = liens[l * 3];
      const b = liens[l * 3 + 1];
      ctx.strokeStyle = traits[l];
      ctx.beginPath();
      ctx.moveTo(px[a], py[a]);
      ctx.lineTo(px[b], py[b]);
      ctx.stroke();
    }
    for (let i = 0; i < n; i += 1) {
      const d = 9 + 3 * pz[i];
      ctx.globalAlpha = Math.min(1, 0.75 + 0.25 * pz[i]);
      ctx.drawImage(lueurs[i], px[i] - d / 2, py[i] - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  };

  /* ---------------- Boucle ---------------- */

  let image = 0;
  let visible = document.visibilityState === "visible";
  let dansLeCadre = true;
  // Horloge propre : elle ne tourne que pendant l'animation, pour reprendre
  // là où le dessin s'était arrêté.
  let horloge = 0;
  let precedent = 0;

  const peutAnimer = () => !mouvementReduit.matches && visible && dansLeCadre;

  const boucle = (maintenant: number) => {
    // Pas plafonné : un onglet qui revient ne rattrape pas le temps perdu d'un coup.
    horloge += precedent === 0 ? 1000 / 60 : Math.min(50, maintenant - precedent);
    precedent = maintenant;
    dessiner(horloge, false);
    image = window.requestAnimationFrame(boucle);
  };

  const demarrer = () => {
    if (image !== 0 || !peutAnimer()) return;
    precedent = 0;
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
    // Mouvement réduit : une image fixe, le tournesol.
    if (mouvementReduit.matches) {
      horloge = 0;
      dessiner(0, true);
    }
  };

  /* ---------------- Branchements ---------------- */

  const observateurTaille = new ResizeObserver(() => {
    if (!mesurer()) return;
    dessiner(horloge, true);
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

  if (mesurer()) dessiner(0, true);
  synchroniser();

  return () => {
    arreter();
    observateurTaille.disconnect();
    observateurCadre.disconnect();
    document.removeEventListener("visibilitychange", surVisibilite);
    mouvementReduit.removeEventListener("change", synchroniser);
  };
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export interface IsomorphismeProps {
  className?: string;
  style?: CSSProperties;
}

export function Isomorphisme({ className = "", style }: IsomorphismeProps) {
  const boite = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const trace = useRef<SVGPathElement>(null);

  useEffect(() => {
    const conteneur = boite.current;
    const canvas = toile.current;
    const bord = trace.current;
    if (!conteneur || !canvas || !bord) return;
    // Rien n'est calculé tant que l'illustration n'approche pas de l'écran.
    let demonter: (() => void) | null = null;
    const guet = new IntersectionObserver(
      (entrees) => {
        if (demonter || !entrees.some((entree) => entree.isIntersecting)) return;
        guet.disconnect();
        demonter = monterScene(conteneur, canvas, bord);
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
    <div ref={boite} aria-hidden="true" className={`csIso ${className}`} style={style}>
      {/* React 19 place cette feuille une seule fois dans le <head> (même `href`). */}
      <style href="console-illustration-isomorphisme" precedence="ds">
        {STYLES}
      </style>
      <canvas ref={toile} className="csIsoToile" />
      <span className="csIsoFaisceaux" />
      <svg className="csIsoBord" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path ref={trace} />
      </svg>
    </div>
  );
}
