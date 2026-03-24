import type { BlogPost } from "@/lib/blog";

/**
 * Article : Best Strapi V5 Plugins in 2026
 *
 * Cocon : "Strapi Plugins" (EN, pilier)
 * Intention : informationnelle — "best strapi v5 plugins", "strapi plugins list"
 * Maillage interne : /en/plugins, /en/plugins/strapi-comments
 * Mot-clé principal : "best strapi v5 plugins"
 */
export const postBestStrapiPlugins: BlogPost = {
  slug: "best-strapi-v5-plugins-2026",
  locales: ["en"],
  category: "guide",
  publishedAt: "2026-03-20",
  readingTime: 8,
  keywords: [
    "best strapi v5 plugins",
    "strapi plugins 2026",
    "strapi v5 plugin list",
    "open source strapi plugins",
    "strapi comment plugin",
  ],
  relatedSlugs: ["how-to-add-comments-strapi"],
  content: {
    en: {
      title: "Best Strapi V5 Plugins in 2026 — The Definitive List",
      description:
        "A curated list of the best open-source plugins for Strapi V5 in 2026. Reviewed for security, performance, and active maintenance by the ISOMORPH team.",
      blocks: [
        {
          type: "h2",
          text: "Why Strapi V5 plugins matter",
        },
        {
          type: "p",
          text: "Strapi V5 introduced a complete rewrite of the plugin API. Plugins built for V4 no longer work — and the ecosystem is still catching up. In early 2026, the list of production-ready V5 plugins is shorter than you might expect, but the quality bar is higher.",
        },
        {
          type: "p",
          text: "This guide covers the plugins we have personally evaluated, installed in production, and recommend to developers building with Strapi V5 today.",
        },
        {
          type: "h2",
          text: "Selection criteria",
        },
        {
          type: "p",
          text: "We evaluated each plugin against four criteria:",
        },
        {
          type: "ul",
          items: [
            "Strapi V5 compatibility — does it declare support for V5 in its package.json and README?",
            "Active maintenance — was there a commit or release in the last 90 days?",
            "Security — does it pass a basic OWASP review (no hardcoded secrets, input validation, rate limiting where appropriate)?",
            "Documentation quality — can a developer integrate it in under 30 minutes with the README alone?",
          ],
        },
        {
          type: "h2",
          text: "1. strapi-plugin-comments — Best comment system",
        },
        {
          type: "p",
          text: "The most complete comment system available for Strapi V5. strapi-plugin-comments by ISOMORPH supports unlimited nested threads, full moderation, email notifications, HMAC-signed webhooks, and both REST and GraphQL APIs.",
        },
        {
          type: "p",
          text: "It passes all four selection criteria and has over 12,000 npm downloads. The Community tier is free and MIT licensed. A Pro license (49€/year) unlocks unlimited comments, webhooks, and email support.",
        },
        {
          type: "code",
          lang: "bash",
          value: "npm install strapi-plugin-comments",
        },
        {
          type: "h2",
          text: "2. @strapi/plugin-users-permissions — User authentication",
        },
        {
          type: "p",
          text: "The official Strapi users and permissions plugin ships with every Strapi V5 installation. It handles registration, login, JWT issuance, role management, and OAuth provider integration (Google, GitHub, Facebook, etc.).",
        },
        {
          type: "h2",
          text: "3. @strapi/plugin-i18n — Internationalization",
        },
        {
          type: "p",
          text: "The official i18n plugin enables content localization at the field level. You can define which fields are translatable per content type, and the API automatically returns locale-specific content.",
        },
        {
          type: "note",
          text: "strapi-plugin-comments is fully compatible with the i18n plugin — comment threads are locale-aware when used together.",
        },
        {
          type: "h2",
          text: "What is missing from the V5 ecosystem?",
        },
        {
          type: "ul",
          items: [
            "Full-text search — no production-ready Algolia or Meilisearch plugin exists yet for V5",
            "Advanced media management — image optimization plugins are limited",
            "Form builder — no widely-adopted form plugin has been ported to V5 yet",
          ],
        },
        {
          type: "h2",
          text: "How to evaluate a Strapi V5 plugin yourself",
        },
        {
          type: "ol",
          items: [
            "Check peerDependencies in package.json — it should declare @strapi/strapi: \"^5.x\"",
            "Look at the GitHub issues — are critical bugs addressed quickly?",
            "Check the last commit date — anything older than 6 months with open V5 issues is risky",
            "Read the LICENSE file — MIT or Apache 2.0 are safe for commercial projects",
            "Search npm for the package name — verify the download count and weekly trend",
          ],
        },
        {
          type: "h2",
          text: "Conclusion",
        },
        {
          type: "p",
          text: "The Strapi V5 plugin ecosystem is smaller but more focused than V4. The plugins that have been properly ported tend to be higher quality because the V5 plugin API is more opinionated and better documented.",
        },
      ],
    },
  },
};
