"use client";

/**
 * Pilote de la section Parallaxe en relief : écrit l'avancement du défilement
 * dans la variable `--p` de la section, entre 0 et 1. Les plans se déplacent
 * en CSS à partir de cette seule valeur.
 *
 * « use client », justifié : lecture de la position au défilement.
 *
 * - Parallaxe ordinaire : 0 quand le haut de la section paraît en bas de
 *   l'écran, 0,5 quand elle est centrée, 1 quand son bas sort par le haut.
 * - Parallaxe épinglée (`data-epingle`) : 0 quand la scène se fige en haut de
 *   l'écran, 1 quand elle repart.
 *
 * Une lecture par image au plus, et seulement quand la section est à l'écran.
 * Mouvement réduit : aucun calcul, la feuille de style tient les plans
 * immobiles (critère RGAA 13.8).
 */

import { useEffect, useRef } from "react";

const borner = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export function PiloteParallaxe() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>("[data-parallaxe]");
    if (!section) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    const epingle = section.hasAttribute("data-epingle");
    let image = 0;
    let visible = false;

    const mesurer = () => {
      image = 0;
      const r = section.getBoundingClientRect();
      const h = window.innerHeight;
      const p = epingle ? borner(-r.top / Math.max(1, r.height - h)) : borner((h - r.top) / (h + r.height));
      section.style.setProperty("--p", p.toFixed(4));
    };
    const demander = () => {
      if (image || !visible || reduit.matches) return;
      image = window.requestAnimationFrame(mesurer);
    };

    // Première lecture au montage : la section entre à l'écran déjà à sa place.
    if (!reduit.matches) mesurer();

    const obs = new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting;
      demander();
    });
    obs.observe(section);
    window.addEventListener("scroll", demander, { passive: true });
    window.addEventListener("resize", demander);

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", demander);
      window.removeEventListener("resize", demander);
      window.cancelAnimationFrame(image);
      section.style.removeProperty("--p");
    };
  }, []);

  return <span ref={ref} hidden />;
}
