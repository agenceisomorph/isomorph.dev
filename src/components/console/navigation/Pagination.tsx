/**
 * Pagination du système Console : précédent, suivant, pages en petits carrés
 * coupés, page courante en accent, points de suspension.
 *
 * Composant serveur, aucun script : les adresses se construisent ici, à partir
 * d'un chemin et d'un paramètre, jamais par une fonction confiée au navigateur.
 *
 * Mobile : la liste complète (page courante et ses voisines) passe sous
 * 640 px à une liste resserrée (première, courante, dernière), rendue à part
 * et masquée par CSS : aucun défilement horizontal à 375 px, rendu serveur
 * identique au premier rendu navigateur.
 *
 * RGAA :
 *  - 12.2 : `nav` nommée, liste de liens ;
 *  - 12.6 : page courante `aria-current="page"`, en plus de l'aplat néon ;
 *  - 6.1 : chaque numéro est nommé « Page N » (le numéro visible reste dans le nom) ;
 *  - 11.1 : cibles de 44 x 44 px ;
 *  - bouton précédent ou suivant sans objet : masqué des technologies
 *    d'assistance, visible en retrait.
 */

import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import { StylesConsole } from "../fondations";
import { StylesNavigation } from "./FilAriane";

/* ------------------------------------------------------------------ */
/* Utilitaires purs                                                    */
/* ------------------------------------------------------------------ */

export type ElementPagination = number | "ellipse";

/**
 * Adresse d'une page. La page 1 garde l'adresse nue (adresse canonique), les
 * autres portent le paramètre. Les autres paramètres du chemin sont conservés.
 *
 * Test minimal proposé :
 *   adresseDePage("/actualites", 1) === "/actualites"
 *   adresseDePage("/actualites", 3) === "/actualites?page=3"
 *   adresseDePage("/actualites?tri=date", 2) === "/actualites?tri=date&page=2"
 *   adresseDePage("/atelier/console", 2, "page", "navigation") === "/atelier/console?page=2#navigation"
 */
export function adresseDePage(chemin: string, page: number, parametre = "page", ancre?: string): string {
  const [base, requete = ""] = chemin.split("?");
  const params = new URLSearchParams(requete);
  if (page <= 1) params.delete(parametre);
  else params.set(parametre, String(page));
  const texte = params.toString();
  return `${base}${texte ? `?${texte}` : ""}${ancre ? `#${ancre}` : ""}`;
}

/**
 * Pages à montrer : la première, la dernière, la courante et `voisins` pages
 * de part et d'autre. Un trou d'une seule page montre cette page plutôt que
 * des points de suspension (qui prendraient autant de place).
 *
 * Test minimal proposé :
 *   pagesAffichees(4, 12)    → [1, 2, 3, 4, 5, "ellipse", 12]
 *   pagesAffichees(4, 12, 0) → [1, "ellipse", 4, "ellipse", 12]
 *   pagesAffichees(1, 3)     → [1, 2, 3]
 *   pagesAffichees(1, 0)     → []
 */
export function pagesAffichees(courante: number, total: number, voisins = 1): ElementPagination[] {
  if (total <= 0) return [];
  const c = Math.min(Math.max(1, Math.trunc(courante)), total);
  const retenues = new Set<number>([1, total]);
  for (let p = c - voisins; p <= c + voisins; p += 1) {
    if (p >= 1 && p <= total) retenues.add(p);
  }
  const sortie: ElementPagination[] = [];
  let precedente = 0;
  for (const p of [...retenues].sort((a, b) => a - b)) {
    if (p - precedente === 2) sortie.push(p - 1);
    else if (p - precedente > 2) sortie.push("ellipse");
    sortie.push(p);
    precedente = p;
  }
  return sortie;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

const LIBELLES = {
  fr: { zone: "Pagination", precedent: "Précédent", suivant: "Suivant", page: "Page" },
  en: { zone: "Pagination", precedent: "Previous", suivant: "Next", page: "Page" },
} as const;

export interface PaginationProps {
  pageCourante: number;
  totalPages: number;
  /** Adresse de la liste, page 1. */
  chemin: string;
  /** Nom du paramètre de page dans l'adresse. */
  parametre?: string;
  /** Ancre ajoutée à chaque adresse, sans le « # ». */
  ancre?: string;
  locale?: Locale;
  className?: string;
}

/** Cadre coupé commun aux cases : fond, bord et diagonales. */
function Cadre() {
  return (
    <>
      <span aria-hidden="true" className="csNavPageFond" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
    </>
  );
}

function Chevron({ sens }: { sens: "gauche" | "droite" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-(--cs-neon)">
      <path
        d={sens === "gauche" ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Pagination({
  pageCourante,
  totalPages,
  chemin,
  parametre = "page",
  ancre,
  locale = "fr",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const l = LIBELLES[locale];
  const courante = Math.min(Math.max(1, Math.trunc(pageCourante)), totalPages);
  const adresse = (n: number) => adresseDePage(chemin, n, parametre, ancre);

  const cases = (elements: ElementPagination[]) =>
    elements.map((el, i) =>
      el === "ellipse" ? (
        <li key={`e${i}`} aria-hidden="true" className="csNavEllipse">
          …
        </li>
      ) : (
        <li key={el}>
          <Link
            href={adresse(el)}
            aria-current={el === courante ? "page" : undefined}
            aria-label={`${l.page} ${el}`}
            className="csNavPage csCoupe type-body"
            data-coupe="s"
          >
            <Cadre />
            {el}
          </Link>
        </li>
      ),
    );

  const saut = (sens: "precedent" | "suivant") => {
    const cible = sens === "precedent" ? courante - 1 : courante + 1;
    const possible = cible >= 1 && cible <= totalPages;
    const contenu = (
      <>
        <Cadre />
        {sens === "precedent" ? <Chevron sens="gauche" /> : null}
        <span className="max-sm:sr-only">{l[sens]}</span>
        {sens === "suivant" ? <Chevron sens="droite" /> : null}
      </>
    );
    return possible ? (
      <Link href={adresse(cible)} rel={sens === "precedent" ? "prev" : "next"} className="csNavPage csCoupe type-caption" data-coupe="s">
        {contenu}
      </Link>
    ) : (
      <span aria-hidden="true" className="csNavPage csCoupe type-caption" data-coupe="s" data-inactif="">
        {contenu}
      </span>
    );
  };

  return (
    <nav aria-label={l.zone} className={className}>
      <StylesConsole />
      <StylesNavigation />
      <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-3">
        {saut("precedent")}
        <ul role="list" className="hidden items-center gap-1.5 sm:flex">
          {cases(pagesAffichees(courante, totalPages, 1))}
        </ul>
        <ul role="list" className="flex items-center gap-1 sm:hidden">
          {cases(pagesAffichees(courante, totalPages, 0))}
        </ul>
        {saut("suivant")}
      </div>
    </nav>
  );
}
