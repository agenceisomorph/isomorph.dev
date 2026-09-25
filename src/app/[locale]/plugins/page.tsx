import type { Metadata } from "next";
import Link from "next/link";
import { StylesConsole, Panneau } from "@/components/console/fondations";
import { PLUGINS, LIBELLE_STATUT_FR, LIBELLE_STATUT_EN, type Plugin } from "@/lib/plugins";

/**
 * Catalogue des plugins — /[locale]/plugins
 *
 * Server Component pur.
 * RGAA 9.1 : h1 unique.
 * RGAA 6.1 : libellés de liens explicites.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";

  return {
    title: fr ? "Plugins" : "Plugins",
    description: fr
      ? "Plugins Strapi open source et applications Shopify développés par ISOMORPH."
      : "Open source Strapi plugins and Shopify apps by ISOMORPH.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}/plugins`,
      languages: {
        fr: "https://isomorph.dev/fr/plugins",
        en: "https://isomorph.dev/en/plugins",
      },
    },
    openGraph: {
      title: fr ? "Plugins | ISOMORPH" : "Plugins | ISOMORPH",
      description: fr
        ? "Plugins Strapi open source et applications Shopify développés par ISOMORPH."
        : "Open source Strapi plugins and Shopify apps by ISOMORPH.",
      url: `https://isomorph.dev/${locale}/plugins`,
    },
  };
}

function CartePlugin({ plugin, locale }: { plugin: Plugin; locale: string }) {
  const fr = locale !== "en";
  const libelleStatut = fr ? LIBELLE_STATUT_FR : LIBELLE_STATUT_EN;

  return (
    <Link
      href={`/${locale}/plugins/${plugin.slug}`}
      className="block h-full group"
      aria-label={`${plugin.nom}, ${fr ? "voir la fiche" : "view details"}`}
    >
      <Panneau coupe="m" flou className="h-full">
        <div className="p-6 flex flex-col gap-4 h-full">
          <div className="flex items-start justify-between gap-3">
            <h2
              className="type-h3 font-semibold"
              style={{ color: "var(--cs-texte)", fontWeight: 600 }}
            >
              {plugin.nom}
            </h2>
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

          <div className="flex flex-wrap gap-2 mt-auto">
            <span
              className="type-caption px-2 py-0.5 rounded"
              style={{
                color: "var(--cs-texte-3)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--cs-trait)",
              }}
            >
              {plugin.categorie === "strapi" ? "Strapi v5" : "Shopify"}
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
          </div>
        </div>
      </Panneau>
    </Link>
  );
}

export default async function PluginsPage({ params }: PageProps) {
  const { locale } = await params;
  const fr = locale !== "en";

  const pluginsStrapi = PLUGINS.filter((p) => p.categorie === "strapi");
  const pluginsShopify = PLUGINS.filter((p) => p.categorie === "shopify");

  return (
    <>
      <StylesConsole />
      <div
        style={{ background: "var(--cs-fond)" }}
        className="min-h-screen px-4 md:px-6 xl:px-8 py-16"
      >
        <div className="mx-auto max-w-[1280px]">
          {/* En-tête */}
          <div className="mb-12">
            <p
              className="type-caption font-semibold uppercase tracking-[0.14em] mb-3"
              style={{ color: "var(--cs-neon)" }}
            >
              {fr ? "Code ouvert" : "Open source"}
            </p>
            <h1
              className="type-h1 font-semibold mb-4"
              style={{ color: "var(--cs-texte)", fontWeight: 600 }}
            >
              Plugins
            </h1>
            <p className="type-lead max-w-xl" style={{ color: "var(--cs-texte-2)" }}>
              {fr
                ? "Plugins Strapi et applications Shopify développés et maintenus par ISOMORPH."
                : "Strapi plugins and Shopify apps developed and maintained by ISOMORPH."}
            </p>
          </div>

          {/* Strapi */}
          <section aria-labelledby="strapi-titre" className="mb-16">
            <h2
              id="strapi-titre"
              className="type-h2 font-semibold mb-6"
              style={{ color: "var(--cs-texte)", fontWeight: 600, borderBottom: "1px solid var(--cs-trait)", paddingBottom: "1rem" }}
            >
              Strapi
            </h2>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pluginsStrapi.map((plugin) => (
                <li key={plugin.slug}>
                  <CartePlugin plugin={plugin} locale={locale} />
                </li>
              ))}
            </ul>
          </section>

          {/* Shopify */}
          <section aria-labelledby="shopify-titre">
            <h2
              id="shopify-titre"
              className="type-h2 font-semibold mb-6"
              style={{ color: "var(--cs-texte)", fontWeight: 600, borderBottom: "1px solid var(--cs-trait)", paddingBottom: "1rem" }}
            >
              Shopify
            </h2>
            <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pluginsShopify.map((plugin) => (
                <li key={plugin.slug}>
                  <CartePlugin plugin={plugin} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
