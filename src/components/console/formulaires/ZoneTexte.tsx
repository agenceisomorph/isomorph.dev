"use client";

/**
 * Zone de texte du système Console.
 *
 * RGAA 11.1 : libellé relié par htmlFor.
 * RGAA 11.9 : mention « obligatoire » écrite.
 * RGAA 11.10 : erreur reliée par aria-describedby + aria-invalid.
 * Compteur de caractères annoncé poliment (aria-live="polite") quand une
 * limite est fournie, pour éviter la surprise en fin de saisie.
 */

import { useId } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface ZoneTexteProps {
  id?: string;
  libelle: string;
  obligatoire?: boolean;
  aide?: string;
  erreur?: string;
  valide?: boolean;
  desactive?: boolean;
  placeholder?: string;
  /** Valeur courante (composant contrôlé). */
  valeur: string;
  onChange: (valeur: string) => void;
  rows?: number;
  /** Limite affichée et annoncée. */
  limiteCaracteres?: number;
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
 * Zone de texte libre du système Console.
 * @example
 * <ZoneTexte libelle="Votre projet" valeur={desc} onChange={setDesc} limiteCaracteres={2000} obligatoire />
 */
export function ZoneTexte({
  id,
  libelle,
  obligatoire,
  aide,
  erreur,
  valide,
  desactive,
  placeholder,
  valeur,
  onChange,
  rows = 5,
  limiteCaracteres,
  name,
  className = "",
}: ZoneTexteProps) {
  const uid = useId();
  const textareaId = id ?? `${uid}zone`;
  const erreurId = `${uid}err`;
  const aideId = aide ? `${uid}aide` : undefined;
  const compteId = `${uid}compte`;

  const etat = erreur ? "erreur" : valide ? "valide" : undefined;
  const longueur = valeur.length;
  const proche =
    limiteCaracteres !== undefined && longueur >= limiteCaracteres - 20;

  const describedBy =
    [
      erreur ? erreurId : undefined,
      aideId,
      limiteCaracteres !== undefined ? compteId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={className}>
      <StylesConsole />
      <StylesFormulaires />

      {/* Libellé */}
      <label
        htmlFor={textareaId}
        className="type-body mb-1.5 flex flex-wrap items-baseline gap-x-2 font-semibold text-(--cs-texte)"
      >
        {libelle}
        {obligatoire ? (
          <span className="type-caption font-normal text-(--cs-texte-3)">
            obligatoire
          </span>
        ) : null}
      </label>

      {aide ? (
        <p id={aideId} className="type-caption mb-1.5 text-(--cs-texte-3)">
          {aide}
        </p>
      ) : null}

      {/* Annonce polie du compteur pour les lecteurs d'écran */}
      {limiteCaracteres !== undefined ? (
        <span
          id={compteId}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {proche
            ? `${longueur} sur ${limiteCaracteres} caractères`
            : undefined}
        </span>
      ) : null}

      <div
        className="csChampWrap csCoupe relative"
        data-coupe="s"
        data-etat={etat}
      >
        <span aria-hidden="true" className="csChampFond" />
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />
        <textarea
          id={textareaId}
          name={name}
          className="csChampInput"
          rows={rows}
          maxLength={limiteCaracteres}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={desactive}
          aria-required={obligatoire || undefined}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={describedBy}
        />
        {/* Compteur visuel */}
        {limiteCaracteres !== undefined ? (
          <span
            aria-hidden="true"
            className="csChampCompteur"
            data-proche={proche ? "true" : undefined}
          >
            {longueur}&thinsp;/&thinsp;{limiteCaracteres}
          </span>
        ) : null}
      </div>

      {erreur ? (
        <p id={erreurId} role="alert" className="csChampMsgErreur">
          <IconeErreur />
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
