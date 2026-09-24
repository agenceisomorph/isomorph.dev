/**
 * Famille « Retours » du système Console : composants de chargement.
 *
 * Deux exports :
 * - `RoueChargement` : la roue seule avec texte masqué pour les lecteurs d'écran.
 * - `SquelettesChargement` : cartes à coins coupés avec balayage lumineux.
 *
 * Rendu serveur. Aucun état.
 *
 * RGAA 4.1 : la roue porte un `<span class="sr-only">`, la région parente
 * reçoit `aria-busy="true"` et `aria-label` (critère 13.7).
 * Éco-conception : balayage CSS uniquement, aucun JS.
 */

import type { CSSProperties } from "react";

import { StylesConsole } from "../fondations";
import { StylesRetours } from "./_styles";

/* ------------------------------------------------------------------ */
/* Roue de chargement                                                  */
/* ------------------------------------------------------------------ */

export interface RoueChargementProps {
  /** Texte annoncé aux lecteurs d'écran. Par défaut : « Chargement en cours ». */
  label?: string;
  /** Diamètre de la roue : s = 16 px, m = 24 px, l = 32 px. Par défaut : m. */
  taille?: "s" | "m" | "l";
  className?: string;
}

const TAILLE_PX: Record<NonNullable<RoueChargementProps["taille"]>, number> = {
  s: 16,
  m: 24,
  l: 32,
};

/**
 * Roue de chargement néon.
 *
 * À encadrer dans une région `aria-busy="true"` quand elle remplace un contenu.
 *
 * @example
 * <div aria-busy="true" aria-label="Chargement des projets">
 *   <RoueChargement />
 * </div>
 */
export function RoueChargement({ label = "Chargement en cours", taille = "m", className = "" }: RoueChargementProps) {
  const px = TAILLE_PX[taille];
  const ep = px <= 16 ? 1.5 : 2;

  return (
    <span
      role="status"
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px } as CSSProperties}
    >
      <StylesConsole />
      <StylesRetours />
      <span className="sr-only">{label}</span>
      {/* Cercle : même structure que `.csRoue` dans fondations, couleur néon. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width={px}
        height={px}
        style={{ animation: "csTourne 800ms linear infinite" } as CSSProperties}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="var(--cs-neon-doux)"
          strokeWidth={ep}
        />
        <path
          d="M22 12 A10 10 0 0 0 12 2"
          fill="none"
          stroke="var(--cs-neon)"
          strokeWidth={ep}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 4px rgba(56,189,248,0.8))" } as CSSProperties}
        />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Squelettes                                                          */
/* ------------------------------------------------------------------ */

export interface SquelettesChargementProps {
  /** Nombre de cartes. Par défaut : 3. */
  nombre?: number;
  className?: string;
}

/**
 * Cartes squelettes à coins coupés avec balayage lumineux.
 * La région porte `aria-busy="true"` et un message masqué pour les AT.
 *
 * RGAA 13.7 : le chargement est signalé par `aria-live="polite"` et par
 * `aria-busy` sur la région ; le balayage est `aria-hidden`.
 */
export function SquelettesChargement({ nombre = 3, className = "" }: SquelettesChargementProps) {
  const coupe = 10;

  return (
    <div
      aria-busy="true"
      aria-label="Chargement du contenu"
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      <StylesConsole />
      <StylesRetours />
      <span className="sr-only" aria-live="polite">
        Chargement en cours.
      </span>

      {Array.from({ length: nombre }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="csRetSquelette csCoupe"
          data-coupe="s"
          style={
            {
              "--cs-c": `${coupe}px`,
              "--cs-clip": `polygon(${coupe}px 0, 100% 0, 100% calc(100% - ${coupe}px), calc(100% - ${coupe}px) 100%, 0 100%, 0 ${coupe}px)`,
              clipPath: `polygon(${coupe}px 0, 100% 0, 100% calc(100% - ${coupe}px), calc(100% - ${coupe}px) 100%, 0 100%, 0 ${coupe}px)`,
              padding: "20px",
              minHeight: "140px",
            } as CSSProperties
          }
        >
          {/* Balayage décoratif. */}
          <span aria-hidden="true" className="csRetSqueletteBalayage" />

          {/* Lignes simulées : hauteurs variables par carte pour éviter la répétition. */}
          <div className="mb-4 h-3 rounded-sm bg-white/[0.07]" style={{ width: "60%" }} />
          <div className="mb-2 h-2.5 rounded-sm bg-white/[0.05]" style={{ width: "100%" }} />
          <div className="mb-2 h-2.5 rounded-sm bg-white/[0.05]" style={{ width: i === 1 ? "80%" : "90%" }} />
          <div className="mt-4 h-2 rounded-sm bg-white/[0.04]" style={{ width: "45%" }} />
        </div>
      ))}
    </div>
  );
}
