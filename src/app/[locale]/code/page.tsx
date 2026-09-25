import type { Metadata } from "next";
import { StylesConsole, Panneau } from "@/components/console/fondations";

/**
 * Page Code — /[locale]/code
 *
 * Paquets et dépôts publics (npm @isomorph-agency/*, strapi-plugin-cookie-consent*,
 * GitHub public). Commandes d'installation et blocs de code.
 *
 * Sources : inventaire-contenu-2026-09-25.md §2.
 * Aucune donnée interne ni nom de client.
 *
 * Server Component pur.
 * RGAA 9.1 : h1 unique.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Code" : "Code",
    description: fr
      ? "Paquets npm open source et dépôts GitHub publics d'ISOMORPH."
      : "Open source npm packages and public GitHub repositories by ISOMORPH.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}/code`,
      languages: {
        fr: "https://isomorph.dev/fr/code",
        en: "https://isomorph.dev/en/code",
      },
    },
    openGraph: {
      title: fr ? "Code | ISOMORPH" : "Code | ISOMORPH",
      description: fr
        ? "Paquets npm open source et dépôts GitHub publics d'ISOMORPH."
        : "Open source npm packages and public GitHub repositories by ISOMORPH.",
      url: `https://isomorph.dev/${locale}/code`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Données (sourcées, inventaire §2)                                  */
/* ------------------------------------------------------------------ */

interface PaquetPublic {
  nom: string;
  version: string;
  description: string;
  install: string;
  npm?: string;
  github?: string;
}

const PAQUETS: PaquetPublic[] = [
  {
    nom: "@isomorph-agency/strapi-plugin-link",
    version: "0.1.1",
    description:
      "Custom Field Strapi v5 : champ lien universel (contenu interne, URL externe, téléphone, email, ancre). JSON stable.",
    install: "npm install @isomorph-agency/strapi-plugin-link",
    npm: "https://www.npmjs.com/package/@isomorph-agency/strapi-plugin-link",
    github: "https://github.com/agenceisomorph/strapi-plugin-link-v2",
  },
  {
    nom: "@isomorph-agency/link-resolver",
    version: "0.1.2",
    description:
      "Resolver front de resolveLink() : renvoie { href, label, target, rel }. Sans dépendance de framework (Next.js, Nuxt, Astro, etc.).",
    install: "npm install @isomorph-agency/link-resolver",
    npm: "https://www.npmjs.com/package/@isomorph-agency/link-resolver",
    github: "https://github.com/agenceisomorph/strapi-plugin-link-v2",
  },
  {
    nom: "@isomorph-agency/cookie-consent",
    version: "1.1.0",
    description:
      "Composants React / Next.js : bandeau et fenêtre de préférences RGPD. Conformité CNIL, Google Consent Mode V2, WCAG 2.1 AA.",
    install: "npm install @isomorph-agency/cookie-consent",
    npm: "https://www.npmjs.com/package/@isomorph-agency/cookie-consent",
    github: "https://github.com/agenceisomorph/cookie-consent",
  },
  {
    nom: "@isomorph-agency/cookie-consent-shared",
    version: "1.0.2",
    description:
      "Schéma, validation Zod et constantes partagés entre les paquets cookie-consent.",
    install: "npm install @isomorph-agency/cookie-consent-shared",
    npm: "https://www.npmjs.com/package/@isomorph-agency/cookie-consent-shared",
    github: "https://github.com/agenceisomorph/cookie-consent",
  },
  {
    nom: "strapi-plugin-cookie-consent",
    version: "1.0.4",
    description:
      "Plugin serveur Strapi v5 : journalisation du consentement cookies côté backend.",
    install: "npm install strapi-plugin-cookie-consent",
    npm: "https://www.npmjs.com/package/strapi-plugin-cookie-consent",
    github: "https://github.com/agenceisomorph/cookie-consent",
  },
  {
    nom: "strapi-plugin-cookie-consent-v4",
    version: "1.0.5",
    description: "Plugin serveur Strapi v4 : journalisation du consentement cookies.",
    install: "npm install strapi-plugin-cookie-consent-v4",
    npm: "https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4",
    github: "https://github.com/agenceisomorph/cookie-consent",
  },
];

const REPOS_GITHUB = [
  {
    nom: "agenceisomorph/cookie-consent",
    description: "Monorepo du système de consentement RGPD (React + Strapi v5 + Strapi v4).",
    url: "https://github.com/agenceisomorph/cookie-consent",
    public: true,
  },
  {
    nom: "agenceisomorph/strapi-plugin-link-v2",
    description: "Miroir public du Custom Field Link pour Strapi v5.",
    url: "https://github.com/agenceisomorph/strapi-plugin-link-v2",
    public: true,
  },
  {
    nom: "agenceisomorph/strapi-plugin-comments",
    description: "Plugin de commentaires complet pour Strapi v5 (freemium, code public).",
    url: "https://github.com/agenceisomorph/strapi-plugin-comments",
    public: true,
  },
];

/* ------------------------------------------------------------------ */
/* Composants                                                          */
/* ------------------------------------------------------------------ */

function CartePaquet({ paquet, locale }: { paquet: PaquetPublic; locale: string }) {
  const fr = locale !== "en";

  return (
    <Panneau coupe="m" flou>
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <p
            className="type-body font-mono font-semibold break-all"
            style={{ color: "var(--cs-neon)" }}
          >
            {paquet.nom}
          </p>
          <span
            className="type-caption shrink-0"
            style={{ color: "var(--cs-texte-3)" }}
          >
            v{paquet.version}
          </span>
        </div>

        <p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
          {paquet.description}
        </p>

        <code
          className="type-caption font-mono px-3 py-2 rounded overflow-x-auto block"
          style={{
            background: "var(--cs-surface-2)",
            color: "var(--cs-texte-2)",
            border: "1px solid var(--cs-trait)",
          }}
        >
          {paquet.install}
        </code>

        <div className="flex flex-wrap gap-3">
          {paquet.npm && (
            <a
              href={paquet.npm}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${paquet.nom} ${fr ? "sur npm (ouvre dans un nouvel onglet)" : "on npm (opens in new tab)"}`}
              className="type-caption font-semibold"
              style={{ color: "var(--cs-texte-3)" }}
            >
              npm
            </a>
          )}
          {paquet.github && (
            <a
              href={paquet.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${paquet.nom} ${fr ? "sur GitHub (ouvre dans un nouvel onglet)" : "on GitHub (opens in new tab)"}`}
              className="type-caption font-semibold"
              style={{ color: "var(--cs-texte-3)" }}
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </Panneau>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function CodePage({ params }: PageProps) {
  const { locale } = await params;
  const fr = locale !== "en";

  return (
    <>
      <StylesConsole />
      <div style={{ background: "var(--cs-fond)", minHeight: "100vh" }}>
        {/* En-tête */}
        <div
          style={{ borderBottom: "1px solid var(--cs-trait)" }}
          className="px-4 md:px-6 xl:px-8 py-16"
        >
          <div className="mx-auto max-w-[1280px]">
            <p
              className="type-caption font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ color: "var(--cs-neon)" }}
            >
              npm · GitHub
            </p>
            <h1
              className="type-h1 font-semibold mb-4"
              style={{ color: "var(--cs-texte)", fontWeight: 600 }}
            >
              Code
            </h1>
            <p className="type-lead max-w-xl" style={{ color: "var(--cs-texte-2)" }}>
              {fr
                ? "Paquets npm publics et dépôts GitHub open source d'ISOMORPH."
                : "Public npm packages and open source GitHub repositories by ISOMORPH."}
            </p>
          </div>
        </div>

        {/* Paquets npm */}
        <section
          aria-labelledby="npm-titre"
          style={{ borderBottom: "1px solid var(--cs-trait)" }}
          className="px-4 md:px-6 xl:px-8 py-16"
        >
          <div className="mx-auto max-w-[1280px]">
            <h2
              id="npm-titre"
              className="type-h2 font-semibold mb-2"
              style={{ color: "var(--cs-texte)", fontWeight: 600 }}
            >
              Paquets npm
            </h2>
            <p className="type-caption mb-8" style={{ color: "var(--cs-texte-3)" }}>
              {fr ? "Scope " : "Scope "}
              <a
                href="https://www.npmjs.com/~isomorph-agency"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={fr ? "Profil npm isomorph-agency (ouvre dans un nouvel onglet)" : "npm profile isomorph-agency (opens in new tab)"}
                style={{ color: "var(--cs-neon)" }}
              >
                @isomorph-agency
              </a>{" "}
              · MIT
            </p>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PAQUETS.map((p) => (
                <li key={p.nom}>
                  <CartePaquet paquet={p} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Dépôts GitHub publics */}
        <section
          aria-labelledby="github-titre"
          className="px-4 md:px-6 xl:px-8 py-16"
        >
          <div className="mx-auto max-w-[1280px]">
            <h2
              id="github-titre"
              className="type-h2 font-semibold mb-2"
              style={{ color: "var(--cs-texte)", fontWeight: 600 }}
            >
              GitHub
            </h2>
            <p className="type-caption mb-8" style={{ color: "var(--cs-texte-3)" }}>
              <a
                href="https://github.com/agenceisomorph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={fr ? "Organisation GitHub agenceisomorph (ouvre dans un nouvel onglet)" : "GitHub organization agenceisomorph (opens in new tab)"}
                style={{ color: "var(--cs-neon)" }}
              >
                github.com/agenceisomorph
              </a>
            </p>
            <ul role="list" className="flex flex-col gap-3">
              {REPOS_GITHUB.map((repo) => (
                <li key={repo.nom}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.nom} ${fr ? "(ouvre dans un nouvel onglet)" : "(opens in new tab)"}`}
                    className="block group"
                  >
                    <Panneau coupe="s" flou>
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-2">
                        <p
                          className="type-body font-mono flex-1"
                          style={{ color: "var(--cs-neon)" }}
                        >
                          {repo.nom}
                        </p>
                        <p
                          className="type-caption"
                          style={{ color: "var(--cs-texte-2)" }}
                        >
                          {repo.description}
                        </p>
                      </div>
                    </Panneau>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
