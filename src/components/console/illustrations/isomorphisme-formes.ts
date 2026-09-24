/**
 * Modèle de l'illustration « Isomorphisme » : un réseau fixe de 89 points
 * (un nombre de Fibonacci) et 267 liens, et les 50 formes qu'il traverse.
 *
 * Chaque point est relié à son voisin et aux points situés 21 et 34 rangs
 * plus loin (21/89 et 34/89, rapports du nombre d'or). Les liens ne changent
 * jamais : seule la position des points change d'une forme à l'autre.
 *
 * Porté tel quel de la maquette validée par Florent
 * (`~/ISOMORPH/_docs/illustrations/isomorphisme-fibonacci.html`).
 * Aucune dépendance au navigateur : testable sous Node.
 */

export const NOMBRE_POINTS = 89;
const N = NOMBRE_POINTS;
const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
/** Angle d'or. */
const OR = TAU / (PHI * PHI);

/** Écarts de rang reliés : voisin, puis 21 et 34 rangs plus loin. */
export const SAUTS = [1, 21, 34] as const;

/** Un point : x, y dans [-1, 1] après mise à l'échelle, et profondeur. */
export type Point = [number, number, number];

export interface Forme {
  nom: string;
  points: Point[];
}

/** Liens à plat : `[a0, b0, saut0, a1, b1, saut1, …]`. */
export function genererLiens(): Int32Array {
  const liens = new Int32Array(SAUTS.length * N * 3);
  let k = 0;
  for (const saut of SAUTS) {
    for (let i = 0; i < N; i += 1) {
      liens[k] = i;
      liens[k + 1] = (i + saut) % N;
      liens[k + 2] = saut;
      k += 3;
    }
  }
  return liens;
}

const RANGS = Array.from({ length: N }, (_, i) => i);
const u = (i: number) => i / (N - 1);

/** Rotation dans l'espace puis légère perspective. */
function tourner([x0, y0, z0]: Point, a: number, b: number): Point {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  const x = x0 * ca + z0 * sa;
  const z1 = -x0 * sa + z0 * ca;
  const y = y0 * cb - z1 * sb;
  const z = y0 * sb + z1 * cb;
  const p = 2.6 / (2.6 - z);
  return [x * p, y * p, z];
}

/** Générateur pseudo-aléatoire de Park-Miller, graine fixe : le nuage est toujours le même. */
function hasardFixe(graine: number) {
  let g = graine;
  return () => {
    g = (g * 16807) % 2147483647;
    return g / 2147483647;
  };
}

/** Les 50 formes, dans l'ordre de création. */
function creerFormes(): Forme[] {
  const formes: Forme[] = [];
  const ajoute = (nom: string, points: Point[]) => formes.push({ nom, points });
  const hasard = hasardFixe(11);

  // Tournesols : angle d'or et ses voisins.
  const tournesols: [number, string][] = [
    [OR, "TOURNESOL"],
    [TAU / PHI, "TOURNESOL INVERSE"],
    [TAU / PHI ** 3, "TOURNESOL φ³"],
    [TAU / PHI ** 4, "TOURNESOL φ⁴"],
    [OR * 0.996, "SPIRALES 13"],
    [OR * 1.004, "SPIRALES 21"],
    [OR, "DISQUE D'OR"],
    [TAU / PHI ** 5, "TOURNESOL φ⁵"],
  ];
  tournesols.forEach(([a, nom], k) =>
    ajoute(
      nom,
      RANGS.map((i) => {
        const r = k === 6 ? (i + 1) / N : Math.sqrt((i + 0.5) / N);
        return [Math.cos(i * a) * r, Math.sin(i * a) * r, 0];
      }),
    ),
  );

  // Anneaux de Fibonacci : 1 + 1 + 2 + 3 + 5 + 8 + 13 + 21 + 34 = 88, plus le centre.
  const tailles = [1, 1, 2, 3, 5, 8, 13, 21, 34];
  [0, 1].forEach((v) => {
    const points: Point[] = [[0, 0, 0]];
    tailles.forEach((n, a) => {
      for (let j = 0; j < n; j += 1) {
        const th = (TAU * j) / n + (v ? a * OR : -Math.PI / 2);
        const r = (a + 1) / tailles.length;
        points.push([Math.cos(th) * r, Math.sin(th) * r, 0]);
      }
    });
    ajoute(v ? "ANNEAUX DÉCALÉS" : "ANNEAUX", points);
  });

  // Cercles permutés : le point i va en position i·k (mod 89), k de Fibonacci.
  [1, 2, 3, 5, 8, 13, 21, 34, 55].forEach((k) =>
    ajoute(
      `CERCLE ×${k}`,
      RANGS.map((i) => {
        const th = (TAU * ((i * k) % N)) / N - Math.PI / 2;
        return [Math.cos(th), Math.sin(th), 0];
      }),
    ),
  );

  // Lissajous aux rapports de Fibonacci.
  [
    [1, 2],
    [2, 3],
    [3, 5],
    [5, 8],
    [8, 13],
    [13, 21],
  ].forEach(([a, b]) =>
    ajoute(
      `LISSAJOUS ${a}:${b}`,
      RANGS.map((i) => [Math.sin(a * TAU * u(i) + Math.PI / 2), Math.sin(b * TAU * u(i)), 0]),
    ),
  );

  // Rosaces r = cos(n/d · θ).
  [
    [2, 1],
    [3, 2],
    [5, 3],
    [8, 5],
    [5, 8],
  ].forEach(([n, d]) =>
    ajoute(
      `ROSACE ${n}/${d}`,
      RANGS.map((i) => {
        const th = (TAU * d * i) / N;
        const r = Math.cos((n / d) * th);
        return [Math.cos(th) * r, Math.sin(th) * r, 0];
      }),
    ),
  );

  // Sphère de Fibonacci, quatre orientations.
  const sphere: Point[] = RANGS.map((i) => {
    const z = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(1 - z * z);
    const th = i * OR;
    return [Math.cos(th) * r, Math.sin(th) * r, z];
  });
  [
    [0.3, 0.4],
    [1.2, -0.6],
    [2.2, 1.1],
    [0, Math.PI / 2],
  ].forEach(([a, b], k) =>
    ajoute(
      k === 3 ? "SPHÈRE PÔLE" : "SPHÈRE",
      sphere.map((p) => tourner(p, a, b)),
    ),
  );

  // Nœuds toriques (p, q) de Fibonacci.
  [
    [2, 3],
    [3, 5],
    [5, 8],
    [3, 8],
  ].forEach(([p, q]) =>
    ajoute(
      `NŒUD ${p}:${q}`,
      RANGS.map((i) => {
        const t = TAU * u(i);
        const r = 0.62 + 0.3 * Math.cos(q * t);
        return tourner([r * Math.cos(p * t), r * Math.sin(p * t), 0.3 * Math.sin(q * t)], 0.2, 0.9);
      }),
    ),
  );

  // Spirale d'or : le rayon est multiplié par φ à chaque quart de tour.
  [1, 2].forEach((bras) =>
    ajoute(
      bras === 1 ? "SPIRALE D'OR" : "DOUBLE SPIRALE",
      RANGS.map((i) => {
        const k = bras === 1 ? i : Math.floor(i / 2);
        const n = bras === 1 ? N : N / 2;
        const th = (3.2 * TAU * k) / n + (i % 2 && bras === 2 ? Math.PI : 0);
        const r = Math.pow(PHI, th / (Math.PI / 2));
        return [Math.cos(th) * r, Math.sin(th) * r, 0];
      }),
    ),
  );

  // Spirographes aux rayons de Fibonacci.
  [
    [13, 8, 5],
    [21, 13, 8],
    [8, 5, 3],
  ].forEach(([R, r, d]) =>
    ajoute(
      `SPIROGRAPHE ${R}·${r}·${d}`,
      RANGS.map((i) => {
        const t = (TAU * r * i) / N;
        return [
          (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t),
          (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t),
          0,
        ];
      }),
    ),
  );

  // Galaxies à 3 et 5 bras.
  [3, 5].forEach((b) =>
    ajoute(
      `GALAXIE ${b} BRAS`,
      RANGS.map((i) => {
        const bras = i % b;
        const k = Math.floor(i / b) / (N / b);
        const th = (bras * TAU) / b + k * 4.2;
        return [Math.cos(th) * (0.12 + k), Math.sin(th) * (0.12 + k), 0];
      }),
    ),
  );

  // Ondes, hélice, grille, nuage.
  [3, 5].forEach((f) =>
    ajoute(
      `ONDE ${f}`,
      RANGS.map((i) => [u(i) * 2 - 1, Math.sin(f * TAU * u(i)) * 0.35, 0]),
    ),
  );
  ajoute(
    "HÉLICE",
    RANGS.map((i) =>
      tourner([u(i) * 2 - 1, Math.cos(8 * TAU * u(i)) * 0.3, Math.sin(8 * TAU * u(i)) * 0.3], 0.35, 0.3),
    ),
  );
  ajoute(
    "GRILLE",
    RANGS.map((i) => [(i % 10) / 4.5 - 1, Math.floor(i / 10) / 4 - 1, 0]),
  );
  ajoute(
    "NUAGE",
    RANGS.map(() => {
      const a = hasard() * TAU;
      const r = Math.sqrt(hasard());
      return [Math.cos(a) * r, Math.sin(a) * r * 0.8, 0];
    }),
  );

  return formes;
}

/** Centre chaque forme et la ramène dans le disque unité. */
function normaliser(forme: Forme): Forme {
  let cx = 0;
  let cy = 0;
  for (const p of forme.points) {
    cx += p[0];
    cy += p[1];
  }
  cx /= N;
  cy /= N;
  let m = 0;
  for (const p of forme.points) m = Math.max(m, Math.hypot(p[0] - cx, p[1] - cy));
  return {
    nom: forme.nom,
    points: forme.points.map(([x, y, z]) => [(x - cx) / m, (y - cy) / m, z || 0]),
  };
}

/**
 * Les 50 formes normalisées, dans l'ordre de passage : le tournesol d'abord,
 * puis une forme de chaque famille à tour de rôle, pour que deux formes
 * voisines ne se ressemblent jamais.
 */
export function genererParcours(): Forme[] {
  const formes = creerFormes().map(normaliser);
  const familles = new Map<string, Forme[]>();
  for (const f of formes) {
    const cle = f.nom.split(" ")[0];
    const liste = familles.get(cle);
    if (liste) liste.push(f);
    else familles.set(cle, [f]);
  }
  const pris = new Set<Forme>([formes[0]]);
  const ordre: Forme[] = [formes[0]];
  const listes = [...familles.values()];
  while (ordre.length < formes.length) {
    for (const liste of listes) {
      const f = liste.find((x) => !pris.has(x));
      if (f) {
        pris.add(f);
        ordre.push(f);
      }
    }
  }
  return ordre;
}

/**
 * Table du temps : léger ralenti à l'approche de chaque forme (environ
 * 50 ms à vitesse réduite), sans arrêt. `x` dans [0, 1] donne la part du
 * trajet parcourue ; la durée totale du passage reste identique.
 */
export function creerTableTemps(pas = 512): (x: number) => number {
  const table = new Float32Array(pas + 1);
  const vitesse = (x: number) => {
    const d = Math.min(x, 1 - x) / 0.03;
    return 1 - 0.75 * Math.exp(-d * d);
  };
  for (let k = 1; k <= pas; k += 1) table[k] = table[k - 1] + vitesse((k - 0.5) / pas);
  for (let k = 1; k <= pas; k += 1) table[k] /= table[pas];
  return (x: number) => {
    const f = x * pas;
    const k = Math.min(pas - 1, Math.floor(f));
    return table[k] + (table[k + 1] - table[k]) * (f - k);
  };
}
