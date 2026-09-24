# Journal 2026-09-25 : isomorph.dev sur le système Console

Branche : `feat/site-console` (depuis `main`).

## Cadrage (Florent)
- Le système de design Console (construit dans `isomorph/src/components/console`) quitte isomorph.fr et devient celui d'isomorph.dev.
- isomorph.dev = mini-site des projets dev d'ISOMORPH : plugins (Strapi, Shopify), code, expérimentations, veille techno.
- La vente des plugins (Stripe, licences) reste en l'état et prend le nouveau design.
- Sessions isomorph.fr prévenues (retour au design précédent de leur ressort).

## État de départ
- Racine https://isomorph.dev répond 404 (Vercel).
- PR #8 `fix/price-id-trim` ouverte, non mergée (hors périmètre).

## Domaine
- Cause du 404 : `isomorph.dev` (DNS OVH vers Vercel, domaine vérifié dans l'équipe) n'est rattaché à aucun projet Vercel (`DEPLOYMENT_NOT_FOUND`). Le projet `isomorph-dev` n'a que `isomorph-dev.vercel.app`.
- À faire à la mise en ligne, avec accord de Florent : rattacher `isomorph.dev` (et `www` en redirection) au projet `isomorph-dev`.

## 23:25 — Transport du système Console (FORGE)

- **157 fichiers** copiés depuis `isomorph/src/components/console` vers `isomorph.dev/src/components/console` (fondations, bouton, liens, animations, carrousels, carte, comparaison, contenus, décors, erreurs, fonds, formulaires, globe, grilles, identité, illustrations, navigation, pages, retours, sections, vitrine).
- Fichiers de support copiés depuis isomorph.fr : `IsomorphLogo`, `chrome/CountryFlag`, `chrome/LanguageSwitcher`, `chrome/expertiseNav`, `site/familles.ts`, `site/sections.ts`, `lib/actualites.ts`.
- **Stubs créés** (isomorph.dev n'a pas le Cockpit ni les services d'isomorph.fr) : `lib/i18n.ts` (shim next-intl ↔ API Console), `lib/cn.ts`, `lib/schema-org.ts`, `lib/expertises/data.ts`, `content/services/types.ts`, `app/actions/rendez-vous.ts`.
- **Dépendances ajoutées** : `three ^0.178.0`, `maplibre-gl ^6.11.1`, `motion ^12.43.0`, `@types/three ^0.178.1`.
- Échelle typographique `type-*` et `.sr-only` injectées dans `globals.css`.
- Atelier monté à `/[locale]/atelier/console` (noindex, layout bypass Header/Footer).
- `tsc --noEmit` : exit 0. ESLint : 0 erreur. Build prod : vert.
- Contrôlé dans le navigateur en 1440 et 375 : aucun débordement, toutes les planches rendues.
- **Écart attendu** : images des articles (`/actualites/*.svg`, `*.png`) absentes du `public/` d'isomorph.dev — 404 non bloquants, pas d'assets système de design concernés.
- Commit : `e357b13`.
