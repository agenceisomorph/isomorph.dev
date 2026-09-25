/**
 * Carte Console : tests de la géométrie, des écritures de coordonnées, de
 * l'accord des couleurs entre le style MapLibre et le thème Snazzy Maps, et
 * de la chorégraphie d'apparition.
 *
 * Lancement : node --test src/components/console/carte/carte.test.mjs
 * (Node 22.18 ou plus récent : les types des modules `.ts` sont retirés à la
 * volée ; ces modules n'importent que des types).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  cadrer,
  calculerGrille,
  caseContenant,
  casesDuPolygone,
  choisirPas,
  contourCases,
  decimalesPas,
  dedoublonner,
  ecrireLatitude,
  ecrireLongitude,
  normaliserLongitude,
  projection,
  tailleMonde,
  versEcran,
  versMercator,
} from "./geometrie.ts";
import {
  APPARITION,
  DELAI_ANNONCE,
  DUREE_APPARITION,
  finApparition,
  FONDU_REDUIT,
  MISE_AU_POINT,
  PLAFOND_ATTENTE,
  pourcent,
} from "./apparition.ts";
import { PALETTE_CARTE, PASTILLES_CARTE, SOURCE_TUILES, styleCarte } from "./style.ts";

const PARIS = [2.3519, 48.8567];
const TOULON = [5.93, 43.1222];
const proche = (a, b, tolerance = 1e-9) => Math.abs(a - b) <= tolerance;

test("projection : l'origine au milieu du monde, le centre de la vue au milieu du bloc", () => {
  const m = versMercator([0, 0]);
  assert.ok(proche(m.x, 0.5) && proche(m.y, 0.5));
  assert.ok(proche(versMercator([180, 0]).x, 1));

  const taille = { largeur: 800, hauteur: 600 };
  const p = projection({ lng: 0, lat: 0, zoom: 0 }, taille);
  const centre = versEcran([0, 0], p);
  assert.ok(proche(centre.x, 400) && proche(centre.y, 300));
  /* Au zoom 0, le monde mesure 512 px : 90° de longitude valent 128 px. */
  assert.ok(proche(versEcran([90, 0], p).x, 528));
});

test("cadrage : Paris et Toulon tiennent dans le bloc, à la marge près", () => {
  const taille = { largeur: 1184, hauteur: 520 };
  const marge = 72;
  const vue = cadrer([PARIS, TOULON], taille, { marge, zoomMin: 2, zoomMax: 15, zoomSeul: 5 });
  const p = projection(vue, taille);
  const points = [PARIS, TOULON].map((point) => versEcran(point, p));
  for (const { x, y } of points) {
    assert.ok(x >= marge - 1e-6 && x <= taille.largeur - marge + 1e-6);
    assert.ok(y >= marge - 1e-6 && y <= taille.hauteur - marge + 1e-6);
  }
  /* La hauteur limite : un des deux points touche la marge haute. */
  assert.ok(points.some(({ y }) => proche(y, marge, 1e-6)));

  const seul = cadrer([TOULON], taille, { marge, zoomMin: 2, zoomMax: 15, zoomSeul: 9 });
  assert.equal(seul.zoom, 9);
});

test("grille : pas le plus proche de la cible, cases carrées, lignes sur des longitudes rondes", () => {
  /* Zoom 5 : 2° valent 512 × 32 × 2 / 360 ≈ 91 px. */
  assert.equal(choisirPas(5, 96), 2);
  /* Zoom 12 : 0,02° valent environ 116 px, 0,01° environ 58 px. */
  assert.equal(choisirPas(12, 96), 0.02);

  const vue = { lng: 4.14, lat: 46, zoom: 5.17 };
  const g = calculerGrille(vue, { largeur: 1184, hauteur: 520 }, 96);
  assert.equal(g.pas, 2);
  assert.ok(proche(g.cote, (g.pas / 360) * tailleMonde(vue.zoom)));
  for (const c of g.colonnes) assert.ok(proche(c.valeur / g.pas, Math.round(c.valeur / g.pas), 1e-9));
  for (let k = 1; k < g.lignes.length; k++) {
    assert.ok(proche(g.lignes[k].position - g.lignes[k - 1].position, g.cote, 1e-6));
    assert.ok(g.lignes[k].valeur < g.lignes[k - 1].valeur);
  }
});

test("cases : polygone, repli d'un petit polygone, contour en escalier", () => {
  const pas = 1;
  const s = pas / 360;
  /* Carré qui couvre exactement deux cases sur deux (bornes prises en Mercator). */
  const bord = (i, j) => [i * s * 360 - 180, (360 / Math.PI) * Math.atan(Math.exp(Math.PI * (1 - 2 * j * s))) - 90];
  const carre = [bord(180, 130), bord(182, 130), bord(182, 132), bord(180, 132)];
  const cases = casesDuPolygone(carre, pas);
  assert.equal(cases.length, 4);
  assert.equal(contourCases(cases).length, 8);

  const petit = casesDuPolygone([[5.1, 43.1], [5.2, 43.1], [5.15, 43.2]], pas);
  assert.deepEqual(petit, [caseContenant([5.15, 43.15], pas)]);

  /* Trois cases en L : huit côtés extérieurs, dont deux marches. */
  assert.equal(contourCases([[0, 0], [1, 0], [0, 1]]).length, 8);
  assert.equal(dedoublonner([[0, 0], [0, 0], [1, 0]]).length, 2);
});

test("écriture des coordonnées : virgule décimale et hémisphère en lettre", () => {
  assert.equal(ecrireLatitude(43.1222, 4), "43,1222 N");
  assert.equal(ecrireLongitude(5.93, 4), "5,9300 E");
  assert.equal(ecrireLongitude(-1.5, 1), "1,5 O");
  assert.equal(ecrireLatitude(-33.5, 1), "33,5 S");
  assert.equal(ecrireLongitude(4, 0, true), "4° E");
  /* Un zéro arrondi garde l'hémisphère nord ou est. */
  assert.equal(ecrireLatitude(-0.00001, 2), "0,00 N");
  assert.equal(normaliserLongitude(190), -170);
  assert.deepEqual([2, 0.5, 0.05, 0.001].map(decimalesPas), [0, 1, 2, 3]);
});

test("thème : le JSON Snazzy Maps, la palette et le style MapLibre s'accordent", () => {
  const theme = JSON.parse(readFileSync(new URL("./theme-snazzy.json", import.meta.url), "utf8"));
  const palette = new Set(Object.values(PALETTE_CARTE));

  const couleursTheme = new Set();
  for (const regle of theme) {
    assert.ok(Array.isArray(regle.stylers) && regle.stylers.length > 0);
    for (const regleur of regle.stylers) {
      assert.equal(Object.keys(regleur).length, 1, "une seule propriété par réglage");
      if ("color" in regleur) {
        assert.match(regleur.color, /^#[0-9a-f]{6}$/);
        couleursTheme.add(regleur.color);
      }
    }
  }
  assert.deepEqual([...couleursTheme].sort(), [...palette].sort());

  const style = styleCarte();
  const texte = JSON.stringify(style);
  for (const couleur of palette) assert.ok(texte.includes(couleur), `${couleur} absente du style MapLibre`);
  assert.equal(style.sources.openmaptiles.url, SOURCE_TUILES);
  assert.ok(!("glyphs" in style) && !("sprite" in style));
  assert.ok(style.layers.every((couche) => couche.type !== "symbol"), "aucun libellé sur la carte");

  assert.deepEqual(PASTILLES_CARTE.map((p) => p.cle).sort(), Object.keys(PALETTE_CARTE).sort());
});

test("apparition : mise au point visible, surcouche allumée une fois net, état « prête » après la dernière étape", () => {
  const fin = finApparition();
  assert.equal(fin, Math.max(...Object.values(APPARITION).map((e) => e.delai + e.duree)));
  /* Entre 1,4 et 1,6 s, « prête » posée juste après la dernière animation. */
  assert.ok(DUREE_APPARITION > fin && DUREE_APPARITION >= 1400 && DUREE_APPARITION <= 1600, `${DUREE_APPARITION} ms`);
  assert.ok(FONDU_REDUIT < DUREE_APPARITION);
  /* L'objectif cherche : opaque, net trop tôt, reflou, verrou, dans la durée du fond. */
  const { opaque, netTot, reflou, verrou } = MISE_AU_POINT;
  assert.ok(opaque < netTot && netTot < reflou && reflou < verrou && verrou < APPARITION.fond.duree);
  assert.ok(verrou < APPARITION.viseur.duree);
  /* Surcouche et commandes s'allument après le net, jamais avant. */
  assert.ok(APPARITION.surcouche.delai > verrou && APPARITION.commandes.delai > verrou);
  assert.ok(DELAI_ANNONCE < PLAFOND_ATTENTE);
  assert.equal(finApparition({ a: { delai: 100, duree: 50 }, b: { delai: 0, duree: 120 } }), 150);
  assert.equal(pourcent(880, { delai: 0, duree: 1100 }), "80%");
  assert.equal(pourcent(1200, { delai: 0, duree: 1100 }), "100%");
});
