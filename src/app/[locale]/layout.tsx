import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import BarreIsomorphDev from "@/components/BarreIsomorphDev";
import PiedPageIsomorphDev from "@/components/PiedPageIsomorphDev";

/**
 * Layout principal par locale.
 *
 * RGAA 8.3 : lang déclaré dans le root layout ; content-language émis ici.
 * RGAA 8.6 : titre de page défini via generateMetadata dans chaque page.
 * RGAA 12.1 : lien d'évitement dans BarreIsomorphDev.
 *
 * Éco : layout Server Component pur — le client ne reçoit que les îlots
 * (burger, sélecteur de langue).
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
      languages: {
        fr: "https://isomorph.dev/fr",
        en: "https://isomorph.dev/en",
      },
    },
    other: {
      "content-language": locale,
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const l = locale as "fr" | "en";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        className="flex min-h-screen flex-col"
        style={{ background: "var(--cs-fond)", color: "var(--cs-texte)" }}
      >
        <BarreIsomorphDev />
        {/*
         * id="main-content" : cible du lien d'évitement — RGAA 12.1
         * pt-16 : compense la barre fixe (64 px)
         */}
        <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
          {children}
        </main>
        <PiedPageIsomorphDev locale={l} />
      </div>
    </NextIntlClientProvider>
  );
}
