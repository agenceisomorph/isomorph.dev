/**
 * Globe Console : fonctions pures de géométrie, sans three.js ni React.
 * Testées par `geometrie.test.mjs` (`node --test`).
 */

export type Vecteur3 = readonly [number, number, number];

const DEG = Math.PI / 180;

/**
 * Latitude et longitude (degrés) vers un vecteur unitaire, dans le repère de
 * three.js : y vers le nord, z vers l'observateur au méridien d'origine,
 * x vers l'est.
 */
export function versVecteur(lat: number, lon: number): Vecteur3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return [Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda)];
}

/**
 * Générateur pseudo-aléatoire à graine (mulberry32) : même graine, même
 * suite, côté serveur comme côté navigateur. Valeurs dans [0, 1).
 */
export function creerAlea(graine: number): () => number {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Décode les anneaux de `points-terre.json` (`[latitude, longitudes…]` en
 * dixièmes de degré) en vecteurs unitaires à plat : x, y, z, x, y, z…
 */
export function decoderAnneaux(anneaux: readonly (readonly number[])[]): Float32Array {
  let total = 0;
  for (const anneau of anneaux) total += Math.max(0, anneau.length - 1);
  const sortie = new Float32Array(total * 3);
  let i = 0;
  for (const anneau of anneaux) {
    const lat = anneau[0] / 10;
    for (let k = 1; k < anneau.length; k += 1) {
      const [x, y, z] = versVecteur(lat, anneau[k] / 10);
      sortie[i] = x;
      sortie[i + 1] = y;
      sortie[i + 2] = z;
      i += 3;
    }
  }
  return sortie;
}

/**
 * Distance de caméra pour qu'une sphère de rayon `rayon`, centrée sur l'axe
 * de visée, occupe `partHauteur` de la demi-hauteur du cadre, sans dépasser
 * `partLargeur` de sa demi-largeur.
 *
 * @param fov champ vertical de la caméra, en degrés
 * @param aspect largeur divisée par hauteur du cadre
 */
export function distanceCamera(fov: number, aspect: number, partHauteur: number, partLargeur: number, rayon: number): number {
  const part = Math.min(partHauteur, partLargeur * aspect);
  const angle = Math.atan(part * Math.tan((fov * DEG) / 2));
  return rayon / Math.sin(angle);
}

/**
 * Coordonnée décimale en degrés, minutes et secondes entières, comme les
 * donne Wikipédia : `43° 07′ 20″ N`.
 */
export function degresMinutesSecondes(valeur: number, positif: string, negatif: string): string {
  const totalSecondes = Math.round(Math.abs(valeur) * 3600);
  const degres = Math.floor(totalSecondes / 3600);
  const minutes = Math.floor((totalSecondes % 3600) / 60);
  const secondes = totalSecondes % 60;
  const deux = (n: number) => String(n).padStart(2, "0");
  return `${degres}° ${deux(minutes)}′ ${deux(secondes)}″ ${valeur >= 0 ? positif : negatif}`;
}
