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

## État au 23 mars 2026

### Ce qui est fait
- Scaffold complet : 5 pages, 7 composants, i18n FR/EN
- Build OK : 13 pages statiques, < 120 kB First Load JS
- Repo Git initialisé (pas encore sur GitHub)
- SEO : generateMetadata sur chaque page
- RGAA 4.1 : sémantique, contrastes, focus visible
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

### À faire AVANT la mise en production
- [ ] `npm install` (ajoute stripe ^17.0.0)
- [ ] Créer les produits/prix dans Stripe Dashboard et copier `STRIPE_PRICE_PRO`
- [ ] Configurer le webhook Stripe → `https://isomorph.dev/api/webhooks/stripe`
- [ ] Renseigner les variables d'env sur Vercel (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PRO, ADMIN_API_KEY, NEXT_PUBLIC_APP_URL)
- [ ] Remplacer le `prompt()` de `CheckoutButton` par un vrai modal email (V2)
- [ ] Ajouter l'envoi email de la licence (Resend / SES) dans le webhook

### Ce qui reste à faire (backlog général)
- [ ] Créer le repo GitHub (agenceisomorph/isomorph-dev)
- [ ] Connecter isomorph.dev sur Vercel
- [ ] Ajouter les screenshots du plugin dans la page Comments
- [ ] Ajouter un blog MDX pour le SEO
- [ ] Ajouter le sitemap dynamique
- [ ] Ajouter les données structurées JSON-LD
- [ ] Tester le rendu mobile
- [ ] Ajouter Google Analytics / Vercel Analytics
- [ ] V2 licences : migrer vers Neon Postgres (remplacer data/licenses.json)
- [ ] V2 licences : rate limiting sur /api/licenses/verify (middleware Vercel Edge)
- [ ] V2 admin : remplacer le prompt+sessionStorage par NextAuth

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
