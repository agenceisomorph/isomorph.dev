/**
 * Carte Console : feuille de style, placée une seule fois dans la page par
 * React (même `href`), comme celle des fondations.
 *
 * États du cadre (`data-etat` sur `.csCarte`) :
 *   attente     : rendu serveur, mire d'attente et viseur qui cherche ;
 *   apparition  : mise au point du fond, viseur qui se referme, surcouche
 *                 qui s'allume (chorégraphie dans `apparition.ts`) ;
 *   prete       : plus aucune animation d'apparition ni aucun filtre ;
 *   indisponible: la surcouche seule sur le fond.
 *
 * Propriétés animées : `opacity`, `translate`, `scale` et `filter` (flou et
 * luminosité du fond, pendant la seule mise au point, retirés à l'état
 * « prete »). Mouvement réduit : ni balayage ni flou, attente fixe,
 * apparition par un fondu court (la carte coupe elle-même l'élan et les
 * transitions de caméra).
 */

import { APPARITION, FONDU_REDUIT, MISE_AU_POINT, pourcent } from "./apparition";
import { COULEUR_ALERTE } from "./style";

const ms = (v: number) => `${v}ms`;

/** Teinte néon du système à une opacité donnée (jetons Console). */
const neon = (part: number) => `color-mix(in srgb, var(--cs-neon) ${part}%, transparent)`;
const vif = (part: number) => `color-mix(in srgb, var(--cs-neon-vif) ${part}%, transparent)`;

const { attente, fond, viseur, surcouche, commandes } = APPARITION;
const { opaque, netTot, reflou, verrou, flouDepart, flouReprise, echelle, eclat } = MISE_AU_POINT;

/** Approche de l'objectif : lente au départ, pour que le flou se voie. */
const APPROCHE = "cubic-bezier(0.35, 0, 0.25, 1)";
/** Juste avant le verrou : encore net, pas encore éclairé. */
const avantVerrou = verrou - 70;

/** Crochet du viseur écarté de `px` vers son coin. */
const ecarte = (px: string) => `translate: calc(var(--dx) * ${px}) calc(var(--dy) * ${px});`;
const lueurViseur = (rayon: number, pourcentVif: number) => `filter: drop-shadow(0 0 ${rayon}px ${vif(pourcentVif)});`;

/** Croix de la mire : 7 px, dessinée à l'échelle 1 (pas de viewBox), centrée sur le pixel 3. */
const CROIX = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 3.5h7M3.5 0v7' stroke='%23000'/%3E%3C/svg%3E")`;

const STYLES = `
.csCarte { --cs-carte-alerte: ${COULEUR_ALERTE}; }

/* Le bord s'allume quand la carte ou une commande a le focus clavier, comme
   au survol d'un panneau tracé : jamais d'anneau détaché. */
.csCarte:has(:focus-visible) { --cs-bord: var(--cs-neon); }
.csCarte:has(:focus-visible) > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.7)); }

/* Le contenu entier suit la coupe des coins : rien ne déborde. */
.csCarteCorps {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  clip-path: var(--cs-clip); background: var(--cs-fond);
}

/* Fond de carte : caché (et inerte) tant que les premières tuiles ne sont pas peintes. */
.csCarteFond { position: absolute; inset: 0; }
.csCarte:is([data-etat="attente"], [data-etat="indisponible"]) .csCarteFond { opacity: 0; }
.csCarte[data-etat="apparition"] .csCarteFond { animation: csCarteNet ${ms(fond.duree)} var(--cs-ease) ${ms(fond.delai)} both; }
/* Deux classes : la feuille de MapLibre, chargée après, repasse sinon le bloc en
   position relative, donc à hauteur nulle. */
.csCarteFond.maplibregl-map { position: absolute; inset: 0; font: inherit; }
.csCarteFond .maplibregl-canvas:focus-visible { outline: none; }

/* Message des gestes à deux doigts (écran tactile), au style de la console. */
.csCarteFond .maplibregl-cooperative-gesture-screen {
  background: rgba(2, 6, 13, 0.72); color: var(--cs-texte); font: inherit;
  text-transform: uppercase; letter-spacing: 0.22em; text-align: center;
}

/* Surcouche et commandes : éteintes pendant l'attente, allumées après la mise au point. */
.csCarte[data-etat="attente"] .csCarteSurcouche { opacity: 0; }
.csCarte[data-etat="attente"] .csCarteOnde { animation: none; }
.csCarte[data-etat="apparition"] .csCarteSurcouche { animation: csCarteAllume ${ms(surcouche.duree)} ease-out ${ms(surcouche.delai)} both; }
.csCarte[data-etat="attente"] .csCarteCommandes { visibility: hidden; opacity: 0; }
.csCarte[data-etat="apparition"] .csCarteCommandes { animation: csCarteAllume ${ms(commandes.duree)} ease-out ${ms(commandes.delai)} both; }

/* ------------------------------------------------------------------ */
/* Attente : mire à peine allumée, balayage lent, viseur qui cherche. */
/* ------------------------------------------------------------------ */

/* Mire : règles et grille de la surcouche, en plus pâle. Le pas suit celui
   de la vraie grille (douze colonnes, jamais moins de 56 px). */
.csCarteAttente { position: absolute; inset: 0; pointer-events: none; overflow: hidden; container-type: size; }
.csCarte[data-etat="apparition"] .csCarteAttente { animation: csCarteEteint ${ms(attente.duree)} linear ${ms(attente.delai)} both; }
.csCarteMire, .csCarteCroix { position: absolute; --pas: max(56px, 100cqw / 12); }
.csCarteMire {
  inset: 23px 0 0 23px;
  border-top: 1px solid ${neon(26)}; border-left: 1px solid ${neon(26)};
  background:
    linear-gradient(to right, ${neon(9)} 1px, transparent 1px) 32px 32px / var(--pas) var(--pas),
    linear-gradient(to bottom, ${neon(9)} 1px, transparent 1px) 32px 32px / var(--pas) var(--pas);
  background-clip: padding-box;
}
.csCarteCroix {
  inset: 24px 0 0 24px;
  background: ${neon(30)};
  -webkit-mask: ${CROIX} 29px 29px / var(--pas) var(--pas);
  mask: ${CROIX} 29px 29px / var(--pas) var(--pas);
}

/* Balayage : un trait néon descend lentement sur la mire, suivi d'un sillage. */
.csCarteBalayage {
  position: absolute; inset: 0 0 0 24px;
  background: linear-gradient(to bottom, transparent calc(100% - 88px), ${vif(7)} calc(100% - 1px), ${neon(55)} calc(100% - 1px));
  translate: 0 -100%;
  animation: csCarteBalayage 3600ms cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

/* Viseur : quatre crochets autour de la zone utile (sous les règles). Ils
   battent, écartés, pendant l'attente ; ils se referment à l'apparition. */
.csCarteViseur { position: absolute; top: 24px; left: 24px; right: 0; bottom: 0; pointer-events: none; }
.csCarteVise {
  --ecart: 9px;
  position: absolute; width: 18px; height: 18px; color: var(--cs-neon);
  filter: drop-shadow(0 0 4px ${vif(80)});
  translate: calc(var(--dx) * var(--ecart)) calc(var(--dy) * var(--ecart));
  animation: csCarteCherche 1500ms ease-in-out infinite;
}
.csCarteVise[data-coin="hg"] { --dx: -1; --dy: -1; top: 12px; left: 12px; border-top: 1.5px solid; border-left: 1.5px solid; }
.csCarteVise[data-coin="hd"] { --dx: 1; --dy: -1; top: 12px; right: 12px; border-top: 1.5px solid; border-right: 1.5px solid; }
.csCarteVise[data-coin="bd"] { --dx: 1; --dy: 1; bottom: 12px; right: 12px; border-bottom: 1.5px solid; border-right: 1.5px solid; }
.csCarteVise[data-coin="bg"] { --dx: -1; --dy: 1; bottom: 12px; left: 12px; border-bottom: 1.5px solid; border-left: 1.5px solid; }
.csCarte[data-etat="apparition"] .csCarteVise { animation: csCarteVerrou ${ms(viseur.duree)} var(--cs-ease) ${ms(viseur.delai)} both; }

/* Commandes de zoom : verre, coins coupés, bord qui s'allume. */
.csCarteCommande {
  --cs-bord: var(--cs-neon-doux);
  position: relative; isolation: isolate; display: grid; place-items: center;
  width: 44px; height: 44px; color: var(--cs-neon); cursor: pointer;
}
.csCarteCommande::before {
  content: ""; position: absolute; inset: 0; z-index: -1; clip-path: var(--cs-clip);
  background: rgba(4, 10, 20, 0.84); transition: background-color var(--cs-rapide) linear;
}
.csCarteCommande:is(:hover, :focus-visible) { --cs-bord: var(--cs-neon); }
.csCarteCommande:is(:hover, :focus-visible)::before { background: rgba(14, 30, 50, 0.92); }
.csCarteCommande:is(:hover, :focus-visible) > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8)); }
.csCarteCommande:disabled { cursor: default; opacity: 0.42; }

/* Liens d'attribution : discrets, allumés au survol et au focus. */
.csCarteLien { color: var(--cs-texte-3); text-decoration: none; transition: color var(--cs-rapide) linear; }
.csCarteLien:is(:hover, :focus-visible) { color: var(--cs-neon); text-decoration: underline; text-underline-offset: 3px; }

/* Surcouche : textes lisibles sur n'importe quel fond de carte. */
.csCarteTexte { paint-order: stroke; stroke: var(--cs-fond); stroke-width: 3px; stroke-linejoin: round; }

/* Onde autour des repères. */
.csCarteOnde { transform-box: fill-box; transform-origin: 50% 50%; animation: csCarteOnde 2800ms var(--cs-ease) infinite; }
@keyframes csCarteOnde { 0% { scale: 0.4; opacity: 0.9; } 80%, 100% { scale: 1.6; opacity: 0; } }

/* Mise au point d'objectif : la carte arrive opaque et très floue, un peu
   trop grande ; l'objectif passe net trop tôt, repart légèrement flou, puis
   se cale net avec un bref sursaut de luminosité. Même vocabulaire que
   l'effet d'image « Mise au point ». Le filtre disparaît avec l'état « prete ». */
@keyframes csCarteNet {
  0% { opacity: 0; filter: blur(${flouDepart}px) brightness(1); scale: ${echelle}; animation-timing-function: ${APPROCHE}; }
  ${pourcent(opaque, fond)} { opacity: 1; }
  ${pourcent(netTot, fond)} { filter: blur(0px) brightness(1); animation-timing-function: ease-in-out; }
  ${pourcent(reflou, fond)} { filter: blur(${flouReprise}px) brightness(1); animation-timing-function: ease-in; }
  ${pourcent(avantVerrou, fond)} { filter: blur(0.4px) brightness(1); animation-timing-function: ease-out; }
  ${pourcent(verrou, fond)} { filter: blur(0px) brightness(${eclat}); scale: 1; animation-timing-function: ease-out; }
  100% { opacity: 1; filter: blur(0px) brightness(1); scale: 1; }
}
/* Les quatre crochets se referment ensemble et suivent l'objectif : fermés
   trop tôt, légèrement rouverts, puis verrouillés dans un éclat, et effacés. */
@keyframes csCarteVerrou {
  0% { ${ecarte("var(--ecart)")} opacity: 0.9; ${lueurViseur(4, 80)} animation-timing-function: ${APPROCHE}; }
  ${pourcent(netTot, viseur)} { ${ecarte("0px")} animation-timing-function: ease-in-out; }
  ${pourcent(reflou, viseur)} { ${ecarte("3px")} animation-timing-function: ease-in; }
  ${pourcent(verrou, viseur)} { ${ecarte("0px")} opacity: 1; ${lueurViseur(9, 100)} animation-timing-function: ease-out; }
  ${pourcent(verrou + 140, viseur)} { opacity: 1; ${lueurViseur(4, 80)} }
  100% { ${ecarte("0px")} opacity: 0; ${lueurViseur(4, 80)} }
}
@keyframes csCarteCherche {
  0%, 100% { translate: calc(var(--dx) * var(--ecart)) calc(var(--dy) * var(--ecart)); opacity: 0.45; }
  50%      { translate: calc(var(--dx) * 5px) calc(var(--dy) * 5px); opacity: 1; }
}
@keyframes csCarteBalayage {
  0%       { translate: 0 -100%; opacity: 0; }
  10%      { opacity: 1; }
  80%      { translate: 0 0; opacity: 1; }
  90%, 100% { translate: 0 0; opacity: 0; }
}
/* Scintillement d'un tube qui s'allume (même courbe que csAllume). */
@keyframes csCarteAllume {
  0% { opacity: 0; } 30% { opacity: 0.85; } 38% { opacity: 0.25; }
  55% { opacity: 1; } 66% { opacity: 0.7; } 100% { opacity: 1; }
}
@keyframes csCarteEteint { from { opacity: 1; } to { opacity: 0; } }
@keyframes csCarteFondu { from { opacity: 0; } to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .csCarteCommande::before, .csCarteLien { transition: none; }
  .csCarteFond .maplibregl-cooperative-gesture-screen { transition: none; }
  .csCarteOnde { animation: none; opacity: 0; }
  /* Attente fixe : ni balayage ni battement. */
  .csCarteBalayage { display: none; }
  .csCarteVise { animation: none; opacity: 0.7; }
  /* Apparition : un fondu court, sans flou, sans recul ni viseur. */
  .csCarte[data-etat="apparition"] .csCarteVise { animation: none; opacity: 0; }
  .csCarte[data-etat="apparition"] :is(.csCarteFond, .csCarteSurcouche, .csCarteCommandes) { animation: csCarteFondu ${ms(FONDU_REDUIT)} linear both; }
  .csCarte[data-etat="apparition"] .csCarteAttente { animation: csCarteEteint ${ms(FONDU_REDUIT)} linear both; }
}
`;

export function StylesCarte() {
  return (
    <style href="console-carte" precedence="ds">
      {STYLES}
    </style>
  );
}
