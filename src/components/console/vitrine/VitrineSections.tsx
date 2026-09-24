/**
 * Vitrine : famille Sections Image du système de design Console.
 *
 * Données réelles :
 *  - Bpifrance Diag Axes d'Innovation : CLAUDE.md (diaginno.bpifrance.fr).
 *  - Services : src/components/hero-console/HeroConsole.tsx, const SERVICES.
 *  - FAQ SEO/GEO : src/content/competences/seo-et-geo.tsx.
 *  - Article hébergement : src/app/(fr)/actualites/hebergement-souverain-france/page.tsx.
 *  - Images : public/salle-machines/*.webp, public/actualites/*.png.
 */

import { ImageAccordeon } from "../sections/ImageAccordeon";
import { ImageListe } from "../sections/ImageListe";
import { ImageTexte } from "../sections/ImageTexte";
import { Parallaxe } from "../sections/Parallaxe";
import { FriseEtapes } from "../sections/FriseEtapes";
import { BlocAnime } from "../animations/BlocAnime";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Données sourcées                                                    */
/* ------------------------------------------------------------------ */

/**
 * Services réels.
 * Source : src/components/hero-console/HeroConsole.tsx, const SERVICES.
 */
const SERVICES_DEMO = [
  { titre: "Site web", description: "Vitrine, plateforme SaaS, CMS", href: "/developpement-web-sur-mesure" },
  { titre: "E-commerce", description: "CMS, sur-mesure", href: "/contact" },
  { titre: "Application mobile", description: "Développement natif et PWA", href: "/contact" },
  { titre: "CRM", description: "Application métier, intégration Airtable, HubSpot", href: "/developpement-logiciel-sur-mesure" },
  { titre: "SEO & GEO", description: "Référencement sur les agents IA et les moteurs de recherche", href: "/audit-seo-technique" },
  { titre: "Publicité", description: "Google Ads, Bing Ads, Meta Ads", href: "/consultant-google-ads" },
  { titre: "IA & Automatisation", description: "Intégration de workflows", href: "/contact" },
];

/**
 * FAQ SEO/GEO réelle.
 * Source : src/content/competences/seo-et-geo.tsx, section "faq".
 * Images : public/salle-machines/*.webp (dimensions vérifiées).
 */
const FAQ_ACCORDEON = [
  {
    question: "Le SEO et le GEO sont-ils deux prestations ?",
    reponse:
      "Une seule. Google écrit, dans son guide du 15 mai 2026, que l'optimisation pour ses fonctions d'IA générative reste du SEO : mêmes systèmes, mêmes fondamentaux. ChatGPT, Claude et Perplexity ajoutent leurs propres robots, que nous réglons un par un.",
    image: { src: "/salle-machines/socle.webp", alt: "Couche de base d'une infrastructure numérique", largeur: 724, hauteur: 800 },
  },
  {
    question: "Qu'est-ce qui dépend de nous, et qu'est-ce qui dépend du moteur ?",
    reponse:
      "Le site lisible, l'accès réglé, les contenus sourcés et la mesure : c'est notre travail, et il se vérifie. Le choix des sources citées dans une réponse appartient au moteur ; Google précise que l'indexation et l'affichage restent à sa discrétion.",
    image: { src: "/salle-machines/couches.webp", alt: "Représentation des couches d'une architecture technique", largeur: 764, hauteur: 800 },
  },
  {
    question: "Comment se mesure la présence dans les réponses des IA ?",
    reponse:
      "Search Console compte les impressions dans les aperçus IA et le mode IA depuis juin 2026. Bing Webmaster Tools suit les citations dans Copilot depuis février 2026. Pour ChatGPT, Claude et Perplexity, la mesure passe par le trafic qu'ils envoient, visible dans votre outil d'analyse.",
    image: { src: "/salle-machines/ecoutille.webp", alt: "Interface d'observation et de contrôle", largeur: 800, hauteur: 799 },
  },
  {
    question: "Intervenez-vous sur un site développé par une autre équipe ?",
    reponse:
      "Oui. L'audit vaut pour tout site ; les corrections se font dans son code ou dans son CMS, selon les accès ouverts.",
    image: { src: "/salle-machines/instrument.webp", alt: "Instrument de mesure et de pilotage", largeur: 782, hauteur: 800 },
  },
];

/**
 * Étapes d'un projet de développement logiciel.
 * Source : src/lib/expertises/data.ts, expertise "developpement-logiciel-sur-mesure",
 * steps.items (lu le 2026-09-24, non recopié manuellement : voir la source).
 */
const ETAPES_DEMO = [
  { title: "Cadrage écrit", body: "Périmètre, règles métier, gabarits d'interface. Ce document est livré avant tout développement." },
  { title: "Architecture", body: "Modélisation des données, droits d'accès, structure des API." },
  { title: "Développement par modules", body: "Chaque module est recetté avant le suivant." },
  { title: "Recette", body: "Tests sur environnement de préproduction avec vos équipes." },
  { title: "Mise en production", body: "Déploiement, formation, documentation." },
];

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineSections() {
  return (
    <SectionVitrine
      id="sections"
      index={7}
      surtitre="Sections"
      titre="Image et texte"
    >
      {/* ===== ImageTexte (côté gauche) ===== */}
      <Planche
        nom="Image et texte"
        note="Image à gauche."
      >
        {/*
          Texte : Diag Axes d'Innovation Bpifrance.
          Source : CLAUDE.md, section "Vérités factuelles" (diaginno.bpifrance.fr).
          Image : public/salle-machines/instrument.webp (782 x 800).
        */}
        <BlocAnime bloc="image-texte">
          <ImageTexte
            etiquette="Expert conseil agréé"
            titre="Diag Axes d'Innovation Bpifrance"
            corps="ISOMORPH est expert conseil agréé sur le Diag Axes d'Innovation. Le dispositif prend en charge 50 % du montant de la prestation, dans la limite de 13 000 € HT. Le reste à charge maximal est de 6 500 € HT."
            cta={{ label: "Démarrer un projet", href: "/contact" }}
            image={{
              src: "/salle-machines/instrument.webp",
              alt: "Instrument de mesure et de pilotage d'une infrastructure numérique",
              largeur: 782,
              hauteur: 800,
            }}
            cote="gauche"
          />
        </BlocAnime>
      </Planche>

      {/* ===== ImageTexte (côté droite) ===== */}
      <Planche
        nom="Texte et image"
        note="Image à droite."
      >
        {/*
          Texte : article hébergement souverain.
          Source : src/app/(fr)/actualites/hebergement-souverain-france/page.tsx,
          metadata.description.
          Image : public/actualites/hebergement-souverain-transition.png (1672 x 941).
        */}
        <BlocAnime bloc="image-texte">
          <ImageTexte
            etiquette="Infrastructure"
            titre="ISOMORPH choisit Scaleway, le cloud souverain français"
            corps="Souveraineté des données, conformité RGPD : pourquoi ISOMORPH héberge désormais ses clients sur un cloud souverain français."
            cta={{ label: "Lire l'article", href: "/actualites/hebergement-souverain-france", variante: "tertiaire" }}
            image={{
              src: "/actualites/hebergement-souverain-transition.png",
              alt: "Migration d'un cloud américain vers un cloud français",
              largeur: 1672,
              hauteur: 941,
            }}
            cote="droite"
          />
        </BlocAnime>
      </Planche>

      {/* ===== ImageAccordeon ===== */}
      <Planche
        nom="Image et accordéon"
        note="L'image change avec la question ouverte."
      >
        {/*
          FAQ SEO/GEO réelle.
          Source : src/content/competences/seo-et-geo.tsx.
          Images : public/salle-machines/*.webp.
        */}
        <BlocAnime bloc="image-accordeon">
          <ImageAccordeon
            etiquette="SEO & GEO"
            titre="Questions fréquentes"
            items={FAQ_ACCORDEON}
          />
        </BlocAnime>
      </Planche>

      {/* ===== ImageListe ===== */}
      <Planche
        nom="Image et liste"
        note="Une liste numérotée à côté de l'image."
      >
        {/*
          Services réels.
          Source : src/components/hero-console/HeroConsole.tsx, const SERVICES.
          Image : public/salle-machines/socle.webp (724 x 800).
        */}
        <BlocAnime bloc="image-liste">
          <ImageListe
            etiquette="Services"
            titre="Ce que nous concevons"
            chapeau="Sites, applications, outils métier. Nous concevons des solutions digitales durables, dont les résultats se mesurent."
            items={SERVICES_DEMO}
            image={{
              src: "/salle-machines/socle.webp",
              alt: "Couche socle d'une architecture technique",
              largeur: 724,
              hauteur: 800,
            }}
            cote="droite"
          />
        </BlocAnime>
      </Planche>

      {/* ===== Parallaxe ===== */}
      <Planche
        nom="Parallaxe"
        note="Le fond défile moins vite que la page."
      >
        {/*
          Image : public/actualites/hebergement-souverain-hero.png (1536 x 1024).
          Source : src/app/(fr)/actualites/hebergement-souverain-france/page.tsx.
          Titre et chapeau : metadata.title et metadata.description de l'article.
        */}
        <BlocAnime bloc="parallaxe">
          <Parallaxe
            etiquette="Infrastructure"
            titre="Hébergement souverain en France"
            chapeau="Souveraineté des données, conformité RGPD : pourquoi le choix de l'hébergeur change tout."
            image={{
              src: "/actualites/hebergement-souverain-hero.png",
            }}
            cta={{ label: "Lire l'article", href: "/actualites/hebergement-souverain-france" }}
          />
        </BlocAnime>
      </Planche>

      {/* ===== Frise d'étapes ===== */}
      <Planche
        nom="Frise d'étapes"
        note="Démarche numérotée, trait néon entre les étapes."
      >
        {/*
          Étapes : projet de développement logiciel sur mesure.
          Source : src/lib/expertises/data.ts, expertise
          "developpement-logiciel-sur-mesure", steps.items.
        */}
        <BlocAnime bloc="frise">
          <FriseEtapes
            etiquette="Méthode"
            titre="Le déroulé d'un projet"
            items={ETAPES_DEMO}
          />
        </BlocAnime>
      </Planche>
    </SectionVitrine>
  );
}
