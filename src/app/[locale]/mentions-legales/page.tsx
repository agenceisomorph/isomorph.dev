import type { Metadata } from "next";
import Link from "next/link";
import { StylesConsole } from "@/components/console/fondations";

/**
 * Mentions légales — /[locale]/mentions-legales
 *
 * Texte fourni par LEGAL dans _docs/legal/mentions-legales.md (25/09/2026).
 * Version française faisant foi. Sous /en : une ligne l'indique.
 *
 * noindex : pages légales exclues du sitemap public.
 * RGAA 9.1 : h1 unique.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Mentions légales" : "Legal notice",
    robots: { index: false, follow: false },
  };
}

/** Mise en forme d'un bloc de contenu légal */
function ContenuLegal({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-[800px] px-4 md:px-6 xl:px-8 py-16"
      style={{ color: "var(--cs-texte-2)" }}
    >
      {children}
    </div>
  );
}

function TexteEnFrancais() {
  return (
    <ContenuLegal>
      <h1
        className="type-h1 font-semibold mb-10"
        style={{ color: "var(--cs-texte)", fontWeight: 600 }}
      >
        Mentions légales
      </h1>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Éditeur du site
        </h2>
        <p className="type-body mb-3">
          Le site isomorph.dev est édité par ISOMORPH, société à responsabilité limitée au capital de 500 euros.
        </p>
        <p className="type-body mb-3">Siège social : 58 rue de Monceau, 75008 Paris, France.</p>
        <p className="type-body mb-3">
          Immatriculée au registre du commerce et des sociétés de Paris sous le numéro 881 258 792. SIRET du siège : 881 258 792 00038. Code APE : 62.01Z, programmation informatique.
        </p>
        <p className="type-body mb-3">Numéro de TVA intracommunautaire : FR66 881 258 792.</p>
        <p className="type-body mb-3">Adresse électronique : contact@isomorph.fr</p>
        <p className="type-body">[À compléter : numéro de téléphone d'ISOMORPH, exigé par l'article 1er-1 de la loi n° 2004-575]</p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Directeur de la publication
        </h2>
        <p className="type-body">Florent Ducase, gérant d'ISOMORPH.</p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Hébergement du site
        </h2>
        <p className="type-body mb-3">
          Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.
        </p>
        <p className="type-body mb-3">[À compléter : numéro de téléphone de Vercel Inc.]</p>
        <p className="type-body">Formulaire de contact de l'hébergeur : vercel.com/contact.</p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Propriété intellectuelle
        </h2>
        <p className="type-body mb-3">
          Les contenus publiés sur isomorph.dev, textes, illustrations, logos et icônes, sont protégés par le droit d'auteur et appartiennent à ISOMORPH, sauf mention contraire. Toute reproduction, représentation, modification ou diffusion, totale ou partielle, est interdite sans autorisation écrite préalable.
        </p>
        <p className="type-body">
          Le code source des extensions et projets publiés par ISOMORPH fait exception : il est régi par la licence indiquée dans son dépôt public.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Vente de licences
        </h2>
        <p className="type-body">
          Les licences payantes proposées sur le site sont régies par les{" "}
          <Link href="/fr/cgv" style={{ color: "var(--cs-neon)" }}>
            conditions générales de vente
          </Link>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Responsabilité
        </h2>
        <p className="type-body">
          Les informations techniques publiées sur le site sont données à titre indicatif. Seuls les conditions générales de vente et, le cas échéant, un devis signé engagent ISOMORPH.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Liens hypertextes
        </h2>
        <p className="type-body">
          Le site renvoie vers des sites tiers, notamment des dépôts de code, des registres de paquets et des sources documentaires. ISOMORPH n'exerce aucun contrôle sur ces sites et n'est pas responsable de leur contenu.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Données personnelles et cookies
        </h2>
        <p className="type-body">
          Les traitements de données personnelles opérés par le site, ainsi que les informations qu'il enregistre dans le navigateur, sont décrits dans la{" "}
          <Link href="/fr/confidentialite" style={{ color: "var(--cs-neon)" }}>
            politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Droit applicable
        </h2>
        <p className="type-body">Les présentes mentions légales sont soumises au droit français.</p>
      </section>

      <p className="type-caption mt-12" style={{ color: "var(--cs-texte-3)" }}>
        Mentions établies en application des articles 1er-1 et 19 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique. Dernière mise à jour : [À compléter : date de mise en ligne].
      </p>
    </ContenuLegal>
  );
}

function TexteEnAnglais() {
  return (
    <ContenuLegal>
      <p
        className="type-caption mb-10 p-4 rounded"
        style={{ color: "var(--cs-texte-3)", background: "var(--cs-surface)", border: "1px solid var(--cs-trait)" }}
      >
        The French version of this document is the legally binding version.{" "}
        <Link href="/fr/mentions-legales" style={{ color: "var(--cs-neon)" }}>
          Lire la version française
        </Link>
        .
      </p>
      <TexteEnFrancais />
    </ContenuLegal>
  );
}

export default async function MentionsLegalesPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <>
      <StylesConsole />
      <div style={{ background: "var(--cs-fond)", minHeight: "100vh" }}>
        {locale === "en" ? <TexteEnAnglais /> : <TexteEnFrancais />}
      </div>
    </>
  );
}
