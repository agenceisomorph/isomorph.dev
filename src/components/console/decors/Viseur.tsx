/**
 * Décor « Viseur » : réticule de visée avec cycle d'accrochage cohérent.
 *
 * Cycle de 6 s (piloté par CSS) :
 *   0-18%  : état neutre (crochets en position naturelle)
 *   18-30% : recherche (crochets s'écartent légèrement)
 *   30-52% : acquisition (les quatre crochets convergent ensemble)
 *   52-75% : verrouillage (stabilisation, double clignotement, losange)
 *   75-90% : maintien puis retour à la position neutre
 *
 * Les crochets sont animés par `translate` sur leur axe diagonal (HG, HD,
 * BD, BG) sans aucun `scale`. Chaque crochet a sa propre keyframe pour
 * refléter son vecteur diagonal, mais tous sont synchronisés (animation-
 * delay = 0 partout).
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 200)
 * - `className` : classes Tailwind supplémentaires
 */

import type { CSSProperties } from "react";

import { StylesDecors } from "./styles";

export interface ViseurProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

/** Distances depuis le centre (px, sur le viewBox 200x200) */
const G = 26;  /* distance centre-coin des crochets */
const B = 18;  /* longueur des bras */

/** Positions en mil-dot sur les axes (demi-longueur du trait) */
const MIL_DOTS = [
  { d: 30, hl: 2 },
  { d: 43, hl: 3 },
  { d: 56, hl: 2 },
  { d: 69, hl: 3 },
] as const;

export function Viseur({ taille = 200, className = "", style }: ViseurProps) {
  const c = 100;  /* centre du viewBox */

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

      {/* Cercle extérieur de référence */}
      <circle cx={c} cy={c} r={88} fill="none"
        stroke="rgba(125,211,252,0.15)" strokeWidth="0.8" />

      {/* Anneau segmenté rotatif (rotation lente, environ 20 s) */}
      <circle
        cx={c} cy={c} r={84}
        fill="none"
        stroke="rgba(125,211,252,0.25)"
        strokeWidth="0.8"
        strokeDasharray="5 11"
        className="csDecViseurAnneau"
      />

      {/* Croisée fine interrompue au centre (gap autour du point central) */}
      <line x1={c} y1={12} x2={c} y2={c - G - B - 5}
        stroke="rgba(125,211,252,0.22)" strokeWidth="0.7" />
      <line x1={c} y1={c + G + B + 5} x2={c} y2={188}
        stroke="rgba(125,211,252,0.22)" strokeWidth="0.7" />
      <line x1={12} y1={c} x2={c - G - B - 5} y2={c}
        stroke="rgba(125,211,252,0.22)" strokeWidth="0.7" />
      <line x1={c + G + B + 5} y1={c} x2={188} y2={c}
        stroke="rgba(125,211,252,0.22)" strokeWidth="0.7" />

      {/* Marques mil-dot sur les quatre axes */}
      {MIL_DOTS.flatMap(({ d, hl }) => [
        /* axe vertical, au-dessus */
        <line key={`u${d}`}
          x1={c - hl} y1={c - d} x2={c + hl} y2={c - d}
          stroke="rgba(125,211,252,0.30)" strokeWidth="0.7" />,
        /* axe vertical, en dessous */
        <line key={`lo${d}`}
          x1={c - hl} y1={c + d} x2={c + hl} y2={c + d}
          stroke="rgba(125,211,252,0.30)" strokeWidth="0.7" />,
        /* axe horizontal, à gauche */
        <line key={`gl${d}`}
          x1={c - d} y1={c - hl} x2={c - d} y2={c + hl}
          stroke="rgba(125,211,252,0.30)" strokeWidth="0.7" />,
        /* axe horizontal, à droite */
        <line key={`dr${d}`}
          x1={c + d} y1={c - hl} x2={c + d} y2={c + hl}
          stroke="rgba(125,211,252,0.30)" strokeWidth="0.7" />,
      ])}

      {/* Losange de verrouillage : visible uniquement pendant la phase lock */}
      <polygon
        points={`${c},${c - 18} ${c + 18},${c} ${c},${c + 18} ${c - 18},${c}`}
        fill="none"
        stroke="rgba(56,189,248,0.75)"
        strokeWidth="0.8"
        className="csDecViseurLosange"
        style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
      />

      {/* Crochet haut-gauche (HG) */}
      <g className="csDecViseurHG">
        <path
          d={`M${c - G},${c - G - B} L${c - G},${c - G} L${c - G - B},${c - G}`}
          fill="none"
          stroke="rgba(125,211,252,0.80)"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
        />
      </g>

      {/* Crochet haut-droit (HD) */}
      <g className="csDecViseurHD">
        <path
          d={`M${c + G},${c - G - B} L${c + G},${c - G} L${c + G + B},${c - G}`}
          fill="none"
          stroke="rgba(125,211,252,0.80)"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
        />
      </g>

      {/* Crochet bas-droit (BD) */}
      <g className="csDecViseurBD">
        <path
          d={`M${c + G},${c + G + B} L${c + G},${c + G} L${c + G + B},${c + G}`}
          fill="none"
          stroke="rgba(125,211,252,0.80)"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
        />
      </g>

      {/* Crochet bas-gauche (BG) */}
      <g className="csDecViseurBG">
        <path
          d={`M${c - G},${c + G + B} L${c - G},${c + G} L${c - G - B},${c + G}`}
          fill="none"
          stroke="rgba(125,211,252,0.80)"
          strokeWidth="1.2"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(56,189,248,0.6))" }}
        />
      </g>

      {/* Point central lumineux */}
      <circle
        cx={c} cy={c} r="2.5"
        fill="#7dd3fc"
        style={{ filter: "drop-shadow(0 0 5px rgba(56,189,248,0.9))" }}
      />
    </svg>
  );
}
