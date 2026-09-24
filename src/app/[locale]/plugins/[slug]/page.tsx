import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StylesConsole } from "@/components/console/fondations";
import { Bouton } from "@/components/console/Bouton";
import PricingTable from "@/components/PricingTable";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import {
  PLUGINS,
  LIBELLE_STATUT_FR,
  LIBELLE_STATUT_EN,
  type Plugin,
} from "@/lib/plugins";

/**
 * Fiche plugin — /[locale]/plugins/[slug]
 *
 * Comments conserve sa grille tarifaire et son bouton de paiement
 * (PricingTable), habillés dans le système Console.
 *
 * Server Component. PricingTable utilise next-intl : il est wrappé dans
 * NextIntlClientProvider.
 *
 * RGAA 9.1 : h1 unique.
 * RGAA 6.1 : libellés de liens explicites.
 * JSON-LD SoftwareApplication : uniquement les données sourcées.
 *
 * Note SecOps : le JSON-LD est sérialisé à partir de données internes
 * (lib/plugins.ts, constantes TypeScript). Aucune donnée utilisateur
 * n'entre dans la sérialisation. L'utilisation de dangerouslySetInnerHTML
 * est donc sûre dans ce contexte serveur.
 */

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return PLUGINS.flatMap((p) => [
    { locale: "fr", slug: p.slug },
    { locale: "en", slug: p.slug },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const plugin = PLUGINS.find((p) => p.slug === slug);
  if (!plugin) return {};

  const titre = plugin.nom;
  const description = plugin.role;

  return {
    title: titre,
    description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/plugins/${slug}`,
      languages: {
        fr: `https://isomorph.dev/fr/plugins/${slug}`,
        en: `https://isomorph.dev/en/plugins/${slug}`,
      },
    },
    openGraph: {
      title: `${titre} | ISOMORPH`,
      description,
      url: `https://isomorph.dev/${locale}/plugins/${slug}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD SoftwareApplication (données internes uniquement)           */
/* ------------------------------------------------------------------ */

function JsonLd({ plugin, locale }: { plugin: Plugin; locale: string }) {
  const premiere = plugin.paquets?.[0];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const data: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: plugin.nom,
    description: plugin.role,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Node.js",
    creator: {
      "@type": "Organization",
      name: "ISOMORPH",
      url: "https://isomorph.dev",
    },
  };
  if (premiere) data.softwareVersion = premiere.version;
  if (plugin.github) data.url = plugin.github;
  data.offers = plugin.paiement
    ? {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "0",
        description:
          locale === "fr" ? "Tier Community gratuit disponible" : "Free Community tier available",
      }
    : { "@type": "Offer", priceCurrency: "EUR", price: "0" };

  // Données 100 % internes (lib/plugins.ts). Aucune entrée utilisateur.

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/* ------------------------------------------------------------------ */
/* Section paquets npm                                                 */
/* ------------------------------------------------------------------ */

function SectionPaquets({ plugin, locale }: { plugin: Plugin; locale: string }) {
  const fr = locale !== "en";
  if (!plugin.paquets?.length) return null;

  return (
    <section
      aria-labelledby="paquets-titre"
      style={{ background: "var(--cs-fond-2)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="paquets-titre"
          className="type-h2 font-semibold mb-6"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "Installation" : "Install"}
        </h2>
        <ul role="list" className="flex flex-col gap-3">
          {plugin.paquets.map((paquet) => (
            <li key={paquet.nom}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <code
                  className="type-body font-mono px-4 py-2.5 rounded flex-1 overflow-x-auto"
                  style={{
                    background: "var(--cs-surface-2)",
                    color: "var(--cs-neon)",
                    border: "1px solid var(--cs-trait)",
                  }}
                >
                  {paquet.install}
                </code>
                <a
                  href={paquet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${paquet.nom} ${fr ? "sur npm (ouvre dans un nouvel onglet)" : "on npm (opens in new tab)"}`}
                  className="type-caption font-semibold uppercase tracking-[0.1em] shrink-0"
                  style={{ color: "var(--cs-texte-3)" }}
                >
                  v{paquet.version} npm
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section compatibilité                                               */
/* ------------------------------------------------------------------ */

function SectionCompatibilite({ plugin, locale }: { plugin: Plugin; locale: string }) {
  const fr = locale !== "en";

  return (
    <section
      aria-labelledby="compat-titre"
      style={{ background: "var(--cs-fond)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="compat-titre"
          className="type-h2 font-semibold mb-6"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "Compatibilité" : "Compatibility"}
        </h2>
        <ul role="list" className="flex flex-wrap gap-2">
          {plugin.compatibilite.map((item) => (
            <li
              key={item}
              className="type-caption px-3 py-1 rounded"
              style={{
                color: "var(--cs-texte-2)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--cs-trait)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section liens                                                       */
/* ------------------------------------------------------------------ */

function SectionLiens({ plugin, locale }: { plugin: Plugin; locale: string }) {
  const fr = locale !== "en";
  const liens: { label: string; href: string }[] = [];

  if (plugin.github) {
    liens.push({
      label: fr ? "Code source sur GitHub" : "Source code on GitHub",
      href: plugin.github,
    });
  }
  plugin.paquets?.forEach((p) => {
    liens.push({ label: `${p.nom} sur npm`, href: p.url });
  });

  if (!liens.length) return null;

  return (
    <section
      aria-labelledby="liens-titre"
      style={{ background: "var(--cs-fond-2)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-12"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="liens-titre"
          className="type-h2 font-semibold mb-6"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "Liens" : "Links"}
        </h2>
        <ul role="list" className="flex flex-col gap-2">
          {liens.map((lien) => (
            <li key={lien.href}>
              <a
                href={lien.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${lien.label} (${fr ? "ouvre dans un nouvel onglet" : "opens in new tab"})`}
                className="type-body inline-flex items-center gap-2"
                style={{ color: "var(--cs-neon)" }}
              >
                {lien.label}
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
                  <path
                    d="M10 3h3v3M13 3l-6 6M6 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1v-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section tarifs (Comments uniquement)                               */
/* ------------------------------------------------------------------ */

async function SectionTarifs({ locale }: { locale: string }) {
  const messages = await getMessages();
  const fr = locale !== "en";

  return (
    <section
      aria-labelledby="tarifs-titre"
      style={{ background: "var(--cs-fond)", borderBottom: "1px solid var(--cs-trait)" }}
      className="px-4 md:px-6 xl:px-8 py-16"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="tarifs-titre"
          className="type-h2 font-semibold mb-2"
          style={{ color: "var(--cs-texte)", fontWeight: 600 }}
        >
          {fr ? "Tarifs" : "Pricing"}
        </h2>
        <p className="type-lead mb-4" style={{ color: "var(--cs-texte-2)" }}>
          {fr
            ? "Tier Community gratuit. Montée en gamme quand le besoin s'en fait sentir."
            : "Free Community tier. Upgrade when you need to."}
        </p>
        {/* Lien vers les CGV — HELM, 2026-09-25 */}
        <p className="type-caption mb-10" style={{ color: "var(--cs-texte-3)" }}>
          {fr ? (
            <>
              Paiement soumis aux{" "}
              <Link href={`/${locale}/cgv`} style={{ color: "var(--cs-neon)" }}>
                conditions générales de vente
              </Link>
              .
            </>
          ) : (
            <>
              Payment subject to our{" "}
              <Link href={`/${locale}/cgv`} style={{ color: "var(--cs-neon)" }}>
                terms of sale
              </Link>
              .
            </>
          )}
        </p>
        {/* PricingTable conservée telle quelle — mécanique de vente inchangée */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PricingTable />
        </NextIntlClientProvider>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function FichePluginPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const plugin = PLUGINS.find((p) => p.slug === slug);

  if (!plugin) notFound();

  const fr = locale !== "en";
  const libelleStatut = fr ? LIBELLE_STATUT_FR : LIBELLE_STATUT_EN;
  const estShopify = plugin.categorie === "shopify";

  return (
    <>
      <StylesConsole />
      <JsonLd plugin={plugin} locale={locale} />

      {/* Hero fiche */}
      <section
        aria-labelledby="fiche-titre"
        style={{ background: "var(--cs-fond)", borderBottom: "1px solid var(--cs-trait)" }}
        className="px-4 md:px-6 xl:px-8 py-16"
      >
        <div className="mx-auto max-w-[1280px]">
          {/* Fil d'Ariane */}
          <nav aria-label={fr ? "Fil d'Ariane" : "Breadcrumb"} className="mb-8">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href={`/${locale}/plugins`}
                  className="type-caption"
                  style={{ color: "var(--cs-texte-3)" }}
                >
                  Plugins
                </Link>
              </li>
              <li aria-hidden="true" className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
                /
              </li>
              <li>
                <span
                  className="type-caption"
                  style={{ color: "var(--cs-texte-2)" }}
                  aria-current="page"
                >
                  {plugin.nom}
                </span>
              </li>
            </ol>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span
              className="type-caption px-2 py-0.5 rounded"
              style={{
                color: "var(--cs-neon)",
                background: "var(--cs-neon-voile)",
                border: "1px solid var(--cs-neon-doux)",
              }}
            >
              {libelleStatut[plugin.statut]}
            </span>
            <span
              className="type-caption px-2 py-0.5 rounded"
              style={{
                color: "var(--cs-texte-3)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--cs-trait)",
              }}
            >
              {estShopify ? "Shopify" : "Strapi v5"}
            </span>
            {!plugin.paiement && (
              <span
                className="type-caption px-2 py-0.5 rounded"
                style={{
                  color: "var(--cs-texte-3)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--cs-trait)",
                }}
              >
                MIT
              </span>
            )}
            {plugin.paquets?.[0] && (
              <span
                className="type-caption px-2 py-0.5 rounded"
                style={{
                  color: "var(--cs-texte-3)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--cs-trait)",
                }}
              >
                v{plugin.paquets[0].version}
              </span>
            )}
          </div>

          <h1
            id="fiche-titre"
            className="type-h1 font-semibold mb-6"
            style={{ color: "var(--cs-texte)", fontWeight: 600 }}
          >
            {plugin.nom}
          </h1>

          <p
            className="type-lead max-w-2xl mb-8"
            style={{ color: "var(--cs-texte-2)" }}
          >
            {plugin.role}
          </p>

          {plugin.github && (
            <div className="flex flex-wrap gap-3">
              <Bouton href={plugin.github} variante="secondaire" externe>
                {fr ? "Code source sur GitHub" : "Source code on GitHub"}
              </Bouton>
            </div>
          )}

          {/* Shopify : statut, pas de prix */}
          {estShopify && (
            <div
              className="mt-8 p-4 rounded"
              style={{ background: "var(--cs-surface)", border: "1px solid var(--cs-trait)" }}
            >
              <p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
                {plugin.statut === "pilote"
                  ? fr
                    ? "Cette application est en phase de pilote."
                    : "This app is in pilot phase."
                  : fr
                    ? "Cette application est en cours de développement."
                    : "This app is under development."}
              </p>
            </div>
          )}
        </div>
      </section>

      <SectionPaquets plugin={plugin} locale={locale} />
      <SectionCompatibilite plugin={plugin} locale={locale} />
      <SectionLiens plugin={plugin} locale={locale} />
      {plugin.slug === "comments" && <SectionTarifs locale={locale} />}
    </>
  );
}
