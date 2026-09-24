/**
 * Feuille des animations d'apparition du système Console.
 *
 * Chaque bloc a ses variantes (catalogue.ts). Deux effets d'image et trois
 * effets de texte sont partagés, le reste est propre au bloc.
 *
 * États posés par Apparition :
 *   A = [data-arme]:not([data-fini])  : état de départ, masqué ;
 *   V = A[data-visible]                : la chorégraphie joue ;
 *   data-fini                          : plus aucune règle, le bloc est normal.
 * Repères : --app-i (ligne de texte), --app-n (élément de la séquence),
 * --app-total (taille de la séquence), --app-t0 (départ du texte).
 *
 * Toute animation d'apparition porte un nom en « app » : Apparition attend
 * leur fin réelle avant de poser data-fini.
 * Propriétés animées : clip-path, opacity, filter, translate, scale, rotate ;
 * top et right seulement pour les deux équerres de l'ouverture (14 px).
 *
 * Mouvement réduit : rien n'est armé (Apparition), aucune règle ne s'applique.
 * Éco : feuille unique, href "console-animations", un seul insert React.
 */

const A = "[data-arme]:not([data-fini])";
const V = `${A}[data-visible]`;
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

/** Sélecteur d'une variante, armée ou jouée. */
const a = (id: string) => `${A}[data-variante="${id}"]`;
const v = (id: string) => `${V}[data-variante="${id}"]`;

/* Panneaux qui s'ouvrent : cadre image des sections, relevé de l'explorateur. */
const OUV_A = [`${A}[data-img="ouverture"] [data-app="image"] > .csPanneau`, `${a("ex-listage")} .csGriExpl > .csPanneau:last-child`];
const OUV_V = [`${V}[data-img="ouverture"] [data-app="image"] > .csPanneau`, `${v("ex-listage")} .csGriExpl > .csPanneau:last-child`];
const liste = (bases: string[], suffixe: string) => bases.map((b) => `${b}${suffixe}`).join(",\n");

const FERME = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const OUV_DUREE = "1300ms";
/* Départ lent, trajet visible, arrivée posée. */
const OUV_EASE = "cubic-bezier(0.6, 0, 0.2, 1)";
const OUV_DELAI = "var(--app-ouv-delai, 0ms)";

const STYLES_ANIMATIONS = `
@property --app-scan {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

/* ================================================================== */
/* Texte partagé : montée, netteté, fondu                              */
/* ================================================================== */

${A}[data-txt] [data-app-u] { opacity: 0; will-change: opacity, translate, filter; }
${A}[data-txt="montee"] [data-app-u] { translate: 0 14px; }
${A}[data-txt="nettete"] [data-app-u] { filter: blur(6px); scale: 1.03; }

${V}[data-txt="montee"] [data-app-u] {
  animation: appMontee 700ms ${EASE} calc(var(--app-t0, 300ms) + var(--app-i, 0) * 90ms) both;
}
${V}[data-txt="nettete"] [data-app-u] {
  animation: appNettete 900ms ${EASE} calc(var(--app-t0, 300ms) + var(--app-i, 0) * 80ms) both;
}
${V}[data-txt="fondu"] [data-app-u] {
  animation: appFondu 1000ms ease-out calc(var(--app-t0, 300ms) + var(--app-i, 0) * 160ms) both;
}

/* ================================================================== */
/* Image : ouverture                                                    */
/* Les deux équerres (haut droit, bas gauche) forment une mire au      */
/* centre, clignotent, puis partent vers leurs coins en ouvrant le      */
/* panneau derrière elles.                                              */
/* ================================================================== */

${liste(OUV_A, " > :not(.csDiag, .csEquerre, .csTrace)")} { clip-path: ${FERME}; }
${liste(OUV_A, " > .csDiag")} { opacity: 0; }
${liste(OUV_A, ' > .csEquerre[data-coin="hd"]')} { top: calc(50% - 7px); right: calc(50% - 7px); opacity: 0; }
${liste(OUV_A, ' > .csEquerre[data-coin="bg"]')} { bottom: calc(50% - 7px); left: calc(50% - 7px); opacity: 0; }

${liste(OUV_V, " > :not(.csDiag, .csEquerre, .csTrace)")} {
  animation: appOuvClip ${OUV_DUREE} linear ${OUV_DELAI} both;
}
${liste(OUV_V, " > .csDiag")} { animation: appOuvDiag ${OUV_DUREE} linear ${OUV_DELAI} both; }
${liste(OUV_V, ' > .csEquerre[data-coin="hd"]')} { animation: appOuvHd ${OUV_DUREE} linear ${OUV_DELAI} both; }
${liste(OUV_V, ' > .csEquerre[data-coin="bg"]')} { animation: appOuvBg ${OUV_DUREE} linear ${OUV_DELAI} both; }

/* Reflet de fin : une bande claire traverse l'image, dans la coupe « l ». */
${V}[data-img="ouverture"] [data-app="image"]::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  clip-path: polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px);
  background: linear-gradient(100deg, transparent 42%, rgba(255,255,255,0.26) 50%, transparent 58%) no-repeat;
  background-size: 250% 100%;
  background-position: 130% 0;
  animation: appReflet 800ms ${EASE} 1200ms forwards;
}

/* ================================================================== */
/* Image : mise au point                                                */
/* ================================================================== */

${A}[data-img="mise-au-point"] [data-app="image"] { filter: blur(14px); scale: 1.04; will-change: filter, scale; }
${V}[data-img="mise-au-point"] [data-app="image"] { animation: appMAPImg 1100ms ${EASE} both; }

/* Quatre crochets de visée se referment sur les coins, puis s'effacent. */
${V}[data-img="mise-au-point"] [data-app="image"]::after {
  content: "";
  position: absolute;
  inset: -10px;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  --app-l: 22px;
  --app-e: 1.5px;
  background:
    linear-gradient(var(--cs-neon), var(--cs-neon)) left top / var(--app-l) var(--app-e),
    linear-gradient(var(--cs-neon), var(--cs-neon)) left top / var(--app-e) var(--app-l),
    linear-gradient(var(--cs-neon), var(--cs-neon)) right top / var(--app-l) var(--app-e),
    linear-gradient(var(--cs-neon), var(--cs-neon)) right top / var(--app-e) var(--app-l),
    linear-gradient(var(--cs-neon), var(--cs-neon)) left bottom / var(--app-l) var(--app-e),
    linear-gradient(var(--cs-neon), var(--cs-neon)) left bottom / var(--app-e) var(--app-l),
    linear-gradient(var(--cs-neon), var(--cs-neon)) right bottom / var(--app-l) var(--app-e),
    linear-gradient(var(--cs-neon), var(--cs-neon)) right bottom / var(--app-e) var(--app-l);
  background-repeat: no-repeat;
  filter: drop-shadow(0 0 4px rgba(56,189,248,0.8));
  animation: appMAPViseur 1100ms ${EASE} forwards;
}

/* ================================================================== */
/* Image liste                                                          */
/* ================================================================== */

/* Pointage : chaque ligne est pointée à son tour. Le séparateur se trace,
   la barre s'allume, l'index flashe, le texte glisse en place. */
${a("il-pointage")} .csSecListeItem::after { scale: 0 1; transform-origin: 0 50%; }
${a("il-pointage")} .csSecListeIdx { opacity: 0; }
${a("il-pointage")} .csSecListeTexte { opacity: 0; translate: -12px 0; }
${v("il-pointage")} .csSecListeItem::after { animation: appTrait 500ms ${EASE} calc(700ms + var(--app-n, 0) * 140ms) both; }
${v("il-pointage")} .csSecListeItem::before { animation: appBarre 700ms ${EASE} calc(760ms + var(--app-n, 0) * 140ms) both; }
${v("il-pointage")} .csSecListeIdx { animation: appPointe 700ms linear calc(760ms + var(--app-n, 0) * 140ms) both; }
${v("il-pointage")} .csSecListeTexte { animation: appGlisse 600ms ${EASE} calc(820ms + var(--app-n, 0) * 140ms) both; }

/* Énumération : les index s'allument dans l'ordre, chaque texte se révèle
   depuis la gauche. */
${a("il-enumeration")} .csSecListeIdx { opacity: 0; }
${a("il-enumeration")} .csSecListeTexte { clip-path: inset(0 100% 0 0); }
${v("il-enumeration")} .csSecListeIdx { animation: appVacille 560ms ease-out calc(450ms + var(--app-n, 0) * 120ms) both; }
${v("il-enumeration")} .csSecListeTexte { animation: appDevoile 520ms ${EASE} calc(620ms + var(--app-n, 0) * 120ms) both; }

/* ================================================================== */
/* Image accordéon                                                      */
/* ================================================================== */

/* Dépliage : les lignes sortent de la première comme un soufflet, puis la
   réponse ouverte se déroule. */
${a("ia-depliage")} .csSecAccItem { opacity: 0; translate: 0 calc(var(--app-n, 0) * -100%); }
${a("ia-depliage")} .csSecAccCorps[data-open="true"] .csSecAccCorpsInner { clip-path: inset(0 0 100% 0); }
${v("ia-depliage")} .csSecAccItem { animation: appDeplie 750ms ${EASE} calc(450ms + var(--app-n, 0) * 40ms) both; }
${v("ia-depliage")} .csSecAccCorps[data-open="true"] .csSecAccCorpsInner { animation: appDeroule 600ms ${EASE} 1150ms both; }

/* Pivot : les lignes entrent une à une, chaque signe pivote jusqu'à sa
   position, la barre de la ligne ouverte s'étire. */
${a("ia-pivot")} .csSecAccItem { opacity: 0; translate: -12px 0; }
${v("ia-pivot")} .csSecAccItem { animation: appGlisse 600ms ${EASE} calc(400ms + var(--app-n, 0) * 100ms) both; }
${v("ia-pivot")} .csSecAccSigne { animation: appPivot 700ms ${EASE} calc(500ms + var(--app-n, 0) * 100ms) backwards; }
${v("ia-pivot")} .csSecAccBtn[aria-expanded="true"]::before { animation: appBarreOuverte 600ms ${EASE} 850ms backwards; }

/* ================================================================== */
/* Parallaxe : l'image est animée, jamais son cadre (qui porte le       */
/* glissement lié au défilement).                                       */
/* ================================================================== */

/* Travelling : lent recul de caméra, la lumière monte. */
${a("px-travelling")} .csSecParallaxeFond img { scale: 1.22; filter: brightness(0.5); }
${v("px-travelling")} .csSecParallaxeFond img { animation: appTravelling 1800ms ${EASE} both; }

/* Fondu au noir : l'image sort du noir, le texte suit lentement. */
${a("px-fondu")} .csSecParallaxeFond img { filter: brightness(0); }
${v("px-fondu")} .csSecParallaxeFond img { animation: appFonduNoir 1400ms ease-out both; }

/* Panoramique : deux volets noirs à liseré néon s'écartent, format cinéma. */
${a("px-panoramique")} .csSecParallaxe::before,
${a("px-panoramique")} .csSecParallaxe::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
  z-index: 3;
  pointer-events: none;
  background: var(--cs-fond);
}
${a("px-panoramique")} .csSecParallaxe::before { top: 0; box-shadow: 0 1px 0 var(--cs-neon), 0 6px 14px -6px rgba(56,189,248,0.7); }
${a("px-panoramique")} .csSecParallaxe::after { bottom: 0; box-shadow: 0 -1px 0 var(--cs-neon), 0 -6px 14px -6px rgba(56,189,248,0.7); }
${v("px-panoramique")} .csSecParallaxe::before { animation: appVoletHaut 1100ms cubic-bezier(0.7, 0, 0.2, 1) 150ms both; }
${v("px-panoramique")} .csSecParallaxe::after { animation: appVoletBas 1100ms cubic-bezier(0.7, 0, 0.2, 1) 150ms both; }

/* ================================================================== */
/* Bento                                                                */
/* ================================================================== */

/* Tracé : chaque case se dessine au trait (côtés, puis montants, puis
   coins coupés), le verre se remplit, le contenu arrive, le bord reste. */
${a("bt-trace")} .csGriBentoLien { --app-d: calc(150ms + var(--app-n, 0) * 130ms); }
${a("bt-trace")} .csGriBentoLien > :is(.csVerre, .csBord, .csDiag) { opacity: 0; }
${a("bt-trace")} .csGriBentoLien > :not(.csVerre, .csBord, .csDiag, .csTrace, .csGriBentoFleche) { opacity: 0; translate: 0 14px; }
${v("bt-trace")} .csGriBentoLien > .csTrace:is([data-cote="haut"], [data-cote="bas"]) { animation: appTraceH 1050ms linear var(--app-d) both; }
${v("bt-trace")} .csGriBentoLien > .csTrace:is([data-cote="droite"], [data-cote="gauche"]) { animation: appTraceV 800ms linear calc(var(--app-d) + 250ms) both; }
${v("bt-trace")} .csGriBentoLien > .csTrace:is([data-cote="hg"], [data-cote="bd"]) { animation: appTraceH 600ms linear calc(var(--app-d) + 450ms) both; }
${v("bt-trace")} .csGriBentoLien > .csVerre { animation: appApparait 500ms ease-out calc(var(--app-d) + 350ms) both; }
${v("bt-trace")} .csGriBentoLien > :not(.csVerre, .csBord, .csDiag, .csTrace, .csGriBentoFleche) { animation: appMontee 500ms ${EASE} calc(var(--app-d) + 500ms) both; }
${v("bt-trace")} .csGriBentoLien > :is(.csBord, .csDiag) { animation: appApparait 300ms linear calc(var(--app-d) + 900ms) both; }

/* Vague : une onde part du coin haut gauche en diagonale ; chaque case
   s'allume à son rang, un reflet la traverse. */
${a("bt-vague")} .csGriBento > :nth-child(1) { --app-rang: 0; }
${a("bt-vague")} .csGriBento > :nth-child(2) { --app-rang: 1; }
${a("bt-vague")} .csGriBento > :nth-child(3) { --app-rang: 2; }
${a("bt-vague")} .csGriBento > :nth-child(4) { --app-rang: 2; }
${a("bt-vague")} .csGriBento > :nth-child(5) { --app-rang: 3; }
${a("bt-vague")} .csGriBentoLien { opacity: 0; scale: 0.92; filter: brightness(2); }
${v("bt-vague")} .csGriBentoLien { animation: appPop 650ms ${EASE} calc(150ms + var(--app-rang, 0) * 150ms) both; }
${v("bt-vague")} .csGriBentoLien::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  clip-path: var(--cs-clip);
  background: linear-gradient(100deg, transparent 42%, rgba(125,211,252,0.28) 50%, transparent 58%) no-repeat;
  background-size: 250% 100%;
  background-position: 130% 0;
  animation: appReflet 800ms ${EASE} calc(400ms + var(--app-rang, 0) * 150ms) forwards;
}

/* Assemblage : les cases arrivent des bords et se verrouillent en place. */
${a("bt-assemblage")} .csGriBento { overflow-x: clip; }
${a("bt-assemblage")} .csGriBento > :nth-child(1) { --app-dx: -48px; --app-dy: 0px; }
${a("bt-assemblage")} .csGriBento > :nth-child(2) { --app-dx: 0px; --app-dy: -36px; }
${a("bt-assemblage")} .csGriBento > :nth-child(3) { --app-dx: 48px; --app-dy: 0px; }
${a("bt-assemblage")} .csGriBento > :nth-child(4) { --app-dx: 0px; --app-dy: 36px; }
${a("bt-assemblage")} .csGriBento > :nth-child(5) { --app-dx: 48px; --app-dy: 36px; }
${a("bt-assemblage")} .csGriBentoLien { opacity: 0; translate: var(--app-dx, 0px) var(--app-dy, 0px); }
${v("bt-assemblage")} .csGriBentoLien { animation: appAssemble 750ms ${EASE} calc(100ms + var(--app-n, 0) * 80ms) both; }
${v("bt-assemblage")} .csGriBentoLien > :is(.csBord, .csDiag) { animation: appVerrou 600ms ease-out calc(760ms + var(--app-n, 0) * 80ms); }

/* ================================================================== */
/* Explorateur                                                          */
/* ================================================================== */

/* Listage : la liste s'écrit ligne à ligne, puis le relevé s'ouvre comme
   un cadre image (équerres du centre vers les coins). */
${a("ex-listage")} .csGriExpl > .csPanneau:first-child { opacity: 0; }
${a("ex-listage")} :is(.csGriExplFamille, .csGriExplBtn, .csGriExplDescMobile) { clip-path: inset(0 100% 0 0); }
${a("ex-listage")} .csGriExpl > .csPanneau:last-child { --app-ouv-delai: calc(200ms + var(--app-total, 0) * 35ms); }
${v("ex-listage")} .csGriExpl > .csPanneau:first-child { animation: appApparait 400ms ease-out both; }
${v("ex-listage")} :is(.csGriExplFamille, .csGriExplBtn, .csGriExplDescMobile) { animation: appDevoile 420ms ${EASE} calc(250ms + var(--app-n, 0) * 35ms) both; }

/* Balayage : un curseur parcourt la liste ligne par ligne, rallume le
   service actif, et le relevé fait sa mise au point. */
${a("ex-balayage")} .csGriExplBtn[data-actif="true"] { color: var(--cs-texte-2); background: none; }
${a("ex-balayage")} .csGriExplBtn[data-actif="true"]::before { opacity: 0; scale: 1 0.3; }
${a("ex-balayage")} .csGriExplReleve { opacity: 0; filter: blur(6px); }
${v("ex-balayage")} .csGriExplBtn { animation: appScan 55ms linear calc(300ms + var(--app-n, 0) * 55ms); }
${v("ex-balayage")} .csGriExplBtn::before { animation: appScanBarre 55ms linear calc(300ms + var(--app-n, 0) * 55ms); }
${v("ex-balayage")} .csGriExplBtn[data-actif="true"] {
  animation:
    appScan 55ms linear calc(300ms + var(--app-n, 0) * 55ms),
    appRallume 300ms ease-out calc(400ms + var(--app-total, 0) * 55ms) forwards;
}
${v("ex-balayage")} .csGriExplBtn[data-actif="true"]::before {
  animation:
    appScanBarre 55ms linear calc(300ms + var(--app-n, 0) * 55ms),
    appRallumeBarre 300ms ease-out calc(400ms + var(--app-total, 0) * 55ms) forwards;
}
${v("ex-balayage")} .csGriExplReleve { animation: appNettete 800ms ${EASE} calc(450ms + var(--app-total, 0) * 55ms) both; }

/* ================================================================== */
/* KPI                                                                  */
/* Les cases portent un délai en ligne (allumage d'origine) : les       */
/* délais posés sur la case elle-même passent donc en !important.       */
/* ================================================================== */

/* Neutralise l'allumage d'origine dans un bloc armé, y compris fini. */
[data-arme] .csGriKpiItem { animation: none; opacity: 1; }

/* Compteur : les cases montent, chaque valeur défile de zéro. */
${a("kp-compteur")} .csGriKpiItem { opacity: 0; translate: 0 14px; }
${v("kp-compteur")} .csGriKpiItem {
  animation: appMontee 550ms ${EASE} both;
  animation-delay: calc(100ms + var(--app-n, 0) * 110ms) !important;
}

/* Étalonnage : le trait balaie toute la case puis se pose, la valeur
   s'allume ensuite. */
${a("kp-etalonnage")} .csGriKpiItem > p { opacity: 0; }
${a("kp-etalonnage")} .csGriKpiItem > span:not(.csVerre, .csBord, .csDiag) { width: 0; }
${v("kp-etalonnage")} .csGriKpiItem > p:not(.csGriKpiVal) { animation: appApparait 400ms ease-out calc(150ms + var(--app-n, 0) * 120ms) both; }
${v("kp-etalonnage")} .csGriKpiItem > span:not(.csVerre, .csBord, .csDiag) { animation: appEtalon 900ms ${EASE} calc(200ms + var(--app-n, 0) * 120ms) both; }
${v("kp-etalonnage")} .csGriKpiVal { animation: appVacille 560ms ease-out calc(800ms + var(--app-n, 0) * 120ms) both; }

/* Mise sous tension : chaque case scintille, la valeur chauffe. */
${a("kp-tension")} .csGriKpiItem { opacity: 0; }
${a("kp-tension")} .csGriKpiVal { opacity: 0.3; filter: blur(4px) brightness(2.2); }
${v("kp-tension")} .csGriKpiItem {
  animation: appVacille 560ms ease-out both;
  animation-delay: calc(var(--app-n, 0) * 150ms) !important;
}
${v("kp-tension")} .csGriKpiVal { animation: appChauffe 800ms ${EASE} calc(450ms + var(--app-n, 0) * 150ms) both; }

/* ================================================================== */
/* Section CTA                                                          */
/* ================================================================== */

/* Signal : l'orbite se déploie depuis le centre, le texte monte, un
   reflet traverse le bouton principal. */
${a("ct-signal")} .csGriCtaDecorWrap { opacity: 0; scale: 0.4; }
${v("ct-signal")} .csGriCtaDecorWrap { animation: appSignal 1400ms ${EASE} both; }
${v("ct-signal")} .csBouton[data-variante="principal"] { animation: appHalo 900ms ease-out 1300ms; }
${v("ct-signal")} .csBouton[data-variante="principal"] .csBoutonFond::after { animation: appRefletBouton 800ms ${EASE} 1300ms both; }

/* Transmission : une ligne de balayage descend et révèle le message. */
${a("ct-transmission")} .csGriCta { --app-scan: 0; }
${a("ct-transmission")} .csGriCta > :not(.csGriCtaDecorWrap) {
  -webkit-mask-image: linear-gradient(180deg, #000 calc(var(--app-scan) * 100%), transparent calc(var(--app-scan) * 100% + 1px));
  mask-image: linear-gradient(180deg, #000 calc(var(--app-scan) * 100%), transparent calc(var(--app-scan) * 100% + 1px));
}
${v("ct-transmission")} .csGriCta { animation: appScanCta 1400ms cubic-bezier(0.45, 0, 0.2, 1) 150ms both; }
${v("ct-transmission")} .csGriCta::after {
  content: "";
  position: absolute;
  left: 24px;
  right: 24px;
  top: calc(80px + var(--app-scan) * (100% - 160px));
  height: 1px;
  z-index: 11;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--cs-neon) 20%, var(--cs-neon) 80%, transparent);
  box-shadow: 0 0 12px rgba(56,189,248,0.9);
  animation: appFinLigne 1600ms linear 150ms both;
}
${v("ct-transmission")} .csBouton[data-variante="principal"] .csBoutonFond::after { animation: appRefletBouton 800ms ${EASE} 1500ms both; }

/* ================================================================== */
/* Barre de commandes (vitrine)                                        */
/* ================================================================== */

.csAppCmds {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 0 14px;
}

.csAppVariantes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;
}

.csAppBtnVariante,
.csAppBtnRejouer {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 44px;
  padding: 0 14px;
  background: rgba(14, 30, 50, 0.72);
  border: none;
  cursor: pointer;
  color: var(--cs-texte-2);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  clip-path: var(--cs-clip);
  transition:
    color var(--cs-rapide) linear,
    filter var(--cs-rapide) linear,
    background-color var(--cs-rapide) linear;
}

.csAppBtnVariante:is(:hover, :focus-visible),
.csAppBtnRejouer:is(:hover, :focus-visible) {
  color: var(--cs-texte);
  --cs-bord: var(--cs-neon);
  filter: drop-shadow(0 0 6px rgba(56,189,248,0.4));
  background: rgba(56, 189, 248, 0.08);
  outline: none;
}

.csAppBtnVariante[aria-pressed="true"] {
  color: var(--cs-texte);
  --cs-bord: var(--cs-neon);
  filter: drop-shadow(0 0 8px rgba(56,189,248,0.55));
  background: rgba(56, 189, 248, 0.12);
}

.csAppBtnRejouer {
  color: var(--cs-neon);
}

/* ================================================================== */
/* @keyframes                                                           */
/* ================================================================== */

/* Texte */
@keyframes appMontee {
  from { opacity: 0; translate: 0 14px; }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes appNettete {
  0%   { filter: blur(6px); scale: 1.03; opacity: 0; }
  40%  { opacity: 1; }
  100% { filter: blur(0); scale: 1; opacity: 1; }
}
@keyframes appFondu {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes appApparait {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes appGlisse {
  from { opacity: 0; translate: -12px 0; }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes appDevoile {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0 0 0); }
}
/* Scintillement d'un tube qui s'allume (même courbe que csAllume). */
@keyframes appVacille {
  0% { opacity: 0; } 30% { opacity: 0.85; } 38% { opacity: 0.2; }
  52% { opacity: 1; } 62% { opacity: 0.6; } 100% { opacity: 1; }
}

/* Ouverture : mire au centre (0 à 22 %), puis ouverture vers les coins. */
@keyframes appOuvClip {
  0%, 22% { clip-path: ${FERME}; animation-timing-function: ${OUV_EASE}; }
  100%    { clip-path: var(--cs-clip); }
}
@keyframes appOuvHd {
  0%   { top: calc(50% - 7px); right: calc(50% - 7px); opacity: 0; }
  6%   { opacity: 1; }
  11%  { opacity: 0.25; }
  16%  { opacity: 1; }
  22%  { top: calc(50% - 7px); right: calc(50% - 7px); animation-timing-function: ${OUV_EASE}; }
  100% { top: -6px; right: -6px; opacity: 1; }
}
@keyframes appOuvBg {
  0%   { bottom: calc(50% - 7px); left: calc(50% - 7px); opacity: 0; }
  6%   { opacity: 1; }
  11%  { opacity: 0.25; }
  16%  { opacity: 1; }
  22%  { bottom: calc(50% - 7px); left: calc(50% - 7px); animation-timing-function: ${OUV_EASE}; }
  100% { bottom: -6px; left: -6px; opacity: 1; }
}
@keyframes appOuvDiag {
  0%, 90% { opacity: 0; }
  100%    { opacity: 1; }
}
@keyframes appReflet {
  0%   { background-position: 130% 0; opacity: 1; }
  100% { background-position: -30% 0; opacity: 0; }
}

/* Mise au point */
@keyframes appMAPImg {
  0%   { filter: blur(14px); scale: 1.04; }
  55%  { filter: blur(4px);  scale: 1.01; }
  100% { filter: blur(0);    scale: 1; }
}
@keyframes appMAPViseur {
  0%   { opacity: 0; scale: 1.08; }
  15%  { opacity: 1; }
  65%  { opacity: 1; scale: 1; }
  100% { opacity: 0; scale: 1; }
}

/* Image liste */
@keyframes appTrait {
  from { scale: 0 1; }
  to   { scale: 1 1; }
}
@keyframes appBarre {
  0%   { opacity: 0; scale: 1 0.3; }
  35%  { opacity: 1; scale: 1 1; }
  100% { opacity: 0; scale: 1 1; }
}
@keyframes appPointe {
  0%   { opacity: 0; }
  15%  { opacity: 1; color: var(--cs-neon); text-shadow: 0 0 10px rgba(56,189,248,0.9); }
  55%  { color: var(--cs-neon); text-shadow: 0 0 10px rgba(56,189,248,0.9); }
  100% { opacity: 1; color: rgba(125,211,252,0.6); text-shadow: 0 0 0 rgba(56,189,248,0); }
}

/* Image accordéon */
@keyframes appDeplie {
  from { opacity: 0; translate: 0 calc(var(--app-n, 0) * -100%); }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes appDeroule {
  from { clip-path: inset(0 0 100% 0); }
  to   { clip-path: inset(0 0 0 0); }
}
@keyframes appPivot {
  from { rotate: -180deg; }
}
@keyframes appBarreOuverte {
  from { scale: 1 0; }
}

/* Parallaxe */
@keyframes appTravelling {
  from { scale: 1.22; filter: brightness(0.5); }
  to   { scale: 1;    filter: brightness(1); }
}
@keyframes appFonduNoir {
  from { filter: brightness(0); }
  to   { filter: brightness(1); }
}
@keyframes appVoletHaut {
  from { translate: 0 0; }
  to   { translate: 0 -100%; }
}
@keyframes appVoletBas {
  from { translate: 0 0; }
  to   { translate: 0 100%; }
}

/* Bento. La fin des traits revient à l'échelle de repos, déjà éteinte :
   la transition du survol ne se déclenche pas au retour à l'état normal. */
@keyframes appTraceH {
  0%   { scale: 0 1; opacity: 1; animation-timing-function: ${EASE}; }
  30%  { scale: 1 1; }
  75%  { scale: 1 1; opacity: 1; }
  95%  { scale: 1 1; opacity: 0; }
  100% { scale: 0 1; opacity: 0; }
}
@keyframes appTraceV {
  0%   { scale: 1 0; opacity: 1; animation-timing-function: ${EASE}; }
  30%  { scale: 1 1; }
  75%  { scale: 1 1; opacity: 1; }
  95%  { scale: 1 1; opacity: 0; }
  100% { scale: 1 0; opacity: 0; }
}
@keyframes appPop {
  from { opacity: 0; scale: 0.92; filter: brightness(2); }
  to   { opacity: 1; scale: 1;    filter: brightness(1); }
}
@keyframes appAssemble {
  from { opacity: 0; translate: var(--app-dx, 0px) var(--app-dy, 0px); }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes appVerrou {
  0%   { background-color: var(--cs-neon); filter: drop-shadow(0 0 6px rgba(56,189,248,0.9)); }
  100% { background-color: var(--cs-bord, var(--cs-neon-doux)); filter: drop-shadow(0 0 0 rgba(56,189,248,0)); }
}

/* Explorateur */
@keyframes appScan {
  from, to { color: var(--cs-texte); background-color: rgba(56,189,248,0.14); }
}
@keyframes appScanBarre {
  from, to { opacity: 1; scale: 1 1; }
}
@keyframes appRallume {
  to { color: var(--cs-texte); background-image: linear-gradient(90deg, rgba(56,189,248,0.09), transparent 72%); }
}
@keyframes appRallumeBarre {
  to { opacity: 1; scale: 1 1; }
}

/* KPI */
@keyframes appEtalon {
  0%   { width: 0; }
  55%  { width: 100%; }
  100% { width: 2rem; }
}
@keyframes appChauffe {
  0%   { opacity: 0.3; filter: blur(4px) brightness(2.2); }
  60%  { opacity: 1;   filter: blur(0) brightness(1.5); }
  100% { opacity: 1;   filter: blur(0) brightness(1); }
}

/* Section CTA */
@keyframes appSignal {
  from { opacity: 0;   scale: 0.4; }
  to   { opacity: 0.5; scale: 1; }
}
@keyframes appHalo {
  0%   { filter: drop-shadow(0 0 0 rgba(56,189,248,0)); }
  40%  { filter: drop-shadow(0 0 14px rgba(56,189,248,0.7)); }
  100% { filter: drop-shadow(0 0 0 rgba(56,189,248,0)); }
}
@keyframes appRefletBouton {
  0%   { opacity: 1; translate: 0 0; }
  100% { opacity: 0; translate: 480% 0; }
}
@keyframes appScanCta {
  from { --app-scan: 0; }
  to   { --app-scan: 1; }
}
@keyframes appFinLigne {
  0% { opacity: 0; } 5% { opacity: 1; } 88% { opacity: 1; } 100% { opacity: 0; }
}

/* ================================================================== */
/* Frise d'étapes                                                       */
/* ================================================================== */

/* Tracé : le trait néon se dessine de gauche à droite (bureau) ou de
   haut en bas (mobile), à vitesse constante : il atteint le diamant n
   quand celui-ci s'allume (200 ms + n x 280 ms). Le numéro suit, le titre
   monte et le corps apparaît dans la foulée. */
${a("fr-trace")} .csFriseLigneH { scale: 0 1; }
${a("fr-trace")} .csFriseEtape::before { scale: 1 0; }
${a("fr-trace")} .csFriseDiam   { opacity: 0; }
${a("fr-trace")} .csFriseNum    { opacity: 0; }
${a("fr-trace")} .csFriseTitre  { opacity: 0; translate: 0 10px; }
${a("fr-trace")} .csFriseCorps  { opacity: 0; }

${v("fr-trace")} .csFriseLigneH { animation: appFriseLigneH calc((var(--frise-n, 4) - 1) * 280ms) linear 200ms both; }
${v("fr-trace")} .csFriseEtape::before { animation: appFriseLigneV 280ms linear calc(200ms + var(--app-n, 0) * 280ms) both; }
${v("fr-trace")} .csFriseDiam   { animation: appVacille 560ms ease-out calc(200ms + var(--app-n, 0) * 280ms) both; }
${v("fr-trace")} .csFriseNum    { animation: appVacille 560ms ease-out calc(260ms + var(--app-n, 0) * 280ms) both; }
${v("fr-trace")} .csFriseTitre  { animation: appMontee 600ms ${EASE} calc(380ms + var(--app-n, 0) * 280ms) both; }
${v("fr-trace")} .csFriseCorps  { animation: appFondu 600ms ease-out calc(480ms + var(--app-n, 0) * 280ms) both; }

/* Allumage : chaque étape scintille et monte dans l'ordre, comme des
   instruments s'allumant un par un. */
${a("fr-allumage")} .csFriseEtape { opacity: 0; translate: 0 16px; }
${a("fr-allumage")} .csFriseDiam  { opacity: 0; }

${v("fr-allumage")} .csFriseEtape { animation: appMontee 650ms ${EASE} calc(80ms + var(--app-n, 0) * 160ms) both; }
${v("fr-allumage")} .csFriseDiam  { animation: appVacille 560ms ease-out calc(200ms + var(--app-n, 0) * 160ms) both; }

/* Keyframes propres à la frise */
@keyframes appFriseLigneH {
  from { scale: 0 1; }
  to   { scale: 1 1; }
}
@keyframes appFriseLigneV {
  from { scale: 1 0; }
  to   { scale: 1 1; }
}
`;

/** Feuille des animations d'apparition. Rendue par Apparition et CommandesApparition. */
export function StylesApparition() {
  return (
    <style href="console-animations" precedence="ds">
      {STYLES_ANIMATIONS}
    </style>
  );
}
