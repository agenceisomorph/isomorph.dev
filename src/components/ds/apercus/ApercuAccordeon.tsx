/**
 * Aperçu vivant — Accordéon.
 * Client Component : état ouvert/fermé.
 * RGAA : aria-expanded, aria-controls, aria-labelledby.
 */

"use client";

import { useState } from "react";

interface Props { fr: boolean; }

const ITEMS_FR = [
  { question: "Compatible avec Strapi v5 ?", reponse: "Oui, le plugin cible Strapi 5.x et supérieur." },
  { question: "Peut-on personnaliser l'apparence ?", reponse: "Chaque composant expose des variables CSS que l'on peut surcharger." },
  { question: "Licence open source ?", reponse: "Les plugins publiés par ISOMORPH sont distribués sous licence MIT." },
];

const ITEMS_EN = [
  { question: "Compatible with Strapi v5?", reponse: "Yes, the plugin targets Strapi 5.x and above." },
  { question: "Can I customize the appearance?", reponse: "Each component exposes CSS variables that can be overridden." },
  { question: "Open source license?", reponse: "ISOMORPH's published plugins are distributed under the MIT license." },
];

export default function ApercuAccordeon({ fr }: Props) {
  const [ouvert, setOuvert] = useState<number | null>(0);
  const items = fr ? ITEMS_FR : ITEMS_EN;

  return (
    <dl className="w-full max-w-lg divide-y divide-[var(--trait)] border-t border-[var(--trait)]">
      {items.map((item, i) => (
        <div key={i}>
          <dt>
            <button
              type="button"
              id={`apercu-acc-btn-${i}`}
              aria-expanded={ouvert === i}
              aria-controls={`apercu-acc-panneau-${i}`}
              onClick={() => setOuvert(ouvert === i ? null : i)}
              className="type-body w-full flex items-center justify-between py-4 text-left hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150 px-1"
            >
              <span className="text-noir">{item.question}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className={`h-4 w-4 shrink-0 text-gris transition-transform duration-200 ${ouvert === i ? "rotate-180" : ""}`}
              >
                <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </dt>
          <dd
            id={`apercu-acc-panneau-${i}`}
            role="region"
            aria-labelledby={`apercu-acc-btn-${i}`}
            hidden={ouvert !== i}
            className="type-body text-gris pb-4 px-1"
          >
            {item.reponse}
          </dd>
        </div>
      ))}
    </dl>
  );
}
