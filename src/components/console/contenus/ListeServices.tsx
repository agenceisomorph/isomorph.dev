/**
 * Liste de services en lignes, façon console.
 *
 * Reprend et généralise le style hcLigne du hero (HeroConsole.tsx) :
 * numéro d'instrument, titre, description, flèche. Chaque ligne est
 * un lien. Un seul nav pour l'ensemble de la liste.
 *
 * RGAA 4.1 :
 *  - Critère 6.1 : chaque lien a un intitulé issu du titre visible.
 *  - Critère 10.1 : focus visible sur chaque lien.
 *  - Critère 12.1 : le nav est nommé via aria-label.
 * Éco : Server Component.
 */

import Link from "next/link";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

export interface LigneService {
  /** Numéro d'instrument, padded à 2 chiffres. */
  numero?: number;
  titre: string;
  /** Description courte, affichée sous le titre. */
  description?: string;
  href: string;
  /** Lien externe : s'ouvre dans un nouvel onglet. */
  externe?: boolean;
}

export interface ListeServicesProps {
  /** Intitulé accessible du nav (ex. "Services"). */
  label: string;
  items: LigneService[];
  className?: string;
}

/**
 * Liste de services en lignes de console.
 * Grille à trois colonnes : numéro | contenu | flèche.
 */
export function ListeServices({ label, items, className = "" }: ListeServicesProps) {
  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <nav aria-label={label} className={className}>
        <ul role="list">
          {items.map((item, i) => {
            const num = item.numero ?? i + 1;
            const attributsLien = {
              className:
                "csContLigne grid min-h-[64px] grid-cols-[44px_1fr_20px] items-center gap-x-2 px-6 py-2.5",
              ...(item.externe
                ? { target: "_blank" as const, rel: "noopener noreferrer" }
                : {}),
            };

            const corps = (
              <>
                <span aria-hidden="true" className="csContLigneIdx type-caption tabular-nums">
                  {String(num).padStart(2, "0")}
                </span>
                <span>
                  <span className="type-h3 font-semibold block text-white">{item.titre}</span>
                  {item.description ? (
                    <span className="type-caption block text-(--cs-texte-3)">
                      {item.description}
                    </span>
                  ) : null}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="csContLigneFleche h-4 w-4"
                >
                  <path
                    d="M7 4L13 10L7 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </>
            );

            return (
              <li key={item.titre}>
                {item.externe ? (
                  <a href={item.href} {...attributsLien}>
                    {corps}
                  </a>
                ) : (
                  <Link href={item.href} {...attributsLien}>
                    {corps}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
