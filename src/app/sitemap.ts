import type { MetadataRoute } from "next";

/**
 * sitemap.xml dynamique — Next.js App Router
 *
 * Stratégie :
 * - Toutes les pages publiques indexables, en FR et EN
 * - URLs canoniques avec préfixe de locale (localePrefix: "always")
 * - alternates hreflang déclarées par entrée pour Google
 * - Priorités et fréquences alignées sur l'importance éditoriale :
 *   accueil 1.0 > plugin detail 0.9 > catalogue 0.8 > about 0.6
 * - lastModified : date du dernier déploiement (à mettre à jour à chaque release)
 *
 * Exclues du sitemap : /checkout/, /admin/, /api/
 *
 * SIGNAL — ISOMORPH SEO technique
 */

const BASE_URL = "https://isomorph.dev";
const LAST_MODIFIED = new Date("2026-03-24");

/** Pages publiques et leur configuration SEO */
const pages = [
  {
    path: "",
    priority: 1.0,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/plugins",
    priority: 0.8,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/plugins/strapi-comments",
    priority: 0.9,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/about",
    priority: 0.6,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/blog",
    priority: 0.7,
    changeFrequency: "weekly" as const,
  },
  {
    path: "/blog/best-strapi-v5-plugins-2026",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
  {
    path: "/blog/how-to-add-comments-strapi",
    priority: 0.7,
    changeFrequency: "monthly" as const,
  },
];

const locales = ["en", "fr"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${page.path}`;

      // Construire les alternates hreflang pour cette URL
      const languages: Record<string, string> = {};
      for (const alt of locales) {
        languages[alt] = `${BASE_URL}/${alt}${page.path}`;
      }
      // x-default pointe vers la version anglaise (langue par défaut du projet)
      languages["x-default"] = `${BASE_URL}/en${page.path}`;

      entries.push({
        url,
        lastModified: LAST_MODIFIED,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages,
        },
      });
    }
  }

  return entries;
}
