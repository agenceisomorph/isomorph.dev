import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
// PluginCard utilise le Link typé next-intl via son propre import
import PluginCard from "@/components/PluginCard";
import type { PluginCardData } from "@/components/PluginCard";

/**
 * Catalogue plugins — /[locale]/plugins
 * Liste tous les plugins disponibles
 * RGAA 9.1 : h1 unique sur la page
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plugins" });

  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: `${t("title")} | ISOMORPH`,
      description: t("subtitle"),
      url: `https://isomorph.dev/${locale}/plugins`,
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
      {/* En-tête de page */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
          {t("title")}
        </h1>
        <p className="text-zinc-500 max-w-2xl">{t("subtitle")}</p>
      </div>

      {/* Grille de plugins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.slug} plugin={plugin} />
        ))}

        {/* Carte "coming soon" — éco-conception : placeholder statique */}
        <div
          aria-label={t("comingSoon")}
          className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 p-6 flex items-center justify-center"
        >
          <p className="text-sm text-zinc-700 text-center">{t("comingSoon")}</p>
        </div>
      </div>
    </div>
  );
}

export default function PluginsPage() {
  return <PluginsCatalog />;
}
