import type { Metadata } from "next";

import { EDITIONS } from "@/lib/veille";
import { EnTeteSection } from "@/components/console/fondations";
import { ListeVeille } from "@/components/veille/ListeVeille";

/**
 * Liste des éditions de veille technique : /[locale]/veille
 *
 * Server Component : EDITIONS est lu au build depuis content/veille/,
 * aucune donnée n'est récupérée côté client.
 *
 * RGAA 9.1 : h1 unique porté par EnTeteSection.
 * Éco : page statique, aucune image, aucun script hors le filtre client.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

const TEXTES = {
  fr: {
    surtitre: "Veille",
    titre: "Veille technique",
    chapeau:
      "Les nouveautés de la stack Strapi et Next.js, et les référentiels d'accessibilité, de sécurité et de conformité qui encadrent un site.",
    description: "Éditions de veille technique : stack Strapi et Next.js, référentiels d'accessibilité, de sécurité et de conformité.",
  },
  en: {
    surtitre: "Watch",
    titre: "Technical watch",
    chapeau:
      "What changes in the Strapi and Next.js stack, and the accessibility, security and compliance references that frame a website.",
    description: "Technical watch editions: the Strapi and Next.js stack, and the accessibility, security and compliance references.",
  },
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = locale === "en" ? TEXTES.en : TEXTES.fr;

  return {
    title: t.titre,
    description: t.description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/veille`,
    },
    openGraph: {
      title: `${t.titre} | ISOMORPH`,
      description: t.description,
      url: `https://isomorph.dev/${locale}/veille`,
    },
  };
}

export default async function VeillePage({ params }: PageProps) {
  const { locale } = await params;
  const t = locale === "en" ? TEXTES.en : TEXTES.fr;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <EnTeteSection surtitre={t.surtitre} titre={t.titre} chapeau={t.chapeau} />
      <div className="mt-12">
        <ListeVeille editions={EDITIONS} locale={locale} />
      </div>
    </div>
  );
}
