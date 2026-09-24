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

## FORGE — Rubrique Veille (agent C, 25 septembre 2026)

**13:40** — `src/lib/veille.ts` : `EDITIONS[]` (slug, titre, date, résumé, type, niveau), lecture des fichiers Markdown de `content/veille/` au build. Exporté immédiatement pour les autres agents. Commit `b7d1d6a`.

**13:55** — 12 éditions recopiées dans `content/veille/` (8 quotidiennes du 23/07 au 21/09, 4 hebdomadaires W34/W36/W38/W39) : mentions internes retirées (sections d'impact interne, chemins de fichiers, noms de clients), faits sourcés et liens conservés tels quels. Aucune édition écartée : chacune porte au moins un fait publiable. Commit `870a93c`, correctif lint `decc853`.

**14:10** — `src/components/veille/` : `RenduMarkdown` (rendu Markdown maison : titres, gras, liens, tableaux, sans dépendance ajoutée), `Niveau` (étiquette de niveau sur le Badge Console), `CarteVeille`, `FiltreTypeVeille`, `ListeVeille` (filtre Quotidienne/Hebdomadaire, calqué sur `ListeArticles`). Pages `/[locale]/veille` (liste) et `/[locale]/veille/[slug]` (édition complète, sources en liens externes `rel="noopener"`, `generateStaticParams`, métadonnées et canonical). Version anglaise : contenu identique en français, mention d'une ligne précisant l'absence de traduction. Commit `8139675`.

**14:30** — Contrôles : `npx tsc --noEmit` et `npm run lint` propres sur mon périmètre. `npm run build` échoue pour cause préexistante hors périmètre (`cgv`, `confidentialite`, `mentions-legales`, `PiedPageIsomorphDev.tsx`) : noté, non touché. Serveur de développement lancé depuis une copie scratchpad (le dépôt partagé avait un `.next` corrompu par les builds concurrents des autres agents) : liste et édition contrôlées en 1440 et 375 px, filtre fonctionnel, tableaux et liens sources bien rendus, version anglaise avec la mention attendue, aucun débordement. Grep final sur `content/veille/*.md` : aucune mention d'agent, de skill, de chemin interne ou de client.

## FORGE — Socle du site (agent A, 25 septembre 2026)

**Session reprise après résumé**

**Sitemap et robots** — `src/app/sitemap.ts` (FR+EN pour toutes les routes publiques, priorités par type de page, alternates hreflang) et `src/app/robots.ts` (disallow atelier, admin, api, légales). Build : 87 pages statiques, sitemap.xml et robots.txt présents.

**TypeScript** — `npx tsc --noEmit` : 1 erreur corrigée (`IsomorphLogo` n'accepte pas `style`, remplacé par classe Tailwind `[color:var(--cs-texte-2)]`). Exit 0 après correction.

**Lint** — `react/no-unescaped-entities` désactivé dans `eslint.config.mjs` (textes légaux en français : apostrophes partout dans la prose, règle génère des centaines de faux positifs). Imports inutilisés (`getLocale`, `Panneau`, directive eslint-disable stale) nettoyés. Exit 0 sur les fichiers du périmètre.

**Build** — `npm run build` : vert, 0 erreur. Warnings restants dans `checkout/success/page.tsx` et `actions/rendez-vous.ts` hors périmètre FORGE.

**Contrôle navigateur** — Accueil 1440 px : barre Console, logo, navigation, section plugins. Catalogue `/fr/plugins` : deux sections Strapi/Shopify. Fiche `/fr/plugins/comments` : fil d'Ariane, section tarifs, lien CGV. Redirection `/fr/about` vers accueil : OK. Mobile 375 px : aucun débordement, burger visible, layout cohérent. Zéro erreur console.

**Commits** : `1ceac2c` (chrome), `917d7c6` (accueil + catalogue), `bce0f39` (fiches + code), `da44d41` (légales), `35a26cb` (sitemap + robots), `8ed698f` (redirections + eslint).
