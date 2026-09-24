/**
 * Modèle de l'illustration « Réseau neuronal » : fonctions pures, sans DOM.
 *
 * Tout ce qui fixe la forme du réseau (nœuds, arêtes, nuage de points) sort
 * d'un générateur pseudo-aléatoire à graine : le même réseau à chaque
 * chargement, sur le serveur comme dans le navigateur. Les calculs lourds
 * (voisins proches, connexité, voisinage) sont faits une seule fois ; la
 * boucle d'animation ne lit que des tableaux typés.
 *
 * Tests : `node --test src/components/console/illustrations/reseau-neuronal-modele.test.mts`
 */

/** Tirage uniforme dans [0, 1). */
export type Alea = () => number;

/**
 * mulberry32 : suite stable pour une graine donnée, sans dépendance.
 * Même graine, même suite, donc même réseau d'un chargement à l'autre.
 */
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

/** Courbe d'accélération puis de freinage, bornée à [0, 1]. */
export function lisser(x: number): number {
  const t = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return t * t * (3 - 2 * t);
}

const HEXA = "0123456789ABCDEF";

/** Chiffres hexadécimaux en capitales : décor pur, aucune valeur réelle. */
export function codeHex(alea: Alea, chiffres: number): string {
  let code = "";
  for (let i = 0; i < chiffres; i += 1) code += HEXA[Math.floor(alea() * 16)];
  return code;
}

/** Groupes de quatre chiffres hexadécimaux séparés d'une espace. */
export function codeGroupe(alea: Alea, groupes: number): string {
  let code = "";
  for (let g = 0; g < groupes; g += 1) code += (g === 0 ? "" : " ") + codeHex(alea, 4);
  return code;
}

/* ------------------------------------------------------------------ */
/* Réseau                                                              */
/* ------------------------------------------------------------------ */

export interface Reseau {
  nombreNoeuds: number;
  /** Les nœuds de la masse occupent [0, nombreCoeur) ; les filaments suivent. */
  nombreCoeur: number;
  /** Position de repos, trois flottants par nœud (x, y, z), rayon de la masse 1. */
  positions: Float32Array;
  /** Phase de respiration : une onde qui traverse la masse, pas un frisson par nœud. */
  phases: Float32Array;
  /** Distance au centre rapportée au rayon de la masse (au delà de 1 : filaments). */
  eloignements: Float32Array;
  /** Deux indices de nœud par arête. */
  aretes: Uint16Array;
  /** Longueur de chaque arête dans l'espace. */
  longueurs: Float32Array;
  /** Trait de l'arête : 0 au cœur (épais, lumineux) à 3 en périphérie (fin). */
  niveaux: Uint8Array;
  /** Voisinage compact : les arêtes du nœud i sont `incidences[debuts[i] .. debuts[i + 1])`. */
  debutsIncidences: Uint16Array;
  incidences: Uint16Array;
}

interface Lobe {
  cx: number;
  cy: number;
  cz: number;
  rx: number;
  ry: number;
  rz: number;
  poids: number;
}

/** Nombre d'ellipsoïdes qui se chevauchent pour donner une masse irrégulière. */
const LOBES = 5;
/** Écart minimal entre deux nœuds : évite les amas illisibles. */
const ESPACEMENT = 0.085;
/** Au delà, deux nœuds voisins ne sont reliés que s'ils sont le plus proche l'un de l'autre. */
const LONGUEUR_MAX = 0.36;
/** La masse est un peu plus large que haute, comme dans la référence. */
const APLATISSEMENT = 0.84;

function creerLobes(alea: Alea): Lobe[] {
  const lobes: Lobe[] = [];
  let total = 0;
  for (let l = 0; l < LOBES; l += 1) {
    // Le premier lobe tient le centre, les autres s'en écartent : c'est ce
    // décalage qui casse la sphère et donne la forme organique.
    const ecart = l === 0 ? 0 : 0.28 + alea() * 0.3;
    const theta = alea() * Math.PI * 2;
    const cosPhi = alea() * 2 - 1;
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
    const rx = 0.34 + alea() * 0.2;
    const ry = 0.26 + alea() * 0.16;
    const rz = 0.34 + alea() * 0.2;
    const poids = rx * ry * rz;
    total += poids;
    lobes.push({
      cx: ecart * sinPhi * Math.cos(theta),
      cy: ecart * cosPhi * 0.6,
      cz: ecart * sinPhi * Math.sin(theta),
      rx,
      ry,
      rz,
      poids,
    });
  }
  for (const lobe of lobes) lobe.poids /= total;
  return lobes;
}

/**
 * Indices répartis autour de l'axe vertical parmi les nœuds de la masse dont
 * l'éloignement est compris dans l'intervalle : triés par azimut, puis pris à
 * pas régulier. Sert aux bases des filaments et aux ancres des cadres.
 */
function repartir(
  positions: ArrayLike<number>,
  eloignements: ArrayLike<number>,
  nombreCoeur: number,
  nombre: number,
  eloignementMin: number,
  eloignementMax: number,
): number[] {
  const candidats: number[] = [];
  for (let i = 0; i < nombreCoeur; i += 1) {
    if (eloignements[i] >= eloignementMin && eloignements[i] <= eloignementMax) candidats.push(i);
  }
  if (candidats.length === 0 || nombre <= 0) return [];
  const azimut = (i: number) => Math.atan2(positions[i * 3 + 2], positions[i * 3]);
  candidats.sort((a, b) => azimut(a) - azimut(b));
  const choix: number[] = [];
  for (let k = 0; k < nombre; k += 1) {
    const indice = candidats[Math.floor(((k + 0.5) * candidats.length) / nombre)];
    if (!choix.includes(indice)) choix.push(indice);
  }
  return choix;
}

/** Version publique de `repartir`, pour choisir les nœuds porteurs de cadres. */
export function choisirRepartis(reseau: Reseau, nombre: number, eloignementMin: number, eloignementMax: number): number[] {
  return repartir(reseau.positions, reseau.eloignements, reseau.nombreCoeur, nombre, eloignementMin, eloignementMax);
}

/** Trait d'une arête selon l'éloignement de son milieu : plus on s'écarte, plus il s'affine. */
function niveauDe(eloignementMilieu: number): number {
  if (eloignementMilieu < 0.4) return 0;
  if (eloignementMilieu < 0.66) return 1;
  if (eloignementMilieu < 0.88) return 2;
  return 3;
}

/**
 * Construit le réseau : une masse organique de `noeudsCoeur` nœuds maillée par
 * voisins proches (d'où les triangles), plus `nombreFilaments` filaments qui
 * s'en échappent. Le graphe rendu est toujours connexe, pour que l'onde de
 * prise de contrôle atteigne chaque nœud.
 */
export function genererReseau(graine: number, noeudsCoeur = 196, nombreFilaments = 6): Reseau {
  const alea = mulberry32(graine);
  const lobes = creerLobes(alea);

  /* ---------- Masse : tirage dans les lobes, avec écart minimal ---------- */
  const coords: number[] = [];
  const espacement2 = ESPACEMENT * ESPACEMENT;
  let essais = 0;
  while (coords.length < noeudsCoeur * 3 && essais < noeudsCoeur * 400) {
    essais += 1;
    let tirage = alea();
    let lobe = lobes[lobes.length - 1];
    for (const candidat of lobes) {
      if (tirage < candidat.poids) {
        lobe = candidat;
        break;
      }
      tirage -= candidat.poids;
    }
    let ux = 0;
    let uy = 0;
    let uz = 0;
    let r2 = 2;
    while (r2 > 1) {
      ux = alea() * 2 - 1;
      uy = alea() * 2 - 1;
      uz = alea() * 2 - 1;
      r2 = ux * ux + uy * uy + uz * uz;
    }
    // Resserrement vers le centre du lobe : le cœur est plus dense que les bords.
    const resserre = 0.55 + 0.45 * Math.sqrt(r2);
    const x = lobe.cx + ux * resserre * lobe.rx;
    const y = lobe.cy + uy * resserre * lobe.ry;
    const z = lobe.cz + uz * resserre * lobe.rz;
    let libre = true;
    for (let k = 0; k < coords.length; k += 3) {
      const dx = coords[k] - x;
      const dy = coords[k + 1] - y;
      const dz = coords[k + 2] - z;
      if (dx * dx + dy * dy + dz * dz < espacement2) {
        libre = false;
        break;
      }
    }
    if (libre) coords.push(x, y, z);
  }
  const nombreCoeur = coords.length / 3;

  /* ---------- Recentrage et mise à l'échelle : rayon de la masse 1 ---------- */
  let mx = 0;
  let my = 0;
  let mz = 0;
  for (let k = 0; k < coords.length; k += 3) {
    mx += coords[k];
    my += coords[k + 1];
    mz += coords[k + 2];
  }
  mx /= nombreCoeur;
  my /= nombreCoeur;
  mz /= nombreCoeur;
  let rayonMax = 0;
  for (let k = 0; k < coords.length; k += 3) {
    coords[k] -= mx;
    coords[k + 1] -= my;
    coords[k + 2] -= mz;
    rayonMax = Math.max(rayonMax, Math.hypot(coords[k], coords[k + 1], coords[k + 2]));
  }
  const echelle = rayonMax > 0 ? 1 / rayonMax : 1;
  for (let k = 0; k < coords.length; k += 3) {
    coords[k] *= echelle;
    coords[k + 1] *= echelle * APLATISSEMENT;
    coords[k + 2] *= echelle;
  }
  const eloignementsCoeur: number[] = [];
  for (let k = 0; k < coords.length; k += 3) {
    eloignementsCoeur.push(Math.hypot(coords[k], coords[k + 1], coords[k + 2]));
  }

  /* ---------- Arêtes ---------- */
  const extremitesA: number[] = [];
  const extremitesB: number[] = [];
  const niveaux: number[] = [];
  const connues = new Set<number>();
  const ajouter = (a: number, b: number, niveau: number) => {
    if (a === b) return;
    const cle = a < b ? a * 65536 + b : b * 65536 + a;
    if (connues.has(cle)) return;
    connues.add(cle);
    extremitesA.push(a);
    extremitesB.push(b);
    niveaux.push(niveau);
  };
  const distance2 = (a: number, b: number) => {
    const dx = coords[a * 3] - coords[b * 3];
    const dy = coords[a * 3 + 1] - coords[b * 3 + 1];
    const dz = coords[a * 3 + 2] - coords[b * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };

  // Voisins proches : sept au cœur, trois en périphérie. Le maillage est donc
  // dense au centre et se raréfie vers les bords.
  const longueurMax2 = LONGUEUR_MAX * LONGUEUR_MAX;
  for (let i = 0; i < nombreCoeur; i += 1) {
    const e = eloignementsCoeur[i];
    const k = e < 0.45 ? 7 : e < 0.75 ? 4 : 3;
    const meilleurs: number[] = [];
    const ecarts: number[] = [];
    for (let j = 0; j < nombreCoeur; j += 1) {
      if (j === i) continue;
      const d2 = distance2(i, j);
      if (meilleurs.length === k && d2 >= ecarts[k - 1]) continue;
      let position = ecarts.length;
      while (position > 0 && ecarts[position - 1] > d2) position -= 1;
      ecarts.splice(position, 0, d2);
      meilleurs.splice(position, 0, j);
      if (meilleurs.length > k) {
        ecarts.pop();
        meilleurs.pop();
      }
    }
    for (let r = 0; r < meilleurs.length; r += 1) {
      if (r > 0 && ecarts[r] > longueurMax2) break;
      const j = meilleurs[r];
      ajouter(i, j, niveauDe((e + eloignementsCoeur[j]) / 2));
    }
  }

  // Quelques arêtes du cœur promues au trait le plus épais : la référence
  // montre des lignes plus marquées mêlées au maillage fin.
  for (let a = 0; a < niveaux.length; a += 1) {
    if (niveaux[a] === 1 && alea() < 0.16) niveaux[a] = 0;
  }

  /* ---------- Filaments : de longues chaînes qui s'échappent ---------- */
  const bases = repartir(coords, eloignementsCoeur, nombreCoeur, nombreFilaments, 0.72, 1.01);
  const prolonger = (depart: number, dx0: number, dy0: number, dz0: number, pas: number) => {
    let precedent = depart;
    let dx = dx0;
    let dy = dy0;
    let dz = dz0;
    for (let s = 0; s < pas; s += 1) {
      // Légère courbure à chaque pas : un filament n'est jamais une droite.
      dx += (alea() - 0.5) * 0.38;
      dy += (alea() - 0.5) * 0.3;
      dz += (alea() - 0.5) * 0.38;
      const norme = Math.hypot(dx, dy, dz) || 1;
      dx /= norme;
      dy /= norme;
      dz /= norme;
      const longueur = 0.1 + alea() * 0.07;
      const x = coords[precedent * 3] + dx * longueur;
      const y = coords[precedent * 3 + 1] + dy * longueur;
      const z = coords[precedent * 3 + 2] + dz * longueur;
      const indice = coords.length / 3;
      coords.push(x, y, z);
      ajouter(precedent, indice, s === 0 ? 2 : 3);
      precedent = indice;
    }
    return precedent;
  };
  for (const base of bases) {
    const bx = coords[base * 3];
    const by = coords[base * 3 + 1];
    const bz = coords[base * 3 + 2];
    const norme = Math.hypot(bx, by, bz) || 1;
    const pas = 4 + Math.floor(alea() * 4);
    const debut = coords.length / 3;
    prolonger(base, bx / norme, (by / norme) * 0.7, bz / norme, pas);
    // Une fois sur deux, une courte branche part du deuxième nœud.
    if (pas > 4 && alea() < 0.5) {
      const noeud = debut + 1;
      prolonger(noeud, bx / norme + (alea() - 0.5), by / norme + (alea() - 0.5), bz / norme + (alea() - 0.5), 2);
    }
  }

  const nombreNoeuds = coords.length / 3;

  /* ---------- Connexité : relier chaque îlot au plus proche ---------- */
  const parents = new Int32Array(nombreNoeuds);
  for (let i = 0; i < nombreNoeuds; i += 1) parents[i] = i;
  const racine = (i: number) => {
    let r = i;
    while (parents[r] !== r) {
      parents[r] = parents[parents[r]];
      r = parents[r];
    }
    return r;
  };
  const unir = (a: number, b: number) => {
    const ra = racine(a);
    const rb = racine(b);
    if (ra !== rb) parents[rb] = ra;
  };
  for (let a = 0; a < extremitesA.length; a += 1) unir(extremitesA[a], extremitesB[a]);
  const eloignementDe = (i: number) => Math.hypot(coords[i * 3], coords[i * 3 + 1], coords[i * 3 + 2]);
  for (;;) {
    const principale = racine(0);
    let meilleur = Infinity;
    let liaisonA = -1;
    let liaisonB = -1;
    for (let i = 0; i < nombreNoeuds; i += 1) {
      if (racine(i) !== principale) continue;
      for (let j = 0; j < nombreNoeuds; j += 1) {
        if (racine(j) === principale) continue;
        const d2 = distance2(i, j);
        if (d2 < meilleur) {
          meilleur = d2;
          liaisonA = i;
          liaisonB = j;
        }
      }
    }
    if (liaisonA < 0) break;
    ajouter(liaisonA, liaisonB, niveauDe((eloignementDe(liaisonA) + eloignementDe(liaisonB)) / 2));
    unir(liaisonA, liaisonB);
  }

  /* ---------- Tableaux typés ---------- */
  const positions = Float32Array.from(coords);
  const phases = new Float32Array(nombreNoeuds);
  const eloignements = new Float32Array(nombreNoeuds);
  for (let i = 0; i < nombreNoeuds; i += 1) {
    const x = coords[i * 3];
    const y = coords[i * 3 + 1];
    const z = coords[i * 3 + 2];
    // Phase liée à la position : la respiration se lit comme une onde lente
    // qui traverse la masse, jamais comme un tremblement.
    phases[i] = x * 2.3 + y * 1.7 + z * 1.1;
    eloignements[i] = Math.hypot(x, y, z);
  }

  const nombreAretes = extremitesA.length;
  const aretes = new Uint16Array(nombreAretes * 2);
  const longueurs = new Float32Array(nombreAretes);
  const niveauxTypes = new Uint8Array(nombreAretes);
  const degres = new Uint16Array(nombreNoeuds);
  for (let a = 0; a < nombreAretes; a += 1) {
    aretes[a * 2] = extremitesA[a];
    aretes[a * 2 + 1] = extremitesB[a];
    longueurs[a] = Math.sqrt(distance2(extremitesA[a], extremitesB[a]));
    niveauxTypes[a] = niveaux[a];
    degres[extremitesA[a]] += 1;
    degres[extremitesB[a]] += 1;
  }
  const debutsIncidences = new Uint16Array(nombreNoeuds + 1);
  for (let i = 0; i < nombreNoeuds; i += 1) debutsIncidences[i + 1] = debutsIncidences[i] + degres[i];
  const incidences = new Uint16Array(nombreAretes * 2);
  const remplis = new Uint16Array(nombreNoeuds);
  for (let a = 0; a < nombreAretes; a += 1) {
    const na = extremitesA[a];
    const nb = extremitesB[a];
    incidences[debutsIncidences[na] + remplis[na]] = a;
    remplis[na] += 1;
    incidences[debutsIncidences[nb] + remplis[nb]] = a;
    remplis[nb] += 1;
  }

  return {
    nombreNoeuds,
    nombreCoeur,
    positions,
    phases,
    eloignements,
    aretes,
    longueurs,
    niveaux: niveauxTypes,
    debutsIncidences,
    incidences,
  };
}

/**
 * Distances le long du réseau depuis `source` (plus courts chemins pondérés
 * par la longueur des arêtes). Écrit dans `distances`, utilise `figes` comme
 * brouillon : aucune allocation, l'appel se fait une fois par prise de
 * contrôle. Renvoie la plus grande distance atteinte.
 */
export function propager(reseau: Reseau, source: number, distances: Float32Array, figes: Uint8Array): number {
  const n = reseau.nombreNoeuds;
  const { aretes, longueurs, debutsIncidences, incidences } = reseau;
  distances.fill(Infinity);
  figes.fill(0);
  distances[source] = 0;
  let plusLoin = 0;
  for (let tour = 0; tour < n; tour += 1) {
    let u = -1;
    let du = Infinity;
    for (let i = 0; i < n; i += 1) {
      if (figes[i] === 0 && distances[i] < du) {
        du = distances[i];
        u = i;
      }
    }
    if (u < 0) break;
    figes[u] = 1;
    if (du > plusLoin) plusLoin = du;
    for (let k = debutsIncidences[u]; k < debutsIncidences[u + 1]; k += 1) {
      const a = incidences[k];
      const v = aretes[a * 2] === u ? aretes[a * 2 + 1] : aretes[a * 2];
      const d = du + longueurs[a];
      if (d < distances[v]) distances[v] = d;
    }
  }
  return plusLoin;
}

/**
 * Nuage de points en ellipsoïde aplati autour de la masse, trois flottants par
 * point. Les premiers points suffisent quand on en veut moins : le tirage est
 * uniforme, donc toute tranche de tête reste bien répartie.
 */
export function genererNuage(graine: number, nombre: number): Float32Array {
  const alea = mulberry32(graine);
  const points = new Float32Array(nombre * 3);
  for (let i = 0; i < nombre; i += 1) {
    const theta = alea() * Math.PI * 2;
    const cosPhi = alea() * 2 - 1;
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
    const rayon = 0.85 + Math.pow(alea(), 1.4) * 0.95;
    points[i * 3] = rayon * sinPhi * Math.cos(theta) * 1.25;
    points[i * 3 + 1] = rayon * cosPhi * 0.5;
    points[i * 3 + 2] = rayon * sinPhi * Math.sin(theta) * 1.25;
  }
  return points;
}
