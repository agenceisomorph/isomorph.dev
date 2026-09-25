/**
 * Décor « Oscilloscope » : une onde fine qui défile sur une grille.
 *
 * L'onde est un chemin SVG statique dupliqué côte à côte (200 px + 200 px).
 * La translation CSS déplace l'ensemble de -50% en X, créant un défilement
 * continu sans recalcul de mise en page.
 *
 * Valeurs de l'onde : déterministes (aucun Math.random).
 *
 * Props :
 * - `largeur` : largeur en px (par défaut 320)
 * - `hauteur` : hauteur en px (par défaut 120)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

/**
 * Points de l'onde sur 200 px de large.
 * Valeurs en Y choisies de façon déterministe : amplitude modérée,
 * aspect d'un signal ECG / oscilloscope instrument.
 */
const PTS = [
  [0,   60], [20,  60], [25,  30], [30,  90], [35,  60],
  [55,  60], [60,  20], [70, 100], [80,  60],
  [100, 60], [115, 45], [125, 75], [135, 60],
  [155, 60], [160, 35], [165, 85], [170, 60],
  [190, 60], [200, 60],
] as const;

/** Construit le chemin de l'onde à partir des points. */
function ondePath(offsetX: number): string {
  return PTS.map(([x, y], i) =>
    `${i === 0 ? "M" : "L"}${(x + offsetX).toFixed(1)} ${y.toFixed(1)}`
  ).join(" ");
}

export interface OscilloscopeProps {
  largeur?: number;
  hauteur?: number;
  className?: string;
  style?: CSSProperties;
}

export function Oscilloscope({ largeur = 320, hauteur = 120, className = "", style }: OscilloscopeProps) {
  return (
    <svg
      viewBox={`0 0 ${largeur} ${hauteur}`}
      width={largeur}
      height={hauteur}
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`}
      style={style}
    >
      <StylesDecors />

      {/* Grille : horizontales */}
      {[30, 60, 90].map((y) => (
        <line
          key={y}
          x1="0" y1={y} x2={largeur} y2={y}
          stroke="rgba(125,211,252,0.07)" strokeWidth="0.6"
        />
      ))}

      {/* Grille : verticales, espacées de 40 px */}
      {Array.from({ length: Math.ceil(largeur / 40) + 1 }, (_, i) => i * 40).map((x) => (
        <line
          key={x}
          x1={x} y1="0" x2={x} y2={hauteur}
          stroke="rgba(125,211,252,0.07)" strokeWidth="0.6"
        />
      ))}

      {/* Onde défilante : deux répétitions côte à côte pour le défilement */}
      <g className="csDecOscillo">
        <path
          d={`${ondePath(0)} ${ondePath(200).replace(/^M/, "L")}`}
          fill="none"
          stroke="rgba(125,211,252,0.70)"
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
        />
      </g>

      {/* Bord du cadre */}
      <rect
        x="0.5" y="0.5"
        width={largeur - 1}
        height={hauteur - 1}
        fill="none"
        stroke="rgba(125,211,252,0.14)"
        strokeWidth="0.8"
      />
    </svg>
  );
}
