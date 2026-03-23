import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Hero from "@/components/Hero";
import PluginCard from "@/components/PluginCard";
import type { PluginCardData } from "@/components/PluginCard";
import { Shield, Zap, HeadphonesIcon } from "lucide-react";

/**
 * Landing page — /[locale]
 * Sections : Hero, Featured plugin, Why ISOMORPH, Stats
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  return {
    title: "ISOMORPH — Open Source Plugins for Strapi",
    description: t("description"),
    openGraph: {
      title: "ISOMORPH — Open Source Plugins for Strapi",
      description: t("description"),
      url: `https://isomorph.dev/${locale}`,
      images: [
        {
          url: "https://isomorph.dev/og-image.png",
          width: 1200,
          height: 630,
          alt: "ISOMORPH — Open Source Plugins for Strapi",
        },
      ],
    },
  };
}

/** Données statiques du plugin Comments — sera externalisé dans une lib dédiée */
const commentsPlugin: PluginCardData = {
  slug: "strapi-comments",
  name: "strapi-plugin-comments",
  description: "",
  version: "2.0.0",
  license: "MIT",
  downloads: "12k+",
  strapiVersion: "V5",
  featured: true,
};

/** Icônes de la section "Why ISOMORPH" */
const WHY_ICONS = {
  security: Shield,
  performance: Zap,
  support: HeadphonesIcon,
} as const;

function LandingContent() {
  const t = useTranslations();
  const tComments = useTranslations("comments");

  const plugin: PluginCardData = {
    ...commentsPlugin,
    description: tComments("shortDescription"),
  };

  return (
    <>
      {/* Section hero */}
      <Hero />

      {/* Section plugin mis en avant */}
      <section
        aria-labelledby="featured-heading"
        className="py-16 sm:py-20 bg-zinc-950"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-zinc-800 max-w-8"
            />
            <h2
              id="featured-heading"
              className="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
            >
              {t("featured.title")}
            </h2>
          </div>
          <div className="max-w-lg">
            <PluginCard plugin={plugin} variant="featured" />
          </div>
        </div>
      </section>

      {/* Section "Why ISOMORPH" */}
      <section
        aria-labelledby="why-heading"
        className="py-16 sm:py-20 border-t border-zinc-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="why-heading"
            className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-12 text-center"
          >
            {t("why.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(["security", "performance", "support"] as const).map((key) => {
              const Icon = WHY_ICONS[key];
              return (
                <div key={key} className="text-center">
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-500"
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-100 mb-2">
                    {t(`why.${key}.title`)}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">
                    {t(`why.${key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section stats */}
      <section
        aria-label="Statistiques ISOMORPH"
        className="py-12 border-t border-zinc-800/50 bg-zinc-900/20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            {[
              { value: "1", label: t("stats.plugins") },
              { value: "MIT", label: t("stats.license") },
              { value: "V5", label: t("stats.strapi") },
            ].map(({ value, label }) => (
              <div key={label}>
                <dt className="text-3xl font-bold text-violet-400 mb-1">
                  {value}
                </dt>
                <dd className="text-sm text-zinc-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return <LandingContent />;
}
