"use client";

/**
 * Hero « Montagnes russes » — isomorph.fr
 *
 * Concept : une impulsion électrique embarquée sur un rail (CatmullRomCurve3)
 * traverse le circuit en ~7 s, de la piste cuivre jusqu'au cœur du réseau
 * neuronal, puis la caméra recule pour la vue d'ensemble en orbite lente.
 *
 * Phases :
 *   0 (0-2,2 s)  : Tunnel — séquence console plein cadre.
 *   1 (2,2-4 s)  : Circuit — texte s'allume sur voile sombre (≤ 3,15 s).
 *   2 (4-6 s)    : Réseau — cible de calibrage active.
 *   3 (7 s+)     : Vue d'ensemble — orbite lente, boucle d'ambiance.
 *
 * Accessibilité :
 *   RGAA 1.2  : scène aria-hidden (décor pur).
 *   RGAA 13.8 : bouton « Mettre en pause l'animation » / « Reprendre ».
 *   Mouvement réduit : état final par CSS, texte visible sans délai.
 *
 * Eco-conception :
 *   Le texte est dans le HTML serveur dès le premier rendu (SSR).
 *   Le canvas est chargé dynamiquement (ssr: false), absent du rendu serveur.
 *   Le canvas est suspendu hors écran (IntersectionObserver) et onglet masqué.
 *
 * Sécurité :
 *   Aucune dépendance ajoutée. Aucun appel réseau.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bouton } from "@/components/console/Bouton";
import { CibleCalibrage } from "../commun/CibleCalibrage";
import { SequenceDemarrage } from "../commun/SequenceDemarrage";

/* Canvas Three.js — chargé uniquement côté navigateur. */
const SceneMontagnesRusses = dynamic(
  () => import("./SceneMontagnesRusses").then((m) => m.SceneMontagnesRusses),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/* Styles déclaratifs                                                   */
/* ------------------------------------------------------------------ */

/**
 * Keyframes CSS pour l'apparition du texte.
 * Les délais garantissent une visibilité complète à 3,15 s au plus tard.
 * Mouvement réduit : la media query annule l'animation et force opacity 1.
 */
const STYLES = `
  @keyframes mrSurgi {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }

  /* Conteneur de la colonne texte : required pour cqi de type-hero. */
  .mr-colonne { container-type: inline-size; }

  .mr-h1 {
    opacity: 0;
    animation: mrSurgi 600ms 2500ms ease-out forwards;
  }
  .mr-h2 {
    opacity: 0;
    animation: mrSurgi 700ms 2750ms ease-out forwards;
  }
  .mr-chapeau {
    opacity: 0;
    animation: mrSurgi 700ms 2950ms ease-out forwards;
  }
  .mr-cta {
    opacity: 0;
    animation: mrSurgi 600ms 3100ms ease-out forwards;
  }

  @media (prefers-reduced-motion: reduce) {
    .mr-h1, .mr-h2, .mr-chapeau, .mr-cta {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

export function HeroMontagnesRusses() {
  const [enPause, setEnPause]         = useState(false);
  const [horsEcran, setHorsEcran]     = useState(false);
  const [sequenceFinie, setSequence]  = useState(false);
  const [cibleActive, setCible]       = useState(false);

  const heroRef = useRef<HTMLElement>(null);

  /* Cible de calibrage à l'approche du réseau (phase 2, ~4 s). */
  useEffect(() => {
    const t = window.setTimeout(() => setCible(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  /* Arrêter le rendu quand le hero sort du viewport. */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHorsEcran(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const basculerPause = useCallback(() => setEnPause((p) => !p), []);
  const pauseLabel = enPause ? "Reprendre l'animation" : "Mettre en pause l'animation";
  const scenePausee = enPause || horsEcran;

  return (
    <section
      ref={heroRef}
      aria-label="Développement web et référencement"
      className="relative w-full overflow-hidden bg-[#02060d]"
      style={{ height: "100svh", paddingTop: "64px" }}
    >
      <style>{STYLES}</style>

      {/* Fond CSS tenant la place avant le chargement du canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 62% 50%," +
            "rgba(56,189,248,0.07) 0%,transparent 65%)," +
            "#02060d",
        }}
      />

      {/* Scène Three.js (chargée après montage, absente du rendu serveur). */}
      <div aria-hidden="true" className="absolute inset-0">
        <SceneMontagnesRusses paused={scenePausee} />
      </div>

      {/* Séquence console plein cadre — phase tunnel (0 à 2,2 s). */}
      {!sequenceFinie && (
        <SequenceDemarrage
          dureeMs={2200}
          variante="plein"
          onFini={() => setSequence(true)}
          className="pointer-events-none absolute inset-0 z-10"
        />
      )}

      {/* Cible de calibrage — phase réseau (4 s+), côté droit. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[6%] z-20"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          width: "min(300px, 38vw)",
          opacity: cibleActive ? 1 : 0,
          transition: "opacity 500ms ease",
        }}
      >
        <CibleCalibrage demarrer={cibleActive} couleur="#7dd3fc" />
      </div>

      {/* Voile sombre derrière le texte pour la lisibilité sur la scène. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-20"
        style={{
          width: "58%",
          background:
            "linear-gradient(90deg,rgba(2,6,13,0.78) 52%,transparent 100%)",
        }}
      />

      {/*
       * Bloc texte — présent dans le HTML serveur dès le premier rendu.
       * L'animation CSS fait apparaître chaque élément entre 2,5 s et 3,15 s.
       * mr-colonne déclare container-type:inline-size pour le cqi de type-hero.
       */}
      <div
        className="mr-colonne relative z-30 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-16"
        style={{ maxWidth: "min(580px, 50%)" }}
      >
        {/* h1 sémantique (SEO) : surtitre en petites capitales */}
        <h1
          className="mr-h1 type-caption mb-3 tracking-[0.14em] text-[#7dd3fc]"
          style={{ fontVariant: "small-caps" }}
        >
          Développement web et référencement
        </h1>

        {/* h2 visuel : accroche principale */}
        <h2 className="mr-h2 type-hero mb-4 font-light text-white">
          Dépassez les limites
        </h2>

        {/* Chapeau */}
        <p className="mr-chapeau type-lead mb-8 text-[#b8d4e8]">
          Sites, applications, outils métier. Nous concevons des solutions
          digitales durables, dont les résultats se mesurent.
        </p>

        {/* CTA */}
        <div className="mr-cta">
          <Bouton href="/contact" taille="l">Démarrer un projet</Bouton>
        </div>
      </div>

      {/*
       * Bouton pause — RGAA 13.8
       * L'animation dure plus de 5 s : un contrôle utilisateur est obligatoire.
       * Focus visible : le bord s'allume au focus (pas d'outline natif).
       */}
      <button
        type="button"
        aria-label={pauseLabel}
        onClick={basculerPause}
        className="absolute bottom-5 right-5 z-40 flex h-9 w-9 items-center justify-center text-[#7dd3fc]/70 transition-colors hover:text-[#7dd3fc] focus-visible:text-[#7dd3fc]"
        style={{
          background: "rgba(2,6,13,0.62)",
          border: "1px solid rgba(125,211,252,0.28)",
          backdropFilter: "blur(8px)",
          outline: "none",
        }}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(125,211,252,0.8)"; }}
        onBlur={(e) =>  { (e.currentTarget as HTMLElement).style.borderColor = "rgba(125,211,252,0.28)"; }}
      >
        {enPause ? (
          /* Icône lecture */
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
            <path d="M2 2l10 6-10 6V2z" />
          </svg>
        ) : (
          /* Icône pause */
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
            <rect x="0" y="0" width="4" height="16" rx="1" />
            <rect x="8" y="0" width="4" height="16" rx="1" />
          </svg>
        )}
        <span className="sr-only">{pauseLabel}</span>
      </button>
    </section>
  );
}
