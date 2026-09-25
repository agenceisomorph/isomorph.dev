/**
 * Relevé à la manière des écrans d'Oblivion : un libellé fin en capitales
 * espacées, souligné d'un filet, puis de grands chiffres fins.
 *
 * Couleurs lues dans des variables (`--rl-libelle`, `--rl-valeur`,
 * `--rl-filet`, `--rl-accent`, `--rl-alerte`) : les jetons Console par
 * défaut, la palette proposée dans l'échantillon.
 */

import { StylesIdentite } from "./StylesIdentite";

export interface Mesure {
  libelle: string;
  valeur: string;
  ton?: "accent" | "alerte";
}

/*
 * Coordonnées de Toulon : infobox de https://fr.wikipedia.org/wiki/Toulon,
 * 43° 07′ 20″ N et 5° 55′ 48″ E, consultée le 23 septembre 2026, soit
 * 43,1222 et 5,9300 en degrés décimaux. « A1 » et « XX » sont des codes
 * décoratifs, sans valeur.
 */
export const LATITUDE_TOULON = "43,1222";
export const LONGITUDE_TOULON = "5,9300";

export function Releve({ mesures }: { mesures: readonly Mesure[] }) {
  return (
    <>
      <StylesIdentite />
      <dl className="csIdReleve">
        {mesures.map((m) => (
          <div key={m.libelle}>
            <dt className="type-caption csIdLibelle">{m.libelle}</dt>
            <dd className="type-display csIdValeur" data-ton={m.ton}>
              {m.valeur}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
