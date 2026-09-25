# Pages légales isomorph.dev : synthèse LEGAL du 25 septembre 2026

**[INTERNE. À NE PAS DIFFUSER]**

Trois textes livrés dans ce dossier : `mentions-legales.md`, `politique-confidentialite.md`, `cgv-licences.md`. Base reprise des pages d'isomorph.fr (`isomorph/src/lib/legal/data.ts`, livrable du 24/09/2026), adaptée à ce que fait réellement le code d'isomorph.dev.

## Ce qui bloque la mise en vente

1. **Vente ouverte aux particuliers.** Rien dans le tunnel ne réserve l'achat aux professionnels. Un acheteur consommateur garde son droit de rétractation de 14 jours tant que le tunnel ne recueille pas sa renonciation expresse (case à cocher avant paiement, confirmation par courriel). Depuis le 19/06/2026, il faut aussi un bouton « renoncer au contrat ici » (L. 221-21, D. 221-5), une résiliation en ligne (L. 215-1-1), un rappel avant chaque renouvellement (L. 215-1) et un médiateur désigné (L. 612-1). Rien de cela n'existe. **Recommandation : réserver la vente aux professionnels** (case « J'achète pour mon activité professionnelle » et nom de la société au paiement). L'article 18 des CGV se supprime alors, avec l'annexe. Sinon, quatre développements et une adhésion à un médiateur sont nécessaires avant la première vente.
2. **Téléphone.** Obligatoire dans les mentions légales (LCEN art. 1er-1 I 2°) et pour la vente en ligne (LCEN art. 19, 2°). Toujours absent, comme sur isomorph.fr.
3. **Prix HT ou TTC.** Stripe n'applique aucune taxe et ne demande pas de numéro de TVA. L'article 19 de la LCEN exige d'indiquer si les taxes sont incluses. À traiter avec FISCAL (TVA sur services électroniques vendus à l'étranger, guichet unique OSS pour les particuliers de l'UE, autoliquidation pour les entreprises de l'UE).

## Questions pour Florent

1. La vente est-elle réservée aux professionnels (recommandé) ou ouverte aux particuliers ?
2. Quel numéro de téléphone publier pour ISOMORPH ?
3. Les prix de la page d'offre (49 €, 79 €, 199 €, 349 €) sont-ils HT ou TTC ?
4. Le prix de 79 € a-t-il déjà été réellement pratiqué ? Sinon, afficher 79 € barré à côté de 49 € est une réduction trompeuse envers les particuliers : le prix barré doit être le plus bas pratiqué dans les 30 jours précédents (C. conso L. 112-1-1). Le prix de lancement vaut-il pour la première année seulement, ou à vie pour les premiers clients ? Le prix Stripe actuel (49 €/an) se renouvelle à 49 € tant qu'il n'est pas changé.
5. Comment un client résilie-t-il ? Aucun portail client Stripe n'est branché. Proposition : activer le portail client Stripe (résiliation en deux clics) ; à défaut, une adresse dédiée.
6. Quelle adresse publier pour les clients : contact@isomorph.fr (pied de page actuel) ou support@isomorph.fr (expéditeur des clés) ? Les textes utilisent contact@isomorph.fr.
7. Comment les factures sont-elles émises : factures Stripe ou Pennylane ? L'article 7 des CGV attend la réponse.
8. Les CGV doivent-elles exister en anglais ? Le site est en anglais par défaut (`defaultLocale: "en"`) et vise des développeurs étrangers. La version française reste obligatoire (C. civ. 1127-1, 3°).
9. Le code de l'extension Comments est public sous licence MIT (dépôt `agenceisomorph/strapi-plugin-comments`, fichier LICENSE vérifié le 25/09/2026), y compris le contrôle de licence. Juridiquement, n'importe qui peut donc retirer ce contrôle et utiliser les fonctions Pro sans payer. Les CGV vendent l'accès aux fonctions et à l'assistance, sans prétendre à une licence propriétaire. Faut-il passer les fonctions Pro sous licence commerciale (double licence) ? C'est un choix de modèle économique, pas une correction de texte.
10. Un « site » correspond-il bien à un nom de domaine ? C'est ce que compte le code (hôte de `server.url` côté extension), et c'est la définition retenue à l'article 3.
11. Le changement de domaine se fait-il sur demande ? Le code ne permet pas au client de libérer un domaine lui-même. L'article 10 prévoit une demande par courriel.

## Constats techniques (code lu le 25/09/2026)

- **Aucune mesure d'audience, aucun Sentry, aucun cookie tiers** : aucune dépendance ni script correspondant (`package.json`, `src/`). Le CLAUDE.md prévoit Google Analytics ou Vercel Analytics : leur ajout imposerait un bandeau de consentement et une mise à jour de la politique.
- **Cookie `NEXT_LOCALE`** (next-intl 4.8.3, `middleware/syncCookie.js`) : cookie de session, déposé seulement si la langue choisie diffère de celle du navigateur. Exempté de consentement (loi 78-17 art. 82, 2°).
- **Stockage local `isomorph-atelier-console-police-titres`** (`console/identite/ModulePolice.tsx`) : écrit au choix d'une police dans l'atelier. Exempté au même titre.
- **Carte OpenFreeMap** (`console/carte/style.ts`, `tiles.openfreemap.org`) : l'adresse IP du visiteur atteint Hyperknot Software Kft. (Hongrie). La CSP actuelle de `next.config.ts` n'autorise pas ce domaine : en l'état la carte ne se charge pas. Si la carte quitte le site publié, retirer le paragraphe correspondant.
- **Journaux Vercel** : le webhook écrit l'adresse électronique et la clé en clair (`console.log`, `webhooks/stripe/route.ts`). Déclaré dans la politique. Recommandation SHIELD : masquer l'adresse et la clé dans ces journaux.
- **Région Vercel** : aucune région fixée (`vercel.json` absent, aucun `preferredRegion`). Si les fonctions s'exécutent aux États-Unis, l'adresse électronique y transite : relever la région dans la console ou fixer `cdg1`.
- **Stripe comme base des licences** : clé, domaines, adresse électronique et date de vérification sont stockés dans les métadonnées de l'abonnement Stripe (`src/lib/license.ts`).
- **Vérification** : l'extension interroge `isomorph.dev/api/licenses/verify` toutes les 12 heures, avec un délai de grâce de 7 jours (`server/src/services/license.ts` du dépôt public). Les CGV ne figent pas ces valeurs.
- **Entité Stripe** : le DPA de Stripe désigne Stripe Payments Europe, Limited pour les comptes situés hors des Amériques (adresse relevée sur l'imprint stripe.com). Vérifier dans le tableau de bord Stripe l'entité contractante réelle du compte `acct_1GG00RBFAH8GRSu1`.

## Identité de l'éditeur (API Recherche d'entreprises, données Sirene et RNE, 25/09/2026)

| Donnée | Valeur | Source |
|---|---|---|
| Dénomination | ISOMORPH | Sirene |
| Catégorie juridique | 5499, SARL | Sirene |
| Siège | 58 rue de Monceau, 75008 Paris (complément CS 48756, 75380 Paris Cedex 08) | Sirene, établissement 881 258 792 00038, actif |
| Établissements | 3 au total, 1 seul ouvert (le siège) | Sirene |
| Gérant | Florent-Alexis Ducase | RNE, mis à jour le 22/07/2026 |
| Capital | 500 € | Absent des API publiques, repris d'isomorph.fr (donnée fournie par Florent le 30/07/2026) |
| TVA intracommunautaire | FR66 881 258 792 | Clé recalculée depuis le SIREN : 66, conforme |

Aucun établissement toulonnais n'est ouvert au registre. Les mentions n'en parlent donc pas. La formule « implantée à Toulon » reste réservée aux textes de présentation.

## Textes vérifiés sur Légifrance (API PISTE, 25/09/2026)

| Référence | LEGIARTI | État | Usage |
|---|---|---|---|
| LCEN art. 1er-1 | LEGIARTI000049568614 | VIGUEUR | Contenu des mentions légales |
| LCEN art. 1er-2 | LEGIARTI000049568616 | VIGUEUR | Sanctions : 1 an, 75 000 € |
| LCEN art. 19 | LEGIARTI000032236011 | ABROGE_DIFF au 01/01/2027 | Informations du vendeur en ligne, affichage des taxes |
| LCEN art. 19, version 2027 | LEGIARTI000053151918 | VIGUEUR_DIFF | Reprend les mêmes obligations (ordonnance n° 2025-1247 du 17/12/2025, art. 43) |
| Loi 78-17 art. 82 | LEGIARTI000037813978 | VIGUEUR | Exemption des cookies strictement nécessaires |
| C. conso art. liminaire | LEGIARTI000049464063 | VIGUEUR | Définition du consommateur |
| C. conso L. 112-1-1 | LEGIARTI000044549592 | VIGUEUR | Prix barré |
| C. conso L. 211-1 | LEGIARTI000032227013 | VIGUEUR | Clauses claires, interprétation favorable |
| C. conso L. 212-1 | LEGIARTI000032890812 | VIGUEUR | Clauses abusives |
| C. conso L. 215-1 | LEGIARTI000046194176 | VIGUEUR | Rappel avant reconduction |
| C. conso L. 215-1-1 | LEGIARTI000046190107 | VIGUEUR | Résiliation en ligne |
| C. conso L. 215-3 | LEGIARTI000032226976 | VIGUEUR | Extension aux non-professionnels |
| C. conso L. 221-3 | LEGIARTI000032226882 | VIGUEUR | Extension aux petits professionnels limitée au hors établissement : sans effet ici |
| C. conso L. 221-5 | LEGIARTI000053310511 | VIGUEUR depuis le 19/06/2026 | Information précontractuelle, dont fonctionnalité de rétractation |
| C. conso L. 221-13 | LEGIARTI000044563210 | VIGUEUR | Confirmation sur support durable |
| C. conso L. 221-14 | LEGIARTI000032226854 | VIGUEUR | Bouton de commande avec obligation de paiement |
| C. conso L. 221-18 | LEGIARTI000032226842 | VIGUEUR | Rétractation 14 jours |
| C. conso L. 221-21 | LEGIARTI000053310520 | VIGUEUR depuis le 19/06/2026 | Fonctionnalité de rétractation en ligne |
| C. conso D. 221-5 | LEGIARTI000053303365 | VIGUEUR depuis le 19/06/2026 | Libellés « renoncer au contrat ici », « confirmer la rétractation » |
| C. conso L. 221-24 | LEGIARTI000032226828 | VIGUEUR | Remboursement sous 14 jours |
| C. conso L. 221-25 | LEGIARTI000044563179 | VIGUEUR | Exécution avant la fin du délai |
| C. conso L. 221-28, 13° | LEGIARTI000044563170 | VIGUEUR | Perte de la rétractation pour contenu numérique |
| C. conso R. 221-1 et annexe | LEGIARTI000045418603, LEGIARTI000045418600 | VIGUEUR | Formulaire type de rétractation |
| C. conso L. 224-25-12, -14, -17, -20 | LEGIARTI000044132956, 044132967, 044133032, 044133068 | VIGUEUR | Conformité des contenus numériques |
| C. conso L. 612-1, L. 616-1 | LEGIARTI000032224805, LEGIARTI000032224762 | VIGUEUR | Médiation de la consommation |
| C. conso R. 631-3 | LEGIARTI000032808504 | VIGUEUR | Tribunal au choix du consommateur |
| C. civ. 1119 | LEGIARTI000032040866 | VIGUEUR | Opposabilité des conditions générales |
| C. civ. 1127-1 | LEGIARTI000032007504 | VIGUEUR | Étapes de la commande en ligne, langue française |
| C. civ. 1170, 1171 | LEGIARTI000032041115, LEGIARTI000036829836 | VIGUEUR | Limites des clauses limitatives |
| C. civ. 1218 | LEGIARTI000032041431 | VIGUEUR | Force majeure |
| C. civ. 1231-3 | LEGIARTI000032010127 | VIGUEUR | Dommages prévisibles, faute lourde |
| C. civ. 2224 | LEGIARTI000019017112 | VIGUEUR | Prescription de cinq ans |
| C. com. L. 110-4 | LEGIARTI000027725867 | VIGUEUR | Prescription commerciale de cinq ans |
| C. com. L. 123-22 | LEGIARTI000006219327 | VIGUEUR | Pièces comptables : dix ans |
| C. com. L. 441-1 | LEGIARTI000038414469 | VIGUEUR | Contenu des CGV entre professionnels |
| C. com. L. 441-10 | LEGIARTI000038414392 | ABROGE_DIFF au 01/01/2027 | Pénalités de retard ; version 2027 (LEGIARTI000054567689) identique sur ce point |
| C. com. D. 441-5 | LEGIARTI000043197457 | VIGUEUR | Indemnité de 40 € |
| CPI L. 122-6, L. 122-6-1 | LEGIARTI000006278919, LEGIARTI000044365559 | VIGUEUR | Droits sur le logiciel |
| CPC art. 42, 48 | LEGIARTI000006410140, LEGIARTI000006410147 | VIGUEUR | Clause attributive entre commerçants seulement, très apparente |

Hors Légifrance : règlement (UE) 2024/3228 (EUR-Lex), qui a supprimé la plateforme européenne de règlement en ligne des litiges au 20/07/2025. Les CGV n'y renvoient donc pas, contrairement à la checklist CGV BtoC de l'agent, à corriger. DPA Stripe (stripe.com/fr/legal/dpa) et politique de confidentialité d'OpenFreeMap (openfreemap.org/privacy), consultés le 25/09/2026.

## Points de vigilance

- **Clause attributive de juridiction** (article 19 des CGV) : valable seulement entre commerçants. Contre un client libéral ou une association, elle est réputée non écrite ; le droit commun s'applique alors, sans autre conséquence. Elle est en gras : la condition « très apparente » doit aussi être tenue à l'écran.
- **Lien vers les CGV au paiement** : l'acceptation doit précéder le paiement (C. civ. 1119). Le tunnel actuel n'affiche aucun lien vers les CGV avant la redirection vers Stripe. Stripe Checkout permet d'exiger l'acceptation des conditions (`consent_collection.terms_of_service`) : à brancher.
- **Liens du pied de page** : ni mentions légales, ni politique de confidentialité, ni CGV ne sont liées aujourd'hui (`Footer.tsx`). Les textes supposent les adresses `/mentions-legales`, `/politique-confidentialite` et `/cgv`.
- **Durées de conservation annoncées** (5 ans après l'abonnement, 3 ans pour les demandes sans suite) : à appliquer réellement dans Stripe et la messagerie, sinon manquement à l'article 5.1.e du RGPD.
- **Registre des traitements** : quatre traitements à y ajouter (art. 30 RGPD).
- **Constat en ligne** : à refaire après mise en ligne (absence de `Set-Cookie` hors `NEXT_LOCALE`, domaines contactés).

## Ce qui relève d'un avocat

Seulement si Florent conserve la licence MIT sur les fonctions Pro et veut malgré tout en restreindre l'usage : la rédaction d'une double licence mérite une relecture par un avocat en propriété intellectuelle. Pour le reste, aucune donnée sensible, aucun profilage, montants très inférieurs au seuil d'escalade. La TVA relève de FISCAL.

---

*Ce document a été produit sur la base des textes en vigueur au 25 septembre 2026 et du code du site à cette date. Il ne se substitue pas à un conseil juridique personnalisé.*
