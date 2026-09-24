/**
 * Pied de page Console.
 *
 * Reprend exactement les mêmes informations que Footer.tsx :
 * colonnes de familles, colonne Agence, liens légaux, coordonnées.
 * Habillage Console : filet néon en tête, grille de points en fond.
 *
 * Composant serveur. LanguageSwitcher (Client Component) est inclus
 * comme enfant, ce qui est le comportement attendu des RSC.
 *
 * RGAA 4.1 :
 *  - Critère 12.1 : chaque colonne de liens est un nav avec son propre libellé.
 *  - Critère 10.1 : focus visible sur chaque lien.
 *  - Critère 6.1 : intitulé de lien visible sur chaque item.
 */

import Link from "next/link";

import IsomorphLogo from "@/components/IsomorphLogo";
import { CountryFlag } from "@/components/chrome/CountryFlag";
import {
  BPIFRANCE_LINK,
  EXPERTISE_FAMILIES,
  familyAllItems,
  familyHubHref,
  isFamilyVisible,
  resolveExpertiseLink,
  type ExpertiseLink,
  type ResolvedExpertiseLink,
} from "@/components/chrome/expertiseNav";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { altPath, type Locale } from "@/lib/i18n";

import { StylesConsole } from "../fondations";
import { StylesContenus } from "./Carte";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface LienPied {
  label: string;
  href: string;
  hrefLang?: string;
}

/* ------------------------------------------------------------------ */
/* Liens légaux (identiques à Footer.tsx)                             */
/* ------------------------------------------------------------------ */

const LIENS_LEGAUX_FR: LienPied[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/politique-confidentialite" },
  { label: "Cookies", href: "/politique-cookies" },
];

const LIENS_LEGAUX_EN: LienPied[] = [
  { label: "Legal notice (FR)", href: "/mentions-legales", hrefLang: "fr" },
  { label: "Privacy policy (FR)", href: "/politique-confidentialite", hrefLang: "fr" },
  { label: "Cookies policy (FR)", href: "/politique-cookies", hrefLang: "fr" },
];

/* ------------------------------------------------------------------ */
/* Colonne de liens                                                     */
/* ------------------------------------------------------------------ */

function ColonneLiens({
  heading,
  headingHref,
  liens,
}: {
  heading: string;
  headingHref?: string;
  liens: LienPied[];
}) {
  return (
    <nav aria-label={heading}>
      <p className="type-caption mb-3 uppercase tracking-[0.1em] text-(--cs-texte-3)">
        {headingHref ? (
          <Link href={headingHref} className="csLien csContPiedLien">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </p>
      <ul role="list" className="space-y-2">
        {liens.map((lien) => (
          <li key={lien.href}>
            <Link
              href={lien.href}
              {...(lien.hrefLang
                ? { hrefLang: lien.hrefLang, lang: lien.hrefLang }
                : {})}
              className="csLien csContPiedLien type-caption"
            >
              {lien.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                  */
/* ------------------------------------------------------------------ */

export interface PiedDePageProps {
  locale: Locale;
  /** Chemin de la page actuelle en français, pour le sélecteur de langue. */
  frPath: string;
}

/**
 * Pied de page Console.
 * Mêmes données que Footer.tsx, habillage système Console.
 */
export function PiedDePage({ locale, frPath }: PiedDePageProps) {
  const annee = new Date().getFullYear();

  const famillesVisibles = EXPERTISE_FAMILIES.filter((f) =>
    isFamilyVisible(f, locale),
  );

  /* Grille responsive : 4 colonnes en FR (3 familles + Agence), 3 en EN. */
  const classeGrille =
    locale === "fr"
      ? "mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      : "mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <StylesConsole />
      <StylesContenus />
      <footer className="csContPied bg-(--cs-fond) text-white">
        {/* Filet néon en tête */}
        <div aria-hidden="true" className="csContPiedFilet" />

        <div className="mx-auto max-w-6xl px-6 pb-10 pt-12 md:pt-16">
          {/* Nom en filigrane (décoratif) */}
          <div aria-hidden="true" className="overflow-hidden">
            <p className="type-giant select-none whitespace-nowrap text-white/[0.04]">
              ISOMORPH
            </p>
          </div>

          <div className={classeGrille}>
            {/* Une colonne par famille */}
            {famillesVisibles.map((family) => {
              const heading =
                locale === "en"
                  ? (family.headingEn ?? family.heading)
                  : family.heading;

              const liens: LienPied[] = familyAllItems(family)
                .map((item: ExpertiseLink): ResolvedExpertiseLink | null =>
                  resolveExpertiseLink(item, locale),
                )
                .filter((r): r is ResolvedExpertiseLink => r !== null)
                .map((r) => ({ label: r.label, href: r.href }));

              return (
                <ColonneLiens
                  key={family.heading}
                  heading={heading}
                  headingHref={familyHubHref(family, locale)}
                  liens={liens}
                />
              );
            })}

            {/* Colonne Agence */}
            <nav aria-label={locale === "fr" ? "Agence" : "Agency"}>
              <p className="type-caption mb-3 uppercase tracking-[0.1em] text-(--cs-texte-3)">
                {locale === "fr" ? "Agence" : "Agency"}
              </p>
              <ul role="list" className="space-y-2">
                {locale === "fr" && (
                  <li>
                    <Link href="/agence" className="csLien csContPiedLien type-caption">
                      L&apos;agence
                    </Link>
                  </li>
                )}
                {locale === "fr" && (
                  <li>
                    <Link href="/methode" className="csLien csContPiedLien type-caption">
                      Méthode
                    </Link>
                  </li>
                )}
                {locale === "fr" && (
                  <li>
                    <Link
                      href={BPIFRANCE_LINK.href}
                      className="csLien csContPiedLien type-caption"
                    >
                      {BPIFRANCE_LINK.label}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href={altPath("/plugins", locale)}
                    className="csLien csContPiedLien type-caption"
                  >
                    {locale === "fr" ? "Notre code" : "Our code"}
                  </Link>
                </li>
                {locale === "fr" && (
                  <li>
                    <Link href="/actualites" className="csLien csContPiedLien type-caption">
                      Actualités
                    </Link>
                  </li>
                )}
                {locale === "fr" && (
                  <li>
                    <Link href="/glossaire" className="csLien csContPiedLien type-caption">
                      Glossaire
                    </Link>
                  </li>
                )}
                <li>
                  {locale === "fr" ? (
                    <Link href="/contact" className="csLien csContPiedLien type-caption">
                      Nous contacter
                    </Link>
                  ) : (
                    <a
                      href="mailto:contact@isomorph.fr"
                      className="csLien csContPiedLien type-caption"
                    >
                      Contact us
                    </a>
                  )}
                </li>
                <li>
                  <Link
                    href="/agence-web-paris"
                    className="csLien csContPiedLien type-caption"
                  >
                    Paris
                  </Link>
                </li>
                <li>
                  <Link
                    href="/agence-web-toulon"
                    className="csLien csContPiedLien type-caption"
                  >
                    Toulon
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Barre de bas de page */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-white/[8%] pt-6">
            {/* Logo + copyright */}
            <div className="flex items-center gap-3">
              <Link
                href={locale === "en" ? "/en/plugins" : "/"}
                aria-label={locale === "en" ? "ISOMORPH home" : "Accueil ISOMORPH"}
                className="csLien csContPiedLien flex items-center"
              >
                <IsomorphLogo className="h-3.5 w-auto text-white" />
              </Link>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="type-caption text-white/70">
                © {annee} ISOMORPH
              </span>
            </div>

            {/* Liens légaux */}
            <nav aria-label={locale === "fr" ? "Liens légaux" : "Legal links"}>
              <ul role="list" className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {(locale === "fr" ? LIENS_LEGAUX_FR : LIENS_LEGAUX_EN).map(
                  (lien) => (
                    <li key={lien.href}>
                      <Link
                        href={lien.href}
                        {...(lien.hrefLang
                          ? { hrefLang: lien.hrefLang, lang: lien.hrefLang }
                          : {})}
                        className="csLien csContPiedLien type-caption"
                      >
                        {lien.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            {/* Hébergement + sélecteur de langue */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="type-caption flex items-center gap-2 text-white/70">
                <CountryFlag locale="fr" width={16} />
                {locale === "en"
                  ? "Built and hosted in France"
                  : "Développé et hébergé en France"}
              </span>
              <LanguageSwitcher
                locale={locale}
                frPath={frPath}
                tone="dark"
                placement="up"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
