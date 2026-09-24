/**
 * Décor « Pulsation » : un point central et des anneaux qui naissent
 * et s'effacent.
 *
 * Trois anneaux partent en même temps que le point, décalés d'un tiers
 * de cycle chacun (1 s sur 3 s). Ils grandissent en `scale` depuis le
 * centre et disparaissent par `opacity`.
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 200)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

export interface PulsationProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Pulsation({ taille = 200, className = "", style }: PulsationProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={taille}
      height={taille}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={style}
    >
      <StylesDecors />

      {/* Cercle de référence extérieur, fixe */}
      <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(125,211,252,0.06)" strokeWidth="0.8" />

      {/* Anneaux pulsants */}
      {[undefined, "1", "2"].map((delai, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="rgba(125,211,252,0.55)"
          strokeWidth="1.2"
          className="csDecPulse"
          data-delai={delai}
        />
      ))}

      {/* Point central lumineux */}
      <circle
        cx="100"
        cy="100"
        r="4"
        fill="#7dd3fc"
        style={{ filter: "drop-shadow(0 0 7px rgba(56,189,248,0.9))" }}
      />

      {/* Halo autour du point */}
      <circle cx="100" cy="100" r="10" fill="none" stroke="rgba(125,211,252,0.20)" strokeWidth="0.8" />
    </svg>
  );
}
