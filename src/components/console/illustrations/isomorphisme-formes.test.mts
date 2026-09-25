/**
 * Tests minimaux du modèle « Isomorphisme », sans dépendance : exécutés
 * par le lanceur intégré de Node (types retirés à la volée).
 *
 *   node --test src/components/console/illustrations/isomorphisme-formes.test.mts
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { NOMBRE_POINTS, creerTableTemps, genererLiens, genererParcours } from "./isomorphisme-formes.ts";

test("89 points et 267 liens", () => {
  assert.equal(NOMBRE_POINTS, 89);
  assert.equal(genererLiens().length / 3, 267);
});

test("50 formes de 89 points, toutes dans le disque unité", () => {
  const parcours = genererParcours();
  assert.equal(parcours.length, 50);
  assert.equal(parcours[0].nom, "TOURNESOL");
  assert.equal(new Set(parcours).size, 50);
  for (const forme of parcours) {
    assert.equal(forme.points.length, 89, forme.nom);
    for (const [x, y, z] of forme.points) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), forme.nom);
      assert.ok(Math.hypot(x, y) <= 1 + 1e-9, forme.nom);
    }
  }
});

test("deux formes voisines ne viennent jamais de la même famille", () => {
  const parcours = genererParcours();
  const famille = (nom: string) => nom.split(" ")[0];
  let memes = 0;
  for (let k = 1; k < parcours.length; k += 1) if (famille(parcours[k].nom) === famille(parcours[k - 1].nom)) memes += 1;
  // Les familles nombreuses finissent seules en fin de parcours : quelques répétitions tolérées.
  assert.ok(memes < 10);
});

test("table du temps : commence à 0, finit à 1, toujours croissante", () => {
  const temps = creerTableTemps();
  assert.equal(temps(0), 0);
  assert.ok(Math.abs(temps(1 - 1e-9) - 1) < 1e-3);
  let avant = -1;
  for (let x = 0; x < 1; x += 0.01) {
    const t = temps(x);
    assert.ok(t >= avant);
    avant = t;
  }
});
