/**
 * Vitrine : famille Comparaison du système Console.
 *
 * Deux planches de comparaison et une section FAQ.
 * La prop `jsonLd` reste désactivée sur cette page non indexée.
 *
 * Sources des données (rappel en commentaire de chaque bloc) :
 *  - Airtable vs développement sur mesure :
 *    src/components/expertises/AirtableView.tsx, tableau COMPARATIF.
 *  - Strapi vs WordPress :
 *    src/content/competences/strapi.tsx (FAQ et intro)
 *    src/content/competences/sites-et-applications-web.tsx (services)
 *    Cellules WordPress : pas de source sur le site, placeholders requis.
 *  - FAQ Strapi : src/content/competences/strapi.tsx, section faq.
 */

import type { ItemAccordeon } from "../contenus/Accordeon";
import { Faq } from "../comparaison/Faq";
import {
  TableauComparaison,
  type ColonneComparaison,
  type LigneComparaison,
} from "../comparaison/TableauComparaison";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Comparaison 1 : Airtable contre développement sur mesure           */
/* ------------------------------------------------------------------ */

/**
 * Source intégrale : src/components/expertises/AirtableView.tsx,
 * const COMPARATIF (lignes 159-168).
 * Caption repris de la même source (ligne 448).
 * Libellés des colonnes : lignes 449-450.
 */
const COL_AIRTABLE_1: ColonneComparaison = { libelle: "Airtable" };
const COL_SUR_MESURE: ColonneComparaison = {
  libelle: "Développement sur mesure",
  accent: true,
  etiquette: "Notre prestation",
};

const LIGNES_AIRTABLE: LigneComparaison[] = [
  {
    // Source : AirtableView.tsx COMPARATIF[0]
    critere: "Partir de votre processus actuel et le faire tourner vite",
    cellules: [
      { valeur: "oui" },
      { valeur: "non", note: "Construction plus longue" },
    ],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[1]
    critere: "Confier l'évolution de la structure à vos équipes elles-mêmes",
    cellules: [{ valeur: "oui" }, { valeur: "non" }],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[2]
    critere: "Ouvrir la saisie à des personnes extérieures à l'équipe",
    cellules: [{ valeur: "oui" }, { valeur: "non" }],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[3]
    critere: "Servir un large public en consultation",
    cellules: [{ valeur: "oui" }, { valeur: "non" }],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[4]
    critere: "Traiter de gros volumes de données",
    cellules: [
      {
        valeur: "non",
        note: "50 000 fiches par base sur le plan Team, 125 000 sur Business (éditeur, 09/2026)",
      },
      { valeur: "oui" },
    ],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[5]
    critere: "Porter des règles métier profondes et très spécifiques",
    cellules: [{ valeur: "non" }, { valeur: "oui" }],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[6]
    critere: "Héberger les données en France",
    cellules: [
      { valeur: "non", note: "Éditeur américain" },
      { valeur: "oui" },
    ],
  },
  {
    // Source : AirtableView.tsx COMPARATIF[7]
    critere: "Maîtriser le tarif et les fonctionnalités dans la durée",
    cellules: [
      { valeur: "non", note: "Fixés par l'éditeur" },
      { valeur: "oui" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Comparaison 2 : Strapi + Next.js contre WordPress                  */
/* ------------------------------------------------------------------ */

/**
 * Colonnes Strapi : sourcées depuis strapi.tsx et sites-et-applications-web.tsx.
 * Colonnes WordPress : aucune source présente sur le site à ce jour.
 * Toutes les cellules WordPress portent un placeholder.
 */
const COL_WORDPRESS: ColonneComparaison = { libelle: "WordPress" };
const COL_STRAPI: ColonneComparaison = {
  libelle: "Strapi + Next.js",
  accent: true,
  etiquette: "Notre stack",
};

const LIGNES_STRAPI: LigneComparaison[] = [
  {
    // Strapi : src/content/competences/strapi.tsx, FAQ "Où sont hébergées les données ?"
    // "Sur des serveurs Scaleway en France. [...] les données relèvent du droit
    // français et européen."
    // WordPress : aucune source sur le site.
    critere: "Hébergement des données en France",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
  {
    // Strapi : src/content/competences/sites-et-applications-web.tsx, ligne 207.
    // "L'interface d'administration Strapi v5 est conçue pour les personnes
    // qui ne développent pas."
    // WordPress : aucune source sur le site.
    critere: "Interface d'administration accessible sans développeur",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
  {
    // Strapi : src/content/competences/next-js.tsx, FAQ "Next.js remplace-t-il Strapi ?"
    // "Strapi v5 gère les contenus et les droits d'accès. Next.js App Router est
    // le front qui les affiche."
    // WordPress : aucune source sur le site.
    critere: "Séparation du CMS et du front (architecture headless)",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
  {
    // Strapi : src/content/competences/strapi.tsx, FAQ "Quels référentiels [...] ?"
    // "Quatre : accessibilité RGAA 4.1.2, éco-conception RGESN, Core Web Vitals
    // et sécurité OWASP Top 10 : 2025."
    // WordPress : aucune source sur le site.
    critere: "Conformité aux 4 référentiels ISOMORPH (RGAA, RGESN, CWV, OWASP)",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
  {
    // Strapi : src/content/competences/strapi.tsx, FAQ "Pouvez-vous développer
    // un plugin Strapi sur mesure ?"
    // "Nos trois plugins publiés sur npm en donnent la mesure."
    // WordPress : aucune source sur le site.
    critere: "Plugins sur mesure développés et publiés par l'agence",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
  {
    // Strapi : src/content/competences/strapi.tsx, intro.
    // "Nous contribuons aussi à l'écosystème : nos plugins sont publiés sur npm."
    // et src/content/competences/sites-et-applications-web.tsx, intro.
    // "TypeScript strict pour la maintenabilité."
    // WordPress : aucune source sur le site.
    critere: "Code source typé (TypeScript strict) et transmissible",
    cellules: [
      { placeholder: "[À compléter — source : page agence-wordpress]" },
      { valeur: "oui" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* FAQ de démonstration                                                */
/* ------------------------------------------------------------------ */

/**
 * Questions sourcées depuis src/content/competences/strapi.tsx,
 * section "faq" (lignes 175-212). Le champ "answer" est renommé
 * "reponse" pour correspondre au type ItemAccordeon.
 */
const FAQ_DEMO: ItemAccordeon[] = [
  {
    // Source : strapi.tsx, faq[0]
    question: "Où sont hébergées les données ?",
    reponse:
      "Sur des serveurs Scaleway en France. Les backends Strapi sont conteneurisés, la base PostgreSQL est sauvegardée chaque jour avec une rétention de quinze jours, et les données relèvent du droit français et européen.",
  },
  {
    // Source : strapi.tsx, faq[2]
    question: "Reprenez-vous un projet Strapi développé par quelqu'un d'autre ?",
    reponse:
      "Oui. La reprise commence par une lecture du code, de la configuration et des contenus, puis un état des lieux écrit avant que le périmètre de la maintenance soit fixé.",
  },
  {
    // Source : strapi.tsx, faq[3]
    question: "Pouvez-vous développer un plugin Strapi sur mesure ?",
    reponse:
      "Oui. Nos trois plugins publiés sur npm en donnent la mesure : champs personnalisés, panneaux d'administration dédiés et intégrations métier. Nous développons ce que la plateforme ne propose pas.",
  },
  {
    // Source : strapi.tsx, faq[4]
    question: "Comment se passe le chiffrage ?",
    reponse:
      "Après le cadrage écrit, jamais sur une grille de tarifs. Ce document décrit le modèle de contenus, les règles métier et les cas limites. Il vous appartient, et il vous permet de comparer si vous le souhaitez.",
  },
  {
    // Source : strapi.tsx, faq[5]
    question: "Quels référentiels encadrent les livraisons ?",
    reponse:
      "Quatre : accessibilité RGAA 4.1.2, éco-conception RGESN, Core Web Vitals et sécurité OWASP Top 10 : 2025. Ces grilles s'appliquent à chaque livraison et sont vérifiables par un tiers.",
  },
];

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineComparaison() {
  return (
    <SectionVitrine
      id="comparaison"
      index={10}
      surtitre="Comparer et répondre"
      titre="Tableau de comparaison, FAQ"
      alterne
    >
      {/* ===== Tableau 1 : Airtable contre développement sur mesure ===== */}
      <Planche
        nom="Tableau de comparaison"
        note="La colonne encadrée est celle que l'agence recommande."
      >
        {/*
          Source : src/components/expertises/AirtableView.tsx,
          caption ligne 448, colonnes lignes 449-450, données lignes 159-168.
        */}
        <TableauComparaison
          legende="À quel besoin répond Airtable, et à quel besoin répond un développement sur mesure"
          colonnes={[COL_AIRTABLE_1, COL_SUR_MESURE]}
          lignes={LIGNES_AIRTABLE}
        />
      </Planche>

      {/* ===== Tableau 2 : Strapi contre WordPress ===== */}
      <Planche
        nom="WordPress et Strapi"
        note="Colonne WordPress à compléter : le site n'en dit rien."
      >
        {/*
          Strapi : src/content/competences/strapi.tsx et sites-et-applications-web.tsx.
          WordPress : aucune source présente sur le site, placeholders visibles.
        */}
        <TableauComparaison
          legende="Ce que permet Strapi + Next.js par rapport à une solution WordPress"
          colonnes={[COL_WORDPRESS, COL_STRAPI]}
          lignes={LIGNES_STRAPI}
        />
      </Planche>

      {/* ===== FAQ ===== */}
      <Planche
        nom="FAQ"
        note="Questions réelles de la page Strapi."
      >
        {/*
          Source : src/content/competences/strapi.tsx, section "faq".
        */}
        <Faq
          surtitre="Questions fréquentes"
          titre="Strapi et le développement sur mesure"
          items={FAQ_DEMO}
          jsonLd={false}
        />
      </Planche>
    </SectionVitrine>
  );
}
