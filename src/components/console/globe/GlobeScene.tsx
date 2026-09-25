"use client";

/*
 * Client Component justifié : WebGL, observateurs de visibilité et glisser au
 * pointeur n'existent que dans le navigateur. Le rendu serveur se limite à un
 * conteneur vide, identique au premier rendu navigateur.
 */

import { useEffect, useRef } from "react";

import type { MoteurGlobe } from "./moteur";

/** Marge d'anticipation : three.js se charge avant que le bloc n'entre à l'écran. */
const MARGE_CHARGEMENT = "600px 0px";

/**
 * Scène WebGL du globe. Charge le moteur à l'approche du bloc, ne fait
 * tourner la boucle qu'à l'écran et onglet visible, suit le mouvement réduit
 * et libère la mémoire WebGL au démontage. Si WebGL manque, le cadre reste
 * vide et l'habillage suffit.
 */
export function GlobeScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conteneur = ref.current;
    if (!conteneur) return;

    let moteur: MoteurGlobe | null = null;
    let annule = false;
    let aLEcran = false;
    const requete = window.matchMedia("(prefers-reduced-motion: reduce)");

    const synchroniser = () => {
      if (!moteur) return;
      moteur.definirMouvementReduit(requete.matches);
      moteur.activer(aLEcran && document.visibilityState === "visible");
    };

    const approche = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return;
        approche.disconnect();
        import("./moteur")
          .then(({ creerMoteur }) => {
            if (annule) return;
            moteur = creerMoteur(conteneur, requete.matches);
            synchroniser();
          })
          .catch(() => {
            /* WebGL indisponible ou chargement interrompu : décor absent, rien d'autre. */
          });
      },
      { rootMargin: MARGE_CHARGEMENT },
    );

    const vue = new IntersectionObserver((entrees) => {
      const derniere = entrees[entrees.length - 1];
      if (!derniere) return;
      aLEcran = derniere.isIntersecting;
      synchroniser();
    });

    const taille = new ResizeObserver(() => moteur?.redimensionner());

    approche.observe(conteneur);
    vue.observe(conteneur);
    taille.observe(conteneur);
    document.addEventListener("visibilitychange", synchroniser);
    requete.addEventListener("change", synchroniser);

    return () => {
      annule = true;
      approche.disconnect();
      vue.disconnect();
      taille.disconnect();
      document.removeEventListener("visibilitychange", synchroniser);
      requete.removeEventListener("change", synchroniser);
      moteur?.detruire();
      moteur = null;
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={className} />;
}
