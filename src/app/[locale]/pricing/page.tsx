import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import PricingTable from "@/components/PricingTable";

/**
 * Page tarifs — /[locale]/pricing
 * RGAA 9.1 : h1 unique
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: `${t("title")} | ISOMORPH`,
      description: t("subtitle"),
      url: `https://isomorph.dev/${locale}/pricing`,
    },
  };
}

function PricingContent() {
  const t = useTranslations("pricing");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* En-tête de page */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
          {t("title")}
        </h1>
        <p className="text-zinc-500 max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Tableau des prix */}
      <PricingTable />

      {/* Note bas de page */}
      <p className="mt-12 text-center text-sm text-zinc-600">
        Toutes les licences sont auto-hébergées. Aucune dépendance SaaS.{" "}
        <a
          href="mailto:contact@isomorph.fr"
          className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors duration-150"
        >
          Questions ? Contactez-nous.
        </a>
      </p>
    </div>
  );
}

export default function PricingPage() {
  return <PricingContent />;
}
