import type { Famille } from "./sections";

/**
 * Les trois familles de compétences : source unique du site.
 *
 * Alimente la barre, le méga-menu, le menu mobile, le pied de page, les blocs
 * de l'accueil, les trois accueils de famille, le fil d'Ariane des pages et
 * leur appel final. Un item ajouté ici apparaît partout ; il n'y a pas de
 * seconde liste à tenir. `chrome/expertiseNav.ts` en dérive sa propre forme
 * pour le chrome, il ne redéclare rien.
 *
 * Libellés, ordre et lignes descriptives : plan du site du 11 septembre 2026,
 * §2.3 et §5.2, repris sans réécriture, y compris les versions anglaises.
 * Adresses : plan de refonte du 17 septembre, §2.
 *
 * Conventions tenues ici :
 *  - un item est une compétence ou le nom exact d'un outil, jamais « Agence X » ;
 *  - un à quatre mots, sans article ;
 *  - aucune formulation négative, aucun mot de statut. « Partenaire » ne
 *    s'écrit que pour Shopify, dont le compte au programme est vérifié.
 *
 * Ce fichier reste neutre, sans « use client » : un composant serveur (pied de
 * page) et un composant client (barre) l'importent tous les deux, et le
 * compilateur ne doit pas remplacer ses exports par des références client.
 */

export interface ItemFamille {
  /** Libellé dans le menu, le pied de page et sur l'accueil de famille. */
  libelle: string;
  chemin: string;
  /** Une phrase, affichée dans l'aperçu du méga-menu et sur l'accueil. */
  description: string;
  /** Dessin de l'aperçu du méga-menu. Omis : l'aperçu ne change pas. */
  vizKey?: string;
  /** Regroupe des items sous un intertitre, dans le menu comme sur la page. */
  groupe?: string;
  /**
   * Page pas encore écrite : l'item reste hors du menu et du pied de page.
   * Le retirer est le dernier geste de la mise en ligne d'une page.
   */
  aVenir?: boolean;
  /** Miroir anglais. Absent : l'item est masqué sur les pages anglaises. */
  en?: { chemin: string; libelle: string; description: string };
}

export interface FamilleData {
  nom: string;
  /** Nom anglais. Absent : la famille entière est masquée en anglais. */
  nomEn?: string;
  /** Accueil de famille. */
  chemin: string;
  /** Accueil de famille en anglais. Absent : le titre n'est pas un lien. */
  cheminEn?: string;
  /** Ce que la famille dit au dirigeant, en une phrase. */
  chapeau: string;
  items: ItemFamille[];
  /** Appel final commun aux pages de la famille. */
  appelFinal: { titre: string; texte?: string };
}

export const FAMILLES: Record<Famille, FamilleData> = {
  developpement: {
    nom: "Concevoir et développer",
    nomEn: "Design and build",
    chemin: "/developpement",
    chapeau: "Ce que nous construisons, écrit pour l'activité qu'il sert.",
    items: [
      {
        libelle: "Sites et applications web",
        chemin: "/developpement/sites-et-applications-web",
        description:
          "Sites, espaces clients et applications, écrits sur Strapi et Next.js.",
        vizKey: "web",
        en: {
          chemin: "/en/development/websites-and-web-apps",
          libelle: "Websites and web apps",
          description:
            "Websites, client portals and applications, built on Strapi and Next.js.",
        },
      },
      {
        libelle: "Logiciels métier",
        chemin: "/developpement/logiciels-metier",
        description:
          "L'outil interne qui suit vos règles de gestion, hébergé en France.",
        vizKey: "logiciel",
        en: {
          chemin: "/en/development/business-software",
          libelle: "Business software",
          description:
            "The internal tool that follows your business rules, hosted in France.",
        },
      },
      {
        libelle: "Applications mobiles",
        chemin: "/developpement/applications-mobiles",
        description:
          "Une application publiée sur l'App Store et Google Play, reliée à votre back-office.",
      },
      {
        libelle: "IA dans vos logiciels",
        chemin: "/developpement/ia",
        description:
          "Lire un document, répondre à partir de vos contenus, préparer une tâche répétitive.",
      },
      {
        libelle: "Hébergement et maintenance",
        chemin: "/developpement/hebergement-et-maintenance",
        description:
          "Vos sites et applications sur des serveurs en France, sauvegardés chaque jour et mis à jour.",
        vizKey: "hebergement",
      },
      {
        libelle: "Strapi",
        chemin: "/developpement/strapi",
        description:
          "Le back-office que vos équipes administrent. Nos plugins sont publiés sur npm.",
        vizKey: "strapi",
        groupe: "Technologies",
        en: {
          chemin: "/en/development/strapi",
          libelle: "Strapi",
          description:
            "The back-office your teams manage. Our plugins are published on npm.",
        },
      },
      {
        libelle: "Next.js",
        chemin: "/developpement/next-js",
        description:
          "App Router et TypeScript strict, pour des pages rapides et maintenables.",
        vizKey: "nextjs",
        groupe: "Technologies",
        en: {
          chemin: "/en/development/next-js",
          libelle: "Next.js",
          description:
            "App Router and strict TypeScript, for fast and maintainable pages.",
        },
      },
    ],
    appelFinal: {
      titre: "Décrivez votre projet, nous répondons par un cadrage écrit",
      texte: "Le cadrage précède le chiffrage, et il vous appartient.",
    },
  },

  integrations: {
    /* Aucun miroir anglais : famille masquée sur les pages anglaises. */
    nom: "Connecter et étendre",
    chemin: "/integrations",
    chapeau:
      "Le code qui prolonge les outils déjà en place, et qui les relie entre eux.",
    items: [
      {
        libelle: "Shopify",
        chemin: "/integrations/shopify",
        description:
          "Thème sur mesure, applications et connexions. ISOMORPH est partenaire Shopify.",
        vizKey: "shopify",
      },
      {
        libelle: "Airtable",
        chemin: "/integrations/airtable",
        description:
          "Bases, automatisations et interfaces métier, livrées dans votre espace de travail.",
        vizKey: "airtable",
      },
      {
        libelle: "HubSpot",
        chemin: "/integrations/hubspot",
        description:
          "Connexions à vos logiciels, cartes dans les fiches, actions de code dans vos workflows.",
        vizKey: "hubspot",
      },
      {
        libelle: "SAP",
        chemin: "/integrations/sap",
        description:
          "Extensions et intégrations écrites à côté du système, le cœur reste standard.",
        vizKey: "sap",
      },
    ],
    appelFinal: {
      titre: "Votre outil est en place, dites-nous ce qu'il lui manque",
      texte: "Nous écrivons le code dans votre compte, pas à côté.",
    },
  },

  visibilite: {
    nom: "Être trouvé",
    nomEn: "Get found",
    chemin: "/visibilite",
    chapeau:
      "Ce qui fait venir vos clients, mesuré avec les outils des moteurs.",
    items: [
      {
        libelle: "SEO et GEO",
        chemin: "/visibilite/seo-et-geo",
        description:
          "Un site lisible par Google, ChatGPT, Claude et Perplexity, mesuré avec leurs outils.",
        vizKey: "seo",
      },
      {
        libelle: "Audit SEO technique",
        chemin: "/visibilite/audit-seo-technique",
        description:
          "L'état des lieux complet : crawl, Search Console, Core Web Vitals, plan priorisé.",
        vizKey: "audit-seo",
        en: {
          chemin: "/en/visibility/technical-seo-audit",
          libelle: "Technical SEO audit",
          description:
            "The full picture: crawl, Search Console, Core Web Vitals, prioritised action plan.",
        },
      },
      {
        libelle: "Google Ads",
        chemin: "/visibilite/google-ads",
        description:
          "Audit et pilotage de vos campagnes, données extraites par l'API Google Ads.",
        vizKey: "google-ads",
        en: {
          chemin: "/en/visibility/google-ads",
          libelle: "Google Ads",
          description:
            "Audit and management of your campaigns, data extracted via the Google Ads API.",
        },
      },
    ],
    appelFinal: {
      titre: "Commencez par l'état des lieux",
      texte:
        "L'audit est facturé et son rapport vous reste, que la mission suive ou non.",
    },
  },
};

/** L'ordre d'affichage des familles, du construire au faire venir. */
export const ORDRE_FAMILLES: Famille[] = [
  "developpement",
  "integrations",
  "visibilite",
];

/**
 * Élément mis à part, hors des trois familles : un diagnostic payant financé
 * pour moitié par un tiers. Il ouvre l'aperçu du méga-menu.
 */
export const DISPOSITIF_BPIFRANCE = {
  libelle: "Diag Axes d'Innovation Bpifrance",
  chemin: "/diag-axes-innovation-bpifrance",
  description:
    "ISOMORPH, expert conseil agréé. 50 % pris en charge par Bpifrance après acceptation du dossier.",
  vizKey: "bpifrance",
};

/** Les items publiés d'une famille, dans l'ordre, sans les pages à venir. */
export function itemsPublies(famille: FamilleData): ItemFamille[] {
  return famille.items.filter((item) => !item.aVenir);
}

/** Les items publiés d'un sous-groupe, ou hors sous-groupe si `groupe` est omis. */
export function itemsDuGroupe(
  famille: FamilleData,
  groupe?: string,
): ItemFamille[] {
  return itemsPublies(famille).filter((item) => item.groupe === groupe);
}

/** Les intertitres de sous-groupe d'une famille, dans l'ordre d'apparition. */
export function groupesDeFamille(famille: FamilleData): string[] {
  const vus: string[] = [];
  for (const item of itemsPublies(famille)) {
    if (item.groupe && !vus.includes(item.groupe)) vus.push(item.groupe);
  }
  return vus;
}

/**
 * L'adresse de la même page dans l'autre langue, si elle existe.
 *
 * Marche dans les deux sens : appelée avec une adresse française, elle rend le
 * miroir anglais ; appelée avec une adresse anglaise, elle rend l'adresse
 * française. C'est ce dont les balises hreflang et le sélecteur de langue ont
 * besoin, sans table séparée à tenir.
 */
export function cheminMiroir(chemin: string): string | undefined {
  for (const cle of ORDRE_FAMILLES) {
    for (const item of FAMILLES[cle].items) {
      if (item.chemin === chemin) return item.en?.chemin;
      if (item.en?.chemin === chemin) return item.chemin;
    }
  }
  return undefined;
}

/** La famille d'une adresse, d'après son préfixe. */
export function familleDuChemin(chemin: string): Famille | undefined {
  return ORDRE_FAMILLES.find((cle) => chemin.startsWith(FAMILLES[cle].chemin));
}
