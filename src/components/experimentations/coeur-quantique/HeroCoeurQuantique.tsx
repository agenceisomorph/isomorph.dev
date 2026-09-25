"use client";

/**
 * Hero « Cœur quantique » — proposition n°2 pour l'accueil isomorph.fr.
 *
 * Concept : au centre de l'écran (légèrement à droite sur grand écran),
 * un noyau d'énergie instable entouré d'anneaux de confinement inclinés
 * (gyroscope / tokamak), traversé d'arcs électriques rares, avec un nuage
 * de particules en orbite. La console en haut à droite monte la puissance ;
 * la cible se verrouille sur le noyau au moment de l'allumage.
 *
 * Arbitrages :
 * - RGAA 4.1 : texte dans le DOM serveur dès le chargement (critère 1.1, 9.1) ;
 *   scène aria-hidden ; bouton pause explicite (critère 13.8).
 * - Éco : scène 3D chargée après montage (import dynamique) ; fond CSS tient
 *   la place ; IntersectionObserver arrête le rendu hors écran.
 * - Perf : texte animé en CSS pur (pas de JS) ; Core Web Vitals non impactés.
 * - Sécu : aucun accès réseau côté client, aucune donnée sensible.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bouton } from "@/components/console/Bouton";
import { CibleCalibrage } from "../commun/CibleCalibrage";
import { SequenceDemarrage } from "../commun/SequenceDemarrage";

/** Scène 3D chargée uniquement côté client, après le montage. */
const SceneCoeurQuantique = dynamic(
  () =>
    import("./SceneCoeurQuantique").then((m) => m.SceneCoeurQuantique),
  { ssr: false },
);

type Phase = 0 | 1 | 2 | 3;

// ─── Styles CSS inline ─────────────────────────────────────────────────────

/**
 * Styles isolés dans le composant (pas de globals) pour éviter les collisions
 * entre les cinq heros montés sur la planche.
 */
const STYLES = `
/* Fond radial pendant le chargement de la scène */
.hcq-fond {
  background: radial-gradient(ellipse 55% 55% at 64% 50%, #081525 0%, #02060d 68%);
}

/*
 * Cible centrée exactement sur le noyau.
 * La caméra pointe sur l'origine (0,0,0) avec camera.lookAt à chaque frame :
 * le noyau projette toujours à 50 %, 50 % du canvas quelle que soit la
 * largeur d'écran ou la phase (la caméra plonge mais reste centrée sur lui).
 */
.hcq-cible {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
}
@media (max-width: 768px) {
  .hcq-cible { width: 180px; height: 180px; }
}

/* Apparition du texte : fondu + glissement (≤ 3,2 s au total) */
.hcq-t1,
.hcq-t2,
.hcq-t3,
.hcq-t4 {
  opacity: 0;
  transform: translateY(10px);
  animation: hcqFadeUp 0.55s ease forwards;
}
.hcq-t1 { animation-delay: 0.15s; }
.hcq-t2 { animation-delay: 0.45s; }
.hcq-t3 { animation-delay: 0.85s; }
.hcq-t4 { animation-delay: 1.35s; }

@keyframes hcqFadeUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Mouvement réduit : texte immédiatement visible, scène figée */
@media (prefers-reduced-motion: reduce) {
  .hcq-t1,
  .hcq-t2,
  .hcq-t3,
  .hcq-t4 {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
`;

// ─── Composant ────────────────────────────────────────────────────────────────

export function HeroCoeurQuantique() {
  const [phase, setPhase]     = useState<Phase>(0);
  const [paused, setPaused]   = useState(false);
  const [inView, setInView]   = useState(true);
  const [isMobile, setMobile] = useState(false);
  const conteneurRef          = useRef<HTMLDivElement>(null);

  /* Détection mobile et mouvement réduit au montage */
  useEffect(() => {
    setMobile(window.innerWidth < 768);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* Mouvement réduit : scène figée à l'état final */
      setPhase(3);
    }
  }, []);

  /* Arrêt du rendu quand la section sort de l'écran */
  useEffect(() => {
    const el = conteneurRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(!!entry.isIntersecting),
      { threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Pause automatique quand l'onglet est masqué */
  useEffect(() => {
    const handler = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  /**
   * La console a fini → les anneaux démarrent (phase 1).
   * Utilise la forme fonctionnelle pour éviter les closures périmées.
   */
  const handleConsoleFinie = useCallback(
    () => setPhase((p) => (p < 1 ? 1 : p)),
    [],
  );

  /** La cible est verrouillée → allumage (phase 2). */
  const handleVerrouillee = useCallback(
    () => setPhase((p) => (p < 2 ? 2 : p)),
    [],
  );

  /** La scène signale la fin du flash → ambiance (phase 3). */
  const handlePhase3 = useCallback(
    () => setPhase((p) => (p < 3 ? 3 : p)),
    [],
  );

  return (
    <section
      ref={conteneurRef}
      className="relative h-svh w-full overflow-hidden bg-[#02060d]"
      aria-label="Présentation — Développement web et référencement"
    >
      {/* Styles du hero (isolés, sans collision avec les autres heros) */}
      <style>{STYLES}</style>

      {/* Fond radial CSS — tient la place pendant le chargement de la scène */}
      <div className="hcq-fond pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Scène 3D : aria-hidden car purement décorative */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <SceneCoeurQuantique
          phase={phase}
          paused={paused || !inView}
          isMobile={isMobile}
          onPhase3={handlePhase3}
        />
      </div>

      {/*
       * Console de démarrage : panneau en haut à droite (moniteur d'amorçage).
       * Enveloppée dans un div positionneur pour éviter le conflit entre
       * le `relative` interne de SequenceDemarrage et l'`absolute` du placement.
       * Marge droite 24 px, sous la barre fixe de 64 px (top-20 = 80 px).
       */}
      <div className="absolute right-6 top-20 z-10">
        <SequenceDemarrage
          dureeMs={2800}
          variante="panneau"
          onFini={handleConsoleFinie}
        />
      </div>

      {/*
       * Cible de calibrage centrée sur le noyau.
       * demarrer=true dès la phase 1 ; elle se verrouille après ~1,6 s
       * et déclenche l'allumage (phase 2).
       */}
      <CibleCalibrage
        demarrer={phase >= 1}
        couleur="#7dd3fc"
        onVerrouillee={handleVerrouillee}
        className="hcq-cible pointer-events-none absolute z-10"
      />

      {/*
       * Texte côté gauche — présent dans le HTML serveur dès le chargement
       * (RGAA critères 1.1 et 9.1). L'apparition est une animation CSS :
       * le texte est dans le DOM même avant d'être visible.
       *
       * h1 : surtitre en petites capitales (critère de l'échelle type-*).
       * h2 : accroche principale avec type-hero.
       */}
      <div className="absolute left-0 top-0 z-20 flex h-full flex-col justify-center px-8 pb-20 pt-24 sm:px-12 lg:max-w-[48%] lg:px-16">
        <h1 className="hcq-t1 type-caption mb-3 uppercase tracking-[0.22em] text-white/55">
          Développement web et référencement
        </h1>
        <h2 className="hcq-t2 type-hero text-white">
          Dépassez les limites
        </h2>
        <p className="hcq-t3 type-lead mt-7 max-w-[420px] text-white/70">
          Sites, applications, outils métier. Nous concevons des solutions digitales durables, dont les résultats se mesurent.
        </p>
        <div className="hcq-t4 mt-9">
          <Bouton href="https://isomorph.fr/contact" taille="l">Démarrer un projet</Bouton>
        </div>
      </div>

      {/*
       * Bouton pause — RGAA critère 13.8 (animation > 5 s).
       * Focus visible par la couleur de bordure (jamais un anneau outline).
       */}
      <button
        type="button"
        aria-pressed={paused}
        aria-label={
          paused ? "Reprendre l'animation" : "Mettre en pause l'animation"
        }
        className="absolute bottom-5 right-5 z-30 rounded-sm border border-white/15 bg-[#02060d]/70 px-3 py-1.5 text-[11px] text-white/50 backdrop-blur-sm transition-colors focus-visible:border-[#7dd3fc]/60 focus-visible:text-white/80 hover:border-[#7dd3fc]/40 hover:text-white/80"
        style={{ outline: "none" }}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? "Reprendre" : "Pause"}
      </button>
    </section>
  );
}
