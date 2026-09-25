/**
 * Carte Console : géométrie pure, sans dépendance.
 *
 * Tout ce que la surcouche dessine se calcule ici, à partir de la vue de la
 * carte (centre et niveau de zoom) et de la taille du bloc, avec la projection
 * Web Mercator que MapLibre utilise (tuiles de 512 px, sans rotation ni
 * inclinaison, toutes deux coupées sur la carte). La surcouche ne demande donc
 * rien au canevas pendant un déplacement : aucune lecture de mise en page,
 * seulement du calcul.
 *
 * Coordonnées « Mercator normalisées » : x et y de 0 à 1 sur le monde entier,
 * y croissant vers le sud (comme l'écran).
 *
 * Aucune importation : le module se teste tel quel avec `node --test`
 * (voir `carte.test.mjs`).
 */

/** Point géographique : longitude puis latitude, en degrés (ordre GeoJSON). */
export type PointGeo = readonly [number, number];

/** Vue de la carte : centre (degrés) et niveau de zoom MapLibre. */
export interface Vue {
  lng: number;
  lat: number;
  zoom: number;
}

/** Taille du bloc de la carte, en pixels CSS. */
export interface Taille {
  largeur: number;
  hauteur: number;
}

/** Point en coordonnées Mercator normalisées (0 à 1). */
export interface PointMercator {
  x: number;
  y: number;
}

/** Case d'une grille géographique : [colonne, ligne] pour un pas donné. */
export type Case = readonly [number, number];

/** Taille d'une tuile MapLibre en pixels : le monde mesure 512 × 2^zoom. */
export const TUILE = 512;

/** Latitude limite de la projection Web Mercator. */
export const LAT_MAX = 85.051128779806;

/* ------------------------------------------------------------------ */
/* Projection                                                          */
/* ------------------------------------------------------------------ */

/** Degrés vers Mercator normalisé (formules de MapLibre, `mercatorXfromLng`, `mercatorYfromLat`). */
export function versMercator(point: PointGeo): PointMercator {
  const lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, point[1]));
  return {
    x: (point[0] + 180) / 360,
    y: 0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI),
  };
}

/** Longitude d'un x Mercator normalisé. */
export function longitudeDepuisX(x: number): number {
  return x * 360 - 180;
}

/** Latitude d'un y Mercator normalisé. */
export function latitudeDepuisY(y: number): number {
  return (360 / Math.PI) * Math.atan(Math.exp(Math.PI * (1 - 2 * y))) - 90;
}

/** Largeur du monde en pixels au niveau de zoom donné. */
export function tailleMonde(zoom: number): number {
  return TUILE * 2 ** zoom;
}

/** Projection d'une vue : convertit du Mercator normalisé en pixels du bloc. */
export interface Projection {
  /** Centre de la vue, en Mercator normalisé. */
  centre: PointMercator;
  /** Largeur du monde en pixels. */
  monde: number;
  taille: Taille;
  x: (mx: number) => number;
  y: (my: number) => number;
}

export function projection(vue: Vue, taille: Taille): Projection {
  const centre = versMercator([vue.lng, vue.lat]);
  const monde = tailleMonde(vue.zoom);
  return {
    centre,
    monde,
    taille,
    x: (mx) => (mx - centre.x) * monde + taille.largeur / 2,
    y: (my) => (my - centre.y) * monde + taille.hauteur / 2,
  };
}

/** Position à l'écran d'un point géographique. */
export function versEcran(point: PointGeo, p: Projection): { x: number; y: number } {
  const m = versMercator(point);
  return { x: p.x(m.x), y: p.y(m.y) };
}

/* ------------------------------------------------------------------ */
/* Cadrage                                                             */
/* ------------------------------------------------------------------ */

/** Centre d'un ensemble de points, pris au milieu de leur emprise Mercator. */
export function centreDe(points: readonly PointGeo[]): PointGeo {
  if (points.length === 0) return [0, 0];
  const ms = points.map(versMercator);
  const xs = ms.map((m) => m.x);
  const ys = ms.map((m) => m.y);
  const x = (Math.min(...xs) + Math.max(...xs)) / 2;
  const y = (Math.min(...ys) + Math.max(...ys)) / 2;
  return [longitudeDepuisX(x), latitudeDepuisY(y)];
}

/**
 * Vue qui fait tenir tous les points dans le bloc, à `marge` pixels des bords.
 * Un point seul (ou des points confondus) prend `zoomSeul`.
 */
export function cadrer(
  points: readonly PointGeo[],
  taille: Taille,
  options: { marge: number; zoomMin: number; zoomMax: number; zoomSeul: number },
): Vue {
  const [lng, lat] = centreDe(points);
  const ms = points.map(versMercator);
  const dx = ms.length ? Math.max(...ms.map((m) => m.x)) - Math.min(...ms.map((m) => m.x)) : 0;
  const dy = ms.length ? Math.max(...ms.map((m) => m.y)) - Math.min(...ms.map((m) => m.y)) : 0;
  const utileX = Math.max(1, taille.largeur - 2 * options.marge);
  const utileY = Math.max(1, taille.hauteur - 2 * options.marge);
  const zoomX = dx > 0 ? Math.log2(utileX / (dx * TUILE)) : Infinity;
  const zoomY = dy > 0 ? Math.log2(utileY / (dy * TUILE)) : Infinity;
  const ajuste = Math.min(zoomX, zoomY);
  const zoom = Number.isFinite(ajuste) ? ajuste : options.zoomSeul;
  return { lng, lat, zoom: Math.max(options.zoomMin, Math.min(options.zoomMax, zoom)) };
}

/* ------------------------------------------------------------------ */
/* Grille                                                              */
/* ------------------------------------------------------------------ */

/**
 * Pas de grille possibles, en degrés de longitude. Tous divisent 180 : les
 * lignes verticales tombent donc sur des longitudes rondes.
 */
export const PAS_GRILLE = [20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001] as const;

/** Pas dont la case, à ce zoom, s'approche le plus de `ciblePx` (écart mesuré en rapport). */
export function choisirPas(zoom: number, ciblePx: number): number {
  const monde = tailleMonde(zoom);
  let meilleur: number = PAS_GRILLE[0];
  let ecart = Infinity;
  for (const pas of PAS_GRILLE) {
    const e = Math.abs(Math.log(((pas / 360) * monde) / ciblePx));
    if (e < ecart) {
      ecart = e;
      meilleur = pas;
    }
  }
  return meilleur;
}

export interface LigneGrille {
  /** Rang de la ligne sur la grille du monde (stable pendant un déplacement). */
  indice: number;
  /** Position à l'écran, en pixels. */
  position: number;
  /** Longitude (colonnes) ou latitude (lignes) de la ligne, en degrés. */
  valeur: number;
}

/** Plage des cases visibles, bornes comprises. */
export interface Fenetre {
  i0: number;
  i1: number;
  j0: number;
  j1: number;
}

export interface Grille {
  /** Pas en degrés de longitude. */
  pas: number;
  /** Côté d'une case à l'écran, en pixels (les cases sont carrées). */
  cote: number;
  colonnes: LigneGrille[];
  lignes: LigneGrille[];
  fenetre: Fenetre;
}

/**
 * Grille géographique de la vue.
 *
 * Colonnes : longitudes multiples du pas. Lignes : même pas, mais compté en
 * Mercator depuis le bord nord du monde, pour que les cases restent carrées à
 * l'écran comme sur la référence ; leurs latitudes sont réelles, pas rondes.
 */
export function calculerGrille(vue: Vue, taille: Taille, ciblePx: number): Grille {
  const pas = choisirPas(vue.zoom, ciblePx);
  const s = pas / 360;
  const p = projection(vue, taille);
  const demiX = taille.largeur / 2 / p.monde;
  const demiY = taille.hauteur / 2 / p.monde;
  const i0 = Math.ceil((p.centre.x - demiX) / s);
  const i1 = Math.floor((p.centre.x + demiX) / s);
  const j0 = Math.max(0, Math.ceil((p.centre.y - demiY) / s));
  const j1 = Math.min(Math.round(1 / s), Math.floor((p.centre.y + demiY) / s));

  const colonnes: LigneGrille[] = [];
  for (let i = i0; i <= i1; i++) {
    colonnes.push({ indice: i, position: p.x(i * s), valeur: i * pas - 180 });
  }
  const lignes: LigneGrille[] = [];
  for (let j = j0; j <= j1; j++) {
    lignes.push({ indice: j, position: p.y(j * s), valeur: latitudeDepuisY(j * s) });
  }
  return { pas, cote: s * p.monde, colonnes, lignes, fenetre: fenetreVisible(p, pas) };
}

/** Cases (même partiellement) visibles pour une grille de pas `pas`. */
export function fenetreVisible(p: Projection, pas: number): Fenetre {
  const s = pas / 360;
  const demiX = p.taille.largeur / 2 / p.monde;
  const demiY = p.taille.hauteur / 2 / p.monde;
  return {
    i0: Math.floor((p.centre.x - demiX) / s),
    i1: Math.floor((p.centre.x + demiX) / s),
    j0: Math.floor((p.centre.y - demiY) / s),
    j1: Math.floor((p.centre.y + demiY) / s),
  };
}

/** La case est-elle dans la fenêtre ? */
export function dansFenetre(c: Case, f: Fenetre): boolean {
  return c[0] >= f.i0 && c[0] <= f.i1 && c[1] >= f.j0 && c[1] <= f.j1;
}

/* ------------------------------------------------------------------ */
/* Cases et zones                                                      */
/* ------------------------------------------------------------------ */

/** Case de la grille de pas `pas` qui contient le point. */
export function caseContenant(point: PointGeo, pas: number): Case {
  const m = versMercator(point);
  const s = pas / 360;
  return [Math.floor(m.x / s), Math.floor(m.y / s)];
}

/** Point dans un polygone (règle pair-impair, tracé fermé implicitement). */
export function pointDansPolygone(x: number, y: number, polygone: readonly PointMercator[]): boolean {
  let dedans = false;
  for (let a = 0, b = polygone.length - 1; a < polygone.length; b = a++) {
    const pa = polygone[a];
    const pb = polygone[b];
    if (pa.y > y !== pb.y > y && x < ((pb.x - pa.x) * (y - pa.y)) / (pb.y - pa.y) + pa.x) {
      dedans = !dedans;
    }
  }
  return dedans;
}

/**
 * Cases dont le centre tombe dans le polygone : le contour suit la grille, en
 * escalier. `fenetre` limite le calcul aux cases visibles (indispensable aux
 * forts zooms). Un polygone plus petit qu'une case garde la case de son centre,
 * pour rester visible à tous les zooms.
 */
export function casesDuPolygone(polygone: readonly PointGeo[], pas: number, fenetre?: Fenetre): Case[] {
  if (polygone.length < 3) return [];
  const s = pas / 360;
  const pts = polygone.map(versMercator);
  const xs = pts.map((m) => m.x);
  const ys = pts.map((m) => m.y);
  let i0 = Math.floor(Math.min(...xs) / s);
  let i1 = Math.floor(Math.max(...xs) / s);
  let j0 = Math.floor(Math.min(...ys) / s);
  let j1 = Math.floor(Math.max(...ys) / s);
  if (fenetre) {
    i0 = Math.max(i0, fenetre.i0);
    i1 = Math.min(i1, fenetre.i1);
    j0 = Math.max(j0, fenetre.j0);
    j1 = Math.min(j1, fenetre.j1);
  }
  const cases: Case[] = [];
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      if (pointDansPolygone((i + 0.5) * s, (j + 0.5) * s, pts)) cases.push([i, j]);
    }
  }
  const petit = Math.max(...xs) - Math.min(...xs) < s && Math.max(...ys) - Math.min(...ys) < s;
  if (cases.length === 0 && petit) {
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const c: Case = [Math.floor(cx / s), Math.floor(cy / s)];
    if (!fenetre || dansFenetre(c, fenetre)) cases.push(c);
  }
  return cases;
}

/** Segment de contour, en unités de grille (coins de cases). */
export interface Segment {
  a: Case;
  b: Case;
}

/**
 * Contour extérieur et intérieur d'un ensemble de cases : chaque côté de case
 * qui ne touche pas une autre case de l'ensemble. Donne le tracé en escalier.
 */
export function contourCases(cases: readonly Case[]): Segment[] {
  const cle = (i: number, j: number) => `${i}:${j}`;
  const ensemble = new Set(cases.map(([i, j]) => cle(i, j)));
  const segments: Segment[] = [];
  for (const [i, j] of cases) {
    if (!ensemble.has(cle(i, j - 1))) segments.push({ a: [i, j], b: [i + 1, j] });
    if (!ensemble.has(cle(i, j + 1))) segments.push({ a: [i, j + 1], b: [i + 1, j + 1] });
    if (!ensemble.has(cle(i - 1, j))) segments.push({ a: [i, j], b: [i, j + 1] });
    if (!ensemble.has(cle(i + 1, j))) segments.push({ a: [i + 1, j], b: [i + 1, j + 1] });
  }
  return segments;
}

/** Garde une case une seule fois (les listes fournies peuvent se répéter). */
export function dedoublonner(cases: readonly Case[]): Case[] {
  const vues = new Set<string>();
  const sortie: Case[] = [];
  for (const c of cases) {
    const cle = `${c[0]}:${c[1]}`;
    if (!vues.has(cle)) {
      vues.add(cle);
      sortie.push(c);
    }
  }
  return sortie;
}

/* ------------------------------------------------------------------ */
/* Écriture des coordonnées                                            */
/* ------------------------------------------------------------------ */

/** Décimales qui suffisent à écrire un multiple du pas (0,5 → 1 ; 0,05 → 2). */
export function decimalesPas(pas: number): number {
  return Math.max(0, -Math.floor(Math.log10(pas) + 1e-9));
}

/** Longitude ramenée entre -180 et 180. */
export function normaliserLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function nombre(valeur: number, decimales: number, degre: boolean): string {
  return `${Math.abs(valeur).toFixed(decimales).replace(".", ",")}${degre ? "°" : ""}`;
}

/** « 43,1222 N » (ou « 43,12° N » avec `degre`) : virgule décimale, hémisphère en lettre. */
export function ecrireLatitude(lat: number, decimales: number, degre = false): string {
  const arrondi = Number(lat.toFixed(decimales));
  return `${nombre(lat, decimales, degre)} ${arrondi < 0 ? "S" : "N"}`;
}

/** « 5,9280 E » ; O pour l'ouest. */
export function ecrireLongitude(lng: number, decimales: number, degre = false): string {
  const l = normaliserLongitude(lng);
  const arrondi = Number(l.toFixed(decimales));
  return `${nombre(l, decimales, degre)} ${arrondi < 0 ? "O" : "E"}`;
}
