/**
 * Accordéon de questions et réponses.
 *
 * Plusieurs panneaux peuvent être ouverts simultanément.
 * Le signe « + » pivote à 45 degrés quand le panneau est ouvert
 * (propriété CSS `rotate`, pas `transform: rotate()`).
 *
 * Animation : grid-template-rows 0fr -> 1fr, sans max-height arbitraire.
 *
 * "use client" : état des panneaux ouverts.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : bouton avec aria-expanded et aria-controls.
 *  - Critère 10.1 : focus visible sur chaque bouton.
 *  - Critère 10.7 : contraste >= 4,5:1 (texte sur fond sombre).
 */

"use client";

import { useId, useState } from "react";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export interface ItemAccordeon {
  question: string;
  reponse: string;
}

export interface AccordeonProps {
  items: ItemAccordeon[];
  className?: string;
}

function IconePlus() {
  return (
    /* La rotation CSS (.csContAccSigne, rotate: 45deg) tourne le + en x */
    <svg
      viewBox="0 0 20 20"
      className="csContAccSigne"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Accordéon. Plusieurs panneaux peuvent être ouverts en même temps.
 * État initial : tout fermé (rendu serveur = rendu navigateur initial).
 */
export function Accordeon({ items, className = "" }: AccordeonProps) {
  const baseId = useId();
  const [ouverts, setOuverts] = useState<Set<number>>(new Set());

  function basculer(index: number) {
    setOuverts((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(index)) {
        suivant.delete(index);
      } else {
        suivant.add(index);
      }
      return suivant;
    });
  }

  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <div className={className}>
        {items.map((item, i) => {
          const btnId = `${baseId}-btn-${i}`;
          const panneauId = `${baseId}-panneau-${i}`;
          const estOuvert = ouverts.has(i);

          return (
            <div key={i} className="csContAcc">
              {/* Bouton d'activation */}
              <button
                id={btnId}
                type="button"
                aria-expanded={estOuvert}
                aria-controls={panneauId}
                onClick={() => basculer(i)}
                className="csContAccBtn"
              >
                <span>{item.question}</span>
                <IconePlus />
              </button>

              {/* Panneau de réponse */}
              <div
                id={panneauId}
                role="region"
                aria-labelledby={btnId}
                className="csContAccCorps"
                data-open={estOuvert ? "true" : "false"}
              >
                <div className="csContAccCorpsInner">
                  <p className="type-body pb-5 text-(--cs-texte-2)">{item.reponse}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
