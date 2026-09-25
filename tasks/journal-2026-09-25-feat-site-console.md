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

## SENTINEL — Review et corrections (25 septembre 2026)

**Session autonome — branch `feat/site-console`, diff `main...HEAD`**

**15:00** — Lecture du diff complet (18 commits), de l'inventaire `_docs/inventaire-contenu-2026-09-25.md`, du plan, des pages légales, du CLAUDE.md projet, et des fichiers sources clés.

**15:20** — Défauts identifiés et corrigés (commit `997ae19`) :

- `next.config.ts` : CSP incomplète — `worker-src 'self' blob:` et `connect-src https://tiles.openfreemap.org` manquants, documentés comme requis dans `src/components/console/carte/chargeur.ts` (MapLibre 6, workers blob:, tuiles OpenFreeMap).
- `src/lib/plugins.ts` : `PLUGIN_COMMENTS.statut` "publie" → "en-developpement" (inventaire §1.4 : `npm view @isomorph-agency/strapi-plugin-comments` → 404 au 25/09/2026, plugin non publié sur npm).
- `src/app/[locale]/cgv/page.tsx` et `confidentialite/page.tsx` : version `/en` affichait un résumé réécrit en anglais ; remplacé par le texte français intégral + avis de version faisant foi.
- `src/app/[locale]/mentions-legales/page.tsx` : version `/en` affichait un extrait partiel ; remplacé par le texte français intégral + avis.
- `src/app/[locale]/plugins/strapi-comments/page.tsx` : page morte (redirect 301 dans `next.config.ts` depuis le commit `8ed698f`), importait `FeatureGrid` obsolète. Supprimée.
- `src/components/` : `Header`, `Footer`, `Hero`, `PluginCard`, `FeatureGrid`, `LanguageSwitcher` (root) — composants hérités de l'ancien site, non importés par aucune page active après la suppression de `strapi-comments`. Supprimés.

**15:35** — `npx tsc --noEmit` : exit 0. `npm run lint` : warnings préexistants uniquement (`checkout/success`, `rendez-vous.ts`), aucune régression. `npm run build` : vert, 87 pages statiques.

**Points signalés (non corrigés — décision business ou mécanique de vente)** :

- `/admin/licenses` : protection uniquement côté client (sessionStorage + mot de passe UI). Les routes API sous-jacentes (`/api/licenses*`) sont protégées par `x-admin-key` timing-safe. Le code lui-même indique "En V2 : remplacer par NextAuth" — risque limité mais connu, à traiter avant toute divulgation de l'URL admin.
- `/api/licenses/verify` : rate limiting absent (documenté comme "à implémenter en V2"), exposé publiquement sans brida.

## Session FORGE — Recette VERDICT (suite)

**23:20** — Reprise de session. Vérification visuelle post-build : PricingTable affichait encore les libellés EN sur `/fr/plugins/comments` malgré `"use client"`.

**23:25** — Diagnostic : `setRequestLocale(locale)` manquant dans le layout `[locale]` et la page `plugins/[slug]`. Sans cet appel next-intl v4, `getMessages()` utilisait le défaut de routing (`defaultLocale: "en"`). Fix : import + appel dans les deux fichiers.

**23:30** — `global-not-found.tsx` renommé depuis `not-found.tsx` (mauvais nom) : `experimental.globalNotFound: true` cherche le fichier `global-not-found` exactement. Build confirme `✓ globalNotFound`.

**23:40** — Vérifications visuelles production (`next start -p 3231`, desktop 1440 + mobile 375) :
- B1 : formulaire email inline "Adresse email / vous@exemple.fr / Procéder au paiement / Annuler", appel POST `/api/checkout` confirmé (503 attendu sans clés Stripe), textes FR corrects.
- B2 : aucun 500 en production.
- M1 : `/fr/cette-page-nexiste-pas` → page "Page introuvable" (dessin Journal Console, chrome du site). Plugin inexistant → `[locale]/not-found.tsx` correct.
- M2 : mention CGV visible au-dessus de la grille tarifaire (déjà correct dans le code depuis SENTINEL).
- M3 : menu burger mobile overlay plein écran, Escape ferme, focus rendu au bouton.
- M4 : carte `/fr/experimentations/carte` — état "prete", tuiles OpenFreeMap accessibles (200 sur pbf testé), features géographiques visibles (côte africaine confirmée au glissement).

**23:50** — Commits atomiques : `823b78c` (B1), `0d8d991` (M3), `2b2a13d` (M1 + favicon + setRequestLocale).

## HELM, clôture de session
- Relecture SENTINEL et recette VERDICT (NO-GO initial : paiement par fenêtre `prompt()`, 404 par défaut, menu mobile) corrigées puis contrôlées sur build de production en 1440 et 375.
- HELM : titres sans tiret cadratin, boutons « Démarrer un projet » vers isomorph.fr/contact, journaux serveur sans email ni clé, signatures IA retirées des messages de commit avant publication.
