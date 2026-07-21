import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PluginCard from "@/components/PluginCard";
import type { PluginCardData } from "@/components/PluginCard";
import JsonLd from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plugins" });

  const title =
    locale === "fr"
      ? "Plugins Strapi V5 Open Source — ISOMORPH"
      : "Open Source Strapi V5 Plugins — ISOMORPH";
  const description = t("subtitle");

  return {
    title,
    description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/plugins`,
      languages: {
        fr: "https://isomorph.dev/fr/plugins",
        en: "https://isomorph.dev/en/plugins",
        "x-default": "https://isomorph.dev/en/plugins",
      },
    },
    openGraph: {
      title: `${title} | ISOMORPH`,
      description,
      url: `https://isomorph.dev/${locale}/plugins`,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: "https://isomorph.dev/og-image.png",
          width: 1200,
          height: 630,
          alt: "ISOMORPH — Strapi V5 Plugins",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://isomorph.dev/og-image.png"],
    },
  };
}

function PluginsCatalog() {
  const t = useTranslations("plugins");
  const tComments = useTranslations("comments");

  const plugins: PluginCardData[] = [
    {
      slug: "strapi-comments",
      name: "strapi-plugin-comments",
      description: tComments("shortDescription"),
      version: "2.0.0",
      license: "MIT",
      downloads: "12k+",
      strapiVersion: "V5",
      featured: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-500 max-w-2xl">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.slug} plugin={plugin} />
        ))}
        <div
          aria-label={t("comingSoon")}
          className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 flex items-center justify-center"
        >
          <p className="text-sm text-gray-400 text-center">{t("comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}

export default async function PluginsPage({ params }: PageProps) {
  const { locale } = await params;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `https://isomorph.dev/${locale}/plugins#list`,
    name:
      locale === "fr"
        ? "Plugins Strapi V5 Open Source — ISOMORPH"
        : "Open Source Strapi V5 Plugins — ISOMORPH",
    description:
      locale === "fr"
        ? "Catalogue de plugins open source pour Strapi V5 développés par ISOMORPH."
        : "Catalogue of open source plugins for Strapi V5 developed by ISOMORPH.",
    url: `https://isomorph.dev/${locale}/plugins`,
    numberOfItems: 1,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "SoftwareApplication",
          "@id": `https://isomorph.dev/${locale}/plugins/strapi-comments`,
          name: "strapi-plugin-comments",
          url: `https://isomorph.dev/${locale}/plugins/strapi-comments`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
          softwareVersion: "2.0.0",
          license: "https://opensource.org/licenses/MIT",
          description:
            locale === "fr"
              ? "Système de commentaires complet pour Strapi V5 — modération, fils imbriqués, multi-auth."
              : "Full-featured comment system for Strapi V5 — moderation, nested threads, multi-auth.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
          publisher: {
            "@id": "https://isomorph.dev/#organization",
          },
        },
      },
    ],
  };

  return (
    <>
      <JsonLd id="ld-plugins-list" schema={itemListSchema} />
      <PluginsCatalog />
    </>
  );
}
