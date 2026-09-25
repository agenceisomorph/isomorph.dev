/**
 * Feuille de la famille « Identité » du système Console : police choisie,
 * curseurs, module de choix, relevé. Rendue par chaque composant de la
 * famille, placée une seule fois grâce à `href="console-identite"`.
 */

import { CSS_CURSEURS } from "./curseurs";
import { FAMILLE_TEXTE, POLICES } from "./polices";

/*
 * Police choisie : le module pose `data-police` et la classe de la variable
 * sur la racine de l'atelier. Tout hérite : les classes `type-*` ne fixent
 * pas de famille, champs et boutons reçoivent `font: inherit` de la remise à
 * zéro de Tailwind, les composants Console écrivent `font-family: inherit`.
 * Aucune famille n'est imposée par globals.css.
 */
/* Texte en Saira sur toute la page, dès le rendu serveur. Le module ne
   change que les titres ; à spécificité nulle, un échantillon qui porte sa
   propre police la garde. */
const TITRES = "h1, h2, h3, h4, .type-hero, .type-display, .type-h1, .type-h2, .type-h3";
const CSS_POLICE_CHOISIE = [
  `[data-atelier-console] { font-family: ${FAMILLE_TEXTE}; }`,
  `:where([data-atelier-console][data-police="actuelle"]) :where(${TITRES}) { font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif); }`,
  ...POLICES.map(
    (p) => `:where([data-atelier-console][data-police="${p.id}"]) :where(${TITRES}) { font-family: var(${p.proprieteCss}), system-ui, sans-serif; }`,
  ),
].join("\n");

const STYLES_IDENTITE = `
${CSS_POLICE_CHOISIE}

${CSS_CURSEURS}

/* ---- Module de choix de la police ---- */
/* En haut à droite, sous la barre (64 px) : le bas de l'écran reste aux
   notifications. Sous la barre dans l'empilement : le méga-menu le recouvre. */
.csPolFixe {
  position: fixed; z-index: 39; margin: 0;
  top: 80px; right: max(16px, env(safe-area-inset-right));
  max-width: calc(100vw - 32px);
}
.csPolFixe[data-ouvert] { width: 304px; }
.csPolModule:is(:hover, :focus-within) { --cs-bord: var(--cs-neon); }
/* Sans flou (sous 1024 px), le verre devient opaque : le texte de la page ne
   se mêle pas aux libellés du module. */
@media (max-width: 1023.98px) {
  .csPolModule > .csVerre { background: #040a14; }
}
.csPolCorps { display: flex; flex-direction: column; gap: 6px; padding: 6px; }
.csPolListe { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.csPolListe[hidden] { display: none; }

.csPolBouton {
  position: relative; isolation: isolate; display: flex; align-items: center; gap: 10px;
  min-height: 44px; padding: 0 12px; text-align: left; color: var(--cs-texte);
  background: none; border: 0; --cs-bord: rgba(125, 211, 252, 0.2);
}
.csPolBouton:focus-visible { outline: none; }
.csPolBouton:is(:hover, :focus-visible) { --cs-bord: var(--cs-neon); }
.csPolBouton:focus-visible > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8)); }
.csPolFond {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; clip-path: var(--cs-clip);
  transition: background-color var(--cs-rapide) linear;
}
.csPolBouton:hover > .csPolFond { background: rgba(56, 189, 248, 0.06); }
.csPolBouton[aria-pressed="true"] { --cs-bord: var(--cs-neon); }
.csPolBouton[aria-pressed="true"] > .csPolFond { background: var(--cs-neon-voile); }
.csPolRepere { flex: none; width: 7px; height: 7px; rotate: 45deg; border: 1px solid var(--cs-neon-doux); }
.csPolBouton[aria-pressed="true"] .csPolRepere { background: var(--cs-neon); border-color: var(--cs-neon); box-shadow: 0 0 8px rgba(56, 189, 248, 0.9); }
.csPolOption[data-option="actuelle"] { font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif); }

.csPolBascule { width: 100%; --cs-bord: transparent; }
/* Pastille du téléphone : « Aa » à l'écran, « Police » pour les lecteurs
   d'écran. La classe sr-only de globals.css, hors couche, ne se lève pas
   par un utilitaire : d'où ces deux règles. */
@media (max-width: 767.98px) {
  .csPolLibelle { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
@media (min-width: 768px) {
  .csPolAa { display: none; }
}
.csPolChevron { flex: none; margin-left: auto; color: var(--cs-neon); transition: rotate var(--cs-moyen) var(--cs-ease); }
.csPolFixe[data-ouvert] .csPolChevron { rotate: 180deg; }

/* ---- Relevé : libellé fin souligné d'un filet, grands chiffres fins ---- */
.csIdReleve { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 28px 40px; margin: 0; }
.csIdLibelle {
  text-transform: uppercase; letter-spacing: 0.24em; font-weight: 400;
  color: var(--rl-libelle, var(--cs-neon));
  padding-bottom: 8px; border-bottom: 1px solid var(--rl-filet, var(--cs-neon-doux));
}
.csIdValeur { margin: 14px 0 0; font-weight: 300; line-height: 1; color: var(--rl-valeur, var(--cs-texte)); font-variant-numeric: tabular-nums; }
.csIdValeur[data-ton="accent"] { color: var(--rl-accent, var(--cs-neon)); }
.csIdValeur[data-ton="alerte"] { color: var(--rl-alerte, var(--cs-erreur)); }

/* ---- Échantillon de la palette ---- */
.csIdEchFond { position: absolute; inset: 0; z-index: -1; pointer-events: none; clip-path: var(--cs-clip); }
.csIdAlerteRepere { flex: none; width: 8px; height: 8px; rotate: 45deg; }

@media (prefers-reduced-motion: reduce) {
  .csPolFond, .csPolChevron { transition: none; }
}
`;

export function StylesIdentite() {
  return (
    <style href="console-identite" precedence="ds">
      {STYLES_IDENTITE}
    </style>
  );
}
