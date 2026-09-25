"use client";

/**
 * Scène 3D « Cœur quantique » — hero de démarrage n°2.
 *
 * Chargée dynamiquement (ssr: false) depuis HeroCoeurQuantique.tsx.
 *
 * Arbitrages :
 * - Éco : frameloop="demand" (rendu arrêté hors écran et quand paused) ;
 *   dpr plafonné à 1,5 ; particules et arcs désactivés sur mobile.
 * - Perf : shaders inline (pas de post-processing), textures canvas (aucun fetch réseau).
 * - RGAA 13.7 : arcs électriques ≤ 3/s, luminosité maîtrisée (opacité max 0,55).
 * - Sécu : aucune dépendance ajoutée, aucune donnée sensible.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  ShaderMaterial,
  SphereGeometry,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
} from "three";
import type { Group, Sprite } from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SceneCoeurQuantiqueProps {
  /** Phase 0=froid, 1=chauffe, 2=allumage, 3=ambiance. */
  phase: 0 | 1 | 2 | 3;
  /** Pause : onglet masqué, hors écran, ou bouton utilisateur. */
  paused: boolean;
  /** Version allégée sur mobile (pas d'arcs, moins de particules). */
  isMobile: boolean;
  /** Appelé une fois après le flash d'allumage. */
  onPhase3: () => void;
}

// ─── Shaders ─────────────────────────────────────────────────────────────────

/**
 * Vertex shader du noyau : transmet la normale et la position monde
 * pour le calcul Fresnel et le bruit 3D en fragment.
 */
const VERT_NOYAU = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment du noyau : bruit de Perlin simplifié + effet Fresnel.
 * Froid (gris) → allumé (cyan) selon uPower. Respiration lente en phase 3.
 */
const FRAG_NOYAU = `
  uniform float uTime;
  uniform float uPower;
  uniform vec3  uCouleur;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  /* Bruit : hash compact sans texture */
  float h3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float n3(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z
    );
  }

  void main() {
    /* Fresnel : bord brillant, intérieur sombre */
    vec3 vDir = normalize(cameraPosition - vWorldPos);
    float fr  = pow(1.0 - max(dot(vNormal, vDir), 0.0), 2.5);

    /* Turbulence sur deux octaves */
    float turb = n3(vWorldPos * 4.0 + uTime * 0.25) * 0.6
               + n3(vWorldPos * 9.0 - uTime * 0.4)  * 0.4;

    /* Respiration lente (phase 3, power > 0.8) */
    float breath = uPower > 0.8 ? 1.0 + 0.12 * sin(uTime * 1.15) : 1.0;
    float p = min(uPower * breath, 1.0);

    vec3 cold = vec3(0.22, 0.24, 0.30);
    vec3 col  = mix(cold, uCouleur, p);
    float alpha = clamp(0.08 + fr * 0.72 + turb * 0.28 * p, 0.0, 1.0);

    gl_FragColor = vec4(col * (1.0 + p * 3.5 * turb), alpha);
  }
`;

/**
 * Vertex des particules : orbite elliptique, attraction vers le centre.
 * La position est calculée en shader pour économiser les transferts CPU→GPU.
 */
const VERT_PART = `
  attribute float aSize;
  attribute float aPh;
  attribute vec3  aOrb; /* x=rayon, y=inclinaison, z=vitesse relative */
  uniform float uTime;
  uniform float uAttr;
  varying float vA;

  void main() {
    float angle  = aPh + uTime * (0.18 + aOrb.z * 0.38);
    float radius = aOrb.x * max(0.04, 1.0 - uAttr * 0.75);
    float incl   = aOrb.y;
    vec3 pos = vec3(
      cos(angle) * cos(incl) * radius,
      sin(incl)  * radius    * 0.48,
      sin(angle) * cos(incl) * radius
    );
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = clamp(aSize * 270.0 / (-mv.z), 0.8, 5.5);
    vA = aSize * 0.55;
    gl_Position = projectionMatrix * mv;
  }
`;

/** Fragment des particules : disque doux, additive blending. */
const FRAG_PART = `
  uniform vec3  uCouleur;
  uniform float uPower;
  varying float vA;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float alpha = (1.0 - d * 2.0) * (0.22 + uPower * 0.6) * vA;
    vec3  col   = mix(vec3(0.40, 0.43, 0.52), uCouleur, uPower);
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Configuration des anneaux (gyroscope / tokamak) ─────────────────────────

interface AnneauConfig {
  readonly rayon: number;
  readonly tube: number;
  /** Rotation Euler de base [x, y, z] en radians. */
  readonly rot: readonly [number, number, number];
  /** Vitesse angulaire autour de Y (rad/s). */
  readonly speed: number;
  /** Délai de démarrage après phase 1, en secondes. */
  readonly delay: number;
}

const ANNEAUX: readonly AnneauConfig[] = [
  { rayon: 1.65, tube: 0.018, rot: [Math.PI / 2, 0, 0],              speed: 0.42,  delay: 0    },
  { rayon: 1.92, tube: 0.014, rot: [Math.PI / 3, Math.PI / 5, 0],   speed: 0.28,  delay: 0.45 },
  { rayon: 2.2,  tube: 0.012, rot: [0, Math.PI / 4, Math.PI / 4.5], speed: 0.17,  delay: 0.9  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CYAN = new Color("#7dd3fc");
const LOOK_AT = new Vector3(0, 0, 0);
const N_ARC_PTS = 10;

/** Point aléatoire sur une sphère de rayon r. */
function pointSurSphere(r: number): [number, number, number] {
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)];
}

/**
 * Génère un chemin d'arc électrique entre deux points de surface.
 * La perturbation est nulle aux extrémités (sin(t·π)) pour un rendu propre.
 */
function genererArc(): Float32Array {
  const a = pointSurSphere(1.28);
  const b = pointSurSphere(1.28);
  const pts = new Float32Array(N_ARC_PTS * 3);
  for (let i = 0; i < N_ARC_PTS; i++) {
    const t = i / (N_ARC_PTS - 1);
    const j = Math.sin(t * Math.PI) * 0.38;
    pts[i * 3]     = a[0] + (b[0] - a[0]) * t + (Math.random() - 0.5) * j;
    pts[i * 3 + 1] = a[1] + (b[1] - a[1]) * t + (Math.random() - 0.5) * j;
    pts[i * 3 + 2] = a[2] + (b[2] - a[2]) * t + (Math.random() - 0.5) * j;
  }
  return pts;
}

// ─── Composant de contenu (à l'intérieur du Canvas) ──────────────────────────

function Contenu({ phase, paused, isMobile, onPhase3 }: SceneCoeurQuantiqueProps) {
  useThree(); // force le contexte WebGL

  // ── Refs d'état d'animation (pas de React state → pas de re-render) ────────
  const powerRef      = useRef(0);
  const attrRef       = useRef(0);
  const prevPhase     = useRef(-1);
  const phaseStart    = useRef(0);
  const phase3Called  = useRef(false);

  // RGAA 13.7 : délai minimal entre arcs (333 ms → 3/s max)
  const arcLastFire   = useRef(-999);
  // Délai aléatoire pour l'ambiance (phase 3)
  const arcNextDelay  = useRef(2.5);

  // ── Noyau (ShaderMaterial bruit + Fresnel) ─────────────────────────────────
  const noyauGeo = useMemo(() => new SphereGeometry(1, 32, 24), []);
  const noyauMat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uPower:   { value: 0 },
          uCouleur: { value: CYAN.clone() },
        },
        vertexShader:   VERT_NOYAU,
        fragmentShader: FRAG_NOYAU,
        transparent:    true,
        depthWrite:     false,
      }),
    [],
  );

  // ── Anneaux ────────────────────────────────────────────────────────────────
  const anneauGeos = useMemo(
    () => ANNEAUX.map((a) => new TorusGeometry(a.rayon, a.tube, 8, 96)),
    [],
  );
  const anneauMats = useMemo(
    () =>
      ANNEAUX.map(
        () =>
          new MeshBasicMaterial({
            color:    CYAN,
            blending: AdditiveBlending,
            transparent: true,
            opacity:  0,
            depthWrite: false,
          }),
      ),
    [],
  );
  const groupRefs = useRef<(Group | null)[]>([null, null, null]);

  // ── Particules ─────────────────────────────────────────────────────────────
  const N_PART = isMobile ? 320 : 1600;
  const partGeo = useMemo(() => {
    const pos   = new Float32Array(N_PART * 3); // placeholder (calculé en shader)
    const sizes = new Float32Array(N_PART);
    const phs   = new Float32Array(N_PART);
    const orbs  = new Float32Array(N_PART * 3);
    for (let i = 0; i < N_PART; i++) {
      sizes[i]        = 0.55 + Math.random() * 1.15;
      phs[i]          = Math.random() * Math.PI * 2;
      orbs[i * 3]     = 1.5  + Math.random() * 2.4;  // rayon
      orbs[i * 3 + 1] = (Math.random() - 0.5) * Math.PI; // inclinaison
      orbs[i * 3 + 2] = 0.25 + Math.random() * 1.3;  // vitesse relative
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos,   3));
    g.setAttribute("aSize",    new BufferAttribute(sizes, 1));
    g.setAttribute("aPh",      new BufferAttribute(phs,   1));
    g.setAttribute("aOrb",     new BufferAttribute(orbs,  3));
    return g;
  }, [N_PART]);

  const partMat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime:    { value: 0 },
          uAttr:    { value: 0 },
          uPower:   { value: 0 },
          uCouleur: { value: CYAN.clone() },
        },
        vertexShader:   VERT_PART,
        fragmentShader: FRAG_PART,
        transparent:    true,
        depthWrite:     false,
        blending:       AdditiveBlending,
      }),
    [],
  );

  // ── Arcs électriques (désactivés sur mobile) ───────────────────────────────
  const N_ARCS = isMobile ? 0 : 2;
  const arcGeos = useMemo(
    () =>
      Array.from({ length: N_ARCS }, () => {
        const g = new BufferGeometry();
        g.setAttribute("position", new BufferAttribute(new Float32Array(N_ARC_PTS * 3), 3));
        return g;
      }),
    [N_ARCS],
  );
  const arcMats = useMemo(
    () =>
      Array.from(
        { length: N_ARCS },
        () =>
          new LineBasicMaterial({
            color:       CYAN,
            blending:    AdditiveBlending,
            transparent: true,
            opacity:     0,
            depthWrite:  false,
          }),
      ),
    [N_ARCS],
  );
  const arcLines = useMemo(
    () => arcGeos.map((g, i) => new Line(g, arcMats[i])),
    [arcGeos, arcMats],
  );
  // Timestamps de dernier tir de chaque arc (-1 = inactif)
  const arcTimers = useRef<number[]>(Array.from({ length: N_ARCS }, () => -1));

  // ── Halo (sprite + texture canvas, aucun fetch réseau) ────────────────────
  const haloTex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0,    "rgba(125,211,252,0.88)");
    g.addColorStop(0.22, "rgba(125,211,252,0.38)");
    g.addColorStop(0.55, "rgba(56,189,248,0.08)");
    g.addColorStop(1,    "rgba(125,211,252,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new CanvasTexture(canvas);
  }, []);

  const haloMat = useMemo(
    () =>
      new SpriteMaterial({
        map:         haloTex,
        blending:    AdditiveBlending,
        transparent: true,
        opacity:     0,
        depthWrite:  false,
      }),
    [haloTex],
  );
  const haloRef = useRef<Sprite>(null);

  // ── Caméra ─────────────────────────────────────────────────────────────────
  const camTarget = useRef(new Vector3(0, 1.5, 8));

  // ── Nettoyage au démontage (la planche remonte le hero à chaque « Rejouer ») ─
  useEffect(() => {
    return () => {
      noyauGeo.dispose();
      noyauMat.dispose();
      anneauGeos.forEach((g) => g.dispose());
      anneauMats.forEach((m) => m.dispose());
      partGeo.dispose();
      partMat.dispose();
      arcGeos.forEach((g) => g.dispose());
      arcMats.forEach((m) => m.dispose());
      haloTex.dispose();
      haloMat.dispose();
    };
  }, [noyauGeo, noyauMat, anneauGeos, anneauMats, partGeo, partMat, arcGeos, arcMats, haloTex, haloMat]);

  // ── Boucle d'animation ─────────────────────────────────────────────────────
  useFrame((state) => {
    /* Maintien du rendu (frameloop="demand") — arrêt automatique quand paused */
    if (!paused) state.invalidate();

    const t = state.clock.getElapsedTime();

    /* Détection du changement de phase */
    if (prevPhase.current !== phase) {
      phaseStart.current = t;
      if (phase === 2) {
        phase3Called.current  = false;
        arcNextDelay.current  = 0.38; // arcs rapides pendant l'allumage
      }
      if (phase === 3) {
        arcNextDelay.current = 2.5 + Math.random() * 2;
      }
      prevPhase.current = phase;
    }

    const elapsed = t - phaseStart.current;

    /* ── Puissance ─────────────────────────────────────────────────────────── */
    if (phase === 0) {
      powerRef.current = Math.max(0, powerRef.current - 0.004);
      attrRef.current  = 0;
    } else if (phase === 1) {
      powerRef.current = Math.min(0.78, elapsed / 1.9);
      attrRef.current  = Math.min(0.68, elapsed / 2.4);
    } else if (phase === 2) {
      powerRef.current = Math.min(1.0, 0.78 + (elapsed / 0.85) * 0.22);
      attrRef.current  = Math.min(0.94, 0.68 + elapsed * 0.16);
      if (elapsed > 1.1 && !phase3Called.current) {
        phase3Called.current = true;
        onPhase3();
      }
    } else {
      /* Phase 3 : respiration lente */
      powerRef.current = 0.82 + 0.1 * Math.sin(t * 1.15);
      attrRef.current  = Math.max(0, attrRef.current - 0.0008);
    }

    const power = powerRef.current;
    const attr  = attrRef.current;

    /* ── Noyau ────────────────────────────────────────────────────────────── */
    noyauMat.uniforms.uTime.value  = t;
    noyauMat.uniforms.uPower.value = power;

    /* ── Halo ─────────────────────────────────────────────────────────────── */
    if (haloRef.current) {
      const s = 1.1 + power * 3.0;
      haloRef.current.scale.setScalar(s);
      haloMat.opacity = power * 0.55;
    }

    /* ── Anneaux ──────────────────────────────────────────────────────────── */
    ANNEAUX.forEach((cfg, i) => {
      const grp = groupRefs.current[i];
      if (!grp) return;
      const localE = Math.max(0, elapsed - cfg.delay);
      const rPow   = phase >= 1 ? Math.min(1, localE / 0.9) : 0;
      anneauMats[i].opacity = rPow * power * 0.75;
      if (phase >= 1 && !paused && localE > 0) {
        grp.rotation.y += cfg.speed * Math.min(1, localE / 1.3) * 0.016;
      }
    });

    /* ── Particules ───────────────────────────────────────────────────────── */
    partMat.uniforms.uTime.value  = t;
    partMat.uniforms.uAttr.value  = attr;
    partMat.uniforms.uPower.value = power;

    /* ── Arcs électriques (RGAA 13.7 : ≤ 3/s) ────────────────────────────── */
    if (!isMobile && !paused && phase >= 1 && power > 0.25) {
      if (t - arcLastFire.current >= arcNextDelay.current) {
        arcLastFire.current = t;
        /* Délai suivant : rapide en phase 2, rare en phase 3 */
        arcNextDelay.current =
          phase === 2
            ? 0.38 + Math.random() * 0.08           // ~3/s pendant l'allumage
            : 2.8  + Math.random() * 2.4;            // ~1 toutes les 3-5 s en ambiance

        /* Choisir un slot disponible (arc terminé ou jamais utilisé) */
        const slot = arcTimers.current.findIndex((at) => at < 0 || t - at > 0.28);
        if (slot >= 0) {
          arcTimers.current[slot] = t;
          const pts = genererArc();
          const posAttr = arcGeos[slot]?.attributes["position"] as BufferAttribute | undefined;
          if (posAttr) {
            (posAttr.array as Float32Array).set(pts);
            posAttr.needsUpdate = true;
          }
        }
      }

      /* Opacité des arcs selon leur âge (fondu entrant + sortant) */
      for (let i = 0; i < N_ARCS; i++) {
        const at = arcTimers.current[i];
        if (at < 0) {
          arcMats[i].opacity = 0;
          continue;
        }
        const age = t - at;
        if (age <= 0.06) {
          arcMats[i].opacity = (age / 0.06) * 0.52 * power;
        } else if (age <= 0.18) {
          arcMats[i].opacity = 0.52 * power;
        } else if (age <= 0.28) {
          arcMats[i].opacity = 0.52 * power * (1 - (age - 0.18) / 0.1);
        } else {
          arcMats[i].opacity   = 0;
          arcTimers.current[i] = -1;
        }
      }
    }

    /* ── Caméra : plongée lente vers le noyau en phase 2-3 ───────────────── */
    if (phase <= 1) {
      camTarget.current.set(0, 1.5, 8);
    } else if (phase === 2) {
      const prog = Math.min(1, elapsed / 1.6);
      camTarget.current.set(0, 1.5 - prog * 1.0, 8 - prog * 2.6);
    } else {
      camTarget.current.set(0, 0.5, 5.4);
    }
    state.camera.position.lerp(camTarget.current, 0.022);
    state.camera.lookAt(LOOK_AT);
  });

  return (
    <>
      {/* Noyau lumineux instable */}
      <mesh geometry={noyauGeo} material={noyauMat} />

      {/* Halo émanant du noyau */}
      <sprite ref={haloRef as React.RefObject<Sprite>} material={haloMat} />

      {/* Anneaux de confinement concentriques inclinés */}
      {ANNEAUX.map((cfg, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          rotation={[cfg.rot[0], cfg.rot[1], cfg.rot[2]]}
        >
          <mesh geometry={anneauGeos[i]} material={anneauMats[i]} />
        </group>
      ))}

      {/* Nuage de particules en orbite */}
      <points geometry={partGeo} material={partMat} />

      {/* Arcs électriques (jusqu'à 2 simultanés, absents sur mobile) */}
      {arcLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}

// ─── Composant principal exporté ──────────────────────────────────────────────

/**
 * Wrapper Canvas : charge le moteur WebGL, plafonne le dpr, gère le frameloop.
 * Exporté comme dépendance dynamique (ssr: false) de HeroCoeurQuantique.
 */
export function SceneCoeurQuantique(props: SceneCoeurQuantiqueProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 45, near: 0.1, far: 100 }}
      dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1}
      frameloop="demand"
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Contenu {...props} />
    </Canvas>
  );
}
