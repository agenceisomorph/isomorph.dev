import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EDITIONS, obtenirEdition } from "@/lib/veille";
import { EnTeteArticle } from "@/components/console/pages/EnTeteArticle";
import { Panneau } from "@/components/console/fondations";
import { Link } from "@/i18n/navigation";
import { Niveau } from "@/components/veille/Niveau";
import { RenduMarkdown } from "@/components/veille/RenduMarkdown";

/**
 * Édition de veille : /[locale]/veille/[slug]
 *
 * La veille est rédigée et publiée en français uniquement (pas de
 * traduction automatique, décision actée dans le plan du site) : la
 * version anglaise affiche le même contenu avec une mention d'une ligne.
 *
 * RGAA 4.1 :
 *   - Critère 9.1 : h1 unique porté par EnTeteArticle.
 *   - Critère 13.1 : time[datetime] porté par EnTeteArticle.
 *   - Critère 6.1 : lien de sources externes explicite, `rel="noopener"`.
 * Éco : Server Component, aucune image, contenu lu au build.
 */

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const LIBELLES_TYPE = {
  fr: { quotidienne: "Veille quotidienne", hebdomadaire: "Veille hebdomadaire" },
  en: { quotidienne: "Daily watch", hebdomadaire: "Weekly watch" },
} as const;

export async function generateStaticParams() {
  return EDITIONS.flatMap((edition) => [
    { locale: "fr", slug: edition.slug },
    { locale: "en", slug: edition.slug },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const edition = obtenirEdition(slug);
  if (!edition) return {};

  return {
    title: edition.titre,
    description: edition.resume,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/veille/${slug}`,
      languages: {
        fr: `https://isomorph.dev/fr/veille/${slug}`,
        en: `https://isomorph.dev/en/veille/${slug}`,
      },
    },
    openGraph: {
      title: `${edition.titre} | ISOMORPH`,
      description: edition.resume,
      url: `https://isomorph.dev/${locale}/veille/${slug}`,
    },
  };
}

export default async function EditionVeillePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const edition = obtenirEdition(slug);

  if (!edition) {
    notFound();
  }

  const dateAffichee = new Date(edition.date).toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );
  const libellesType = locale === "en" ? LIBELLES_TYPE.en : LIBELLES_TYPE.fr;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <p className="type-caption mb-6">
        <Link href="/veille" className="csLien csLienTexte">
          {locale === "en" ? "Back to the technical watch" : "Retour à la veille technique"}
        </Link>
      </p>

      <EnTeteArticle
        categorie={libellesType[edition.type]}
        titre={edition.titre}
        chapeau={edition.resume}
        dateISO={edition.date}
        dateAffichee={dateAffichee}
      />

      <div className="mt-4 flex">
        <Niveau niveau={edition.niveau} locale={locale} />
      </div>

      <div className="mt-10 max-w-[720px]">
        {locale === "en" ? (
          <Panneau coupe="s" className="mb-8 p-5">
            <p className="type-body text-(--cs-texte-2)">
              This edition is published in French only. No automatic translation is
              provided.
            </p>
          </Panneau>
        ) : null}

        <RenduMarkdown contenu={edition.contenu} />
      </div>
    </div>
  );
}
