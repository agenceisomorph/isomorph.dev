"use client";

/**
 * Groupe de boutons radio du système Console.
 *
 * Le fieldset/legend regroupe sémantiquement les options.
 * Les contrôles natifs <input type="radio"> sont conservés pour l'accessibilité
 * (navigation clavier native, AT) et masqués visuellement. Un point néon les
 * remplace graphiquement.
 *
 * RGAA 11.6 : options reliées au groupe par fieldset/legend.
 * RGAA 11.9 : mention « obligatoire » sur la légende.
 * RGAA 10.7 : focus visible via :has(.csRadioNatif:focus-visible).
 */

import { useId } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface OptionRadio {
  valeur: string;
  libelle: string;
}

export interface RadioProps {
  /** Nom du groupe radio (attribut name sur chaque input). */
  nom: string;
  legende: string;
  options: OptionRadio[];
  /** Valeur sélectionnée (composant contrôlé). */
  valeur: string;
  onChange: (valeur: string) => void;
  obligatoire?: boolean;
  aide?: string;
  erreur?: string;
  desactive?: boolean;
  className?: string;
}

function IconeErreur() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="mt-px shrink-0"
    >
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 4v3.5M7 9.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Groupe de boutons radio Console (point néon sur contrôle natif masqué).
 * @example
 * <Radio nom="budget" legende="Budget envisagé" options={budgets} valeur={budget} onChange={setBudget} />
 */
export function Radio({
  nom,
  legende,
  options,
  valeur,
  onChange,
  obligatoire,
  aide,
  erreur,
  desactive,
  className = "",
}: RadioProps) {
  const uid = useId();
  const erreurId = `${uid}err`;
  const aideId = aide ? `${uid}aide` : undefined;

  return (
    <fieldset className={`border-none p-0 ${className}`}>
      <StylesConsole />
      <StylesFormulaires />

      <legend className="type-body mb-1.5 flex flex-wrap items-baseline gap-x-2 font-semibold text-(--cs-texte)">
        {legende}
        {obligatoire ? (
          <span className="type-caption font-normal text-(--cs-texte-3)">
            obligatoire
          </span>
        ) : null}
      </legend>

      {aide ? (
        <p id={aideId} className="type-caption mb-2 text-(--cs-texte-3)">
          {aide}
        </p>
      ) : null}

      <div className="space-y-2" role="group">
        {options.map((opt) => {
          const optId = `${uid}${opt.valeur}`;
          const isChecked = opt.valeur === valeur;
          const isDisabled = desactive;
          return (
            <label key={opt.valeur} className="csRadioWrap" data-desactive={isDisabled ? "true" : undefined}>
              {/* Contrôle natif masqué visuellement */}
              <input
                id={optId}
                type="radio"
                name={nom}
                value={opt.valeur}
                className="csRadioNatif"
                checked={isChecked}
                onChange={() => onChange(opt.valeur)}
                disabled={isDisabled}
                aria-describedby={
                  [erreur ? erreurId : undefined, aideId]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
              />

              {/* Visuel : cercle + point néon */}
              <span aria-hidden="true" className="csRadioFond">
                <span className="csRadioPoint" />
              </span>

              <span className="type-body text-(--cs-texte)">{opt.libelle}</span>
            </label>
          );
        })}
      </div>

      {erreur ? (
        <p id={erreurId} role="alert" className="csChampMsgErreur mt-2">
          <IconeErreur />
          {erreur}
        </p>
      ) : null}
    </fieldset>
  );
}
