"use client";

/**
 * Champ de saisie du système Console (texte, email, téléphone).
 *
 * RGAA 11.1 : libellé relié par htmlFor.
 * RGAA 11.9 : mention « obligatoire » écrite, pas seulement un astérisque.
 * RGAA 11.10 : erreur reliée par aria-describedby et aria-invalid.
 * RGAA 10.7 : au focus, le cadre du champ s'allume (aucun anneau).
 * Contraste texte d'aide : --cs-texte-3 (rgba(255,255,255,0.56)) dépasse 4,5:1
 * sur --cs-surface-2 (#040a14, ~rgba(4,10,20,1)).
 */

import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface ChampProps {
  /** Identifiant HTML. Généré automatiquement si absent. */
  id?: string;
  libelle: string;
  type?: "text" | "email" | "tel";
  /** Mention « obligatoire » écrite à côté du libellé. */
  obligatoire?: boolean;
  /** Texte d'aide affiché sous le libellé. */
  aide?: string;
  /** Message d'erreur. Sa présence active aria-invalid et le trait rouge. */
  erreur?: string;
  /** Trait vert, utilisé après validation. */
  valide?: boolean;
  desactive?: boolean;
  placeholder?: string;
  /** Valeur courante (composant contrôlé). */
  valeur: string;
  onChange: (valeur: string) => void;
  onBlur?: () => void;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  name?: string;
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
 * Champ de saisie texte / email / téléphone du système Console.
 * @example
 * <Champ libelle="Prénom" valeur={prenom} onChange={setPrenom} obligatoire />
 */
export function Champ({
  id,
  libelle,
  type = "text",
  obligatoire,
  aide,
  erreur,
  valide,
  desactive,
  placeholder,
  valeur,
  onChange,
  onBlur,
  autoComplete,
  name,
  className = "",
}: ChampProps) {
  const uid = useId();
  const inputId = id ?? `${uid}champ`;
  const erreurId = `${uid}err`;
  const aideId = aide ? `${uid}aide` : undefined;

  const etat = erreur ? "erreur" : valide ? "valide" : undefined;
  const describedBy =
    [erreur ? erreurId : undefined, aideId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <StylesConsole />
      <StylesFormulaires />

      {/* Libellé : RGAA 11.1 */}
      <label
        htmlFor={inputId}
        className="type-body mb-1.5 flex flex-wrap items-baseline gap-x-2 font-semibold text-(--cs-texte)"
      >
        {libelle}
        {obligatoire ? (
          <span className="type-caption font-normal text-(--cs-texte-3)">
            obligatoire
          </span>
        ) : null}
      </label>

      {/* Aide : lue avant l'input */}
      {aide ? (
        <p id={aideId} className="type-caption mb-1.5 text-(--cs-texte-3)">
          {aide}
        </p>
      ) : null}

      {/* Wrapper coupé : csCoupe s, fond et bord */}
      <div
        className="csChampWrap csCoupe relative"
        data-coupe="s"
        data-etat={etat}
      >
        <span aria-hidden="true" className="csChampFond" />
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />
        <input
          id={inputId}
          name={name}
          type={type}
          className="csChampInput"
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={desactive}
          aria-required={obligatoire || undefined}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      {/* Erreur : RGAA 11.10 */}
      {erreur ? (
        <p id={erreurId} role="alert" className="csChampMsgErreur">
          <IconeErreur />
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
