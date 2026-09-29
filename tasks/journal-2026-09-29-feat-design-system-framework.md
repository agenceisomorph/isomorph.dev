# Journal — feat/design-system-framework (29/09/2026)

## Session FORGE

### Contexte
Reprise depuis main (PR #9 feat/site-console mergée). Branche créée : `feat/design-system-framework`.

### Arbitrages RGAA / éco / perf / sécu
- **RGAA** : focus sans anneau sur tous les nouveaux composants (bord du composant s'allume), aria-expanded sur l'accordéon, aria-current sur les liens actifs, sr-only sur les liens externes, labels visibles sur les champs.
- **Éco** : polices chargées via next/font (zéro réseau côté navigateur), aperçu vivant des composants en Server Components sauf accordéon (état ouvert/fermé), copier-code en Client Component minimal.
- **Perf** : toutes les pages design-system sont statiques (generateStaticParams), First Load JS 108 kB.
- **Sécu** : aucune donnée sensible exposée, aucun secret côté client.

### Ce qui a changé
1. **globals.css** — remplacé par les jetons noir/blanc (--noir, --blanc, --gris, --gris-clair, --trait) + échelle type-* alignée sur isomorph-agency. Les vars --cs-* restent sur :root pour compatibilité des pages Console existantes.
2. **src/app/layout.tsx** — fonts Jost + Archivo Black via next/font/google (remplacement de Geist), fond blanc, texte noir.
3. **src/app/[locale]/layout.tsx** — suppression de l'inline style Console (fond #02060d), passage à bg-blanc text-noir.
4. **BarreIsomorphDev.tsx** — redesign complet en noir/blanc. Lien Design System ajouté. Burger : volet blanc. Focus visible sur chaque élément (fond gris-clair). Aucun outline CSS.
5. **PiedPageIsomorphDev.tsx** — redesign en fond noir/texte blanc. Lien Design System ajouté.
6. **src/app/[locale]/page.tsx** — accueil redessiné en noir/blanc. Hero fond noir, sections blanc et gris-clair. Suppression de StylesConsole et des Panneaux Console.
7. **src/lib/design-system.ts** — données complètes : jetons couleur, échelle typo, espacement, 6 composants (bouton, lien, carte, champ, accordéon, étiquette) avec variantes, états, props, code exemple, règles RGAA.
8. **src/components/ds/GabariComposant.tsx** — gabarit de fiche (Server Component) : aperçu (slot), tableaux variantes/états/props, bloc code, RGAA.
9. **src/components/ds/BoutonCopier.tsx** — Client Component minimal pour copier le code.
10. **src/components/ds/apercus/** — 6 aperçus vivants (bouton, lien, carte, champ, accordéon, étiquette).
11. **src/app/[locale]/design-system/layout.tsx** — sidebar de navigation fixe (fondations + composants).
12. **src/app/[locale]/design-system/page.tsx** — page fondations : couleurs, typographie, espacement, liste des composants.
13. **src/app/[locale]/design-system/composants/[slug]/page.tsx** — fiche dynamique statique (generateStaticParams).

### Build
- `npx tsc --noEmit` : aucune erreur.
- `npm run build` : 100/100 pages statiques générées, aucune erreur.

### Décisions métier restantes
Aucune — périmètre technique, exécuté en autonomie.
