/**
 * Galerie des expérimentations — /[locale]/experimentations
 *
 * Server Component. Aucune bibliothèque 3D chargée sur cette page.
 * Les démonstrations sont chargées uniquement sur les pages de détail.
 *
 * RGAA 4.1 :
 *   - Critère 8.6 : titre de page dans generateMetadata.
 *   - Critère 6.1 : titres des cartes portent l'intitulé de chaque démo.
 *   - Critère 10.1 : contrastes vérifiés sur fond --cs-fond.
 *
 * Éco-conception :
 *   - Aucun canvas, aucune bibliothèque 3D : zéro JavaScript 3D sur la galerie.
 *   - Aperçus CSS + SVG inline, poids total < 5 ko.
 *
 * Métadonnées SEO : titre, description, alternates hreflang FR/EN, canonical.
 */

import type { Metadata } from "next";

import { CarteExperimentation } from "@/components/experimentations/CarteExperimentation";
import { StylesConsole } from "@/components/console/fondations";
import { EXPERIMENTATIONS, EXPERIMENTATIONS_EN } from "@/lib/experimentations";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const estFr = locale === "fr";

  const titre = estFr
    ? "Expérimentations"
    : "Experiments";
  const description = estFr
    ? "Démonstrations visuelles et techniques : heros 3D, globe WebGL, carte MapLibre, décors d'instruments et fonds animés du système Console."
    : "Visual and technical demos: 3D heroes, WebGL globe, MapLibre map, instrument widgets and animated Console backgrounds.";

  return {
    title: titre,
    description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/experimentations`,
      languages: {
        fr: "https://isomorph.dev/fr/experimentations",
        en: "https://isomorph.dev/en/experimentations",
      },
    },
  };
}

export default async function PageExperimentations({ params }: PageProps) {
  const { locale } = await params;
  const estFr = locale === "fr";
  const liste = estFr ? EXPERIMENTATIONS : EXPERIMENTATIONS_EN;

  /* Séparation par groupe */
  const heros = liste.filter((e) => e.groupe === "hero");
  const instruments = liste.filter((e) => e.groupe === "instrument");
  const terrains = liste.filter((e) => e.groupe === "terrain");

  const LABELS = {
    titre: estFr ? "Expérimentations" : "Experiments",
    chapeau: estFr
      ? "Démonstrations visuelles et techniques du système Console."
      : "Visual and technical demos from the Console design system.",
    heros: estFr ? "Heros 3D" : "3D heroes",
    instruments: estFr ? "Instruments" : "Instruments",
    terrains: estFr ? "Fonds et terrains" : "Backgrounds and terrains",
    jouer: estFr ? "Ouvrir la démonstration" : "Open demo",
  };

  return (
    <>
      <StylesConsole />

      <main
        id="contenu-principal"
        className="min-h-screen"
        style={{ background: "var(--cs-fond)", color: "var(--cs-texte)" }}
      >
        {/* En-tête de page */}
        <header className="px-6 pt-16 pb-12 max-w-5xl mx-auto">
          <h1 className="type-h1 font-semibold text-(--cs-texte)">{LABELS.titre}</h1>
          <p className="type-lead text-(--cs-texte-2) mt-3 max-w-2xl">{LABELS.chapeau}</p>
        </header>

        <div className="px-6 pb-20 max-w-5xl mx-auto space-y-16">
          {/* Section Heros */}
          {heros.length > 0 && (
            <section aria-labelledby="section-heros">
              <h2 id="section-heros" className="type-h2 font-semibold text-(--cs-texte) mb-8">
                {LABELS.heros}
              </h2>
              <ul
                role="list"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {heros.map((exp) => (
                  <li key={exp.slug}>
                    <CarteExperimentation experimentation={exp} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section Instruments */}
          {instruments.length > 0 && (
            <section aria-labelledby="section-instruments">
              <h2 id="section-instruments" className="type-h2 font-semibold text-(--cs-texte) mb-8">
                {LABELS.instruments}
              </h2>
              <ul
                role="list"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {instruments.map((exp) => (
                  <li key={exp.slug}>
                    <CarteExperimentation experimentation={exp} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Section Terrains */}
          {terrains.length > 0 && (
            <section aria-labelledby="section-terrains">
              <h2 id="section-terrains" className="type-h2 font-semibold text-(--cs-texte) mb-8">
                {LABELS.terrains}
              </h2>
              <ul
                role="list"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {terrains.map((exp) => (
                  <li key={exp.slug}>
                    <CarteExperimentation experimentation={exp} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
