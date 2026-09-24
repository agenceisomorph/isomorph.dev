/**
 * Relevé d'instrument : libellé, valeur et unité.
 *
 * Réservé aux chiffres réels. La source des données se cite en commentaire
 * de code à l'appel, jamais dans le rendu visible.
 *
 * RGAA 4.1 :
 *  - Critère 10.7 : contrastes ≥ 4,5:1.
 * Éco : Server Component.
 */

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export interface LectureProps {
  /** Libellé de la mesure (ex. "Prise en charge"). */
  libelle: string;
  /** Valeur affichée (ex. "50" ou "1,4 s"). */
  valeur: string;
  /** Unité affichée à côté de la valeur (ex. "%", "€ HT"). Optionnel. */
  unite?: string;
  className?: string;
}

/**
 * Relevé d'instrument.
 * Utiliser uniquement avec des données réelles et sourcées.
 * Citer la source en commentaire à l'appel.
 */
export function Lecture({ libelle, valeur, unite, className = "" }: LectureProps) {
  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <div className={`csContLecture ${className}`}>
        <p className="type-caption uppercase tracking-[0.16em] text-(--cs-neon)">{libelle}</p>
        <p className="csContLectureVal">
          <span className="type-h1 font-semibold text-white">{valeur}</span>
          {unite ? (
            <span className="type-body text-(--cs-texte-2)">{unite}</span>
          ) : null}
        </p>
        {/* Trait d'instrument sous la valeur */}
        <span aria-hidden="true" className="block h-px w-8 bg-(--cs-neon) opacity-60" />
      </div>
    </>
  );
}
