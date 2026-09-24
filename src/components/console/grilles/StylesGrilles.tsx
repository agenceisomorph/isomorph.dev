/**
 * Feuille de styles de la famille Grilles du système Console.
 *
 * Rendue par Bento, Explorateur, Kpi et SectionCta.
 * React la place une seule fois dans la page (href "console-grilles").
 * Toutes les classes sont préfixées csGri pour isoler la famille.
 * Les animations utilisent les propriétés translate/rotate/scale, jamais transform.
 * @keyframes csAllume est défini dans console-ds (fondations.tsx).
 */

const STYLES_GRILLES = `
/* ===================================================================== */
/* Famille Grilles                                                        */
/* ===================================================================== */

/* ==================== Bento ==================== */
.csGriBento {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

/* La grande case est simplement plus haute sur mobile. */
.csGriBentoGrande { min-height: 240px; }

@media (min-width: 640px) {
  .csGriBento { grid-template-columns: repeat(4, 1fr); }
  /* La grande case prend 2 colonnes et 2 lignes. */
  .csGriBentoGrande { grid-column: span 2; grid-row: span 2; min-height: auto; }
}

/* Lien qui occupe toute la surface d'une case. */
.csGriBentoLien {
  display: flex;
  flex-direction: column;
  padding: 22px 24px;
  text-decoration: none;
  width: 100%;
  height: 100%;
  min-height: 160px;
}

.csGriBentoGrande .csGriBentoLien { padding: 28px 32px; }

/* Numéro de case en repère discret. */
.csGriBentoIdx {
  font-variant-numeric: tabular-nums;
  color: rgba(125, 211, 252, 0.42);
  transition: color var(--cs-rapide) linear;
}

.csGriBentoLien:is(:hover, :focus-visible) .csGriBentoIdx {
  color: var(--cs-neon);
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.7);
}

/* Sous-liste de services dans la grande case. */
.csGriBentoSubliste {
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  list-style: none;
  padding: 0;
}

.csGriBentoSousItem {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--cs-texte-3);
  transition: color var(--cs-rapide) linear;
}

.csGriBentoSousItem::before {
  content: "";
  flex-shrink: 0;
  width: 4px;
  height: 4px;
  background: var(--cs-neon);
  rotate: 45deg;
  opacity: 0.4;
  transition: opacity var(--cs-rapide) linear;
}

.csGriBentoLien:is(:hover, :focus-visible) .csGriBentoSousItem {
  color: var(--cs-texte-2);
}

.csGriBentoLien:is(:hover, :focus-visible) .csGriBentoSousItem::before {
  opacity: 0.85;
}

/* Flèche d'appel à l'action dans les cases. */
.csGriBentoFleche {
  margin-top: auto;
  align-self: flex-end;
  color: var(--cs-neon);
  opacity: 0;
  transition: opacity var(--cs-rapide) linear, translate var(--cs-moyen) var(--cs-ease);
  translate: -8px 0;
}

.csGriBentoLien:is(:hover, :focus-visible) .csGriBentoFleche {
  opacity: 1;
  translate: 0 0;
}

/* ==================== Explorateur ==================== */
.csGriExpl {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  align-items: start;
}

@media (min-width: 1024px) {
  .csGriExpl { grid-template-columns: 340px 1fr; gap: 12px; }
}

/* Panneau de liste gauche. */
.csGriExplListeWrap {
  position: relative;
}

.csGriExplListe {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Séparateur de famille. */
.csGriExplFamille {
  padding: 20px 20px 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cs-neon);
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.5));
}

.csGriExplListe > li:first-child .csGriExplFamille { padding-top: 14px; }

/* Bouton d'item : aussi un lien (a) sur desktop. */
.csGriExplBtn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: var(--cs-texte-2);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  position: relative;
  transition: color var(--cs-rapide) linear, background-color var(--cs-rapide) linear;
  text-decoration: none;
}

.csGriExplBtn::before {
  content: "";
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 2px;
  background: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.9);
  opacity: 0;
  scale: 1 0.3;
  transition: opacity 160ms linear, scale 220ms ease-out;
}

.csGriExplBtn:is(:hover, :focus-visible),
.csGriExplBtn[data-actif="true"] {
  color: var(--cs-texte);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.09), transparent 72%);
}

.csGriExplBtn:is(:hover, :focus-visible)::before,
.csGriExplBtn[data-actif="true"]::before {
  opacity: 1;
  scale: 1 1;
}

/* Index numérique discret. */
.csGriExplBtnIdx {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: rgba(125, 211, 252, 0.44);
  flex-shrink: 0;
  width: 18px;
  transition: color var(--cs-rapide) linear;
}

.csGriExplBtn:is(:hover, :focus-visible) .csGriExplBtnIdx,
.csGriExplBtn[data-actif="true"] .csGriExplBtnIdx {
  color: var(--cs-neon);
}

/* Chevron mobile : masqué sur grand écran. */
.csGriExplChevron {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--cs-neon);
  transition: rotate var(--cs-moyen) var(--cs-ease);
}

@media (min-width: 1024px) { .csGriExplChevron { display: none; } }

.csGriExplBtn[aria-expanded="true"] .csGriExplChevron { rotate: 90deg; }

/* Description mobile : toujours visible sous chaque item sur petit écran. */
.csGriExplDescMobile {
  display: block;
  padding: 0 20px 12px 50px;
  font-size: 1rem;
  font-weight: 400;
  color: var(--cs-texte-3);
  line-height: 1.5;
}

@media (min-width: 1024px) { .csGriExplDescMobile { display: none; } }

/* Panneau de relevé à droite : masqué sur mobile. */
.csGriExplReleve {
  display: none;
  flex-direction: column;
  gap: 14px;
  padding: 28px 32px;
}

@media (min-width: 1024px) { .csGriExplReleve { display: flex; } }

/* Lien de navigation dans le panneau droit. */
.csGriExplReleveBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--cs-neon);
  font-size: 1rem;
  font-weight: 600;
  transition: filter var(--cs-rapide) linear, translate var(--cs-rapide) var(--cs-ease);
}

.csGriExplReleveFleche {
  transition: translate var(--cs-moyen) var(--cs-ease);
}

.csGriExplReleveBtn:is(:hover, :focus-visible) {
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
}

.csGriExplReleveBtn:is(:hover, :focus-visible) .csGriExplReleveFleche {
  translate: 4px 0;
}

.csGriExplFilet {
  height: 1px;
  background: linear-gradient(90deg, var(--cs-neon-doux), transparent 80%);
  margin-bottom: 4px;
}

/* ==================== KPI ==================== */
.csGriKpi {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.csGriKpiItem {
  flex: 1 1 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 22px;
  opacity: 0;
  animation: csAllume 560ms ease-out forwards;
}

.csGriKpiItem:nth-child(1) { animation-delay: 0ms; }
.csGriKpiItem:nth-child(2) { animation-delay: 120ms; }
.csGriKpiItem:nth-child(3) { animation-delay: 240ms; }
.csGriKpiItem:nth-child(4) { animation-delay: 360ms; }

.csGriKpiVal {
  display: flex;
  align-items: baseline;
  gap: 8px;
  line-height: 1;
}

.csGriKpiSource {
  margin-top: auto;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.36);
}

/* ==================== SectionCta ==================== */
.csGriCta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 80px 24px;
  text-align: center;
}

.csGriCtaDecorWrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

/* Les groupes d'orbite tournent autour de leur propre centre. */
.csGriCtaOrbite {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: csGriTourne 200s linear infinite;
}

.csGriCtaOrbite[data-sens="inverse"] {
  animation-duration: 130s;
  animation-direction: reverse;
}

@keyframes csGriTourne { to { rotate: 360deg; } }

.csGriCtaPoint {
  filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.9));
}

.csGriCtaBoutons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

/* ==================== Mouvement réduit ==================== */
@media (prefers-reduced-motion: reduce) {
  .csGriBentoIdx,
  .csGriBentoSousItem,
  .csGriBentoSousItem::before,
  .csGriBentoFleche,
  .csGriExplBtn,
  .csGriExplBtn::before,
  .csGriExplBtnIdx,
  .csGriExplChevron,
  .csGriExplReleveFleche,
  .csGriExplReleveBtn { transition: none; }

  .csGriKpiItem { animation: none; opacity: 1; }

  .csGriCtaOrbite { animation: none; }
}
`;

/** Feuille partagée de la famille Grilles. Rendue par chaque composant. */
export function StylesGrilles() {
  return (
    <style href="console-grilles" precedence="ds">
      {STYLES_GRILLES}
    </style>
  );
}
