import type { Metadata } from "next";
import Link from "next/link";
import { StylesConsole, Panneau } from "@/components/console/fondations";
import { Bouton } from "@/components/console/Bouton";
import { PLUGINS, LIBELLE_STATUT_FR, LIBELLE_STATUT_EN } from "@/lib/plugins";

/**
 * Accueil isomorph.dev — système Console.
 *
 * Sections : hero, entrées de rubrique (Plugins, Code, Expérimentations, Veille),
 * derniers éléments de chaque rubrique importés depuis leurs librairies respectives
 * dès qu'elles sont créées par les agents B et C.
 *
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
    title: fr
      ? "ISOMORPH — Plugins et outils pour Strapi"
      : "ISOMORPH — Plugins and tools for Strapi",
    description: fr
      ? "Plugins Strapi open source, outils de développement, expérimentations visuelles et veille technique de l'agence ISOMORPH."
      : "Open source Strapi plugins, dev tools, visual experiments and technical watch by ISOMORPH agency.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}`,
      languages: {
        fr: "https://isomorph.dev/fr",
        en: "https://isomorph.dev/en",
      },
    },
    openGraph: {
      title: fr ? "ISOMORPH — Plugins et outils pour Strapi" : "ISOMORPH — Plugins and tools for Strapi",
      description: fr
        ? "Plugins Strapi open source, outils de développement, expérimentations visuelles et veille technique."
        : "Open source Strapi plugins, dev tools, visual experiments and technical watch.",
      url: `https://isomorph.dev/${locale}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Section hero                                                        */
/* ------------------------------------------------------------------ */

function Hero({ locale }: { locale: string }) {
  const fr = locale !== "en";
  return (
    <section
      aria-labelledby="hero-titre"
      style={{ background: "var(--cs-fond)", borderBottom: "1px solid var(--cs-trait)" }}
      className="relative overflow-hidden px-4 md:px-6 xl:px-8 py-24 md:py-32"
    >
      {/* Grille de points décorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(125,211,252,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-[1280px]">
        <p
          className="type-caption font-semibold uppercase tracking-[0.14em] mb-4"
          style={{ color: "var(--cs-neon)" }}
        >
          ISOMORPH
        </p>
        <h1
          id="hero-titre"
          className="type-h1 font-semibold max-w-2xl mb-6"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "Plugins, outils et expérimentations" : "Plugins, tools and experiments"}
        </h1>
        <p
          className="type-lead max-w-xl mb-10"
          style={{ color: "var(--cs-texte-2)" }}
        >
          {fr
            ? "Code open source, veille technique et démonstrations visuelles de l'agence ISOMORPH."
            : "Open source code, technical watch and visual demos from ISOMORPH agency."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Bouton href={`/${locale}/plugins`} variante="principal">
            {fr ? "Voir les plugins" : "See plugins"}
          </Bouton>
          <Bouton href={`/${locale}/code`} variante="secondaire">
            {fr ? "Code source" : "Source code"}
          </Bouton>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cartes d'entrée de rubrique                                         */
/* ------------------------------------------------------------------ */

interface CarteRubriqueProps {
  titre: string;
  description: string;
  href: string;
  libelleLien: string;
}

function CarteRubrique({ titre, description, href, libelleLien }: CarteRubriqueProps) {
  return (
    <Panneau coupe="m" flou className="h-full">
      <div className="p-6 flex flex-col h-full gap-4">
        <h2
          className="type-h3 font-semibold"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {titre}
        </h2>
        <p className="type-body flex-1" style={{ color: "var(--cs-texte-2)" }}>
          {description}
        </p>
        <Link
          href={href}
          className="type-caption font-semibold uppercase tracking-[0.12em] flex items-center gap-2 w-fit"
          style={{ color: "var(--cs-neon)" }}
        >
          {libelleLien}
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
            <path
              d="M3 8H12.5M8.5 4L12.5 8L8.5 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>
    </Panneau>
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
      style={{ background: "var(--cs-fond-2)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-16"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2
            id="plugins-titre"
            className="type-h2 font-semibold"
            style={{ color: "var(--cs-texte)", fontWeight: 600 }}
          >
            Plugins Strapi
          </h2>
          <Link
            href={`/${locale}/plugins`}
            className="type-caption font-semibold uppercase tracking-[0.12em] shrink-0"
            style={{ color: "var(--cs-neon)" }}
          >
            {fr ? "Tout voir" : "See all"}
          </Link>
        </div>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pluginsStrapi.map((plugin) => (
            <li key={plugin.slug}>
              <Link
                href={`/${locale}/plugins/${plugin.slug}`}
                className="block h-full group"
                aria-label={`${plugin.nom} — ${fr ? "voir la fiche" : "view details"}`}
              >
                <Panneau coupe="m" flou className="h-full">
                  <div className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="type-h3 font-semibold"
                        style={{ color: "var(--cs-texte)", fontWeight: 600 }}
                      >
                        {plugin.nom}
                      </p>
                      <span
                        className="type-caption shrink-0 px-2 py-0.5 rounded"
                        style={{
                          color: "var(--cs-neon)",
                          background: "var(--cs-neon-voile)",
                          border: "1px solid var(--cs-neon-doux)",
                        }}
                      >
                        {libelleStatut[plugin.statut]}
                      </span>
                    </div>
                    <p className="type-body flex-1" style={{ color: "var(--cs-texte-2)" }}>
                      {plugin.role}
                    </p>
                    {!plugin.paiement && (
                      <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
                        MIT
                      </p>
                    )}
                  </div>
                </Panneau>
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

function Rubriques({ locale }: { locale: string }) {
  const fr = locale !== "en";

  const rubriques: CarteRubriqueProps[] = [
    {
      titre: fr ? "Expérimentations" : "Experiments",
      description: fr
        ? "Démonstrations visuelles et techniques : heros 3D, terminal cathodique, globe, carte. Chaque expérimentation est jouable en plein écran."
        : "Visual and technical demos: 3D heroes, CRT terminal, globe, map. Each experiment is playable full screen.",
      href: `/${locale}/experimentations`,
      libelleLien: fr ? "Explorer" : "Explore",
    },
    {
      titre: fr ? "Veille" : "Tech watch",
      description: fr
        ? "Éditions hebdomadaires sur la stack Next.js, Strapi, TypeScript, accessibilité et sécurité. Sans mention interne."
        : "Weekly editions on the Next.js, Strapi, TypeScript, accessibility and security stack.",
      href: `/${locale}/veille`,
      libelleLien: fr ? "Lire les éditions" : "Read editions",
    },
  ];

  return (
    <section
      aria-labelledby="rubriques-titre"
      style={{ background: "var(--cs-fond)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-16"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="rubriques-titre"
          className="type-h2 font-semibold mb-8"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "À explorer" : "Explore"}
        </h2>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rubriques.map((r) => (
            <li key={r.href}>
              <CarteRubrique {...r} />
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
      <StylesConsole />
      <Hero locale={locale} />
      <ApercuPlugins locale={locale} />
      <Rubriques locale={locale} />
    </>
  );
}
