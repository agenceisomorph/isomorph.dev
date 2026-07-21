# CLAUDE.md — isomorph.dev

## Projet
Site vitrine des plugins ISOMORPH pour Strapi, hébergé sur isomorph.dev (Vercel).

## Stack
- Next.js 15 App Router
- Tailwind CSS 4
- TypeScript strict
- next-intl (bilingue FR/EN)
- Geist Sans + Mono
- Dark mode par défaut, accent violet-500

## État au 24 mars 2026

### Ce qui est fait
- Scaffold complet : 5 pages, 7 composants, i18n FR/EN
- Build OK : 21 pages statiques, < 120 kB First Load JS
- Repo Git initialisé (pas encore sur GitHub)
- SEO : generateMetadata sur chaque page
- RGAA 4.1 : sémantique, contrastes, focus visible
- **Audit SEO technique SIGNAL (session du 24 mars 2026)**
  - `src/app/robots.ts` : robots.txt dynamique, bloque /api/, /admin/, /checkout/
  - `src/app/sitemap.ts` : sitemap XML dynamique, 8 entrées FR+EN, alternates hreflang + x-default
  - `src/components/JsonLd.tsx` : composant utilitaire JSON-LD (sécurisé, escape \u003c)
  - `src/app/[locale]/layout.tsx` : ajout x-default dans hreflang
  - `src/app/[locale]/page.tsx` : métadonnées enrichies + JSON-LD Organization + WebSite + SearchAction
  - `src/app/[locale]/plugins/page.tsx` : métadonnées enrichies + JSON-LD ItemList
  - `src/app/[locale]/plugins/strapi-comments/page.tsx` : métadonnées enrichies + JSON-LD SoftwareApplication + BreadcrumbList + FAQPage
  - `src/app/[locale]/about/page.tsx` : métadonnées enrichies + JSON-LD Organization enrichi
  - Rapport d'audit : `_docs/audit-seo-technique-2026-03-24.md`
  - Score SEO : 3/10 → 7.5/10
- **Tunnel Stripe + gestion des licences (session du 23 mars 2026)**
  - `src/lib/license.ts` : générateur/validateur de clés, CRUD JSON
  - `src/app/api/checkout/route.ts` : création session Stripe Checkout
  - `src/app/api/webhooks/stripe/route.ts` : webhook (created/deleted/updated/failed)
  - `src/app/api/licenses/route.ts` : liste admin (x-admin-key)
  - `src/app/api/licenses/[id]/route.ts` : PATCH/DELETE admin
  - `src/app/api/licenses/verify/route.ts` : vérification publique (pour le plugin)
  - `src/app/[locale]/checkout/success/page.tsx` : page de succès avec clé
  - `src/app/[locale]/admin/licenses/page.tsx` : dashboard admin
  - `src/components/CheckoutButton.tsx` : bouton checkout (client)
  - `src/components/CopyKeyButton.tsx` : bouton copie (client)
  - `data/licenses.json` : base JSON vide initialisée
  - `.env.example` mis à jour
  - CSP dans `next.config.ts` étendu pour Stripe (js.stripe.com, api.stripe.com, etc.)
  - Traductions FR/EN ajoutées (namespace `checkout.success`)

### Livraison email de la licence (fait — 2026-07-12, PR feat/license-email-tem)
- `src/lib/email.ts` : `buildLicenseEmail()` (pur, testé standalone) + `sendLicenseEmail()`
  via **Scaleway TEM** (défaut ISOMORPH — pas Resend/SES). Ne lève jamais : un
  échec d'email est loggué, ne fait pas échouer le webhook (pas de retry Stripe).
- Branché dans le webhook `checkout.session.completed` après `createLicense`.
- `.env.example` : ajout `SCW_SECRET_KEY`, `SCW_TEM_PROJECT_ID`, `SCW_TEM_REGION`,
  `TEM_FROM_EMAIL`, `TEM_FROM_NAME`.

### Paliers multi-sites (fait — 2026-07-12, PR feat/license-seats-tiers)
- 3 plans : `pro` (1 site, 79€), `pro-multi` (5 sites, 199€), `enterprise` (illimité, 349€).
- `license.ts` : `seats` dérivé du plan + `domains[]` (domaines activés) sur chaque
  licence ; `checkDomain()` (pur, testé standalone) enforce le quota.
- Endpoint `/api/licenses/verify` : refuse (`domain_limit`) quand un nouveau domaine
  dépasse le quota de sites du plan → le plugin repasse ce site en Community.
- Checkout : accepte `pro-multi` (prix `STRIPE_PRICE_PRO_MULTI`) ; Enterprise reste sur devis.
- **Reste (UI/contenu)** : refondre `PricingTable.tsx` + messages FR/EN en 3 paliers
  (49€ lancement / 79€ / 199€ / 349€) — tâche de contenu séparée.
- Un « site » = un domaine / instance Strapi (hypothèse à confirmer par Florent).

### Produits Stripe (compte ISOMORPH `acct_1GG00RBFAH8GRSu1`, LIVE)
Créés le 12/07/2026 (0 abonnement). IDs de prix (non secrets) à mettre en env Vercel :
- **Pro (1 site) — 49 €/an (prix de lancement)** : produit `prod_UCXzy1kJelRUO5`,
  prix `STRIPE_PRICE_PRO=price_1TE8trBFAH8GRSu133yCVyJs`
- **Multi-sites (5 sites) — 199 €/an** : produit `prod_UsCMEc0XQ6gjTQ`,
  prix `STRIPE_PRICE_PRO_MULTI=price_1TsRxLBFAH8GRSu1OaMCMqNq`
- Enterprise (349 €) = sur devis, pas de produit. 79 € (Pro standard) = à créer plus
  tard quand on montera le prix de lancement.
- Test : code promo `ISOTEST100` (100 %) + lien de paiement Pro
  https://buy.stripe.com/aFa00ibqwf4407KaVmebu00
- ⚠️ Compte en **vérification Stripe** (2-3 j au 12/07) — payouts opérationnels après.

### À faire AVANT la mise en production
- [ ] `npm install` (stripe ^17.0.0) + `npm run build` — **depuis le Mac** (npm bloqué sur la VM)
- [x] ~~Créer les produits/prix Stripe~~ → faits (IDs ci-dessus). Reste : les mettre en env Vercel.
- [x] ~~Connecter isomorph.dev sur Vercel~~ → fait (déploie des previews).
- [ ] Configurer le webhook Stripe → `https://isomorph.dev/api/webhooks/stripe`
- [ ] Renseigner les variables d'env sur Vercel (STRIPE_*, ADMIN_API_KEY,
      NEXT_PUBLIC_APP_URL, **SCW_SECRET_KEY, SCW_TEM_PROJECT_ID, TEM_FROM_EMAIL**)
- [ ] Vérifier l'expéditeur `support@isomorph.fr` dans Scaleway TEM
- [ ] Remplacer le `prompt()` de `CheckoutButton` par un vrai modal email (V2)
- [ ] Le plugin comments vérifie DÉJÀ la licence en ligne contre
      `/api/licenses/verify` (PR strapi-plugin-comments#3) — l'endpoint est prêt.

### Ce qui reste à faire (backlog général)
- [ ] Créer le repo GitHub (agenceisomorph/isomorph-dev)
- [ ] Connecter isomorph.dev sur Vercel
- [ ] Ajouter les screenshots du plugin dans la page Comments
- [ ] **Créer `public/og-image.png` (1200×630) — référencée partout mais absente**
- [ ] **Créer Google Search Console et soumettre le sitemap**
- [ ] **Valider les JSON-LD via Google Rich Results Test**
- [ ] Ajouter un blog MDX pour le SEO (clusters mots-clés identifiés dans l'audit)
- [ ] Tester le rendu mobile
- [ ] Ajouter Google Analytics / Vercel Analytics
- [ ] V2 licences : migrer vers Neon Postgres (remplacer data/licenses.json)
- [ ] V2 licences : rate limiting sur /api/licenses/verify (middleware Vercel Edge)
- [ ] V2 admin : remplacer le prompt+sessionStorage par NextAuth
- [ ] Soumettre le plugin sur Strapi Marketplace (market.strapi.io)

### Historique des audits SEO
| Date | Agent | Score | Actions |
|------|-------|-------|---------|
| 2026-03-24 | SIGNAL | 3→7.5/10 | robots.ts, sitemap.ts, JsonLd.tsx, métadonnées enrichies 4 pages, JSON-LD 5 schémas |

## Structure
```
src/app/[locale]/                → Pages par locale
src/components/                  → Composants réutilisables
src/messages/{fr,en}.json        → Traductions
src/i18n/                        → Config next-intl
```

## Commandes
```bash
npm run dev    # Serveur dev → localhost:3000
npm run build  # Build production
npm run start  # Serveur production
```

## Domaines disponibles
- isomorph.dev (recommandé pour les plugins)
- isomorph.app
