/**
 * Fiche projet : grille de métadonnées dans un panneau de verre.
 *
 * Chaque ligne affiche un libellé discret et une valeur. Les valeurs peuvent
 * contenir du JSX (tags, liens, listes) via le type ReactNode.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *   - Critère 9.1 : liste de définition (dl/dt/dd) pour une association
 *     sémantique libellé / valeur, lisible par les lecteurs d'écran.
 *   - Critère 10.7 : focus visible par le bord néon (pas d'outline).
 * Eco : Server Component, aucune image, aucun script.
 */

import type { ReactNode } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { StylesPages } from "./StylesPages";

export interface LigneFiche {
  libelle: string;
  contenu: ReactNode;
}

export interface FicheProjetProps {
  lignes: LigneFiche[];
  className?: string;
}

export function FicheProjet({ lignes, className = "" }: FicheProjetProps) {
  return (
    <>
      <StylesConsole />
      <StylesPages />
      <Panneau coupe="m" as="aside" className={`csPagFiche ${className}`}>
        <p className="sr-only">Informations du projet</p>
        <dl>
          {lignes.map((l) => (
            <div key={l.libelle} className="csPagFicheLigne">
              <dt className="type-caption uppercase tracking-[0.12em] text-(--cs-texte-3)">
                {l.libelle}
              </dt>
              <dd className="type-caption min-w-0 [overflow-wrap:anywhere] text-(--cs-texte-2)">
                {l.contenu}
              </dd>
            </div>
          ))}
        </dl>
      </Panneau>
    </>
  );
}
