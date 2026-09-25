/**
 * Tests minimaux des outils des fonds en relief, sans dépendance : exécutés
 * par le lanceur intégré de Node (types retirés à la volée).
 *
 *   node --test src/components/console/fonds/relief/bruit.test.mts
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  champLent,
  courbe,
  courbes,
  creerBruit,
  cretes,
  fbm,
  flouBoite,
  lignesDeCrete,
  mulberry32,
  normaliser,
  ombrage,
  segmentsDeCrete,
} from "./bruit.ts";

test("mulberry32 : même graine, même suite", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 20; i += 1) assert.equal(a(), b());
});

test("bruit : stable, borné, non constant", () => {
  const b1 = creerBruit(7);
  const b2 = creerBruit(7);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < 4000; i += 1) {
    const x = (i % 97) * 0.173;
    const y = Math.floor(i / 97) * 0.291;
    const v = b1(x, y);
    assert.equal(v, b2(x, y));
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  assert.ok(min >= -1 && max <= 1, `hors bornes : ${min} ${max}`);
  assert.ok(max - min > 0.8, "bruit trop plat");
});

test("fbm et crêtes : bornés", () => {
  const b = creerBruit(3);
  for (let i = 0; i < 1000; i += 1) {
    const f = fbm(b, i * 0.37, i * 0.11, 5);
    const c = cretes(b, i * 0.37, i * 0.11, 5);
    assert.ok(f >= -1 && f <= 1);
    assert.ok(c >= 0 && c <= 1);
  }
});

test("champLent : une fonction affine est restituée exactement", () => {
  const l = 13;
  const h = 7;
  const champ = champLent(l, h, 4, (i, j) => 2 * i - j + 1);
  for (let j = 0; j < h; j += 1) for (let i = 0; i < l; i += 1) assert.ok(Math.abs(champ[j * l + i] - (2 * i - j + 1)) < 1e-4);
});

test("normaliser : ramène dans [0, 1]", () => {
  const v = normaliser(new Float32Array([2, 4, 6]));
  assert.deepEqual(Array.from(v), [0, 0.5, 1]);
});

test("flouBoite : constante inchangée, pic étalé", () => {
  const plat = flouBoite(new Float32Array(25).fill(3), 5, 5, 1);
  for (const v of plat) assert.ok(Math.abs(v - 3) < 1e-6);
  const pic = new Float32Array(49);
  pic[24] = 9;
  const etale = flouBoite(pic, 7, 7, 1);
  assert.ok(Math.abs(etale[24] - 1) < 1e-6);
  assert.ok(Math.abs(etale[16] - 1) < 1e-6);
  assert.equal(etale[0], 0);
});

test("ombrage : plat = sin(élévation), pente tournée vers la lumière plus claire", () => {
  const l = 8;
  const h = 8;
  const elevation = Math.PI / 5;
  const reglages = { azimut: (7 * Math.PI) / 4, elevation, exageration: 1, pas: 1 };
  const plat = ombrage(new Float32Array(l * h), l, h, reglages);
  for (const v of plat) assert.ok(Math.abs(v - Math.sin(elevation)) < 1e-6);

  // Terrain qui descend vers le nord-ouest : son versant fait face à la lumière.
  const pente = new Float32Array(l * h);
  for (let j = 0; j < h; j += 1) for (let i = 0; i < l; i += 1) pente[j * l + i] = (i + j) * 0.3;
  const eclaire = ombrage(pente, l, h, reglages);
  assert.ok(eclaire[3 * l + 3] > Math.sin(elevation));
});

test("courbe : un cône donne un cercle, pente tournée vers le sommet", () => {
  const n = 21;
  const hauteurs = new Float32Array(n * n);
  for (let j = 0; j < n; j += 1) for (let i = 0; i < n; i += 1) hauteurs[j * n + i] = -Math.hypot(i - 10, j - 10);
  let segments = 0;
  courbe(hauteurs, n, n, -5, (x1, y1, x2, y2, gx, gy) => {
    segments += 1;
    for (const [x, y] of [
      [x1, y1],
      [x2, y2],
    ]) {
      assert.ok(Math.abs(Math.hypot(x - 10, y - 10) - 5) < 0.35);
    }
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    assert.ok(gx * (10 - mx) + gy * (10 - my) > 0);
  });
  assert.ok(segments >= 24, `${segments} segments`);
});

test("courbes : plusieurs niveaux en un passage, rang transmis", () => {
  const n = 21;
  const hauteurs = new Float32Array(n * n);
  for (let j = 0; j < n; j += 1) for (let i = 0; i < n; i += 1) hauteurs[j * n + i] = -Math.hypot(i - 10, j - 10);
  const parRang = [0, 0, 0];
  courbes(hauteurs, n, n, [-8, -5, -2], (rang, x1, y1) => {
    parRang[rang] += 1;
    assert.ok(Math.abs(Math.hypot(x1 - 10, y1 - 10) - [8, 5, 2][rang]) < 0.4);
  });
  assert.ok(parRang[0] > parRang[1] && parRang[1] > parRang[2] && parRang[2] > 0);
});

test("lignesDeCrete : une arête droite est trouvée sur sa ligne, dans son axe", () => {
  const l = 21;
  const h = 11;
  const hauteurs = new Float32Array(l * h);
  for (let j = 0; j < h; j += 1) for (let i = 0; i < l; i += 1) hauteurs[j * l + i] = -((i - 10) ** 2);
  let points = 0;
  lignesDeCrete(hauteurs, l, h, 0.5, (i, j, tx, ty, courbure) => {
    points += 1;
    assert.equal(i, 10);
    assert.ok(Math.abs(tx) < 1e-9 && Math.abs(Math.abs(ty) - 1) < 1e-9);
    assert.ok(Math.abs(courbure - 2) < 1e-9);
  });
  assert.equal(points, h - 2);
});

test("segmentsDeCrete : une arête décalée est chaînée d'un seul trait, à sa position exacte", () => {
  const l = 21;
  const h = 11;
  const hauteurs = new Float32Array(l * h);
  for (let j = 0; j < h; j += 1) for (let i = 0; i < l; i += 1) hauteurs[j * l + i] = -((i - 10.3) ** 2);
  const segments: number[][] = [];
  segmentsDeCrete(hauteurs, l, h, 0.5, () => true, (x1, y1, x2, y2) => segments.push([x1, y1, x2, y2]));
  assert.equal(segments.length, h - 3);
  for (const [x1, y1, x2, y2] of segments) {
    assert.ok(Math.abs(x1 - 10.3) < 1e-6 && Math.abs(x2 - 10.3) < 1e-6);
    assert.equal(Math.abs(y2 - y1), 1);
  }
  let aucun = 0;
  segmentsDeCrete(hauteurs, l, h, 0.5, () => false, () => (aucun += 1));
  assert.equal(aucun, 0);
});
