import type { MetadataRoute } from "next";
import { PLUGINS } from "@/lib/plugins";

/**
 * Sitemap dynamique — exclut l'atelier (/atelier/**), l'admin,
 * les pages légales et les pages checkout.
 *
 * Éco : Server-only, aucun bundle client.
 */

const BASE = "https://isomorph.dev";
const LOCALES = ["fr", "en"] as const;

type SitemapEntry = MetadataRoute.Sitemap[number];

function entrée(
  path: string,
  priority: number,
  changeFrequency: SitemapEntry["changeFrequency"] = "monthly"
): SitemapEntry[] {
  return LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}${path}`])),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: SitemapEntry[] = [
    // Accueil
    ...entrée("", 1.0, "weekly"),
    // Catalogue plugins
    ...entrée("/plugins", 0.9, "weekly"),
    // Fiches plugins
    ...PLUGINS.flatMap((p) => entrée(`/plugins/${p.slug}`, 0.8)),
    // Code
    ...entrée("/code", 0.7),
    // Expérimentations
    ...entrée("/experimentations", 0.7),
    // Veille
    ...entrée("/veille", 0.7, "weekly"),
  ];

  return entries;
}
