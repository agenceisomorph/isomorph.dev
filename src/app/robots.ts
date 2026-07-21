import type { MetadataRoute } from "next";

/**
 * robots.txt dynamique — Next.js App Router
 *
 * Objectifs SEO :
 * - Autoriser l'indexation complète des pages publiques (EN + FR)
 * - Bloquer explicitement les routes non indexables :
 *   admin, API, checkout, pages internes
 * - Déclarer le sitemap pour faciliter le crawl Google
 *
 * SIGNAL — ISOMORPH SEO technique
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/en/", "/fr/"],
        disallow: [
          "/api/",
          "/en/admin/",
          "/fr/admin/",
          "/en/checkout/",
          "/fr/checkout/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://isomorph.dev/sitemap.xml",
    host: "https://isomorph.dev",
  };
}
