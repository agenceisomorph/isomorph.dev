/**
 * Tests minimaux du modèle « Réseau neuronal », sans dépendance : exécutés
 * par le lanceur intégré de Node (types retirés à la volée).
 *
 *   node --test src/components/console/illustrations/reseau-neuronal-modele.test.mts
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  choisirRepartis,
  codeGroupe,
  codeHex,
  genererNuage,
  genererReseau,
  lisser,
  mulberry32,
  propager,
} from "./reseau-neuronal-modele.ts";

const GRAINE = 0x2f6a91c3;

test("mulberry32 : même graine, même suite, valeurs dans [0, 1)", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 1000; i += 1) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test("lisser : bornée, 0 et 1 aux extrémités, 0,5 au milieu", () => {
  assert.equal(lisser(-3), 0);
  assert.equal(lisser(0), 0);
  assert.equal(lisser(0.5), 0.5);
  assert.equal(lisser(1), 1);
  assert.equal(lisser(9), 1);
});

test("codes : hexadécimal pur en capitales, longueur exacte", () => {
  const alea = mulberry32(7);
  for (let i = 0; i < 200; i += 1) assert.match(codeHex(alea, 6), /^[0-9A-F]{6}$/);
  assert.match(codeGroupe(alea, 3), /^[0-9A-F]{4} [0-9A-F]{4} [0-9A-F]{4}$/);
});

test("réseau : déterministe, taille attendue, arêtes valides et uniques", () => {
  const r1 = genererReseau(GRAINE);
  const r2 = genererReseau(GRAINE);
  assert.deepEqual(r1.positions, r2.positions);
  assert.deepEqual(r1.aretes, r2.aretes);
  assert.ok(r1.nombreNoeuds >= 150 && r1.nombreNoeuds <= 250, `nœuds : ${r1.nombreNoeuds}`);
  assert.ok(r1.nombreCoeur < r1.nombreNoeuds, "des filaments existent");
  const vues = new Set<number>();
  for (let a = 0; a < r1.aretes.length; a += 2) {
    const x = r1.aretes[a];
    const y = r1.aretes[a + 1];
    assert.ok(x !== y && x < r1.nombreNoeuds && y < r1.nombreNoeuds);
    const cle = Math.min(x, y) * 65536 + Math.max(x, y);
    assert.ok(!vues.has(cle), "arête en double");
    vues.add(cle);
  }
  for (let a = 0; a < r1.niveaux.length; a += 1) assert.ok(r1.niveaux[a] <= 3);
  assert.equal(r1.debutsIncidences[r1.nombreNoeuds], r1.aretes.length);
});

test("propagation : graphe connexe, distances cohérentes le long de chaque arête", () => {
  const r = genererReseau(GRAINE);
  const distances = new Float32Array(r.nombreNoeuds);
  const figes = new Uint8Array(r.nombreNoeuds);
  const plusLoin = propager(r, 0, distances, figes);
  assert.equal(distances[0], 0);
  assert.ok(Number.isFinite(plusLoin) && plusLoin > 0);
  for (let i = 0; i < r.nombreNoeuds; i += 1) assert.ok(Number.isFinite(distances[i]), `nœud ${i} isolé`);
  for (let a = 0; a < r.longueurs.length; a += 1) {
    const ecart = Math.abs(distances[r.aretes[a * 2]] - distances[r.aretes[a * 2 + 1]]);
    assert.ok(ecart <= r.longueurs[a] + 1e-4);
  }
});

test("ancres réparties : indices distincts pris dans la masse", () => {
  const r = genererReseau(GRAINE);
  const ancres = choisirRepartis(r, 5, 0.5, 0.95);
  assert.equal(ancres.length, 5);
  assert.equal(new Set(ancres).size, 5);
  for (const i of ancres) assert.ok(i < r.nombreCoeur);
});

test("nuage : trois coordonnées par point, déterministe", () => {
  const n1 = genererNuage(3, 100);
  assert.equal(n1.length, 300);
  assert.deepEqual(n1, genererNuage(3, 100));
});
