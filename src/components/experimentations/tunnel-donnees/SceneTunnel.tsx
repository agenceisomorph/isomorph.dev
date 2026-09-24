"use client";

/**
 * Scène Three.js du hero « Tunnel de données ».
 *
 * Quatre phases :
 *   console  — tunnel sombre, quelques filaments à peine visibles
 *   tunnel   — filaments s'allument, vitesse monte, anneaux défilent
 *   reseau   — caméra recule, réseau neuronal simplifié apparaît au fond
 *   ambiance — réseau en rotation lente, bouche du tunnel encore derrière
 *
 * Éco-conception :
 *   - un seul maillage cylindrique (shader procédural, pas de texture)
 *   - InstancedMesh pour les paquets de données
 *   - hors écran → frameloop="demand" via IntersectionObserver
 *   - onglet masqué → rendu suspendu
 *   - dpr plafonné à 1,5
 *   - mobile (< 768 px) : géométrie allégée
 *
 * Sécurité : aucune dépendance ajoutée, lueurs par additive blending.
 *
 * RGAA : aria-hidden sur le conteneur, scène purement décorative.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

export type Phase = "console" | "tunnel" | "reseau" | "ambiance";

interface SceneProps {
  phase: Phase;
  pause: boolean;
  mobile: boolean;
  /** Vrai dès 1 s : filaments s'allument pendant la phase console. */
  tunnelActif: boolean;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Constantes                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

const LONGUEUR_TUNNEL = 50;
const RAYON_TUNNEL = 3.5;
/** Position du centre du cylindre (z) — near end +3, far end -47. */
const Z_CENTRE_TUNNEL = -22;
const NEAR_END_Z = Z_CENTRE_TUNNEL + LONGUEUR_TUNNEL / 2; // +3
const FAR_END_Z = Z_CENTRE_TUNNEL - LONGUEUR_TUNNEL / 2;  // -47

/** Position du réseau neuronal simplifié. */
const Z_RESEAU = -30;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Shader du tunnel                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

const VERT_TUNNEL = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Fragment shader : filaments lumineux + paquets de données.
 *
 * Repères UV :
 *   vUv.x : angle (0 → 1 = tour complet)
 *   vUv.y : 0 = fond du tunnel (loin), 1 = bouche (près caméra)
 * Les filaments « volent » vers y=1 : defilement = vUv.y + uTemps * uVitesse
 */
const FRAG_TUNNEL = /* glsl */ `
uniform float uTemps;
uniform float uVitesse;
uniform float uIntensite;

varying vec2 vUv;

float rand(float n) { return fract(sin(n * 127.1 + 43.7) * 43758.5453); }

void main() {
  float nFil = 16.0;
  float idFil     = floor(vUv.x * nFil);
  float posAngle  = fract(vUv.x * nFil);          // 0..1 dans la cellule
  float distFil   = abs(posAngle - 0.5) * 2.0;    // 0 = centre du filament

  // Défilement vers la caméra (y croissant)
  float defilement = vUv.y + uTemps * uVitesse;
  float phaseFil   = rand(idFil) * 6.28318;
  float ampFil     = 0.55 + 0.45 * rand(idFil + 7.3);

  // Paquets de données : discontinuités lumineuses le long du filament
  float onde   = sin(defilement * 22.0 + phaseFil) * 0.5 + 0.5;
  float paquet = smoothstep(0.45, 0.70, onde);

  // Largeur du filament (gaussienne étroite)
  float lueur  = exp(-distFil * distFil * 55.0) * (0.35 + 0.65 * paquet) * ampFil;

  // Vignette profondeur : sombre au fond (y=0), fondu vers y=1 (bouche)
  float vignette = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.78, vUv.y);

  // Paquets secondaires : petits éclairs entre les filaments
  float interFil = smoothstep(0.90, 0.95, posAngle) + smoothstep(0.10, 0.05, posAngle);
  float eclairInter = interFil * smoothstep(0.78, 0.88, sin(defilement * 40.0 + phaseFil * 2.0) * 0.5 + 0.5) * 0.25;

  float intensiteFinale = (lueur + eclairInter) * vignette * uIntensite;

  vec3 cyan  = vec3(0.49, 0.83, 0.99);  // #7dd3fc
  vec3 bleu  = vec3(0.08, 0.22, 0.52);
  vec3 couleur = mix(bleu, cyan, paquet * 0.85 + 0.15);

  gl_FragColor = vec4(couleur * intensiteFinale, intensiteFinale * 0.92);
}
`;

/* ─────────────────────────────────────────────────────────────────────────── */
/* TunnelCylindre                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

function TunnelCylindre({ phase, pause, mobile, tunnelActif }: SceneProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ciblesRef = useRef({ intensité: 0.06, vitesse: 0.025 });

  useEffect(() => {
    switch (phase) {
      case "console":
        /* tunnelActif (à partir de 1 s) : filaments commencent à s'allumer. */
        ciblesRef.current = tunnelActif
          ? { intensité: 0.65, vitesse: 0.5 }
          : { intensité: 0.06, vitesse: 0.025 };
        break;
      case "tunnel":
        ciblesRef.current = { intensité: 1.0, vitesse: 0.9 };
        break;
      case "reseau":
        ciblesRef.current = { intensité: 0.35, vitesse: 0.18 };
        break;
      case "ambiance":
        ciblesRef.current = { intensité: 0.22, vitesse: 0.10 };
        break;
    }
  }, [phase, tunnelActif]);

  useFrame((_, delta) => {
    if (!matRef.current || pause) return;
    const u = matRef.current.uniforms;
    u.uTemps.value += delta;
    const k = 1 - Math.pow(1 - Math.min(delta * 2.5, 0.99), 1); // lerp rapide
    const { intensité, vitesse } = ciblesRef.current;
    u.uIntensite.value += (intensité - u.uIntensite.value) * k;
    u.uVitesse.value   += (vitesse   - u.uVitesse.value)   * Math.min(delta * 0.7, 0.99);
  });

  const uniforms = useMemo(
    () => ({
      uTemps:     { value: 0 },
      uVitesse:   { value: 0.025 },
      uIntensite: { value: 0.06 },
    }),
    [],
  );

  /* Segments réduits sur mobile */
  const segmentsAng = mobile ? 32 : 64;
  const segmentsLon = mobile ? 4 : 8;

  return (
    /* Rotation X +90° : axe Y du cylindre devient Z monde */
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, Z_CENTRE_TUNNEL]}>
      <mesh>
        <cylinderGeometry
          args={[RAYON_TUNNEL, RAYON_TUNNEL, LONGUEUR_TUNNEL, segmentsAng, segmentsLon, true]}
        />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT_TUNNEL}
          fragmentShader={FRAG_TUNNEL}
          uniforms={uniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Anneaux de jonction (portiques)                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

const NB_ANNEAUX_DESKTOP = 8;
const NB_ANNEAUX_MOBILE = 4;

function AnneauxPortiques({ phase, pause, mobile, tunnelActif }: SceneProps) {
  const nbAnneaux = mobile ? NB_ANNEAUX_MOBILE : NB_ANNEAUX_DESKTOP;
  const groupRef = useRef<THREE.Group>(null);

  /** Positions Z des anneaux, en ref (pas de setState dans la boucle). */
  const positionsZ = useRef<number[]>([]);

  useEffect(() => {
    /* Répartition initiale dans le tunnel */
    positionsZ.current = Array.from(
      { length: nbAnneaux },
      (_, i) => FAR_END_Z + (i / nbAnneaux) * (NEAR_END_Z - FAR_END_Z - 2),
    );
  }, [nbAnneaux]);

  const vitesseRef = useRef(1.5);

  useEffect(() => {
    switch (phase) {
      case "console":
        vitesseRef.current = tunnelActif ? 8.0 : 1.5;
        break;
      case "tunnel":  vitesseRef.current = 18.0; break;
      case "reseau":  vitesseRef.current = 5.0;  break;
      case "ambiance":vitesseRef.current = 2.5;  break;
    }
  }, [phase, tunnelActif]);

  useFrame((_, delta) => {
    if (!groupRef.current || pause) return;
    const deplacement = vitesseRef.current * delta;
    positionsZ.current = positionsZ.current.map((z) => {
      const next = z + deplacement;
      /* Réapparition au fond quand l'anneau passe derrière la caméra */
      return next > NEAR_END_Z + 1 ? next + (FAR_END_Z - NEAR_END_Z - 1) : next;
    });
    groupRef.current.children.forEach((child, i) => {
      child.position.z = positionsZ.current[i] ?? 0;
    });
  });

  /* Opacité selon profondeur (simulée sur tous les anneaux de façon uniforme) */
  return (
    <group ref={groupRef}>
      {Array.from({ length: nbAnneaux }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0, positionsZ.current[i] ?? FAR_END_Z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[RAYON_TUNNEL, 0.035, 6, mobile ? 48 : 80]} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Paquets de données                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

const NB_PAQUETS_DESKTOP = 40;
const NB_PAQUETS_MOBILE = 16;

interface DonneePaquet {
  z: number;
  angle: number;
  rayon: number;
  vitesse: number;
}

function PaquetsDonnees({ phase, pause, mobile, tunnelActif }: SceneProps) {
  const nbPaquets = mobile ? NB_PAQUETS_MOBILE : NB_PAQUETS_DESKTOP;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matrice = useMemo(() => new THREE.Object3D(), []);

  const paquets = useRef<DonneePaquet[]>([]);
  useEffect(() => {
    /* Graine fixe pour la répartition initiale */
    let s = 0x12ab34cd;
    const rand = () => {
      s = (s ^ (s << 13)) >>> 0;
      s = (s ^ (s >> 17)) >>> 0;
      s = (s ^ (s << 5)) >>> 0;
      return s / 0xffffffff;
    };
    paquets.current = Array.from({ length: nbPaquets }, () => ({
      z: FAR_END_Z + rand() * (NEAR_END_Z - FAR_END_Z),
      angle: rand() * Math.PI * 2,
      rayon: RAYON_TUNNEL * (0.15 + rand() * 0.70),
      vitesse: 4 + rand() * 10,
    }));
  }, [nbPaquets]);

  const vitesseMult = useRef(0.3);
  useEffect(() => {
    switch (phase) {
      case "console":
        vitesseMult.current = tunnelActif ? 1.8 : 0.25;
        break;
      case "tunnel":   vitesseMult.current = 3.2;  break;
      case "reseau":   vitesseMult.current = 1.0;  break;
      case "ambiance": vitesseMult.current = 0.5;  break;
    }
  }, [phase, tunnelActif]);

  useFrame((_, delta) => {
    if (!meshRef.current || pause) return;
    const vm = vitesseMult.current;
    const ps = paquets.current;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      p.z += p.vitesse * vm * delta;
      if (p.z > NEAR_END_Z + 0.5) p.z = FAR_END_Z;

      matrice.position.set(
        Math.cos(p.angle) * p.rayon,
        Math.sin(p.angle) * p.rayon,
        p.z,
      );
      /* Élongation selon la vitesse (effet de trainée) */
      const trainee = 1 + vm * 0.4;
      matrice.scale.set(0.06, 0.06, 0.06 * trainee);
      matrice.updateMatrix();
      meshRef.current.setMatrixAt(i, matrice.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nbPaquets]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#7dd3fc"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Réseau neuronal simplifié                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Génération déterministe d'un réseau léger pour la phase finale. */
function genererReseau(nb: number): { positions: Float32Array; aretes: Float32Array } {
  let s = 0xdeadbeef;
  const rand = () => {
    s = (Math.imul(s + 0x6d2b79f5, 1) | 0) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const positions = new Float32Array(nb * 3);
  for (let i = 0; i < nb; i++) {
    /* Distribution sphéroïdale : plus étalée en X et Z */
    const theta = rand() * Math.PI * 2;
    const phi   = Math.acos(2 * rand() - 1);
    const r     = 3 + rand() * 3.5;
    positions[i * 3]     = r * 1.5 * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * 0.9 * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  /* Arêtes : nœuds proches connectés (distance < 4.5) */
  const aretesBuf: number[] = [];
  const SEUIL = 4.5 * 4.5;
  for (let i = 0; i < nb; i++) {
    let nbConn = 0;
    for (let j = i + 1; j < nb && nbConn < 4; j++) {
      const dx = positions[i*3]   - positions[j*3];
      const dy = positions[i*3+1] - positions[j*3+1];
      const dz = positions[i*3+2] - positions[j*3+2];
      if (dx*dx + dy*dy + dz*dz < SEUIL) {
        aretesBuf.push(
          positions[i*3], positions[i*3+1], positions[i*3+2],
          positions[j*3], positions[j*3+1], positions[j*3+2],
        );
        nbConn++;
      }
    }
  }

  return { positions, aretes: new Float32Array(aretesBuf) };
}

function ReseauNeuronalSimple({ visible, pause, mobile }: { visible: boolean; pause: boolean; mobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  const { noeudsGeo, aretesGeo } = useMemo(() => {
    const nb = mobile ? 50 : 90;
    const { positions, aretes } = genererReseau(nb);
    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const aGeo = new THREE.BufferGeometry();
    aGeo.setAttribute("position", new THREE.BufferAttribute(aretes, 3));
    return { noeudsGeo: nGeo, aretesGeo: aGeo };
  }, [mobile]);

  /* Nettoyage des géométries au démontage */
  useEffect(() => {
    return () => {
      noeudsGeo.dispose();
      aretesGeo.dispose();
    };
  }, [noeudsGeo, aretesGeo]);

  useFrame((_, delta) => {
    if (!groupRef.current || pause || !visible) return;
    groupRef.current.rotation.y += delta * 0.06;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.08;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0, Z_RESEAU]}>
      {/* Nœuds */}
      <points geometry={noeudsGeo}>
        <pointsMaterial
          size={mobile ? 0.10 : 0.14}
          color="#7dd3fc"
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.85}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      {/* Arêtes */}
      <lineSegments geometry={aretesGeo}>
        <lineBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.20}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      {/* Halo central (sprites) */}
      {!mobile && (
        <mesh>
          <sphereGeometry args={[1.8, 8, 8]} />
          <meshBasicMaterial
            color="#3ab8f8"
            transparent
            opacity={0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Bouche de tunnel visible en phase réseau / ambiance                        */
/* ─────────────────────────────────────────────────────────────────────────── */

function BoucheTunnel({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <mesh position={[0, 0, NEAR_END_Z - 0.1]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[RAYON_TUNNEL, 0.08, 6, 80]} />
      <meshBasicMaterial
        color="#7dd3fc"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Animation de la caméra                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

function AnimationCamera({ phase, pause }: { phase: Phase; pause: boolean }) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const tempCibleRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (phase === "console" || phase === "tunnel") {
      progressRef.current = 0;
      camera.position.set(0, 0, 0);
      camera.lookAt(0, 0, -50);
    }
  }, [phase, camera]);

  useFrame((_, delta) => {
    if (pause) return;

    if (phase === "reseau") {
      /* Recul progressif vers z=18 */
      progressRef.current = Math.min(1, progressRef.current + delta * 0.28);
      const t = progressRef.current;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      camera.position.z = eased * 18;
      camera.position.y = 0;
      /* Regarder vers le réseau */
      tempCibleRef.current.set(0, 0, Z_RESEAU);
      camera.lookAt(tempCibleRef.current);
    } else if (phase === "ambiance") {
      /* Léger balancement en ambiance */
      const t = Date.now() * 0.0004;
      camera.position.y += (Math.sin(t) * 0.25 - camera.position.y) * delta * 0.8;
      camera.position.z += (18 - camera.position.z) * delta * 0.5;
      tempCibleRef.current.set(0, 0, Z_RESEAU);
      camera.lookAt(tempCibleRef.current);
    }
  });

  return null;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Fond étoilé (très discret)                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function FondEtoile() {
  const geo = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    let s = 0xfeedface;
    const rand = () => {
      s = (s ^ (s << 13)) >>> 0;
      s = (s ^ (s >> 17)) >>> 0;
      s = (s ^ (s << 5)) >>> 0;
      return s / 0xffffffff;
    };
    for (let i = 0; i < 300; i++) {
      positions[i*3]   = (rand() - 0.5) * 60;
      positions[i*3+1] = (rand() - 0.5) * 40;
      positions[i*3+2] = -45 + rand() * -15;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        color="#ffffff"
        size={0.04}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Scène Three.js complète                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

function SceneInterne({ phase, pause, mobile, tunnelActif }: SceneProps) {
  const reseauVisible = phase === "reseau" || phase === "ambiance";

  return (
    <>
      <color attach="background" args={["#02060d"]} />
      <AnimationCamera phase={phase} pause={pause} />
      <FondEtoile />
      <TunnelCylindre phase={phase} pause={pause} mobile={mobile} tunnelActif={tunnelActif} />
      {!mobile && <AnneauxPortiques phase={phase} pause={pause} mobile={mobile} tunnelActif={tunnelActif} />}
      <PaquetsDonnees phase={phase} pause={pause} mobile={mobile} tunnelActif={tunnelActif} />
      <BoucheTunnel visible={reseauVisible} />
      <ReseauNeuronalSimple visible={reseauVisible} pause={pause} mobile={mobile} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Composant exporté                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

export interface SceneTunnelProps {
  phase: Phase;
  pause: boolean;
  /** Vrai dès 1 s : filaments et cible démarrent pendant la console. */
  tunnelActif?: boolean;
}

/**
 * Canvas Three.js avec gestion hors-écran et onglet masqué.
 * Chargé dynamiquement (ssr: false) depuis HeroTunnel.
 */
export function SceneTunnel({ phase, pause, tunnelActif = false }: SceneTunnelProps) {
  const contenerRef = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(true);
  const [mobile, setMobile] = useState(false);

  /* Détection mobile et onglet masqué — uniquement après montage */
  useEffect(() => {
    setMobile(window.innerWidth < 768);

    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize, { passive: true });

    const onVisibility = () => setActif(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* IntersectionObserver : suspend le rendu hors écran */
  useEffect(() => {
    const el = contenerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActif(!document.hidden && entry.isIntersecting),
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={contenerRef} className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 72, near: 0.05, far: 120 }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5)}
        gl={{ antialias: !mobile, alpha: false, powerPreference: "high-performance" }}
        frameloop={actif && !pause ? "always" : "demand"}
      >
        <SceneInterne phase={phase} pause={pause} mobile={mobile} tunnelActif={tunnelActif} />
      </Canvas>
    </div>
  );
}
