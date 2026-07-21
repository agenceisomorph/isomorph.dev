# Stratégie éditoriale SEO — ISOMORPH
**Agent :** QUILL — Rédaction SEO
**Date :** 24 mars 2026
**Site :** isomorph.dev
**Positionnement :** Éditeur de plugins Strapi V5 n°1 + agence Strapi de référence

---

## 1. Analyse de la situation de départ

### Opportunités identifiées

- **Domaine de niche à fort potentiel :** "strapi v5 plugins" est un marché émergent (V5 sortie fin 2024). Les concurrents sont peu nombreux et le contenu de qualité est rare.
- **Produit avec preuve sociale :** 12 000+ téléchargements npm = signal de confiance fort pour le SEO E-E-A-T.
- **Dualité de cible :** développeurs EN (international, volume) + clients FR (local, conversion).
- **Site bilingue FR/EN déjà en place** avec hreflang et structure correcte (audit SIGNAL du 24/03).
- **Quick win principal :** la page `/[locale]/plugins/strapi-comments` est LA page de vente — optimiser en priorité pour "strapi comment plugin" et "strapi comment system".

### Gaps identifiés avant cette session

- Textes trop courts et génériques sur toutes les pages (peu de contenu indexable)
- Aucun blog — zéro contenu longue traîne
- Section E-E-A-T absente (fondateur non mentionné, expertise non démontrée)
- Titres H1 peu optimisés pour les mots-clés cibles
- FAQ limitée à 5 questions sur la page strapi-comments

---

## 2. Architecture des cocons sémantiques

```
isomorph.dev
│
├── COCON 1 — "Strapi V5 Plugins" (EN, pilier)
│   │
│   ├── [Page pilier] /en/plugins
│   │   Mot-clé : "strapi v5 plugins", "open source strapi plugins"
│   │   Intention : navigationnelle + informationnelle
│   │
│   ├── [Page produit] /en/plugins/strapi-comments
│   │   Mot-clé : "strapi comment plugin", "strapi comment system", "strapi v5 comments"
│   │   Intention : transactionnelle
│   │
│   └── [Articles satellites]
│       ├── /en/blog/best-strapi-v5-plugins-2026        [CRÉÉ]
│       │   "best strapi v5 plugins", "strapi plugins 2026"
│       ├── /en/blog/how-to-add-comments-strapi          [CRÉÉ]
│       │   "how to add comments strapi", "strapi comment system tutorial"
│       ├── /en/blog/strapi-plugin-development-guide     [À créer — Q2]
│       │   "strapi plugin development", "how to build strapi plugin"
│       └── /en/blog/strapi-v5-migration-guide           [À créer — Q2]
│           "strapi v4 to v5 migration", "strapi v5 upgrade"
│
├── COCON 2 — "Agence Strapi" (FR, pilier)
│   │
│   ├── [Page pilier] /fr/about
│   │   Mot-clé : "agence strapi", "expert strapi france", "développement strapi"
│   │   Intention : navigationnelle + locale
│   │
│   └── [Articles satellites]
│       ├── /fr/blog/pourquoi-choisir-strapi             [À créer — Q2]
│       │   "pourquoi strapi", "strapi vs wordpress"
│       ├── /fr/blog/strapi-next-js-guide                [À créer — Q2]
│       │   "strapi next.js", "headless cms next.js"
│       └── /fr/blog/migration-strapi-v5                 [À créer — Q3]
│           "migration strapi v5", "passer à strapi v5"
│
└── COCON 3 — "Headless CMS" (EN + FR, trafic organique)
    │
    └── [Articles satellites]
        ├── /en/blog/strapi-vs-contentful                [À créer — Q3]
        │   "strapi vs contentful", "headless cms comparison"
        ├── /en/blog/headless-cms-nextjs-tutorial        [À créer — Q3]
        │   "headless cms next.js", "strapi next.js tutorial"
        └── /fr/blog/comparatif-cms-headless             [À créer — Q3]
            "comparatif cms headless", "strapi wordpress comparatif"
```

---

## 3. Optimisations réalisées dans cette session

### 3.1 Fichiers de traduction enrichis

**`src/messages/en.json` et `src/messages/fr.json`**

Nouveaux namespaces et clés ajoutés :
- `hero.subtitle` et `hero.description` : textes optimisés avec mots-clés ("strapi v5 plugins", "12,000+ developers")
- `why.intro` : paragraphe introductif E-E-A-T
- `trust.*` : nouvelle section avec 5 preuves de qualité (TypeScript strict, OWASP, RGAA, zéro breaking changes, semver)
- `stats.downloads` : valeur "12k+" remplace "1 plugin" (plus persuasif)
- `plugins.intro` : paragraphe SEO au-dessus de la grille
- `comments.seoIntro`, `comments.whyUse.*`, `comments.useCases.*` : contenu de valeur sur la page produit
- `comments.faq.subtitle` : introduction FAQ pour le featured snippet
- `comments.faq.items.performance` et `.gdpr` : 2 nouvelles questions FAQ (scaled performance + RGPD)
- `about.founder.*` : section fondateur E-E-A-T complète
- `about.expertise.*` : 4 piliers techniques avec descriptions
- `about.contact.description` : phrase d'accroche contact
- `blog.*` : namespace complet (listing, article, CTA, catégories)
- `pricing.guarantee` : "14-day money-back guarantee"
- `footer.links.blog` : lien blog dans le footer

### 3.2 Pages existantes enrichies

**Page d'accueil `/[locale]/page.tsx`**
- Import `CheckCircle` ajouté
- Nouvelle section `trust` avec 5 preuves + extrait de code
- Section stats : "12k+ downloads" remplace "1 plugin"
- Section "Why" : sous-titre intro ajouté

**Page plugins `/[locale]/plugins/page.tsx`**
- Paragraphe intro SEO sous le subtitle

**Page strapi-comments `/[locale]/plugins/strapi-comments/page.tsx`**
- Nouvelle section "Why use" + cas d'usage (blog, community, ecommerce)
- FAQ enrichie avec 2 questions supplémentaires (performance + RGPD)
- Sous-titre FAQ pour featured snippet

**Page about `/[locale]/about/page.tsx`**
- Section fondateur avec credentials E-E-A-T
- Section expertise avec 4 piliers techniques
- Description contact enrichie

### 3.3 Structure blog créée

**`src/lib/blog.ts`**
- Types TypeScript : `BlogPost`, `ContentBlock`, `Locale`, `Category`
- Blocs de contenu typés (pas d'injection HTML — sécurité maximale)
- Fonctions : `getPostsByLocale`, `getPostBySlug`, `getAllPostParams`, `formatDate`

**`src/app/[locale]/blog/page.tsx`**
- Page listing avec métadonnées SEO, badges de catégorie, temps de lecture
- generateMetadata optimisé (keywords, hreflang, og:type=website)

**`src/app/[locale]/blog/[slug]/page.tsx`**
- Page article SSG avec generateStaticParams
- Rendu par blocs typés (h2, p, ul, ol, code, note)
- JSON-LD TechArticle
- Section articles liés (maillage interne)
- CTA "Besoin d'une solution Strapi ?"

**`src/content/blog/best-strapi-v5-plugins-2026.ts`**
- Titre : "Best Strapi V5 Plugins in 2026 — The Definitive List"
- Locale : EN uniquement
- 8 min de lecture, catégorie guide
- Mots-clés : "best strapi v5 plugins", "strapi plugins 2026"

**`src/content/blog/how-to-add-comments-strapi.ts`**
- Titre EN : "How to Add a Comment System to Your Strapi V5 Website"
- Titre FR : "Comment ajouter un système de commentaires à votre site Strapi V5"
- Locales : EN + FR (premier article bilingue)
- 12 min de lecture, catégorie tutorial
- Mots-clés : "how to add comments to strapi", "strapi comment system"

---

## 4. Calendrier éditorial — 3 mois

### Avril 2026 (Mois 1 — Fondation du cocon anglais)

| Semaine | Titre | Slug | Mots-clés principaux | Priorité |
|---------|-------|------|----------------------|----------|
| S1 | Strapi Plugin Development Guide: From Zero to npm Publish | `strapi-plugin-development-guide` | "how to create strapi plugin", "strapi plugin development" | Haute |
| S2 | Strapi V5 REST API: Complete Guide with Examples | `strapi-v5-rest-api-guide` | "strapi v5 rest api", "strapi api tutorial" | Haute |
| S3 | How to Set Up Strapi with Next.js App Router (2026) | `strapi-nextjs-app-router-setup` | "strapi next.js", "strapi next.js app router" | Haute |
| S4 | Strapi Comments vs Disqus vs Commento: Which One? | `strapi-comments-vs-alternatives` | "strapi comments alternative", "best comment system headless cms" | Moyenne |

### Mai 2026 (Mois 2 — Cocon français + comparatifs)

| Semaine | Titre | Slug | Mots-clés principaux | Priorité |
|---------|-------|------|----------------------|----------|
| S1 (FR) | Pourquoi choisir Strapi V5 pour votre site web en 2026 | `pourquoi-choisir-strapi-v5` | "pourquoi strapi", "strapi avantages" | Haute |
| S2 (EN) | Strapi V5 vs Contentful: Complete Comparison (2026) | `strapi-vs-contentful-2026` | "strapi vs contentful", "contentful alternative" | Haute |
| S3 (FR) | Tutoriel : Strapi V5 avec Next.js 15 — Guide complet | `strapi-nextjs-15-tutoriel` | "strapi next.js 15", "tutoriel strapi next.js" | Haute |
| S4 (EN) | Strapi Webhooks: Complete Guide with HMAC Security | `strapi-webhooks-guide` | "strapi webhooks", "strapi webhook tutorial" | Moyenne |

### Juin 2026 (Mois 3 — Longue traîne + migrations)

| Semaine | Titre | Slug | Mots-clés principaux | Priorité |
|---------|-------|------|----------------------|----------|
| S1 (EN) | Migrating from Strapi V4 to V5: Step-by-Step Guide | `strapi-v4-to-v5-migration` | "strapi v4 to v5", "strapi v5 migration guide" | Haute |
| S2 (FR) | Migration de Strapi V4 vers V5 : guide complet | `migration-strapi-v4-v5` | "migration strapi v5", "passer à strapi v5" | Haute |
| S3 (EN) | Strapi Moderation: Best Practices for Comment Management | `strapi-comment-moderation-guide` | "strapi comment moderation", "strapi moderate comments" | Moyenne |
| S4 | Headless CMS in 2026: Strapi, Contentful, Sanity, Prismic | `headless-cms-comparison-2026` | "headless cms comparison", "best headless cms 2026" | Moyenne |

---

## 5. 10 titres d'articles avec mots-clés et intentions de recherche

| # | Titre | Intention | Mot-clé principal | Volume estimé | Difficulté |
|---|-------|-----------|-------------------|---------------|------------|
| 1 | Best Strapi V5 Plugins in 2026 — The Definitive List | Informationnelle | best strapi v5 plugins | Moyen | Faible |
| 2 | How to Add a Comment System to Your Strapi V5 Website | Transactionnelle/tutoriel | how to add comments strapi | Moyen | Faible |
| 3 | Strapi Plugin Development Guide: Build Your First Plugin | Tutoriel | strapi plugin development | Moyen | Moyenne |
| 4 | How to Set Up Strapi V5 with Next.js 15 App Router | Tutoriel | strapi nextjs app router | Élevé | Moyenne |
| 5 | Strapi V5 vs Contentful: Which CMS in 2026? | Informationnelle/comparatif | strapi vs contentful | Élevé | Haute |
| 6 | Migrating from Strapi V4 to V5: Step-by-Step Guide | Tutoriel | strapi v4 to v5 migration | Moyen | Faible |
| 7 | Pourquoi choisir Strapi V5 pour votre site web en 2026 (FR) | Informationnelle | pourquoi strapi | Moyen | Faible |
| 8 | Strapi Webhooks: Complete Guide with HMAC Security | Tutoriel | strapi webhooks tutorial | Faible | Faible |
| 9 | Strapi Comments vs Disqus: Best Comment System for Headless CMS | Comparatif | strapi comments alternative | Faible | Faible |
| 10 | Strapi V5 REST API: Complete Guide with Code Examples | Tutoriel | strapi rest api guide | Élevé | Moyenne |

---

## 6. Recommandations de maillage interne

### Pour SIGNAL — liens à implémenter

**Depuis la page d'accueil `/[locale]`**
- → `/[locale]/plugins` (texte : "Strapi V5 Plugins" / "Plugins Strapi V5")
- → `/[locale]/plugins/strapi-comments` (texte : "strapi-plugin-comments")
- → `/[locale]/blog` (texte : "Read our blog" / "Lire notre blog") — à ajouter dans le footer

**Depuis la page `/[locale]/plugins`**
- → `/[locale]/plugins/strapi-comments` (déjà en place via PluginCard)
- → `/[locale]/blog` (texte : "Plugin tutorials" / "Tutoriels plugins") — section à ajouter

**Depuis la page `/[locale]/plugins/strapi-comments`**
- → `/[locale]/blog/how-to-add-comments-strapi` (texte : "Step-by-step tutorial" / "Tutoriel complet")
- → `/[locale]/blog/best-strapi-v5-plugins-2026` (texte : "See all Strapi V5 plugins")
- → `/[locale]/plugins` (déjà via breadcrumb)

**Depuis les articles de blog**
- Chaque article doit pointer vers la page produit la plus pertinente
- Chaque article doit pointer vers 1-2 autres articles du même cocon
- Maillage bidirectionnel : la page produit pointe vers les tutoriels qui en parlent

**Ancres déconseillées**
- "Cliquez ici", "En savoir plus", "Voir aussi" — pas descriptives
- Favoriser les ancres exactes sur les mots-clés ciblés

### Priorités de maillage par urgence

1. **Urgent** : Lien `/fr/blog` et `/en/blog` dans le footer (navigation principale)
2. **Urgent** : Sur la page strapi-comments → lien vers le tutoriel "how to add comments"
3. **Important** : Sur la page blog listing → lien contextuel vers la page strapi-comments
4. **Important** : Sur les articles de blog → lien vers `/[locale]/plugins/strapi-comments`
5. **À faire** : Sur la page about → lien vers `/[locale]/plugins` ("nos plugins")

---

## 7. Actions prioritaires post-session

### Quick wins immédiats (avant publication)

- [ ] Ajouter le lien "Blog" dans la navigation Header (`src/components/Header.tsx`)
- [ ] Ajouter le lien "Blog" dans le Footer (`src/components/Footer.tsx`)
- [ ] Mettre à jour `src/app/sitemap.ts` pour inclure les URLs du blog (SIGNAL)
- [ ] Créer `public/og-image.png` (1200×630) — référencée dans toutes les métadonnées mais absente

### Contenu Q2 (priorité haute)

- [ ] Rédiger article #3 : "Strapi Plugin Development Guide"
- [ ] Rédiger article #4 : "Strapi V5 with Next.js App Router"
- [ ] Rédiger article FR #7 : "Pourquoi choisir Strapi V5"

### Mesure et suivi

- [ ] Configurer Google Search Console (soumettre sitemap)
- [ ] Configurer Google Analytics / Vercel Analytics
- [ ] Suivre les positions sur les mots-clés cibles à J+30, J+60, J+90

---

## 8. KPIs cibles à 3 mois

| Métrique | Situation actuelle | Cible J+90 |
|----------|-------------------|------------|
| Pages indexées | ~6 pages | ~20 pages |
| Impressions mensuelles (GSC) | 0 (non soumis) | 2 000+ |
| Clics organiques mensuels | 0 | 200+ |
| Position moyenne sur "strapi comment plugin" | Non classé | Top 10 |
| Position moyenne sur "best strapi v5 plugins" | Non classé | Top 20 |
| Articles de blog publiés | 2 | 10 |

---

*Document produit par QUILL — Agent rédaction SEO ISOMORPH*
*En coordination avec SIGNAL (SEO technique) — Audit du 24 mars 2026*
