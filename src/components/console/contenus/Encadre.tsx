/**
 * Encadré d'information ou d'alerte.
 *
 * Pictogramme à gauche, bord néon à gauche, fond teinté.
 * Deux variantes : info (néon cyan) et alerte (ambre).
 *
 * RGAA 4.1 :
 *  - Critère 1.3 : le statut est transmis par le texte du titre, pas la couleur seule.
 *  - Critère 10.7 : contrastes ≥ 4,5:1.
 * Éco : Server Component.
 */

import type { ReactNode } from "react";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export type VarianteEncadre = "info" | "alerte";

export interface EncadreProps {
  variante?: VarianteEncadre;
  titre?: string;
  children: ReactNode;
  className?: string;
}

function IconeInfo() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function IconeAlerte() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M10 3L18 17H2L10 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M10 9v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Encadré d'information ou d'alerte.
 * Le titre et le contenu transmettent le sens ; la couleur est un renfort visuel.
 */
export function Encadre({ variante = "info", titre, children, className = "" }: EncadreProps) {
  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <aside
        className={`csContEncadre ${className}`}
        data-var={variante}
      >
        <div className="flex items-start gap-3">
          <span
            className={
              variante === "alerte"
                ? "mt-0.5 text-(--cs-alerte)"
                : "mt-0.5 text-(--cs-neon)"
            }
          >
            {variante === "alerte" ? <IconeAlerte /> : <IconeInfo />}
          </span>
          <div>
            {titre ? (
              <p className="type-body font-semibold text-white">{titre}</p>
            ) : null}
            <div
              className={`type-body ${titre ? "mt-1" : ""} text-(--cs-texte-2)`}
            >
              {children}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
