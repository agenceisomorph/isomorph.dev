/**
 * Page de démonstration — /[locale]/experimentations/[slug]
 *
 * Server Component. La démonstration est rendue par DemoViewer (Client
 * Component), qui charge chaque hero à la demande (next/dynamic, ssr: false).
 *
 * generateStaticParams : pré-rendu de toutes les démonstrations.
 *
 * RGAA 4.1 :
 *   - Canvas avec aria-label ou aria-hidden géré dans chaque hero.
 *   - Fiche courte accessible sous la démo.
 *   - Lien de retour significatif.
 *   - Mouvement réduit géré dans chaque hero.
 *
 * Métadonnées : titre, description, canonical, alternates FR/EN.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StylesConsole } from "@/components/console/fondations";
import { DemoViewer } from "@/components/experimentations/DemoViewer";
import {
  EXPERIMENTATIONS,
  EXPERIMENTATIONS_EN,
  getExperimentation,
} from "@/lib/experimentations";

/* ------------------------------------------------------------------ */
/* Génération statique                                                 */
/* ------------------------------------------------------------------ */
interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const locales = ["fr", "en"];
  return locales.flatMap((locale) =>
    EXPERIMENTATIONS.map((e) => ({ locale, slug: e.slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const exp = getExperimentation(slug);
  if (!exp) return {};

  const estFr = locale === "fr";
  const titre = estFr ? exp.titre : exp.titreEn;
  const desc = estFr ? exp.resume : exp.resumeEn;

  return {
    title: `${titre}, expérimentation`,
    description: desc,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/experimentations/${slug}`,
      languages: {
        fr: `https://isomorph.dev/fr/experimentations/${slug}`,
        en: `https://isomorph.dev/en/experimentations/${slug}`,
      },
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default async function PageExperimentation({ params }: PageProps) {
  const { locale, slug } = await params;
  const exp = getExperimentation(slug);
  if (!exp) notFound();

  const estFr = locale === "fr";
  const liste = estFr ? EXPERIMENTATIONS : EXPERIMENTATIONS_EN;
  const expLocale = liste.find((e) => e.slug === slug) ?? exp;

  const LABELS = {
    retour: estFr ? "Toutes les expérimentations" : "All experiments",
    technologie: estFr ? "Technologie" : "Technology",
    montre: estFr ? "Ce que ca montre" : "What it shows",
  };

  return (
    <>
      <StylesConsole />

      <main
        id="contenu-principal"
        className="min-h-screen"
        style={{ background: "var(--cs-fond)", color: "var(--cs-texte)" }}
      >
        {/* Lien de retour */}
        <nav aria-label={LABELS.retour} className="px-6 pt-8">
          <Link
            href={`/${locale}/experimentations`}
            className="type-caption text-(--cs-neon)/70 hover:text-(--cs-neon) transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--cs-neon) rounded"
          >
            {/* Fleche de retour */}
            <span aria-hidden="true">&#8592;</span> {LABELS.retour}
          </Link>
        </nav>

        {/* Zone de démonstration */}
        <section
          aria-label={expLocale.titre}
          className="relative w-full"
          style={{ height: "100svh" }}
        >
          <DemoViewer slug={slug} titre={expLocale.titre} />
        </section>

        {/* Fiche courte */}
        <aside
          className="px-6 py-12 max-w-2xl mx-auto space-y-6"
          aria-labelledby="fiche-titre"
        >
          <h1 id="fiche-titre" className="type-h2 font-semibold text-(--cs-texte)">
            {expLocale.titre}
          </h1>

          <dl className="space-y-4">
            <div>
              <dt className="type-caption uppercase tracking-wider text-(--cs-texte-3)">
                {LABELS.technologie}
              </dt>
              <dd className="type-body text-(--cs-texte-2) mt-1">{exp.techno}</dd>
            </div>
            <div>
              <dt className="type-caption uppercase tracking-wider text-(--cs-texte-3)">
                {LABELS.montre}
              </dt>
              <dd className="type-body text-(--cs-texte-2) mt-1">{expLocale.resume}</dd>
            </div>
          </dl>
        </aside>
      </main>
    </>
  );
}
