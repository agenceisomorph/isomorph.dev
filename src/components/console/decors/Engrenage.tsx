/**
 * Décor « Engrenage » : deux roues crantées fines qui s'entraînent en
 * sens contraire.
 *
 * Dents calculées de façon déterministe. La grande roue (r=40, 16 dents)
 * tourne dans le sens horaire ; la petite (r=26, 10 dents) en sens inverse,
 * avec une vitesse proportionnelle au rapport des rayons pour simuler
 * l'engrènement (16/10 = 1,6 : la petite tourne 1,6 fois plus vite).
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 240)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

/**
 * Génère le chemin SVG d'une roue dentée.
 * @param cx - centre X
 * @param cy - centre Y
 * @param r  - rayon du cercle de base
 * @param n  - nombre de dents
 * @param h  - hauteur de dent
 */
function pathEngrenage(cx: number, cy: number, r: number, n: number, h: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i * 2 * Math.PI) / n;
    const a1 = a0 + (0.3 * Math.PI) / n;
    const a2 = a0 + (0.7 * Math.PI) / n;
    const a3 = a0 + (1.0 * Math.PI) / n;
    const pt = (angle: number, radius: number) =>
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
    pts.push(
      `${i === 0 ? "M" : "L"}${pt(a0, r)}`,
      `L${pt(a1, r + h)}`,
      `L${pt(a2, r + h)}`,
      `L${pt(a3, r)}`,
    );
  }
  return pts.join(" ") + " Z";
}

const GRANDE_CX = 80;
const GRANDE_CY = 100;
const GRANDE_R  = 40;
const GRANDE_N  = 16;
const GRANDE_H  = 7;

const PETITE_CX = 148; /* 80 + 40 + 26 + 2 (jeu) */
const PETITE_CY = 100;
const PETITE_R  = 26;
const PETITE_N  = 10;
const PETITE_H  = 7;

const D_GRANDE = pathEngrenage(GRANDE_CX, GRANDE_CY, GRANDE_R, GRANDE_N, GRANDE_H);
const D_PETITE = pathEngrenage(PETITE_CX, PETITE_CY, PETITE_R, PETITE_N, PETITE_H);

export interface EngrenageProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Engrenage({ taille = 240, className = "", style }: EngrenageProps) {
  return (
    <svg
      viewBox="0 0 220 200"
      width={taille}
      height={Math.round(taille * 200 / 220)}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={style}
    >
      <StylesDecors />

      {/* Grande roue */}
      <g className="csDecEngrenage">
        <path
          d={D_GRANDE}
          fill="none"
          stroke="rgba(125,211,252,0.55)"
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 2px rgba(56,189,248,0.4))" }}
        />
        {/* Cercle de moyeu */}
        <circle cx={GRANDE_CX} cy={GRANDE_CY} r="8" fill="none" stroke="rgba(125,211,252,0.35)" strokeWidth="0.8" />
        <circle cx={GRANDE_CX} cy={GRANDE_CY} r="2" fill="rgba(125,211,252,0.45)" />
        {/* Rayons */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={(GRANDE_CX + 8 * Math.cos(rad)).toFixed(2)}
              y1={(GRANDE_CY + 8 * Math.sin(rad)).toFixed(2)}
              x2={(GRANDE_CX + (GRANDE_R - 4) * Math.cos(rad)).toFixed(2)}
              y2={(GRANDE_CY + (GRANDE_R - 4) * Math.sin(rad)).toFixed(2)}
              stroke="rgba(125,211,252,0.20)"
              strokeWidth="0.7"
            />
          );
        })}
      </g>

      {/* Petite roue */}
      <g className="csDecEngrenage" data-sens="inverse">
        <path
          d={D_PETITE}
          fill="none"
          stroke="rgba(125,211,252,0.45)"
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 2px rgba(56,189,248,0.3))" }}
        />
        <circle cx={PETITE_CX} cy={PETITE_CY} r="6" fill="none" stroke="rgba(125,211,252,0.28)" strokeWidth="0.8" />
        <circle cx={PETITE_CX} cy={PETITE_CY} r="2" fill="rgba(125,211,252,0.40)" />
        {[0, 72, 144, 216, 288].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={(PETITE_CX + 6 * Math.cos(rad)).toFixed(2)}
              y1={(PETITE_CY + 6 * Math.sin(rad)).toFixed(2)}
              x2={(PETITE_CX + (PETITE_R - 3) * Math.cos(rad)).toFixed(2)}
              y2={(PETITE_CY + (PETITE_R - 3) * Math.sin(rad)).toFixed(2)}
              stroke="rgba(125,211,252,0.16)"
              strokeWidth="0.7"
            />
          );
        })}
      </g>
    </svg>
  );
}
