/**
 * Canvas des fonds en relief statiques : dessin unique à l'approche de
 * l'écran, redessin seulement quand la taille change (différé de 150 ms).
 * Aucune boucle, aucun coût en continu.
 *
 * Le serveur rend un canvas vide et le premier rendu navigateur est
 * identique : le dessin n'a lieu qu'après le montage.
 */

import { useEffect } from "react";
import type { RefObject } from "react";

/** Ce que reçoit une fonction de dessin : contexte déjà mis à l'échelle, taille en pixels CSS. */
export interface Surface {
  ctx: CanvasRenderingContext2D;
  largeur: number;
  hauteur: number;
  densite: number;
}

export type Dessin = (surface: Surface) => void;

/** Délai de redessin après un changement de taille, en millisecondes. */
const DELAI_TAILLE = 150;

/**
 * Branche un dessin statique sur un canvas. `dessiner` doit être une fonction
 * stable (définie hors du composant). La durée du dernier calcul est écrite
 * dans l'attribut `data-ms` du canvas.
 */
export function useToileStatique(ref: RefObject<HTMLCanvasElement | null>, dessiner: Dessin): void {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let largeur = 0;
    let hauteur = 0;
    let densite = 0;
    let minuterie = 0;
    let lance = false;

    const peindre = () => {
      const l = Math.round(canvas.clientWidth);
      const h = Math.round(canvas.clientHeight);
      // Densité plafonnée à 2 : au delà, beaucoup plus de pixels pour un gain invisible.
      const d = Math.min(2, window.devicePixelRatio || 1);
      if (l === 0 || h === 0 || (l === largeur && h === hauteur && d === densite)) return;
      largeur = l;
      hauteur = h;
      densite = d;

      const debut = performance.now();
      canvas.width = Math.round(l * d);
      canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      dessiner({ ctx, largeur: l, hauteur: h, densite: d });
      // En développement, la lecture d'un pixel force le tracé réel : la mesure le compte.
      if (process.env.NODE_ENV === "development") ctx.getImageData(0, 0, 1, 1);
      canvas.dataset.ms = (performance.now() - debut).toFixed(1);
    };

    const taille = new ResizeObserver(() => {
      if (!lance) return;
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(peindre, DELAI_TAILLE);
    });

    const guet = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        guet.disconnect();
        lance = true;
        peindre();
      },
      { rootMargin: "300px" },
    );

    guet.observe(canvas);
    taille.observe(canvas);
    return () => {
      guet.disconnect();
      taille.disconnect();
      window.clearTimeout(minuterie);
    };
  }, [ref, dessiner]);
}
