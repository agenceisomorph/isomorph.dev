/**
 * Décor « Cadran » : roue graduée qui tourne très lentement.
 *
 * Traits tous les 3°, majeurs tous les 30°. Un point lumineux au sommet.
 * Décor pur : aria-hidden, pointer-events none.
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 240)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

/** Un trait de graduation par 3°, repère majeur tous les 30°. */
const GRADS = Array.from({ length: 120 }, (_, i) => {
  const angle = (i * 3 * Math.PI) / 180;
  const majeur = i % 10 === 0;
  const r0 = 96;
  const r1 = majeur ? 84 : 90;
  const cx = 100;
  const cy = 100;
  const pt = (r: number) =>
    `${(cx + r * Math.sin(angle)).toFixed(2)} ${(cy - r * Math.cos(angle)).toFixed(2)}`;
  return { d: `M${pt(r0)} L${pt(r1)}`, majeur };
});

export interface CadranProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Cadran({ taille = 240, className = "", style }: CadranProps) {
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

      {/* Cercle extérieur fixe */}
      <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(125,211,252,0.18)" strokeWidth="1" />

      {/* Roue graduée qui tourne */}
      <g className="csDecCadranRoue">
        {GRADS.map(({ d, majeur }) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={majeur ? "rgba(125,211,252,0.65)" : "rgba(125,211,252,0.22)"}
            strokeWidth={majeur ? 1.2 : 0.8}
          />
        ))}
        {/* Point lumineux au sommet */}
        <circle
          cx="100"
          cy="4"
          r="2.5"
          fill="#7dd3fc"
          style={{ filter: "drop-shadow(0 0 5px rgba(56,189,248,0.9))" }}
        />
      </g>

      {/* Axes fixes, très discrets */}
      <line className="csDecCadranAxe" x1="100" y1="4" x2="100" y2="196" stroke="rgba(125,211,252,1)" strokeWidth="0.6" />
      <line className="csDecCadranAxe" x1="4" y1="100" x2="196" y2="100" stroke="rgba(125,211,252,1)" strokeWidth="0.6" />

      {/* Cercle intérieur */}
      <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(125,211,252,0.10)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="3" fill="rgba(125,211,252,0.45)" />
    </svg>
  );
}
