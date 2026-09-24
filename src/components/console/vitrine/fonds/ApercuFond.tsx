/**
 * Aperçu d'un fond de section dans l'atelier Console : une vraie section
 * (titre, phrase, deux boutons) posée sur le fond choisi, pour juger la
 * lisibilité autant que le fond.
 *
 * Seul le fond choisi est monté : un seul dessin tourne à la fois.
 *
 * Textes repris de `grilles/SectionCta.tsx` (sources indiquées là-bas).
 *
 * "use client" : choix du fond.
 */

"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { StylesApparition } from "../../animations/styles";
import { Bouton } from "../../Bouton";
import { StylesConsole, Trace } from "../../fondations";

export interface VarianteFond {
  id: string;
  label: string;
  fond: ReactNode;
}

const CSS = `
.csFondApercu {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  min-height: 560px;
  padding: 72px 24px;
  background: var(--cs-fond);
  overflow: hidden;
}
@media (max-width: 767px) {
  .csFondApercu { min-height: 480px; padding: 56px 16px; }
}
.csFondCouche {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.csFondContenu {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 640px;
  text-align: center;
}
.csFondBoutons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}
`;

export function ApercuFond({ groupe, variantes }: { groupe: string; variantes: readonly VarianteFond[] }) {
  const [choix, setChoix] = useState(variantes[0]?.id ?? "");
  const courante = variantes.find((v) => v.id === choix) ?? variantes[0];

  return (
    <>
      <StylesConsole />
      <StylesApparition />
      <style href="cs-fond-apercu" precedence="ds">
        {CSS}
      </style>

      {/* Un seul fond : rien à choisir, pas de sélecteur. */}
      {variantes.length > 1 ? (
        <div className="csAppCmds mb-6" role="group" aria-label={groupe}>
          <div className="csAppVariantes">
            {variantes.map((v) => (
              <button
                key={v.id}
                type="button"
                className="csAppBtnVariante csCoupe csTracable"
                data-coupe="s"
                aria-pressed={v.id === courante?.id}
                onClick={() => setChoix(v.id)}
              >
                <span aria-hidden="true" className="csBord" />
                <span aria-hidden="true" className="csDiag" data-coin="hg" />
                <span aria-hidden="true" className="csDiag" data-coin="bd" />
                <Trace />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="csFondApercu csCoupe" data-coupe="l" data-fond={courante?.id}>
        <div aria-hidden="true" className="csFondCouche" key={courante?.id}>
          {courante?.fond}
        </div>
        <div className="csFondContenu">
          <h4 className="type-h2 text-balance text-white">Décrivez votre projet, nous répondons par un cadrage écrit</h4>
          <p className="type-lead text-(--cs-texte-2)">Le cadrage précède le chiffrage, et il vous appartient.</p>
          <div className="csFondBoutons">
            <Bouton href="/contact" taille="l" variante="principal">
              Démarrer un projet
            </Bouton>
            <Bouton href="/developpement" taille="l" variante="secondaire">
              Voir nos prestations
            </Bouton>
          </div>
        </div>
      </div>
    </>
  );
}
