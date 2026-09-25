"use client";

/**
 * Case à cocher du système Console.
 *
 * Le contrôle natif <input type="checkbox"> est conservé pour l'accessibilité
 * (navigation clavier native, AT) et masqué visuellement. Un visuel à coins
 * coupés et néon le remplace graphiquement.
 *
 * RGAA 11.1 : libellé relié par htmlFor (label enveloppe le contrôle).
 * RGAA 10.7 : focus visible via :has(.csCaseNatif:focus-visible).
 * RGAA 7.3 : clavier natif du checkbox géré par le navigateur.
 */

import { useId } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface CaseProps {
  id?: string;
  libelle: string;
  cochee: boolean;
  onChange: (cochee: boolean) => void;
  desactive?: boolean;
  /** Message d'erreur (ex. : case obligatoire non cochée). */
  erreur?: string;
  name?: string;
  className?: string;
}

function IconeCoche() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
    >
      <path
        d="M2 6 L5 9 L10 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
 * Case à cocher Console (contrôle natif masqué, visuel à coins coupés).
 * @example
 * <Case libelle="Accepter les conditions" cochee={accepte} onChange={setAccepte} />
 */
export function Case({
  id,
  libelle,
  cochee,
  onChange,
  desactive,
  erreur,
  name,
  className = "",
}: CaseProps) {
  const uid = useId();
  const inputId = id ?? `${uid}case`;
  const erreurId = `${uid}err`;

  return (
    <div className={className}>
      <StylesConsole />
      <StylesFormulaires />

      <label
        className="csCaseWrap"
        data-desactive={desactive ? "true" : undefined}
      >
        {/* Contrôle natif masqué visuellement, pas du DOM */}
        <input
          id={inputId}
          name={name}
          type="checkbox"
          className="csCaseNatif"
          checked={cochee}
          onChange={(e) => onChange(e.target.checked)}
          disabled={desactive}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? erreurId : undefined}
        />

        {/* Visuel à coins coupés */}
        <span aria-hidden="true" className="csCaseFond">
          {cochee ? <IconeCoche /> : null}
        </span>

        <span className="type-body text-(--cs-texte) leading-snug">{libelle}</span>
      </label>

      {erreur ? (
        <p id={erreurId} role="alert" className="csChampMsgErreur mt-1 pl-8">
          <IconeErreur />
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
