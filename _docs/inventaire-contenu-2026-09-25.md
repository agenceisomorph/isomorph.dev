# Inventaire du contenu réel pour le nouveau site isomorph.dev

Document de recensement, lecture seule. Chaque ligne porte sa source (chemin de fichier, README, package.json, page npm ou dépôt GitHub). Aucune donnée n'est inventée : ce qui manque est noté « [À compléter, source ?] ».

Date du recensement : 25 septembre 2026.

---

## 1. Plugins

### 1.1 Vue d'ensemble des paquets publiés sous le scope npm `@isomorph-agency`

Confirmé par `npm search @isomorph-agency` (registre npmjs.org, interrogé le 25/09/2026) : quatre paquets scope, tous publiés par `florent@isomorph.fr` / mainteneur `isomorph-agency`, licence MIT.

| Paquet | Version publiée | Date de dernière publication | Rôle |
|---|---|---|---|
| `@isomorph-agency/strapi-plugin-link` | 0.1.1 | 21/07/2026 | Custom Field Strapi v5, champ lien universel |
| `@isomorph-agency/link-resolver` | 0.1.2 | 21/07/2026 | Resolver front (`resolveLink()`), sans dépendance à un framework |
| `@isomorph-agency/cookie-consent` | 1.1.0 | 11/08/2026 | Composants React / Next.js, bandeau et préférences RGPD |
| `@isomorph-agency/cookie-consent-shared` | 1.0.2 | 21/07/2026 | Schéma, validation et constantes partagés du paquet cookie-consent |

Sources : sortie `npm search @isomorph-agency --json` et `npm view <paquet> version time.modified` (25/09/2026).

Deux paquets supplémentaires, hors scope `@isomorph-agency` mais liés au même projet (registre npm public, nom déposé avant la création du scope) :

| Paquet | Version publiée | Rôle |
|---|---|---|
| `strapi-plugin-cookie-consent` | 1.0.4 (npm) / 1.0.5 (source locale, non republiée au 25/09) | Plugin serveur Strapi v5 de journalisation du consentement |
| `strapi-plugin-cookie-consent-v4` | 1.0.5 (npm) | Plugin serveur Strapi v4 de journalisation du consentement |

Source : `npm view strapi-plugin-cookie-consent version`, `npm view strapi-plugin-cookie-consent-v4 version` (25/09/2026) ; écart de version noté dans `/Users/faducase/ISOMORPH/cookie-consent/packages/strapi-v5/package.json` (1.0.4 publié, code local à 1.0.4 également au moment du contrôle, le CHANGELOG mentionnant 1.0.3 comme version antérieure).

Remarque : un paquet public tiers, sans lien avec ISOMORPH, porte le nom `strapi-plugin-comments` (v3.2.4 sur npm, éditeur distinct). Le plugin de commentaires ISOMORPH n'est **pas** publié sur npm sous ce nom ni sous un nom scope (`npm view @isomorph-agency/strapi-plugin-comments` renvoie 404 au 25/09/2026) : voir 1.4.

### 1.2 Plugin Link (Strapi v5, Custom Field)

| Champ | Valeur | Source |
|---|---|---|
| Nom | Custom Field « link », champ lien universel | `/Users/faducase/ISOMORPH/isomorph/src/lib/plugins/data.ts` (slug `link`) |
| Rôle en une phrase | Un seul champ Strapi pour tous les types de liens (contenu interne, page système, URL externe, téléphone, email, ancre), avec un JSON stable et un resolver front | `data.ts`, `tagline` |
| Statut | Publié sur npm (0.1.1 / 0.1.2), utilisé en production chez au moins un client agence (bf-prestige) et intégré au bootstrap standard de tout nouveau projet ISOMORPH | voir détail ci-dessous |
| Gratuit / payant | Gratuit (licence MIT) | `package.json` des dépôts, `LICENSE` |
| Lien npm | https://www.npmjs.com/package/@isomorph-agency/strapi-plugin-link et https://www.npmjs.com/package/@isomorph-agency/link-resolver | vérifié par `npm view` |
| Lien GitHub | Dépôt privé de développement `agenceisomorph/strapi-plugin-link` (mis à jour 21/07/2026) ; miroir public `agenceisomorph/strapi-plugin-link-v2`, description « Strapi v5 custom field: universal link picker… », mis à jour 25/07/2026 | `gh repo list agenceisomorph`, `gh repo view` |
| Version | Plugin 0.1.1, resolver 0.1.2 (npm) ; le code source du dépôt privé indiquait 0.1.0 au moment de la rédaction de `data.ts` (fiche du site actuel à mettre à jour) | `npm view`, comparaison avec `data.ts` ligne « softwareVersion: "0.1.0" » |
| Compatibilité | Strapi v5 (^5.0.0), Node.js ≥ 20, resolver front sans dépendance de framework (Next.js, Nuxt, Astro, etc.) | `data.ts`, README du miroir public `strapi-plugin-link-v2` |

Preuve de production chez un client : journal `/Users/faducase/ISOMORPH/bf-prestige/tasks/journal-2026-07-21-feat-strapi-plugin-link.md` : publication npm le 21/07/2026 puis installation et activation sur le projet client `bf-prestige` (PR https://github.com/agenceisomorph/bf-prestige/pull/8), plus intégration dans le template `_templates/morphin-pro` (PR https://github.com/agenceisomorph/morphin-pro/pull/3).

Preuve d'intégration au bootstrap standard : `/Users/faducase/ISOMORPH/CLAUDE.md` ligne 64, « Plugins installés d'office par le bootstrap (`init_strapi`, template `plugins.ts`), à ne pas réinventer : (…) `@isomorph-agency/strapi-plugin-link` (…) ; `@isomorph-agency/link-resolver` côté front ». Le repo local `~/ISOMORPH/strapi-plugin-link` cité dans ce fichier et dans `HANDOFF.md`/`INTEGRATION-FRANCEECOLOGIS.md` (`_archives/strapi-plugin-link-docs-internes/`) n'existe plus sur le disque au 25/09/2026 (recherche `find` négative) : le code de référence est désormais le dépôt GitHub, pas un dossier local.

Autres traces d'essai identifiées mais sans conclusion documentée dans le journal : `franceecologis/tasks/journal-2026-06-08-feat-test-strapi-plugin-link.md` (fichier de contexte de session vide, aucune trace d'avancement notée).

### 1.3 Plugin Cookie Consent (React + Strapi v4/v5)

| Champ | Valeur | Source |
|---|---|---|
| Nom | Cookie Consent : consentement cookies RGPD | `data.ts` (slug `cookie-consent`), README `/Users/faducase/ISOMORPH/cookie-consent/README.md` |
| Rôle en une phrase | Bandeau et fenêtre de préférences React + plugin Strapi de journalisation du consentement, avec Google Consent Mode V2, conformité CNIL et accessibilité WCAG 2.1 AA | `README.md`, `data.ts` |
| Statut | Publié sur npm (3 paquets + 1 paquet partagé), open source, dépôt GitHub public | `gh repo view agenceisomorph/cookie-consent` → `visibility: PUBLIC` |
| Gratuit / payant | Gratuit, licence MIT, positionné explicitement comme alternative gratuite aux SaaS payants (Axeptio, Cookiebot, OneTrust) | `README.md` §« Why this project? » |
| Lien npm | `@isomorph-agency/cookie-consent`, `strapi-plugin-cookie-consent`, `strapi-plugin-cookie-consent-v4`, `@isomorph-agency/cookie-consent-shared` | `npm view` (25/09/2026) |
| Lien GitHub | https://github.com/agenceisomorph/cookie-consent (public) | `gh repo view` |
| Version | React 1.1.0 (11/08/2026), Strapi v5 1.0.4 (npm) / v4 1.0.5 (npm), shared 1.0.2 | `npm view`, `package.json` locaux |
| Compatibilité | React 18+, Next.js App Router, Strapi v5 (^5.0.0) via `strapi-plugin-cookie-consent`, Strapi v4 (^4.0.0) via `strapi-plugin-cookie-consent-v4` | `data.ts`, README |

Historique de version notable, utile pour une page changelog : `CHANGELOG.md` du monorepo : 1.1.0 (11/08/2026, hook `useConsentOptional`), 1.0.4 (11/07/2026, entrée serveur `/server` pour React Server Components, README embarqué sur npm à la demande du Strapi Market du 13/04/2026).

### 1.4 Plugin de commentaires Strapi (vendu sur isomorph.dev)

| Champ | Valeur | Source |
|---|---|---|
| Nom | Comments (Strapi v5) | `data.ts` (slug `comments`) |
| Rôle en une phrase | Système de commentaires complet pour Strapi v5 : fils de discussion, panneau de modération, signalements, filtre anti-injures, reCAPTCHA v3, rate limiting | `data.ts` |
| Statut | Code source public sur GitHub depuis le 25/07/2026, **non publié sur npm** (`npm view @isomorph-agency/strapi-plugin-comments` → 404 au 25/09/2026) ; marqué `available: false` (brouillon / à paraître) dans le code du site actuel `isomorph.dev` | `data.ts` ligne `available: false`, `gh repo view agenceisomorph/strapi-plugin-comments`, `npm view` |
| Gratuit / payant | Modèle freemium : palier Community gratuit + paliers payants Pro / Multi-sites / Enterprise | grille tarifaire ci-dessous, `data.ts` export `COMMENTS_PRICING` |
| Lien GitHub | https://github.com/agenceisomorph/strapi-plugin-comments (public), description « The most complete comment system for Strapi V5 : moderation, admin panel, reports, anti-profanity, reCAPTCHA, rate limiting, likes, pinning & freemium licensing. » | `gh repo view` |
| Version | 1.0.0 (`package.json` du dépôt, nom interne `@isomorph-agency/strapi-plugin-comments`) ; `data.ts` du site vitrine indique `softwareVersion: "1.0.0"` | `gh api repos/agenceisomorph/strapi-plugin-comments/contents/package.json` |
| Compatibilité | Strapi v5 (^5.0.0), front libre (React, Vue, Angular, Svelte, Next.js, Nuxt, Astro ou tout client HTTP) | `data.ts` |

Grille tarifaire validée le 12/07/2026, promo de lancement carte Pro à 49 € la première année (prix barré 79 €) : source `data.ts`, commentaire « Grille tarifaire comments validée le 12/07/2026 » :

| Palier | Prix | Contenu |
|---|---|---|
| Community (gratuit, hors tableau `COMMENTS_PRICING` mais cité dans `src/messages/fr.json` de isomorph.dev) | 0 € | Fonctionnalités de base, support GitHub Issues |
| Pro | 79 € (49 € prix de lancement) | Store Redis multi-instances, dictionnaires anti-injures personnalisés, notifications email, webhooks de modération, avatars personnalisés |
| Multi-sites | 199 € | Fonctionnalités Pro sous licence multi-sites |
| Enterprise | 349 € | Fonctionnalités Pro, support prioritaire SLA 24h, panneau d'administration en marque blanche, SLA personnalisé |

Infrastructure commerciale déjà en place sur le site actuel `isomorph.dev` (Next.js 15, Stripe compte ISOMORPH `acct_1GG00RBFAH8GRSu1` en LIVE) : tunnel de licence complet (génération de clé, webhook Stripe, envoi d'email via Scaleway TEM, vérification de domaine par palier). Source : `/Users/faducase/ISOMORPH/isomorph.dev/CLAUDE.md`.

Note pour le nouveau site : le dossier de développement local du plugin (`~/ISOMORPH/strapi-plugin-comments-v5`) n'existe plus que sous forme d'archive de session Claude Code (`/Users/faducase/.claude/projects-archive-20260825/-Users-faducase-ISOMORPH-strapi-plugin-comments-v5`), sans contenu de projet exploitable ; le code de référence est le dépôt GitHub public.

### 1.5 Applications Shopify (« plugins » au sens large, pages `/plugins/...` du site agence)

Ces deux applications sont recensées sous `/Users/faducase/ISOMORPH/isomorph/src/app/(fr)/plugins/` et `src/lib/plugins/shopify-apps.ts`, mais restent des applications privées propres à l'agence (pas de distribution publique ni de fiche npm).

| Nom | Statut | Rôle en une phrase | Gratuit/payant | Source |
|---|---|---|---|---|
| Point relais | « En pilote » | Choix d'un point relais Chronopost Shop2Shop dans le panier avant paiement, sur tous les forfaits Shopify (Basic inclus) | [À compléter, source ?] : aucun prix mentionné dans le code consulté | `shopify-apps.ts`, `/Users/faducase/ISOMORPH/shopify-point-relais/README.md` |
| Morphin SEO (nom commercial visé : « ISOMORPH SEO ») | « En développement » | Lit les données Search Console et le catalogue de la boutique, propose des sujets d'articles de blog, rédige et publie après validation du marchand | [À compléter, source ?] : modèle de facturation par abonnement mentionné (« seuil d'environ cent boutiques abonnées ») mais grille tarifaire non fixée | `shopify-apps.ts`, `/Users/faducase/ISOMORPH/morphin-seo-shopify/CLAUDE.md` |

Précisions Morphin SEO / ISOMORPH SEO (source `/Users/faducase/ISOMORPH/morphin-seo-shopify/CLAUDE.md`, état au 07-10/09/2026) :
- Dépôt GitHub `agenceisomorph/morphin-seo-shopify`, **privé**.
- Application Shopify créée le 07/09/2026, identifiant `420289609729`. **Aucun mode de distribution sélectionné** (donc pas de place de marché possible pour l'instant sans décision explicite).
- Étape 1 actée : pilote privé sur une seule boutique (O'Caou) ; étape 2 : ouverture publique, sans date fixée.
- Nom renommé de « Morphin SEO » à « ISOMORPH SEO » par décision de Florent le 09/09/2026 ; antériorité de marque à vérifier avant tout dépôt.
- Documentation technique interne publiée sur `shopify.isomorph.dev` (accès restreint `@isomorph.fr`), dépôt `agenceisomorph/docs-shopify` (Next.js + Fumadocs).

Point relais (source `/Users/faducase/ISOMORPH/shopify-point-relais/README.md` et `package.json`) : dépôt `agenceisomorph/shopify-point-relais`, privé, version `0.1.0`, décrit comme « Théme App Extension Shopify : sélection de point relais Chronopost Shop2Shop avant paiement. Pilote O'Caou, logisticien Mistral Services. » Fonctionne sur tous les forfaits Shopify (contrairement aux solutions concurrentes qui exigent Shopify Plus). Le repo est privé : à ne publier sur le mini-site que sous forme de cas client / capacité technique, pas de lien GitHub public.

### 1.6 Ce qui n'a pas été trouvé

- Aucun dossier `strapi-plugin-link` ni `strapi-plugin-comments-v5` en local sous `/Users/faducase/ISOMORPH` (dossiers supprimés ; sources de remplacement : dépôts GitHub et `data.ts`).
- Aucun paquet npm supplémentaire sous `@isomorph-agency` autre que les quatre listés en 1.1 (recherche `npm search` du 25/09/2026, résultat exhaustif à cette date).

---

## 2. Code (outils et paquets réutilisables)

| Nom | Public / interne | Rôle | Source |
|---|---|---|---|
| `@isomorph-agency/strapi-plugin-link` + `@isomorph-agency/link-resolver` | Public (npm + GitHub) | Voir 1.2 | voir 1.2 |
| `@isomorph-agency/cookie-consent` (+ `-shared`, `strapi-plugin-cookie-consent`, `strapi-plugin-cookie-consent-v4`) | Public (npm + GitHub) | Voir 1.3 | voir 1.3 |
| `strapi-plugin-comments` | Public sur GitHub, pas encore sur npm | Voir 1.4 | voir 1.4 |
| `deploy-gate` (`_scripts/deploy-gate/gate.py`, `gate-parc.sh`, `adopt-site.sh`, `sync-infra.sh`, `sync-repo.sh`, `automerge-decide.py`) | Interne uniquement | Suite de vérifications runtime post-déploiement : contrôle l'URL réellement déployée (preview ou prod), bloque la promotion en CI si une exigence bloquante échoue, alerte par email (Scaleway TEM), gère l'héritage de configuration par socle (`extends: _socle-morphin`) | En-tête de `/Users/faducase/ISOMORPH/_scripts/deploy-gate/gate.py` |
| `bootstrap-projet.sh` / `bootstrap-from-clone.sh` | Interne uniquement | Bootstrap complet d'un nouveau projet ISOMORPH (Next.js + Strapi v5) : préflight, structure locale, GitHub, Vercel, Sentry (2 projets + DSN), checklist manuelle DNS/reCAPTCHA/GTM-GA4 | En-tête de `/Users/faducase/ISOMORPH/_scripts/bootstrap-projet.sh` |
| `morphin-ui` (`@agenceisomorph/morphin-ui`) | Interne (dépôt GitHub privé, `license: "UNLICENSED"`) | Composants React versionnés du thème parent du parc de sites MORPHIN | `/Users/faducase/ISOMORPH/morphin-ui/package.json` |
| `isomorph-infra` | Interne | Infrastructure-as-code et outillage d'exploitation ISOMORPH sur Scaleway, décrit comme « Socle agence IA self-managed » | Description du dépôt GitHub `agenceisomorph/isomorph-infra` (`gh repo list`) |
| `veille-serverless` (`veille.py`, `veille_legale.py`, `sources.yaml`) | Interne | Génère la newsletter hebdomadaire de veille technologique CEO (email) + un fichier markdown technique détaillé pour les agents | En-tête de `/Users/faducase/ISOMORPH/veille-serverless/veille.py` |

Remarques :
- `strapi-plugin-link-v2` (public sur GitHub) est un miroir de publication du même code que `strapi-plugin-link` (privé) : à ne présenter qu'une fois sur le mini-site, en pointant vers le dépôt public.
- Aucun outil confidentiel (clé, nom de client hors contexte public) n'est inclus dans ce tableau. Les scripts de `deploy-gate/sites/` contiennent des configurations par site client et ne doivent pas être publiés tels quels.

---

## 3. Expérimentations (démonstrations visuelles et techniques)

Toutes situées sous `/Users/faducase/ISOMORPH/isomorph/src/components/` (dépôt du site agence `isomorph.fr`, projet Next.js). Technologie commune : React 19 + Next.js, `@react-three/fiber` (^9.2.0) et `three` (^0.178.0) pour les scènes 3D (source : `/Users/faducase/ISOMORPH/isomorph/package.json`).

| Nom | Ce que ça montre | Technologie | Statut | Fichier source |
|---|---|---|---|---|
| Hero « Carte mère » | Vol rapide à basse altitude au-dessus d'une carte mère procédurale animée, puis atterrissage sur la puce principale | React Three Fiber (three.js), shaders inline | Prototype, accessible en atelier (`/atelier/console/heros/carte-mere`), pas sur la page d'accueil en production | `hero-demarrage/carte-mere/HeroCarteMere.tsx`, `CarteMereToile.tsx`, `reseau.ts` |
| Hero « Cœur quantique » | Cœur pulsant entouré de particules et d'arcs électriques (registre « circuit vivant ») | React Three Fiber, particules `BufferAttribute`, blending additif, textures canvas (aucun fetch réseau) | Prototype, atelier (`/atelier/console/heros/coeur-quantique`) | `hero-demarrage/coeur-quantique/HeroCoeurQuantique.tsx`, `SceneCoeurQuantique.tsx` |
| Hero « Montagnes russes » | Impulsion électrique parcourant un rail (`CatmullRomCurve3`) depuis une piste cuivre jusqu'au cœur d'un réseau neuronal, puis vue d'ensemble en orbite lente | React Three Fiber, courbes Catmull-Rom, réseau de nœuds animé | Prototype, atelier (`/atelier/console/heros/montagnes-russes`) | `hero-demarrage/montagnes-russes/HeroMontagnesRusses.tsx`, `SceneMontagnesRusses.tsx` |
| Hero « Terminal » | Écran cathodique qui s'allume, défilé hexadécimal, barres vertes puis journal de commandes | Canvas 2D pur (pas de bibliothèque 3D), 12 images/seconde | Prototype, atelier (`/atelier/console/heros/terminal`) | `hero-demarrage/terminal/HeroTerminal.tsx` |
| Hero « Tunnel de données » | Filaments et cible de calibrage en tunnel, puis émergence d'un réseau neuronal en rotation lente | React Three Fiber | Prototype, code présent mais aucune route d'atelier ne l'importe au 25/09/2026 (à vérifier avant publication) | `hero-demarrage/tunnel/HeroTunnel.tsx`, `SceneTunnel.tsx` |
| Hero « Console » | Titre à gauche, console de verre à droite façon interface de film (« Oblivion »), grille de points, orbites en CSS pur | CSS uniquement, aucun script, rendu SSR = rendu final | **Production** : hero actuellement utilisé sur la page d'accueil `isomorph.fr` (`AccueilConsole.tsx`) | `hero-console/HeroConsole.tsx` |
| Globe (Console) | Globe terrestre en semis de points avec repère de Toulon relié à un point hors du globe, habillage d'instrument (graduations, étiquettes) | Server Component pour l'habillage + îlot client WebGL (three.js) chargé à l'approche du bloc | Utilisé dans le système de composants « Console » du site agence | `console/globe/Globe.tsx`, `GlobeScene.tsx`, `geometrie.ts`, `moteur.ts` |
| Carte (Console) | Carte géographique stylisée (thème « Snazzy »), avec chargeur et surcouche animée | MapLibre GL (`maplibre-css.d.ts`, `theme-snazzy.json`) | Utilisé dans le système « Console » | `console/carte/CarteGeo.tsx`, `StylesCarte.tsx`, `Surcouche.tsx` |
| Décors d'instruments (radar, oscilloscope, jauge, viseur, cadran, engrenage, pulsation, orbites) | Bibliothèque de petits widgets animés façon tableau de bord/cockpit, réemployés dans plusieurs sections du site | CSS/SVG, composants React légers | Système de composants actif (« Console ») | `console/decors/*.tsx` |
| Jeu de la Lune / Astronaute | Mini-jeu caché : une réserve d'oxygène (`CapsuleOxygene`) est posée sur six pages du site (position déterministe, pas aléatoire), un astronaute pouvait auparavant la récupérer | Composant `Astronaute.tsx` en React Three Fiber (existait), image WebP 9 ko pour la capsule | **Retiré** : `Astronaute.tsx` a été supprimé du dépôt dans le commit `dbc0bd9` (« refactor(site): tout le site sur le système Console, ancien système retiré »). Seule la capsule d'oxygène (`CapsuleOxygene`, montée globalement par `ClientProviders.tsx`) subsiste au 25/09/2026 | `hero-connecte/CapsuleOxygene.tsx`, `hero-connecte/oxygene.ts` ; suppression tracée par `git log --diff-filter=D -- "**/Astronaute.tsx"` |
| Hero v3 « Base lunaire » (projet non codé) | Proposition de refonte : décor de base lunaire, sept modules pour les sept métiers de l'agence, bulle courte, départ en vaisseau puis mode mission | Non implémenté au 25/09/2026, au stade de document de conception | [À compléter, source ?] : voir le document de cadrage cité ci-dessous | `/Users/faducase/ISOMORPH/isomorph/tasks/journal-2026-09-21-hero-v3-base-lunaire.md`, document détaillé `_docs/hero-v3-base-lunaire-2026-09-21.md` (non lu en détail dans ce recensement) |

Remarque méthodologique : les cinq heros 3D (carte mère, cœur quantique, montagnes russes, terminal, tunnel) sont regroupés dans une page playground `/atelier/console/heros/` du site agence : ce sont des démonstrations techniques comparées entre elles, pas des heros mis en concurrence sur le site public actuellement en ligne (qui utilise le Hero Console, tout en CSS).

---

## 4. Veille techno code

Sources : `/Users/faducase/ISOMORPH/_docs/veille/` (veille quotidienne stack + hebdomadaire SEO/conformité), `/Users/faducase/ISOMORPH/veille-serverless/` (script de génération), `/Users/faducase/ISOMORPH/_docs/notes/` (notes d'approfondissement thématiques).

### 4.1 Veille technique quotidienne (« stack »)

- Format : un fichier markdown par jour, nommé `AAAA-MM-JJ.md`, sous `_docs/veille/`. Structure fixe observée dans `2026-09-21.md` : bandeau de statut (✅ rien de neuf / sinon liste), tableau « Sources contrôlées » avec date de dernière publication par flux (Anthropic News, Claude Code releases, Vercel Changelog, Strapi Blog, Strapi Releases), puis trois niveaux « 🔴 À action immédiate / 🟡 À surveiller / 🟢 Bon à savoir », et une section « Impact sur les agents ISOMORPH » (skills à mettre à jour ou non).
- Fréquence : proche du quotidien sur la période observée (27 fichiers entre le 15/06/2026 et le 21/09/2026, avec des jours sans publication notable non systématiquement générés).
- Dernière édition trouvée : `2026-09-21.md`.
- Généré par le script `/Users/faducase/ISOMORPH/veille-serverless/veille.py`, dont l'en-tête indique : « Veille ISOMORPH : Newsletter hebdomadaire CEO (lundi 8h). Double sortie : 1. Email newsletter CEO : filtré, vulgarisé, actionnable ; 2. Fichier .md technique : détail complet pour les agents ISOMORPH. » Les sources sont déclarées dans `sources.yaml`, taggées par audience (`ceo` ou `agents`).
- Publiable : oui a priori, contenu 100 % public (releases de fournisseurs tiers, RSS publics), sous réserve de retirer toute mention interne (noms d'agents, de skills) si le mini-site vise un public externe.

### 4.2 Veille hebdomadaire SEO et conformité (« Abondance »)

- Format : un fichier par semaine ISO, nommé `abondance-AAAA-Wss.md`. Structure observée dans `abondance-2026-W39.md` : tableau des référentiels stables (RGAA, WCAG, OWASP Top 10, OWASP ASVS, CNIL, exigences expéditeurs Gmail, PCI DSS) avec version en vigueur et « à venir », puis une section « Veille SEO : Abondance » avec les mêmes niveaux 🔴/🟡/🟢.
- Fréquence : hebdomadaire, 8 fichiers trouvés (semaines W30 à W39, avec des semaines manquantes : W35 et W37 absentes des fichiers listés).
- Dernière édition trouvée : `abondance-2026-W39.md` (21/09/2026).
- Contenu entièrement public (versions de référentiels officiels, annonces Google/Search Console) : publiable en l'état, sous réserve de vérifier qu'aucun exemple client n'apparaît dans les sections non lues en détail dans ce recensement.

### 4.3 Notes d'approfondissement thématiques

- Dossier `/Users/faducase/ISOMORPH/_docs/notes/`, organisé par thème (`cms-souverain`, `strapi`, `secops`, `nextjs`, `devops`, `design`, `marketing`, `seo-sea`, `vercel-platform`, `prospection`, `business`, `ia-claude`), chaque thème ayant son propre `INDEX.md` le cas échéant.
- Exemple de dossier complet : `cms-souverain/`, neuf notes datées et attribuées à un agent (NEXUS, LEGAL, PRISM, SCOPE, BLUEPRINT), plus un `INDEX.md` : structure type d'une étude multi-agents sur un sujet de veille approfondi.
- Notes isolées identifiées : `secops/2026-06-03-strapi-cve-audit-procedure.md`, `strapi/2026-06-03-mcp-better-auth-cve.md`, `prospection/2026-05-30-etude-marche-scraping-contact.md`, `prospection/2026-08-03-prospection-linkedin-claude.md`.
- Publiable : à évaluer note par note (non lues en détail dans ce recensement) ; probable présence d'éléments de stratégie commerciale interne dans `business/` et `prospection/`, à exclure du mini-site public. [À compléter, source ? : lecture détaillée de chaque note nécessaire avant publication]

### 4.4 Ce qui manque pour ce recensement

- Contenu détaillé des notes individuelles de `_docs/notes/` (hors `cms-souverain/`) : non lu, seule l'arborescence a été vérifiée.
- Confirmation qu'aucune veille ne mentionne de nom de client en clair dans les sections 🔴/🟡/🟢 : non vérifiée exhaustivement, seuls deux fichiers (un quotidien, un hebdomadaire) ont été lus intégralement.
