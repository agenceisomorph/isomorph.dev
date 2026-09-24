/**
 * Index des actualités, tenu à la main (un dossier par article sous
 * `src/app/(fr)/actualites/`). Source unique de la liste `/actualites` et du
 * bloc « À lire aussi » des articles.
 */
import type { ResumeArticle } from "@/components/console/pages/CarteArticle";

export type { ResumeArticle };

export const ARTICLES: readonly ResumeArticle[] = [
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
];
