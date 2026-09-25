/**
 * Feuille de styles de la famille Pages du système Console.
 *
 * Couvre les deux gabarits : article de blog et fiche projet.
 * React place cette feuille une seule fois dans la page (href "console-pages").
 * Toutes les classes sont préfixées csPag.
 *
 * Règles respectées :
 *   - Pas d'anneau outline : le focus se voit par la couleur ou le trait.
 *   - Animations par translate/rotate/scale, jamais transform.
 *   - Mouvement réduit neutralisé par @media prefers-reduced-motion.
 */

const STYLES = `
/* ===================== Colonne de lecture ===================== */
/* Article : max 720 px. La mesure se situe entre 680 px (WCAG optimal) et
   720 px (plafond donne dans le brief). */
.csPagColonne { max-width: 720px; }

/* ===================== Corps d'article ===================== */
/* Tous les enfants directs sont espacés de 24 px via flex-col + gap. */
.csPagCorps { display: flex; flex-direction: column; gap: 24px; }

/* Paragraphes : interlignage confortable pour la lecture longue. */
.csPagCorps p { line-height: 1.8; color: rgba(255,255,255,0.72); }
.csPagCorps strong { color: #fff; font-weight: 600; }

/* Liens dans le corps : néon, soulignés au repos, crochets au survol (csLienTexte). */
.csPagCorps a { color: var(--cs-neon); }

/* Intertitres h2 dans le corps : trait discret dessous. */
.csPagCorps h2 {
  margin-top: 48px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.csPagCorps h2:first-child { margin-top: 0; }

/* Sous-titres h3 : 8 px de plus que le rythme, pour se rattacher au texte qui suit. */
.csPagCorps h3 { margin-top: 8px; }

/* Code en ligne : chasse fixe à 0,875 em pour suivre le corps sans paraître plus gros. */
.csPagCorps :not(pre) > code {
  padding: 1px 6px;
  border: 1px solid rgba(125,211,252,0.16);
  background: rgba(125,211,252,0.06);
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 0.875em;
  color: #e0f2fe;
  overflow-wrap: anywhere;
}

/* ===================== Citation (blockquote) ===================== */
.csPagCitation {
  padding: 20px 24px;
  border-left: 2px solid var(--cs-neon);
  background: var(--cs-neon-voile);
  font-style: italic;
  color: rgba(255,255,255,0.72);
  filter: drop-shadow(-3px 0 8px rgba(56,189,248,0.22));
  line-height: 1.7;
}

/* ===================== Figure ===================== */
.csPagFigure { margin: 0; overflow: hidden; }

/* ===================== Image habillée (FigureArticle) ===================== */
/* Passe-partout de verre de 6 px ; l'image garde la coupe du panneau, moins le retrait. */
.csPagFig { margin: 8px 0; }
.csPagFigCadre { padding: 6px; }
.csPagFigImg {
  position: relative; overflow: hidden;
  clip-path: polygon(calc(var(--cs-c) - 4px) 0, 100% 0, 100% calc(100% - var(--cs-c) + 4px), calc(100% - var(--cs-c) + 4px) 100%, 0 100%, 0 calc(var(--cs-c) - 4px));
}
.csPagFigImg img { filter: brightness(0.94) saturate(0.96); }
/* Vignette : les bords clairs de l'illustration s'assombrissent vers le fond nuit,
   un filet néon très léger marque le haut. */
.csPagFigVoile {
  position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 36px 2px rgba(2, 6, 13, 0.3), inset 0 1px 0 rgba(125, 211, 252, 0.28);
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.05), transparent 40%, rgba(2, 6, 13, 0.12));
}

/* ===================== Séparateur auteur (haut colonne) ===================== */
.csPagAuteurLigne {
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding-bottom: 24px;
  margin-bottom: 32px;
}

/* ===================== Sommaire de lecture ===================== */
/* Position collante sous la barre (64 px) + marge (24 px). */
.csPagSommaire {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 112px);
  overflow-y: auto;
}
/* Item du sommaire. */
.csPagSomItem {
  display: block;
  min-height: 44px;
  padding: 8px 0 8px 12px;
  line-height: 1.4;
  color: rgba(255,255,255,0.38);
  text-decoration: none;
  border-left: 2px solid rgba(255,255,255,0.07);
  transition: color var(--cs-rapide) linear, border-left-color var(--cs-rapide) linear;
}
.csPagSomItem:is(:hover, :focus-visible) {
  color: rgba(255,255,255,0.75);
  border-left-color: rgba(125,211,252,0.35);
}
.csPagSomItem:focus-visible { outline: none; }
.csPagSomItem[data-actif="true"] {
  color: var(--cs-texte);
  border-left-color: var(--cs-neon);
}

/* ===================== En-tête article ===================== */
/* Mobile : image pleine largeur en haut, texte dessous. */
.csPagArticleHero {
  display: flex;
  flex-direction: column-reverse;
  gap: 28px;
}
.csPagArticleImg {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
/* Bureau : image à droite, 340 px, 4/3. */
@media (min-width: 1024px) {
  .csPagArticleHero { flex-direction: row; align-items: flex-start; gap: 56px; }
  .csPagArticleImg { width: 340px; flex-shrink: 0; aspect-ratio: 4 / 3; }
}

/* ===================== Fiche projet ===================== */
/* Lignes libellé au-dessus de la valeur, dans un panneau de verre. */
.csPagFiche { overflow: hidden; }
.csPagFicheLigne {
  display: grid;
  gap: 4px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.csPagFicheLigne:last-child { border-bottom: none; }

/* Tags technologie. */
.csPagTag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid rgba(125,211,252,0.18);
  background: rgba(125,211,252,0.06);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--cs-neon);
}

/* ===================== Mouvement réduit ===================== */
@media (prefers-reduced-motion: reduce) {
  .csPagSomItem { transition: none; }
  .csPagCorps a { transition: none; }
}
`;

/** Feuille partagée de la famille Pages. Rendue par chaque composant, placée une seule fois. */
export function StylesPages() {
  return (
    <style href="console-pages" precedence="ds">
      {STYLES}
    </style>
  );
}
