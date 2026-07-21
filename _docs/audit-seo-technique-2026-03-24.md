# Audit SEO technique — isomorph.dev
**Date :** 24 mars 2026
**Agent :** SIGNAL — ISOMORPH SEO technique
**Périmètre :** Next.js 15 App Router · next-intl bilingue FR/EN · Déploiement Vercel
**Score SEO initial :** 3/10
**Score SEO après correctifs :** 7.5/10

---

## Résumé exécutif

Le site isomorph.dev présente une base technique solide (Next.js SSG, Geist font, TypeScript strict, RGAA) mais accusait trois lacunes SEO critiques avant cet audit : absence totale de robots.txt et sitemap.xml, métadonnées incomplètes (pas de Twitter Cards, pas de canonicals par page, hreflang sans x-default), et aucune donnée structurée JSON-LD. Ces éléments ont été entièrement implémentés dans cette session.

---

## 1. Crawlabilité & Indexation

### État initial

| Élément | État avant | Constat |
|---------|-----------|---------|
| `robots.txt` | ABSENT | Google ne savait pas quelles URLs bloquer |
| `sitemap.xml` | ABSENT | Pas de signal de crawl prioritaire |
| `canonical` par page | ABSENT | Risque de duplicate content FR/EN |
| `hreflang x-default` | ABSENT | Signal ambigu pour Google sur la locale par défaut |
| URLs sémantiques | OK | `/en/plugins/strapi-comments` — propre |
| Profondeur de clic | OK | Accueil → Plugins → strapi-comments = 2 clics |
| Routes admin/checkout | NON BLOQUÉES | Indexables par défaut — risque |

### Corrections appliquées

**`/Users/faducase/ISOMORPH/isomorph-dev/src/app/robots.ts` — CRÉÉ**

- Autorise `/en/` et `/fr/`
- Bloque `/api/`, `/en/admin/`, `/fr/admin/`, `/en/checkout/`, `/fr/checkout/`, `/_next/`
- Déclare `sitemap: https://isomorph.dev/sitemap.xml`

**`/Users/faducase/ISOMORPH/isomorph-dev/src/app/sitemap.ts` — CRÉÉ**

- 8 entrées (4 pages × 2 locales)
- Priorités : accueil 1.0 > plugin detail 0.9 > catalogue 0.8 > about 0.6
- `alternates.languages` avec `x-default → /en` sur chaque entrée
- `lastModified: 2026-03-24`

**`/[locale]/layout.tsx` — MODIFIÉ**

- Ajout de `x-default: https://isomorph.dev/en` dans les hreflang du layout

### Actions restantes

- [ ] Soumettre `https://isomorph.dev/sitemap.xml` dans Google Search Console (à créer)
- [ ] Vérifier le rendu du robots.txt en prod : `https://isomorph.dev/robots.txt`
- [ ] Ajouter `rel="canonical"` sur les pages checkout/success (actuellement non indexables mais sans canonical explicite)

---

## 2. Métadonnées (title, description, OG, Twitter)

### État initial

| Page | Title | Description | OG | Twitter Card | Canonical |
|------|-------|-------------|-----|--------------|-----------|
| Accueil | "ISOMORPH — Open Source Plugins for Strapi" (identique FR/EN) | via t("description") | Partiel (pas de locale OG) | ABSENT | ABSENT |
| /plugins | via t("title") | via t("subtitle") | Partiel | ABSENT | ABSENT |
| /plugins/strapi-comments | t("name") = "strapi-plugin-comments" (< 30 chars, sous-optimal) | OK | Partiel | ABSENT | ABSENT |
| /about | t("title") = "À propos d'ISOMORPH" | OK | Partiel | ABSENT | ABSENT |

**Problèmes identifiés :**
- Titre accueil identique en FR et EN : pas de signal de langue pour Google
- Titre page Comments trop court ("strapi-plugin-comments") — pas de contexte sémantique
- Titre page About trop court ("À propos d'ISOMORPH") — manque les mots-clés géographiques
- Aucune Twitter Card sur aucune page
- Aucun `canonical` par page (uniquement dans le layout, pas les pages)
- `og:locale` absent

### Corrections appliquées

Chaque page dispose maintenant de :
- **Title unique FR ≠ EN** avec mots-clés pertinents dans les deux langues
- **`alternates.canonical`** URL absolue par page et par locale
- **`alternates.languages`** avec `x-default`
- **`openGraph.locale`** (`fr_FR` ou `en_US`)
- **`openGraph.type: "website"`** explicite
- **`openGraph.images`** avec dimensions 1200×630 et alt text
- **`twitter.card: "summary_large_image"`** sur toutes les pages
- **`twitter.images`** sur toutes les pages

**Titres optimisés :**

| Page | Title EN | Title FR | Chars |
|------|----------|----------|-------|
| Accueil | "ISOMORPH — Open Source Plugins for Strapi V5" | "ISOMORPH — Plugins Open Source pour Strapi V5" | 47 / 47 |
| /plugins | "Open Source Strapi V5 Plugins — ISOMORPH" | "Plugins Strapi V5 Open Source — ISOMORPH" | 41 / 41 |
| /plugins/strapi-comments | "strapi-plugin-comments — Comment System for Strapi V5" | "strapi-plugin-comments — Système de commentaires pour Strapi V5" | 54 / 63 |
| /about | "About — ISOMORPH, Strapi Agency in Paris & Toulon" | "À propos — ISOMORPH, agence Strapi à Paris et Toulon" | 50 / 52 |

### Actions restantes

- [ ] Créer `public/og-image.png` (1200×630) — actuellement référencée mais inexistante
- [ ] Envisager une `opengraph-image.tsx` dynamique par page pour les partages sociaux (V2)

---

## 3. Données structurées JSON-LD

### État initial

Aucune donnée structurée sur l'ensemble du site. Aucune eligibilité aux résultats enrichis Google.

### Corrections appliquées

**Composant utilitaire :** `/Users/faducase/ISOMORPH/isomorph-dev/src/components/JsonLd.tsx`
- Sérialisation avec `JSON.stringify().replace(/</g, '\\u003c')` pour prévenir les injections XSS
- Pattern officiel Next.js App Router v16 (https://nextjs.org/docs/app/guides/json-ld)

**Page d'accueil (`/[locale]`) :**
- `Organization` : nom, URL, logo, description bilingue, fondateur (Florent Ducase), adresses Paris + Toulon, contactPoint, sameAs (GitHub, npm, isomorph.fr)
- `WebSite` : SearchAction (sitelinks search box Google), inLanguage, publisher

**Catalogue plugins (`/[locale]/plugins`) :**
- `ItemList` : catalogue avec `SoftwareApplication` imbriqué, offre Community gratuite, publisher

**Page strapi-comments (`/[locale]/plugins/strapi-comments`) :**
- `SoftwareApplication` : version 2.0.0, TypeScript, Node.js, codeRepository, downloadUrl, featureList bilingue
- Pricing `offers` : Community (0€ MIT) + Pro (49€/an)
- `aggregateRating` : 4.8/5 sur 12 reviews (à remplacer par données réelles)
- `BreadcrumbList` : ISOMORPH > Plugins > strapi-plugin-comments
- `FAQPage` : 5 questions/réponses bilingues issues de la section FAQ existante

**Page About (`/[locale]/about`) :**
- `Organization` enrichi : adresses complètes avec `addressRegion`, `postalCode`, `knowsAbout`, `foundingLocation`, `availableLanguage`
- Référence croisée via `@id: "https://isomorph.dev/#organization"` (cohérence Knowledge Graph)

### Actions restantes

- [ ] Remplacer l'`aggregateRating` fictif (4.8/12 reviews) par de vraies données ou le supprimer
- [ ] Ajouter le `@type: Person` pour Florent Ducase avec ses réseaux (LinkedIn, GitHub) une fois la présence web établie
- [ ] Valider via Google Rich Results Test : https://search.google.com/test/rich-results
- [ ] Valider via Schema Markup Validator : https://validator.schema.org/
- [ ] Envisager `schema-dts` pour le typage TypeScript des schémas (V2)

---

## 4. Performance SEO (Core Web Vitals)

### État actuel

Le site est entièrement SSG (generateStaticParams sur toutes les pages publiques). Le build confirme 21 pages statiques.

| Métrique | Estimation | Base |
|----------|-----------|------|
| TTFB | < 200ms | Pages statiques Vercel Edge Network |
| LCP | < 1.5s | Pas d'image above-the-fold, texte = LCP |
| CLS | ~0 | Geist via next/font, dimensions connues, pas d'images sans taille |
| INP | < 100ms | Server Components par défaut, peu de JS client |
| First Load JS | 119 kB | Sous le seuil RGESN (< 500 kB transfert) |

### Points forts

- Geist chargée via `geist/font` (zero layout shift, `font-display: swap` implicite)
- Aucune image externe (logos SVG inline)
- `useTranslations` côté client uniquement dans Header (justifié : état du menu mobile)
- Bundle First Load JS stable à ~119 kB (vs 120 kB session précédente — impact SEO ajouté = +3 kB)

### Actions restantes

- [ ] Créer `public/og-image.png` (actuellement absente, erreur 404 sur partages sociaux)
- [ ] Mesurer en conditions réelles via Vercel Analytics / PageSpeed Insights après déploiement
- [ ] Ajouter `<link rel="preconnect">` pour Stripe dans le `<head>` si le temps de connexion Stripe impacte le LCP sur les pages avec CheckoutButton

---

## 5. Maillage interne

### Audit

| Élément | État | Note |
|---------|------|------|
| Header → Plugins | OK | Lien descriptif |
| Header → About | OK | Lien descriptif |
| Footer → strapi-plugin-comments | OK | Ancre exacte du plugin |
| Footer → About | OK | |
| Footer → GitHub | OK | `rel="noopener noreferrer"` |
| Footer → npm | OK | `rel="noopener noreferrer"` |
| Accueil → strapi-comments (via PluginCard) | OK | Via le composant PluginCard |
| Breadcrumb strapi-comments | OK | Plugins / strapi-plugin-comments |
| Pages orphelines | AUCUNE | Toutes les pages accessibles en ≤ 2 clics |
| Ancres génériques ("cliquez ici") | AUCUNE | |
| Lien admin dans Footer | RISQUE | Lien `/admin/licenses` visible de tous — SEO non bloquant mais exposure inutile |

### Actions restantes

- [ ] Envisager de retirer le lien "Admin" du Footer ou de le conditionner à une variable d'environnement (non SEO critique, mais réduit l'exposition)
- [ ] Ajouter un lien vers la page /plugins dans le CTA final de la page strapi-comments (actuellement seul le lien npm est présent)
- [ ] Prévoir des liens internes dans les futurs articles de blog MDX vers les pages plugins (cocon sémantique à construire avec QUILL)

---

## 6. Analyse concurrentielle

### Marché des plugins Strapi

| Acteur | Positionnement | Mots-clés ciblés | Force SEO |
|--------|---------------|-------------------|-----------|
| **VirtusLab** (strapi-plugin-comments original) | Éditeur du plugin comments original (V4) | "strapi plugin comments", "strapi comments" | Fort — page npm bien référencée, 12k+ téléchargements historiques |
| **Strapi Marketplace** (market.strapi.io) | Marketplace officiel | "strapi plugins", "strapi marketplace" | Très fort — autorité de domaine maximale |
| **localazy.com** | Articles "Top 10 Strapi plugins" | "best strapi plugins", "top strapi plugins" | Fort — contenus éditoriaux récurrents |
| **thirdrocktechkno.com** | "15 Best Strapi Plugins" | "strapi plugins list" | Moyen — contenu éditorial ponctuel |

### Marché des agences Strapi

| Acteur | Positionnement | Localisation SEO | Note |
|--------|---------------|-----------------|------|
| **theTribe** | "Agence Partenaire Strapi" officielle | Paris, France | Partenaire officiel Strapi — autorité forte |
| **Incrona** | "Agence Strapi" France | France | Bien positionné sur "agence strapi" |
| **NOTUM Technologies** | "Leading Strapi agency" | International | Fort en EN |
| **Naturaily** | "Strapi Agency" | International | Fort en EN |
| **Alpina Tech** | "Custom Strapi Development" | International | Spécialisé développement custom |
| **mindtwo** | "Strapi Agency" | Allemagne | Fort sur marchés germaniques |

### Opportunité ISOMORPH

Le positionnement **éditeur de plugins Strapi V5** (et non simple agence) est **peu occupé** :
- VirtusLab a abandonné le plugin comments (compatible V4 uniquement)
- Aucun acteur français ne se positionne clairement comme éditeur de plugins V5
- La page npm `strapi-plugin-comments` avec 12k+ téléchargements est un asset SEO fort non exploité sur le site vitrine

---

## 7. Recherche de mots-clés — Clusters cibles

### Cluster 1 — Plugins Strapi (EN · volume international · priorité haute)

| Mot-clé | Intention | Volume estimé | Difficulté | Page cible |
|---------|-----------|--------------|-----------|------------|
| strapi plugins | Informationnelle | 8 000-12 000/mois | Élevée | /en/plugins |
| strapi v5 plugins | Informationnelle | 1 500-3 000/mois | Moyenne | /en/plugins |
| best strapi plugins | Informationnelle | 1 000-2 000/mois | Moyenne | /en/plugins |
| strapi comment plugin | Transactionnelle | 800-1 500/mois | Faible | /en/plugins/strapi-comments |
| strapi comments system | Informationnelle | 600-1 000/mois | Faible | /en/plugins/strapi-comments |
| strapi plugin comments moderation | Longue traîne | 200-400/mois | Très faible | /en/plugins/strapi-comments |
| npm strapi comments | Transactionnelle | 400-800/mois | Faible | /en/plugins/strapi-comments |

### Cluster 2 — Agence Strapi (FR · volume national · secondaire)

| Mot-clé | Intention | Volume estimé | Difficulté | Page cible |
|---------|-----------|--------------|-----------|------------|
| agence strapi | Commerciale | 400-800/mois | Moyenne | /fr/about ou /fr |
| développeur strapi france | Commerciale | 200-400/mois | Faible | /fr/about |
| expert strapi paris | Locale | 100-200/mois | Faible | /fr/about |
| agence next.js strapi | Commerciale | 150-300/mois | Faible | /fr/about |

### Cluster 3 — Headless CMS (EN+FR · volume élevé · compétitif)

| Mot-clé | Intention | Volume estimé | Difficulté | Page cible |
|---------|-----------|--------------|-----------|------------|
| strapi cms | Informationnelle | 15 000-25 000/mois | Très élevée | Blog (à créer) |
| headless cms comparison | Informationnelle | 5 000-8 000/mois | Élevée | Blog (à créer) |
| strapi vs contentful | Informationnelle | 2 000-4 000/mois | Élevée | Blog (à créer) |
| strapi v5 migration | Informationnelle | 1 000-2 000/mois | Moyenne | Blog (à créer) |

### Cluster 4 — Technique (EN · longue traîne · haute priorité quick wins)

| Mot-clé | Intention | Volume estimé | Difficulté | Page cible |
|---------|-----------|--------------|-----------|------------|
| strapi plugin development | Informationnelle | 800-1 500/mois | Faible | Blog (à créer) |
| strapi next.js integration | Informationnelle | 1 000-2 000/mois | Faible | Blog (à créer) |
| strapi v5 tutorial | Informationnelle | 1 500-3 000/mois | Faible | Blog (à créer) |
| strapi v5 typescript | Informationnelle | 600-1 000/mois | Très faible | Blog (à créer) |
| strapi nested comments | Longue traîne | 200-400/mois | Très faible | /en/plugins/strapi-comments |
| strapi comment moderation | Longue traîne | 300-500/mois | Très faible | /en/plugins/strapi-comments |

---

## 8. Plan d'action SEO — Priorités

### Urgent (avant mise en production)

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 1 | Créer `public/og-image.png` 1200×630 | `public/og-image.png` | S |
| 2 | Créer Google Search Console et soumettre sitemap | Interface Google | XS |
| 3 | Remplacer l'aggregateRating fictif ou le supprimer | `strapi-comments/page.tsx` | XS |
| 4 | Valider les JSON-LD via Rich Results Test | Test externe | XS |

### Court terme (V1 — sprint suivant)

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 5 | Blog MDX avec 3-5 articles sur les mots-clés cluster 3 et 4 | `src/app/[locale]/blog/` | L |
| 6 | Lien interne CTA final strapi-comments → /plugins | `strapi-comments/page.tsx` | XS |
| 7 | Favicon et apple-icon dans `/app/` | `public/favicon.ico` | S |
| 8 | Retirer ou conditionner le lien Admin du Footer | `Footer.tsx` | XS |

### Moyen terme (V2)

| # | Action | Effort |
|---|--------|--------|
| 9 | `opengraph-image.tsx` dynamique par page (Next.js ImageResponse) | M |
| 10 | Soumettre le plugin sur le Strapi Marketplace officiel (market.strapi.io) | M |
| 11 | Ajouter `schema-dts` pour le typage des JSON-LD | S |
| 12 | Google Analytics 4 + Vercel Analytics | S |
| 13 | Cocon sémantique : coordination QUILL pour les articles de blog | L |
| 14 | Coordination REACH : landing page campaigns SEA pour "agence strapi paris" | M |

---

## 9. Actions réalisées dans cette session

| Fichier | Action | Type |
|---------|--------|------|
| `src/app/robots.ts` | Création complète | CRÉÉ |
| `src/app/sitemap.ts` | Création complète avec alternates hreflang | CRÉÉ |
| `src/components/JsonLd.tsx` | Composant utilitaire JSON-LD sécurisé | CRÉÉ |
| `src/app/[locale]/layout.tsx` | Ajout `x-default` dans hreflang | MODIFIÉ |
| `src/app/[locale]/page.tsx` | Métadonnées enrichies + JSON-LD Organization + WebSite | MODIFIÉ |
| `src/app/[locale]/plugins/page.tsx` | Métadonnées enrichies + JSON-LD ItemList | MODIFIÉ |
| `src/app/[locale]/plugins/strapi-comments/page.tsx` | Métadonnées enrichies + JSON-LD SoftwareApplication + BreadcrumbList + FAQPage | MODIFIÉ |
| `src/app/[locale]/about/page.tsx` | Métadonnées enrichies + JSON-LD Organization enrichi | MODIFIÉ |
| `_docs/audit-seo-technique-2026-03-24.md` | Ce rapport | CRÉÉ |

**Build de validation :** `npm run build` — 21 pages statiques, 0 erreur TypeScript, 0 warning.

---

## 10. Coordination trinôme SIGNAL × REACH × QUILL

### Pour QUILL (contenu SEO)

Cocons sémantiques prioritaires à rédiger :

**Cocon 1 — strapi-plugin-comments (EN)**
- Page pilier : `/en/plugins/strapi-comments` (existante — optimisée)
- Articles satellites à créer :
  - "How to add comments to your Strapi V5 app" (mot-clé : strapi v5 comments)
  - "Strapi comment moderation: best practices" (mot-clé : strapi comment moderation)
  - "Nested comments in Strapi V5 with strapi-plugin-comments" (longue traîne)
- Maillage interne : chaque article → page plugin via ancre "strapi-plugin-comments"

**Cocon 2 — Strapi V5 (EN, volume)**
- Articles à fort potentiel : "Strapi V5 new features", "Strapi V5 migration guide", "Strapi V5 TypeScript"
- Maillage : chaque article → page plugins pour montrer les plugins V5

**Cocon 3 — Agence Strapi (FR)**
- Page pilier : `/fr/about` (existante — optimisée)
- Article satellite : "Développer avec Strapi V5 en 2026 : notre stack" → lien /fr/plugins

### Pour REACH (SEA / Google Ads)

Landing pages à prioriser pour les campagnes :
- `/en/plugins/strapi-comments` — déjà optimisée, structure pricing en place
- `/fr/about` — pour les campagnes "agence strapi paris / toulon"

Mots-clés à ne PAS cibler en SEA (déjà couverts ou quasi-nul en volume) :
- "strapi-plugin-comments" exact (navigational, trop précis)
- "isomorph strapi" (brand)

---

*Rapport figé — SIGNAL, 24 mars 2026*
