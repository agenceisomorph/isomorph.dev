/**
 * Famille « Navigation » du système Console : fil d'Ariane, et feuille de
 * style commune à toute la famille.
 *
 * Pourquoi la feuille vit ici : ce module est neutre (ni état, ni « use
 * client »), il peut donc être importé par les composants serveur (barre, fil
 * d'Ariane, pagination) comme par les composants client (méga-menu, menu
 * burger, onglets) sans tirer de code client dans les pages qui n'en ont pas
 * besoin. Même principe que `StylesConsole` : chaque composant rend
 * `<StylesNavigation />`, React ne place la feuille qu'une fois (même `href`).
 *
 * Règles tenues dans la feuille :
 *  - classes préfixées `csNav…`, jetons `--cs-*` de `fondations.tsx` ;
 *  - aucune propriété d'affichage (`display`, `position`) posée ici sur un
 *    élément qui reçoit aussi une classe Tailwind de même propriété : une
 *    règle hors couche l'emporte toujours sur les utilitaires de Tailwind ;
 *  - tout décalage animé passe par `translate`, `rotate` ou `scale`, jamais
 *    par `transform` ;
 *  - mouvement réduit neutralisé par la feuille seule.
 *
 * RGAA (fil d'Ariane) :
 *  - 12.9 : `nav` nommée « Fil d'Ariane », liste ordonnée ;
 *  - 12.6 : page courante marquée `aria-current="page"`, en texte et non en lien ;
 *  - 3.2 : liens en blanc 72 % sur fond nuit (plus de 10:1), page courante en blanc ;
 *  - 10.7 : le focus allume le trait, le bord ou le texte, sans anneau ;
 *  - séparateurs décoratifs masqués (`aria-hidden`).
 */

import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Feuille de la famille                                               */
/* ------------------------------------------------------------------ */

const STYLES = `
/* ---------- Barre ---------- */
.csNavBarre { position: relative; isolation: isolate; }
/* Verre de la barre. Sous 1024 px, presque opaque et sans flou : le flou coûte
   trop cher à un téléphone pour ce qu'il montre. */
.csNavBarreVerre {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: linear-gradient(180deg, rgba(4, 10, 20, 0.97), rgba(2, 6, 13, 0.94));
}
@media (min-width: 1024px) {
  .csNavBarreVerre {
    background: linear-gradient(180deg, rgba(4, 10, 20, 0.88), rgba(2, 6, 13, 0.8));
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
  }
}
/* Filet néon du bas : il se trace depuis le centre au chargement. */
.csNavFilet {
  position: absolute; left: 0; right: 0; bottom: 0; height: 1px; pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--cs-neon-doux) 8%, var(--cs-neon-doux) 92%, transparent);
  animation: csNavTraceX 900ms var(--cs-ease) both;
}
/* Graduations posées sur le filet, côté droit : décor d'instrument. */
.csNavFilet::after {
  content: ""; position: absolute; right: 9%; bottom: 1px; width: 73px; height: 4px;
  background: repeating-linear-gradient(90deg, var(--cs-neon-doux) 0 1px, transparent 1px 8px);
}

.csNavLogo { color: var(--cs-texte); }
.csNavLogo:focus-visible { filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9)); }

/* Lien de premier niveau (et déclencheur du méga-menu). Marge serrée entre
   1024 et 1279 px : la barre complète y tient avec 30 px de réserve. */
.csNavLien {
  --cs-nav-pad: 8px;
  position: relative; display: inline-flex; align-items: center; gap: 8px;
  height: 44px; padding: 0 var(--cs-nav-pad); white-space: nowrap; cursor: pointer;
  color: var(--cs-texte-2); transition: color var(--cs-rapide) linear;
}
@media (min-width: 1280px) { .csNavLien { --cs-nav-pad: 14px; } }
.csNavLien:hover, .csNavLien[aria-expanded="true"], .csNavLien[aria-current="page"] { color: var(--cs-texte); }
.csNavLien:focus-visible { color: var(--cs-texte); }
/* Trait qui s'allonge sous le libellé au survol. */
.csNavLien::after {
  content: ""; position: absolute; left: var(--cs-nav-pad); right: var(--cs-nav-pad); bottom: 9px; height: 1px;
  background: var(--cs-neon); box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
  transform-origin: 0 50%; scale: 0 1; transition: scale var(--cs-moyen) var(--cs-ease);
}
.csNavLien:hover::after, .csNavLien:focus-visible::after, .csNavLien[aria-expanded="true"]::after { scale: 1 1; }
/* Page courante : un segment vif posé sur le filet de la barre (10 px sous le
   lien de 44 px centré dans la barre de 64 px), en plus du repère losange. */
.csNavLien[aria-current="page"]::before {
  content: ""; position: absolute; left: 4px; right: 4px; bottom: -10px; height: 2px;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
}
.csNavChevron { width: 12px; height: 12px; flex-shrink: 0; color: var(--cs-neon); transition: rotate var(--cs-moyen) var(--cs-ease); }
[aria-expanded="true"] > .csNavChevron { rotate: 180deg; }

/* Repère losange : page courante, sans reposer sur la couleur seule. */
.csNavRepere {
  display: inline-block; flex-shrink: 0; width: 5px; height: 5px; rotate: 45deg;
  background: var(--cs-neon); box-shadow: 0 0 6px rgba(56, 189, 248, 0.9);
}

/* ---------- Sélecteur de langue ---------- */
.csNavLangue { display: flex; align-items: center; }
.csNavLangue > li { position: relative; }
.csNavLangue > li + li::before {
  content: ""; position: absolute; left: 0; top: 15px; bottom: 15px; width: 1px; background: var(--cs-neon-doux);
}
.csNavLangueLien {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; height: 44px; padding: 0 8px; color: var(--cs-texte-3);
  transition: color var(--cs-rapide) linear;
}
.csNavLangueLien:hover, .csNavLangueLien[aria-current="page"] { color: var(--cs-texte); }
.csNavLangueLien[aria-current="page"]::after {
  content: ""; position: absolute; left: calc(50% - 2px); bottom: 8px; width: 4px; height: 4px; rotate: 45deg;
  background: var(--cs-neon); box-shadow: 0 0 6px rgba(56, 189, 248, 0.9);
}
.csNavLangueLien:focus-visible { color: var(--cs-texte); text-shadow: 0 0 8px rgba(56, 189, 248, 0.9); }

/* ---------- Méga-menu ---------- */
.csNavMegaPose { animation: csNavDescend 320ms var(--cs-ease) both; }
/* Texte blanc sur fond sombre quel que soit ce qui passe derrière : le verre
   des menus est presque opaque, la transparence reste aux bords. */
.csNavMega > .csVerre {
  background: linear-gradient(165deg, rgba(10, 22, 38, 0.95), rgba(3, 8, 16, 0.98));
  animation: csNavApparait 220ms ease-out both;
}
/* Le bord définitif s'allume une fois le cadre tracé. */
.csNavMega > .csBord, .csNavMega > .csDiag, .csNavMega > .csEquerre { animation: csAllume 560ms ease-out 480ms both; }
/* Tracé du cadre : quatre côtés qui se dessinent l'un après l'autre, puis
   s'effacent derrière le bord définitif. Coupe « l » : 22 px. */
.csNavTrace {
  position: absolute; pointer-events: none; background: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
}
.csNavTrace[data-cote="haut"] { top: 0; left: 22px; right: 0; height: 1px; transform-origin: 0 50%; animation: csNavTraceX 240ms var(--cs-ease) 0ms both, csNavEteint 260ms linear 760ms forwards; }
.csNavTrace[data-cote="droite"] { top: 0; right: 0; bottom: 22px; width: 1px; transform-origin: 50% 0; animation: csNavTraceY 240ms var(--cs-ease) 120ms both, csNavEteint 260ms linear 760ms forwards; }
.csNavTrace[data-cote="bas"] { bottom: 0; left: 0; right: 22px; height: 1px; transform-origin: 100% 50%; animation: csNavTraceX 240ms var(--cs-ease) 240ms both, csNavEteint 260ms linear 760ms forwards; }
.csNavTrace[data-cote="gauche"] { left: 0; top: 22px; bottom: 0; width: 1px; transform-origin: 50% 100%; animation: csNavTraceY 240ms var(--cs-ease) 360ms both, csNavEteint 260ms linear 760ms forwards; }

/* Titre de colonne. */
.csNavTitre {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px;
  color: var(--cs-neon); transition: color var(--cs-rapide) linear;
}
a.csNavTitre:hover { color: var(--cs-texte); }
.csNavTitre:focus-visible { color: var(--cs-texte); text-shadow: 0 0 10px rgba(56, 189, 248, 0.8); }

/* Ligne d'élément : barre néon à gauche et fond dégradé, comme la console du hero. */
.csNavLigne {
  position: relative; display: flex; align-items: center; gap: 10px;
  min-height: 44px; padding: 8px 12px 8px 16px; color: var(--cs-texte);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0) 80%) no-repeat;
  background-size: 0% 100%;
  transition: background-size 280ms ease-out;
}
.csNavLigne::before {
  content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
  opacity: 0; scale: 1 0.3; transition: opacity 160ms linear, scale 220ms ease-out;
}
.csNavLigne:hover, .csNavLigne:focus-visible { background-size: 100% 100%; }
.csNavLigne:hover::before, .csNavLigne:focus-visible::before, .csNavLigne[aria-current="page"]::before { opacity: 1; scale: 1 1; }
.csNavLigne[aria-current="page"] { font-weight: 600; }

/* Relevé : graduation d'instrument, un trait par élément. */
.csNavGraduation { display: flex; align-items: flex-end; gap: 5px; height: 12px; }
.csNavGraduation > span { width: 1px; height: 6px; background: var(--cs-neon-doux); }
.csNavGraduation > span[data-actif] { height: 12px; background: var(--cs-neon); box-shadow: 0 0 6px rgba(56, 189, 248, 0.9); }
/* Changement de relevé : bref scintillement. */
.csNavFlash { animation: csAllume 360ms ease-out both; }

/* ---------- Menu burger ---------- */
.csNavBurger {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; flex-shrink: 0; color: var(--cs-texte);
}
/* La croix dessinée du panneau statique n'est pas un bouton : pas de main. */
button.csNavBurger { cursor: pointer; }
button.csNavBurger:is(:hover, :focus-visible) { --cs-bord: var(--cs-neon); }
.csNavBurger:focus-visible { filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7)); }
.csNavTrait {
  position: absolute; left: 13px; top: calc(50% - 0.75px); width: 18px; height: 1.5px; background: currentColor;
  transition: translate var(--cs-moyen) var(--cs-ease), rotate var(--cs-moyen) var(--cs-ease), scale var(--cs-rapide) linear, opacity var(--cs-rapide) linear;
}
.csNavTrait[data-t="h"] { translate: 0 -6px; }
.csNavTrait[data-t="b"] { translate: 0 6px; }
.csNavBurger[data-etat="croix"] .csNavTrait[data-t="h"] { translate: 0 0; rotate: 45deg; }
.csNavBurger[data-etat="croix"] .csNavTrait[data-t="m"] { scale: 0 1; opacity: 0; }
.csNavBurger[data-etat="croix"] .csNavTrait[data-t="b"] { translate: 0 0; rotate: -45deg; }
/* Le bouton de fermeture du panneau, posé à la place du bouton de la barre,
   naît en trois traits et devient croix. */
.csNavBurger[data-naissance] .csNavTrait[data-t="h"] { animation: csNavCroixH 320ms var(--cs-ease) 60ms both; }
.csNavBurger[data-naissance] .csNavTrait[data-t="m"] { animation: csNavCroixM 200ms linear 60ms both; }
.csNavBurger[data-naissance] .csNavTrait[data-t="b"] { animation: csNavCroixB 320ms var(--cs-ease) 60ms both; }

.csNavVolet { background-color: var(--cs-fond); animation: csNavApparait 200ms ease-out both; }

/* Entrée numérotée du menu burger. */
.csNavEntree {
  position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr) 24px; align-items: center; column-gap: 8px;
  width: 100%; min-height: 56px; padding: 8px 12px 8px 16px; text-align: left; cursor: pointer; color: var(--cs-texte);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0) 80%) no-repeat;
  background-size: 0% 100%;
  transition: background-size 280ms ease-out;
}
.csNavEntree::before {
  content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 2px;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
  opacity: 0; scale: 1 0.3; transition: opacity 160ms linear, scale 220ms ease-out;
}
/* Famille dont le titre mène à son accueil : le lien et la bascule sont
   deux cibles voisines, la colonne du plus passe au bouton. */
.csNavEntree[data-scinde] { grid-template-columns: 36px minmax(0, 1fr); }
/* Filet entre deux rangées. */
.csNavRangee { position: relative; }
.csNavRangee + .csNavRangee::before { content: ""; position: absolute; top: 0; left: 16px; right: 12px; height: 1px; background: rgba(255, 255, 255, 0.07); }
.csNavBascule {
  display: inline-flex; align-items: center; justify-content: center; width: 56px; flex-shrink: 0;
  cursor: pointer; color: var(--cs-neon); transition: background-color var(--cs-rapide) linear;
}
.csNavBascule:hover, .csNavBascule[aria-expanded="true"] { background-color: rgba(56, 189, 248, 0.08); }
.csNavBascule:focus-visible { background-color: rgba(56, 189, 248, 0.16); box-shadow: inset 2px 0 0 var(--cs-neon); }
.csNavEntree:hover, .csNavEntree:focus-visible, .csNavEntree[aria-expanded="true"] { background-size: 100% 100%; }
.csNavEntree:hover::before, .csNavEntree:focus-visible::before, .csNavEntree[aria-expanded="true"]::before, .csNavEntree[aria-current="page"]::before { opacity: 1; scale: 1 1; }
.csNavIndex { color: rgba(125, 211, 252, 0.6); transition: color 160ms linear, text-shadow 160ms linear; }
.csNavEntree:hover .csNavIndex, .csNavEntree:focus-visible .csNavIndex, .csNavEntree[aria-expanded="true"] .csNavIndex, .csNavEntree[aria-current="page"] .csNavIndex {
  color: var(--cs-neon); text-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
}
.csNavFleche { color: rgba(255, 255, 255, 0.35); transition: translate 200ms ease-out, color 160ms linear; }
.csNavEntree:hover .csNavFleche, .csNavEntree:focus-visible .csNavFleche { translate: 4px 0; color: var(--cs-neon); }
/* Plus qui devient moins à l'ouverture d'une famille. */
.csNavPlus { position: relative; width: 12px; height: 12px; justify-self: end; color: var(--cs-neon); }
.csNavPlus > span { position: absolute; background: currentColor; }
.csNavPlus > span:first-child { left: 0; right: 0; top: calc(50% - 0.75px); height: 1.5px; }
.csNavPlus > span:last-child { top: 0; bottom: 0; left: calc(50% - 0.75px); width: 1.5px; transition: scale var(--cs-moyen) var(--cs-ease); }
[aria-expanded="true"] > .csNavPlus > span:last-child { scale: 1 0; }

/* ---------- Onglets ---------- */
.csNavOngletsCadre { position: relative; }
.csNavOnglet {
  position: relative; display: inline-flex; align-items: center; min-height: 44px; padding: 10px 16px;
  cursor: pointer; color: var(--cs-texte-3); border-bottom: 1px solid rgba(125, 211, 252, 0.2);
  transition: color var(--cs-rapide) linear;
}
.csNavOnglet:hover { color: var(--cs-texte-2); }
.csNavOnglet[aria-selected="true"] { color: var(--cs-texte); }
.csNavOnglet:focus-visible { color: var(--cs-texte); background-color: var(--cs-neon-voile); border-bottom-color: var(--cs-neon); }
/* Avant la mesure (rendu serveur), un trait fixe sous l'onglet choisi ;
   ensuite le curseur glissant prend le relais. */
.csNavOngletsCadre:not([data-curseur]) .csNavOnglet[aria-selected="true"]::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
}
.csNavCurseur {
  position: absolute; left: 0; top: 0; width: 0; height: 2px; pointer-events: none; opacity: 0;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
}
.csNavOngletsCadre[data-curseur] .csNavCurseur { opacity: 1; }
.csNavOngletsCadre[data-anime] .csNavCurseur { transition: translate 320ms var(--cs-ease), width 320ms var(--cs-ease); }
/* Panneau atteint au clavier : un trait néon le longe à gauche. */
.csNavOngletPanneau { position: relative; }
.csNavOngletPanneau::before {
  content: ""; position: absolute; left: -12px; top: 0; bottom: 0; width: 2px; pointer-events: none;
  background: var(--cs-neon); box-shadow: 0 0 10px rgba(56, 189, 248, 0.9); opacity: 0;
}
.csNavOngletPanneau:focus-visible::before { opacity: 1; }

/* ---------- Fil d'Ariane ---------- */
.csNavAriane > li { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.csNavSep {
  display: inline-block; flex-shrink: 0; width: 1px; height: 12px; rotate: 24deg;
  background: var(--cs-neon); opacity: 0.55; box-shadow: 0 0 4px rgba(56, 189, 248, 0.8);
}
.csNavArianeLien {
  position: relative; display: inline-flex; align-items: center; min-height: 44px;
  color: var(--cs-texte-2); overflow-wrap: anywhere; transition: color var(--cs-rapide) linear;
}
.csNavArianeLien::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 12px; height: 1px;
  background: var(--cs-neon); box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
  transform-origin: 0 50%; scale: 0 1; transition: scale var(--cs-moyen) var(--cs-ease);
}
.csNavArianeLien:is(:hover, :focus-visible) { color: var(--cs-texte); }
.csNavArianeLien:hover::after, .csNavArianeLien:focus-visible::after { scale: 1 1; }
.csNavArianeTexte { display: inline-flex; align-items: center; min-height: 44px; color: var(--cs-texte-2); overflow-wrap: anywhere; }
.csNavArianeTexte[aria-current="page"] { color: var(--cs-texte); font-weight: 600; }

/* ---------- Pagination ---------- */
.csNavPage {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-width: 44px; height: 44px; padding: 0 12px; color: var(--cs-texte);
  font-variant-numeric: tabular-nums; transition: color var(--cs-rapide) linear;
}
.csNavPageFond { position: absolute; inset: 0; z-index: -1; clip-path: var(--cs-clip); background-color: rgba(56, 189, 248, 0.04); transition: background-color var(--cs-rapide) linear; }
a.csNavPage:is(:hover, :focus-visible) { --cs-bord: var(--cs-neon); }
a.csNavPage:is(:hover, :focus-visible) .csNavPageFond { background-color: var(--cs-neon-voile); }
.csNavPage[aria-current="page"] { --cs-bord: var(--cs-neon); color: #02060d; font-weight: 600; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5)); }
.csNavPage[aria-current="page"] .csNavPageFond { background-color: var(--cs-neon); }
.csNavPage[data-inactif] { color: var(--cs-texte-3); }
.csNavPage[data-inactif] .csBord, .csNavPage[data-inactif] .csDiag { opacity: 0.4; }
.csNavPage:focus-visible { filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6)); }
.csNavEllipse { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 44px; color: var(--cs-texte-3); }

@keyframes csNavTraceX { from { scale: 0 1; } to { scale: 1 1; } }
@keyframes csNavTraceY { from { scale: 1 0; } to { scale: 1 1; } }
@keyframes csNavEteint { to { opacity: 0; } }
@keyframes csNavApparait { from { opacity: 0; } to { opacity: 1; } }
@keyframes csNavDescend { from { translate: 0 -8px; } to { translate: 0 0; } }
@keyframes csNavCroixH { from { translate: 0 -6px; rotate: 0deg; } to { translate: 0 0; rotate: 45deg; } }
@keyframes csNavCroixM { from { scale: 1 1; opacity: 1; } to { scale: 0 1; opacity: 0; } }
@keyframes csNavCroixB { from { translate: 0 6px; rotate: 0deg; } to { translate: 0 0; rotate: -45deg; } }

@media (prefers-reduced-motion: reduce) {
  .csNavFilet, .csNavMegaPose, .csNavMega > .csVerre, .csNavMega > .csBord, .csNavMega > .csDiag, .csNavMega > .csEquerre,
  .csNavFlash, .csNavVolet, .csNavBurger[data-naissance] .csNavTrait { animation: none; }
  .csNavTrace { display: none; }
  .csNavLien, .csNavLien::after, .csNavChevron, .csNavLangueLien, .csNavTitre, .csNavLigne, .csNavLigne::before,
  .csNavTrait, .csNavEntree, .csNavEntree::before, .csNavIndex, .csNavFleche, .csNavPlus > span:last-child, .csNavBascule,
  .csNavOnglet, .csNavArianeLien, .csNavArianeLien::after, .csNavPage, .csNavPageFond { transition: none; }
  .csNavOngletsCadre[data-anime] .csNavCurseur { transition: none; }
}
`;

/** Feuille de la famille Navigation. Rendue par chaque composant, placée une seule fois. */
export function StylesNavigation() {
  return (
    <style href="console-navigation" precedence="ds">
      {STYLES}
    </style>
  );
}

/**
 * Vrai si `href` désigne la page affichée ou l'une de ses sous-pages.
 * L'accueil (`/`) ne couvre que lui-même.
 *
 * Test minimal proposé :
 *   estCourant("/methode", "/methode") === true
 *   estCourant("/developpement", "/developpement/strapi") === true
 *   estCourant("/", "/methode") === false
 *   estCourant("/plugins", "/plugins-x") === false
 */
export function estCourant(href: string, chemin: string | undefined): boolean {
  if (!chemin) return false;
  if (href === chemin) return true;
  return href !== "/" && chemin.startsWith(`${href}/`);
}

/* ------------------------------------------------------------------ */
/* Fil d'Ariane                                                        */
/* ------------------------------------------------------------------ */

export interface EtapeAriane {
  libelle: string;
  /** Absent : l'étape s'écrit en texte (page courante, ou page sans adresse dans cette langue). */
  href?: string;
}

export interface FilArianeProps {
  /** De l'accueil à la page courante, qui vient en dernier. */
  etapes: EtapeAriane[];
  /** Nom de la zone de navigation. */
  libelle?: string;
  className?: string;
}

/** Fil d'Ariane : composant serveur, aucun script. */
export function FilAriane({ etapes, libelle = "Fil d'Ariane", className = "" }: FilArianeProps) {
  return (
    <nav aria-label={libelle} className={className}>
      <StylesNavigation />
      <ol role="list" className="csNavAriane type-caption flex flex-wrap items-center gap-x-2.5">
        {etapes.map((etape, i) => {
          const derniere = i === etapes.length - 1;
          return (
            <li key={`${i}-${etape.libelle}`}>
              {i > 0 ? <span aria-hidden="true" className="csNavSep" /> : null}
              {etape.href && !derniere ? (
                <Link href={etape.href} className="csNavArianeLien">
                  {etape.libelle}
                </Link>
              ) : (
                <span aria-current={derniere ? "page" : undefined} className="csNavArianeTexte">
                  {etape.libelle}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
