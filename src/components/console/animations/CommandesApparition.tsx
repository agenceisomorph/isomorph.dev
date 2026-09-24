"use client";

/**
 * Barre de commandes des animations d'apparition (vitrine uniquement).
 *
 * Affiche les variantes du bloc (aria-pressed, groupe nommé « Animation
 * d'apparition ») et un bouton « Rejouer l'animation » avec une icône SVG de
 * reprise. Ne jamais utiliser en dehors de /atelier/console.
 *
 * RGAA 4.1 :
 *   - Critère 10.7 : pas d'outline détaché ; le bord s'allume au survol/focus.
 *   - Critère 7.1 : aria-pressed signale l'état actif de chaque bouton.
 *   - Critère 9.1 : role="group" avec aria-label.
 *   - Cibles d'au moins 44 px de haut (height: 44px sur chaque bouton).
 */

import { StylesConsole } from "../fondations";
import { Trace } from "../fondations";
import { StylesApparition } from "./styles";
import type { VarianteBloc } from "./catalogue";

/* ------------------------------------------------------------------ */
/* Icône de reprise                                                     */
/* ------------------------------------------------------------------ */

function IconeRejouer() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4 shrink-0"
      fill="none"
    >
      <path
        d="M13 8A5 5 0 1 1 8 3h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 1l0 4h-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

interface CommandesApparitionProps {
  variantes: readonly VarianteBloc[];
  variante: string;
  onVariante: (id: string) => void;
  onRejouer: () => void;
}

/**
 * Barre d'instrument de la vitrine : sélection de variante et relecture.
 */
export function CommandesApparition({ variantes, variante, onVariante, onRejouer }: CommandesApparitionProps) {
  return (
    <div className="csAppCmds" role="group" aria-label="Animation d'apparition">
      <StylesConsole />
      <StylesApparition />

      {/* Sélecteurs de variante */}
      <div className="csAppVariantes">
        {variantes.map((v) => (
          <button
            key={v.id}
            type="button"
            className="csAppBtnVariante csCoupe csTracable"
            data-coupe="s"
            aria-pressed={variante === v.id}
            onClick={() => onVariante(v.id)}
          >
            {/* Bord néon (fondations) */}
            <span aria-hidden="true" className="csBord" />
            <span aria-hidden="true" className="csDiag" data-coin="hg" />
            <span aria-hidden="true" className="csDiag" data-coin="bd" />
            <Trace />
            {v.label}
          </button>
        ))}
      </div>

      {/* Bouton Rejouer */}
      <button
        type="button"
        className="csAppBtnRejouer csCoupe csTracable"
        data-coupe="s"
        onClick={onRejouer}
        aria-label="Rejouer l'animation"
        title="Rejouer l'animation"
      >
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />
        <Trace />
        <IconeRejouer />
        <span aria-hidden="true">Rejouer</span>
      </button>
    </div>
  );
}
