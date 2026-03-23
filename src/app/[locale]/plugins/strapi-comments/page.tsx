import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import FeatureGrid from "@/components/FeatureGrid";
import PricingTable from "@/components/PricingTable";
import type { Feature } from "@/components/FeatureGrid";
import { ArrowRight, Github, BookOpen, Package } from "lucide-react";

/**
 * Page détaillée — strapi-plugin-comments
 * Sections : Hero, Features, How it works, Pricing, FAQ, CTA
 * RGAA 9.1 : h1 unique, hiérarchie h2/h3 cohérente
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comments" });

  return {
    title: t("name"),
    description: t("description"),
    openGraph: {
      title: `${t("name")} | ISOMORPH`,
      description: t("description"),
      url: `https://isomorph.dev/${locale}/plugins/strapi-comments`,
    },
  };
}

/** Clés de features dans les messages de traduction */
const FEATURE_KEYS = [
  "nested", "moderation", "auth", "notifications", "reactions", "search",
  "pagination", "spam", "reports", "export", "webhooks", "i18n",
  "typescript", "rest", "graphql", "audit", "sso", "customFields",
] as const;

function CommentsPluginPage() {
  const t = useTranslations("comments");
  const tPricing = useTranslations("pricing");

  // Construire le tableau de features à partir des messages
  const features: Feature[] = FEATURE_KEYS.map((key) => ({
    title: t(`features.list.${key}.title`),
    description: t(`features.list.${key}.description`),
  }));

  return (
    <>
      {/* Hero plugin */}
      <section
        aria-label="Présentation du plugin"
        className="relative border-b border-zinc-800/50 bg-zinc-950 py-16 sm:py-20"
      >
        {/* Fond décoratif */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb — RGAA 12.4 */}
          <nav aria-label="Fil d'Ariane" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-zinc-600">
              <li>
                <Link href="/plugins" className="hover:text-zinc-400 transition-colors">
                  Plugins
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-zinc-400" aria-current="page">
                  strapi-plugin-comments
                </span>
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            {/* Badge version */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                v2.0.0
              </span>
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                MIT
              </span>
              <span className="inline-flex items-center rounded-full bg-violet-600/20 border border-violet-500/30 px-3 py-1 text-xs text-violet-400">
                Strapi V5
              </span>
            </div>

            <h1 className="font-mono text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              {t("name")}
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
              {t("tagline")}
            </p>
            <p className="text-zinc-500 mb-10 leading-relaxed max-w-2xl">
              {t("description")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.npmjs.com/package/strapi-plugin-comments"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("cta.npm")} (ouvre dans un nouvel onglet)`}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150"
              >
                <Package size={16} aria-hidden="true" />
                {t("cta.npm")}
              </a>
              <a
                href="https://github.com/isomorph-agency/strapi-plugin-comments"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("cta.github")} (ouvre dans un nouvel onglet)`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150"
              >
                <Github size={16} aria-hidden="true" />
                {t("cta.github")}
              </a>
              <a
                href="https://github.com/isomorph-agency/strapi-plugin-comments#readme"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("cta.docs")} (ouvre dans un nouvel onglet)`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150"
              >
                <BookOpen size={16} aria-hidden="true" />
                {t("cta.docs")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Commande d'installation */}
      <section
        aria-label="Installation"
        className="border-b border-zinc-800/50 bg-zinc-900/20 py-8"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="shrink-0 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Install
            </span>
            <code className="font-mono text-sm text-violet-300 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 whitespace-nowrap">
              npm install strapi-plugin-comments
            </code>
          </div>
        </div>
      </section>

      {/* Section features */}
      <section
        aria-labelledby="features-heading"
        className="py-16 sm:py-20 border-b border-zinc-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2
              id="features-heading"
              className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3"
            >
              {t("features.title")}
            </h2>
            <p className="text-zinc-500 max-w-xl">{t("features.subtitle")}</p>
          </div>
          <FeatureGrid features={features} columns={3} />
        </div>
      </section>

      {/* Section "How it works" */}
      <section
        aria-labelledby="how-it-works-heading"
        className="py-16 sm:py-20 border-b border-zinc-800/50 bg-zinc-900/10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3"
            >
              {t("howItWorks.title")}
            </h2>
            <p className="text-zinc-500">{t("howItWorks.subtitle")}</p>
          </div>

          <ol
            role="list"
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            aria-label="Étapes d'utilisation"
          >
            {(["install", "configure", "use"] as const).map((step, index) => (
              <li key={step} className="relative flex flex-col items-center text-center">
                {/* Connecteur entre étapes */}
                {index < 2 && (
                  <div
                    aria-hidden="true"
                    className="hidden sm:block absolute top-6 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-px bg-zinc-800"
                  />
                )}
                {/* Numéro */}
                <div
                  aria-hidden="true"
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-mono font-bold text-violet-400"
                >
                  {t(`howItWorks.steps.${step}.number`)}
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">
                  {t(`howItWorks.steps.${step}.title`)}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                  {t(`howItWorks.steps.${step}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section Pricing */}
      <section
        aria-labelledby="plugin-pricing-heading"
        className="py-16 sm:py-20 border-b border-zinc-800/50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingTable />
        </div>
      </section>

      {/* Section FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="py-16 sm:py-20 border-b border-zinc-800/50 bg-zinc-900/10"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-10 text-center"
          >
            {t("faq.title")}
          </h2>

          {/* RGAA 9.3 : liste de questions */}
          <dl className="max-w-3xl mx-auto space-y-6">
            {(["strapi4", "frontend", "migrate", "selfhost", "support"] as const).map(
              (key) => (
                <div
                  key={key}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
                >
                  <dt className="text-sm font-semibold text-zinc-100 mb-3">
                    {t(`faq.items.${key}.question`)}
                  </dt>
                  <dd className="text-sm text-zinc-500 leading-relaxed">
                    {t(`faq.items.${key}.answer`)}
                  </dd>
                </div>
              )
            )}
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section
        aria-label="Appel à l'action final"
        className="py-16 sm:py-20 text-center"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-4">
            {tPricing("title")}
          </h2>
          <p className="text-zinc-500 mb-8">{tPricing("subtitle")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.npmjs.com/package/strapi-plugin-comments"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("cta.npm")} (ouvre dans un nouvel onglet)`}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150"
            >
              {t("cta.npm")}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default function StrapiCommentsPage() {
  return <CommentsPluginPage />;
}
