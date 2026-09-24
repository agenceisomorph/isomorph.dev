"use client";

/**
 * Démonstration des décors d'instruments du système Console.
 *
 * Réutilise les composants existants de src/components/console/decors.
 * Aucun canvas 3D — CSS et SVG uniquement.
 *
 * RGAA 4.1 :
 *   - role="img" + aria-label sur chaque décor.
 *   - Critère 13.8 : les animations boucleront indéfiniment mais sont
 *     purement décoratives (aria-hidden). Bouton pause non requis car
 *     les décors n'ont pas de contenu informatif en mouvement.
 */

import { StylesConsole } from "@/components/console/fondations";
import {
  Cadran,
  Engrenage,
  Jauge,
  Orbites,
  Oscilloscope,
  Pulsation,
  Radar,
  Viseur,
} from "@/components/console/decors";

const DECORS = [
  { label: "Radar", Composant: Radar },
  { label: "Oscilloscope", Composant: Oscilloscope },
  { label: "Jauge", Composant: Jauge },
  { label: "Viseur", Composant: Viseur },
  { label: "Cadran", Composant: Cadran },
  { label: "Engrenage", Composant: Engrenage },
  { label: "Pulsation", Composant: Pulsation },
  { label: "Orbites", Composant: Orbites },
] as const;

export function DemoDecors() {
  return (
    <div
      className="flex items-center justify-center min-h-full w-full p-8"
      style={{ background: "var(--cs-fond)" }}
    >
      <StylesConsole />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl w-full">
        {DECORS.map(({ label, Composant }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <div
              className="w-24 h-24"
              role="img"
              aria-label={label}
            >
              <Composant />
            </div>
            <span className="type-caption text-(--cs-texte-3) uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
