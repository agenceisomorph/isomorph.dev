import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * Configuration next-intl côté serveur
 * Charge les messages de traduction selon la locale de la requête
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // Récupérer la locale depuis la requête (peut être undefined)
  let locale = await requestLocale;

  // Valider que la locale est supportée, sinon utiliser la locale par défaut
  if (!locale || !routing.locales.includes(locale as "fr" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
