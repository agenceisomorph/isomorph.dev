/**
 * Outils des fonds en relief : bruit à graine, cartes de hauteurs, ombrage de
 * relief et courbes de niveau. Fonctions pures, sans DOM ni dépendance.
 *
 * Même graine, même relief : le dessin est identique d'un chargement à
 * l'autre et d'un navigateur à l'autre.
 *
 * Tests : `node --test src/components/console/fonds/relief/bruit.test.mts`
 */

/** Tirage uniforme dans [0, 1). */
export type Alea = () => number;

/** Bruit continu du plan, à valeurs dans [-1, 1]. */
export type Bruit2D = (x: number, y: number) => number;

/** Rappel d'un morceau de courbe de niveau : extrémités et pente du terrain (en coordonnées de grille). */
export type RappelSegment = (x1: number, y1: number, x2: number, y2: number, gx: number, gy: number) => void;

/** Rappel des courbes à plusieurs niveaux : rang du niveau, puis comme `RappelSegment`. */
export type RappelNiveau = (
  rang: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  gx: number,
  gy: number,
) => void;

/** Réglages de l'ombrage de relief. */
export interface ReglagesOmbrage {
  /** Direction de la lumière, en radians depuis le nord, sens horaire (nord-ouest : 7π/4). */
  azimut: number;
  /** Hauteur de la lumière au-dessus de l'horizon, en radians. */
  elevation: number;
  /** Multiplie les hauteurs avant le calcul des pentes. */
  exageration: number;
  /** Écart entre deux points de la grille, dans l'unité des hauteurs exagérées. */
  pas: number;
}

/** Suite pseudo-aléatoire stable pour une graine donnée (mulberry32). */
export function mulberry32(graine: number): Alea {
  let etat = graine >>> 0;
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0;
    let t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


/** Pente douce de Perlin : dérivées première et seconde nulles aux nœuds. */
function fondu(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Amplitude maximale d'un bruit de gradient 2D à gradients unitaires : √2 / 2. */
const NORME_PERLIN = Math.SQRT2;

/**
 * Bruit de gradient (Perlin amélioré) à graine : table de permutation mélangée
 * par la graine, huit directions de gradient unitaires.
 */
export function creerBruit(graine: number): Bruit2D {
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

  const gx = new Float32Array(8);
  const gy = new Float32Array(8);
  for (let k = 0; k < 8; k += 1) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    gx[k] = Math.cos(a);
    gy[k] = Math.sin(a);
  }

  return (x: number, y: number) => {
    const xf = Math.floor(x);
    const yf = Math.floor(y);
    const X = xf & 255;
    const Y = yf & 255;
    const dx = x - xf;
    const dy = y - yf;
    const u = fondu(dx);
    const v = fondu(dy);

    const aa = p[p[X] + Y] & 7;
    const ab = p[p[X] + Y + 1] & 7;
    const ba = p[p[X + 1] + Y] & 7;
    const bb = p[p[X + 1] + Y + 1] & 7;

    const n00 = gx[aa] * dx + gy[aa] * dy;
    const n10 = gx[ba] * (dx - 1) + gy[ba] * dy;
    const n01 = gx[ab] * dx + gy[ab] * (dy - 1);
    const n11 = gx[bb] * (dx - 1) + gy[bb] * (dy - 1);

    const haut = n00 + u * (n10 - n00);
    const bas = n01 + u * (n11 - n01);
    return (haut + v * (bas - haut)) * NORME_PERLIN;
  };
}

/**
 * Bruit fractal (somme d'octaves), normalisé dans [-1, 1]. Chaque octave est
 * décalée pour éviter les zéros alignés du bruit de gradient aux nœuds entiers.
 */
export function fbm(bruit: Bruit2D, x: number, y: number, octaves: number, lacunarite = 2, gain = 0.5): number {
  let somme = 0;
  let amplitude = 1;
  let norme = 0;
  let frequence = 1;
  for (let o = 0; o < octaves; o += 1) {
    somme += amplitude * bruit(x * frequence + o * 17.13, y * frequence - o * 9.71);
    norme += amplitude;
    amplitude *= gain;
    frequence *= lacunarite;
  }
  return somme / norme;
}

/**
 * Bruit de crêtes (multifractal à arêtes), dans [0, 1] : arêtes vives et
 * vallées larges. Chaque octave est pondérée par la précédente, les détails
 * se posent donc sur les crêtes plutôt que dans les fonds. L'octave de base
 * n'est pas décalée : ses zéros sont les lignes de crête principales.
 */
export function cretes(bruit: Bruit2D, x: number, y: number, octaves: number, lacunarite = 2.03, gain = 0.5): number {
  let somme = 0;
  let amplitude = 1;
  let norme = 0;
  let frequence = 1;
  let poids = 1;
  for (let o = 0; o < octaves; o += 1) {
    let signal = 1 - Math.abs(bruit(x * frequence + o * 17.13, y * frequence - o * 9.71));
    signal *= signal;
    signal *= poids;
    poids = Math.min(1, Math.max(0, signal * 1.6));
    somme += signal * amplitude;
    norme += amplitude;
    amplitude *= gain;
    frequence *= lacunarite;
  }
  return somme / norme;
}

/**
 * Champ lent échantillonné en basse résolution : `fonction` n'est évaluée
 * qu'un point sur `pas` dans chaque direction, le reste est interpolé
 * (bilinéaire). Pour les déformations et les socles, dont les variations sont
 * bien plus larges que la grille.
 */
export function champLent(
  largeur: number,
  hauteur: number,
  pas: number,
  fonction: (i: number, j: number) => number,
): Float32Array {
  const cl = Math.max(2, Math.ceil((largeur - 1) / pas) + 1);
  const ch = Math.max(2, Math.ceil((hauteur - 1) / pas) + 1);
  const grossier = new Float32Array(cl * ch);
  for (let q = 0; q < ch; q += 1) for (let p = 0; p < cl; p += 1) grossier[q * cl + p] = fonction(p * pas, q * pas);

  const sortie = new Float32Array(largeur * hauteur);
  for (let j = 0; j < hauteur; j += 1) {
    const q = Math.min(ch - 2, Math.floor(j / pas));
    const v = j / pas - q;
    for (let i = 0; i < largeur; i += 1) {
      const p = Math.min(cl - 2, Math.floor(i / pas));
      const u = i / pas - p;
      const h0 = grossier[q * cl + p] + (grossier[q * cl + p + 1] - grossier[q * cl + p]) * u;
      const h1 = grossier[(q + 1) * cl + p] + (grossier[(q + 1) * cl + p + 1] - grossier[(q + 1) * cl + p]) * u;
      sortie[j * largeur + i] = h0 + (h1 - h0) * v;
    }
  }
  return sortie;
}

/** Ramène les valeurs d'un tableau dans [0, 1] (en place). Renvoie le tableau. */
export function normaliser(valeurs: Float32Array): Float32Array {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < valeurs.length; i += 1) {
    const v = valeurs[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const etendue = max - min || 1;
  for (let i = 0; i < valeurs.length; i += 1) valeurs[i] = (valeurs[i] - min) / etendue;
  return valeurs;
}

/**
 * Flou en boîte séparable (moyenne sur un carré de côté 2 × rayon + 1),
 * bords recopiés. Sert à mesurer le creux ou la bosse d'un point par rapport
 * à son voisinage.
 */
export function flouBoite(valeurs: Float32Array, largeur: number, hauteur: number, rayon: number): Float32Array {
  const passe = new Float32Array(valeurs.length);
  const sortie = new Float32Array(valeurs.length);
  const cote = 2 * rayon + 1;
  const borne = (v: number, max: number) => (v < 0 ? 0 : v > max ? max : v);

  for (let j = 0; j < hauteur; j += 1) {
    const ligne = j * largeur;
    let somme = 0;
    for (let k = -rayon; k <= rayon; k += 1) somme += valeurs[ligne + borne(k, largeur - 1)];
    for (let i = 0; i < largeur; i += 1) {
      passe[ligne + i] = somme / cote;
      somme += valeurs[ligne + borne(i + rayon + 1, largeur - 1)] - valeurs[ligne + borne(i - rayon, largeur - 1)];
    }
  }
  for (let i = 0; i < largeur; i += 1) {
    let somme = 0;
    for (let k = -rayon; k <= rayon; k += 1) somme += passe[borne(k, hauteur - 1) * largeur + i];
    for (let j = 0; j < hauteur; j += 1) {
      sortie[j * largeur + i] = somme / cote;
      somme += passe[borne(j + rayon + 1, hauteur - 1) * largeur + i] - passe[borne(j - rayon, hauteur - 1) * largeur + i];
    }
  }
  return sortie;
}

/**
 * Ombrage de relief (hillshade) d'une grille de hauteurs : éclairement de
 * chaque point dans [0, 1] (0 dans l'ombre, sin(élévation) sur le plat).
 * Pentes par différences centrées, bords recopiés.
 */
export function ombrage(hauteurs: Float32Array, largeur: number, hauteur: number, reglages: ReglagesOmbrage): Float32Array {
  const { azimut, elevation, exageration, pas } = reglages;
  const lx = Math.cos(elevation) * Math.sin(azimut);
  const ly = -Math.cos(elevation) * Math.cos(azimut);
  const lz = Math.sin(elevation);
  const k = exageration / (2 * pas);
  const sortie = new Float32Array(largeur * hauteur);

  for (let j = 0; j < hauteur; j += 1) {
    const jh = j > 0 ? j - 1 : j;
    const jb = j < hauteur - 1 ? j + 1 : j;
    const fy = jb - jh === 2 ? 1 : 2;
    for (let i = 0; i < largeur; i += 1) {
      const ig = i > 0 ? i - 1 : i;
      const id = i < largeur - 1 ? i + 1 : i;
      const fx = id - ig === 2 ? 1 : 2;
      const dzdx = (hauteurs[j * largeur + id] - hauteurs[j * largeur + ig]) * k * fx;
      const dzdy = (hauteurs[jb * largeur + i] - hauteurs[jh * largeur + i]) * k * fy;
      // Normale (-dz/dx, -dz/dy, 1), repère écran : y vers le bas.
      const n = 1 / Math.sqrt(dzdx * dzdx + dzdy * dzdy + 1);
      const e = (-dzdx * lx - dzdy * ly + lz) * n;
      sortie[j * largeur + i] = e > 0 ? e : 0;
    }
  }
  return sortie;
}

/**
 * Lignes de crête d'une grille de hauteurs : points où le terrain est au plus
 * haut en travers de sa courbure la plus forte (courbure négative, maximum
 * local dans cette direction). Appelle `rappel` avec la position, la direction
 * de l'arête (unitaire) et la courbure en travers.
 */
export function lignesDeCrete(
  hauteurs: Float32Array,
  largeur: number,
  hauteur: number,
  courbureMin: number,
  rappel: (i: number, j: number, tx: number, ty: number, courbure: number) => void,
): void {
  for (let j = 1; j < hauteur - 1; j += 1) {
    for (let i = 1; i < largeur - 1; i += 1) {
      const k = j * largeur + i;
      const v = hauteurs[k];
      const hxx = hauteurs[k + 1] - 2 * v + hauteurs[k - 1];
      const hyy = hauteurs[k + largeur] - 2 * v + hauteurs[k - largeur];
      const hxy = (hauteurs[k + largeur + 1] - hauteurs[k + largeur - 1] - hauteurs[k - largeur + 1] + hauteurs[k - largeur - 1]) / 4;
      const moyenne = (hxx + hyy) / 2;
      const ecart = Math.sqrt(((hxx - hyy) / 2) ** 2 + hxy * hxy);
      const courbure = moyenne - ecart;
      if (-courbure < courbureMin) continue;

      // Direction en travers de l'arête : vecteur propre de la courbure la plus forte.
      let vx = 1;
      let vy = 0;
      if (Math.abs(hxy) > 1e-12) {
        vx = hxy;
        vy = courbure - hxx;
        const n = Math.hypot(vx, vy);
        vx /= n;
        vy /= n;
      } else if (hxx > hyy) {
        vx = 0;
        vy = 1;
      }
      const pas = Math.round(vy) * largeur + Math.round(vx);
      if (v < hauteurs[k + pas] || v <= hauteurs[k - pas]) continue;
      rappel(i, j, -vy, vx, -courbure);
    }
  }
}

/** Voisins d'une cellule (huit directions). */
const VOISINS: readonly (readonly [number, number])[] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

/**
 * Lignes de crête chaînées en segments continus. Chaque point retenu par
 * `lignesDeCrete` et par `garder` est placé au sommet exact de l'arête
 * (parabole en travers), puis relié à son meilleur voisin de chaque côté,
 * dans l'axe de l'arête. Un segment n'est tracé qu'une fois. Positions en
 * unités de grille ; `gx` et `gy` du rappel valent zéro.
 */
export function segmentsDeCrete(
  hauteurs: Float32Array,
  largeur: number,
  hauteur: number,
  courbureMin: number,
  garder: (i: number, j: number) => boolean,
  rappel: RappelSegment,
): void {
  const n = largeur * hauteur;
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const retenu = new Uint8Array(n);
  const points: number[] = [];

  lignesDeCrete(hauteurs, largeur, hauteur, courbureMin, (i, j, ax, ay) => {
    if (!garder(i, j)) return;
    const k = j * largeur + i;
    // Travers de l'arête arrondi au voisin le plus proche, sommet de la parabole.
    const ni = Math.round(ay);
    const nj = Math.round(-ax);
    const avant = hauteurs[k - nj * largeur - ni];
    const apres = hauteurs[k + nj * largeur + ni];
    const courbe = avant - 2 * hauteurs[k] + apres;
    const d = courbe < 0 ? Math.max(-0.5, Math.min(0.5, (avant - apres) / (2 * courbe))) : 0;
    px[k] = i + d * ni;
    py[k] = j + d * nj;
    tx[k] = ax;
    ty[k] = ay;
    retenu[k] = 1;
    points.push(k);
  });

  // Meilleur voisin retenu de chaque côté, dans l'axe de l'arête.
  const suivant = new Int32Array(n).fill(-1);
  const precedent = new Int32Array(n).fill(-1);
  for (const k of points) {
    const i = k % largeur;
    const j = (k - i) / largeur;
    let mieuxS = 0.6;
    let mieuxP = 0.6;
    for (const [di, dj] of VOISINS) {
      const ii = i + di;
      const jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= largeur || jj >= hauteur) continue;
      const v = jj * largeur + ii;
      if (!retenu[v]) continue;
      const alignement = (di * tx[k] + dj * ty[k]) / Math.hypot(di, dj);
      if (alignement > mieuxS) {
        mieuxS = alignement;
        suivant[k] = v;
      } else if (-alignement > mieuxP) {
        mieuxP = -alignement;
        precedent[k] = v;
      }
    }
  }

  for (const k of points) {
    for (const v of [suivant[k], precedent[k]]) {
      if (v < 0) continue;
      const reciproque = suivant[v] === k || precedent[v] === k;
      if (reciproque && v < k) continue;
      rappel(px[k], py[k], px[v], py[v], 0, 0);
    }
  }
}

/** Point de passage sur une arête de cellule, par interpolation linéaire. */
function passage(a: number, b: number, niveau: number): number {
  const d = b - a;
  return d === 0 ? 0.5 : (niveau - a) / d;
}

/**
 * Courbes de niveau par carrés marchants, tous les niveaux en un seul passage
 * sur la grille. `niveaux` est trié par ordre croissant. Appelle `rappel` pour
 * chaque morceau de courbe, en coordonnées de grille, avec le rang du niveau
 * et la pente locale (vers le haut du terrain). Les cellules ambiguës sont
 * tranchées par la valeur au centre.
 */
export function courbes(
  hauteurs: Float32Array,
  largeur: number,
  hauteur: number,
  niveaux: ArrayLike<number>,
  rappel: RappelNiveau,
): void {
  // Arêtes de la cellule : 0 haut, 1 droite, 2 bas, 3 gauche.
  const px = new Float32Array(4);
  const py = new Float32Array(4);
  const coupe = new Uint8Array(4);

  for (let j = 0; j < hauteur - 1; j += 1) {
    for (let i = 0; i < largeur - 1; i += 1) {
      const a = hauteurs[j * largeur + i]; // haut gauche
      const b = hauteurs[j * largeur + i + 1]; // haut droit
      const c = hauteurs[(j + 1) * largeur + i + 1]; // bas droit
      const d = hauteurs[(j + 1) * largeur + i]; // bas gauche
      const min = Math.min(a, b, c, d);
      const max = Math.max(a, b, c, d);
      const gx = (b - a + c - d) / 2;
      const gy = (d - a + c - b) / 2;

      for (let k = 0; k < niveaux.length; k += 1) {
        const niveau = niveaux[k];
        if (niveau <= min) continue;
        if (niveau > max) break;
        const sa = a >= niveau;
        const sb = b >= niveau;
        const sc = c >= niveau;
        const sd = d >= niveau;

        let n = 0;
        coupe.fill(0);
        if (sa !== sb) {
          px[0] = i + passage(a, b, niveau);
          py[0] = j;
          coupe[0] = 1;
          n += 1;
        }
        if (sb !== sc) {
          px[1] = i + 1;
          py[1] = j + passage(b, c, niveau);
          coupe[1] = 1;
          n += 1;
        }
        if (sd !== sc) {
          px[2] = i + passage(d, c, niveau);
          py[2] = j + 1;
          coupe[2] = 1;
          n += 1;
        }
        if (sa !== sd) {
          px[3] = i;
          py[3] = j + passage(a, d, niveau);
          coupe[3] = 1;
          n += 1;
        }

        if (n === 2) {
          let premier = -1;
          for (let e = 0; e < 4; e += 1) {
            if (!coupe[e]) continue;
            if (premier < 0) premier = e;
            else rappel(k, px[premier], py[premier], px[e], py[e], gx, gy);
          }
        } else {
          // Cellule en selle : le centre dit quels coins se rejoignent.
          const centre = (a + b + c + d) / 4 >= niveau;
          if (centre === sa) {
            rappel(k, px[0], py[0], px[1], py[1], gx, gy);
            rappel(k, px[2], py[2], px[3], py[3], gx, gy);
          } else {
            rappel(k, px[3], py[3], px[0], py[0], gx, gy);
            rappel(k, px[1], py[1], px[2], py[2], gx, gy);
          }
        }
      }
    }
  }
}

/** Une seule courbe de niveau (voir `courbes`). */
export function courbe(hauteurs: Float32Array, largeur: number, hauteur: number, niveau: number, rappel: RappelSegment): void {
  courbes(hauteurs, largeur, hauteur, [niveau], (_, x1, y1, x2, y2, gx, gy) => rappel(x1, y1, x2, y2, gx, gy));
}
