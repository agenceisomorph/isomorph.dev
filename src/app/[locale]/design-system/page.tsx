import type { Metadata } from "next";
import Link from "next/link";
import { COULEURS, ECHELLE_TYPO, ESPACEMENT, COMPOSANTS } from "@/lib/design-system";

/**
 * Page de fondations du design system ISOMORPH.
 *
 * Sections : jetons de couleur, échelle typographique, espacement.
 * Liens vers chaque fiche composant.
 *
 * Server Component pur.
 * RGAA 9.1 : un seul h1.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Design system" : "Design system",
    description: fr
      ? "Fondations visuelles et composants réutilisables d'ISOMORPH : couleurs, typographie, espacement, gabarit de fiche composant."
      : "ISOMORPH's visual foundations and reusable components: colors, typography, spacing, component template.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}/design-system`,
    },
  };
}

export default async function DesignSystemPage({ params }: PageProps) {
  const { locale } = await params;
  const fr = locale !== "en";

  return (
    <article className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-8 py-12">
      {/* En-tête */}
      <header className="mb-12">
        <h1 className="type-h1 text-noir mb-4">
          {fr ? "Design system" : "Design system"}
        </h1>
        <p className="type-lead text-gris max-w-2xl">
          {fr
            ? "Fondations visuelles et gabarit de composants d'ISOMORPH. Noir et blanc, Archivo Black pour les titres, Jost pour le texte."
            : "ISOMORPH's visual foundations and component template. Black and white, Archivo Black for headings, Jost for body text."}
        </p>
      </header>

      {/* Couleurs */}
      <section aria-labelledby="couleurs-titre" className="mb-12">
        <h2 id="couleurs-titre" className="type-h2 text-noir mb-6">
          {fr ? "Couleurs" : "Colors"}
        </h2>
        <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {COULEURS.map((c) => (
            <li key={c.variable}>
              <div
                className="h-20 border border-[var(--trait)] mb-3"
                style={{ background: c.valeur }}
                aria-hidden="true"
              />
              <p className="type-h3 text-noir mb-0.5">{c.nom}</p>
              <p className="type-caption text-gris mb-1">
                <code>{c.variable}</code>
              </p>
              <p className="type-caption text-gris">{c.valeur}</p>
              <p className="type-caption text-gris opacity-60 mt-1">{c.usage}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Typographie */}
      <section aria-labelledby="typo-titre" className="mb-12 border-t border-[var(--trait)] pt-12">
        <h2 id="typo-titre" className="type-h2 text-noir mb-6">
          {fr ? "Typographie" : "Typography"}
        </h2>
        <p className="type-body text-gris mb-6 max-w-xl">
          {fr
            ? "Archivo Black pour les titres (uppercase, graisse 400), Jost pour le texte courant. Aucune taille écrite à la main."
            : "Archivo Black for headings (uppercase, weight 400), Jost for body text. No hand-written font sizes."}
        </p>
        <ul role="list" className="divide-y divide-[var(--trait)]">
          {ECHELLE_TYPO.map((e) => (
            <li key={e.classe} className="py-4 flex flex-wrap items-baseline gap-4 lg:gap-8">
              <code className="type-caption text-gris w-32 shrink-0">{e.classe}</code>
              <span className={e.classe} aria-label={`Exemple ${e.classe}`}>
                {fr ? "Titre exemple" : "Example heading"}
              </span>
              <span className="type-caption text-gris">{e.taille}</span>
              <span className="type-caption text-gris opacity-60">{e.usage}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Espacement */}
      <section aria-labelledby="espacement-titre" className="mb-12 border-t border-[var(--trait)] pt-12">
        <h2 id="espacement-titre" className="type-h2 text-noir mb-6">
          {fr ? "Espacement" : "Spacing"}
        </h2>
        <p className="type-body text-gris mb-6 max-w-xl">
          {fr
            ? "Tailwind 4 par défaut (multiples de 4 px). Classes utilitaires standard : p-4, gap-6, py-12, etc."
            : "Tailwind 4 defaults (multiples of 4 px). Standard utility classes: p-4, gap-6, py-12, etc."}
        </p>
        <ul role="list" className="divide-y divide-[var(--trait)]">
          {ESPACEMENT.map((e) => (
            <li key={e.valeur} className="py-3 flex items-center gap-6">
              <div
                className="bg-noir shrink-0"
                style={{ width: `${parseInt(e.px) * 0.5}px`, height: "16px" }}
                aria-hidden="true"
              />
              <code className="type-caption text-gris w-8 shrink-0">{e.valeur}</code>
              <span className="type-caption text-gris w-12 shrink-0">{e.px}</span>
              <span className="type-caption text-gris opacity-60">{e.usage}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Composants */}
      <section aria-labelledby="composants-titre" className="border-t border-[var(--trait)] pt-12">
        <h2 id="composants-titre" className="type-h2 text-noir mb-6">
          {fr ? "Composants" : "Components"}
        </h2>
        <p className="type-body text-gris mb-8 max-w-xl">
          {fr
            ? "Chaque fiche présente l'aperçu vivant, les variantes, les états, les props, un exemple de code à copier et les règles RGAA applicables."
            : "Each page shows a live preview, variants, states, props, a code snippet to copy, and applicable RGAA rules."}
        </p>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--trait)]">
          {COMPOSANTS.map((c) => (
            <li key={c.slug} className="bg-blanc">
              <Link
                href={`/${locale}/design-system/composants/${c.slug}`}
                className="group block p-6 hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
              >
                <h3 className="type-h3 text-noir mb-2">{c.nom}</h3>
                <p className="type-body text-gris mb-3 line-clamp-2">{c.description}</p>
                <span className="type-caption text-noir group-hover:underline">
                  {fr ? "Voir la fiche" : "View details"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
