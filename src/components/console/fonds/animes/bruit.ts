/**
 * Hasard et bruit à graine fixe pour les fonds animés du système Console.
 *
 * Même graine, même dessin à chaque montage : le fond ne change pas d'une
 * visite à l'autre et l'image fixe du mouvement réduit reste celle qui a été
 * choisie. Aucune dépendance.
 */

/** Générateur pseudo-aléatoire (mulberry32) : nombres dans [0, 1). */
function mulberry32(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Table de permutation de Perlin, mélangée par la graine et doublée. */
function permutation(graine: number): Uint8Array {
  const alea = mulberry32(graine);
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) base[i] = i;
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(alea() * (i + 1));
    const t = base[i];
    base[i] = base[j];
    base[j] = t;
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) p[i] = base[i & 255];
  return p;
}

/** Courbe de raccord de Perlin : dérivées première et seconde nulles aux bords. */
const raccord = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Huit directions de gradient réparties sur le cercle. */
const GX2 = [1, -1, 0, 0, Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, -Math.SQRT1_2];
const GY2 = [0, 0, 1, -1, Math.SQRT1_2, Math.SQRT1_2, -Math.SQRT1_2, -Math.SQRT1_2];

/** Bruit de gradient 2D, valeurs voisines de [-1, 1]. */
export function creerBruit2D(graine: number): (x: number, y: number) => number {
  const p = permutation(graine);
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = raccord(xf);
    const v = raccord(yf);
    const g00 = p[p[X] + Y] & 7;
    const g10 = p[p[X + 1] + Y] & 7;
    const g01 = p[p[X] + Y + 1] & 7;
    const g11 = p[p[X + 1] + Y + 1] & 7;
    const n00 = GX2[g00] * xf + GY2[g00] * yf;
    const n10 = GX2[g10] * (xf - 1) + GY2[g10] * yf;
    const n01 = GX2[g01] * xf + GY2[g01] * (yf - 1);
    const n11 = GX2[g11] * (xf - 1) + GY2[g11] * (yf - 1);
    const a = n00 + u * (n10 - n00);
    const b = n01 + u * (n11 - n01);
    // L'amplitude brute plafonne vers 0,71 : ramenée vers 1.
    return (a + v * (b - a)) * 1.41;
  };
}

/** Bornage dans [0, 1]. */
export const borner = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Transition douce entre deux seuils, résultat dans [0, 1]. */
export function adoucir(debut: number, fin: number, t: number): number {
  const x = borner((t - debut) / (fin - debut));
  return x * x * (3 - 2 * x);
}

/** Interpolation linéaire. */
export const melanger = (a: number, b: number, t: number) => a + (b - a) * t;
