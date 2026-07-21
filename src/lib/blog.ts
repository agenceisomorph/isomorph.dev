/**
 * lib/blog.ts — Gestion des articles de blog ISOMORPH
 *
 * Architecture : articles définis comme objets TypeScript statiques.
 * Rendu : blocs de contenu typés (pas d'injection HTML), sécurité maximale.
 */

export type Locale = "en" | "fr";
export type Category = "tutorial" | "guide" | "comparison" | "news";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; value: string }
  | { type: "note"; text: string };

export interface BlogPost {
  slug: string;
  locales: Locale[];
  category: Category;
  publishedAt: string;
  readingTime: number;
  keywords: string[];
  relatedSlugs?: string[];
  content: {
    [K in Locale]?: {
      title: string;
      description: string;
      blocks: ContentBlock[];
    };
  };
}

import { postBestStrapiPlugins } from "@/content/blog/best-strapi-v5-plugins-2026";
import { postHowToAddComments } from "@/content/blog/how-to-add-comments-strapi";

export const blogPosts: BlogPost[] = [
  postBestStrapiPlugins,
  postHowToAddComments,
];

export function getPostsByLocale(locale: Locale): BlogPost[] {
  return blogPosts
    .filter((post) => post.locales.includes(locale) && post.content[locale])
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getPostBySlug(
  slug: string,
  locale: Locale
): BlogPost | undefined {
  return blogPosts.find(
    (post) =>
      post.slug === slug &&
      post.locales.includes(locale) &&
      post.content[locale]
  );
}

export function getAllPostParams(): Array<{ locale: string; slug: string }> {
  return blogPosts.flatMap((post) =>
    post.locales
      .filter((locale) => post.content[locale])
      .map((locale) => ({ locale, slug: post.slug }))
  );
}

export function formatDate(isoDate: string, locale: Locale): string {
  return new Date(isoDate).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
}
