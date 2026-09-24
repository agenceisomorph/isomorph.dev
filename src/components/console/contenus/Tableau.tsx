/**
 * Tableau de données.
 *
 * Le défilement horizontal est contenu dans une zone focusable nommée
 * sur mobile (role="region", tabIndex, aria-labelledby sur la caption).
 *
 * RGAA 4.1 :
 *  - Critère 5.4 : caption obligatoire.
 *  - Critère 5.7 : th avec scope sur chaque colonne.
 *  - Critère 13.9 : zone de défilement accessible au clavier.
 * Éco : Server Component, aucun script.
 */

import { useId } from "react";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export interface ColonneTableau {
  /** Intitulé de la colonne. */
  label: string;
  /** Alignement du contenu de la colonne (texte à gauche par défaut). */
  align?: "left" | "right";
  /** Chiffres en tabular-nums. */
  numerique?: boolean;
}

export interface LigneTableau {
  /** Une cellule par colonne, dans l'ordre de `colonnes`. */
  cellules: string[];
}

export interface TableauProps {
  /** Légende accessible, aussi l'intitulé de la zone de défilement. */
  legende: string;
  colonnes: ColonneTableau[];
  lignes: LigneTableau[];
  className?: string;
}

/**
 * Tableau de données accessible.
 * Les colonnes numériques s'affichent en tabular-nums pour l'alignement des chiffres.
 */
export function Tableau({ legende, colonnes, lignes, className = "" }: TableauProps) {
  /* Identifiant stable pour aria-labelledby. Pas de useId (Server Component) :
     on dérive un slug depuis la légende, utilisé une seule fois par tableau. */
  /* Identifiant unique même pour deux tableaux de même légende. */
  const captionId = useId();

  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className={`csContTableauZone ${className}`}
      >
        <table className="csContTableau">
          <caption id={captionId}>{legende}</caption>
          <thead>
            <tr>
              {colonnes.map((col) => (
                <th
                  key={col.label}
                  scope="col"
                  style={{ textAlign: col.align ?? "left" }}
                  className={col.numerique ? "csContTableauNum" : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => (
              <tr key={i}>
                {ligne.cellules.map((cellule, j) => (
                  <td
                    key={j}
                    style={{ textAlign: colonnes[j]?.align ?? "left" }}
                    className={colonnes[j]?.numerique ? "csContTableauNum" : undefined}
                  >
                    {cellule}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
