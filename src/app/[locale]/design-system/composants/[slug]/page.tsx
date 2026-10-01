import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPOSANTS, getComposant } from "@/lib/design-system";
import GabariComposant from "@/components/ds/GabariComposant";
import ApercuBouton from "@/components/ds/apercus/ApercuBouton";
import ApercuLien from "@/components/ds/apercus/ApercuLien";
import ApercuCarte from "@/components/ds/apercus/ApercuCarte";
import ApercuChamp from "@/components/ds/apercus/ApercuChamp";
import ApercuAccordeon from "@/components/ds/apercus/ApercuAccordeon";
import ApercuEtiquette from "@/components/ds/apercus/ApercuEtiquette";

/**
 * Fiche composant du design system Console.
 *
 * Chaque slug correspond à une entrée dans src/lib/design-system.ts.
 * L'aperçu vivant est importé depuis src/components/ds/apercus/.
 *
 * generateStaticParams : toutes les fiches sont prérendues.
 * RGAA 9.1 : h1 dans le GabariComposant.
 */

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return COMPOSANTS.flatMap((c) => [
    { locale: "fr", slug: c.slug },
    { locale: "en", slug: c.slug },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const composant = getComposant(slug);
  if (!composant) return {};
  return {
    title: composant.nom,
    description: composant.description,
    alternates: {
      canonical: `https://isomorph.dev/${locale}/design-system/composants/${slug}`,
    },
  };
}

/** Mappe un slug vers son aperçu vivant Console. */
function getApercu(slug: string) {
  switch (slug) {
    case "bouton":     return <ApercuBouton />;
    case "lien":       return <ApercuLien />;
    case "panneau":    return <ApercuCarte />;
    case "champ":      return <ApercuChamp />;
    case "retours":    return <ApercuAccordeon />;
    case "navigation": return <ApercuEtiquette />;
    default:           return null;
  }
}

export default async function FicheComposantPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const composant = getComposant(slug);
  if (!composant) notFound();
  const fr = locale !== "en";
  const apercu = getApercu(slug);

  return (
    <GabariComposant
      composant={composant}
      apercu={apercu}
      fr={fr}
    />
  );
}
