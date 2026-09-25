/**
 * Barre de navigation d'isomorph.dev — système Console.
 *
 * Liens : Plugins, Code, Expérimentations, Veille.
 * Logo ISOMORPH (wordmark vectoriel), sélecteur FR/EN.
 * Sous 1024 px : menu burger.
 *
 * Composant serveur : état courant calculé depuis l'URL, sans script.
 * Seul le menu burger est un îlot client.
 *
 * RGAA 12.1 : lien d'évitement.
 * RGAA 12.2 : <nav> avec aria-label, liste de liens.
 * RGAA 12.6 : aria-current="page" sur le lien actif.
 * RGAA 8.7 : hreflang sur les liens de langue.
 * Éco-conception : aucune dépendance externe, logo SVG inline.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IsomorphLogo from "@/components/IsomorphLogo";
import { StylesConsole } from "@/components/console/fondations";
import { StylesNavigation } from "@/components/console/navigation/FilAriane";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface LienNav {
  libelle: string;
  libelleEn: string;
  href: string;
  hrefEn: string;
}

/* ------------------------------------------------------------------ */
/* Données de navigation                                               */
/* ------------------------------------------------------------------ */

const LIENS: LienNav[] = [
  { libelle: "Plugins", libelleEn: "Plugins", href: "/fr/plugins", hrefEn: "/en/plugins" },
  { libelle: "Code", libelleEn: "Code", href: "/fr/code", hrefEn: "/en/code" },
  {
    libelle: "Expérimentations",
    libelleEn: "Experiments",
    href: "/fr/experimentations",
    hrefEn: "/en/experimentations",
  },
  { libelle: "Veille", libelleEn: "Tech watch", href: "/fr/veille", hrefEn: "/en/veille" },
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function estLocale(pathname: string): "fr" | "en" {
  return pathname.startsWith("/en") ? "en" : "fr";
}

function estCourant(lienHref: string, pathname: string): boolean {
  return pathname === lienHref || pathname.startsWith(lienHref + "/");
}

/* ------------------------------------------------------------------ */
/* Composant sélecteur de langue                                       */
/* ------------------------------------------------------------------ */

function SelecteurLangue({ locale, pathname }: { locale: "fr" | "en"; pathname: string }) {
  // Calculer l'URL dans l'autre langue
  let altHref = locale === "fr" ? pathname.replace(/^\/fr/, "/en") : pathname.replace(/^\/en/, "/fr");
  // Sécurité : si remplacement sans effet, pointer l'accueil de l'autre locale
  if (altHref === pathname) {
    altHref = locale === "fr" ? "/en" : "/fr";
  }

  const options = [
    { code: "fr" as const, nom: "Français", href: locale === "fr" ? pathname : altHref },
    { code: "en" as const, nom: "English", href: locale === "en" ? pathname : altHref },
  ];

  return (
    <ul
      role="list"
      aria-label={locale === "fr" ? "Langue" : "Language"}
      className="csNavLangue"
    >
      {options.map((o) => (
        <li key={o.code}>
          <Link
            href={o.href}
            hrefLang={o.code}
            aria-current={o.code === locale ? "page" : undefined}
            className="csNavLangueLien type-caption font-semibold uppercase tracking-[0.12em]"
          >
            <span aria-hidden="true">{o.code}</span>
            <span lang={o.code} className="sr-only">
              {o.nom}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Éléments focusables dans le volet                                  */
/* ------------------------------------------------------------------ */

const FOCUSABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function elemsFocusables(racine: HTMLElement): HTMLElement[] {
  return Array.from(racine.querySelectorAll<HTMLElement>(FOCUSABLES));
}

/* ------------------------------------------------------------------ */
/* Menu burger — îlot client RGAA 12.8                                */
/*                                                                     */
/* Overlay plein écran via portail document.body, défilement bloqué,  */
/* focus piégé dans le volet (Tab/Maj+Tab), Escape ferme et restitue  */
/* le focus au bouton déclencheur.                                     */
/* ------------------------------------------------------------------ */

function MenuBurgerDev({
  locale,
  liens,
  pathname,
}: {
  locale: "fr" | "en";
  liens: LienNav[];
  pathname: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const voletRef = useRef<HTMLDivElement>(null);
  const fermerBtnRef = useRef<HTMLButtonElement>(null);

  const libelles = {
    menu: locale === "fr" ? "Menu principal" : "Main menu",
    fermer: locale === "fr" ? "Fermer le menu" : "Close menu",
    nav: locale === "fr" ? "Navigation mobile" : "Mobile navigation",
  };

  const fermer = useCallback((rendreFocus: boolean) => {
    setOuvert(false);
    if (rendreFocus) boutonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!ouvert) return;

    /* Bloquer le défilement — RGAA 13.8 */
    const racine = document.documentElement;
    const avant = racine.style.overflow;
    racine.style.overflow = "hidden";

    /* Focus initial sur le bouton de fermeture */
    fermerBtnRef.current?.focus();

    const surTouche = (e: KeyboardEvent) => {
      /* Escape ferme — RGAA 12.8 */
      if (e.key === "Escape") {
        e.preventDefault();
        fermer(true);
        return;
      }

      /* Piège de focus — Tab et Maj+Tab bouclent dans le volet */
      if (e.key !== "Tab" || !voletRef.current) return;
      const cibles = elemsFocusables(voletRef.current);
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

    /* Passage en grand écran : fermer sans garder le focus */
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

  /* Un lien cliqué : la page change, le volet se ferme */
  const surClicLien = () => fermer(false);

  return (
    <>
      {/* Bouton hamburger */}
      <button
        ref={boutonRef}
        type="button"
        aria-label={libelles.menu}
        aria-expanded={ouvert}
        aria-controls="mobile-nav-dev"
        onClick={() => setOuvert(true)}
        className="csNavLien type-caption font-semibold uppercase tracking-[0.12em] lg:hidden flex items-center gap-1"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Volet plein écran via portail — RGAA 12.8 */}
      {ouvert &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={voletRef}
            id="mobile-nav-dev"
            role="dialog"
            aria-modal="true"
            aria-label={libelles.menu}
            className="fixed inset-0 z-50 flex flex-col text-white"
            style={{ background: "var(--cs-surface-2)", backdropFilter: "blur(14px)" }}
          >
            {/* Bandeau supérieur : logo + bouton de fermeture */}
            <div
              className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 md:px-6"
              style={{ borderBottom: "1px solid var(--cs-trait)" }}
            >
              <span aria-hidden="true" className="flex h-11 items-center px-1 text-white">
                <svg viewBox="16 0 88 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-[14px] w-auto">
                  <path d="M20.2917 0.733643V11.1668H16.7871V0.733643H20.2917Z" />
                  <path d="M30.3848 1.56698C29.9995 2.41195 29.6216 3.24036 29.2387 4.07586C28.9467 3.95988 28.6644 3.83681 28.3724 3.7374C27.6656 3.49598 26.9342 3.39184 26.1833 3.44391C26.0753 3.45101 25.9624 3.48178 25.8618 3.52675C25.5869 3.64509 25.5403 3.91728 25.7759 4.09716C25.9256 4.21077 26.1047 4.30071 26.2839 4.36225C26.7281 4.51136 27.1797 4.63917 27.6288 4.77645C28.3503 4.99657 29.0522 5.25929 29.6584 5.70663C30.5812 6.38829 30.9125 7.309 30.7873 8.39539C30.6229 9.82024 29.7001 10.6155 28.3626 11.0463C27.3907 11.3587 26.387 11.406 25.3758 11.3445C24.3328 11.2806 23.3192 11.0936 22.3694 10.6581C22.0627 10.5185 21.7755 10.3409 21.4688 10.1753C21.8811 9.3161 22.2762 8.49006 22.6787 7.64746C23.0836 7.91018 23.5131 8.08533 23.972 8.19657C24.7623 8.38829 25.5599 8.47113 26.3698 8.35278C26.4851 8.33621 26.598 8.29598 26.706 8.25337C26.8655 8.19184 27.0054 8.09716 27.0128 7.91491C27.0201 7.73503 26.9023 7.61669 26.7502 7.54095C26.5784 7.45811 26.3968 7.38237 26.2127 7.32793C25.6114 7.15042 24.9954 7.01077 24.404 6.80722C23.9794 6.66284 23.5622 6.47586 23.1793 6.24864C22.2197 5.67823 21.7853 4.81432 21.8123 3.73977C21.8467 2.34095 22.6394 1.36343 24.0874 0.890062C24.9512 0.606038 25.8397 0.5516 26.7404 0.591837C27.8202 0.639174 28.8681 0.826156 29.8474 1.2948C30.0241 1.38 30.1983 1.47468 30.3824 1.56935L30.3848 1.56698Z" />
                </svg>
              </span>
              <button
                ref={fermerBtnRef}
                type="button"
                aria-label={libelles.fermer}
                onClick={() => fermer(true)}
                className="flex h-11 w-11 items-center justify-center rounded"
                style={{ color: "var(--cs-texte)" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav
              aria-label={libelles.nav}
              className="flex-1 overflow-y-auto px-4 py-4 md:px-6"
            >
              <ul role="list" className="flex flex-col gap-1">
                {liens.map((lien) => {
                  const href = locale === "fr" ? lien.href : lien.hrefEn;
                  const libelle = locale === "fr" ? lien.libelle : lien.libelleEn;
                  const courant = estCourant(href, pathname);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={courant ? "page" : undefined}
                        onClick={surClicLien}
                        className="csNavLien type-body font-semibold flex items-center gap-2 py-3 px-2"
                      >
                        {courant && <span aria-hidden="true" className="csNavRepere" />}
                        {libelle}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Pied du volet : sélecteur de langue */}
            <div
              className="shrink-0 px-4 py-4 md:px-6"
              style={{
                borderTop: "1px solid var(--cs-trait)",
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <SelecteurLangue locale={locale} pathname={pathname} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Barre principale                                                    */
/* ------------------------------------------------------------------ */

export default function BarreIsomorphDev() {
  const pathname = usePathname() ?? "/fr";
  const locale = estLocale(pathname);
  const accueilHref = locale === "en" ? "/en" : "/fr";

  return (
    <>
      {/* Lien d'évitement — RGAA 12.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:px-4 focus:py-2 focus:rounded type-caption font-semibold"
        style={{ background: "var(--cs-neon)", color: "var(--cs-fond)" }}
      >
        {locale === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>

      <StylesConsole />
      <StylesNavigation />

      <header className="fixed inset-x-0 top-0 z-40">
        <div className="csNavBarre text-white">
          <span aria-hidden="true" className="csNavBarreVerre" />
          <span aria-hidden="true" className="csNavFilet" />

          <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
            {/* Logo */}
            <Link
              href={accueilHref}
              aria-label={locale === "fr" ? "Accueil ISOMORPH" : "ISOMORPH home"}
              className="csNavLogo flex h-11 shrink-0 items-center px-1"
            >
              <IsomorphLogo className="h-[14px] w-auto" />
            </Link>

            {/* Navigation desktop */}
            <nav
              aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"}
              className="hidden lg:block"
            >
              <ul role="list" className="flex items-center">
                {LIENS.map((lien) => {
                  const href = locale === "fr" ? lien.href : lien.hrefEn;
                  const libelle = locale === "fr" ? lien.libelle : lien.libelleEn;
                  const courant = estCourant(href, pathname);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={courant ? "page" : undefined}
                        className="csNavLien type-caption font-semibold uppercase tracking-[0.12em]"
                      >
                        {courant && <span aria-hidden="true" className="csNavRepere" />}
                        {libelle}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Droite : langue (desktop) + burger (mobile) */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <SelecteurLangue locale={locale} pathname={pathname} />
              </div>
              <MenuBurgerDev locale={locale} liens={LIENS} pathname={pathname} />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
