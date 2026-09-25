/**
 * Hero « Tunnel de données » — concept 5/5.
 *
 * Séquence seconde par seconde :
 *   0–1 s    : fond noir, panneau console (SequenceDemarrage) en bas à droite
 *   1–2.6 s  : cible + filaments démarrent en parallèle de la console
 *   2.6 s    : console terminée → titre, chapeau, bouton apparaissent (≤ 3,2 s)
 *   ~2.95 s  : cible verrouillée → caméra recule, réseau neuronal émerge
 *   4 s+     : réseau en rotation lente, tunnel visible en arrière-plan
 *
 * Arbitrages :
 *   - RGAA 4.1 / critère 4.10 : scène aria-hidden, texte toujours dans le DOM
 *   - RGAA 4.1 / critère 13.8 : bouton pause visible dès le démarrage
 *   - Perf / brief : texte visible ≤ 3,2 s (brief impose ce plafond)
 *   - RGESN : scène chargée dynamiquement (ssr:false), rendu suspendu hors écran
 *   - Sécu : aucune dépendance ajoutée
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bouton } from "@/components/console/Bouton";
import { CibleCalibrage } from "../commun/CibleCalibrage";
import { SequenceDemarrage } from "../commun/SequenceDemarrage";

import type { Phase } from "./SceneTunnel";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Chargement différé de la scène                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * La scène Three.js ne se charge qu'après le montage pour ne pas retarder
 * l'affichage du texte et du panneau console (LCP non bloqué).
 */
const SceneTunnel = dynamic(
  () => import("./SceneTunnel").then((m) => m.SceneTunnel),
  { ssr: false, loading: () => null },
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles — mouvement réduit                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * CSS scopé au hero.
 * - Transitions de révélation des textes (contrôlées par data-visible).
 * - Mouvement réduit : texte visible immédiatement, sans transition.
 *   `!important` est nécessaire ici : l'attribut `style` est inline et le
 *   media query doit le supplanter (RGAA 13.8 + WCAG 2.3.3 AAA).
 */
const CSS_TUNNEL = `
.ht-texte {
  transition-property: opacity;
  transition-timing-function: ease;
}
[data-texte-visible="true"] .ht-texte {
  opacity: 1 !important;
}
@media (prefers-reduced-motion: reduce) {
  .ht-texte {
    opacity: 1 !important;
    transition: none !important;
  }
}
`;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Composant                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

export function HeroTunnel() {
  const [phase, setPhase] = useState<Phase>("console");
  const [pause, setPause] = useState(false);
  const [texteVisible, setTexteVisible] = useState(false);
  /** Déclenché à 1 s : cible + filaments démarrent pendant la console. */
  const [tunnelActif, setTunnelActif] = useState(false);

  /* Mouvement réduit : sauter directement à l'état final */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTunnelActif(true);
      setPhase("ambiance");
      setTexteVisible(true);
      return;
    }
    /* À 1 s : activer cible + filaments en parallèle de la console */
    const t = setTimeout(() => setTunnelActif(true), 1000);
    return () => clearTimeout(t);
  }, []);

  /**
   * Fin de la console (2,6 s) :
   *   - texte visible immédiatement (≤ 3,2 s ✓)
   *   - phase "tunnel" pour la scène
   */
  const onConsoleFinie = useCallback(() => {
    setTexteVisible(true);
    setPhase("tunnel");
  }, []);

  const timerAmbianceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Cible verrouillée (~2,95 s) :
   *   - caméra recule, réseau apparaît
   *   - transition vers "ambiance" après 1,8 s
   */
  const onCibleVerrouillee = useCallback(() => {
    setPhase("reseau");
    timerAmbianceRef.current = setTimeout(() => setPhase("ambiance"), 1800);
  }, []);

  useEffect(() => {
    return () => {
      if (timerAmbianceRef.current !== null) clearTimeout(timerAmbianceRef.current);
    };
  }, []);

  const cibleActive = tunnelActif;

  return (
    <section
      className="relative overflow-hidden bg-[#02060d]"
      style={{ height: "100svh", paddingTop: 64 }}
      aria-label="Hero ISOMORPH — Tunnel de données"
    >
      {/* CSS scopé */}
      <style href="hero-tunnel-css" precedence="default">
        {CSS_TUNNEL}
      </style>

      {/* ── Scène 3D (décorative, chargée après montage) ─────────────────── */}
      <div aria-hidden="true" className="absolute inset-0">
        <SceneTunnel phase={phase} pause={pause} tunnelActif={tunnelActif} />
      </div>

      {/* ── Panneau console (bas droite, phase console uniquement) ────────── */}
      {phase === "console" && (
        <div
          aria-hidden="true"
          className="absolute bottom-20 right-4 z-10 w-56 sm:w-72"
        >
          <SequenceDemarrage
            dureeMs={2600}
            variante="panneau"
            onFini={onConsoleFinie}
          />
        </div>
      )}

      {/* ── Cible de calibrage (centrage axe du tunnel) ───────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <CibleCalibrage
          demarrer={cibleActive}
          couleur="#7dd3fc"
          onVerrouillee={onCibleVerrouillee}
          className="h-44 w-44 sm:h-56 sm:w-56 lg:h-64 lg:w-64"
        />
      </div>

      {/* ── Texte principal (présent dans le HTML serveur dès le départ) ──── */}
      <div
        className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24"
        data-texte-visible={texteVisible ? "true" : "false"}
        style={{ maxWidth: "min(50rem, 52%)" }}
      >
        {/*
         * h1 en petites capitales : intitulé de la discipline.
         * Délai 0 s — premier élément à apparaître.
         */}
        <h1
          className="ht-texte type-caption mb-3 font-semibold tracking-widest text-[#7dd3fc]"
          style={{
            opacity: texteVisible ? 1 : 0,
            transitionDuration: "0.55s",
            transitionDelay: "0s",
            fontVariant: "small-caps",
          }}
        >
          Développement web et référencement
        </h1>

        {/* h2 : accroche principale (type-hero = 30→45 px, poids 300). */}
        <h2
          className="ht-texte type-hero mb-5 text-white"
          style={{
            opacity: texteVisible ? 1 : 0,
            transitionDuration: "0.8s",
            transitionDelay: "0.15s",
          }}
        >
          Dépassez les limites
        </h2>

        {/* Chapeau */}
        <p
          className="ht-texte type-lead mb-8 text-slate-400"
          style={{
            opacity: texteVisible ? 1 : 0,
            transitionDuration: "0.8s",
            transitionDelay: "0.4s",
          }}
        >
          Sites, applications, outils métier. Nous concevons des solutions
          digitales durables, dont les résultats se mesurent.
        </p>

        {/* CTA */}
        <div
          className="ht-texte"
          style={{
            opacity: texteVisible ? 1 : 0,
            transitionDuration: "0.8s",
            transitionDelay: "0.65s",
          }}
        >
          <Bouton href="https://isomorph.fr/contact" taille="l">
            Démarrer un projet
          </Bouton>
        </div>
      </div>

      {/* ── Bouton pause (RGAA 13.8 : animation > 5 s, contrôle obligatoire) */}
      <button
        type="button"
        aria-label={pause ? "Reprendre l'animation" : "Mettre en pause l'animation"}
        onClick={() => setPause((p) => !p)}
        className="absolute bottom-4 right-4 z-20 rounded-sm border border-[#7dd3fc]/25 bg-[#02060d]/65 px-3 py-1.5 text-xs text-[#7dd3fc]/60 transition-colors hover:border-[#7dd3fc]/55 hover:text-[#7dd3fc]"
        style={{ outline: "none" }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#7dd3fc";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(125,211,252,0.25)";
        }}
      >
        {pause ? "Reprendre" : "Pause"}
      </button>
    </section>
  );
}
