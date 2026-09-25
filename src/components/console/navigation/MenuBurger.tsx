"use client";

/**
 * Menu burger du système Console : bouton trois traits qui devient croix, et
 * panneau plein écran sous 1024 px.
 *
 * « use client » justifié : ouverture, familles dépliées, piège du focus,
 * blocage du défilement, fermeture par Échap ou au passage en grand écran.
 *
 * Contenus : le modèle du méga-menu (`modeleMenu`, lu dans
 * `chrome/expertiseNav.ts`), les liens principaux et l'appel principal reçus
 * de la barre. Aucun texte propre au composant hors des libellés d'interface
 * déjà présents sur le site (« Menu principal », « Fermer le menu »).
 *
 * Deux exports :
 *  - `MenuBurger` : le bouton et son panneau modal, posé dans `BarreConsole` ;
 *  - `PanneauBurger` : le panneau seul, rendu ouvert dans le flux (vitrine).
 *
 * Rendu serveur identique au premier rendu navigateur : le panneau modal
 * n'existe qu'après un clic, dans un portail vers `document.body`.
 *
 * RGAA :
 *  - 7.1 : `role="dialog"`, `aria-modal`, nom accessible ; bouton avec
 *    `aria-expanded` et `aria-controls` ; familles en motif « disclosure » ;
 *  - 7.3 et 12.8 : focus placé sur la fermeture à l'ouverture, piégé dans le
 *    panneau (Tab et Maj+Tab bouclent), Échap ferme, focus rendu au bouton ;
 *  - 13.8 : défilement de la page bloqué tant que le panneau est ouvert ;
 *  - 11.1 : cibles de 44 px au moins (bouton 44 x 44, entrées de 56 px) ;
 *  - 12.6 : page courante `aria-current="page"` et barre néon, pas la couleur seule ;
 *  - 3.2 : texte blanc sur fond nuit opaque (plus de 18:1).
 */

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import IsomorphLogo from "@/components/IsomorphLogo";
import { t, type Locale } from "@/lib/i18n";
import { Bouton } from "../Bouton";
import { Etiquette, StylesConsole } from "../fondations";
import { StylesNavigation, estCourant } from "./FilAriane";
import { modeleMenu, type ColonneMenu, type LigneMenu } from "./MegaMenuConsole";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface LienPrincipal {
  libelle: string;
  href: string;
}

export interface AppelPrincipal {
  libelle: string;
  href: string;
}

interface ContenuCommun {
  locale?: Locale;
  /** Adresse de la page affichée, pour `aria-current` et la famille ouverte au départ. */
  cheminCourant?: string;
  /** Liens de premier niveau hors compétences, dans l'ordre de la barre. */
  liens: LienPrincipal[];
  /** Appel principal, en bas du panneau. */
  appel: AppelPrincipal;
  /** Sélecteur de langue, rendu par le serveur. */
  langue?: ReactNode;
}

const LIBELLES = {
  fr: { menu: "Menu principal", fermer: "Fermer le menu" },
  en: { menu: "Main menu", fermer: "Close menu" },
} as const;

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/** Éléments qui peuvent recevoir le focus, hors panneaux repliés. */
const FOCUSABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(racine: HTMLElement): HTMLElement[] {
  return Array.from(racine.querySelectorAll<HTMLElement>(FOCUSABLES)).filter((el) => !el.closest("[hidden]"));
}

/** Famille contenant la page affichée : dépliée au départ. */
function familleCourante(colonnes: ColonneMenu[], chemin: string | undefined): string | null {
  if (!chemin) return null;
  const trouvee = colonnes.find(
    (col) =>
      (col.hub !== undefined && estCourant(col.hub, chemin)) ||
      [...col.lignes, ...col.groupes.flatMap((g) => g.lignes)].some((l) => estCourant(l.href, chemin)),
  );
  return trouvee?.titre ?? null;
}

/* ------------------------------------------------------------------ */
/* Pièces                                                              */
/* ------------------------------------------------------------------ */

function Traits() {
  return (
    <>
      <span aria-hidden="true" className="csNavTrait" data-t="h" />
      <span aria-hidden="true" className="csNavTrait" data-t="m" />
      <span aria-hidden="true" className="csNavTrait" data-t="b" />
    </>
  );
}

/** Bord coupé du bouton : bord et diagonales du système. */
function CadreBouton() {
  return (
    <>
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
    </>
  );
}

function Plus() {
  return (
    <span aria-hidden="true" className="csNavPlus">
      <span />
      <span />
    </span>
  );
}

function Fleche() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="csNavFleche h-4 w-4 justify-self-end">
      <path d="M3 8 H12.5 M8.5 4 L12.5 8 L8.5 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function Index({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="csNavIndex type-caption tabular-nums">
      {deuxChiffres(n)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Contenu du panneau                                                  */
/* ------------------------------------------------------------------ */

interface ContenuProps extends ContenuCommun {
  /** Bouton de fermeture (panneau modal) ou croix décorative (panneau en place). */
  fermeture: ReactNode;
}

function ContenuBurger({ locale = "fr", cheminCourant, liens, appel, langue, fermeture }: ContenuProps) {
  const menu = modeleMenu(locale);
  const base = useId();
  const [ouverte, setOuverte] = useState<string | null>(() => familleCourante(menu.colonnes, cheminCourant));

  const ligne = (l: LigneMenu | { href: string; libelle: string }) => {
    const courant = estCourant(l.href, cheminCourant);
    return (
      <li key={l.href}>
        <Link href={l.href} aria-current={courant ? "page" : undefined} className="csNavLigne type-body">
          <span className="min-w-0">{l.libelle}</span>
        </Link>
      </li>
    );
  };

  let rang = 0;
  const rangees: ReactNode[] = [];

  menu.colonnes.forEach((col, i) => {
    rang += 1;
    const n = rang;
    const deplie = ouverte === col.titre;
    const idTitre = `${base}-fam-${i}`;
    const idRegion = `${base}-region-${i}`;
    const basculer = () => setOuverte((v) => (v === col.titre ? null : col.titre));
    const libelle = (
      <span id={idTitre} className="type-h3 min-w-0">
        {col.titre}
      </span>
    );

    rangees.push(
      <li key={col.titre} className="csNavRangee csAllume" style={{ animationDelay: `${60 + n * 40}ms` }}>
        {col.hub ? (
          /* Le titre mène à l'accueil de la famille, la bascule est un bouton voisin. */
          <div className="flex items-stretch">
            <Link
              href={col.hub}
              aria-current={cheminCourant === col.hub ? "page" : undefined}
              className="csNavEntree min-w-0 flex-1"
              data-scinde=""
            >
              <Index n={n} />
              {libelle}
            </Link>
            <button
              type="button"
              aria-expanded={deplie}
              aria-controls={idRegion}
              aria-labelledby={idTitre}
              onClick={basculer}
              className="csNavBascule"
            >
              <Plus />
            </button>
          </div>
        ) : (
          <button type="button" aria-expanded={deplie} aria-controls={idRegion} onClick={basculer} className="csNavEntree">
            <Index n={n} />
            {libelle}
            <Plus />
          </button>
        )}
        <div id={idRegion} hidden={!deplie} className="pb-3 pl-11 pr-3">
          <ul role="list" aria-labelledby={idTitre} className="csNavFlash">
            {col.lignes.map(ligne)}
          </ul>
          {col.groupes.map((g, gi) => {
            const idGroupe = `${idTitre}-g${gi}`;
            return (
              <div key={g.titre} className="csNavFlash mt-3">
                <p id={idGroupe} className="type-caption flex items-center gap-3 pl-4 text-(--cs-texte-3)">
                  {g.titre}
                  <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
                </p>
                <ul role="list" aria-labelledby={idGroupe} className="mt-1">
                  {g.lignes.map(ligne)}
                </ul>
              </div>
            );
          })}
        </div>
      </li>,
    );
  });

  const entreeLien = (href: string, libelle: string, cle: string, espace = false) => {
    rang += 1;
    const n = rang;
    return (
      <li
        key={cle}
        className={`csNavRangee csAllume ${espace ? "mt-6" : ""}`}
        style={{ animationDelay: `${60 + n * 40}ms` }}
      >
        <Link href={href} aria-current={estCourant(href, cheminCourant) ? "page" : undefined} className="csNavEntree">
          <Index n={n} />
          <span className="type-h3 min-w-0">{libelle}</span>
          <Fleche />
        </Link>
      </li>
    );
  };

  if (menu.bpifrance) rangees.push(entreeLien(menu.bpifrance.href, menu.bpifrance.libelle, "bpifrance"));
  liens.forEach((l, i) => rangees.push(entreeLien(l.href, l.libelle, l.href, i === 0)));

  return (
    <>
      {/* Bandeau : même géométrie que la barre, la fermeture prend la place du bouton. */}
      <div className="shrink-0 border-b border-white/[0.07]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          <span aria-hidden="true" className="flex h-11 items-center px-1 text-white">
            <IsomorphLogo className="h-[14px] w-auto" />
          </span>
          {fermeture}
        </div>
      </div>

      <nav
        aria-label={LIBELLES[locale].menu}
        className="mx-auto w-full min-h-0 max-w-[1280px] flex-1 overflow-y-auto px-4 pb-6 pt-5 md:px-6"
      >
        <Etiquette className="mb-2 pl-4">{t.nav.expertises[locale]}</Etiquette>
        <ul role="list">{rangees}</ul>
      </nav>

      <div
        className="shrink-0 border-t border-(--cs-neon-doux) px-4 pt-4 md:px-6"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3">
          {langue ? <div className="flex justify-center">{langue}</div> : null}
          <Bouton href={appel.href} taille="l" className="w-full">
            {appel.libelle}
          </Bouton>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Panneau en place (vitrine)                                          */
/* ------------------------------------------------------------------ */

export interface PanneauBurgerProps extends ContenuCommun {
  /** Hauteur et cadre, posés par la page qui l'accueille. */
  className?: string;
}

/**
 * Le panneau du menu burger rendu ouvert dans le flux, sans comportement
 * modal : la croix y est un dessin, les familles se déplient.
 */
export function PanneauBurger({ className = "", ...contenu }: PanneauBurgerProps) {
  return (
    <div className={`csNavVolet csGrille relative flex flex-col text-white ${className}`}>
      <StylesConsole />
      <StylesNavigation />
      <ContenuBurger
        {...contenu}
        fermeture={
          <span aria-hidden="true" className="csNavBurger csCoupe" data-coupe="s" data-etat="croix">
            <CadreBouton />
            <Traits />
          </span>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bouton et panneau modal                                             */
/* ------------------------------------------------------------------ */

export type MenuBurgerProps = ContenuCommun;

export function MenuBurger({ locale = "fr", ...contenu }: MenuBurgerProps) {
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const voletRef = useRef<HTMLDivElement>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);
  const voletId = useId();
  const l = LIBELLES[locale];

  const fermer = useCallback((rendreFocus: boolean) => {
    setOuvert(false);
    if (rendreFocus) boutonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!ouvert) return;
    const racine = document.documentElement;
    const avant = racine.style.overflow;
    racine.style.overflow = "hidden";
    fermerRef.current?.focus();

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fermer(true);
        return;
      }
      if (e.key !== "Tab" || !voletRef.current) return;
      const cibles = focusables(voletRef.current);
      if (cibles.length === 0) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      const actif = document.activeElement;
      const dedans = actif instanceof Node && voletRef.current.contains(actif);
      if (e.shiftKey && (actif === premier || !dedans)) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && (actif === dernier || !dedans)) {
        e.preventDefault();
        premier.focus();
      }
    };

    /* Passage en grand écran (rotation, fenêtre agrandie) : la barre reprend
       ses liens, le panneau n'a plus d'objet. */
    const grandEcran = window.matchMedia("(min-width: 1024px)");
    const surLargeur = (e: MediaQueryListEvent) => {
      if (e.matches) fermer(false);
    };

    document.addEventListener("keydown", surTouche);
    grandEcran.addEventListener("change", surLargeur);
    return () => {
      racine.style.overflow = avant;
      document.removeEventListener("keydown", surTouche);
      grandEcran.removeEventListener("change", surLargeur);
    };
  }, [ouvert, fermer]);

  /* Un lien choisi : la page change, le panneau se ferme. */
  const surClicVolet = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a[href]")) fermer(false);
  };

  return (
    <>
      <StylesConsole />
      <StylesNavigation />
      <button
        ref={boutonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={ouvert}
        aria-controls={voletId}
        onClick={() => setOuvert(true)}
        className="csNavBurger csCoupe"
        data-coupe="s"
        data-etat={ouvert ? "croix" : "traits"}
      >
        <CadreBouton />
        <Traits />
      </button>

      {ouvert
        ? createPortal(
            <div
              ref={voletRef}
              id={voletId}
              role="dialog"
              aria-modal="true"
              aria-label={l.menu}
              onClick={surClicVolet}
              className="csNavVolet csGrille fixed inset-0 z-50 flex flex-col text-white"
            >
              <ContenuBurger
                locale={locale}
                {...contenu}
                fermeture={
                  <button
                    ref={fermerRef}
                    type="button"
                    aria-label={l.fermer}
                    onClick={() => fermer(true)}
                    className="csNavBurger csCoupe"
                    data-coupe="s"
                    data-etat="croix"
                    data-naissance=""
                  >
                    <CadreBouton />
                    <Traits />
                  </button>
                }
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
