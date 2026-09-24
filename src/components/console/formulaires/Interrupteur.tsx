"use client";

/**
 * Interrupteur (switch) du système Console.
 *
 * Implémente le pattern WAI-ARIA "button" avec role="switch" et aria-checked.
 * Le pouce carré à coins coupés glisse sur une piste sombre.
 *
 * RGAA 7.1 : composant interactif avec rôle, état et propriétés ARIA.
 * RGAA 10.7 : focus visible via :focus-visible.
 * Cible tactile : min-height 44px sur le bouton.
 */

import { useId } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface InterrupteurProps {
  id?: string;
  libelle: string;
  /** true = activé */
  coche: boolean;
  onChange: (coche: boolean) => void;
  desactive?: boolean;
  className?: string;
}

/**
 * Interrupteur Console (role="switch", pouce à coins coupés).
 * @example
 * <Interrupteur libelle="Notifications par courriel" coche={notifs} onChange={setNotifs} />
 */
export function Interrupteur({
  id,
  libelle,
  coche,
  onChange,
  desactive,
  className = "",
}: InterrupteurProps) {
  const uid = useId();
  const btnId = id ?? `${uid}switch`;

  return (
    <div className={className}>
      <StylesConsole />
      <StylesFormulaires />

      <button
        id={btnId}
        type="button"
        role="switch"
        aria-checked={coche}
        aria-disabled={desactive ? true : undefined}
        className="csInterrupteurBouton"
        onClick={() => !desactive && onChange(!coche)}
      >
        {/* Piste + pouce */}
        <span aria-hidden="true" className="csInterrupteurPiste">
          <span className="csInterrupteurFond" />
          <span className="csBord" />
          <span className="csDiag" data-coin="hg" />
          <span className="csDiag" data-coin="bd" />
          <span className="csInterrupteurPouce" />
        </span>

        {/* Libellé à droite de la piste */}
        <span className="type-body text-(--cs-texte)">{libelle}</span>
      </button>
    </div>
  );
}
