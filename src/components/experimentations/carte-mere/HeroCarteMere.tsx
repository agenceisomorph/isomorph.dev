"use client";

/**
 * Hero « Carte mère » — vol rapide à basse altitude au-dessus d'une carte
 * mère procédurale, puis atterrissage sur la puce principale.
 *
 * Chronologie (timers indépendants, texte garanti <= 3,2 s) :
 *  0,0 s  -- caméra file, carte éteinte, séquence console démarre
 *  1,0 s  -- CibleCalibrage démarre (se verrouille vers 2,95 s)
 *  1,2 s  -- pistes s'allument (phase "allumage"), caméra ralentit
 *  2,6 s  -- console terminée
 *  ~2,95 s -- cible verrouillée -> phase "actif" -> texte fondu CSS
 *  3,2 s  -- texte entièrement visible (dernier délai 0,46 s + 0,72 s)
 *  3,2 s+ -- caméra continue de se poser, ambiance calme
 *
 * RGAA 4.1 :
 *  - h1, p, p, bouton dans le DOM dès le SSR (invisible par CSS, pas par JS).
 *  - Scène aria-hidden.
 *  - Bouton pause clavier (RGAA 13.8).
 *  - Voile sombre localisé à gauche garantit contraste >= 4,5:1.
 *  - Mouvement réduit : texte visible immédiatement, scène figée.
 *
 * Éco-conception :
 *  - Scène chargée après montage (dynamic ssr:false).
 *  - IntersectionObserver : pause rendu hors écran (prop enPause).
 *  - Onglet masqué : pause automatique.
 *
 * Hydratation :
 *  - Le div canvas est TOUJOURS dans le DOM (pas de rendu conditionnel).
 *  - CarteMereToile est dynamic(ssr:false) -> null côté serveur, chargé côté
 *    client après hydratation : le div vide en SSR coïncide avec le div vide
 *    au premier rendu client.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bouton } from "@/components/console/Bouton";
import { CibleCalibrage } from "../commun/CibleCalibrage";
import { SequenceDemarrage } from "../commun/SequenceDemarrage";

// Chargé côté navigateur uniquement (WebGL)
const CarteMereToile = dynamic(
  () => import("./CarteMereToile").then((m) => m.CarteMereToile),
  { ssr: false }
);

type Phase = "demarrage" | "allumage" | "actif";

const STYLES = `
/* Voile dégradé côté gauche -- contraste texte garanti */
.hcm-voile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(2,10,18,0.95) 0%,
    rgba(2,10,18,0.90) 42%,
    rgba(2,10,18,0.55) 62%,
    rgba(2,10,18,0) 100%
  );
  pointer-events: none;
}

/* Apparition CSS uniquement (pas de rendu conditionnel) */
.hcm-f  { opacity: 0; transform: translateY(10px);
           transition: opacity 0.72s ease, transform 0.72s ease; }
.hcm-f.hcm-on { opacity: 1; transform: none; }
.hcm-f-1 { transition-delay: 0.12s; }
.hcm-f-2 { transition-delay: 0.28s; }
.hcm-f-3 { transition-delay: 0.46s; }

/* Mouvement réduit : texte immédiatement visible */
@media (prefers-reduced-motion: reduce) {
  .hcm-f { opacity: 1 !important; transform: none !important;
            transition: none !important; }
}

/* Mobile : fond CSS, pas de WebGL */
@media (max-width: 767px) {
  .hcm-canvas { display: none; }
  .hcm-bg-mobile {
    display: block !important;
    background:
      radial-gradient(ellipse 70% 50% at 65% 55%, rgba(0,200,255,0.07) 0%, transparent 65%),
      linear-gradient(180deg, #020a12 0%, #041624 100%);
    position: absolute; inset: 0;
  }
}
.hcm-bg-mobile { display: none; }

/* Bouton pause RGAA 13.8 */
.hcm-pause { cursor: pointer; font-size: 10px; letter-spacing: 0.1em;
              text-transform: uppercase; outline: none; }
.hcm-pause:focus-visible { border-color: #7dd3fc;
                            box-shadow: inset 0 0 0 1px #7dd3fc; }

.hcm-h1 { font-variant: small-caps; }
`;

export function HeroCarteMere() {
  const [phase, setPhase] = useState<Phase>("demarrage");
  const [enPause, setEnPause] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(true); // pause prop, pas montage conditionnel
  const [cibleDemarre, setCibleDemarre] = useState(false);
  const refSection = useRef<HTMLElement>(null);

  /* IntersectionObserver -- passe la visibilité à CarteMereToile via enPause */
  useEffect(() => {
    const el = refSection.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setSceneVisible(entry?.isIntersecting ?? true),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Pause quand l'onglet est masqué */
  useEffect(() => {
    const onVis = () => { if (document.hidden) setEnPause(true); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* Timers indépendants :
   *  1,0 s : CibleCalibrage démarre (verrouillage ~2,95 s -> texte)
   *  1,2 s : pistes s'allument (phase allumage)
   */
  useEffect(() => {
    const tCible = window.setTimeout(() => setCibleDemarre(true), 1000);
    const tAllu  = window.setTimeout(() => setPhase("allumage"), 1200);
    return () => {
      window.clearTimeout(tCible);
      window.clearTimeout(tAllu);
    };
  }, []);

  // Appelé à 2,6 s : pas dans le chemin critique du texte
  const surFinDemarrage = useCallback(() => {}, []);

  // Cible verrouillée (~2,95 s) -> texte visible
  const surVerrouillee = useCallback(() => setPhase("actif"), []);

  const actif = phase === "actif";
  const pauseEffective = enPause || !sceneVisible;

  return (
    <section
      ref={refSection}
      aria-label="Hero animé -- carte mère"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", background: "#020a12" }}
    >
      <style>{STYLES}</style>

      <div className="hcm-bg-mobile" aria-hidden="true" />

      {/* Canvas toujours dans le DOM (pas de rendu conditionnel = pas de
          mismatch d'hydratation). CarteMereToile est dynamic(ssr:false),
          il rend null côté serveur et se charge après hydratation. */}
      <div className="hcm-canvas absolute inset-0" aria-hidden="true">
        <CarteMereToile phase={phase} enPause={pauseEffective} />
      </div>

      {/* Console -- bas gauche, z-20 > canvas (pas de z-index) */}
      <SequenceDemarrage
        variante="panneau"
        dureeMs={2600}
        onFini={surFinDemarrage}
        className="absolute bottom-20 left-6 z-20"
      />

      {/* Cible de calibrage -- conteneur carré 560 px dans la moitié droite.
       *  Tailles responsives pour garantir pas de chevauchement avec le texte
       *  à 1024, 1280 et 1440 px (voile texte = 54 % de la largeur).
       *  lg  (>= 1024) : gauche 57 % = 584 px > colonne texte 553 px, taille 360 px
       *  xl  (>= 1280) : gauche 57 % = 730 px > 691 px, taille 500 px
       *  2xl (>= 1440) : gauche 57 % = 821 px > 778 px, taille 560 px
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[57%] top-1/2 z-20 -translate-y-1/2
                   h-[360px] w-[360px]
                   xl:h-[500px] xl:w-[500px]
                   2xl:h-[560px] 2xl:w-[560px]"
      >
        <CibleCalibrage
          demarrer={cibleDemarre}
          couleur="#7dd3fc"
          onVerrouillee={surVerrouillee}
        />
      </div>

      {/* Voile + texte -- gauche, z-30 > cible z-20 */}
      <div
        className="hcm-voile absolute inset-y-0 left-0 z-30 flex w-full items-center lg:w-[54%]"
        role="presentation"
      >
        <div className="relative px-8 pt-16 sm:px-12 md:px-16 lg:px-20">
          <h1
            className={`hcm-h1 hcm-f mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#7dd3fc]${actif ? " hcm-on" : ""}`}
          >
            Développement web et référencement
          </h1>

          <p
            className={`hcm-f hcm-f-1 type-hero font-semibold text-white${actif ? " hcm-on" : ""}`}
          >
            Dépassez les limites
          </p>

          <p
            className={`hcm-f hcm-f-2 type-lead mt-5 text-[rgba(125,211,252,0.78)]${actif ? " hcm-on" : ""}`}
          >
            Sites, applications, outils métier. Nous concevons des solutions
            digitales durables, dont les résultats se mesurent.
          </p>

          <div className={`hcm-f hcm-f-3 mt-8${actif ? " hcm-on" : ""}`}>
            <Bouton href="https://isomorph.fr/contact" taille="l">
              Démarrer un projet
            </Bouton>
          </div>
        </div>
      </div>

      {/* Bouton pause -- RGAA 13.8 */}
      <button
        type="button"
        className="hcm-pause absolute bottom-4 right-4 z-50 rounded-sm border border-[rgba(125,211,252,0.25)] bg-[#020a12]/80 px-3 py-1.5 text-[#7dd3fc] backdrop-blur-sm transition-colors hover:border-[rgba(125,211,252,0.6)]"
        onClick={() => setEnPause((p) => !p)}
        aria-label={enPause ? "Reprendre l'animation" : "Mettre en pause l'animation"}
      >
        {enPause ? "Reprendre" : "Mettre en pause l'animation"}
      </button>
    </section>
  );
}
