/**
 * Vitrine de la famille « Pages » du système Console : les deux gabarits
 * montés sur des contenus réels (article et fiche projet), et la liste
 * d'articles avec filtre par thème.
 */

import { Carte } from "../contenus/Carte";
import { ListeArticles } from "../pages/ListeArticles";
import { Planche, SectionVitrine } from "./kit";

/**
 * Articles réels du site.
 * Source : src/app/(fr)/actualites/page.tsx, tableau `articles`.
 */
const ARTICLES_VITRINE = [
  {
    slug: "llms-txt",
    category: "SEO et GEO",
    title: "llms.txt : à quoi sert ce fichier, et qui le lit",
    excerpt:
      "Ce que prévoit la proposition de Jeremy Howard, ce qu'en documentent Google, Chrome, OpenAI, Anthropic et Perplexity, et pourquoi ce site en publie un.",
    date: "11 septembre 2026",
    dateISO: "2026-09-11",
    image: "/actualites/llms-txt-cover.svg",
  },
  {
    slug: "hebergement-souverain-france",
    category: "Infrastructure & Cloud",
    title: "ISOMORPH choisit Scaleway, le cloud souverain français",
    excerpt:
      "Souveraineté des données, conformité RGPD : pourquoi nous hébergeons désormais nos clients sur un cloud 100 % français.",
    date: "17 juin 2026",
    dateISO: "2026-06-17",
    image: "/actualites/hebergement-souverain-hero.png",
  },
] as const;

export function VitrinePages() {
  return (
    <SectionVitrine id="pages" index={12} surtitre="Gabarits" titre="Article, projet et cas client" alterne>
      <Planche nom="Pages complètes" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Carte
          titre="Article"
          description="En-tête, sommaire qui suit la lecture, auteur et articles liés."
          href="/atelier/console/article"
        />
        <Carte
          titre="Projet"
          description="Fiche technique, fonctions, installations et projet suivant."
          href="/atelier/console/projet"
        />
        <Carte
          titre="Cas client"
          description="Contexte, besoin, proposition, mesures, parole du client et glossaire."
          href="/atelier/console/cas-client"
        />
      </Planche>

      <Planche nom="Liste d'articles">
        <ListeArticles articles={[...ARTICLES_VITRINE]} />
      </Planche>
    </SectionVitrine>
  );
}
