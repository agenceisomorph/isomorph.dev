/**
 * Famille « Retours » du système Console : composants de progression.
 *
 * Deux exports :
 * - `ProgressionBarre` : barre déterminée avec `role="progressbar"`.
 * - `ProgressionEtapes` : suivi d'étapes façon instrument de bord.
 *
 * Rendu serveur, aucun état. Les valeurs sont des props.
 *
 * RGAA 4.1 : `role="progressbar"`, `aria-valuenow`, `aria-valuemin`,
 * `aria-valuemax`, `aria-label` (critère 13.1) ; `aria-current="step"` sur
 * l'étape courante (critère 7.1). Contraste du texte ≥ 4.5:1.
 */

import type { CSSProperties } from "react";

import { StylesConsole } from "../fondations";
import { StylesRetours } from "./_styles";

/* ------------------------------------------------------------------ */
/* Barre de progression déterminée                                     */
/* ------------------------------------------------------------------ */

export interface ProgressionBarreProps {
  /** Valeur actuelle (entre `min` et `max`). */
  valeur: number;
  /** Valeur minimale. Par défaut : 0. */
  min?: number;
  /** Valeur maximale. Par défaut : 100. */
  max?: number;
  /**
   * Étiquette accessible de la barre.
   * Utilisée dans l'attribut `aria-label` si aucun `aria-labelledby` n'est
   * fourni par le contexte.
   */
  label: string;
  /** Affiche le pourcentage à droite de la barre. Par défaut : false. */
  afficherValeur?: boolean;
  className?: string;
}

/**
 * Barre de progression néon.
 *
 * @example
 * <ProgressionBarre valeur={65} label="Téléchargement" afficherValeur />
 */
export function ProgressionBarre({
  valeur,
  min = 0,
  max = 100,
  label,
  afficherValeur = false,
  className = "",
}: ProgressionBarreProps) {
  const pourcentage = Math.max(0, Math.min(1, (valeur - min) / (max - min)));
  const pctTexte = Math.round(pourcentage * 100);

  return (
    <div className={`w-full ${className}`}>
      <StylesConsole />
      <StylesRetours />

      {afficherValeur ? (
        <div className="mb-2 flex items-baseline justify-between gap-4">
          <span className="type-caption text-(--cs-texte-2)">{label}</span>
          <span className="type-caption tabular-nums text-(--cs-neon)" aria-hidden="true">
            {pctTexte} %
          </span>
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={valeur}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={afficherValeur ? undefined : label}
        aria-valuetext={`${pctTexte} pourcent`}
        className="csRetBarreFond"
      >
        <div
          aria-hidden="true"
          className="csRetBarreRemplissage"
          style={{ scale: `${pourcentage} 1` } as CSSProperties}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Suivi d'étapes                                                      */
/* ------------------------------------------------------------------ */

export interface EtapeDef {
  /** Libellé court de l'étape. */
  label: string;
}

export interface ProgressionEtapesProps {
  /** Liste des étapes dans l'ordre. */
  etapes: EtapeDef[];
  /**
   * Numéro de l'étape courante, à partir de 1.
   * Les étapes précédentes sont marquées comme terminées.
   */
  etapeCourante: number;
  /** Étiquette accessible de la navigation d'étapes. */
  label?: string;
  className?: string;
}

/**
 * Indicateur d'étapes façon instrument de bord.
 * Les trois étapes réelles du formulaire `/contact` servent d'exemple par défaut.
 *
 * RGAA 7.1 : `aria-current="step"` sur la pastille active, `role="list"` sur
 * la liste, libellés textuels visibles.
 *
 * @example
 * <ProgressionEtapes
 *   etapes={[{ label: "Votre projet" }, { label: "Votre contexte" }, { label: "Vous joindre" }]}
 *   etapeCourante={2}
 * />
 */
export function ProgressionEtapes({
  etapes,
  etapeCourante,
  label = "Étapes du formulaire",
  className = "",
}: ProgressionEtapesProps) {
  return (
    <nav aria-label={label} className={className}>
      <StylesConsole />
      <StylesRetours />

      <ol role="list" className="csRetEtapes">
        {etapes.map((etape, i) => {
          const n = i + 1;
          const estCourante = n === etapeCourante;
          const estFaite = n < etapeCourante;
          const estDerniere = n === etapes.length;

          return (
            <li
              key={n}
              className="csRetEtape"
              aria-current={estCourante ? "step" : undefined}
              data-faite={estFaite ? "true" : undefined}
            >
              {/* Trait entre les étapes, hors de la dernière. */}
              {!estDerniere ? (
                <span aria-hidden="true" className="csRetEtapeTrait" />
              ) : null}

              {/* Pastille */}
              <span aria-hidden="true" className="csRetEtapePastille">
                {estFaite ? (
                  /* Coche : l'étape est validée. */
                  <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                    <path
                      d="M3 8.5 L6.5 12 L13 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="type-caption tabular-nums">{n}</span>
                )}
              </span>

              {/* Libellé */}
              <span className="csRetEtapeLabel type-caption">{etape.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* Trois étapes réelles du formulaire de contact. */
export const ETAPES_CONTACT: EtapeDef[] = [
  { label: "Votre projet" },
  { label: "Votre contexte" },
  { label: "Vous joindre" },
];
