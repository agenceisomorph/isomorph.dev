/**
 * Carte de service ou d'article.
 *
 * La carte entière est cliquable via un lien bloc (pas de liens imbriqués).
 * La structure interne reprend celle de Panneau (csVerre, csBord, csDiag)
 * directement sur le lien afin d'éviter un élément enveloppant superflu.
 *
 * RGAA 4.1 :
 *  - Critère 6.1 : l'intitulé du lien est fourni par le titre visible.
 *  - Critère 10.7 : au focus, le bord se trace comme au survol.
 * Éco : Server Component, aucun état.
 *
 * StylesContenus est défini ici et réexporté pour toute la famille.
 * React ne l'insère qu'une fois grâce au href identifié "console-contenus".
 */

import Link from "next/link";

import { StylesConsole, Trace } from "../fondations";

/* ------------------------------------------------------------------ */
/* Feuille partagée de la famille Contenus                             */
/* ------------------------------------------------------------------ */

const STYLES_CONTENUS = `
/* ===================== Carte ===================== */
/* Au survol et au focus, le bord se trace (csTrace des fondations). */
.csContCarte {
  text-decoration: none;
  display: block;
}
.csContCarteFleche {
  transition: translate var(--cs-moyen) var(--cs-ease);
}
.csContCarte:hover .csContCarteFleche,
.csContCarte:focus-visible .csContCarteFleche {
  translate: 4px 0;
}

/* ===================== Badge ===================== */
.csContBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.csContBadgePt {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.csContBadge[data-var="neutre"] {
  color: var(--cs-texte-3);
  background: rgba(255, 255, 255, 0.06);
}
.csContBadge[data-var="neon"] {
  color: var(--cs-neon);
  background: var(--cs-neon-voile);
}
.csContBadge[data-var="succes"] {
  color: var(--cs-succes);
  background: rgba(94, 234, 212, 0.1);
}
.csContBadge[data-var="alerte"] {
  color: var(--cs-alerte);
  background: rgba(251, 191, 36, 0.1);
}
.csContBadge[data-var="erreur"] {
  color: var(--cs-erreur);
  background: rgba(252, 165, 165, 0.1);
}
.csContBadge[data-var="neutre"] .csContBadgePt { background: var(--cs-texte-3); }
.csContBadge[data-var="neon"] .csContBadgePt {
  background: var(--cs-neon);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.9);
}
.csContBadge[data-var="succes"] .csContBadgePt {
  background: var(--cs-succes);
  box-shadow: 0 0 6px rgba(94, 234, 212, 0.7);
}
.csContBadge[data-var="alerte"] .csContBadgePt {
  background: var(--cs-alerte);
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.7);
}
.csContBadge[data-var="erreur"] .csContBadgePt {
  background: var(--cs-erreur);
  box-shadow: 0 0 6px rgba(252, 165, 165, 0.7);
}

/* ===================== Accordéon ===================== */
.csContAcc { border-bottom: 1px solid var(--cs-trait); }
.csContAcc:first-child { border-top: 1px solid var(--cs-trait); }
.csContAccBtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 18px 0;
  gap: 16px;
  text-align: left;
  color: var(--cs-texte-2);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  transition: color var(--cs-rapide) linear;
}
.csContAccBtn:hover,
.csContAccBtn:focus-visible { color: var(--cs-texte); }
/* Question atteinte au clavier : son filet s'allume. */
.csContAcc:has(.csContAccBtn:focus-visible) { border-bottom-color: var(--cs-neon); }
.csContAccSigne {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--cs-neon);
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.7));
  transition: rotate var(--cs-moyen) var(--cs-ease);
}
.csContAccBtn[aria-expanded="true"] .csContAccSigne { rotate: 45deg; }
/* Technique grid : grid-template-rows 0fr -> 1fr */
.csContAccCorps {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--cs-lent) var(--cs-ease);
}
.csContAccCorps[data-open="true"] { grid-template-rows: 1fr; }
.csContAccCorpsInner { overflow: hidden; }

/* ===================== Tableau ===================== */
.csContTableauZone {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
/* Zone atteinte au clavier : la légende et le filet d'en-tête s'allument. */
.csContTableauZone:focus-visible caption { color: var(--cs-neon); }
.csContTableauZone:focus-visible th { border-bottom-color: var(--cs-neon); }
.csContTableau {
  width: 100%;
  min-width: 320px;
  border-collapse: collapse;
  caption-side: top;
}
.csContTableau caption {
  text-align: left;
  padding-bottom: 12px;
  color: var(--cs-texte-3);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.csContTableau th,
.csContTableau td {
  padding: 11px 16px;
  text-align: left;
  border-bottom: 1px solid var(--cs-trait);
}
.csContTableau th {
  font-weight: 600;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cs-neon);
  border-bottom-color: rgba(125, 211, 252, 0.18);
}
.csContTableau td { color: var(--cs-texte-2); }
.csContTableau tbody tr:last-child td { border-bottom: none; }
.csContTableau tbody tr:hover td {
  background: rgba(56, 189, 248, 0.04);
  color: var(--cs-texte);
}
.csContTableauNum { font-variant-numeric: tabular-nums; }

/* ===================== Relevé d'instrument ===================== */
.csContLecture {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.csContLectureVal {
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1;
}

/* ===================== Liste de services ===================== */
.csContLigne {
  position: relative;
  display: grid;
  text-decoration: none;
  background:
    linear-gradient(90deg, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0) 72%)
    no-repeat;
  background-size: 0% 100%;
  transition: background-size 280ms ease-out;
}
.csContLigne::before {
  content: "";
  position: absolute;
  left: 0; top: 14px; bottom: 14px;
  width: 2px;
  background: var(--cs-neon);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
  opacity: 0;
  scale: 1 0.3;
  transition: opacity 160ms linear, scale 220ms ease-out;
}
.csContLigne::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}
li:first-child > .csContLigne::after { display: none; }
.csContLigneIdx {
  color: rgba(125, 211, 252, 0.6);
  transition: color 160ms linear, text-shadow 160ms linear;
}
.csContLigneFleche {
  color: rgba(255, 255, 255, 0.35);
  transition: translate 200ms ease-out, color 160ms linear;
}
.csContLigne:hover,
.csContLigne:focus-visible { background-size: 100% 100%; }
.csContLigne:hover::before,
.csContLigne:focus-visible::before { opacity: 1; scale: 1 1; }
.csContLigne:hover .csContLigneIdx,
.csContLigne:focus-visible .csContLigneIdx {
  color: var(--cs-neon);
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
}
.csContLigne:hover .csContLigneFleche,
.csContLigne:focus-visible .csContLigneFleche {
  translate: 4px 0;
  color: var(--cs-neon);
}

/* ===================== Encadré ===================== */
.csContEncadre {
  border-left: 2px solid var(--cs-neon);
  padding: 16px 20px;
  background: var(--cs-neon-voile);
  filter: drop-shadow(-3px 0 8px rgba(56, 189, 248, 0.3));
}
.csContEncadre[data-var="alerte"] {
  border-left-color: var(--cs-alerte);
  background: rgba(251, 191, 36, 0.06);
  filter: drop-shadow(-3px 0 8px rgba(251, 191, 36, 0.3));
}

/* ===================== Pied de page ===================== */
.csContPied {
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1.4px
  );
  background-size: 28px 28px;
}
.csContPiedFilet {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(125, 211, 252, 0.34) 15%,
    rgba(125, 211, 252, 0.34) 85%,
    transparent
  );
}
.csContPiedLien {
  display: block;
  width: fit-content;
  border-radius: 2px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: color var(--cs-rapide) linear;
}
.csContPiedLien:is(:hover, :focus-visible) { color: var(--cs-texte); }

/* ===================== Mouvement réduit ===================== */
@media (prefers-reduced-motion: reduce) {
  .csContCarteFleche,
  .csContAccSigne,
  .csContAccCorps,
  .csContLigne,
  .csContLigne::before,
  .csContLigneIdx,
  .csContLigneFleche { transition: none; }
}
`;

/** Feuille partagée de la famille Contenus. Rendue par chaque composant. */
export function StylesContenus() {
  return (
    <style href="console-contenus" precedence="ds">
      {STYLES_CONTENUS}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

export interface CarteProps {
  /** Numéro d'instrument affiché en en-tête, padded à 2 chiffres. */
  numero?: number;
  titre: string;
  /** Description courte, une ligne. */
  description?: string;
  href: string;
  /** Lien vers un site externe : s'ouvre dans un nouvel onglet. */
  externe?: boolean;
  /** Image décorative posée en tête de carte (format 4:3), sous la coupe. */
  visuel?: React.ReactNode;
  className?: string;
}

/**
 * Carte de service ou d'article dans un panneau de verre.
 * La carte entière est le lien (pas de liens imbriqués).
 */
export function Carte({ numero, titre, description, href, externe, visuel, className = "" }: CarteProps) {
  const attributs = {
    className: `csPanneau csCoupe csTracable csContCarte ${className}`,
    "data-coupe": "m" as const,
  };

  const corps = (
    <>
      <StylesConsole />
      <StylesContenus />
      {/* Verre, bord et diagonales du panneau */}
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <Trace />
      {/* Contenu */}
      {visuel ? (
        <span aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden">
          {visuel}
        </span>
      ) : null}
      {numero !== undefined ? (
        <p aria-hidden="true" className="type-caption tabular-nums px-5 pt-4 text-(--cs-neon)/60">
          {String(numero).padStart(2, "0")}
        </p>
      ) : null}
      <div className="px-5 pb-5 pt-2">
        <p className="type-h3 font-semibold text-white">{titre}</p>
        {description ? (
          <p className="type-caption mt-1.5 line-clamp-2 text-(--cs-texte-2)">{description}</p>
        ) : null}
        <span
          aria-hidden="true"
          className="csContCarteFleche mt-4 inline-flex items-center gap-2 text-(--cs-neon)"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
            <path
              d="M3 8H12.5M8.5 4L12.5 8L8.5 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </div>
    </>
  );

  if (externe) {
    return (
      <a {...attributs} href={href} target="_blank" rel="noopener noreferrer">
        {corps}
      </a>
    );
  }

  return (
    <Link {...attributs} href={href}>
      {corps}
    </Link>
  );
}
