/**
 * Feuille partagée de la famille « Carrousels » du système Console.
 *
 * Rendue par chaque composant de la famille, React ne la place qu'une seule
 * fois dans le document grâce à `href="console-carrousels"`.
 *
 * Pas de bibliothèque externe : défilement natif `scroll-snap`, boutons
 * précédent / suivant, animations CSS. Le rendu serveur est identique au
 * premier rendu navigateur.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : région nommée `aria-roledescription="carrousel"`.
 *  - Critère 7.3 : navigation clavier (boutons + flèches dans SliderImages).
 *  - Critère 11.1 : boutons nommés et cibles ≥ 44 px.
 *  - Critère 3.2 : note en segments + texte pour les étoiles (lisible sans couleur).
 *
 * Mouvement réduit : translations et transitions désactivées.
 */

const STYLES_CARROUSELS = `

/* ===== Piste commune ===== */
/* Défilement horizontal natif avec accroche. La piste ne provoque jamais
   de défilement horizontal sur la page : elle est contenue. */
.csCarPiste {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  gap: 0;
}
.csCarPiste::-webkit-scrollbar { display: none; }

/* ===== Boutons précédent / suivant ===== */
.csCarBtn {
  position: relative; isolation: isolate;
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  background: transparent; border: 0; cursor: pointer;
  color: var(--cs-neon);
  transition: filter var(--cs-moyen) var(--cs-ease);
}
.csCarBtn:is(:hover, :focus-visible) {
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
}
.csCarBtn[disabled] {
  opacity: 0.3;
  pointer-events: none;
}

/* ===== SliderImages ===== */
.csCarSliIm {
  position: relative;
  overflow: hidden;
  /* Le clip-path est posé par csCoupe ; les bords ne débordent pas. */
}
.csCarSliImDia {
  /* Diapositive dans la piste. */
  flex: 0 0 100%;
  aspect-ratio: 3 / 2;
  scroll-snap-align: start;
  position: relative;
  overflow: hidden;
  /* Même coupe que le conteneur pour que l'image ne dépasse pas. */
}
.csCarSliImDia img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Légende en bas de la diapositive. */
.csCarSliImLegende {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 32px 20px 16px;
  background: linear-gradient(transparent, rgba(2, 6, 13, 0.82));
}
/* Compteur façon instrument : « 02 / 05 ». */
.csCarSliImCompteur {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
}
/* Barre de progression néon sous les boutons. */
.csCarSliImBarre {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}
.csCarSliImBarreNeon {
  height: 100%;
  background: var(--cs-neon);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
  transform-origin: 0 50%;
  transition: scale var(--cs-moyen) var(--cs-ease);
}

/* ===== SliderStories ===== */
/* Plusieurs cartes côte à côte (format 9:16). Sur téléphone, une seule
   carte occupe toute la largeur. Sur grand écran, trois sont visibles. */
.csCarStoPiste {
  gap: 12px;
}
/* La diapositive porte la largeur dans la piste : toute la zone sur
   téléphone, 240 px ailleurs. */
.csCarStoDia {
  flex: 0 0 min(100%, 240px);
  scroll-snap-align: start;
}
.csCarStoCarte {
  width: 100%;
  aspect-ratio: 9 / 16;
  position: relative;
  overflow: hidden;
}
/* Fond d'attente quand aucune vidéo n'est fournie. */
.csCarStoCarte[data-sans-media] {
  background: var(--cs-surface-2);
}
/* Icône de lecture centrée. */
.csCarStoLecture {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 13, 0.38);
  transition: background var(--cs-rapide) linear;
}
.csCarStoCarte:is(:hover, :focus-visible) .csCarStoLecture {
  background: rgba(2, 6, 13, 0.18);
}
.csCarStoIconeLecture {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(125, 211, 252, 0.15);
  border: 1.5px solid var(--cs-neon);
  display: flex; align-items: center; justify-content: center;
  transition: filter var(--cs-moyen) var(--cs-ease);
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6));
}
.csCarStoCarte:is(:hover, :focus-visible) .csCarStoIconeLecture {
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.9));
}
/* Informations auteur en bas. */
.csCarStoAuteur {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 48px 14px 14px;
  background: linear-gradient(transparent, rgba(2, 6, 13, 0.9));
}
/* Barre de durée en haut de la carte story. */
.csCarStoBarre {
  position: absolute;
  top: 10px; left: 10px; right: 10px;
  height: 2px;
  background: rgba(255, 255, 255, 0.22);
}
.csCarStoBarreNeon {
  height: 100%;
  width: 0%;
  background: var(--cs-neon);
  box-shadow: 0 0 4px rgba(56, 189, 248, 0.7);
}

/* ===== AvisClients ===== */
/* Grille sur ≥ 768 px, piste défilante sur mobile. */
.csCarAvisGrille {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 767px) {
  .csCarAvisGrille {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 12px;
  }
  .csCarAvisGrille::-webkit-scrollbar { display: none; }
}
.csCarAvisGrille > * {
  /* Largeur minimale pour que les cartes restent lisibles sur mobile. */
  flex: 0 0 min(85vw, 320px);
  scroll-snap-align: start;
}
/* Carte d'avis. */
.csCarAvisCarte {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
}
/* Note en segments néon. */
.csCarAvisNote {
  display: flex;
  gap: 4px;
  align-items: center;
}
.csCarAvisSegment {
  height: 4px;
  width: 18px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1px;
}
.csCarAvisSegment[data-actif] {
  background: var(--cs-neon);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
}
/* Citation. */
.csCarAvisCitation {
  flex: 1;
  font-style: italic;
}
/* Auteur. */
.csCarAvisSignature {
  border-top: 1px solid var(--cs-trait);
  padding-top: 12px;
}

/* ===== Mouvement réduit ===== */
@media (prefers-reduced-motion: reduce) {
  .csCarSliImBarreNeon,
  .csCarBtn,
  .csCarStoLecture,
  .csCarStoIconeLecture { transition: none; }
  .csCarPiste, .csCarStoPiste, .csCarAvisGrille { scroll-behavior: auto; }
}
`;

/** Feuille partagée de la famille Carrousels. Rendue par chaque composant. */
export function StylesCarrousels() {
  return (
    <style href="console-carrousels" precedence="ds">
      {STYLES_CARROUSELS}
    </style>
  );
}
