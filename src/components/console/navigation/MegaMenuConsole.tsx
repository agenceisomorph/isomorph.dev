"use client";

/**
 * Méga-menu du système Console : le panneau ouvert depuis « Compétences ».
 *
 * « use client » justifié : ouverture au survol (délai d'intention), au clic
 * et au clavier ; fermeture par Échap, clic extérieur, sortie du focus ou
 * choix d'un lien ; relevé qui suit le survol et le focus des éléments.
 *
 * Contenus : uniquement `chrome/expertiseNav.ts` (familles, sous-groupes,
 * descriptions, lien Bpifrance), résolus pour la langue affichée. Aucun texte
 * propre au composant hors des libellés de structure déjà présents sur le site
 * (« Dispositif Bpifrance »).
 *
 * Deux exports :
 *  - `MegaMenuConsole` : le déclencheur et le panneau, posé dans `BarreConsole` ;
 *  - `PanneauMegaMenu` : le panneau seul, rendu ouvert dans le flux (vitrine).
 *
 * Ouverture : le verre apparaît, le cadre se trace côté après côté, puis le
 * bord néon définitif s'allume ; les colonnes s'allument en décalé. Tout est
 * en CSS (feuille `console-navigation`), neutralisé en mouvement réduit.
 *
 * RGAA :
 *  - 7.1 : motif « disclosure » (bouton + liens), pas de rôle `menu` ;
 *    `aria-expanded`, `aria-controls` ;
 *  - 7.3 : Échap ferme et rend le focus au déclencheur ; Flèche bas ouvre et
 *    place le focus sur le premier lien ; le panneau suit le déclencheur dans
 *    l'ordre de tabulation ;
 *  - 13.9 / WCAG 1.4.13 : délai d'intention de 150 ms, grâce de 200 ms pour
 *    rejoindre le panneau au pointeur, panneau persistant une fois cliqué ;
 *  - 9.3 : chaque liste est nommée par son titre de colonne ;
 *  - 1.2 : le relevé reprend la description du lien : il est masqué des
 *    technologies d'assistance, la description est reliée au lien par
 *    `aria-describedby` ;
 *  - 3.2 : texte blanc ou blanc 72 % sur verre presque opaque (plus de 9:1) ;
 *  - 12.6 : page courante `aria-current="page"`, graisse 600 et losange néon.
 */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

import {
  BPIFRANCE_LINK,
  EXPERTISE_FAMILIES,
  familyHubHref,
  isFamilyVisible,
  resolveExpertiseLink,
  type ExpertiseLink,
} from "@/components/chrome/expertiseNav";
import type { Locale } from "@/lib/i18n";
import { Panneau } from "../fondations";
import { StylesNavigation, estCourant } from "./FilAriane";

/* ------------------------------------------------------------------ */
/* Modèle du menu                                                      */
/* ------------------------------------------------------------------ */

export interface LigneMenu {
  href: string;
  libelle: string;
  desc?: string;
  /** Rang dans l'ensemble du menu (1 à N), pour le relevé. */
  rang: number;
  famille: string;
}

export interface ColonneMenu {
  titre: string;
  hub?: string;
  lignes: LigneMenu[];
  groupes: { titre: string; lignes: LigneMenu[] }[];
}

interface Releve {
  href: string;
  libelle: string;
  desc?: string;
  rang?: number;
  famille: string;
}

export interface ModeleMenu {
  colonnes: ColonneMenu[];
  total: number;
  /** Lien Bpifrance, pages françaises seulement. */
  bpifrance: { href: string; libelle: string; desc?: string } | null;
  /** Ce que le relevé affiche, par adresse. */
  releves: Map<string, Releve>;
}

/** Intitulé déjà employé par le menu mobile actuel (`chrome/NavBar.tsx`). */
export const TITRE_BPIFRANCE = "Dispositif Bpifrance";

function construireMenu(locale: Locale): ModeleMenu {
  let rang = 0;
  const colonnes = EXPERTISE_FAMILIES.filter((f) => isFamilyVisible(f, locale)).map((famille) => {
    const titre = locale === "en" ? (famille.headingEn ?? famille.heading) : famille.heading;
    const vers = (item: ExpertiseLink): LigneMenu | null => {
      const r = resolveExpertiseLink(item, locale);
      if (!r) return null;
      rang += 1;
      return { href: r.href, libelle: r.label, desc: r.desc, rang, famille: titre };
    };
    const garder = (l: LigneMenu | null): l is LigneMenu => l !== null;
    return {
      titre,
      hub: familyHubHref(famille, locale),
      lignes: famille.items.map(vers).filter(garder),
      groupes: (famille.subGroups ?? [])
        .map((sg) => ({ titre: sg.heading, lignes: sg.items.map(vers).filter(garder) }))
        .filter((g) => g.lignes.length > 0),
    };
  });
  const bpifrance =
    locale === "fr" ? { href: BPIFRANCE_LINK.href, libelle: BPIFRANCE_LINK.label, desc: BPIFRANCE_LINK.desc } : null;
  const releves = new Map<string, Releve>();
  for (const col of colonnes) {
    for (const l of [...col.lignes, ...col.groupes.flatMap((g) => g.lignes)]) releves.set(l.href, l);
  }
  if (bpifrance) releves.set(bpifrance.href, { ...bpifrance, famille: TITRE_BPIFRANCE });
  return { colonnes, total: rang, bpifrance, releves };
}

/** Calculé une fois par langue : la source est statique. */
const MENUS: Record<Locale, ModeleMenu> = { fr: construireMenu("fr"), en: construireMenu("en") };

/** Le même modèle sert au menu burger : une seule lecture de `expertiseNav.ts`. */
export function modeleMenu(locale: Locale): ModeleMenu {
  return MENUS[locale];
}

const deuxChiffres = (n: number) => String(n).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Panneau                                                             */
/* ------------------------------------------------------------------ */

export interface PanneauMegaMenuProps {
  locale?: Locale;
  /** Adresse de la page affichée, pour `aria-current`. */
  cheminCourant?: string;
  /** Identifiant du panneau, cible de `aria-controls`. */
  id?: string;
  className?: string;
}

/** Le panneau du méga-menu, rendu ouvert dans le flux. */
export function PanneauMegaMenu({ locale = "fr", cheminCourant, id, className = "" }: PanneauMegaMenuProps) {
  const menu = MENUS[locale];
  const base = useId();

  /* Relevé par défaut : Bpifrance en français (convention du menu actuel),
     le premier élément sinon. */
  const premier = menu.colonnes[0]?.lignes[0];
  const [actif, setActif] = useState<string | undefined>(menu.bpifrance?.href ?? premier?.href);

  const releve = actif ? menu.releves.get(actif) : undefined;

  const idDesc = (rang: number | "bpi") => `${base}-desc-${rang}`;

  const ligne = (l: { href: string; libelle: string; desc?: string }, cleDesc: number | "bpi") => {
    const courant = estCourant(l.href, cheminCourant);
    return (
      <li key={l.href}>
        <Link
          href={l.href}
          aria-current={courant ? "page" : undefined}
          aria-describedby={l.desc ? idDesc(cleDesc) : undefined}
          onPointerEnter={() => setActif(l.href)}
          onFocus={() => setActif(l.href)}
          className="csNavLigne type-body"
        >
          <span className="min-w-0">{l.libelle}</span>
          {courant ? <span aria-hidden="true" className="csNavRepere ml-auto" /> : null}
        </Link>
        {l.desc ? (
          <span id={idDesc(cleDesc)} hidden>
            {l.desc}
          </span>
        ) : null}
      </li>
    );
  };

  return (
    <div id={id} className={`csNavMegaPose ${className}`}>
      <StylesNavigation />
      <Panneau coupe="l" accent equerres flou className="csNavMega">
        <span aria-hidden="true" className="csNavTrace" data-cote="haut" />
        <span aria-hidden="true" className="csNavTrace" data-cote="droite" />
        <span aria-hidden="true" className="csNavTrace" data-cote="bas" />
        <span aria-hidden="true" className="csNavTrace" data-cote="gauche" />

        <div className="grid gap-x-6 gap-y-8 p-6 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(240px,280px)] lg:p-8">
          {menu.colonnes.map((col, i) => {
            const idTitre = `${base}-col-${i}`;
            const hubCourant = col.hub !== undefined && cheminCourant === col.hub;
            const titre = (
              <>
                <span aria-hidden="true" className="tabular-nums text-(--cs-neon)/60">
                  {deuxChiffres(i + 1)}
                </span>
                {col.titre}
              </>
            );
            return (
              <div key={col.titre} className="csAllume min-w-0" style={{ animationDelay: `${80 + i * 70}ms` }}>
                <p id={idTitre} className="type-caption font-semibold uppercase tracking-[0.16em]">
                  {col.hub ? (
                    <Link href={col.hub} aria-current={hubCourant ? "page" : undefined} className="csNavTitre">
                      {titre}
                    </Link>
                  ) : (
                    <span className="csNavTitre">{titre}</span>
                  )}
                </p>
                <span
                  aria-hidden="true"
                  className="block h-px w-10 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                />
                <ul role="list" aria-labelledby={idTitre} className="mt-3">
                  {col.lignes.map((l) => ligne(l, l.rang))}
                </ul>
                {col.groupes.map((g, gi) => {
                  const idGroupe = `${idTitre}-g${gi}`;
                  return (
                    <div key={g.titre} className="mt-4">
                      <p id={idGroupe} className="type-caption flex items-center gap-3 pl-4 text-(--cs-texte-3)">
                        {g.titre}
                        <span aria-hidden="true" className="h-px flex-1 bg-white/[0.08]" />
                      </p>
                      <ul role="list" aria-labelledby={idGroupe} className="mt-1">
                        {g.lignes.map((l) => ligne(l, l.rang))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Relevé d'instrument : la description de l'élément survolé ou
              atteint au clavier. Masqué des aides techniques : chaque lien
              porte déjà sa description. */}
          <div
            className="csAllume flex min-w-0 flex-col gap-5 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-white/[0.07] lg:pl-6"
            style={{ animationDelay: `${80 + menu.colonnes.length * 70}ms` }}
          >
            {releve ? (
              <div aria-hidden="true">
                <Panneau coupe="s" className="px-5 pb-5 pt-4">
                  <div key={releve.href} className="csNavFlash min-h-[172px]">
                    <p className="type-caption flex items-center justify-between gap-3 uppercase tracking-[0.16em] text-(--cs-neon)">
                      <span className="truncate">{releve.famille}</span>
                      {releve.rang ? (
                        <span className="shrink-0 tabular-nums text-(--cs-texte-3)">
                          {deuxChiffres(releve.rang)} / {deuxChiffres(menu.total)}
                        </span>
                      ) : null}
                    </p>
                    <p className="type-h3 mt-3 text-white">{releve.libelle}</p>
                    {releve.desc ? <p className="type-body mt-2 text-(--cs-texte-2)">{releve.desc}</p> : null}
                  </div>
                  <div className="csNavGraduation mt-4">
                    {Array.from({ length: menu.total }, (_, i) => (
                      <span key={i} data-actif={releve.rang === i + 1 ? "" : undefined} />
                    ))}
                  </div>
                </Panneau>
              </div>
            ) : null}

            {menu.bpifrance ? (
              <div className="mt-auto border-t border-white/[0.07] pt-4">
                <p
                  id={`${base}-bpi`}
                  className="type-caption font-semibold uppercase tracking-[0.16em] text-(--cs-texte-3)"
                >
                  {TITRE_BPIFRANCE}
                </p>
                <ul role="list" aria-labelledby={`${base}-bpi`} className="mt-2">
                  {ligne(menu.bpifrance, "bpi")}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Panneau>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Déclencheur et panneau                                              */
/* ------------------------------------------------------------------ */

export interface MegaMenuConsoleProps {
  /** Libellé du déclencheur : « Compétences » en français, « Services » en anglais. */
  libelle: string;
  locale?: Locale;
  /** Adresse de la page affichée, pour `aria-current`. */
  cheminCourant?: string;
}

/**
 * Déclencheur de la barre et son panneau. Le panneau se place sous la barre,
 * sur toute la largeur de son conteneur : `BarreConsole` le positionne
 * (`relative` sur le conteneur), aucun ancêtre intermédiaire ne l'est.
 */
export function MegaMenuConsole({ libelle, locale = "fr", cheminCourant }: MegaMenuConsoleProps) {
  const [ouvert, setOuvert] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Ouvert au survol : se referme quand le pointeur s'en va. Cliqué : reste. */
  const parSurvol = useRef(false);
  /** Ouvert par Flèche bas : le focus va au premier lien une fois rendu. */
  const focusPremier = useRef(false);
  const panneauId = useId();

  const annuler = useCallback(() => {
    if (minuterie.current) {
      clearTimeout(minuterie.current);
      minuterie.current = null;
    }
  }, []);

  const fermer = useCallback(
    (rendreFocus = false) => {
      annuler();
      parSurvol.current = false;
      setOuvert(false);
      if (rendreFocus) boutonRef.current?.focus();
    },
    [annuler],
  );

  useEffect(() => annuler, [annuler]);

  useEffect(() => {
    if (!ouvert) return;
    if (focusPremier.current) {
      focusPremier.current = false;
      document.getElementById(panneauId)?.querySelector<HTMLElement>("a[href]")?.focus();
    }
    const surTouche = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fermer(true);
      }
    };
    const surPointeur = (e: globalThis.PointerEvent) => {
      if (!zoneRef.current?.contains(e.target as Node)) fermer();
    };
    document.addEventListener("keydown", surTouche);
    document.addEventListener("pointerdown", surPointeur);
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("pointerdown", surPointeur);
    };
  }, [ouvert, fermer, panneauId]);

  const surEntree = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    annuler();
    if (!ouvert) {
      minuterie.current = setTimeout(() => {
        parSurvol.current = true;
        setOuvert(true);
      }, 150);
    }
  };

  const surSortie = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    annuler();
    if (!ouvert || parSurvol.current) minuterie.current = setTimeout(() => fermer(), 200);
  };

  const surClic = () => {
    annuler();
    /* Ouvert par le survol puis cliqué : le clic épingle le panneau au lieu
       de le refermer sous le pointeur. */
    if (ouvert && parSurvol.current) {
      parSurvol.current = false;
      return;
    }
    parSurvol.current = false;
    setOuvert((v) => !v);
  };

  const surToucheBouton = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    annuler();
    parSurvol.current = false;
    focusPremier.current = true;
    if (ouvert) {
      focusPremier.current = false;
      document.getElementById(panneauId)?.querySelector<HTMLElement>("a[href]")?.focus();
    } else {
      setOuvert(true);
    }
  };

  /* Le focus quitte le déclencheur et le panneau : fermeture. */
  const surPerteFocus = (e: FocusEvent<HTMLDivElement>) => {
    const suivant = e.relatedTarget as Node | null;
    if (ouvert && suivant && !zoneRef.current?.contains(suivant)) fermer();
  };

  /* Un lien choisi : la page change, le panneau se ferme. */
  const surClicZone = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a[href]")) fermer();
  };

  return (
    <div ref={zoneRef} onPointerEnter={surEntree} onPointerLeave={surSortie} onBlur={surPerteFocus} onClick={surClicZone}>
      <StylesNavigation />
      <button
        ref={boutonRef}
        type="button"
        aria-expanded={ouvert}
        aria-controls={panneauId}
        onClick={surClic}
        onKeyDown={surToucheBouton}
        className="csNavLien type-caption font-semibold uppercase tracking-[0.12em]"
      >
        {libelle}
        <svg aria-hidden="true" viewBox="0 0 12 12" className="csNavChevron">
          <path d="M2 4.5 L6 8.5 L10 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
      </button>

      {ouvert ? (
        <div className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto px-6 pb-4 pt-2 xl:px-8">
          <PanneauMegaMenu id={panneauId} locale={locale} cheminCourant={cheminCourant} />
        </div>
      ) : null}
    </div>
  );
}
