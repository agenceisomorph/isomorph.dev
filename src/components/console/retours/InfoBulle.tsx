/**
 * Famille « Retours » du système Console : info-bulle.
 *
 * Apparaît au survol et au focus du déclencheur. La touche Échap la ferme.
 * L'info-bulle ne doit jamais porter une information indispensable : le
 * contenu qu'elle révèle doit être accessible autrement (RGAA 13.1).
 *
 * RGAA 4.1 :
 * - `role="tooltip"` sur le panneau de contenu (critère 13.1).
 * - `aria-describedby` injecté sur le déclencheur via `cloneElement`.
 * - Fermeture par Échap (WCAG 2.1 AA : 1.4.13).
 * - Focus visible sur le déclencheur : son bord s'allume, sans anneau.
 *
 * Limite connue : les composants qui ne propagent pas `onFocus`/`onBlur` à leur
 * élément racine (ex. `<Bouton>`) n'activeront la bulle qu'au survol. Pour la
 * démo clavier, utiliser un élément natif (`<button>`, `<a>`).
 *
 * "use client" : `useState` (visibilité) et `useId`.
 */

"use client";

import { cloneElement, useId, useState } from "react";
import type { FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { StylesRetours } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface InfoBulleProps {
  /**
   * Déclencheur : un seul élément React interactif.
   * Reçoit automatiquement `aria-describedby` quand la bulle est visible.
   */
  children: ReactElement;
  /** Contenu de la bulle. Court. Jamais d'information indispensable. */
  contenu: ReactNode;
  /** Placement : au-dessus (défaut) ou en dessous du déclencheur. */
  placement?: "haut" | "bas";
  className?: string;
}

/** Sous-ensemble de props interactives injectées sur le déclencheur. */
interface PropsInjectees {
  "aria-describedby"?: string;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/**
 * Info-bulle néon : survol, focus, Échap.
 *
 * @example
 * <InfoBulle contenu="Ouvrir dans un nouvel onglet">
 *   <button aria-label="Voir le projet">
 *     <IconeExterne />
 *   </button>
 * </InfoBulle>
 */
export function InfoBulle({ children, contenu, placement = "haut", className = "" }: InfoBulleProps) {
  const [visible, setVisible] = useState(false);
  const uid = useId();
  /* useId produit `:r0:` etc. On nettoie pour un id HTML valide. */
  const id = `ibulle-${uid.replace(/[^a-z0-9]/gi, "")}`;

  /* Accès aux handlers existants du déclencheur, avec cast large. */
  const existant = children.props as PropsInjectees;

  const injection: PropsInjectees = {
    "aria-describedby": visible ? id : undefined,
    onFocus(e: FocusEvent) {
      setVisible(true);
      existant.onFocus?.(e);
    },
    onBlur(e: FocusEvent) {
      setVisible(false);
      existant.onBlur?.(e);
    },
    onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setVisible(false);
      existant.onKeyDown?.(e);
    },
  };

  const declencheurAugmente = cloneElement(children as ReactElement<PropsInjectees>, injection);

  return (
    <span
      className={`csRetIBulle ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <StylesConsole />
      <StylesRetours />

      {declencheurAugmente}

      {/* Bulle conditionnelle : montée uniquement quand visible pour que
          les AT détectent l'ajout dans le DOM. */}
      {visible ? (
        <span
          role="tooltip"
          id={id}
          className="csRetIBulleCorps"
          data-placement={placement}
        >
          <Panneau coupe="s" className="csRetIBulleContenu">
            <span className="type-caption text-(--cs-texte-2)">{contenu}</span>
          </Panneau>
        </span>
      ) : null}
    </span>
  );
}
