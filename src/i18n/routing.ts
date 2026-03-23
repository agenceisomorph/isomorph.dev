import { defineRouting } from "next-intl/routing";

/**
 * Configuration du routage i18n ISOMORPH
 * Locales supportées : français (défaut) et anglais
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "en",
  // "always" : préfixe sur toutes les locales (/en/about, /fr/about)
  // Plus explicite pour l'utilisateur et meilleur pour le SEO (hreflang)
  localePrefix: "always",
  // Détection automatique de la langue du navigateur
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
