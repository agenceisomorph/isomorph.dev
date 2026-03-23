import { defineRouting } from "next-intl/routing";

/**
 * Configuration du routage i18n ISOMORPH
 * Locales supportées : français (défaut) et anglais
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
