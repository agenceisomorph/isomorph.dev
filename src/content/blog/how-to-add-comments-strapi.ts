import type { BlogPost } from "@/lib/blog";

/**
 * Article : How to Add a Comment System to Your Strapi V5 Website
 *
 * Cocon : "Strapi Plugins" (EN + FR)
 * Intention : tutoriel — "how to add comments strapi", "strapi comment system"
 * Maillage interne : /[locale]/plugins/strapi-comments, /[locale]/plugins
 * Mot-clé principal EN : "how to add comments to strapi"
 * Mot-clé principal FR : "ajouter commentaires strapi"
 */
export const postHowToAddComments: BlogPost = {
  slug: "how-to-add-comments-strapi",
  locales: ["en", "fr"],
  category: "tutorial",
  publishedAt: "2026-03-15",
  readingTime: 12,
  keywords: [
    "how to add comments to strapi",
    "strapi comment system",
    "strapi plugin comments tutorial",
    "strapi v5 comments",
    "strapi comments next.js",
    "ajouter commentaires strapi",
    "tutoriel strapi commentaires",
  ],
  relatedSlugs: ["best-strapi-v5-plugins-2026"],
  content: {
    en: {
      title: "How to Add a Comment System to Your Strapi V5 Website",
      description:
        "Step-by-step tutorial: install and configure strapi-plugin-comments to add a full-featured comment system to your Strapi V5 backend. Works with Next.js, Nuxt, and SvelteKit.",
      blocks: [
        {
          type: "h2",
          text: "What we are building",
        },
        {
          type: "p",
          text: "This tutorial walks through adding a complete comment system to a Strapi V5 backend using strapi-plugin-comments. By the end, you will have a REST API for creating and fetching comments, moderation in the Strapi admin panel, and a basic React component for your frontend.",
        },
        {
          type: "p",
          text: "Time to complete: approximately 20 minutes. Prerequisites: Strapi V5 project, Node.js >= 18.",
        },
        {
          type: "h2",
          text: "Step 1: Install the plugin",
        },
        {
          type: "code",
          lang: "bash",
          value: "npm install strapi-plugin-comments",
        },
        {
          type: "p",
          text: "Then register it in config/plugins.js (create the file if it does not exist):",
        },
        {
          type: "code",
          lang: "js",
          value: `module.exports = ({ env }) => ({
  'strapi-plugin-comments': {
    enabled: true,
    config: {
      enabledCollections: ['api::article.article'],
      moderatorRoles: ['Moderator'],
    }
  }
});`,
        },
        {
          type: "h2",
          text: "Step 2: Configure permissions in the admin panel",
        },
        {
          type: "p",
          text: "After restarting Strapi, navigate to Settings > Users & Permissions > Roles. For the Public role, enable the following permissions under the strapi-plugin-comments section:",
        },
        {
          type: "ul",
          items: [
            "find — read comments",
            "create — post new comments",
          ],
        },
        {
          type: "h2",
          text: "Step 3: Fetch comments in your frontend",
        },
        {
          type: "code",
          lang: "js",
          value: `const response = await fetch(
  'https://your-strapi.com/api/comments?filters[relation][id][$eq]=1&populate=author'
);
const { data } = await response.json();`,
        },
        {
          type: "h2",
          text: "Step 4: Post a new comment",
        },
        {
          type: "code",
          lang: "js",
          value: `const response = await fetch('https://your-strapi.com/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      content: 'This is my comment.',
      relation: { id: 1 },
      author: { name: 'Jane Doe', email: 'jane@example.com' }
    }
  })
});`,
        },
        {
          type: "h2",
          text: "Step 5: Enable moderation",
        },
        {
          type: "p",
          text: "By default, comments are published immediately. To require manual approval, add approvalFlow to your plugin config:",
        },
        {
          type: "code",
          lang: "js",
          value: `config: {
  enabledCollections: ['api::article.article'],
  approvalFlow: ['api::article.article'],
}`,
        },
        {
          type: "h2",
          text: "Going further",
        },
        {
          type: "ul",
          items: [
            "Email notifications when new comments arrive — available in the Pro tier",
            "Webhooks to trigger external actions on comment events — Pro tier",
            "GraphQL API if your frontend uses GraphQL — Pro tier",
            "Reactions (likes, upvotes, custom emoji) — Pro tier",
          ],
        },
      ],
    },
    fr: {
      title: "Comment ajouter un système de commentaires à votre site Strapi V5",
      description:
        "Tutoriel pas à pas : installer et configurer strapi-plugin-comments pour ajouter un système de commentaires complet à votre backend Strapi V5. Compatible Next.js, Nuxt et SvelteKit.",
      blocks: [
        {
          type: "h2",
          text: "Ce que nous allons construire",
        },
        {
          type: "p",
          text: "Ce tutoriel explique comment ajouter un système de commentaires complet à un backend Strapi V5 avec strapi-plugin-comments. Durée estimée : 20 minutes. Prérequis : projet Strapi V5, Node.js >= 18.",
        },
        {
          type: "h2",
          text: "Étape 1 : Installer le plugin",
        },
        {
          type: "code",
          lang: "bash",
          value: "npm install strapi-plugin-comments",
        },
        {
          type: "p",
          text: "Enregistrez-le ensuite dans config/plugins.js (créez le fichier s'il n'existe pas) :",
        },
        {
          type: "code",
          lang: "js",
          value: `module.exports = ({ env }) => ({
  'strapi-plugin-comments': {
    enabled: true,
    config: {
      enabledCollections: ['api::article.article'],
      moderatorRoles: ['Moderator'],
    }
  }
});`,
        },
        {
          type: "h2",
          text: "Étape 2 : Configurer les permissions dans l'admin",
        },
        {
          type: "p",
          text: "Après avoir redémarré Strapi, allez dans Settings > Users & Permissions > Roles. Pour le rôle Public, activez les permissions suivantes dans la section strapi-plugin-comments :",
        },
        {
          type: "ul",
          items: [
            "find — lire les commentaires",
            "create — publier de nouveaux commentaires",
          ],
        },
        {
          type: "h2",
          text: "Étape 3 : Récupérer les commentaires côté frontend",
        },
        {
          type: "code",
          lang: "js",
          value: `const response = await fetch(
  'https://votre-strapi.com/api/comments?filters[relation][id][$eq]=1&populate=author'
);
const { data } = await response.json();`,
        },
        {
          type: "h2",
          text: "Étape 4 : Activer la modération",
        },
        {
          type: "p",
          text: "Par défaut, les commentaires sont publiés immédiatement. Pour exiger une approbation manuelle, ajoutez approvalFlow à votre config :",
        },
        {
          type: "code",
          lang: "js",
          value: `config: {
  enabledCollections: ['api::article.article'],
  approvalFlow: ['api::article.article'],
}`,
        },
        {
          type: "h2",
          text: "Aller plus loin",
        },
        {
          type: "ul",
          items: [
            "Notifications email à la réception de nouveaux commentaires — tier Pro",
            "Webhooks pour déclencher des actions externes — tier Pro",
            "API GraphQL si votre frontend utilise GraphQL — tier Pro",
            "Réactions (likes, votes, emoji personnalisés) — tier Pro",
          ],
        },
      ],
    },
  },
};
