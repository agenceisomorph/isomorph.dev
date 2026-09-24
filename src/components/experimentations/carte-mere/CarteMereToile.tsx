"use client";

/**
 * Scène Three.js de la carte mère -- chargée uniquement côté navigateur
 * (import dynamique avec ssr: false dans HeroCarteMere.tsx).
 *
 * Visibilité (corrections v2) :
 *  - Caméra à y=2 (altitude rasante, "au ras de la carte")
 *  - Traces cuivre vif (#c87832) opacity 0.85 en phase allumage
 *  - Halo cyan (#7dd3fc) opacity 0.38
 *  - Fog : near=3, far=55 (ne noie plus les pistes proches)
 *  - 100 impulsions, sprites 0.38 unités, opacity 0.95
 *  - Composants (puces, condensateurs) emissiveIntensity visible
 *  - Lumière ponctuelle intensity 2 après démarrage
 *
 * RGAA : aria-hidden sur le wrapper (décor pur).
 * Éco : géométrie réseau au niveau module (reseau.ts), dpr <= 1.5,
 *       frameloop demand quand en pause, dispose() au démontage.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { LONGUEUR, RESEAU, type Chemin } from "./reseau";

// --- Types ---
export type PhaseCarteMere = "demarrage" | "allumage" | "actif";

interface SceneProps {
  phase: PhaseCarteMere;
  enPause: boolean;
}

// --- Couleurs ---
const COULEUR_SUBSTRAT = new THREE.Color(0x030e06);
const COULEUR_TRACE    = new THREE.Color(0xc87832); // cuivre vif
const COULEUR_HALO     = new THREE.Color(0x7dd3fc); // cyan système

// --- Texture sprite impulsion (canvas) ---
function creerTextureImpulsion(): THREE.Texture {
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 64;
  const ctx = cv.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(125,211,252,0.95)");
    g.addColorStop(0.55, "rgba(125,211,252,0.3)");
    g.addColorStop(1,    "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(cv);
}

// --- PRNG local ---
function prngLocal(s: number): () => number {
  let v = s;
  return () => {
    v = Math.imul(v ^ (v >>> 16), 0x45d9f3b) >>> 0;
    return v / 0x100000000;
  };
}

// --- Surface substrat ---
function PlanCarte() {
  const geo = useMemo(() => new THREE.PlaneGeometry(24, LONGUEUR + 20), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: COULEUR_SUBSTRAT, roughness: 0.97, metalness: 0.03 }),
    []
  );
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  return (
    <mesh geometry={geo} material={mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -LONGUEUR / 2]} />
  );
}

// --- Traces cuivre ---
function ReseauTraces({ phase }: { phase: PhaseCarteMere }) {
  const refMat = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(RESEAU.positionsTraces, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const mat = refMat.current;
    if (!mat) return;
    const cible = phase === "demarrage" ? 0.12 : phase === "allumage" ? 0.85 : 0.6;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, cible, 0.022);
  });

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        ref={refMat}
        color={COULEUR_TRACE}
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// --- Halo cyan (lueur additive sur les traces) ---
function HaloTraces({ phase }: { phase: PhaseCarteMere }) {
  const refMat = useRef<THREE.LineBasicMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(RESEAU.positionsHalo, 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const mat = refMat.current;
    if (!mat) return;
    const cible = phase === "demarrage" ? 0 : phase === "allumage" ? 0.38 : 0.22;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, cible, 0.018);
  });

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        ref={refMat}
        color={COULEUR_HALO}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// --- Vias ---
function Vias({ phase }: { phase: PhaseCarteMere }) {
  const refMat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const raw = RESEAU.positionsVias;
    const pts: number[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      pts.push(raw[i], 0.03, raw[i + 1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const mat = refMat.current;
    if (!mat) return;
    const cible = phase === "demarrage" ? 0.1 : 0.7;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, cible, 0.025);
  });

  return (
    <points geometry={geo}>
      <pointsMaterial
        ref={refMat}
        color={COULEUR_HALO}
        size={0.09}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// --- Impulsions sur les pistes ---
const N_IMPULSIONS = 100;

function initialiserImpulsions(chemins: Chemin[]) {
  const r = prngLocal(0xcafe1234);
  return Array.from({ length: N_IMPULSIONS }, () => ({
    cheminIdx: Math.floor(r() * chemins.length),
    progression: r(),
    vitesse: r() * 0.014 + 0.006,
  }));
}

function Impulsions({ phase, enPause }: { phase: PhaseCarteMere; enPause: boolean }) {
  const refPoints = useRef<THREE.Points>(null);
  const refMat    = useRef<THREE.PointsMaterial>(null);
  const texture   = useMemo(creerTextureImpulsion, []);
  useEffect(() => () => texture.dispose(), [texture]);

  const etats = useMemo(() => initialiserImpulsions(RESEAU.chemins), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N_IMPULSIONS * 3), 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(() => {
    const mat = refMat.current;
    if (!mat) return;
    // Opacité cible
    const cibleOpac = phase === "demarrage" ? 0 : 0.95;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, cibleOpac, 0.03);

    if (enPause || phase === "demarrage" || !refPoints.current) return;

    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    for (let i = 0; i < N_IMPULSIONS; i++) {
      const e = etats[i];
      e.progression += e.vitesse;
      if (e.progression > 1) {
        e.progression = 0;
        e.cheminIdx = (e.cheminIdx + 3 + Math.floor(Math.random() * 4)) % RESEAU.chemins.length;
      }
      const ch = RESEAU.chemins[e.cheminIdx];
      const p  = new THREE.Vector3().lerpVectors(ch.debut, ch.fin, e.progression);
      pos.setXYZ(i, p.x, p.y + 0.05, p.z);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={refPoints} geometry={geo}>
      <pointsMaterial
        ref={refMat}
        map={texture}
        size={0.38}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
        color={COULEUR_HALO}
      />
    </points>
  );
}

// --- Composants (puces + condensateurs) ---
function Composants({ phase }: { phase: PhaseCarteMere }) {
  const { puces, condensateurs } = RESEAU;
  const refPuces = useRef<THREE.InstancedMesh>(null);
  const refCapas = useRef<THREE.InstancedMesh>(null);
  const refMatPuces = useRef<THREE.MeshStandardMaterial>(null);
  const refMatCapas = useRef<THREE.MeshStandardMaterial>(null);

  const geoPuce = useMemo(() => new THREE.BoxGeometry(1.3, 0.22, 1.1), []);
  const geoCapa = useMemo(() => new THREE.CylinderGeometry(0.11, 0.11, 0.38, 8), []);
  useEffect(() => () => { geoPuce.dispose(); geoCapa.dispose(); }, [geoPuce, geoCapa]);

  useEffect(() => {
    const m4 = new THREE.Matrix4();
    const puceMesh = refPuces.current;
    if (puceMesh) {
      puces.forEach((p, i) => { m4.makeTranslation(p.x, p.y, p.z); puceMesh.setMatrixAt(i, m4); });
      puceMesh.instanceMatrix.needsUpdate = true;
    }
    const capaMesh = refCapas.current;
    if (capaMesh) {
      condensateurs.forEach((c, i) => { m4.makeTranslation(c.x, c.y, c.z); capaMesh.setMatrixAt(i, m4); });
      capaMesh.instanceMatrix.needsUpdate = true;
    }
  }, [puces, condensateurs]);

  useFrame(() => {
    const cible = phase === "demarrage" ? 0 : phase === "allumage" ? 0.55 : 0.28;
    if (refMatPuces.current) {
      refMatPuces.current.emissiveIntensity = THREE.MathUtils.lerp(
        refMatPuces.current.emissiveIntensity, cible, 0.025
      );
    }
    if (refMatCapas.current) {
      refMatCapas.current.emissiveIntensity = THREE.MathUtils.lerp(
        refMatCapas.current.emissiveIntensity, cible * 0.5, 0.025
      );
    }
  });

  return (
    <>
      <instancedMesh ref={refPuces} args={[geoPuce, undefined, puces.length]}>
        <meshStandardMaterial
          ref={refMatPuces}
          color="#0a1e14"
          roughness={0.75}
          metalness={0.35}
          emissive={COULEUR_HALO}
          emissiveIntensity={0}
        />
      </instancedMesh>
      <instancedMesh ref={refCapas} args={[geoCapa, undefined, condensateurs.length]}>
        <meshStandardMaterial
          ref={refMatCapas}
          color="#0d1a10"
          roughness={0.55}
          metalness={0.55}
          emissive="#4ade80"
          emissiveIntensity={0}
        />
      </instancedMesh>
    </>
  );
}

// --- Caméra animée (basse altitude) ---
function CameraAnimee({ phase, enPause }: { phase: PhaseCarteMere; enPause: boolean }) {
  const { camera } = useThree();
  const phaseRef   = useRef(phase);
  const tPhase     = useRef(0);

  useEffect(() => {
    // Caméra à y=2 pour le vol au ras de la carte
    camera.position.set(0, 2, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    phaseRef.current = phase;
    tPhase.current = 0;
  }, [phase]);

  useFrame((_, delta) => {
    if (enPause) return;
    tPhase.current += delta;
    const t  = tPhase.current;
    const ph = phaseRef.current;

    switch (ph) {
      case "demarrage": {
        // Vol rapide, altitude stable à y=2
        camera.position.z -= 9 * delta;
        // Légère oscillation pour donner la sensation de vitesse
        camera.position.y = 2 + Math.sin(t * 1.2) * 0.15;
        camera.lookAt(camera.position.x * 0.2, 0, camera.position.z - 22);
        if (camera.position.z < -LONGUEUR + 12) camera.position.z += LONGUEUR;
        break;
      }
      case "allumage": {
        // Ralentissement progressif
        const v = THREE.MathUtils.lerp(9, 1.5, Math.min(t / 1.4, 1));
        camera.position.z -= v * delta;
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2, delta * 0.5);
        camera.lookAt(camera.position.x * 0.2, 0, camera.position.z - 20);
        if (camera.position.z < -LONGUEUR + 12) camera.position.z += LONGUEUR;
        break;
      }
      case "actif": {
        // Pose légèrement plongeante sur la puce principale (centre-droit)
        // Micro-oscillation d'ambiance
        const ox = Math.sin(t * 0.2) * 0.12;
        const oy = Math.cos(t * 0.13) * 0.06;
        camera.position.z -= 0.6 * delta;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 2 + ox, delta * 0.3);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.8 + oy, delta * 0.3);
        camera.lookAt(new THREE.Vector3(3.5, 0, camera.position.z - 10));
        if (camera.position.z < -LONGUEUR + 12) camera.position.z += LONGUEUR;
        break;
      }
    }
  });

  return null;
}

// --- Environnement (lumières + brume) ---
function Environnement({ phase }: { phase: PhaseCarteMere }) {
  const refAmbient = useRef<THREE.AmbientLight>(null);
  const refPoint   = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (refAmbient.current) {
      const cible = phase === "demarrage" ? 0.06 : 0.18;
      refAmbient.current.intensity = THREE.MathUtils.lerp(refAmbient.current.intensity, cible, 0.025);
    }
    if (refPoint.current) {
      const cible = phase === "demarrage" ? 0 : 2.0;
      refPoint.current.intensity = THREE.MathUtils.lerp(refPoint.current.intensity, cible, 0.025);
    }
  });

  return (
    <>
      <ambientLight ref={refAmbient} intensity={0.06} color="#0a2030" />
      <pointLight
        ref={refPoint}
        position={[0, 6, 0]}
        intensity={0}
        color="#7dd3fc"
        distance={40}
        decay={2}
      />
      {/* Fog étendu : masque le bord de la bande sans noyer les pistes proches */}
      <fog attach="fog" args={["#020a12", 3, 55]} />
    </>
  );
}

// --- Canvas R3F ---
export function CarteMereToile({ phase, enPause }: SceneProps) {
  const dpr = useMemo(
    () => (typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 1.5)),
    []
  );

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 2, 25], fov: 60, near: 0.1, far: 200 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ background: "#020a12" }}
      frameloop={enPause ? "demand" : "always"}
    >
      <Environnement phase={phase} />
      <PlanCarte />
      <ReseauTraces phase={phase} />
      <HaloTraces phase={phase} />
      <Vias phase={phase} />
      <Impulsions phase={phase} enPause={enPause} />
      <Composants phase={phase} />
      <CameraAnimee phase={phase} enPause={enPause} />
    </Canvas>
  );
}
