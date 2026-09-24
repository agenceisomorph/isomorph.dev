/**
 * Shim de compatibilité i18n pour isomorph.dev.
 *
 * Le site utilise next-intl (routing.ts), mais les composants Console copiés
 * d'isomorph.fr importent ce module pour les types Locale, les helpers altPath
 * et t, et la table LOCALIZED_PATHS. Ce shim expose la même interface sans
 * dépendre des API next-intl côté serveur.
 */

export type Locale = "fr" | "en";

export const BASE_URL = "https://isomorph.dev";

/**
 * Table FR → EN (chemin français → chemin anglais complet).
 * Limitée aux plugins publiés sur isomorph.dev.
 */
export const LOCALIZED_PATHS: Record<string, string> = {
  "/fr/plugins": "/en/plugins",
  "/plugins": "/en/plugins",
};

export function altPath(path: string, locale: Locale): string {
  if (locale === "fr") return path;
  return LOCALIZED_PATHS[path] ?? path;
}

/**
 * Libellés partagés du chrome (barre, fils d'Ariane).
 * Même structure que isomorph.fr/lib/i18n pour la compatibilité des composants Console.
 */
export const t = {
  nav: {
    expertises: { fr: "Compétences", en: "Services" },
    plugins: { fr: "Notre code", en: "Our code" },
    agency: { fr: "Agence Strapi", en: "Strapi agency" },
    news: { fr: "Actualités", en: "News" },
    home: { fr: "Accueil", en: "Home" },
  },
  breadcrumb: {
    home: { fr: "Accueil", en: "Home" },
    plugins: { fr: "Plugins", en: "Plugins" },
  },
  pluginCard: {
    view: { fr: "Voir la fiche", en: "View plugin" },
  },
  detail: {
    install: { fr: "Installation", en: "Install" },
    features: { fr: "Fonctionnalités", en: "Features" },
    compat: { fr: "Compatibilité", en: "Compatibility" },
    packages: { fr: "Packages npm", en: "npm packages" },
    links: { fr: "Liens", en: "Links" },
    npm: { fr: "Voir sur npm", en: "View on npm" },
    github: { fr: "Code source sur GitHub", en: "Source code on GitHub" },
    docs: { fr: "Documentation", en: "Documentation" },
    pricing: { fr: "Tarifs", en: "Pricing" },
    perYear: { fr: "EUR / an", en: "EUR / year" },
    launchOffer: { fr: "Offre de lancement", en: "Launch offer" },
    contactCta: { fr: "Nous contacter", en: "Contact us" },
    notifyCta: { fr: "Être prévenu de la disponibilité", en: "Get notified at launch" },
    otherPlugins: { fr: "Nos autres plugins", en: "Our other plugins" },
    updatesIncluded: {
      fr: "Licence annuelle, mises à jour incluses",
      en: "Annual license, updates included",
    },
  },
} as const;
