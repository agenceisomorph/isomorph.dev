/**
 * Données sourcées des plugins publiés par ISOMORPH.
 *
 * Source : npm search @isomorph-agency (25/09/2026), gh repo list agenceisomorph,
 * npm view <paquet> version, inventaire-contenu-2026-09-25.md.
 * Aucune donnée inventée : les champs manquants portent un commentaire [À compléter].
 */

export type StatutPlugin = "publie" | "pilote" | "en-developpement";

export interface PaquetNpm {
  nom: string;
  version: string;
  /** URL https://www.npmjs.com/package/... */
  url: string;
  /** Commande d'installation */
  install: string;
}

export interface Plugin {
  slug: string;
  /** Nom affiché (pas le nom npm) */
  nom: string;
  /** Une phrase, contenu sourcé uniquement */
  role: string;
  statut: StatutPlugin;
  /** Catégorie : "strapi" | "shopify" */
  categorie: "strapi" | "shopify";
  /** true = fiche publique complète avec prix */
  paiement: boolean;
  paquets?: PaquetNpm[];
  /** URL du dépôt GitHub public — undefined si privé */
  github?: string;
  /** Compatibilité ex. ["Strapi v5", "Node.js ≥ 20"] */
  compatibilite: string[];
}

// ---------------------------------------------------------------------------
// Plugin Link
// ---------------------------------------------------------------------------

export const PLUGIN_LINK: Plugin = {
  slug: "link",
  nom: "Custom Field Link",
  role:
    "Un seul champ Strapi pour tous les types de liens : contenu interne, page système, URL externe, téléphone, email, ancre. JSON stable et resolver front sans dépendance de framework.",
  statut: "publie",
  categorie: "strapi",
  paiement: false,
  paquets: [
    {
      nom: "@isomorph-agency/strapi-plugin-link",
      version: "0.1.1",
      url: "https://www.npmjs.com/package/@isomorph-agency/strapi-plugin-link",
      install: "npm install @isomorph-agency/strapi-plugin-link",
    },
    {
      nom: "@isomorph-agency/link-resolver",
      version: "0.1.2",
      url: "https://www.npmjs.com/package/@isomorph-agency/link-resolver",
      install: "npm install @isomorph-agency/link-resolver",
    },
  ],
  github: "https://github.com/agenceisomorph/strapi-plugin-link-v2",
  compatibilite: ["Strapi v5 (^5.0.0)", "Node.js ≥ 20", "Next.js, Nuxt, Astro, etc."],
};

// ---------------------------------------------------------------------------
// Plugin Cookie Consent
// ---------------------------------------------------------------------------

export const PLUGIN_COOKIE_CONSENT: Plugin = {
  slug: "cookie-consent",
  nom: "Cookie Consent",
  role:
    "Bandeau et fenêtre de préférences React, plugin Strapi de journalisation du consentement. Conformité CNIL, Google Consent Mode V2, accessibilité WCAG 2.1 AA.",
  statut: "publie",
  categorie: "strapi",
  paiement: false,
  paquets: [
    {
      nom: "@isomorph-agency/cookie-consent",
      version: "1.1.0",
      url: "https://www.npmjs.com/package/@isomorph-agency/cookie-consent",
      install: "npm install @isomorph-agency/cookie-consent",
    },
    {
      nom: "strapi-plugin-cookie-consent",
      version: "1.0.4",
      url: "https://www.npmjs.com/package/strapi-plugin-cookie-consent",
      install: "npm install strapi-plugin-cookie-consent",
    },
    {
      nom: "strapi-plugin-cookie-consent-v4",
      version: "1.0.5",
      url: "https://www.npmjs.com/package/strapi-plugin-cookie-consent-v4",
      install: "npm install strapi-plugin-cookie-consent-v4",
    },
  ],
  github: "https://github.com/agenceisomorph/cookie-consent",
  compatibilite: ["React 18+", "Next.js App Router", "Strapi v5 (^5.0.0)", "Strapi v4 (^4.0.0)"],
};

// ---------------------------------------------------------------------------
// Plugin Comments (vendu sur le site)
// ---------------------------------------------------------------------------

export const PLUGIN_COMMENTS: Plugin = {
  slug: "comments",
  nom: "Comments",
  role:
    "Système de commentaires complet pour Strapi v5 : fils de discussion, panneau de modération, signalements, filtre anti-injures, reCAPTCHA v3, rate limiting.",
  // Non publié sur npm au 25/09/2026 (npm view @isomorph-agency/strapi-plugin-comments → 404).
  // Source du code : https://github.com/agenceisomorph/strapi-plugin-comments (public, v1.0.0).
  statut: "en-developpement",
  categorie: "strapi",
  paiement: true,
  github: "https://github.com/agenceisomorph/strapi-plugin-comments",
  compatibilite: ["Strapi v5 (^5.0.0)", "React, Vue, Angular, Next.js, Nuxt, Astro, ou tout client HTTP"],
};

// ---------------------------------------------------------------------------
// App Shopify : Point relais
// ---------------------------------------------------------------------------

export const APP_POINT_RELAIS: Plugin = {
  slug: "point-relais",
  nom: "Point relais",
  role:
    "Choix d'un point relais Chronopost Shop2Shop dans le panier avant paiement, compatible avec tous les forfaits Shopify (Basic inclus).",
  statut: "pilote",
  categorie: "shopify",
  paiement: false,
  compatibilite: ["Shopify Basic et supérieur"],
};

// ---------------------------------------------------------------------------
// App Shopify : ISOMORPH SEO
// ---------------------------------------------------------------------------

export const APP_ISOMORPH_SEO: Plugin = {
  slug: "isomorph-seo",
  nom: "ISOMORPH SEO",
  role:
    "Lit les données Search Console et le catalogue de la boutique, propose des sujets d'articles de blog, rédige et publie après validation du marchand.",
  statut: "en-developpement",
  categorie: "shopify",
  paiement: false,
  compatibilite: ["Shopify"],
};

// ---------------------------------------------------------------------------
// Export global
// ---------------------------------------------------------------------------

export const PLUGINS: Plugin[] = [
  PLUGIN_LINK,
  PLUGIN_COOKIE_CONSENT,
  PLUGIN_COMMENTS,
  APP_POINT_RELAIS,
  APP_ISOMORPH_SEO,
];

/** Libellé de statut affiché, FR */
export const LIBELLE_STATUT_FR: Record<StatutPlugin, string> = {
  publie: "Publié",
  pilote: "En pilote",
  "en-developpement": "En développement",
};

/** Libellé de statut affiché, EN */
export const LIBELLE_STATUT_EN: Record<StatutPlugin, string> = {
  publie: "Published",
  pilote: "In pilot",
  "en-developpement": "In development",
};
