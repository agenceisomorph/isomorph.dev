/**
 * Tests des fonctions pures du globe. Lancer depuis la racine du dépôt :
 *   node --test src/components/console/globe/geometrie.test.mjs
 * (Node 22.18 ou plus récent lit le TypeScript sans outil.)
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { creerAlea, decoderAnneaux, degresMinutesSecondes, distanceCamera, versVecteur } from "./geometrie.ts";

const proche = (a, b, marge = 1e-6) => assert.ok(Math.abs(a - b) < marge, `${a} attendu près de ${b}`);

test("versVecteur place les repères cardinaux", () => {
  const [x0, y0, z0] = versVecteur(0, 0);
  proche(x0, 0);
  proche(y0, 0);
  proche(z0, 1);
  const [xe, , ze] = versVecteur(0, 90);
  proche(xe, 1);
  proche(ze, 0);
  const [, yn] = versVecteur(90, 42);
  proche(yn, 1);
});

test("versVecteur rend un vecteur unitaire", () => {
  const [x, y, z] = versVecteur(43.1222, 5.93);
  proche(Math.hypot(x, y, z), 1);
});

test("creerAlea est déterministe et reste dans [0, 1)", () => {
  const a = creerAlea(7);
  const b = creerAlea(7);
  for (let i = 0; i < 1000; i += 1) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
  assert.notEqual(creerAlea(1)(), creerAlea(2)());
});

test("decoderAnneaux lit les dixièmes de degré", () => {
  const sortie = decoderAnneaux([[0, 0, 900], [900]]);
  assert.equal(sortie.length, 6);
  proche(sortie[2], 1, 1e-6);
  proche(sortie[3], 1, 1e-6);
});

test("distanceCamera respecte la part de hauteur demandée", () => {
  const fov = 30;
  const d = distanceCamera(fov, 2, 0.8, 0.6, 1);
  /* Rayon apparent de la sphère rapporté à la demi-hauteur du cadre. */
  const part = Math.tan(Math.asin(1 / d)) / Math.tan((fov * Math.PI) / 360);
  proche(part, 0.8, 1e-9);
  /* Cadre étroit : c'est la largeur qui limite. */
  const dEtroit = distanceCamera(fov, 0.5, 0.8, 0.6, 1);
  const partEtroit = Math.tan(Math.asin(1 / dEtroit)) / Math.tan((fov * Math.PI) / 360);
  proche(partEtroit, 0.3, 1e-9);
});

test("degresMinutesSecondes retrouve les valeurs de Wikipédia pour Toulon", () => {
  assert.equal(degresMinutesSecondes(43.1222, "N", "S"), "43° 07′ 20″ N");
  assert.equal(degresMinutesSecondes(5.93, "E", "O"), "5° 55′ 48″ E");
  assert.equal(degresMinutesSecondes(-0.5, "N", "S"), "0° 30′ 00″ S");
  /* Retenue : 59,9996″ s'arrondit à la minute suivante. */
  assert.equal(degresMinutesSecondes(1 + 59 / 60 + 59.9996 / 3600, "E", "O"), "2° 00′ 00″ E");
});
