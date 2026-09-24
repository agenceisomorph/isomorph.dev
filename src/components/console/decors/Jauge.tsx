/**
 * Décor « Jauge » : arc gradué dont le trait se remplit puis se vide
 * lentement.
 *
 * L'arc couvre 270° (de 135° à 45° dans le sens horaire).
 * Le remplissage passe par `stroke-dashoffset` sur l'arc de couleur,
 * ce qui ne force aucun recalcul de mise en page.
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 200)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

export interface JaugeProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Jauge({ taille = 200, className = "", style }: JaugeProps) {
  const cx = 100;
  const cy = 100;
  const r  = 76;

  /* Périmètre total du cercle */
  const perim = 2 * Math.PI * r;

  /* L'arc couvre 270° sur 360° */
  const arcFrac = 270 / 360;
  const arcLen  = perim * arcFrac;

  /* stroke-dasharray : longueur de l'arc visible + le reste invisible */
  const dashArray = `${arcLen.toFixed(2)} ${perim.toFixed(2)}`;

  /* Décalage de départ : l'arc commence à 135° du sommet (270° / 2 de retard) */
  /* strokeDashoffset = périmètre * (1 - arcFrac) / 2 * (-1) environ, mais on
     utilise une rotation de l'arc via le paramètre `transform` sur le `circle`. */

  /* Graduation : un trait tous les 30°, 9 segments sur 270° */
  const GRADS = Array.from({ length: 10 }, (_, i) => {
    const deg = 135 + i * 30;
    const rad = (deg * Math.PI) / 180;
    const r0  = r + 4;
    const r1  = r + (i === 0 || i === 9 ? 12 : 8);
    return {
      x1: (cx + r0 * Math.cos(rad)).toFixed(2),
      y1: (cy + r0 * Math.sin(rad)).toFixed(2),
      x2: (cx + r1 * Math.cos(rad)).toFixed(2),
      y2: (cy + r1 * Math.sin(rad)).toFixed(2),
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width={taille}
      height={taille}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={
        {
          "--csDec-jauge-plein": "0",
          "--csDec-jauge-vide":  `${arcLen.toFixed(2)}`,
          ...style,
        } as CSSProperties
      }
    >
      <StylesDecors />

      {/* Graduations */}
      {GRADS.map((g, i) => (
        <line
          key={i}
          x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
          stroke="rgba(125,211,252,0.30)"
          strokeWidth="0.8"
        />
      ))}

      {/* Arc de fond (piste) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(125,211,252,0.10)"
        strokeWidth="2"
        strokeDasharray={dashArray}
        strokeDashoffset="0"
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
      />

      {/* Arc animé (niveau) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(125,211,252,0.75)"
        strokeWidth="2"
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform={`rotate(135 ${cx} ${cy})`}
        className="csDecJaugeArc"
        style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.7))" }}
      />

      {/* Point central */}
      <circle cx={cx} cy={cy} r="2.5" fill="rgba(125,211,252,0.40)" />

      {/* Repères de début et de fin */}
      <circle
        cx={(cx + (r + 16) * Math.cos((135 * Math.PI) / 180)).toFixed(2) as unknown as number}
        cy={(cy + (r + 16) * Math.sin((135 * Math.PI) / 180)).toFixed(2) as unknown as number}
        r="2"
        fill="rgba(125,211,252,0.35)"
      />
      <circle
        cx={(cx + (r + 16) * Math.cos((45 * Math.PI) / 180)).toFixed(2) as unknown as number}
        cy={(cy + (r + 16) * Math.sin((45 * Math.PI) / 180)).toFixed(2) as unknown as number}
        r="2"
        fill="rgba(125,211,252,0.35)"
      />
    </svg>
  );
}
