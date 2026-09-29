/**
 * Barre de navigation d'isomorph.dev — design noir et blanc.
 *
 * Liens : Plugins, Code, Expérimentations, Veille, Design System.
 * Logo ISOMORPH (wordmark vectoriel), sélecteur FR/EN.
 * Sous 1024 px : menu burger (volet plein écran).
 *
 * Composant client léger : lecture de l'URL pour l'état actif + burger.
 *
 * RGAA 12.1 : lien d'évitement.
 * RGAA 12.2 : <nav> avec aria-label, liste de liens.
 * RGAA 12.6 : aria-current="page" sur le lien actif.
 * RGAA 8.7  : hreflang sur les liens de langue.
 * Focus     : fond noir au survol et au focus (jamais d'anneau outline).
 * Éco       : aucune dépendance externe, logo SVG inline.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IsomorphLogo from "@/components/IsomorphLogo";

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
  {
    libelle: "Design system",
    libelleEn: "Design system",
    href: "/fr/design-system",
    hrefEn: "/en/design-system",
  },
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
/* Sélecteur de langue                                                 */
/* ------------------------------------------------------------------ */

function SelecteurLangue({ locale, pathname }: { locale: "fr" | "en"; pathname: string }) {
  let altHref = locale === "fr" ? pathname.replace(/^\/fr/, "/en") : pathname.replace(/^\/en/, "/fr");
  if (altHref === pathname) altHref = locale === "fr" ? "/en" : "/fr";

  const options: { code: "fr" | "en"; nom: string; href: string }[] = [
    { code: "fr", nom: "Français", href: locale === "fr" ? pathname : altHref },
    { code: "en", nom: "English", href: locale === "en" ? pathname : altHref },
  ];

  return (
    <ul role="list" aria-label={locale === "fr" ? "Langue" : "Language"} className="flex items-center gap-1">
      {options.map((o) => (
        <li key={o.code}>
          <Link
            href={o.href}
            hrefLang={o.code}
            aria-current={o.code === locale ? "page" : undefined}
            className={[
              "type-caption px-2 py-1 transition-colors duration-150",
              o.code === locale
                ? "bg-noir text-blanc"
                : "text-gris hover:text-noir focus-visible:text-noir",
            ].join(" ")}
          >
            <span aria-hidden="true">{o.code.toUpperCase()}</span>
            <span lang={o.code} className="sr-only">{o.nom}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Focus piège dans le volet mobile                                   */
/* ------------------------------------------------------------------ */

const FOCUSABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function elemsFocusables(racine: HTMLElement): HTMLElement[] {
  return Array.from(racine.querySelectorAll<HTMLElement>(FOCUSABLES));
}

/* ------------------------------------------------------------------ */
/* Menu burger                                                         */
/* ------------------------------------------------------------------ */

function MenuBurger({
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
    const racine = document.documentElement;
    const avant = racine.style.overflow;
    racine.style.overflow = "hidden";
    fermerBtnRef.current?.focus();

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); fermer(true); return; }
      if (e.key !== "Tab" || !voletRef.current) return;
      const cibles = elemsFocusables(voletRef.current);
      if (!cibles.length) return;
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      const actif = document.activeElement;
      const dedans = actif instanceof Node && voletRef.current.contains(actif);
      if (e.shiftKey && (actif === premier || !dedans)) { e.preventDefault(); dernier.focus(); }
      else if (!e.shiftKey && (actif === dernier || !dedans)) { e.preventDefault(); premier.focus(); }
    };

    const grandEcran = window.matchMedia("(min-width: 1024px)");
    const surLargeur = (e: MediaQueryListEvent) => { if (e.matches) fermer(false); };

    document.addEventListener("keydown", surTouche);
    grandEcran.addEventListener("change", surLargeur);
    return () => {
      racine.style.overflow = avant;
      document.removeEventListener("keydown", surTouche);
      grandEcran.removeEventListener("change", surLargeur);
    };
  }, [ouvert, fermer]);

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        aria-label={libelles.menu}
        aria-expanded={ouvert}
        aria-controls="mobile-nav-dev"
        onClick={() => setOuvert(true)}
        className="lg:hidden flex h-10 w-10 items-center justify-center hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {ouvert && typeof document !== "undefined" && createPortal(
        <div
          ref={voletRef}
          id="mobile-nav-dev"
          role="dialog"
          aria-modal="true"
          aria-label={libelles.menu}
          className="fixed inset-0 z-50 flex flex-col bg-blanc"
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 md:px-6 border-b border-[var(--trait)]">
            <span aria-hidden="true" className="flex h-11 items-center px-1">
              <IsomorphLogo className="h-[14px] w-auto text-noir" />
            </span>
            <button
              ref={fermerBtnRef}
              type="button"
              aria-label={libelles.fermer}
              onClick={() => fermer(true)}
              className="flex h-10 w-10 items-center justify-center hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav aria-label={libelles.nav} className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            <ul role="list" className="flex flex-col">
              {liens.map((lien) => {
                const href = locale === "fr" ? lien.href : lien.hrefEn;
                const libelle = locale === "fr" ? lien.libelle : lien.libelleEn;
                const courant = estCourant(href, pathname);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={courant ? "page" : undefined}
                      onClick={() => fermer(false)}
                      className={[
                        "type-body flex items-center py-4 border-b border-[var(--trait)] transition-colors duration-150",
                        courant
                          ? "font-semibold text-noir"
                          : "text-gris hover:text-noir focus-visible:text-noir",
                      ].join(" ")}
                    >
                      {libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 px-4 py-4 md:px-6 border-t border-[var(--trait)]" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 type-caption bg-noir text-blanc"
      >
        {locale === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>

      <header className="fixed inset-x-0 top-0 z-40 bg-blanc border-b border-[var(--trait)]">
        <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 xl:px-8">
          {/* Logo */}
          <Link
            href={accueilHref}
            aria-label={locale === "fr" ? "Accueil ISOMORPH" : "ISOMORPH home"}
            className="flex h-11 shrink-0 items-center px-1 hover:opacity-70 focus-visible:opacity-70 transition-opacity duration-150"
          >
            <IsomorphLogo className="h-[14px] w-auto text-noir" />
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
                      className={[
                        "type-caption px-3 py-2 inline-block transition-colors duration-150",
                        courant
                          ? "text-noir font-semibold border-b-2 border-noir"
                          : "text-gris hover:text-noir focus-visible:text-noir",
                      ].join(" ")}
                    >
                      {libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Droite */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <SelecteurLangue locale={locale} pathname={pathname} />
            </div>
            <MenuBurger locale={locale} liens={LIENS} pathname={pathname} />
          </div>
        </div>
      </header>
    </>
  );
}
