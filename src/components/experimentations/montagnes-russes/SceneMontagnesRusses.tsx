"use client";

/**
 * Scène Three.js du hero « Montagnes russes » — v2.
 *
 * Corrections de la revue HELM (2026-09-25) :
 * - Tunnel : double couche (solide + additif) pour une luminosité réelle ;
 *   masqué après t = 0,35 (exit tunnel) pour ne pas réapparaître en fond.
 * - Circuit : boîtes-composants remplacées par des puces fines (sombres),
 *   pads cuivrés, vias ; tout dans la moitié droite (x > 0 du groupe).
 * - Réseau : centré sur (1,5, 0, 8), scale 4,5 ; 128 nœuds ; rendu en deux
 *   niveaux (cœur lumineux blanc-cyan / périphérie bleue) ; sphère de halo.
 * - Caméra : dérive vers la gauche après la sortie du tunnel → réseau en
 *   moitié droite ; vue d'ensemble fixe à (-5, 5, 12) avec dérive latérale
 *   douce, regard posé sur (-1, 0, 8) ≠ NET_CENTER.
 *
 * Arbitrages :
 * - RGAA 1.2 : décor pur, aria-hidden posé par le parent.
 * - Éco : géométries calculées une fois ; boucle suspendue si paused ou
 *   onglet masqué.
 * - Perf : dpr ≤ 1,5 ; antialias désactivé ; tunnel invisible hors plage.
 * - Lueurs : blending additif + double couche, aucune bibliothèque ajoutée.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { genererReseau } from "@/components/console/illustrations/reseau-neuronal-modele";

/* ------------------------------------------------------------------ */
/* Constantes                                                           */
/* ------------------------------------------------------------------ */

/** Tunnel de piste cuivre. */
const T_Z1 = -20;
const T_Z2 = 4;
const T_TX = 1.5;   // demi-largeur (tunnel légèrement plus large → parois plus visibles)
const T_TY = 1.0;   // demi-hauteur
const T_TRACES_COLOR = "#d97706";  // cuivre solide
const T_GLOW_COLOR   = "#fbbf24";  // lueur additive
const T_IMP_COLOR    = "#fffbeb";  // impulsion blanche chaude
const T_IMP_N        = 12;
const T_MASQUAGE     = 0.35;       // progress() au-delà duquel le tunnel disparaît

/** Réseau neuronal — décalé à droite pour la vue d'ensemble. */
const NET_CENTER = new THREE.Vector3(1.5, 0, 8);
const NET_SCALE  = 4.5;
const NET_IMP_N  = 16;

/** Durée du trajet. */
const DUREE_TRAJET = 7; // secondes

/** Regard de la vue d'ensemble — légèrement à gauche du réseau. */
const OVERVIEW_LOOKAT = new THREE.Vector3(-1, 0, 8);

/* ------------------------------------------------------------------ */
/* Trajectoire de la caméra                                             */
/* ------------------------------------------------------------------ */

const CAMERA_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3( 0,      0,    -16  ), // P0 : cœur du tunnel
    new THREE.Vector3( 0.4,    0.05, -10  ), // P1 : tunnel, légère courbe
    new THREE.Vector3(-0.3,    0,    -3   ), // P2 : sortie du tunnel
    new THREE.Vector3(-1,      2,     3   ), // P3 : montée, dérive gauche
    new THREE.Vector3(-1.5,    2.5,   6   ), // P4 : survol du circuit (gauche)
    new THREE.Vector3(-1,      1.5,   8   ), // P5 : descente vers le réseau
    new THREE.Vector3( 0.2,    0.2,   8.8 ), // P6 : intérieur du réseau
    new THREE.Vector3(-0.5,    0.5,   8.3 ), // P7 : traversée du cœur
    new THREE.Vector3(-3,      4,     5   ), // P8 : recul, caméra à gauche
    new THREE.Vector3(-5,      5,    12   ), // P9 : vue d'ensemble
  ],
  false,
  "catmullrom",
  0.5,
);

/* ------------------------------------------------------------------ */
/* Construction des géométries statiques                                */
/* ------------------------------------------------------------------ */

/** Traces longues du tunnel (parallèles à l'axe z). */
function creerTracesLongues(): THREE.BufferGeometry {
  const pts: number[] = [];
  // Mur gauche : 22 traces
  for (let i = 0; i <= 21; i++) {
    const y = -T_TY + (i / 21) * 2 * T_TY;
    pts.push(-T_TX, y, T_Z1, -T_TX, y, T_Z2);
  }
  // Mur droit
  for (let i = 0; i <= 21; i++) {
    const y = -T_TY + (i / 21) * 2 * T_TY;
    pts.push(T_TX, y, T_Z1, T_TX, y, T_Z2);
  }
  // Plafond : 14 traces
  for (let i = 0; i <= 13; i++) {
    const x = -T_TX + (i / 13) * 2 * T_TX;
    pts.push(x, T_TY, T_Z1, x, T_TY, T_Z2);
  }
  // Plancher
  for (let i = 0; i <= 13; i++) {
    const x = -T_TX + (i / 13) * 2 * T_TX;
    pts.push(x, -T_TY, T_Z1, x, -T_TY, T_Z2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/** Cadres transversaux (sections) du tunnel — effets de profondeur et vitesse. */
function creerCadresTunnel(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let z = T_Z1; z <= T_Z2; z += 2.5) {
    pts.push(-T_TX, T_TY, z,   T_TX, T_TY, z);
    pts.push( T_TX, T_TY, z,   T_TX,-T_TY, z);
    pts.push( T_TX,-T_TY, z,  -T_TX,-T_TY, z);
    pts.push(-T_TX,-T_TY, z,  -T_TX, T_TY, z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/** Grille et traces principales du circuit imprimé (plan local y = 0). */
function creerGeometrieCircuit(): THREE.BufferGeometry {
  const pts: number[] = [];
  const EXT = 10;

  // Grille fine (quadrillage standard PCB)
  for (let x = -EXT; x <= EXT; x += 1) {
    pts.push(x, 0, -EXT, x, 0, EXT);
  }
  for (let z = -EXT; z <= EXT; z += 1) {
    pts.push(-EXT, 0, z, EXT, 0, z);
  }

  // Traces principales entre composants (légèrement surélevées, y = 0.05)
  const H = 0.05;
  const ROUTES: Array<[[number, number], [number, number]]> = [
    [[1, -3], [4, -3]],
    [[4, -3], [4, 2]],
    [[4, 2], [7, 2]],
    [[1, -3], [1, 2]],
    [[1, 2], [5, 2]],
    [[5, 2], [5, 5]],
    [[5, 5], [2, 5]],
    [[2, 5], [2, -5]],
    [[7, -1], [7, 3]],
    [[3, 3], [7, 3]],
    [[3, -5], [3, -1]],
    [[3, -1], [8, -1]],
  ];
  for (const [[x1, z1], [x2, z2]] of ROUTES) {
    pts.push(x1, H, z1, x2, H, z1); // segment horizontal
    pts.push(x2, H, z1, x2, H, z2); // segment vertical
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/* ------------------------------------------------------------------ */
/* Réseau neuronal — forme validée (genererReseau)                      */
/* ------------------------------------------------------------------ */

const RESEAU = genererReseau(0x2f6a91c3, 128, 5);

/** Arêtes du cœur (niveaux 0-1) : dense et lumineux. */
function creerAretesCoeur(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let a = 0; a < RESEAU.aretes.length; a += 2) {
    if (RESEAU.niveaux[a / 2] > 1) continue;
    const i = RESEAU.aretes[a];
    const j = RESEAU.aretes[a + 1];
    pts.push(
      RESEAU.positions[i * 3], RESEAU.positions[i * 3 + 1], RESEAU.positions[i * 3 + 2],
      RESEAU.positions[j * 3], RESEAU.positions[j * 3 + 1], RESEAU.positions[j * 3 + 2],
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/** Arêtes de périphérie (niveaux 2-3) : filaments plus fins. */
function creerAretesPeripherie(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (let a = 0; a < RESEAU.aretes.length; a += 2) {
    if (RESEAU.niveaux[a / 2] <= 1) continue;
    const i = RESEAU.aretes[a];
    const j = RESEAU.aretes[a + 1];
    pts.push(
      RESEAU.positions[i * 3], RESEAU.positions[i * 3 + 1], RESEAU.positions[i * 3 + 2],
      RESEAU.positions[j * 3], RESEAU.positions[j * 3 + 1], RESEAU.positions[j * 3 + 2],
    );
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/** Nœuds du cœur : plus grands, plus lumineux. */
function creerNoeudsCoeur(): THREE.BufferGeometry {
  const pts = new Float32Array(RESEAU.nombreCoeur * 3);
  for (let i = 0; i < RESEAU.nombreCoeur; i++) {
    pts[i * 3]     = RESEAU.positions[i * 3];
    pts[i * 3 + 1] = RESEAU.positions[i * 3 + 1];
    pts[i * 3 + 2] = RESEAU.positions[i * 3 + 2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  return geo;
}

/** Nœuds de filament : plus petits, plus bleus. */
function creerNoeudsFilaments(): THREE.BufferGeometry {
  const debut = RESEAU.nombreCoeur;
  const n = RESEAU.nombreNoeuds - debut;
  if (n <= 0) return new THREE.BufferGeometry();
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pts[i * 3]     = RESEAU.positions[(debut + i) * 3];
    pts[i * 3 + 1] = RESEAU.positions[(debut + i) * 3 + 1];
    pts[i * 3 + 2] = RESEAU.positions[(debut + i) * 3 + 2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  return geo;
}

/** Arêtes du cœur filtrées pour les impulsions réseau (niveau 0 seulement). */
const ARETES_COEUR_IDX: number[] = (() => {
  const idx: number[] = [];
  for (let a = 0; a < RESEAU.aretes.length / 2; a++) {
    if (RESEAU.niveaux[a] === 0) idx.push(a);
  }
  return idx;
})();

/* ------------------------------------------------------------------ */
/* Composants PCB : puces sombres + pads cuivrés + vias                */
/* ------------------------------------------------------------------ */

interface PuceConfig {
  pos:  [number, number, number];
  taille: [number, number, number]; // [largeur, épaisseur, profondeur]
}

/** Puces uniquement dans la moitié droite (x > 0) du groupe circuit. */
const PUCES: PuceConfig[] = [
  { pos: [1,    0.03, -3   ], taille: [1.2, 0.06, 0.5] },
  { pos: [4,    0.03, -3   ], taille: [0.8, 0.06, 0.5] },
  { pos: [4,    0.03,  2   ], taille: [1.0, 0.06, 0.6] },
  { pos: [7,    0.03,  2   ], taille: [0.6, 0.06, 0.6] },
  { pos: [2,    0.03, -5   ], taille: [1.4, 0.06, 0.5] },
  { pos: [5,    0.03,  5   ], taille: [0.7, 0.06, 0.9] },
  { pos: [8,    0.03, -1   ], taille: [0.5, 0.06, 0.5] },
  { pos: [3,    0.03,  3   ], taille: [1.0, 0.06, 0.5] },
  { pos: [3,    0.03, -1   ], taille: [0.6, 0.06, 0.6] },
  { pos: [6.5,  0.03, -4   ], taille: [0.5, 0.06, 0.5] },
];

/** Pads cuivrés : petits carrés lumineux aux bornes des puces. */
function creerPadsCouvre(): THREE.BufferGeometry {
  const pts: number[] = [];
  for (const p of PUCES) {
    const [x, , z] = p.pos;
    const w = p.taille[0] / 2 + 0.06;
    const d = p.taille[2] / 2;
    const h = 0.04;
    // 4 pads sur la face longue (en x), deux de chaque côté
    for (const dz of [-d / 2, d / 2]) {
      for (const dx of [-w, w]) {
        pts.push(x + dx - 0.04, h, z + dz, x + dx + 0.04, h, z + dz);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/** Vias : petites croix cuivrées aux intersections des traces. */
function creerVias(): THREE.BufferGeometry {
  const pts: number[] = [];
  const JUNCTIONS: [number, number][] = [
    [4, -3], [4, 2], [1, 2], [5, 2], [5, 5], [7, 3], [3, -1], [3, 3], [7, -1],
  ];
  const R = 0.08;
  const H = 0.08;
  for (const [x, z] of JUNCTIONS) {
    pts.push(x - R, H, z, x + R, H, z); // croix horizontale
    pts.push(x, H, z - R, x, H, z + R); // croix verticale
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return geo;
}

/* ------------------------------------------------------------------ */
/* Composant scène interne                                              */
/* ------------------------------------------------------------------ */

interface SceneContentProps {
  paused: boolean;
}

function SceneContent({ paused }: SceneContentProps) {
  const { camera } = useThree();

  /* --- Géométries statiques ---------------------------------------- */
  const tracesLonguesGeo  = useMemo(() => creerTracesLongues(), []);
  const cadresTunnelGeo   = useMemo(() => creerCadresTunnel(), []);
  const circuitGeo        = useMemo(() => creerGeometrieCircuit(), []);
  const padsGeo           = useMemo(() => creerPadsCouvre(), []);
  const viasGeo           = useMemo(() => creerVias(), []);
  const aretesCoeurGeo    = useMemo(() => creerAretesCoeur(), []);
  const aretesPeriphGeo   = useMemo(() => creerAretesPeripherie(), []);
  const noeudsCoeurGeo    = useMemo(() => creerNoeudsCoeur(), []);
  const noeudsFilGeo      = useMemo(() => creerNoeudsFilaments(), []);

  /* --- Géométries dynamiques (impulsions) -------------------------- */
  const tunnelImpGeo = useMemo(() => {
    const arr = new Float32Array(T_IMP_N * 3);
    for (let i = 0; i < T_IMP_N; i++) {
      // Alterner mur gauche, droit, plafond, plancher
      const face = i % 4;
      if (face === 0)       { arr[i * 3] = -T_TX; arr[i * 3 + 1] = -T_TY + Math.random() * 2 * T_TY; }
      else if (face === 1)  { arr[i * 3] =  T_TX; arr[i * 3 + 1] = -T_TY + Math.random() * 2 * T_TY; }
      else if (face === 2)  { arr[i * 3] = -T_TX + Math.random() * 2 * T_TX; arr[i * 3 + 1] = T_TY; }
      else                  { arr[i * 3] = -T_TX + Math.random() * 2 * T_TX; arr[i * 3 + 1] = -T_TY; }
      arr[i * 3 + 2] = T_Z1 + (i / T_IMP_N) * (T_Z2 - T_Z1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  const netImpGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NET_IMP_N * 3), 3));
    return geo;
  }, []);

  /* --- Refs d'animation (sans re-rendu) ---------------------------- */
  const progressRef   = useRef(0);
  const overviewDrift = useRef(0);
  const hiddenRef     = useRef(false);
  const tunnelRef     = useRef<THREE.Group>(null);

  /* Vitesses des impulsions tunnel */
  const tunnelImpZ   = useRef<Float32Array>(
    Float32Array.from({ length: T_IMP_N }, (_, i) => T_Z1 + (i / T_IMP_N) * (T_Z2 - T_Z1)),
  );
  const tunnelImpSpd = useRef<Float32Array>(
    Float32Array.from({ length: T_IMP_N }, (_, i) => 6 + i * 1.1),
  );

  /* État des impulsions réseau (sur les arêtes du cœur) */
  const netImpState = useRef(
    Array.from({ length: NET_IMP_N }, (_, k) => {
      const poolSize = ARETES_COEUR_IDX.length || 1;
      return {
        aIdx:  ARETES_COEUR_IDX[(k * 5) % poolSize],
        t:      k / NET_IMP_N,
        speed: 0.4 + (k % 5) * 0.15,
      };
    }),
  );

  /* --- Montage / démontage ----------------------------------------- */
  useEffect(() => {
    camera.position.copy(CAMERA_CURVE.getPoint(0));
    camera.lookAt(CAMERA_CURVE.getPoint(0.04));

    const onVis = () => { hiddenRef.current = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      tracesLonguesGeo.dispose();
      cadresTunnelGeo.dispose();
      circuitGeo.dispose();
      padsGeo.dispose();
      viasGeo.dispose();
      aretesCoeurGeo.dispose();
      aretesPeriphGeo.dispose();
      noeudsCoeurGeo.dispose();
      noeudsFilGeo.dispose();
      tunnelImpGeo.dispose();
      netImpGeo.dispose();
    };
  }, [
    camera,
    aretesCoeurGeo, aretesPeriphGeo, cadresTunnelGeo, circuitGeo,
    netImpGeo, noeudsCoeurGeo, noeudsFilGeo, padsGeo,
    tracesLonguesGeo, tunnelImpGeo, viasGeo,
  ]);

  /* --- Boucle d'animation ------------------------------------------ */
  useFrame((_, delta) => {
    if (paused || hiddenRef.current) return;
    const dt = Math.min(delta, 0.05);

    /* ---- Caméra ---------------------------------------------------- */
    if (progressRef.current < 1) {
      progressRef.current = Math.min(1, progressRef.current + dt / DUREE_TRAJET);
      const t = progressRef.current;
      camera.position.copy(CAMERA_CURVE.getPoint(t));

      if (t > 0.92) {
        // Transition douce du regard : courbe → vue d'ensemble
        const blend  = (t - 0.92) / 0.08;
        const cTarget = CAMERA_CURVE.getPoint(Math.min(1, t + 0.04));
        camera.lookAt(
          cTarget.x + (OVERVIEW_LOOKAT.x - cTarget.x) * blend,
          cTarget.y + (OVERVIEW_LOOKAT.y - cTarget.y) * blend,
          cTarget.z + (OVERVIEW_LOOKAT.z - cTarget.z) * blend,
        );
      } else {
        camera.lookAt(CAMERA_CURVE.getPoint(Math.min(1, t + 0.04)));
      }
    } else {
      // Vue d'ensemble : dérive latérale très douce (±0,6 unité, 30 s période)
      overviewDrift.current += dt * 0.21;
      const drift = Math.sin(overviewDrift.current) * 0.6;
      camera.position.set(-5 + drift, 5, 12);
      camera.lookAt(OVERVIEW_LOOKAT.x + drift * 0.25, OVERVIEW_LOOKAT.y, OVERVIEW_LOOKAT.z);
    }

    /* ---- Masquer le tunnel après la sortie -------------------------- */
    if (tunnelRef.current) {
      tunnelRef.current.visible = progressRef.current < T_MASQUAGE;
    }

    /* ---- Impulsions tunnel ------------------------------------------ */
    const tAttr = tunnelImpGeo.attributes.position as THREE.BufferAttribute;
    const tArr  = tAttr.array as Float32Array;
    for (let i = 0; i < T_IMP_N; i++) {
      tunnelImpZ.current[i] += dt * tunnelImpSpd.current[i];
      if (tunnelImpZ.current[i] > T_Z2) tunnelImpZ.current[i] = T_Z1;
      tArr[i * 3 + 2] = tunnelImpZ.current[i];
    }
    tAttr.needsUpdate = true;

    /* ---- Impulsions réseau ------------------------------------------ */
    const nAttr  = netImpGeo.attributes.position as THREE.BufferAttribute;
    const nArr   = nAttr.array as Float32Array;
    const states = netImpState.current;
    const pool   = ARETES_COEUR_IDX.length || 1;
    for (let k = 0; k < NET_IMP_N; k++) {
      states[k].t += dt * states[k].speed;
      if (states[k].t > 1) {
        states[k].t = 0;
        states[k].aIdx = ARETES_COEUR_IDX[(states[k].aIdx + 13) % pool];
      }
      const ia = RESEAU.aretes[states[k].aIdx * 2];
      const ib = RESEAU.aretes[states[k].aIdx * 2 + 1];
      const ft = states[k].t;
      nArr[k * 3]     = RESEAU.positions[ia * 3]     + (RESEAU.positions[ib * 3]     - RESEAU.positions[ia * 3])     * ft;
      nArr[k * 3 + 1] = RESEAU.positions[ia * 3 + 1] + (RESEAU.positions[ib * 3 + 1] - RESEAU.positions[ia * 3 + 1]) * ft;
      nArr[k * 3 + 2] = RESEAU.positions[ia * 3 + 2] + (RESEAU.positions[ib * 3 + 2] - RESEAU.positions[ia * 3 + 2]) * ft;
    }
    nAttr.needsUpdate = true;
  });

  /* --- Rendu JSX ---------------------------------------------------- */
  return (
    <>
      <color attach="background" args={["#02060d"]} />
      <fog attach="fog" args={["#02060d", 18, 45]} />

      {/*
       * Tunnel de piste cuivre.
       * Deux couches sur la même géométrie :
       *   1) Traits solides (blend normal) pour la lisibilité.
       *   2) Lueur additive par-dessus pour l'effet de halo.
       * Group masqué après t = T_MASQUAGE (exit tunnel).
       */}
      <group ref={tunnelRef}>
        {/* Traces longitudinales — couche solide */}
        <lineSegments geometry={tracesLonguesGeo}>
          <lineBasicMaterial color={T_TRACES_COLOR} />
        </lineSegments>
        {/* Traces longitudinales — couche lueur additive */}
        <lineSegments geometry={tracesLonguesGeo}>
          <lineBasicMaterial
            color={T_GLOW_COLOR}
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </lineSegments>

        {/* Cadres transversaux — très lumineux (effet de vitesse) */}
        <lineSegments geometry={cadresTunnelGeo}>
          <lineBasicMaterial color="#fed7aa" />
        </lineSegments>
        <lineSegments geometry={cadresTunnelGeo}>
          <lineBasicMaterial
            color="#ffffff"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </lineSegments>

        {/* Impulsions dorées dans le tunnel */}
        <points geometry={tunnelImpGeo}>
          <pointsMaterial
            size={0.28}
            color={T_IMP_COLOR}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      </group>

      {/*
       * Circuit imprimé.
       * Groupe centré sur (1,5, -2, 8) — décalé à droite comme le réseau,
       * aucune puce dans la zone du texte (x < 0 du groupe → x < 1,5 monde).
       */}
      <group position={[1.5, -2, 8]}>
        {/* Plan PCB sombre */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[22, 22]} />
          <meshBasicMaterial color="#010e09" side={THREE.DoubleSide} />
        </mesh>

        {/* Quadrillage et traces cuivre */}
        <lineSegments geometry={circuitGeo} position={[0, 0.02, 0]}>
          <lineBasicMaterial
            color="#92400e"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </lineSegments>

        {/* Pads cuivrés (lueur forte) */}
        <lineSegments geometry={padsGeo}>
          <lineBasicMaterial
            color="#f59e0b"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </lineSegments>

        {/* Vias */}
        <lineSegments geometry={viasGeo}>
          <lineBasicMaterial
            color="#d97706"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </lineSegments>

        {/* Puces sombres (corps IC très fins) */}
        {PUCES.map((p, idx) => (
          <group key={idx} position={p.pos}>
            {/* Corps principal */}
            <mesh>
              <boxGeometry args={p.taille} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Cadre de délimitation subtil */}
            <mesh>
              <boxGeometry args={[p.taille[0] + 0.02, p.taille[1] + 0.01, p.taille[2] + 0.02]} />
              <meshBasicMaterial color="#1e293b" wireframe />
            </mesh>
            {/* Bande marquage (repère de broche 1) */}
            <mesh position={[-p.taille[0] / 2 + 0.12, p.taille[1] / 2 + 0.005, 0]}>
              <boxGeometry args={[0.08, 0.005, p.taille[2] * 0.6]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          </group>
        ))}
      </group>

      {/*
       * Réseau neuronal — décalé à droite (NET_CENTER.x = 1,5).
       * Deux niveaux de rendu :
       *   - Cœur (arêtes 0-1, nœuds 0..nombreCoeur) : blanc-cyan lumineux.
       *   - Périphérie (arêtes 2-3, filaments) : bleu doux.
       * Sphère de halo pour la masse volumique.
       */}
      <group position={[NET_CENTER.x, NET_CENTER.y, NET_CENTER.z]} scale={NET_SCALE}>
        {/* Halo volumique de la masse */}
        <mesh>
          <sphereGeometry args={[1.05, 16, 12]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.04}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Arêtes du cœur — blanc-cyan */}
        <lineSegments geometry={aretesCoeurGeo}>
          <lineBasicMaterial
            color="#7dd3fc"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </lineSegments>
        {/* Couche lueur sur les arêtes du cœur */}
        <lineSegments geometry={aretesCoeurGeo}>
          <lineBasicMaterial
            color="#e0f2fe"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </lineSegments>

        {/* Arêtes de périphérie (filaments) */}
        <lineSegments geometry={aretesPeriphGeo}>
          <lineBasicMaterial
            color="#38bdf8"
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </lineSegments>

        {/* Nœuds du cœur — lumineux */}
        <points geometry={noeudsCoeurGeo}>
          <pointsMaterial
            size={0.13}
            color="#e0f2fe"
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            sizeAttenuation
          />
        </points>

        {/* Nœuds de filaments — plus petits, plus bleus */}
        <points geometry={noeudsFilGeo}>
          <pointsMaterial
            size={0.07}
            color="#7dd3fc"
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            sizeAttenuation
          />
        </points>

        {/* Impulsions sur les arêtes du cœur */}
        <points geometry={netImpGeo}>
          <pointsMaterial
            size={0.18}
            color="#ffffff"
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            sizeAttenuation
          />
        </points>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

export interface SceneMontagnesRussesProps {
  paused: boolean;
}

export function SceneMontagnesRusses({ paused }: SceneMontagnesRussesProps) {
  return (
    <Canvas
      camera={{ fov: 70, near: 0.05, far: 55 }}
      dpr={[1, 1.5]}
      frameloop="always"
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: false, alpha: false }}
    >
      <SceneContent paused={paused} />
    </Canvas>
  );
}
