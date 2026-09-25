import type { MetadataRoute } from "next";

/**
 * robots.ts — règles d'indexation pour isomorph.dev
 *
 * Zones exclues :
 * - /atelier/** : démo interactive, contenu non indexable
 * - /admin/** : interface Strapi (non servi par Next.js, par précaution)
 * - /checkout/** : pages de paiement
 * - /api/** : routes API
 * - /fr/mentions-legales, /fr/confidentialite, /fr/cgv
 * - /en/mentions-legales, /en/confidentialite, /en/cgv
 *
 * Éco : Server-only, zéro bundle client.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/fr/", "/en/"],
        disallow: [
          "/atelier/",
          "/admin/",
          "/api/",
          "/fr/atelier/",
          "/en/atelier/",
          "/fr/mentions-legales",
          "/fr/confidentialite",
          "/fr/cgv",
          "/en/mentions-legales",
          "/en/confidentialite",
          "/en/cgv",
        ],
      },
    ],
    sitemap: "https://isomorph.dev/sitemap.xml",
  };
}
