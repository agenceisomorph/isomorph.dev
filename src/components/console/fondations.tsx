/**
 * Système de design « Console » : fondations.
 *
 * Écriture des interfaces du film Oblivion, adoptée pour le hero le
 * 23 septembre 2026 : fond nuit, trait néon fin, bords coupés, verre sombre.
 * Règle de lisibilité : le néon et la transparence restent sur les bords et
 * les repères, le texte est toujours blanc sur fond sombre.
 *
 * Aucune feuille globale : chaque composant rend `<StylesConsole />`, que
 * React ne place qu'une fois dans la page (même `href`). Les jetons sont des
 * variables `--cs-*` posées sur `:root`, préfixées pour ne croiser ni les
 * `--ds-*` du système actuel ni rien d'autre.
 */

import type { CSSProperties, ReactNode } from "react";

import { StylesLiens } from "./liens";

/* ------------------------------------------------------------------ */
/* Jetons                                                              */
/* ------------------------------------------------------------------ */

/** Couleurs, pour la vitrine. Les composants lisent les variables CSS. */
export const COULEURS = [
  { nom: "Fond", variable: "--cs-fond", valeur: "#02060d", usage: "Fond de page" },
  { nom: "Fond alterné", variable: "--cs-fond-2", valeur: "#07101d", usage: "Section voisine" },
  { nom: "Néon", variable: "--cs-neon", valeur: "#7dd3fc", usage: "Traits, repères, action principale" },
  { nom: "Néon vif", variable: "--cs-neon-vif", valeur: "#38bdf8", usage: "Lueurs" },
  { nom: "Texte", variable: "--cs-texte", valeur: "#ffffff", usage: "Titres et texte courant" },
  { nom: "Texte secondaire", variable: "--cs-texte-2", valeur: "rgba(255,255,255,0.72)", usage: "Chapeaux, descriptions" },
  { nom: "Texte discret", variable: "--cs-texte-3", valeur: "rgba(255,255,255,0.56)", usage: "Mentions, légendes" },
  { nom: "Succès", variable: "--cs-succes", valeur: "#5eead4", usage: "Confirmation" },
  { nom: "Alerte", variable: "--cs-alerte", valeur: "#fbbf24", usage: "Avertissement" },
  { nom: "Erreur", variable: "--cs-erreur", valeur: "#fca5a5", usage: "Champ invalide" },
] as const;

/** Tailles de coupe des coins. */
export const COUPES = { s: 10, m: 16, l: 22 } as const;
export type Coupe = keyof typeof COUPES;

const STYLES = `
:root {
  --cs-fond: #02060d;
  --cs-fond-2: #07101d;
  --cs-surface: rgba(14, 30, 50, 0.64);
  --cs-surface-2: rgba(4, 10, 20, 0.84);
  --cs-neon: #7dd3fc;
  --cs-neon-vif: #38bdf8;
  --cs-neon-doux: rgba(125, 211, 252, 0.34);
  --cs-neon-voile: rgba(56, 189, 248, 0.14);
  --cs-texte: #ffffff;
  --cs-texte-2: rgba(255, 255, 255, 0.72);
  --cs-texte-3: rgba(255, 255, 255, 0.56);
  --cs-trait: rgba(255, 255, 255, 0.08);
  --cs-succes: #5eead4;
  --cs-alerte: #fbbf24;
  --cs-erreur: #fca5a5;
  --cs-lueur: drop-shadow(0 0 3px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 12px rgba(56, 189, 248, 0.35));
  --cs-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --cs-rapide: 160ms;
  --cs-moyen: 240ms;
  --cs-lent: 420ms;
}

/* Focus clavier : jamais d'anneau détaché de la forme. Chaque élément du
   système s'allume par son propre bord (tracé, lueur, trait), comme au survol. */
:is([class^="cs"], [class*=" cs"]):focus-visible { outline: none; }

/* Coupe des coins : haut gauche et bas droite. La variable se déclare là où
   la taille est connue, sinon elle garderait la taille de la racine. */
.csCoupe { --cs-c: 16px; --cs-clip: polygon(var(--cs-c) 0, 100% 0, 100% calc(100% - var(--cs-c)), calc(100% - var(--cs-c)) 100%, 0 100%, 0 var(--cs-c)); }
.csCoupe[data-coupe="s"] { --cs-c: 10px; }
.csCoupe[data-coupe="l"] { --cs-c: 22px; }

/* Panneau de verre. */
.csPanneau { position: relative; isolation: isolate; }
.csVerre {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  clip-path: var(--cs-clip);
  background: linear-gradient(165deg, var(--cs-surface), var(--cs-surface-2));
}
@media (min-width: 1024px) {
  .csPanneau[data-flou] > .csVerre { backdrop-filter: blur(14px) saturate(140%); -webkit-backdrop-filter: blur(14px) saturate(140%); }
}

/* Bord d'un pixel qui suit la coupe : un anneau rectangulaire rogné par la
   coupe, et deux diagonales pour refermer les coins. */
.csBord {
  position: absolute; inset: 0; padding: 1px; pointer-events: none;
  background: var(--cs-bord, var(--cs-neon-doux));
  clip-path: var(--cs-clip);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  transition: background-color var(--cs-rapide) linear;
}
.csDiag {
  position: absolute; height: 1px; width: calc(var(--cs-c) * 1.4142); pointer-events: none;
  background: var(--cs-bord, var(--cs-neon-doux));
}
.csDiag[data-coin="hg"] { left: 0; top: var(--cs-c); transform-origin: 0 0; rotate: -45deg; }
.csDiag[data-coin="bd"] { right: 0; top: calc(100% - var(--cs-c)); transform-origin: 100% 0; rotate: -45deg; }
.csPanneau[data-accent] { --cs-bord: var(--cs-neon); }
.csPanneau[data-accent] > .csBord, .csPanneau[data-accent] > .csDiag { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.7)); }

/* Tracé au survol : deux traits partent de coins opposés, suivent le bord
   coupé et se rejoignent (haut puis droite depuis le coin haut gauche, bas
   puis gauche depuis le coin bas droit). Au départ du survol, ils se
   retirent dans l'ordre inverse. Le délai se lit dans l'état d'arrivée. */
.csTrace {
  position: absolute; z-index: 2; pointer-events: none;
  background: var(--cs-trace, var(--cs-neon)); box-shadow: 0 0 8px rgba(56, 189, 248, 0.85);
  transition: scale 200ms linear;
}
.csTrace[data-cote="haut"] { top: 0; left: var(--cs-c); right: 0; height: 1px; transform-origin: 0 50%; scale: 0 1; transition-delay: 270ms; }
.csTrace[data-cote="droite"] { top: 0; right: 0; bottom: var(--cs-c); width: 1px; transform-origin: 50% 0; scale: 1 0; transition-delay: 70ms; }
.csTrace[data-cote="bd"] { right: 0; top: calc(100% - var(--cs-c)); width: calc(var(--cs-c) * 1.4142); height: 1px; transform-origin: 100% 0; rotate: -45deg; scale: 0 1; transition-duration: 70ms; }
.csTrace[data-cote="bas"] { bottom: 0; left: 0; right: var(--cs-c); height: 1px; transform-origin: 100% 50%; scale: 0 1; transition-delay: 270ms; }
.csTrace[data-cote="gauche"] { left: 0; top: var(--cs-c); bottom: 0; width: 1px; transform-origin: 50% 100%; scale: 1 0; transition-delay: 70ms; }
.csTrace[data-cote="hg"] { left: 0; top: var(--cs-c); width: calc(var(--cs-c) * 1.4142); height: 1px; transform-origin: 0 0; rotate: -45deg; scale: 0 1; transition-duration: 70ms; }
.csTracable:is(:hover, :focus-visible, :has(:focus-visible)) > .csTrace { scale: 1 1; }
.csTracable:is(:hover, :focus-visible, :has(:focus-visible)) > .csTrace:is([data-cote="haut"], [data-cote="bas"]) { transition-delay: 0ms; }
.csTracable:is(:hover, :focus-visible, :has(:focus-visible)) > .csTrace:is([data-cote="droite"], [data-cote="gauche"]) { transition-delay: 200ms; }
.csTracable:is(:hover, :focus-visible, :has(:focus-visible)) > .csTrace:is([data-cote="bd"], [data-cote="hg"]) { transition-delay: 400ms; }

/* Équerres : les deux coins non coupés, posés hors du panneau. */
.csEquerre { position: absolute; width: 14px; height: 14px; pointer-events: none; color: var(--cs-neon); filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8)); }
.csEquerre[data-coin="hd"] { top: -6px; right: -6px; border-top: 1.5px solid; border-right: 1.5px solid; }
.csEquerre[data-coin="bg"] { bottom: -6px; left: -6px; border-bottom: 1.5px solid; border-left: 1.5px solid; }

/* Allumage : le scintillement d'un tube qui s'allume, une seule fois. */
.csAllume { opacity: 0; animation: csAllume 560ms ease-out forwards; }
@keyframes csAllume {
  0% { opacity: 0; } 30% { opacity: 0.85; } 38% { opacity: 0.2; }
  52% { opacity: 1; } 62% { opacity: 0.6; } 100% { opacity: 1; }
}

/* Grille de points, le fond des sections. */
.csGrille {
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1.4px);
  background-size: 28px 28px;
}

/* Boutons. */
.csBouton {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center;
  gap: 12px; white-space: nowrap; font-weight: 600; letter-spacing: 0.01em;
  transition: filter var(--cs-moyen) var(--cs-ease), translate var(--cs-rapide) var(--cs-ease);
}
.csBouton[data-taille="m"] { height: 48px; padding: 0 22px 0 24px; font-size: 15px; }
.csBouton[data-taille="l"] { height: 56px; padding: 0 26px 0 30px; font-size: 16px; }
.csBouton:active { translate: 0 1px; }
.csBouton[aria-disabled="true"] { opacity: 0.42; pointer-events: none; }
.csBoutonFond { position: absolute; inset: 0; z-index: -1; clip-path: var(--cs-clip); overflow: hidden; transition: background-color var(--cs-rapide) linear; }
.csBoutonFleche { transition: translate var(--cs-moyen) var(--cs-ease); }
.csBouton:is(:hover, :focus-visible) .csBoutonFleche { translate: 4px 0; }

/* Reflet : une bande claire traverse le bouton au survol. */
.csBoutonFond::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: -40%; width: 30%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  translate: 0 0; opacity: 0;
}
.csBouton:hover .csBoutonFond::after { animation: csReflet 700ms var(--cs-ease); }
@keyframes csReflet { 0% { opacity: 1; translate: 0 0; } 100% { opacity: 0; translate: 480% 0; } }

/* CTA principal : plein néon, texte nuit. */
.csBouton[data-variante="principal"] { color: #02060d; }
.csBouton[data-variante="principal"] .csBoutonFond { background: var(--cs-neon); }
.csBouton[data-variante="principal"]:is(:hover, :focus-visible) { filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.6)); }
.csBouton[data-variante="principal"]:is(:hover, :focus-visible) .csBoutonFond { background: #a8e4fd; }

/* CTA variante 1 : verre et bord néon. */
.csBouton[data-variante="secondaire"] { color: var(--cs-texte); }
.csBouton[data-variante="secondaire"] .csBoutonFond { background: rgba(56, 189, 248, 0.06); }
.csBouton[data-variante="secondaire"] .csBoutonFond::after { background: linear-gradient(100deg, transparent, rgba(125, 211, 252, 0.28), transparent); }
.csBouton[data-variante="secondaire"] .csBoutonFleche { color: var(--cs-neon); }
.csBouton[data-variante="secondaire"]:is(:hover, :focus-visible) { --cs-bord: var(--cs-neon); filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.45)); }
.csBouton[data-variante="secondaire"]:is(:hover, :focus-visible) .csBoutonFond { background: var(--cs-neon-voile); }

/* CTA variante 2 : lien d'instrument, un repère et un trait qui s'allonge. */
.csBouton[data-variante="tertiaire"] { height: auto; padding: 6px 2px; gap: 10px; color: var(--cs-texte); }
.csRepere { width: 6px; height: 6px; background: var(--cs-neon); box-shadow: 0 0 8px rgba(56, 189, 248, 0.9); rotate: 45deg; }
.csSouligne { position: absolute; left: 18px; right: 0; bottom: 0; height: 1px; background: var(--cs-neon); transform-origin: 0 50%; scale: 0.25 1; transition: scale var(--cs-moyen) var(--cs-ease); box-shadow: 0 0 6px rgba(56, 189, 248, 0.8); }
.csBouton[data-variante="tertiaire"]:hover .csSouligne, .csBouton[data-variante="tertiaire"]:focus-visible .csSouligne { scale: 1 1; }
.csBouton[data-variante="tertiaire"] .csBoutonFleche { color: var(--cs-neon); }

/* Chargement. */
.csRoue { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid currentColor; border-right-color: transparent; animation: csTourne 800ms linear infinite; }
@keyframes csTourne { to { rotate: 360deg; } }

@media (prefers-reduced-motion: reduce) {
  .csAllume { animation: none; opacity: 1; }
  .csBouton, .csBoutonFleche, .csSouligne, .csBord, .csTrace { transition: none; }
  .csBouton:hover .csBoutonFond::after { animation: none; }
  .csRoue { animation-duration: 2400ms; }
}
`;

/** Feuille du système. Rendue par chaque composant, placée une seule fois. */
export function StylesConsole() {
  return (
    <>
      <style href="console-ds" precedence="ds">
        {STYLES}
      </style>
      <StylesLiens />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Panneau                                                             */
/* ------------------------------------------------------------------ */

export interface PanneauProps {
  children: ReactNode;
  /** Taille de la coupe des coins. */
  coupe?: Coupe;
  /** Bord néon franc et lueur : réservé à la pièce principale d'un écran. */
  accent?: boolean;
  /** Équerres sur les deux coins non coupés. */
  equerres?: boolean;
  /** Flou de ce qui passe derrière, sur grand écran seulement. */
  flou?: boolean;
  /** Le bord se trace au survol et au focus clavier d'un élément intérieur. */
  trace?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Élément rendu : `section` ou `article` quand le panneau porte un titre. */
  as?: "div" | "section" | "article" | "aside";
}

/**
 * Le panneau de verre à bords coupés : carte, console, fenêtre, menu.
 * Tout ce qui se pose sur le fond passe par lui.
 */
export function Panneau({ children, coupe = "m", accent, equerres, flou, trace, className = "", style, as: Balise = "div" }: PanneauProps) {
  return (
    <Balise
      className={`csPanneau csCoupe ${trace ? "csTracable " : ""}${className}`}
      data-coupe={coupe}
      data-accent={accent ? "" : undefined}
      data-flou={flou ? "" : undefined}
      style={style}
    >
      <StylesConsole />
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      {equerres ? (
        <>
          <span aria-hidden="true" className="csEquerre" data-coin="hd" />
          <span aria-hidden="true" className="csEquerre" data-coin="bg" />
        </>
      ) : null}
      {trace ? <Trace /> : null}
      {children}
    </Balise>
  );
}

const COTES_TRACE = ["haut", "droite", "bd", "bas", "gauche", "hg"] as const;

/**
 * Les six traits du tracé au survol. À poser dans un élément `csCoupe
 * csTracable` (le panneau le fait avec `trace`).
 */
export function Trace() {
  return (
    <>
      {COTES_TRACE.map((cote) => (
        <span key={cote} aria-hidden="true" className="csTrace" data-cote={cote} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Étiquette et en-tête de section                                     */
/* ------------------------------------------------------------------ */

/** Libellé d'instrument : petites capitales espacées, en néon. */
export function Etiquette({ children, index, className = "" }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <p className={`type-caption flex items-center gap-3 uppercase tracking-[0.22em] text-(--cs-neon) ${className}`}>
      {index !== undefined ? (
        <span aria-hidden="true" className="tabular-nums text-(--cs-neon)/60">
          {String(index).padStart(2, "0")}
        </span>
      ) : null}
      {children}
    </p>
  );
}

/** Surtitre, titre de section et trait néon. */
export function EnTeteSection({
  surtitre,
  titre,
  chapeau,
  index,
}: {
  surtitre: string;
  titre: string;
  chapeau?: string;
  index?: number;
}) {
  return (
    <header className="max-w-[640px]">
      <StylesConsole />
      <Etiquette index={index}>{surtitre}</Etiquette>
      <h2 className="type-h2 mt-4 text-white">{titre}</h2>
      <span aria-hidden="true" className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      {chapeau ? <p className="type-lead mt-5 text-(--cs-texte-2)">{chapeau}</p> : null}
    </header>
  );
}
