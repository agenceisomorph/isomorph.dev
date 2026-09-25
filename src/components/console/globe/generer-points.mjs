/**
 * Génère `points-terre.json`, le semis de points des terres du globe Console.
 *
 * Relancer (installation temporaire hors du dépôt, rien dans package.json) :
 *
 *   mkdir -p /tmp/globe-points && npm install --prefix /tmp/globe-points --no-save world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1
 *   node src/components/console/globe/generer-points.mjs /tmp/globe-points
 *
 * Source des terres : Natural Earth 1:50m (domaine public), empaqueté par
 * world-atlas (fichier `land-50m.json`, TopoJSON).
 *
 * Semis en quinconce : des anneaux de latitude espacés de pas × √3/2, des
 * points espacés d'environ un pas sur chaque anneau, décalés d'un demi-pas
 * un anneau sur deux. Le motif est hexagonal et le pas reste à peu près
 * constant sur toute la sphère. Un point est gardé s'il tombe sur une terre.
 *
 * Format de sortie : `anneaux` est une liste de lignes
 * `[latitude, longitude, longitude, …]`, en dixièmes de degré entiers.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Écart entre deux points voisins, en degrés d'arc. */
const PAS = 1.2;

/** Poids maximal du fichier produit, en octets. */
const POIDS_MAX = 60 * 1024;

const dossierModules = process.argv[2];
if (!dossierModules) {
  console.error("Usage : node generer-points.mjs <dossier de l'installation temporaire>");
  process.exit(1);
}

const exiger = createRequire(join(dossierModules, "index.js"));
const charger = (nom) => import(pathToFileURL(exiger.resolve(nom)).href);

const { feature } = await charger("topojson-client");
const { geoBounds, geoContains } = await charger("d3-geo");

const topologie = JSON.parse(readFileSync(exiger.resolve("world-atlas/land-50m.json"), "utf8"));
const terres = feature(topologie, topologie.objects.land);

/* Un polygone par île ou continent, avec son emprise, pour ne tester que
   ceux qui peuvent contenir le point. */
const polygones = terres.features
  .flatMap((f) => (f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates]))
  .map((coordinates) => {
    const forme = { type: "Polygon", coordinates };
    const [[ouest, sud], [est, nord]] = geoBounds(forme);
    return { forme, ouest, sud, est, nord };
  });

/** Vrai si l'emprise contient le point (emprise à cheval sur l'antiméridien comprise). */
function dansEmprise(p, lon, lat) {
  if (lat < p.sud || lat > p.nord) return false;
  return p.ouest <= p.est ? lon >= p.ouest && lon <= p.est : lon >= p.ouest || lon <= p.est;
}

function surTerre(lon, lat) {
  return polygones.some((p) => dansEmprise(p, lon, lat) && geoContains(p.forme, [lon, lat]));
}

const pasLatitude = (PAS * Math.sqrt(3)) / 2;
const nbAnneaux = Math.floor(90 / pasLatitude);
const anneaux = [];
let total = 0;
let gardes = 0;

for (let i = -nbAnneaux; i <= nbAnneaux; i += 1) {
  const lat = i * pasLatitude;
  const n = Math.max(1, Math.round((360 * Math.cos((lat * Math.PI) / 180)) / PAS));
  const pasLongitude = 360 / n;
  const decalage = Math.abs(i) % 2 === 1 ? 0.5 : 0;
  const ligne = [Math.round(lat * 10)];

  for (let k = 0; k < n; k += 1) {
    const lon = -180 + (k + decalage) * pasLongitude;
    total += 1;
    if (surTerre(lon, lat)) {
      ligne.push(Math.round(lon * 10));
      gardes += 1;
    }
  }
  if (ligne.length > 1) anneaux.push(ligne);
}

const sortie = {
  source: "Natural Earth 1:50m, domaine public, via world-atlas 2.0.2 (land-50m.json)",
  pas: PAS,
  format: "anneaux : [latitude, longitudes…] en dixièmes de degré",
  anneaux,
};

const texte = `${JSON.stringify(sortie)}\n`;
const poids = Buffer.byteLength(texte);
if (poids > POIDS_MAX) {
  console.error(`Fichier trop lourd : ${poids} octets (maximum ${POIDS_MAX}).`);
  process.exit(1);
}

const cible = join(dirname(fileURLToPath(import.meta.url)), "points-terre.json");
writeFileSync(cible, texte);
console.log(`${gardes} points gardés sur ${total}, ${anneaux.length} anneaux, ${poids} octets : ${cible}`);
