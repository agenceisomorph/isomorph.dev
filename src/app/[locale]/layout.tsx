import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Layout principal par locale — wrap Header + Footer + next-intl provider
 *
 * RGAA 8.3 : l'attribut lang est défini dans le root layout (html[lang]).
 * Le layout [locale] émet les métadonnées hreflang et content-language
 * pour signaler la langue aux moteurs et technologies d'assistance.
 *
 * RGAA 8.6 : titre de page défini dans chaque page via generateMetadata
 */

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      // Balises hreflang FR/EN — SEO bilingue
      // En mode always : préfixe systématique sur toutes les locales (/en, /fr)
      // x-default pointe vers /en (langue prioritaire pour l'audience internationale)
      languages: {
        fr: `https://isomorph.dev/fr`,
        en: `https://isomorph.dev/en`,
        "x-default": `https://isomorph.dev/en`,
      },
    },
    other: {
      // Langue de contenu pour les technologies d'assistance — RGAA 8.3
      "content-language": locale,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Valider la locale — renvoyer 404 si inconnue
  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  // Charger les messages côté serveur pour le provider client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        {/*
         * id="main-content" : cible du lien d'évitement — RGAA 12.1
         * tabIndex={-1} : permet le focus programmatique sans apparaître
         * dans l'ordre de tabulation naturel
         */}
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
