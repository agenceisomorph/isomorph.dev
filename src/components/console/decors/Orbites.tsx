/**
 * Décor « Orbites » : anneaux concentriques, pointillé en sens inverse,
 * satellite lumineux sur son orbite.
 *
 * Reprise directe du motif du hero, adaptée en composant autonome.
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 280)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

/** Graduations du cadran extérieur : un trait tous les 3°. */
const GRADS = Array.from({ length: 120 }, (_, i) => {
  const angle = (i * 3 * Math.PI) / 180;
  const majeur = i % 10 === 0;
  const r0 = 94;
  const r1 = majeur ? 86 : 90;
  const pt = (r: number) =>
    `${(100 + r * Math.sin(angle)).toFixed(2)} ${(100 - r * Math.cos(angle)).toFixed(2)}`;
  return { d: `M${pt(r0)} L${pt(r1)}`, majeur };
});

export interface OrbitesProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Orbites({ taille = 280, className = "", style }: OrbitesProps) {
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

      {/* Axes */}
      <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(125,211,252,0.07)" strokeWidth="0.8" />
      <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(125,211,252,0.07)" strokeWidth="0.8" />

      {/* Anneau extérieur fixe */}
      <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(125,211,252,0.16)" strokeWidth="0.8" />

      {/* Graduations qui tournent */}
      <g className="csDecOrbiteSens">
        {GRADS.map(({ d, majeur }) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={majeur ? "rgba(125,211,252,0.6)" : "rgba(125,211,252,0.20)"}
            strokeWidth={majeur ? 1 : 0.7}
          />
        ))}
      </g>

      {/* Anneau pointillé en sens inverse */}
      <g className="csDecOrbiteSens" data-sens="inverse">
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="rgba(125,211,252,0.28)"
          strokeWidth="0.8"
          strokeDasharray="2 10"
        />
      </g>

      {/* Anneau intermédiaire fixe */}
      <circle cx="100" cy="100" r="52" fill="none" stroke="rgba(125,211,252,0.10)" strokeWidth="0.7" />

      {/* Satellite lumineux */}
      <g className="csDecOrbiteSens" data-sens="satellite">
        {/* Orbite invisible, pour que le satellite suive un cercle de r=72 */}
        <circle cx="100" cy="100" r="72" fill="none" stroke="none" />
        <circle
          cx="100"
          cy="28"
          r="2.8"
          fill="#7dd3fc"
          style={{ filter: "drop-shadow(0 0 5px rgba(56,189,248,0.9))" }}
        />
      </g>

      {/* Centre */}
      <circle cx="100" cy="100" r="2.5" fill="rgba(125,211,252,0.40)" />
    </svg>
  );
}
