/**
 * Lien texte du système Console, réservé aux liens pris dans une phrase et à
 * ceux du pied de page (choix de Florent, 24 septembre 2026 : ni la barre, ni
 * le méga-menu, ni le fil d'Ariane). Au survol et au focus clavier, deux
 * crochets encadrent le libellé sur un voile bleu léger et s'allument comme un
 * tube néon (variante « Tension »).
 *
 * Un seul pseudo-élément (`::after`) dessine les deux crochets et le voile :
 * un cadre néon dont le masque ne garde que les becs gauche et droit, et un
 * fond limité à l'intérieur du cadre. Le libellé ne bouge jamais : les
 * crochets débordent de la boîte du lien, sous le texte.
 *
 * Réglages par famille de liens, en propriétés CSS :
 *   --csl-x : écart horizontal des crochets au bord du lien (négatif : dehors) ;
 *   --csl-y : écart vertical (négatif : dehors).
 *
 * `csLienTexte` : lien pris dans une phrase. Il reste souligné au repos pour
 * se repérer sans la couleur (RGAA 10.6) ; au survol, les crochets prennent
 * le relais. Bloc en ligne : les crochets entourent tout le libellé, même
 * sur deux lignes.
 *
 * Mouvement réduit : crochets et voile apparaissent sans clignotement.
 */

const MASQUE =
  "linear-gradient(to right, #000 var(--csl-bec), transparent 0 calc(100% - var(--csl-bec)), #000 0) border-box, linear-gradient(#000 0 0) padding-box";

const ALLUME = ":is(:hover, :focus-visible)";

const STYLES = `
/* Réglages par défaut sans poids : la règle d'une famille de liens les remplace. */
:where(.csLien) {
  --csl-x: -0.4em;
  --csl-y: -0.2em;
  --csl-bec: 5px;
}
.csLien {
  position: relative;
  isolation: isolate;
  text-decoration: none;
}
.csLien:focus-visible { outline: none; }
.csLien::after {
  content: "";
  position: absolute;
  z-index: -1;
  inset: var(--csl-y) var(--csl-x);
  border: 1.5px solid var(--cs-neon);
  background: color-mix(in srgb, var(--cs-neon-vif) 16%, transparent) padding-box;
  -webkit-mask: ${MASQUE};
  mask: ${MASQUE};
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms linear;
}
.csLien${ALLUME}::after { opacity: 1; animation: csLienTension 520ms linear both; }
@keyframes csLienTension {
  0% { opacity: 0; } 18% { opacity: 0.9; } 26% { opacity: 0.15; }
  44% { opacity: 1; } 56% { opacity: 0.55; } 100% { opacity: 1; }
}

/* Lien dans une phrase : souligné au repos, crochets au survol, serrés pour
   ne pas mordre sur la ponctuation voisine. */
.csLienTexte {
  --csl-x: -0.2em;
  display: inline-block;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
  transition: text-decoration-color var(--cs-rapide) linear;
}
.csLienTexte${ALLUME} { text-decoration-color: transparent; }

@media (prefers-reduced-motion: reduce) {
  .csLien::after, .csLienTexte { transition: none; }
  .csLien${ALLUME}::after { animation: none; }
}
`;

export function StylesLiens() {
  return (
    <style href="console-liens" precedence="ds">
      {STYLES}
    </style>
  );
}
