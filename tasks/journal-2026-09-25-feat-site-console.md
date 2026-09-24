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

## FORGE — Rubrique Expérimentations (agents B, 25 septembre 2026)

**14:12** — Installation `@react-three/fiber@^9.8.1` et `@react-three/drei@^10.7.8` (même pile qu'isomorph.fr). Commit `b05e8a8`.

**14:20** — Création `src/lib/experimentations.ts` : `EXPERIMENTATIONS[]` (9 entrées FR), `EXPERIMENTATIONS_EN`, `getExperimentation()`. Exporté immédiatement pour l'agent A. Jeu de la Lune exclu (`Astronaute.tsx` supprimé dans `dbc0bd9`).

**14:35** — Copie des 5 heros dans `src/components/experimentations/` (carte-mere, coeur-quantique, montagnes-russes, terminal, tunnel-donnees) + commun (CibleCalibrage, SequenceDemarrage). Imports corrigés (`@/components/hero-demarrage/commun/*` -> `../commun/*`). Globe, carte, décors et fonds réutilisés via import direct de `console/`.

**14:50** — Wrappers créés : `DemoViewer` (client, table slug-composant, dynamic ssr:false), `DemoDecors`, `DemoFonds`, `DemoCarteGeo`, `DemoGlobe`, `CarteExperimentation` (carte galerie, aperçu SVG léger par groupe, zéro canvas 3D).

**15:05** — Pages : `/[locale]/experimentations` (galerie, Server Component, 3 sections groupées) et `/[locale]/experimentations/[slug]` (detail, generateStaticParams FR+EN, métadonnées canonical+alternates). Commit `e0335d8`.

**15:20** — Contrôles : `npx tsc --noEmit` -> 0 erreur sur mes fichiers (1 erreur pre-existante `PiedPageIsomorphDev.tsx`). `npm run lint` -> 0 erreur sur mes fichiers. `npm run build` -> échec pre-existant (cgv, confidentialite, mentions-legales, `PiedPageIsomorphDev.tsx`). Serveur dev 3222 : galerie 1440 px OK, mobile 375 px OK, page detail Terminal OK, aucune erreur console.
