/**
 * Décor « Radar » : balayage PPI marine/aérien, traîne de rémanence
 * phosphore, échos synchronisés avec l'angle du faisceau.
 *
 * Architecture :
 * - Groupe SVG rotatif (transform-box: view-box) pour une rotation
 *   exactement autour de (100, 100), indépendamment de la bbox du wedge.
 * - Traîne en quatre couches de secteurs empilés, décroissant en opacité.
 * - Echos animés indépendamment ; délai = (relèvement / 360) * période,
 *   soit le temps que met le faisceau pour atteindre ce relèvement.
 * - Ids SVG uniques par instance via useId (évite les collisions si
 *   plusieurs radars coexistent dans la page).
 *
 * Props :
 * - `taille` : largeur/hauteur en px (par défaut 240)
 * - `className` : classes Tailwind supplémentaires
 */

import { useId } from "react";
import type { CSSProperties, ReactElement } from "react";

import { StylesDecors } from "./styles";

/** Période du balayage en secondes. Doit rester cohérente avec styles.tsx */
const T_RADAR = 4;

/**
 * Echos : relèvement en degrés (nord = 0°, sens horaire),
 * r = distance depuis le centre (0..88), rv = rayon visuel du point.
 */
const ECHOS = [
  { releve: 45,  r: 70, rv: 2.4 },
  { releve: 128, r: 52, rv: 2.0 },
  { releve: 215, r: 65, rv: 2.8 },
  { releve: 305, r: 48, rv: 1.8 },
] as const;

/**
 * Traîne de rémanence : 30 tranches de 3° derrière la ligne de tête, dont
 * l'opacité décroît de façon exponentielle (0,34 × 0,86^i), soit un fondu
 * continu sur 90° sans bandes visibles. Chaque tranche mord de 0,5° sur la
 * suivante pour éviter les filets clairs entre deux tranches.
 */
const TRAINEE = Array.from({ length: 30 }, (_, i) => ({
  debut: -i * 3,
  fin: -(i + 1) * 3 - 0.5,
  opacity: (0.34 * Math.pow(0.86, i)).toFixed(3),
}));

/** Convertit un relèvement (degrés) et un rayon en coordonnées SVG (centre 100, 100). */
function ptPolaire(releve: number, r: number): [number, number] {
  const rad = (releve * Math.PI) / 180;
  return [100 + r * Math.sin(rad), 100 - r * Math.cos(rad)];
}

/**
 * Génère les marques de relèvement sur le cercle extérieur.
 * Trait court tous les 10°, long tous les 30°, marque nord plus lumineuse.
 * Aucun texte.
 */
function gradations(): ReactElement[] {
  const marques: ReactElement[] = [];
  for (let deg = 0; deg < 360; deg += 10) {
    const [ox, oy] = ptPolaire(deg, 88);
    const isNord = deg === 0;
    const isLong = deg % 30 === 0;
    const rInt = isNord ? 75 : isLong ? 79 : 83;
    const [ix, iy] = ptPolaire(deg, rInt);
    marques.push(
      <line
        key={deg}
        x1={ox.toFixed(2)} y1={oy.toFixed(2)}
        x2={ix.toFixed(2)} y2={iy.toFixed(2)}
        stroke={isNord ? "rgba(125,211,252,0.65)" : "rgba(125,211,252,0.22)"}
        strokeWidth={isNord ? "1.0" : isLong ? "0.7" : "0.5"}
      />
    );
  }
  return marques;
}

export interface RadarProps {
  taille?: number;
  className?: string;
  style?: CSSProperties;
}

export function Radar({ taille = 240, className = "", style }: RadarProps) {
  /* Identifiant unique : évite les collisions de clipPath si deux <Radar />
     sont montés simultanément dans la page. */
  const uid = useId().replace(/:/g, "");
  const clipId = `rdrClip${uid}`;

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
      <defs>
        {/* Masque circulaire pour le groupe rotatif */}
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="88" />
        </clipPath>
      </defs>

      {/* Cercles de distance */}
      <circle cx="100" cy="100" r="88" fill="none"
        stroke="rgba(125,211,252,0.18)" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="60" fill="none"
        stroke="rgba(125,211,252,0.09)" strokeWidth="0.6"
        strokeDasharray="3 4" />
      <circle cx="100" cy="100" r="32" fill="none"
        stroke="rgba(125,211,252,0.07)" strokeWidth="0.6"
        strokeDasharray="2 5" />

      {/* Croisée d'axes */}
      <line x1="100" y1="12" x2="100" y2="188"
        stroke="rgba(125,211,252,0.08)" strokeWidth="0.6" />
      <line x1="12" y1="100" x2="188" y2="100"
        stroke="rgba(125,211,252,0.08)" strokeWidth="0.6" />

      {/* Graduations de relèvement (traits courts, longs, marque nord) */}
      {gradations()}

      {/* Groupe rotatif : traîne phosphore + faisceau de tête.
          transform-box: view-box garantit la rotation autour de (100, 100)
          quel que soit le bounding-box asymétrique du wedge. */}
      <g className="csDecRadarCone" clipPath={`url(#${clipId})`}>
        {/* Traîne de rémanence, de la tête vers la queue */}
        {TRAINEE.map(({ debut, fin, opacity }) => {
          const [ax, ay] = ptPolaire(debut, 88);
          const [bx, by] = ptPolaire(fin, 88);
          const d = `M100,100 L${ax.toFixed(2)},${ay.toFixed(2)} A88,88 0 0,0 ${bx.toFixed(2)},${by.toFixed(2)} Z`;
          return <path key={debut} d={d} fill={`rgba(56,189,248,${opacity})`} />;
        })}
        {/* Ligne de tête lumineuse */}
        <line
          x1="100" y1="100" x2="100" y2="12"
          stroke="rgba(56,189,248,0.88)"
          strokeWidth="0.9"
          style={{ filter: "drop-shadow(0 0 2px rgba(56,189,248,0.9))" }}
        />
      </g>

      {/* Echos phosphore : s'allument au passage du faisceau.
          La temporisation est calculée comme la fraction du tour
          correspondant au relèvement de chaque écho. */}
      {ECHOS.map(({ releve, r, rv }) => {
        const [cx, cy] = ptPolaire(releve, r);
        const delai = ((releve / 360) * T_RADAR).toFixed(3);
        return (
          <circle
            key={releve}
            cx={cx.toFixed(2)}
            cy={cy.toFixed(2)}
            r={rv}
            fill="#7dd3fc"
            className="csDecEcho"
            style={{
              animationDelay: `${delai}s`,
              filter: "drop-shadow(0 0 4px rgba(56,189,248,0.9))",
            }}
          />
        );
      })}

      {/* Centre */}
      <circle cx="100" cy="100" r="1.8" fill="rgba(125,211,252,0.60)" />
    </svg>
  );
}
