/**
 * Globe Console : moteur three.js.
 *
 * Chargé à la demande par `GlobeScene` (import dynamique quand le bloc
 * approche de l'écran) : ni three.js ni le semis des terres n'entrent dans le
 * paquet initial de la page.
 *
 * Scène, du fond vers l'avant :
 * - corps du globe, sombre et un peu transparent, liseré de Fresnel au bord ;
 * - atmosphère : une coque arrière plus large, lumineuse contre le limbe ;
 * - points flottants autour du globe ;
 * - semis des terres (plus petits et plus sombres vers le bord) ;
 * - pics : fines barres verticales dressées sur les terres ;
 * - repère de Toulon (anneau, point, onde au départ d'une transmission) ;
 * - deux courbes orange, pleine et pointillée, du repère au triangle hors du
 *   globe, parcourues par un trait lumineux en boucle ;
 * - triangle pointe en bas, fixe dans l'espace, qui s'allume à l'arrivée.
 *
 * Les courbes et les barres sont des rubans tracés en pixels d'écran par le
 * shader (une ligne WebGL ne fait qu'un pixel physique, trop fin à 2x).
 * Toutes les couleurs sont passées en sRGB sans conversion : le rendu reste
 * celui des jetons du système.
 */

import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

import {
  CORPS_GLOBE,
  DUREE_TRAJET,
  NEON,
  NEON_VIF,
  ORANGE_REPERE,
  PERIODE_ROTATION,
  PERIODE_TRANSMISSION,
  TOULON,
} from "./constantes";
import { creerAlea, decoderAnneaux, distanceCamera, versVecteur } from "./geometrie";
import donnees from "./points-terre.json";

/* ------------------------------------------------------------------ */
/* Réglages de la scène                                                */
/* ------------------------------------------------------------------ */

const FOV = 30;
/** Rayon apparent du globe : part de la demi-hauteur, puis de la demi-largeur. */
const PART_HAUTEUR = 0.74;
const PART_LARGEUR = 0.64;
/** Latitude tournée vers l'observateur : l'Europe de face. */
const LATITUDE_VUE = 24;
/** Toulon part un peu à gauche du centre, la courbe traverse le disque. */
const ECART_TOULON = 14;
/** Repère hors du globe, fixe dans l'espace, en haut à droite (rayon = 1). */
const POSITION_TRIANGLE = new Vector3(1.3, 0.86, 0.32);
/** Écart en degrés entre deux points du semis, pour la taille des points. */
const PAS_RAD = (donnees.pas * Math.PI) / 180;
const RAYON_HALO = 1.1;
const NB_PICS = 40;
const NB_FLOTTANTS = 240;
const SEGMENTS_COURBE = 96;
const MARGE_INCLINAISON = 0.45;

const DEG = Math.PI / 180;

/** Couleur hexadécimale vers composantes sRGB, sans gestion de couleur. */
function rvb(hex: string): Vector3 {
  const n = Number.parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const VERTEX_SURFACE = /* glsl */ `
varying vec3 vNormale;
varying vec3 vPosition;
void main() {
  vec4 pm = modelMatrix * vec4(position, 1.0);
  vPosition = pm.xyz;
  vNormale = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * pm;
}`;

/** Corps du globe : sombre, un peu transparent, liseré de Fresnel. */
const FRAGMENT_CORPS = /* glsl */ `
uniform vec3 uCorps;
uniform vec3 uLueur;
varying vec3 vNormale;
varying vec3 vPosition;
void main() {
  vec3 v = normalize(cameraPosition - vPosition);
  float f = clamp(dot(normalize(vNormale), v), 0.0, 1.0);
  float bord = 1.0 - f;
  vec3 c = uCorps * (0.7 + 0.5 * f) + uLueur * (0.16 * pow(bord, 2.0) + 0.9 * pow(bord, 8.0));
  float a = mix(0.88, 1.0, pow(bord, 3.0));
  gl_FragColor = vec4(c * a, a);
}`;

/** Atmosphère : coque arrière, lumineuse contre le limbe, nulle au bord. */
const FRAGMENT_HALO = /* glsl */ `
uniform vec3 uLueur;
uniform float uSeuil;
varying vec3 vNormale;
varying vec3 vPosition;
void main() {
  vec3 v = normalize(cameraPosition - vPosition);
  float f = -dot(normalize(vNormale), v);
  float i = pow(clamp(f / uSeuil, 0.0, 1.0), 3.0) * 0.55;
  gl_FragColor = vec4(uLueur * i, i);
}`;

const VERTEX_TERRES = /* glsl */ `
attribute float aEclat;
uniform float uTaille;
varying float vFace;
varying float vEclat;
void main() {
  vec4 pm = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * position);
  vFace = dot(n, normalize(cameraPosition - pm.xyz));
  vEclat = aEclat;
  float avant = smoothstep(0.0, 0.6, vFace);
  float taille = vFace < 0.0 ? 0.55 : mix(0.4, 1.0, avant);
  gl_PointSize = uTaille * taille * (aEclat > 1.0 ? 1.3 : 1.0);
  gl_Position = projectionMatrix * viewMatrix * pm;
}`;

const FRAGMENT_TERRES = /* glsl */ `
uniform vec3 uCouleur;
varying float vFace;
varying float vEclat;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float disque = smoothstep(0.5, 0.15, d);
  float a = vFace < 0.0
    ? 0.06
    : mix(0.12, 1.0, smoothstep(0.0, 0.55, vFace)) * min(vEclat, 1.0);
  vec3 c = vEclat > 1.0 ? mix(uCouleur, vec3(0.93, 0.98, 1.0), 0.55) : uCouleur;
  a *= disque;
  gl_FragColor = vec4(c * a, a);
}`;

/** Pics : ruban d'écran vertical posé sur la surface, décalé en pixels. */
const VERTEX_PICS = /* glsl */ `
attribute float aFin;
attribute float aCote;
attribute float aHauteur;
attribute float aPhase;
uniform float uTemps;
uniform float uAnime;
uniform vec2 uResolution;
uniform float uLargeur;
varying float vFin;
varying float vCote;
varying float vFace;
void main() {
  float h = aHauteur * (1.0 - uAnime * 0.35 * (0.5 + 0.5 * sin(uTemps * 0.6 + aPhase)));
  vec3 n = normalize(mat3(modelMatrix) * position);
  vec4 base = modelMatrix * vec4(position * 1.003, 1.0);
  vec4 haut = base + vec4(0.0, h, 0.0, 0.0);
  vFace = dot(n, normalize(cameraPosition - base.xyz));
  vec4 cb = projectionMatrix * viewMatrix * base;
  vec4 ch = projectionMatrix * viewMatrix * haut;
  vec2 dir = (ch.xy / ch.w - cb.xy / cb.w) * uResolution;
  float l = length(dir);
  dir = l > 1e-4 ? dir / l : vec2(0.0, 1.0);
  vec4 c = aFin > 0.5 ? ch : cb;
  c.xy += vec2(-dir.y, dir.x) * aCote * uLargeur / uResolution * c.w;
  vFin = aFin;
  vCote = aCote;
  gl_Position = c;
}`;

const FRAGMENT_PICS = /* glsl */ `
uniform vec3 uCouleur;
varying float vFin;
varying float vCote;
varying float vFace;
void main() {
  float travers = 1.0 - smoothstep(0.25, 1.0, abs(vCote));
  float a = travers * mix(1.0, 0.3, vFin) * smoothstep(-0.12, 0.25, vFace) * 0.95;
  gl_FragColor = vec4(uCouleur * a, a);
}`;

const VERTEX_FLOTTANTS = /* glsl */ `
attribute float aTaille;
attribute float aPhase;
attribute float aEclat;
uniform float uTemps;
uniform float uAnime;
uniform float uEchelle;
varying float vA;
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_PointSize = aTaille * uEchelle;
  float scintille = 1.0 - uAnime * 0.5 * (0.5 + 0.5 * sin(uTemps * (0.5 + aPhase * 0.4) + aPhase * 6.2832));
  vA = aEclat * scintille;
}`;

const FRAGMENT_FLOTTANTS = /* glsl */ `
uniform vec3 uCouleur;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = pow(1.0 - d * 2.0, 1.8) * vA;
  vec3 c = mix(uCouleur, vec3(0.9, 0.97, 1.0), smoothstep(0.7, 1.0, vA));
  gl_FragColor = vec4(c * a, a);
}`;

/** Sprite d'un point fixé à la surface ou dans l'espace. */
const VERTEX_SPRITE = /* glsl */ `
uniform float uTaille;
varying float vFace;
void main() {
  vec4 pm = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(pm.xyz);
  vFace = dot(n, normalize(cameraPosition - pm.xyz));
  gl_PointSize = uTaille;
  gl_Position = projectionMatrix * viewMatrix * pm;
}`;

/** Repère : anneau fin, point central, onde au départ (distances en px CSS). */
const FRAGMENT_REPERE = /* glsl */ `
uniform vec3 uCouleur;
uniform float uTaille;
uniform float uPx;
uniform float uOnde;
varying float vFace;
void main() {
  float r = length(gl_PointCoord - 0.5) * uTaille / uPx;
  float anneau = 1.0 - smoothstep(0.5, 1.3, abs(r - 7.0));
  float centre = 1.0 - smoothstep(1.7, 2.7, r);
  float lueur = exp(-r * 0.32) * 0.35;
  float onde = 0.0;
  if (uOnde >= 0.0) {
    float ro = mix(3.0, 15.0, uOnde);
    onde = (1.0 - smoothstep(0.4, 1.3, abs(r - ro))) * (1.0 - uOnde) * 0.8;
  }
  float a = clamp(anneau + centre + lueur + onde, 0.0, 1.0) * smoothstep(-0.05, 0.25, vFace);
  gl_FragColor = vec4(uCouleur * a, a);
}`;

/**
 * Triangle pointe en bas (distance signée d'un triangle équilatéral).
 * L'axe y de gl_PointCoord descend : le sommet « haut » de la formule
 * tombe donc en bas de l'écran. L'intérieur, sombre, masque l'arrivée
 * des courbes.
 */
const FRAGMENT_TRIANGLE = /* glsl */ `
uniform vec3 uCouleur;
uniform float uTaille;
uniform float uPx;
uniform float uEclair;
float triangle(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
void main() {
  vec2 p = (gl_PointCoord - 0.5) * uTaille / uPx;
  float d = triangle(p, 9.0);
  float trait = 1.0 - smoothstep(0.5, 1.4, abs(d));
  float dedans = 1.0 - smoothstep(-0.6, 0.4, d);
  float lueur = exp(-max(d, 0.0) * 0.42) * 0.28 * (1.0 + uEclair * 2.2);
  vec3 c = uCouleur * (trait * (1.0 + uEclair * 0.8) + lueur + dedans * (0.1 + uEclair * 0.25));
  float a = clamp(max(trait, dedans * 0.92) + lueur, 0.0, 1.0);
  gl_FragColor = vec4(c, a);
}`;

/** Courbe de Bézier cubique tracée en ruban d'écran, calculée par le shader. */
const VERTEX_COURBE = /* glsl */ `
uniform vec3 uP0;
uniform vec3 uP1;
uniform vec3 uP2;
uniform vec3 uP3;
uniform vec2 uResolution;
uniform float uLargeur;
varying float vT;
varying float vCote;
vec3 bezier(float t) {
  float u = 1.0 - t;
  return u * u * u * uP0 + 3.0 * u * u * t * uP1 + 3.0 * u * t * t * uP2 + t * t * t * uP3;
}
vec4 projeter(vec3 p) { return projectionMatrix * viewMatrix * vec4(p, 1.0); }
void main() {
  float t = position.x;
  vec4 c = projeter(bezier(t));
  vec4 a = projeter(bezier(max(t - 0.01, 0.0)));
  vec4 b = projeter(bezier(min(t + 0.01, 1.0)));
  vec2 dir = (b.xy / b.w - a.xy / a.w) * uResolution;
  float l = length(dir);
  dir = l > 1e-5 ? dir / l : vec2(1.0, 0.0);
  c.xy += vec2(-dir.y, dir.x) * position.y * uLargeur / uResolution * c.w;
  vT = t;
  vCote = position.y;
  gl_Position = c;
}`;

const FRAGMENT_COURBE = /* glsl */ `
uniform vec3 uCouleur;
uniform float uProgres;
uniform float uTirets;
uniform float uOpacite;
uniform float uCoeur;
varying float vT;
varying float vCote;
void main() {
  float x = abs(vCote);
  float coeur = 1.0 - smoothstep(uCoeur, uCoeur + 0.25, x);
  float halo = pow(1.0 - x, 2.0) * 0.26;
  float tiret = uTirets > 0.0 ? step(fract(vT * uTirets), 0.5) : 1.0;
  float dt = uProgres - vT;
  float queue = dt >= 0.0 ? exp(-dt * 10.0) : 0.0;
  float tete = exp(-pow(dt * 50.0, 2.0));
  float i = (coeur * (0.72 + queue * 1.2 + tete * 1.6) + halo * (1.0 + queue * 2.4) + tete * pow(1.0 - x, 1.5) * 1.1) * tiret;
  /* Addition sans plafond sur la couleur : le trait chauffe vers le jaune pâle. */
  float a = clamp(i, 0.0, 1.0) * uOpacite;
  gl_FragColor = vec4(uCouleur * i * uOpacite, a);
}`;

/* ------------------------------------------------------------------ */
/* Construction                                                        */
/* ------------------------------------------------------------------ */

/** Matériau des couches lumineuses : additif, prémultiplié, sans profondeur écrite. */
function materiau(vertexShader: string, fragmentShader: string, uniforms: ShaderMaterial["uniforms"], profondeur: boolean): ShaderMaterial {
  const m = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: profondeur,
    blending: AdditiveBlending,
  });
  m.premultipliedAlpha = true;
  return m;
}

/** Géométrie d'un seul point, pour les sprites (repère, triangle). */
function unPoint(x: number, y: number, z: number): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array([x, y, z]), 3));
  return g;
}

/** Ruban de la courbe : deux sommets par pas, position = (t, côté, 0). */
function rubanCourbe(): BufferGeometry {
  const n = SEGMENTS_COURBE;
  const positions = new Float32Array((n + 1) * 2 * 3);
  const indices: number[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    positions.set([t, -1, 0, t, 1, 0], i * 6);
    if (i < n) {
      const a = i * 2;
      /* Sens trigonométrique à l'écran : faces avant, rien d'élagué. */
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(positions, 3));
  g.setIndex(indices);
  return g;
}

export interface MoteurGlobe {
  /** Le bloc est à l'écran et l'onglet visible : la boucle peut tourner. */
  activer(actif: boolean): void;
  /** Mouvement réduit : image fixe, courbes pleines, aucune boucle. */
  definirMouvementReduit(reduit: boolean): void;
  /** Relit la taille du conteneur. */
  redimensionner(): void;
  /** Arrête tout et libère la mémoire WebGL. */
  detruire(): void;
}

/**
 * Crée la scène dans `conteneur` (le canvas y est ajouté puis retiré à la
 * destruction). Lève une erreur si WebGL est indisponible.
 */
export function creerMoteur(conteneur: HTMLElement, reduitInitial: boolean): MoteurGlobe {
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new WebGLRenderer({
    alpha: true,
    premultipliedAlpha: true,
    /* À 2x, le lissage matériel coûte sans rien apporter de visible. */
    antialias: dpr() < 2,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    display: "block",
    /* Le défilement vertical de la page reste au navigateur. */
    touchAction: "pan-y",
    cursor: "grab",
  });
  conteneur.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  const resolution = new Vector2(1, 1);

  const cyan = rvb(NEON);
  const lueur = rvb(NEON_VIF);
  const orange = rvb(ORANGE_REPERE);

  /* Inclinaison (vers l'observateur) puis rotation sur l'axe des pôles. */
  const inclinaison = new Group();
  const rotation = new Group();
  const rotationFlottants = new Group();
  inclinaison.add(rotation, rotationFlottants);
  scene.add(inclinaison);

  /* Corps du globe. */
  const corps = new Mesh(
    new SphereGeometry(1, 96, 64),
    new ShaderMaterial({
      vertexShader: VERTEX_SURFACE,
      fragmentShader: FRAGMENT_CORPS,
      uniforms: { uCorps: { value: rvb(CORPS_GLOBE) }, uLueur: { value: lueur } },
      transparent: true,
      blending: NormalBlending,
    }),
  );
  (corps.material as ShaderMaterial).premultipliedAlpha = true;
  corps.renderOrder = 0;
  rotation.add(corps);

  /* Atmosphère. */
  const halo = new Mesh(
    new SphereGeometry(RAYON_HALO, 96, 64),
    materiau(VERTEX_SURFACE, FRAGMENT_HALO, { uLueur: { value: lueur }, uSeuil: { value: Math.sqrt(1 - 1 / (RAYON_HALO * RAYON_HALO)) } }, true),
  );
  (halo.material as ShaderMaterial).side = BackSide;
  halo.renderOrder = 1;
  scene.add(halo);

  /* Semis des terres : quelques points plus lumineux, tirés à graine fixe. */
  const vecteursTerre = decoderAnneaux(donnees.anneaux);
  const nbTerre = vecteursTerre.length / 3;
  const alea = creerAlea(11);
  const eclats = new Float32Array(nbTerre);
  for (let i = 0; i < nbTerre; i += 1) eclats[i] = alea() < 0.05 ? 1.4 : 0.5 + 0.4 * alea();
  const geoTerres = new BufferGeometry();
  geoTerres.setAttribute("position", new BufferAttribute(vecteursTerre, 3));
  geoTerres.setAttribute("aEclat", new BufferAttribute(eclats, 1));
  const uniformesTerres = { uTaille: { value: 2 }, uCouleur: { value: cyan } };
  const terres = new Points(geoTerres, materiau(VERTEX_TERRES, FRAGMENT_TERRES, uniformesTerres, false));
  terres.renderOrder = 3;
  rotation.add(terres);

  /* Pics : barres verticales sur des points de terre tirés à graine fixe. */
  const aleaPics = creerAlea(23);
  const pos: number[] = [];
  const fin: number[] = [];
  const cote: number[] = [];
  const hauteur: number[] = [];
  const phase: number[] = [];
  const indicesPics: number[] = [];
  for (let b = 0; b < NB_PICS; b += 1) {
    const k = Math.floor(aleaPics() * nbTerre) * 3;
    const h = b < 5 ? 0.17 + 0.09 * aleaPics() : 0.03 + 0.11 * aleaPics() ** 2;
    const ph = aleaPics() * Math.PI * 2;
    const premier = b * 4;
    for (let s = 0; s < 4; s += 1) {
      pos.push(vecteursTerre[k], vecteursTerre[k + 1], vecteursTerre[k + 2]);
      fin.push(s < 2 ? 0 : 1);
      cote.push(s % 2 === 0 ? -1 : 1);
      hauteur.push(h);
      phase.push(ph);
    }
    indicesPics.push(premier, premier + 2, premier + 1, premier + 1, premier + 2, premier + 3);
  }
  const geoPics = new BufferGeometry();
  geoPics.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  geoPics.setAttribute("aFin", new BufferAttribute(new Float32Array(fin), 1));
  geoPics.setAttribute("aCote", new BufferAttribute(new Float32Array(cote), 1));
  geoPics.setAttribute("aHauteur", new BufferAttribute(new Float32Array(hauteur), 1));
  geoPics.setAttribute("aPhase", new BufferAttribute(new Float32Array(phase), 1));
  geoPics.setIndex(indicesPics);
  const uniformesPics = {
    uTemps: { value: 0 },
    uAnime: { value: 1 },
    uResolution: { value: resolution },
    uLargeur: { value: 2 },
    uCouleur: { value: cyan },
  };
  const pics = new Mesh(geoPics, materiau(VERTEX_PICS, FRAGMENT_PICS, uniformesPics, true));
  pics.renderOrder = 4;
  pics.frustumCulled = false;
  rotation.add(pics);

  /* Points flottants dans l'espace proche. */
  const aleaFlottants = creerAlea(37);
  const posF = new Float32Array(NB_FLOTTANTS * 3);
  const tailleF = new Float32Array(NB_FLOTTANTS);
  const phaseF = new Float32Array(NB_FLOTTANTS);
  const eclatF = new Float32Array(NB_FLOTTANTS);
  for (let i = 0; i < NB_FLOTTANTS; i += 1) {
    const z = aleaFlottants() * 2 - 1;
    const theta = aleaFlottants() * Math.PI * 2;
    const r = 1.06 + 0.55 * aleaFlottants() ** 1.6;
    const s = Math.sqrt(1 - z * z);
    posF.set([r * s * Math.cos(theta), r * z, r * s * Math.sin(theta)], i * 3);
    const vif = aleaFlottants() < 0.08;
    tailleF[i] = vif ? 4.8 : 2 + 1.6 * aleaFlottants();
    eclatF[i] = vif ? 1 : 0.4 + 0.45 * aleaFlottants();
    phaseF[i] = aleaFlottants();
  }
  const geoFlottants = new BufferGeometry();
  geoFlottants.setAttribute("position", new BufferAttribute(posF, 3));
  geoFlottants.setAttribute("aTaille", new BufferAttribute(tailleF, 1));
  geoFlottants.setAttribute("aPhase", new BufferAttribute(phaseF, 1));
  geoFlottants.setAttribute("aEclat", new BufferAttribute(eclatF, 1));
  const uniformesFlottants = { uTemps: { value: 0 }, uAnime: { value: 1 }, uEchelle: { value: 1 }, uCouleur: { value: cyan } };
  const flottants = new Points(geoFlottants, materiau(VERTEX_FLOTTANTS, FRAGMENT_FLOTTANTS, uniformesFlottants, true));
  flottants.renderOrder = 2;
  rotationFlottants.add(flottants);

  /* Repère de Toulon. */
  const [tx, ty, tz] = versVecteur(TOULON.lat, TOULON.lon);
  const toulonLocal = new Vector3(tx, ty, tz).multiplyScalar(1.004);
  const uniformesRepere = { uCouleur: { value: orange }, uTaille: { value: 34 }, uPx: { value: 1 }, uOnde: { value: -1 } };
  const repere = new Points(unPoint(toulonLocal.x, toulonLocal.y, toulonLocal.z), materiau(VERTEX_SPRITE, FRAGMENT_REPERE, uniformesRepere, false));
  repere.renderOrder = 5;
  repere.frustumCulled = false;
  rotation.add(repere);

  /* Courbes : pleine, puis pointillée parallèle. */
  const geoCourbe = rubanCourbe();
  const creerCourbe = (tirets: number) => {
    const uniformes = {
      uP0: { value: new Vector3() },
      uP1: { value: new Vector3() },
      uP2: { value: new Vector3() },
      uP3: { value: new Vector3() },
      uResolution: { value: resolution },
      uLargeur: { value: 7 },
      uCouleur: { value: orange },
      uProgres: { value: -10 },
      uTirets: { value: tirets },
      uOpacite: { value: 1 },
      uCoeur: { value: 0.22 },
    };
    const courbe = new Mesh(geoCourbe, materiau(VERTEX_COURBE, FRAGMENT_COURBE, uniformes, true));
    courbe.renderOrder = 6;
    courbe.frustumCulled = false;
    scene.add(courbe);
    return uniformes;
  };
  const courbePleine = creerCourbe(0);
  const courbePointillee = creerCourbe(46);

  /* Triangle hors du globe. */
  const uniformesTriangle = { uCouleur: { value: orange }, uTaille: { value: 34 }, uPx: { value: 1 }, uEclair: { value: 0 } };
  const materiauTriangle = new ShaderMaterial({
    vertexShader: VERTEX_SPRITE,
    fragmentShader: FRAGMENT_TRIANGLE,
    uniforms: uniformesTriangle,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: NormalBlending,
  });
  materiauTriangle.premultipliedAlpha = true;
  const triangle = new Points(unPoint(POSITION_TRIANGLE.x, POSITION_TRIANGLE.y, POSITION_TRIANGLE.z), materiauTriangle);
  triangle.renderOrder = 7;
  triangle.frustumCulled = false;
  scene.add(triangle);

  /* ---------------------------------------------------------------- */
  /* État et image                                                     */
  /* ---------------------------------------------------------------- */

  const inclinaisonBase = LATITUDE_VUE * DEG;
  let rotY = -(TOULON.lon + ECART_TOULON) * DEG;
  let rotX = inclinaisonBase;
  let inertie = 0;
  let temps = 0;
  let reduit = reduitInitial;
  let actif = false;
  let raf = 0;
  let dernier = 0;
  let rayonPx = 200;
  /* Glisser : pointeur suivi, dernière position, vitesse lissée. */
  let glisse = false;
  let pointeur = -1;
  let xPrec = 0;
  let yPrec = 0;
  let tPrec = 0;
  let vitesse = 0;

  const toulonMonde = new Vector3();
  const normale = new Vector3();
  const versCamera = new Vector3();
  const corde = new Vector3();
  const lateral = new Vector3();
  const milieu = new Vector3();

  function placerCourbes(): void {
    toulonMonde.copy(toulonLocal).applyMatrix4(rotation.matrixWorld);
    normale.copy(toulonMonde).normalize();
    versCamera.copy(camera.position).sub(toulonMonde).normalize();
    const face = normale.dot(versCamera);
    const t = Math.min(1, Math.max(0, (face + 0.05) / 0.35));
    const opacite = t * t * (3 - 2 * t);

    const { uP0: p0, uP1: p1, uP2: p2, uP3: p3 } = courbePleine;
    p0.value.copy(toulonMonde);
    p3.value.copy(POSITION_TRIANGLE);
    p1.value.copy(toulonMonde).addScaledVector(normale, 0.5);
    milieu.copy(p1.value).add(p3.value).multiplyScalar(0.5);
    p2.value.copy(p3.value).lerp(p1.value, 0.45).addScaledVector(milieu.normalize(), 0.2);

    /* Parallèle pointillée : décalée dans le plan de l'écran, côté extérieur. */
    corde.copy(p3.value).sub(p0.value);
    lateral.set(-corde.y, corde.x, 0).normalize();
    courbePointillee.uP0.value.copy(p0.value).addScaledVector(normale, 0.01).addScaledVector(lateral, 0.025);
    courbePointillee.uP1.value.copy(p1.value).addScaledVector(lateral, 0.045);
    courbePointillee.uP2.value.copy(p2.value).addScaledVector(lateral, 0.045);
    courbePointillee.uP3.value.copy(p3.value).addScaledVector(lateral, 0.03);

    courbePleine.uOpacite.value = opacite;
    courbePointillee.uOpacite.value = opacite * 0.85;
  }

  function image(dt: number): void {
    const anime = !reduit;
    if (anime) {
      temps += dt;
      if (!glisse) {
        rotY += ((Math.PI * 2) / PERIODE_ROTATION + inertie) * dt;
        inertie *= Math.exp(-dt * 2.5);
        rotX += (inclinaisonBase - rotX) * (1 - Math.exp(-dt * 0.8));
      }
    }
    rotation.rotation.y = rotY;
    rotationFlottants.rotation.y = rotY * 0.55;
    inclinaison.rotation.x = rotX;
    scene.updateMatrixWorld();
    placerCourbes();

    const t = temps % PERIODE_TRANSMISSION;
    const progres = anime ? t / DUREE_TRAJET : -10;
    courbePleine.uProgres.value = progres;
    courbePointillee.uProgres.value = anime ? progres - 0.07 : -10;
    uniformesRepere.uOnde.value = anime && t < 1.2 ? t / 1.2 : -1;
    uniformesTriangle.uEclair.value = anime && t >= DUREE_TRAJET ? Math.exp(-(t - DUREE_TRAJET) * 3.5) : 0;
    uniformesPics.uTemps.value = temps;
    uniformesPics.uAnime.value = anime ? 1 : 0;
    uniformesFlottants.uTemps.value = temps;
    uniformesFlottants.uAnime.value = anime ? 1 : 0;

    renderer.render(scene, camera);
  }

  function boucle(maintenant: number): void {
    raf = requestAnimationFrame(boucle);
    const dt = dernier ? Math.min((maintenant - dernier) / 1000, 0.1) : 0;
    dernier = maintenant;
    image(dt);
  }

  /** Boucle seulement à l'écran, onglet visible, hors mouvement réduit. */
  function appliquer(): void {
    const tourner = actif && !reduit;
    if (tourner && !raf) {
      dernier = 0;
      raf = requestAnimationFrame(boucle);
    } else if (!tourner) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      image(0);
    }
  }

  function redimensionner(): void {
    const largeur = conteneur.clientWidth;
    const hauteurPx = conteneur.clientHeight;
    if (!largeur || !hauteurPx) return;
    const ratio = dpr();
    renderer.setPixelRatio(ratio);
    renderer.setSize(largeur, hauteurPx, false);
    const aspect = largeur / hauteurPx;
    camera.aspect = aspect;
    const distance = distanceCamera(FOV, aspect, PART_HAUTEUR, PART_LARGEUR, 1);
    /* Globe un peu au-dessus du centre : l'étiquette tient en bas. */
    const decalage = (aspect < 1 ? 0.1 : 0.03) * distance * Math.tan((FOV * DEG) / 2);
    camera.position.set(0, -decalage, distance);
    camera.lookAt(0, -decalage, 0);
    camera.updateProjectionMatrix();
    resolution.set(largeur * ratio, hauteurPx * ratio);

    rayonPx = Math.min(PART_HAUTEUR, PART_LARGEUR * aspect) * (hauteurPx / 2);
    uniformesTerres.uTaille.value = Math.min(3.2, Math.max(1.3, rayonPx * PAS_RAD * 0.42)) * ratio;
    uniformesPics.uLargeur.value = 2.2 * ratio;
    uniformesFlottants.uEchelle.value = ratio;
    courbePleine.uLargeur.value = 7 * ratio;
    courbePointillee.uLargeur.value = 6 * ratio;
    uniformesRepere.uTaille.value = 34 * ratio;
    uniformesRepere.uPx.value = ratio;
    uniformesTriangle.uTaille.value = 34 * ratio;
    uniformesTriangle.uPx.value = ratio;
    if (!raf) image(0);
  }

  /* ---------------------------------------------------------------- */
  /* Glisser pour tourner : horizontal au doigt, libre à la souris.    */
  /* Aucune molette ni pincement : ni défilement capturé, ni zoom.     */
  /* ---------------------------------------------------------------- */

  function appui(e: PointerEvent): void {
    if (e.button !== 0) return;
    glisse = true;
    pointeur = e.pointerId;
    xPrec = e.clientX;
    yPrec = e.clientY;
    tPrec = e.timeStamp;
    vitesse = 0;
    inertie = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  }

  function deplacement(e: PointerEvent): void {
    if (!glisse || e.pointerId !== pointeur) return;
    const dx = e.clientX - xPrec;
    const dy = e.clientY - yPrec;
    const dtEvt = Math.max((e.timeStamp - tPrec) / 1000, 1 / 240);
    xPrec = e.clientX;
    yPrec = e.clientY;
    tPrec = e.timeStamp;
    const angle = dx / rayonPx;
    rotY += angle;
    rotX = Math.min(inclinaisonBase + MARGE_INCLINAISON, Math.max(inclinaisonBase - MARGE_INCLINAISON, rotX + dy / rayonPx));
    vitesse = vitesse * 0.6 + (angle / dtEvt) * 0.4;
    if (!raf) image(0);
  }

  function relache(e: PointerEvent): void {
    if (!glisse || e.pointerId !== pointeur) return;
    glisse = false;
    pointeur = -1;
    inertie = reduit ? 0 : Math.max(-2, Math.min(2, vitesse));
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    canvas.style.cursor = "grab";
  }

  canvas.addEventListener("pointerdown", appui);
  canvas.addEventListener("pointermove", deplacement);
  canvas.addEventListener("pointerup", relache);
  canvas.addEventListener("pointercancel", relache);

  redimensionner();

  return {
    activer(valeur) {
      actif = valeur;
      appliquer();
    },
    definirMouvementReduit(valeur) {
      reduit = valeur;
      if (reduit) inertie = 0;
      appliquer();
    },
    redimensionner,
    detruire() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.removeEventListener("pointerdown", appui);
      canvas.removeEventListener("pointermove", deplacement);
      canvas.removeEventListener("pointerup", relache);
      canvas.removeEventListener("pointercancel", relache);
      scene.traverse((objet) => {
        if (objet instanceof Mesh || objet instanceof Points) {
          objet.geometry.dispose();
          (objet.material as ShaderMaterial).dispose();
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
