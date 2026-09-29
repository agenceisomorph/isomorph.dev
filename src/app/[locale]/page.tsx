import type { Metadata } from "next";
import Link from "next/link";
import { PLUGINS, LIBELLE_STATUT_FR, LIBELLE_STATUT_EN } from "@/lib/plugins";

/**
 * Accueil isomorph.dev — design noir et blanc.
 *
 * Sections : hero, aperçu des plugins, entrées de rubriques.
 * Server Component pur — zéro JS client sur cette page.
 * RGAA 9.1 : un seul h1.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";

  return {
    title: fr ? "Plugins et outils pour Strapi" : "Plugins and tools for Strapi",
    description: fr
      ? "Plugins Strapi open source, outils de développement, expérimentations visuelles et veille technique de l'agence ISOMORPH."
      : "Open source Strapi plugins, dev tools, visual experiments and technical watch by ISOMORPH agency.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}`,
      languages: { fr: "https://isomorph.dev/fr", en: "https://isomorph.dev/en" },
    },
    openGraph: {
      title: fr ? "Plugins et outils pour Strapi" : "Plugins and tools for Strapi",
      description: fr
        ? "Plugins Strapi open source, outils de développement, expérimentations visuelles et veille technique."
        : "Open source Strapi plugins, dev tools, visual experiments and technical watch.",
      url: `https://isomorph.dev/${locale}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ locale }: { locale: string }) {
  const fr = locale !== "en";
  return (
    <section
      aria-labelledby="hero-titre"
      className="border-b border-[var(--trait)] px-4 md:px-6 xl:px-8 py-24 md:py-32 bg-noir text-blanc"
    >
      <div className="mx-auto max-w-[1280px]">
        <p className="type-caption text-white/50 mb-6">ISOMORPH.DEV</p>
        <h1
          id="hero-titre"
          className="type-display max-w-2xl mb-8 text-blanc break-words"
        >
          {fr ? "Plugins, outils et expérimentations" : "Plugins, tools and experiments"}
        </h1>
        <p className="type-lead max-w-xl mb-10 text-white/70">
          {fr
            ? "Code open source, veille technique et démonstrations visuelles de l'agence ISOMORPH."
            : "Open source code, technical watch and visual demos from ISOMORPH agency."}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/${locale}/plugins`}
            className="type-caption bg-blanc text-noir px-5 py-3 hover:bg-white/90 focus-visible:bg-white/90 transition-colors duration-150"
          >
            {fr ? "Voir les plugins" : "See plugins"}
          </Link>
          <Link
            href={`/${locale}/design-system`}
            className="type-caption border border-white/30 text-blanc px-5 py-3 hover:border-white/60 focus-visible:border-white/60 transition-colors duration-150"
          >
            {fr ? "Design system" : "Design system"}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu des plugins                                                  */
/* ------------------------------------------------------------------ */

function ApercuPlugins({ locale }: { locale: string }) {
  const fr = locale !== "en";
  const libelleStatut = fr ? LIBELLE_STATUT_FR : LIBELLE_STATUT_EN;
  const pluginsStrapi = PLUGINS.filter((p) => p.categorie === "strapi");

  return (
    <section
      aria-labelledby="plugins-titre"
      className="px-4 md:px-6 xl:px-8 py-16 border-b border-[var(--trait)] bg-blanc"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 id="plugins-titre" className="type-h2 text-noir">
            Plugins Strapi
          </h2>
          <Link
            href={`/${locale}/plugins`}
            className="type-caption text-gris hover:text-noir focus-visible:text-noir transition-colors duration-150"
          >
            {fr ? "Tout voir" : "See all"}
          </Link>
        </div>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--trait)]">
          {pluginsStrapi.map((plugin) => (
            <li key={plugin.slug} className="bg-blanc">
              <Link
                href={`/${locale}/plugins/${plugin.slug}`}
                className="group block h-full p-6 hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
                aria-label={`${plugin.nom}, ${fr ? "voir la fiche" : "view details"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="type-h3 text-noir">{plugin.nom}</p>
                  <span className="type-caption text-gris shrink-0">
                    {libelleStatut[plugin.statut]}
                  </span>
                </div>
                <p className="type-body text-gris">{plugin.role}</p>
                {!plugin.paiement && (
                  <p className="type-caption text-gris mt-3 opacity-50">MIT</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Rubriques                                                           */
/* ------------------------------------------------------------------ */

interface CarteRubrique {
  titre: string;
  description: string;
  href: string;
  libelleLien: string;
}

function Rubriques({ locale }: { locale: string }) {
  const fr = locale !== "en";

  const rubriques: CarteRubrique[] = [
    {
      titre: fr ? "Expérimentations" : "Experiments",
      description: fr
        ? "Heros 3D, terminal cathodique, globe, carte. Chaque expérimentation est jouable en plein écran."
        : "3D heroes, CRT terminal, globe, map. Each experiment is playable full screen.",
      href: `/${locale}/experimentations`,
      libelleLien: fr ? "Explorer" : "Explore",
    },
    {
      titre: fr ? "Veille" : "Tech watch",
      description: fr
        ? "Éditions hebdomadaires sur la stack Next.js, Strapi, TypeScript, accessibilité et sécurité."
        : "Weekly editions on the Next.js, Strapi, TypeScript, accessibility and security stack.",
      href: `/${locale}/veille`,
      libelleLien: fr ? "Lire les éditions" : "Read editions",
    },
    {
      titre: "Design system",
      description: fr
        ? "Fondations, composants et gabarit de documentation. L'identité visuelle d'ISOMORPH en pièces réutilisables."
        : "Foundations, components and documentation template. ISOMORPH's visual identity in reusable pieces.",
      href: `/${locale}/design-system`,
      libelleLien: fr ? "Voir le design system" : "View design system",
    },
    {
      titre: fr ? "Code open source" : "Open source code",
      description: fr
        ? "Paquets npm @isomorph-agency/* et dépôts GitHub publics avec leurs commandes d'installation."
        : "npm packages @isomorph-agency/* and public GitHub repositories with installation commands.",
      href: `/${locale}/code`,
      libelleLien: fr ? "Voir le code" : "See the code",
    },
  ];

  return (
    <section
      aria-labelledby="rubriques-titre"
      className="px-4 md:px-6 xl:px-8 py-16 bg-gris-clair"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 id="rubriques-titre" className="type-h2 text-noir mb-8">
          {fr ? "À explorer" : "Explore"}
        </h2>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--trait)]">
          {rubriques.map((r) => (
            <li key={r.href} className="bg-blanc">
              <Link
                href={r.href}
                className="group block h-full p-6 hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
              >
                <h3 className="type-h3 text-noir mb-3">{r.titre}</h3>
                <p className="type-body text-gris mb-4">{r.description}</p>
                <span className="type-caption text-noir group-hover:underline">{r.libelleLien}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function AccueilPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <>
      <Hero locale={locale} />
      <ApercuPlugins locale={locale} />
      <Rubriques locale={locale} />
    </>
  );
}
