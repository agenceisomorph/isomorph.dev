/**
 * Moteur des fonds animés dessinés sur canvas (Crêtes en marche).
 *
 * Chaque fond décrit une scène (taille, image suivante, image fixe) ; ce
 * module s'occupe du reste :
 * - densité de pixels plafonnée à 1,5 ;
 * - 30 images par seconde, pas plus : un fond n'a pas besoin de davantage ;
 * - boucle arrêtée hors écran (IntersectionObserver) et onglet masqué
 *   (visibilitychange), reprise sans saut car le temps de la scène n'avance
 *   que pendant la boucle ;
 * - mouvement réduit écouté en direct : une image fixe, aucune boucle
 *   (RGAA, critère 13.8) ;
 * - changement de taille recalculé 150 ms après le dernier événement ;
 * - en développement, temps moyen de dessin d'une image dans
 *   `data-ms-image` et état de la boucle dans `data-etat` sur le canvas.
 *
 * Le serveur rend un canvas vide ; rien n'est dessiné avant le montage, le
 * premier rendu navigateur est donc identique à celui du serveur.
 *
 * Fichier sans directive « use client » : il n'est importé que par des
 * composants client.
 */

import { useEffect, useRef } from "react";

export type Rgb = readonly [number, number, number];

/** Jetons de couleur Console lus sur la page, plus le fond réellement peint sous le canvas. */
export interface CouleursConsole {
  fond: Rgb;
  neon: Rgb;
  neonVif: Rgb;
}

/** Une scène : ce qu'un fond sait faire, le moteur décide quand. */
export interface Scene {
  /** Taille connue ou changée (pixels CSS). Tout ce qui en dépend se recalcule ici. */
  dimensionner(largeur: number, hauteur: number, dpr: number): void;
  /** Avance de `dt` secondes puis dessine. `dt` vaut 0 pour repeindre l'instant courant. */
  image(dt: number): void;
  /** Image fixe du mouvement réduit. La boucle reprendra depuis cet instant. */
  fixe(): void;
}

export type FabriqueScene = (ctx: CanvasRenderingContext2D, couleurs: CouleursConsole) => Scene;

const DPR_MAX = 1.5;
const IMAGES_PAR_SECONDE = 30;
const DELAI_TAILLE = 150;
/** Au-delà, l'écart est une pause (onglet repris, machine chargée), pas du temps écoulé. */
const DT_MAX = 1 / 15;
const IMAGES_PAR_MESURE = 60;

/** Valeurs par défaut, identiques aux jetons de `fondations.tsx`. */
const REPLI: CouleursConsole = {
  fond: [2, 6, 13],
  neon: [125, 211, 252],
  neonVif: [56, 189, 248],
};

export function rgba(c: Rgb, a: number): string {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}

/** Lit une couleur CSS calculée (#rgb, #rrggbb, rgb(), rgba()). Renvoie `null` si transparente ou illisible. */
export function lireCouleur(valeur: string): Rgb | null {
  const v = valeur.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? v.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : v;
    if (hex.length !== 7) return null;
    const n = Number.parseInt(hex.slice(1), 16);
    return Number.isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && Number.parseFloat(m[4]) === 0) return null;
  return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
}

/**
 * Jetons Console et fond réel : le premier ancêtre qui peint un fond opaque.
 * Les Crêtes remplissent avec cette couleur pour masquer les lignes de
 * derrière ; elle doit donc être exactement celle de la section.
 */
function lireCouleurs(element: HTMLElement): CouleursConsole {
  const style = getComputedStyle(element);
  const jeton = (nom: string, repli: Rgb) => lireCouleur(style.getPropertyValue(nom)) ?? repli;
  let fond: Rgb | null = null;
  for (let el: HTMLElement | null = element; el && !fond; el = el.parentElement) {
    fond = lireCouleur(getComputedStyle(el).backgroundColor);
  }
  return {
    fond: fond ?? jeton("--cs-fond", REPLI.fond),
    neon: jeton("--cs-neon", REPLI.neon),
    neonVif: jeton("--cs-neon-vif", REPLI.neonVif),
  };
}

/** Branche une scène sur un canvas. Renvoie la fonction de démontage. */
export function monterToile(canvas: HTMLCanvasElement, fabriquer: FabriqueScene): () => void {
  const ctx = canvas.getContext("2d");
  const conteneur = canvas.parentElement;
  if (!ctx || !conteneur) return () => undefined;

  const dev = process.env.NODE_ENV !== "production";
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scene = fabriquer(ctx, lireCouleurs(conteneur));
  const intervalle = 1000 / IMAGES_PAR_SECONDE;

  let largeur = 0;
  let hauteur = 0;
  let dpr = 1;
  let boucleEnCours = 0;
  let precedent = 0;
  let dansLeCadre = false;
  let visible = document.visibilityState === "visible";
  let minuterie = 0;
  let cumul = 0;
  let compte = 0;

  /** Relit la taille du conteneur. Vrai si elle a changé (le canvas est alors vidé). */
  const mesurer = (): boolean => {
    const l = conteneur.clientWidth;
    const h = conteneur.clientHeight;
    const d = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    if (l === 0 || h === 0 || (l === largeur && h === hauteur && d === dpr)) return false;
    largeur = l;
    hauteur = h;
    dpr = d;
    canvas.width = Math.round(l * d);
    canvas.height = Math.round(h * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    scene.dimensionner(l, h, d);
    return true;
  };

  const dessiner = (dt: number) => {
    if (!dev) {
      scene.image(dt);
      return;
    }
    const debut = performance.now();
    scene.image(dt);
    cumul += performance.now() - debut;
    compte += 1;
    if (compte === IMAGES_PAR_MESURE) {
      canvas.dataset.msImage = (cumul / compte).toFixed(3);
      cumul = 0;
      compte = 0;
    }
  };

  const boucle = (maintenant: number) => {
    boucleEnCours = window.requestAnimationFrame(boucle);
    if (precedent === 0) {
      precedent = maintenant;
      dessiner(0);
      return;
    }
    const ecart = maintenant - precedent;
    // Tolérance de 2 ms : sur un écran à 60 Hz, une image sur deux passe.
    if (ecart < intervalle - 2) return;
    precedent = maintenant;
    dessiner(Math.min(ecart / 1000, DT_MAX));
  };

  const demarrer = () => {
    if (boucleEnCours !== 0) return;
    precedent = 0;
    boucleEnCours = window.requestAnimationFrame(boucle);
    if (dev) canvas.dataset.etat = "marche";
  };

  const arreter = () => {
    if (boucleEnCours !== 0) {
      window.cancelAnimationFrame(boucleEnCours);
      boucleEnCours = 0;
    }
    if (dev) canvas.dataset.etat = "arret";
  };

  const synchroniser = () => {
    if (dansLeCadre && visible && !reduit.matches && largeur > 0) {
      demarrer();
      return;
    }
    arreter();
    if (reduit.matches && largeur > 0) scene.fixe();
  };

  const observateurTaille = new ResizeObserver(() => {
    window.clearTimeout(minuterie);
    minuterie = window.setTimeout(() => {
      if (!mesurer()) return;
      // Le canvas vient d'être vidé : repeindre tout de suite, sans attendre l'image suivante.
      if (reduit.matches) scene.fixe();
      else scene.image(0);
    }, DELAI_TAILLE);
  });

  const observateurCadre = new IntersectionObserver(
    (entrees) => {
      dansLeCadre = entrees.some((e) => e.isIntersecting);
      synchroniser();
    },
    { rootMargin: "64px" },
  );

  const surVisibilite = () => {
    visible = document.visibilityState === "visible";
    synchroniser();
  };

  mesurer();
  if (reduit.matches) scene.fixe();
  observateurTaille.observe(conteneur);
  observateurCadre.observe(conteneur);
  document.addEventListener("visibilitychange", surVisibilite);
  reduit.addEventListener("change", synchroniser);

  return () => {
    arreter();
    window.clearTimeout(minuterie);
    observateurTaille.disconnect();
    observateurCadre.disconnect();
    document.removeEventListener("visibilitychange", surVisibilite);
    reduit.removeEventListener("change", synchroniser);
  };
}

/** Branche une scène sur le canvas référencé, après le montage. */
export function useToile(fabriquer: FabriqueScene) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return monterToile(canvas, fabriquer);
  }, [fabriquer]);
  return ref;
}
