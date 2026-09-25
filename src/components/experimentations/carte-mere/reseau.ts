/**
 * Génération procédurale du réseau de la carte mère.
 *
 * Exécuté une seule fois au niveau module (déterministe, PRNG LCG).
 * Produit :
 *   - positionsTraces : Float32Array de triplets xyz (paires de points pour LineSegments)
 *   - positionsVias   : positions x,z des vias (petits disques aux jonctions)
 *   - puces / condensateurs : position et dimensions des composants (InstancedMesh)
 *   - chemins         : segments utilisés par les impulsions (V3 début/fin)
 *
 * Géométrie : bande de LARGEUR × LONGUEUR unités, axe Z négatif.
 * RGAA / éco : aucune logique UI, aucun side-effect ; code pur.
 */

import * as THREE from "three";

// --- Dimensions de la bande ---
export const LARGEUR = 20;    // unités Three.js, axe X
export const LONGUEUR = 100;  // unités Three.js, axe Z (bande recyclée)
const COLS = 20;              // colonnes de la grille
const PAS = LARGEUR / COLS;   // espacement entre nœuds

// --- PRNG LCG déterministe (graine fixe) ---
function prng(graine: number): () => number {
  let s = graine >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0;
    return (s ^ (s >>> 16)) / 0x100000000;
  };
}

// --- Types exportés ---
export interface Composant {
  x: number;
  y: number;
  z: number;
  lx: number; // demi-largeur
  lz: number; // demi-profondeur
  ht: number; // hauteur
}

export interface Chemin {
  debut: THREE.Vector3;
  fin: THREE.Vector3;
}

export interface DonneesReseau {
  positionsTraces: Float32Array;
  positionsHalo: Float32Array;    // idem, légèrement décalées en Y pour le glow
  positionsVias: Float32Array;
  puces: Composant[];
  condensateurs: Composant[];
  chemins: Chemin[];
}

// --- Génération ---
function generer(): DonneesReseau {
  const r = prng(0xdeadbeef);

  const TRACE_Y = 0.018;
  const HALO_Y = 0.022;
  const pts: number[] = [];
  const halo: number[] = [];
  const vias: number[] = [];
  const chemins: Chemin[] = [];
  const puces: Composant[] = [];
  const condensateurs: Composant[] = [];

  const halfX = LARGEUR / 2;

  // Grille de lignes horizontales (par rangée)
  const RANGEES = Math.floor(LONGUEUR / PAS);
  for (let row = 0; row < RANGEES; row++) {
    const z = -(row * PAS);
    let col = 0;
    while (col < COLS) {
      if (r() < 0.5) {
        const longueur = Math.floor(r() * 6) + 1;
        const colFin = Math.min(col + longueur, COLS);
        const x1 = -halfX + col * PAS;
        const x2 = -halfX + colFin * PAS;
        pts.push(x1, TRACE_Y, z, x2, TRACE_Y, z);
        halo.push(x1, HALO_Y, z, x2, HALO_Y, z);
        chemins.push({
          debut: new THREE.Vector3(x1, TRACE_Y, z),
          fin: new THREE.Vector3(x2, TRACE_Y, z),
        });
        // Via aux jonctions
        if (r() < 0.4) vias.push(x1, z, x2, z);
        col += longueur + Math.floor(r() * 2) + 1;
      } else {
        col++;
      }
    }
  }

  // Lignes verticales (par colonne)
  for (let col = 0; col < COLS; col++) {
    const x = -halfX + col * PAS;
    let row = 0;
    while (row < RANGEES) {
      if (r() < 0.38) {
        const longueur = Math.floor(r() * 10) + 2;
        const rowFin = Math.min(row + longueur, RANGEES);
        const z1 = -(row * PAS);
        const z2 = -(rowFin * PAS);
        pts.push(x, TRACE_Y, z1, x, TRACE_Y, z2);
        halo.push(x, HALO_Y, z1, x, HALO_Y, z2);
        chemins.push({
          debut: new THREE.Vector3(x, TRACE_Y, z1),
          fin: new THREE.Vector3(x, TRACE_Y, z2),
        });
        if (r() < 0.5) vias.push(x, z1, x, z2);
        row += longueur + Math.floor(r() * 3) + 1;
      } else {
        row++;
      }
    }
  }

  // Coudes à 45° style PCB (horizontal + diagonal + horizontal)
  for (let i = 0; i < 70; i++) {
    const col = Math.floor(r() * (COLS - 3));
    const row = Math.floor(r() * (RANGEES - 3));
    const x = -halfX + col * PAS;
    const z = -(row * PAS);
    const taille = PAS * (Math.floor(r() * 2) + 1);
    // Segment horizontal d'approche
    pts.push(x, TRACE_Y, z, x + taille, TRACE_Y, z);
    halo.push(x, HALO_Y, z, x + taille, HALO_Y, z);
    // Diagonale
    pts.push(x + taille, TRACE_Y, z, x + taille * 2, TRACE_Y, z - taille);
    halo.push(x + taille, HALO_Y, z, x + taille * 2, HALO_Y, z - taille);
    // Segment horizontal de sortie
    pts.push(x + taille * 2, TRACE_Y, z - taille, x + taille * 3, TRACE_Y, z - taille);
    halo.push(x + taille * 2, HALO_Y, z - taille, x + taille * 3, HALO_Y, z - taille);

    chemins.push(
      { debut: new THREE.Vector3(x + taille, TRACE_Y, z), fin: new THREE.Vector3(x + taille * 2, TRACE_Y, z - taille) },
    );
    vias.push(x + taille, z, x + taille * 2, z - taille);
  }

  // Puces IC : boîtes plates (QFP, BGA)
  for (let i = 0; i < 14; i++) {
    const lx = r() * 1.0 + 0.6;
    const lz = r() * 0.8 + 0.5;
    puces.push({
      x: (r() - 0.5) * LARGEUR * 0.82,
      y: 0.12,
      z: -(r() * (RANGEES - 4) * PAS),
      lx, lz,
      ht: 0.18,
    });
  }

  // Condensateurs : cylindres fins
  for (let i = 0; i < 22; i++) {
    condensateurs.push({
      x: (r() - 0.5) * LARGEUR * 0.88,
      y: 0.2,
      z: -(r() * (RANGEES - 4) * PAS),
      lx: 0.1, lz: 0.1,
      ht: 0.35,
    });
  }

  return {
    positionsTraces: new Float32Array(pts),
    positionsHalo: new Float32Array(halo),
    positionsVias: new Float32Array(vias),
    puces,
    condensateurs,
    chemins,
  };
}

/** Données du réseau, générées une seule fois. */
export const RESEAU: DonneesReseau = generer();
