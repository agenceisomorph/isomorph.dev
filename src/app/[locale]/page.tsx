import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Hero from "@/components/Hero";
import PluginCard from "@/components/PluginCard";
import type { PluginCardData } from "@/components/PluginCard";
import JsonLd from "@/components/JsonLd";
import { Shield, Zap, HeadphonesIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const title =
    locale === "fr"
      ? "ISOMORPH — Plugins Open Source pour Strapi V5"
      : "ISOMORPH — Open Source Plugins for Strapi V5";
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}`,
      languages: {
        fr: "https://isomorph.dev/fr",
        en: "https://isomorph.dev/en",
        "x-default": "https://isomorph.dev/en",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://isomorph.dev/${locale}`,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [{ url: "https://isomorph.dev/og-image.png", width: 1200, height: 630, alt: "ISOMORPH — Open Source Plugins for Strapi V5" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["https://isomorph.dev/og-image.png"] },
  };
}

const commentsPlugin: PluginCardData = { slug: "strapi-comments", name: "strapi-plugin-comments", description: "", version: "2.0.0", license: "MIT", downloads: "12k+", strapiVersion: "V5", featured: true };
const WHY_ICONS = { security: Shield, performance: Zap, support: HeadphonesIcon } as const;

function LandingContent() {
  const t = useTranslations();
  const tComments = useTranslations("comments");
  const plugin: PluginCardData = { ...commentsPlugin, description: tComments("shortDescription") };
  return (
    <>
      <Hero />
      <section aria-labelledby="featured-heading" className="py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span aria-hidden="true" className="h-px flex-1 bg-gray-200 max-w-8" />
            <h2 id="featured-heading" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t("featured.title")}</h2>
          </div>
          <div className="max-w-lg"><PluginCard plugin={plugin} variant="featured" /></div>
        </div>
      </section>
      <section aria-labelledby="why-heading" className="py-16 sm:py-20 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12 text-center">{t("why.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(["security", "performance", "support"] as const).map((key) => {
              const Icon = WHY_ICONS[key];
              return (
                <div key={key} className="text-center">
                  <div aria-hidden="true" className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Icon size={22} /></div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{t(`why.${key}.title`)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{t(`why.${key}.description`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section aria-label="Statistiques ISOMORPH" className="py-12 border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
            {[{ value: "1", label: t("stats.plugins") }, { value: "MIT", label: t("stats.license") }, { value: "V5", label: t("stats.strapi") }].map(({ value, label }) => (
              <div key={label}><dt className="text-3xl font-bold text-violet-600 mb-1">{value}</dt><dd className="text-sm text-gray-500">{label}</dd></div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const organizationSchema = {
    "@context": "https://schema.org", "@type": "Organization", "@id": "https://isomorph.dev/#organization",
    name: "ISOMORPH", url: "https://isomorph.dev",
    logo: { "@type": "ImageObject", url: "https://isomorph.dev/og-image.png", width: 1200, height: 630 },
    description: locale === "fr" ? "Agence de développement web spécialisée Strapi, basée à Paris et Toulon. Éditeur de plugins open source pour Strapi V5." : "Web development agency specializing in Strapi, based in Paris and Toulon. Publisher of open source plugins for Strapi V5.",
    foundingDate: "2020",
    founder: { "@type": "Person", name: "Florent Ducase" },
    address: [{ "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" }, { "@type": "PostalAddress", addressLocality: "Toulon", addressCountry: "FR" }],
    contactPoint: { "@type": "ContactPoint", email: "contact@isomorph.fr", contactType: "customer support" },
    sameAs: ["https://github.com/isomorph-agency", "https://www.npmjs.com/~isomorph-agency", "https://isomorph.fr"],
  };
  const websiteSchema = {
    "@context": "https://schema.org", "@type": "WebSite", "@id": "https://isomorph.dev/#website",
    url: "https://isomorph.dev", name: "ISOMORPH",
    publisher: { "@id": "https://isomorph.dev/#organization" },
    inLanguage: ["en", "fr"],
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: "https://isomorph.dev/en/plugins?q={search_term_string}" }, "query-input": "required name=search_term_string" },
  };
  return (
    <>
      <JsonLd id="ld-organization" schema={organizationSchema} />
      <JsonLd id="ld-website" schema={websiteSchema} />
      <LandingContent />
    </>
  );
}
