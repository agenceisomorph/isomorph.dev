/**
 * Groupe de champs du système Console.
 *
 * Wrapper sémantique : <fieldset> avec <legend> stylée en Etiquette Console.
 * Pas de "use client" : composant purement descriptif, aucune interaction.
 *
 * RGAA 11.6 : les champs d'un groupe logique sont regroupés dans un fieldset
 * dont la legend décrit le groupe.
 */

import type { ReactNode } from "react";
import { StylesConsole, Etiquette } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface GroupeChampsProps {
  legende: string;
  aide?: string;
  children: ReactNode;
  className?: string;
}

/**
 * fieldset Console avec légende en style Etiquette.
 * @example
 * <GroupeChamps legende="Coordonnées">
 *   <Champ libelle="Prénom" ... />
 *   <Champ libelle="Nom" ... />
 * </GroupeChamps>
 */
export function GroupeChamps({
  legende,
  aide,
  children,
  className = "",
}: GroupeChampsProps) {
  return (
    <fieldset className={`border-none p-0 ${className}`}>
      <StylesConsole />
      <StylesFormulaires />

      <legend className="mb-3 w-full">
        <Etiquette>{legende}</Etiquette>
      </legend>

      {aide ? (
        <p className="type-caption mb-3 text-(--cs-texte-3)">{aide}</p>
      ) : null}

      {children}
    </fieldset>
  );
}
