/**
 * Feuille partagée de la famille Sections Image (système Console).
 *
 * Une seule feuille pour les quatre composants : ImageTexte, ImageAccordeon,
 * ImageListe, Parallaxe. React ne l'insère qu'une fois (href "console-sections").
 * Toutes les classes sont préfixées csSec pour hériter de la règle de focus
 * des fondations (outline supprimé ; le focus se voit par le bord néon).
 *
 * Animations en CSS, propriété translate/rotate/scale jamais transform.
 * Mouvement réduit neutralisé par @media (prefers-reduced-motion: reduce).
 * Parallaxe en amélioration progressive (animation-timeline: view()) ; sans
 * prise en charge, le fond reste fixe et propre.
 */

const STYLES_SECTIONS = `
/* ===================== Grille image + texte ===================== */
.csSecGrille {
  display: grid;
  gap: 40px;
  align-items: center;
}
@media (min-width: 768px) {
  .csSecGrille {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
  .csSecGrille[data-inverse="true"] > .csSecCadreImg {
    order: 2;
  }
  .csSecGrille[data-inverse="true"] > .csSecBloc {
    order: 1;
  }
}

/* ===================== Cadre image coupé ===================== */
/* Le <Panneau equerres> gère le clip-path et les équerres.
   On contraint les proportions ici. */
.csSecCadreImg {
  position: relative;
  /* Rapport 4/3 sur téléphone, 3/4 sur bureau si portrait, libre sinon. */
  aspect-ratio: 4/3;
}
.csSecCadreImg img { object-fit: cover; }
/* L'image suit la coupe du panneau, rien ne déborde des coins ; le bord,
   les diagonales et les équerres restent au-dessus d'elle. */
.csSecCadreImg .csPanneau > img,
.csSecAccImg { clip-path: var(--cs-clip); }
:is(.csSecCadreImg, .csSecAccImgZone) .csPanneau > :is(.csBord, .csDiag, .csEquerre) { z-index: 1; }

/* ===================== Accordéon image ===================== */
.csSecAccGrille {
  display: grid;
  gap: 40px;
  align-items: start;
}
@media (min-width: 768px) {
  .csSecAccGrille {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
}

/* Zone image de l'accordéon : empilement des images, fondu entre elles. */
.csSecAccImgZone {
  position: relative;
  aspect-ratio: 4/3;
}
.csSecAccImg {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--cs-lent) var(--cs-ease);
}
.csSecAccImg[data-active="true"] {
  opacity: 1;
}

/* Bouton d'item d'accordéon. */
.csSecAccItem {
  border-bottom: 1px solid var(--cs-trait);
}
.csSecAccItem:first-of-type {
  border-top: 1px solid var(--cs-trait);
}
.csSecAccBtn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px 0 20px 12px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--cs-texte-2);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  transition: color var(--cs-rapide) linear;
}
/* Indicateur de focus et survol : barre néon gauche. */
.csSecAccBtn::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: var(--cs-neon);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
  opacity: 0;
  scale: 1 0.3;
  transition: opacity 160ms linear, scale 220ms var(--cs-ease);
}
.csSecAccBtn:is(:hover, :focus-visible) {
  color: var(--cs-texte);
}
.csSecAccBtn:is(:hover, :focus-visible)::before {
  opacity: 1;
  scale: 1 1;
}
.csSecAccBtn[aria-expanded="true"] {
  color: var(--cs-texte);
}
.csSecAccBtn[aria-expanded="true"]::before {
  opacity: 1;
  scale: 1 1;
}
.csSecAccSigne {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-left: auto;
  color: var(--cs-neon);
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.7));
  transition: rotate var(--cs-moyen) var(--cs-ease);
}
.csSecAccBtn[aria-expanded="true"] .csSecAccSigne {
  rotate: 45deg;
}
/* Corps de l'item : grid-template-rows 0fr -> 1fr pour l'animation. */
.csSecAccCorps {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--cs-lent) var(--cs-ease);
}
.csSecAccCorps[data-open="true"] {
  grid-template-rows: 1fr;
}
.csSecAccCorpsInner {
  overflow: hidden;
}

/* ===================== Liste numérotée ===================== */
.csSecListeItem {
  position: relative;
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 0 8px;
  padding: 18px 0;
  border-bottom: 1px solid var(--cs-trait);
  text-decoration: none;
}
.csSecListeItem:last-child {
  border-bottom: none;
}
/* Barre néon gauche au survol (identique au hero). */
.csSecListeItem::before {
  content: "";
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 2px;
  background: var(--cs-neon);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
  opacity: 0;
  scale: 1 0.3;
  transition: opacity 160ms linear, scale 220ms var(--cs-ease);
}
/* Trait de séparation entre items. */
.csSecListeItem::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
}
li:first-child > .csSecListeItem::after { display: none; }
.csSecListeIdx {
  color: rgba(125, 211, 252, 0.6);
  font-variant-numeric: tabular-nums;
  transition: color 160ms linear, text-shadow 160ms linear;
}
.csSecListeTexte {
  min-width: 0;
}
/* Surbrillance avec fond dégradé. */
.csSecListeLien {
  background:
    linear-gradient(90deg, rgba(56, 189, 248, 0.16), rgba(56, 189, 248, 0) 72%)
    no-repeat;
  background-size: 0% 100%;
  transition: background-size 280ms ease-out;
}
.csSecListeLien:is(:hover, :focus-visible) {
  background-size: 100% 100%;
}
.csSecListeLien:is(:hover, :focus-visible)::before {
  opacity: 1;
  scale: 1 1;
}
.csSecListeLien:is(:hover, :focus-visible) .csSecListeIdx {
  color: var(--cs-neon);
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
}

/* Item sans lien (non cliquable). */
.csSecListeStatique::before { display: none; }

/* ===================== Parallaxe ===================== */
.csSecParallaxe {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.csSecParallaxeFond {
  position: absolute;
  /* Surdimensionné pour permettre le glissement. */
  inset: -15% 0;
  scale: 1;
}
.csSecParallaxeFond img {
  object-fit: cover;
  object-position: center;
}
/* Amélioration progressive : animation liée au défilement de la section. */
@supports (animation-timeline: view()) {
  .csSecParallaxeFond {
    animation: csSecGlisse linear both;
    animation-timeline: view(block);
    animation-range: entry 0% exit 100%;
  }
}
@keyframes csSecGlisse {
  from { translate: 0 -10%; }
  to   { translate: 0 10%; }
}
/* Voile sombre : lisibilité du texte sur l'image. */
.csSecVoile {
  position: absolute;
  inset: 0;
  background: linear-gradient(165deg, rgba(2, 6, 13, 0.82), rgba(2, 6, 13, 0.60));
  z-index: 1;
}
/* Contenu de la section parallaxe. */
.csSecParallaxeContenu {
  position: relative;
  z-index: 2;
}

/* ===================== Mouvement réduit ===================== */
@media (prefers-reduced-motion: reduce) {
  .csSecAccImg,
  .csSecAccBtn::before,
  .csSecAccBtn,
  .csSecAccSigne,
  .csSecAccCorps,
  .csSecListeItem::before,
  .csSecListeIdx,
  .csSecListeLien { transition: none; }

  /* Parallaxe immobile : l'image reste à sa position naturelle. */
  .csSecParallaxeFond {
    animation: none;
    inset: 0;
  }
}
`;

/** Feuille partagée de la famille Sections Image. Rendue par chaque composant. */
export function StylesSections() {
  return (
    <style href="console-sections" precedence="ds">
      {STYLES_SECTIONS}
    </style>
  );
}
