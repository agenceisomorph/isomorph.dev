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

import { useState } from "react";
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
/* Menu burger (îlot client)                                           */
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-controls="mobile-nav-dev"
        aria-label={
          ouvert
            ? locale === "fr"
              ? "Fermer le menu"
              : "Close menu"
            : locale === "fr"
              ? "Ouvrir le menu"
              : "Open menu"
        }
        className="csNavLien type-caption font-semibold uppercase tracking-[0.12em] lg:hidden flex items-center gap-1"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-150 ${ouvert ? "rotate-90" : ""}`}
        >
          {ouvert ? (
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {ouvert && (
        <div
          id="mobile-nav-dev"
          className="absolute inset-x-0 top-16 z-50 lg:hidden"
          style={{
            background: "var(--cs-surface-2)",
            borderBottom: "1px solid var(--cs-trait)",
            backdropFilter: "blur(14px)",
          }}
        >
          <nav aria-label={locale === "fr" ? "Navigation mobile" : "Mobile navigation"}>
            <ul role="list" className="flex flex-col px-4 py-4 gap-1">
              {liens.map((lien) => {
                const href = locale === "fr" ? lien.href : lien.hrefEn;
                const libelle = locale === "fr" ? lien.libelle : lien.libelleEn;
                const courant = estCourant(href, pathname);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={courant ? "page" : undefined}
                      onClick={() => setOuvert(false)}
                      className="csNavLien type-caption font-semibold uppercase tracking-[0.12em] flex items-center gap-2 py-2"
                    >
                      {courant && <span aria-hidden="true" className="csNavRepere" />}
                      {libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="px-4 pb-4">
            <SelecteurLangue locale={locale} pathname={pathname} />
          </div>
        </div>
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
