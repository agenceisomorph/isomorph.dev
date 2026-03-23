import { defineRouting } from "next-intl/routing";

/**
 * Configuration du routage i18n ISOMORPH
 * Locales supportées : français (défaut) et anglais
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "en",
  // "as-needed" : pas de préfixe pour la locale par défaut (en)
  // /about → anglais, /fr/about → français
  // Détection auto via Accept-Language du navigateur
  localePrefix: "as-needed",
  // Détection automatique de la langue du navigateur
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
