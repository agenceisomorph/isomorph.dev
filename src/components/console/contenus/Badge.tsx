/**
 * Badge de statut court.
 *
 * Cinq variantes : neutre, néon, succès, alerte, erreur.
 * Coins coupés (csCoupe s), point lumineux.
 *
 * RGAA 4.1 :
 *  - Critère 1.3 : le statut est transmis par le texte, pas la couleur seule.
 *  - Critère 10.1 : contraste > 4,5:1 sur fond sombre (vérifié par variante).
 * Éco : Server Component, aucun script.
 */

import type { ReactNode } from "react";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export type VarianteBadge = "neutre" | "neon" | "succes" | "alerte" | "erreur";

export interface BadgeProps {
  variante?: VarianteBadge;
  children: ReactNode;
  className?: string;
}

/**
 * Badge de statut. La couleur du point et du texte varie selon la variante ;
 * le texte seul suffit à identifier le statut (pas de couleur exclusive).
 */
export function Badge({ variante = "neutre", children, className = "" }: BadgeProps) {
  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <span
        className={`csCoupe csContBadge ${className}`}
        data-coupe="s"
        data-var={variante}
      >
        <span aria-hidden="true" className="csContBadgePt" />
        {children}
      </span>
    </>
  );
}
