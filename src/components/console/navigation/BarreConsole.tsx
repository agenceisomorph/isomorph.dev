/**
 * Barre de navigation du système Console : verre sombre, filet néon en bas,
 * logo ISOMORPH, Compétences (méga-menu), liens de premier niveau, langue et
 * appel principal. Sous 1024 px, le menu burger prend le relais.
 *
 * Composant serveur : la page courante (`aria-current`) se calcule ici à
 * partir du chemin français canonique, sans script. Seuls le méga-menu et le
 * menu burger sont des îlots client, pour leur état d'ouverture.
 *
 * Mêmes éléments que la barre actuelle (`chrome/NavBar.tsx`) : même logo,
 * mêmes liens et mêmes langues ; Méthode et Actualités restent réservés aux
 * pages françaises.
 *
 * Écarts assumés avec la barre actuelle :
 *  - la langue est un commutateur FR | EN à deux liens au lieu d'une liste
 *    déroulante : une action de moins, aucun script ;
 *  - `position="fixe"` ne réserve pas la hauteur de la barre (64 px) : la
 *    page qui l'accueille la laisse libre.
 *
 * Éco-conception et performance : flou du verre seulement dès 1024 px, aucun
 * script pour la barre elle-même, méga-menu et panneau burger rendus
 * seulement à l'ouverture.
 *
 * RGAA :
 *  - 12.2 : `nav` nommée, liste de liens ; en-tête `header` ;
 *  - 12.6 : page courante `aria-current="page"`, repère losange et segment
 *    néon sur le filet, pas la couleur seule ;
 *  - 8.7 : chaque langue porte `lang` et `hrefLang` ;
 *  - 6.1 : le logo est nommé « Accueil ISOMORPH » ;
 *  - 11.1 : cibles de 44 px de haut.
 */

import Link from "next/link";

import IsomorphLogo from "@/components/IsomorphLogo";
import { cheminMiroir } from "@/components/site/familles";
import { LOCALIZED_PATHS, altPath, t, type Locale } from "@/lib/i18n";
import { Bouton } from "../Bouton";
import { StylesConsole } from "../fondations";
import { StylesNavigation, estCourant } from "./FilAriane";
import { MegaMenuConsole } from "./MegaMenuConsole";
import { MenuBurger, type AppelPrincipal, type LienPrincipal } from "./MenuBurger";

/* ------------------------------------------------------------------ */
/* Utilitaires purs                                                    */
/* ------------------------------------------------------------------ */

/** Page anglaise de repli quand la page n'existe pas en anglais (même règle que `LanguageSwitcher`). */
const REPLI_ANGLAIS = "/en/plugins";

/** Adresse anglaise exacte d'une page française, ou `undefined` si elle n'existe pas. */
function miroirAnglais(frPath: string): string | undefined {
  return LOCALIZED_PATHS[frPath] ?? cheminMiroir(frPath);
}

/**
 * Adresse de la page affichée dans la langue affichée, pour `aria-current`.
 *
 * Test minimal proposé :
 *   cheminAffiche("/methode", "fr") === "/methode"
 *   cheminAffiche("/plugins", "en") === "/en/plugins"
 *   cheminAffiche("/developpement/strapi", "en") === "/en/development/strapi"
 */
export function cheminAffiche(frPath: string, locale: Locale): string {
  if (locale === "fr") return frPath;
  return miroirAnglais(frPath) ?? frPath;
}

/**
 * Liens de premier niveau hors Compétences, dans l'ordre de la barre actuelle.
 *
 * Test minimal proposé :
 *   liensPrincipaux("fr").map((l) => l.href) → ["/methode", "/plugins", "/actualites"]
 *   liensPrincipaux("en").map((l) => l.href) → ["/en/plugins"]
 */
export function liensPrincipaux(locale: Locale): LienPrincipal[] {
  if (locale === "en") return [{ libelle: t.nav.plugins.en, href: altPath("/plugins", "en") }];
  return [
    { libelle: "Méthode", href: "/methode" },
    { libelle: t.nav.plugins.fr, href: "/plugins" },
    { libelle: t.nav.news.fr, href: "/actualites" },
  ];
}

/**
 * Appel principal de la barre, repris de la barre actuelle.
 *
 * Test minimal proposé :
 *   appelPrincipal("fr") → { libelle: "Décrire votre projet", href: "/contact" }
 *   appelPrincipal("en").href.startsWith("mailto:contact@isomorph.fr") === true
 */
export function appelPrincipal(locale: Locale): AppelPrincipal {
  if (locale === "en") {
    return {
      libelle: "Contact us",
      href: `mailto:contact@isomorph.fr?subject=${encodeURIComponent("Project enquiry")}`,
    };
  }
  return { libelle: "Décrire votre projet", href: "/contact" };
}

/* ------------------------------------------------------------------ */
/* Sélecteur de langue                                                 */
/* ------------------------------------------------------------------ */

export interface SelecteurLangueProps {
  locale: Locale;
  /** Chemin français canonique de la page affichée. */
  frPath: string;
  className?: string;
}

/**
 * Commutateur FR | EN : deux liens, la langue affichée marquée
 * `aria-current`. Une page sans version anglaise mène à l'accueil anglais et
 * le dit aux lecteurs d'écran, avec la phrase du sélecteur actuel.
 */
export function SelecteurLangue({ locale, frPath, className = "" }: SelecteurLangueProps) {
  const miroir = miroirAnglais(frPath);
  const options = [
    { code: "fr" as const, nom: "Français", href: frPath, repli: undefined },
    {
      code: "en" as const,
      nom: "English",
      href: miroir ?? REPLI_ANGLAIS,
      repli:
        locale === "fr" && miroir === undefined
          ? "Cette page n'existe pas en anglais : ouvrir l'accueil anglais du site"
          : undefined,
    },
  ];

  return (
    <ul role="list" aria-label={locale === "fr" ? "Langue" : "Language"} className={`csNavLangue ${className}`}>
      {options.map((o) => (
        <li key={o.code}>
          <Link
            href={o.href}
            hrefLang={o.code}
            aria-current={o.code === locale ? "page" : undefined}
            className="csNavLangueLien type-caption font-semibold uppercase tracking-[0.12em]"
          >
            <span aria-hidden="true">{o.code}</span>
            {o.repli ? (
              <span className="sr-only">{o.repli}</span>
            ) : (
              <span lang={o.code} className="sr-only">
                {o.nom}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Barre                                                               */
/* ------------------------------------------------------------------ */

export interface BarreConsoleProps {
  locale?: Locale;
  /** Chemin français canonique de la page affichée (clé de `LOCALIZED_PATHS`). */
  frPath: string;
  /** « fixe » : collée en haut de la fenêtre. « statique » : dans le flux (vitrine). */
  position?: "fixe" | "statique";
}

export function BarreConsole({ locale = "fr", frPath, position = "fixe" }: BarreConsoleProps) {
  const chemin = cheminAffiche(frPath, locale);
  const liens = liensPrincipaux(locale);
  const appel = appelPrincipal(locale);

  return (
    <header className={position === "fixe" ? "fixed inset-x-0 top-0 z-40" : "relative z-20"}>
      <StylesConsole />
      <StylesNavigation />
      <div className="csNavBarre text-white">
        <span aria-hidden="true" className="csNavBarreVerre" />
        <span aria-hidden="true" className="csNavFilet" />

        {/* Conteneur de référence du méga-menu : son panneau se pose dessous, sur toute sa largeur. */}
        <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6 lg:gap-2 lg:px-4 xl:gap-4 xl:px-8">
          <Link
            href={locale === "en" ? REPLI_ANGLAIS : "/"}
            aria-label={locale === "en" ? "ISOMORPH home" : "Accueil ISOMORPH"}
            className="csNavLogo flex h-11 shrink-0 items-center px-1"
          >
            <IsomorphLogo className="h-[14px] w-auto" />
          </Link>

          <nav aria-label={locale === "en" ? "Main navigation" : "Navigation principale"} className="hidden lg:block">
            <ul role="list" className="flex items-center">
              <li>
                <MegaMenuConsole libelle={t.nav.expertises[locale]} locale={locale} cheminCourant={chemin} />
              </li>
              {liens.map((lien) => {
                const courant = estCourant(lien.href, chemin);
                return (
                  <li key={lien.href}>
                    <Link
                      href={lien.href}
                      aria-current={courant ? "page" : undefined}
                      className="csNavLien type-caption font-semibold uppercase tracking-[0.12em]"
                    >
                      {courant ? <span aria-hidden="true" className="csNavRepere" /> : null}
                      {lien.libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <SelecteurLangue locale={locale} frPath={frPath} />
            <Bouton href={appel.href}>{appel.libelle}</Bouton>
          </div>

          <div className="lg:hidden">
            <MenuBurger
              locale={locale}
              cheminCourant={chemin}
              liens={liens}
              appel={appel}
              langue={<SelecteurLangue locale={locale} frPath={frPath} />}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
