/**
 * Catalogue des animations d'apparition, bloc par bloc.
 *
 * Chaque bloc a son propre jeu (cinq au plus), pensé pour ce qu'il montre :
 * une image s'ouvre ou se met au point, une liste se pointe, une grille se
 * trace, un relevé se compte. Aucune animation n'est commune à tous.
 *
 * Une variante déclare :
 *   - image   : effet du cadre image partagé (ouverture, mise au point) ;
 *   - texte   : effet partagé des lignes de texte (montée, netteté, fondu) ;
 *   - t0      : départ du texte, en ms ;
 *   - compteur: éléments dont la valeur défile de zéro à la valeur réelle.
 * Le reste de la chorégraphie vit dans styles.tsx, sous data-variante.
 */

export type BlocAnimable =
  | "image-texte"
  | "image-liste"
  | "image-accordeon"
  | "parallaxe"
  | "bento"
  | "explorateur"
  | "kpi"
  | "section-cta"
  | "frise";

export type EffetImage = "ouverture" | "mise-au-point";
export type EffetTexte = "montee" | "nettete" | "fondu";

export interface VarianteBloc {
  id: string;
  label: string;
  image?: EffetImage;
  texte?: EffetTexte;
  /** Départ des lignes de texte, en ms. */
  t0?: number;
  /** Sélecteur des valeurs qui défilent depuis zéro. */
  compteur?: string;
}

export interface DefinitionBloc {
  variantes: readonly VarianteBloc[];
  /**
   * Éléments répétés du bloc (items, cases, lignes), numérotés dans l'ordre
   * par --app-n. Ils sortent du découpage en lignes de texte.
   */
  sequence?: string;
}

export const CATALOGUE: Record<BlocAnimable, DefinitionBloc> = {
  "image-texte": {
    variantes: [
      { id: "it-ouverture", label: "Ouverture", image: "ouverture", texte: "montee", t0: 650 },
      { id: "it-mise-au-point", label: "Mise au point", image: "mise-au-point", texte: "nettete", t0: 350 },
    ],
  },
  "image-liste": {
    sequence: ".csSecListeItem",
    variantes: [
      { id: "il-pointage", label: "Pointage", image: "ouverture", texte: "montee", t0: 500 },
      { id: "il-enumeration", label: "Énumération", image: "mise-au-point", texte: "nettete", t0: 300 },
    ],
  },
  "image-accordeon": {
    sequence: ".csSecAccItem",
    variantes: [
      { id: "ia-depliage", label: "Dépliage", image: "ouverture", texte: "montee", t0: 150 },
      { id: "ia-pivot", label: "Pivot", image: "mise-au-point", texte: "nettete", t0: 150 },
    ],
  },
  parallaxe: {
    variantes: [
      { id: "px-travelling", label: "Travelling", texte: "montee", t0: 600 },
      { id: "px-fondu", label: "Fondu au noir", texte: "fondu", t0: 500 },
      { id: "px-panoramique", label: "Panoramique", texte: "montee", t0: 700 },
    ],
  },
  bento: {
    sequence: ".csGriBentoLien",
    variantes: [
      { id: "bt-trace", label: "Tracé" },
      { id: "bt-vague", label: "Vague" },
      { id: "bt-assemblage", label: "Assemblage" },
    ],
  },
  explorateur: {
    sequence: ".csGriExplFamille, .csGriExplBtn, .csGriExplDescMobile",
    variantes: [
      { id: "ex-listage", label: "Listage" },
      { id: "ex-balayage", label: "Balayage" },
    ],
  },
  kpi: {
    sequence: ".csGriKpiItem",
    variantes: [
      { id: "kp-compteur", label: "Compteur", compteur: ".csGriKpiVal > :first-child" },
      { id: "kp-etalonnage", label: "Étalonnage" },
      { id: "kp-tension", label: "Mise sous tension" },
    ],
  },
  "section-cta": {
    variantes: [
      { id: "ct-signal", label: "Signal", texte: "montee", t0: 400 },
      { id: "ct-transmission", label: "Transmission" },
    ],
  },

  /**
   * Frise d'étapes numérotées.
   *
   * fr-trace  : le trait néon se trace d'une étape à l'autre, chaque
   *             numéro s'allume au passage du trait, le texte monte.
   * fr-allumage : chaque étape s'allume dans l'ordre, comme des
   *             instruments mis sous tension l'un après l'autre.
   */
  frise: {
    sequence: ".csFriseEtape",
    variantes: [
      { id: "fr-trace", label: "Tracé" },
      { id: "fr-allumage", label: "Allumage" },
    ],
  },
};
