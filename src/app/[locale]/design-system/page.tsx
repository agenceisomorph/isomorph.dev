import type { Metadata } from "next";
import Link from "next/link";
import { COULEURS, COUPES, COMPOSANTS } from "@/lib/design-system";
import { StylesConsole } from "@/components/console/fondations";

/* Style CSS pour le hover sur les cartes composant (Server Component : pas d'event handler). */
const STYLE_CARTE_DS = `
.cs-ds-carte { background: var(--cs-fond); transition: background 150ms linear; }
.cs-ds-carte:has(a:hover),
.cs-ds-carte:has(a:focus-visible) { background: var(--cs-fond-2); }
`;

/**
 * Page de fondations du design system Console ISOMORPH.
 *
 * Sections : jetons de couleur, coupe des coins, polices, composants.
 * Server Component pur. RGAA 9.1 : un seul h1.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Design system Console" : "Console design system",
    description: fr
      ? "Fondations visuelles et composants du système Console d'ISOMORPH : fond nuit, trait néon, bords coupés, verre sombre."
      : "Visual foundations and components of ISOMORPH's Console system: dark background, neon lines, clipped corners, dark glass.",
    alternates: {
      canonical: `https://isomorph.dev/${locale}/design-system`,
    },
  };
}

/** Échelle typographique Console (Geist). */
const ECHELLE_TYPO = [
  { classe: "type-display", taille: "36 à 48 px", usage: "Accueil, une seule fois par site" },
  { classe: "type-h1",      taille: "28 à 36 px", usage: "Titre de page" },
  { classe: "type-h2",      taille: "22 à 26 px", usage: "Titre de section" },
  { classe: "type-h3",      taille: "18 px",       usage: "Sous-section, titre de carte" },
  { classe: "type-lead",    taille: "17 px",       usage: "Chapeau" },
  { classe: "type-body",    taille: "16 px",       usage: "Texte courant" },
  { classe: "type-caption", taille: "13 px",       usage: "Mention, légende, libellé de navigation" },
];

export default async function DesignSystemPage({ params }: PageProps) {
  const { locale } = await params;
  const fr = locale !== "en";

  return (
    <>
      <StylesConsole />
      <style href="cs-ds-cartes" precedence="ds">{STYLE_CARTE_DS}</style>
      <article
        className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-8 py-12"
        style={{ color: "var(--cs-texte)" }}
      >
        {/* En-tête */}
        <header className="mb-12">
          <h1 className="type-h1 mb-4" style={{ color: "var(--cs-texte)" }}>
            {fr ? "Design system Console" : "Console design system"}
          </h1>
          <p className="type-lead max-w-2xl" style={{ color: "var(--cs-texte-2)" }}>
            {fr
              ? "Fond nuit, trait néon, bords coupés, verre sombre. Les jetons CSS commencent tous par --cs-. Geist Sans pour les textes, Geist Mono pour le code."
              : "Dark background, neon lines, clipped corners, dark glass. All CSS tokens start with --cs-. Geist Sans for text, Geist Mono for code."}
          </p>
        </header>

        {/* Couleurs */}
        <section aria-labelledby="couleurs-titre" className="mb-12">
          <h2
            id="couleurs-titre"
            className="type-h2 mb-6"
            style={{ color: "var(--cs-texte)" }}
          >
            {fr ? "Couleurs" : "Colors"}
          </h2>
          <ul role="list" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {COULEURS.map((c) => (
              <li key={c.variable}>
                <div
                  className="h-20 mb-3"
                  style={{
                    background: c.valeur,
                    border: "1px solid var(--cs-trait)",
                  }}
                  aria-hidden="true"
                />
                <p className="type-h3 mb-0.5" style={{ color: "var(--cs-texte)" }}>{c.nom}</p>
                <p className="type-caption mb-1" style={{ color: "var(--cs-neon)" }}>
                  <code style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
                    {c.variable}
                  </code>
                </p>
                <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>{c.valeur}</p>
                <p className="type-caption mt-1" style={{ color: "var(--cs-texte-3)", opacity: 0.7 }}>
                  {c.usage}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Coupe des coins */}
        <section
          aria-labelledby="coupe-titre"
          className="mb-12 pt-12"
          style={{ borderTop: "1px solid var(--cs-trait)" }}
        >
          <h2
            id="coupe-titre"
            className="type-h2 mb-6"
            style={{ color: "var(--cs-texte)" }}
          >
            {fr ? "Coupe des coins" : "Corner clipping"}
          </h2>
          <p className="type-body mb-6 max-w-xl" style={{ color: "var(--cs-texte-2)" }}>
            {fr
              ? "Trois tailles : s (10 px), m (16 px), l (22 px). Prop coupe sur le composant Panneau."
              : "Three sizes: s (10 px), m (16 px), l (22 px). coupe prop on the Panneau component."}
          </p>
          <ul role="list" className="flex flex-wrap gap-4">
            {COUPES.map((c) => (
              <li key={c.taille}>
                <div
                  className="w-24 h-20 flex items-center justify-center"
                  style={{
                    background: "var(--cs-surface)",
                    border: "1px solid var(--cs-neon)",
                    clipPath: `polygon(${c.px.replace(" px", "")}px 0%, 100% 0%, 100% calc(100% - ${c.px.replace(" px", "")}px), calc(100% - ${c.px.replace(" px", "")}px) 100%, 0% 100%, 0% ${c.px.replace(" px", "")}px)`,
                  }}
                  aria-label={`Coupe ${c.taille}`}
                >
                  <span className="type-caption" style={{ color: "var(--cs-neon)" }}>
                    {c.taille}
                  </span>
                </div>
                <p className="type-caption mt-2" style={{ color: "var(--cs-texte-3)" }}>
                  {c.usage}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Typographie */}
        <section
          aria-labelledby="typo-titre"
          className="mb-12 pt-12"
          style={{ borderTop: "1px solid var(--cs-trait)" }}
        >
          <h2
            id="typo-titre"
            className="type-h2 mb-6"
            style={{ color: "var(--cs-texte)" }}
          >
            {fr ? "Typographie" : "Typography"}
          </h2>
          <p className="type-body mb-6 max-w-xl" style={{ color: "var(--cs-texte-2)" }}>
            {fr
              ? "Geist Sans pour les textes, Geist Mono pour le code. Graisse 600 pour tous les titres. Aucune taille écrite à la main."
              : "Geist Sans for text, Geist Mono for code. Weight 600 for all headings. No hand-written font sizes."}
          </p>
          <ul role="list" style={{ borderTop: "1px solid var(--cs-trait)" }}>
            {ECHELLE_TYPO.map((e) => (
              <li
                key={e.classe}
                className="py-4 flex flex-wrap items-baseline gap-4 lg:gap-8"
                style={{ borderBottom: "1px solid var(--cs-trait)" }}
              >
                <code
                  className="type-caption w-32 shrink-0"
                  style={{ color: "var(--cs-neon)", fontFamily: "var(--font-geist-mono, monospace)" }}
                >
                  {e.classe}
                </code>
                <span className={e.classe} aria-label={`Exemple ${e.classe}`} style={{ color: "var(--cs-texte)" }}>
                  {fr ? "Exemple de texte" : "Sample text"}
                </span>
                <span className="type-caption" style={{ color: "var(--cs-texte-3)" }}>{e.taille}</span>
                <span className="type-caption" style={{ color: "var(--cs-texte-3)", opacity: 0.6 }}>{e.usage}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Composants */}
        <section
          aria-labelledby="composants-titre"
          className="pt-12"
          style={{ borderTop: "1px solid var(--cs-trait)" }}
        >
          <h2
            id="composants-titre"
            className="type-h2 mb-6"
            style={{ color: "var(--cs-texte)" }}
          >
            {fr ? "Composants" : "Components"}
          </h2>
          <p className="type-body mb-8 max-w-xl" style={{ color: "var(--cs-texte-2)" }}>
            {fr
              ? "Chaque fiche présente l'aperçu vivant, les variantes, les états, les props, un exemple de code et les règles RGAA applicables."
              : "Each page shows a live preview, variants, states, props, a code snippet, and applicable RGAA rules."}
          </p>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "var(--cs-trait)" }}
          >
            {COMPOSANTS.map((c) => (
              <li key={c.slug} className="cs-ds-carte">
                <Link
                  href={`/${locale}/design-system/composants/${c.slug}`}
                  className="block p-6"
                >
                  <h3 className="type-h3 mb-2" style={{ color: "var(--cs-texte)" }}>
                    {c.nom}
                  </h3>
                  <p
                    className="type-body mb-3 line-clamp-2"
                    style={{ color: "var(--cs-texte-2)" }}
                  >
                    {c.description}
                  </p>
                  <span
                    className="type-caption"
                    style={{ color: "var(--cs-neon)" }}
                  >
                    {fr ? "Voir la fiche" : "View details"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
