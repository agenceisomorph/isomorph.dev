/**
 * Famille « Décors » du système Console : feuille de style partagée.
 *
 * Une seule feuille pour les huit pièces. Chaque composant l'importe et
 * React ne la place qu'une fois dans la page (même `href`).
 *
 * Règles d'animation :
 * - uniquement `rotate`, `scale`, `translate`, `opacity`, `stroke-dashoffset`
 * - pas de `transform` direct : évite les conflits avec les moteurs de
 *   composition du navigateur
 * - rotations lentes (20 à 240 s), jamais de clignotement
 * - mouvement réduit : tout immobile
 */

/** Feuille des décors. Rendue par chaque pièce, placée une seule fois. */
export function StylesDecors() {
  return (
    <style href="console-decors" precedence="ds">
      {STYLES}
    </style>
  );
}

const STYLES = `
/* ------------------------------------------------------------------ */
/* Cadran                                                               */
/* ------------------------------------------------------------------ */
.csDecCadranRoue {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: csDecTourne 120s linear infinite;
}
.csDecCadranAxe { opacity: 0.18; }

/* ------------------------------------------------------------------ */
/* Orbites                                                              */
/* ------------------------------------------------------------------ */
.csDecOrbiteSens {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: csDecTourne 180s linear infinite;
}
.csDecOrbiteSens[data-sens="inverse"] {
  animation-direction: reverse;
  animation-duration: 130s;
}
.csDecOrbiteSens[data-sens="satellite"] {
  animation-duration: 60s;
}

/* ------------------------------------------------------------------ */
/* Radar                                                                */
/* ------------------------------------------------------------------ */
/*
 * transform-box: view-box garantit que transform-origin: 50% 50%
 * pointe sur (100, 100) dans le viewBox 200x200, peu importe la
 * bounding-box asymétrique du groupe wedge + faisceau.
 */
.csDecRadarCone {
  transform-box: view-box;
  transform-origin: 50% 50%;
  animation: csDecTourne 4s linear infinite;
}
/*
 * Les échos n'ont plus de data-delai : leur animation-delay est calculé
 * en ligne (relèvement / 360 * période), ce qui synchronise précisément
 * l'allumage avec le passage du faisceau. La keyframe décrit le déclin
 * phosphore après l'allumage.
 */
.csDecEcho {
  opacity: 0;
  animation-name: csDecEcho;
  animation-duration: 4s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes csDecEcho {
  0%   { opacity: 0; }
  3%   { opacity: 0.95; }
  8%   { opacity: 0.65; }
  70%  { opacity: 0.10; }
  75%  { opacity: 0; }
  100% { opacity: 0; }
}

/* ------------------------------------------------------------------ */
/* Viseur                                                               */
/* ------------------------------------------------------------------ */
/*
 * Quatre keyframes directionnelles : chaque crochet converge vers le
 * centre selon son axe diagonal propre. Aucun scale, uniquement translate.
 * Tous démarrent en phase (animation-delay: 0) pour un cycle cohérent.
 */
.csDecViseurHG { animation: csDecViseurHG 6s ease-in-out infinite; }
.csDecViseurHD { animation: csDecViseurHD 6s ease-in-out infinite; }
.csDecViseurBD { animation: csDecViseurBD 6s ease-in-out infinite; }
.csDecViseurBG { animation: csDecViseurBG 6s ease-in-out infinite; }

.csDecViseurLosange {
  opacity: 0;
  animation: csDecViseurLosange 6s ease-in-out infinite;
}

/* Anneau extérieur segmenté : rotation lente indépendante */
.csDecViseurAnneau {
  transform-box: view-box;
  transform-origin: 50% 50%;
  animation: csDecTourne 20s linear infinite;
}

/* -- crochet haut-gauche : écarté vers (-x, -y), convergé vers (+x, +y) -- */
@keyframes csDecViseurHG {
  0%, 5%  { translate: 0px 0px;   opacity: 1; }
  18%     { translate: -5px -5px; opacity: 1; }
  30%     { translate: -5px -5px; opacity: 1; }
  48%     { translate: 7px 7px;   opacity: 1; }
  52%     { translate: 6px 6px;   opacity: 1; }
  55%     { translate: 6px 6px;   opacity: 0; }
  58%     { translate: 6px 6px;   opacity: 1; }
  61%     { translate: 6px 6px;   opacity: 0; }
  64%     { translate: 6px 6px;   opacity: 1; }
  75%     { translate: 6px 6px;   opacity: 1; }
  90%     { translate: 0px 0px;   opacity: 1; }
  100%    { translate: 0px 0px;   opacity: 1; }
}

/* -- crochet haut-droit : écarté vers (+x, -y), convergé vers (-x, +y) -- */
@keyframes csDecViseurHD {
  0%, 5%  { translate: 0px 0px;    opacity: 1; }
  18%     { translate: 5px -5px;   opacity: 1; }
  30%     { translate: 5px -5px;   opacity: 1; }
  48%     { translate: -7px 7px;   opacity: 1; }
  52%     { translate: -6px 6px;   opacity: 1; }
  55%     { translate: -6px 6px;   opacity: 0; }
  58%     { translate: -6px 6px;   opacity: 1; }
  61%     { translate: -6px 6px;   opacity: 0; }
  64%     { translate: -6px 6px;   opacity: 1; }
  75%     { translate: -6px 6px;   opacity: 1; }
  90%     { translate: 0px 0px;    opacity: 1; }
  100%    { translate: 0px 0px;    opacity: 1; }
}

/* -- crochet bas-droit : écarté vers (+x, +y), convergé vers (-x, -y) -- */
@keyframes csDecViseurBD {
  0%, 5%  { translate: 0px 0px;    opacity: 1; }
  18%     { translate: 5px 5px;    opacity: 1; }
  30%     { translate: 5px 5px;    opacity: 1; }
  48%     { translate: -7px -7px;  opacity: 1; }
  52%     { translate: -6px -6px;  opacity: 1; }
  55%     { translate: -6px -6px;  opacity: 0; }
  58%     { translate: -6px -6px;  opacity: 1; }
  61%     { translate: -6px -6px;  opacity: 0; }
  64%     { translate: -6px -6px;  opacity: 1; }
  75%     { translate: -6px -6px;  opacity: 1; }
  90%     { translate: 0px 0px;    opacity: 1; }
  100%    { translate: 0px 0px;    opacity: 1; }
}

/* -- crochet bas-gauche : écarté vers (-x, +y), convergé vers (+x, -y) -- */
@keyframes csDecViseurBG {
  0%, 5%  { translate: 0px 0px;   opacity: 1; }
  18%     { translate: -5px 5px;  opacity: 1; }
  30%     { translate: -5px 5px;  opacity: 1; }
  48%     { translate: 7px -7px;  opacity: 1; }
  52%     { translate: 6px -6px;  opacity: 1; }
  55%     { translate: 6px -6px;  opacity: 0; }
  58%     { translate: 6px -6px;  opacity: 1; }
  61%     { translate: 6px -6px;  opacity: 0; }
  64%     { translate: 6px -6px;  opacity: 1; }
  75%     { translate: 6px -6px;  opacity: 1; }
  90%     { translate: 0px 0px;   opacity: 1; }
  100%    { translate: 0px 0px;   opacity: 1; }
}

/* -- losange : apparait au premier clignotement, reste jusqu'au relâche -- */
@keyframes csDecViseurLosange {
  0%, 55%  { opacity: 0; }
  58%      { opacity: 0.80; }
  61%      { opacity: 0; }
  64%      { opacity: 0.70; }
  75%      { opacity: 0.55; }
  88%      { opacity: 0; }
  100%     { opacity: 0; }
}

/* ------------------------------------------------------------------ */
/* Oscilloscope                                                         */
/* ------------------------------------------------------------------ */
.csDecOscillo {
  animation: csDecOscillo 3s linear infinite;
}
@keyframes csDecOscillo {
  from { translate: 0 0; }
  to   { translate: -50% 0; }
}

/* ------------------------------------------------------------------ */
/* Jauge                                                                */
/* ------------------------------------------------------------------ */
.csDecJaugeArc {
  animation: csDecJauge 6s ease-in-out infinite;
}
@keyframes csDecJauge {
  0%   { stroke-dashoffset: var(--csDec-jauge-vide); }
  50%  { stroke-dashoffset: var(--csDec-jauge-plein); }
  100% { stroke-dashoffset: var(--csDec-jauge-vide); }
}

/* ------------------------------------------------------------------ */
/* Pulsation                                                            */
/* ------------------------------------------------------------------ */
.csDecPulse {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: csDecPulse 3s ease-out infinite;
  opacity: 0;
}
.csDecPulse[data-delai="1"] { animation-delay: -1s; }
.csDecPulse[data-delai="2"] { animation-delay: -2s; }
@keyframes csDecPulse {
  0%   { scale: 0.2 0.2; opacity: 0.8; }
  80%  { scale: 1 1;   opacity: 0; }
  100% { scale: 1 1;   opacity: 0; }
}

/* ------------------------------------------------------------------ */
/* Engrenage                                                            */
/* ------------------------------------------------------------------ */
.csDecEngrenage {
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: csDecTourne 20s linear infinite;
}
.csDecEngrenage[data-sens="inverse"] {
  animation-direction: reverse;
  /* vitesse proportionnelle au rapport des rayons (40/26) */
  animation-duration: 13s;
}

/* ------------------------------------------------------------------ */
/* Keyframe commun                                                      */
/* ------------------------------------------------------------------ */
@keyframes csDecTourne { to { rotate: 360deg; } }

/* ------------------------------------------------------------------ */
/* Mouvement réduit : tout immobile                                     */
/* ------------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  .csDecCadranRoue,
  .csDecOrbiteSens,
  .csDecRadarCone,
  .csDecEcho,
  .csDecViseurHG,
  .csDecViseurHD,
  .csDecViseurBD,
  .csDecViseurBG,
  .csDecViseurLosange,
  .csDecViseurAnneau,
  .csDecOscillo,
  .csDecJaugeArc,
  .csDecPulse,
  .csDecEngrenage { animation: none; }

  /* Radar : faisceau fixe au nord, échos visibles (état phosphore stable) */
  .csDecEcho { opacity: 0.60; }

  /* Viseur : état verrouillé lisible (crochets convergés, losange visible) */
  .csDecViseurHG { translate: 6px 6px; }
  .csDecViseurHD { translate: -6px 6px; }
  .csDecViseurBD { translate: -6px -6px; }
  .csDecViseurBG { translate: 6px -6px; }
  .csDecViseurLosange { opacity: 0.55; }

  .csDecPulse { opacity: 0.4; scale: 0.7 0.7; }
  .csDecJaugeArc { stroke-dashoffset: calc(var(--csDec-jauge-vide) / 2); }
}
`;
