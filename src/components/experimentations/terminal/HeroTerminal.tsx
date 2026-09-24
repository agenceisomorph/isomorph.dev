"use client";

/**
 * Hero « Terminal » — l'écran entier est un moniteur qui s'allume.
 *
 * Séquence seconde par seconde :
 *   0-0,2 s   allumage cathodique : ligne blanche qui s'étend du centre
 *   0,2-2,8 s séquence console plein cadre (défilé hexa, barres vertes)
 *   2,8-3,1 s transition : la console glisse vers le haut, le journal apparaît
 *   3,1 s+    état actif : texte visible, cible allumée, journal discret
 *
 * Arbitrages RGAA / éco / perf / sécu :
 * - Éco : canvas 2D à 12 i/s, aucune lib 3D chargée (c'est le plus léger des cinq).
 *   Le canvas s'arrête quand l'onglet est caché ou que l'animation est en pause.
 * - RGAA 13.8 : bouton pause si l'animation dure plus de 5 s (elle boucle indéfiniment).
 *   RGAA 1.1 : scène aria-hidden, texte sémantique h1/h2 toujours dans le DOM.
 *   Focus visible : bord coloré, jamais d'outline (règle ISOMORPH).
 * - Perf : aucun import dynamique, rendu serveur = premier rendu navigateur.
 * - Mouvement réduit : CSS seul — texte immédiatement visible, scène figée.
 *   Jamais de rendu conditionnel sur useReducedMotion() (erreur React 418).
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { Bouton } from "@/components/console/Bouton";
import { CibleCalibrage } from "../commun/CibleCalibrage";
import { SequenceDemarrage } from "../commun/SequenceDemarrage";

// ─── Messages neutres du journal discret ────────────────────────────────────
// Termes techniques purs : jamais une affirmation sur l'agence, jamais de chiffre.
const LIGNES_JOURNAL: readonly string[] = [
  "kernel 6.1.0  [boot OK]",
  "net eth0       [UP]",
  "mem 512M       [OK]",
  "dns resolver   [ready]",
  "tls 1.3        [OK]",
  "pkg 847/847    [loaded]",
  "watchdog       [active]",
  "svc api        [bound]",
  "cache layer    [warm]",
  "metrics        [live]",
];

// ─── Styles embarqués ────────────────────────────────────────────────────────
const STYLES = `
/* Conteneur principal */
.ht {
  position: relative;
  height: 100svh;
  overflow: hidden;
  background: #02060d;
  display: flex;
  align-items: center;
}

/* Canvas hexadécimal en fond */
.ht-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Scanlines CRT — grille de lignes très fines */
.ht-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.11) 3px,
    rgba(0, 0, 0, 0.11) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* Vignette phosphore — bords sombres + léger halo vert */
.ht-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 100% at 50% 50%,
      transparent 40%,
      rgba(0, 6, 3, 0.6) 100%),
    radial-gradient(ellipse 120% 80% at 50% 50%,
      rgba(0, 255, 80, 0.016) 0%,
      transparent 65%);
  pointer-events: none;
  z-index: 1;
}

/* Scintillement phosphore — très subtil, irrégulier */
.ht-flicker {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  animation: ht-flicker 5.3s step-end infinite;
}
@keyframes ht-flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }
  20%, 24%, 55%                      { opacity: 0.88; }
}

/* Allumage cathodique — ligne blanche qui s'étend du centre */
.ht-allumage {
  position: absolute;
  inset: 0;
  background: #dff0ff;
  transform-origin: center center;
  animation: ht-crt 0.24s ease-out forwards;
  z-index: 10;
}
@keyframes ht-crt {
  0%   { transform: scaleX(1) scaleY(0.001); opacity: 1; }
  55%  { transform: scaleX(1) scaleY(1);     opacity: 1; }
  100% { transform: scaleX(1) scaleY(1);     opacity: 0; }
}

/* Séquence plein cadre */
.ht-sequence {
  position: absolute;
  inset: 0;
  z-index: 5;
  transition: transform 0.35s ease-in, opacity 0.35s ease-in;
}
.ht-sequence--sortie {
  transform: translateY(-105%);
  opacity: 0;
}

/* Cible de calibrage
 * >= 1024px : moitié droite, aucun recouvrement avec le bloc texte.
 *   Formule : espace droit = viewport − min(62%, 760px) − 32 px de marge.
 *   La cible est centrée dans cet espace ; sa taille est bornée à 600 px
 *   et à l'espace disponible, garantissant 16 px de dégagement à gauche.
 * < 1024px  : derrière le texte, opacité ≤ 0,25 (très atténuée).
 */
.ht-cible {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  top: 44%;
  left: 50%;
  width: 65vw;
  height: 65vw;
  transform: translate(-50%, -50%);
  opacity: 0.2;
}
@media (min-width: 1024px) {
  .ht-cible {
    /* Espace droit disponible (viewport - colonne texte - 2×16 px de marge) */
    --espace-d: calc(100% - min(62%, 760px) - 32px);
    /* Taille : au plus 600 px, jamais plus que l'espace droit */
    --tc: min(600px, var(--espace-d));
    width: var(--tc);
    height: var(--tc);
    /* Centrage dans la moitié droite */
    left: auto;
    right: calc((100% - min(62%, 760px) - var(--tc)) / 2);
    top: 50%;
    transform: translateY(-50%);
    opacity: 1;
  }
}

/* Colonne de texte — conteneur de la typographie cqi */
.ht-col {
  position: relative;
  z-index: 3;
  width: min(62%, 760px);
  padding: 0 0 0 clamp(24px, 6vw, 112px);
  container-type: inline-size;
  container-name: hcColonneTexte;
  /* Toujours dans le DOM ; CSS gère la transition d'apparition */
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
}
.ht-col--visible {
  opacity: 1;
  transform: translateY(0);
}
@media (max-width: 767px) {
  .ht-col {
    width: 100%;
    padding: 0 24px;
  }
}

/* Étiquette h1 en petites capitales */
.ht-h1 {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  /* Blanc cassé à 72 % sur #02060d ≈ 10:1 (RGAA 4.1.2 critère 3.2, normal) */
  color: rgba(240, 249, 255, 0.72);
  margin: 0 0 0.7em;
}

/* Accroche h2 */
.ht-h2 {
  color: #f0f9ff;
  margin: 0 0 0.45em;
  /* Taille : classe type-hero appliquée sur l'élément */
}

/* Mot « limites » — allumage néon à l'activation */
.ht-neon {
  color: #7dd3fc;
  position: relative;
}
.ht-neon::after {
  content: '';
  position: absolute;
  inset: 0 -3px;
  background: rgba(125, 211, 252, 0);
  border-radius: 1px;
  pointer-events: none;
  transition: background 0.55s ease-out 0.2s;
}
.ht-col--visible .ht-neon::after {
  background: rgba(125, 211, 252, 0.09);
}

/* Chapeau */
.ht-chapeau {
  color: rgba(240, 249, 255, 0.65);
  margin: 0.8em 0 1.6em;
  max-width: 44ch;
}

/* Journal discret — bas-droite */
.ht-journal {
  position: absolute;
  right: clamp(16px, 3.5vw, 64px);
  bottom: clamp(20px, 4vh, 52px);
  width: 230px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.62rem;
  color: rgba(74, 222, 128, 0.42);
  line-height: 1.7;
  z-index: 4;
  opacity: 0;
  transition: opacity 0.5s ease-out 0.1s;
  pointer-events: none;
}
.ht-journal--visible {
  opacity: 1;
}
@media (max-width: 767px) {
  .ht-journal { display: none; }
}

/* Chaque ligne du journal entre en glissant */
.ht-journal-ligne {
  opacity: 0;
  transform: translateX(6px);
  animation: ht-ligne-in 0.28s ease-out forwards;
}
@keyframes ht-ligne-in {
  to { opacity: 1; transform: translateX(0); }
}

/* Curseur — clignote 3 fois, puis reste fixe */
.ht-cursor {
  color: rgba(74, 222, 128, 0.7);
  display: inline-block;
}
.ht-cursor--clignote {
  animation: ht-blink 0.7s step-end 3 forwards;
}
@keyframes ht-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* Bouton pause RGAA 13.8 */
.ht-pause {
  position: absolute;
  bottom: clamp(12px, 2vh, 18px);
  left: clamp(16px, 3.5vw, 64px);
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(125, 211, 252, 0.28);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  z-index: 20;
  border-radius: 2px;
  transition: color 0.2s;
}
.ht-pause:hover {
  color: rgba(125, 211, 252, 0.65);
}
/* focus visible par bord coloré — jamais d'outline */
.ht-pause:focus-visible {
  color: rgba(125, 211, 252, 0.9);
  box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.55);
  outline: none;
}

/* ── Mouvement réduit : état final immédiat, scène figée ─────────────────── */
@media (prefers-reduced-motion: reduce) {
  .ht-allumage                { display: none; }
  .ht-sequence                { display: none; }
  .ht-col                     { opacity: 1; transform: none; transition: none; }
  .ht-journal                 { opacity: 1; transition: none; }
  .ht-journal-ligne           { opacity: 1; transform: none; animation: none; }
  .ht-cursor                  { opacity: 1; animation: none; }
  .ht-flicker                 { animation: none; }
}
`;

// ─── Composant principal ─────────────────────────────────────────────────────

type Phase = "allumage" | "sequence" | "actif";

interface LigneJournal {
  id: number;
  texte: string;
}

export function HeroTerminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const pauseRef = useRef(false);
  const journalCptRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("allumage");
  const [sequenceSortie, setSequenceSortie] = useState(false);
  const [cibleActive, setCibleActive] = useState(false);
  const [pause, setPause] = useState(false);
  const [journal, setJournal] = useState<LigneJournal[]>([]);
  const [cursorClignote, setCursorClignote] = useState(false);

  // ── Phase 1 → 2 : fin de l'allumage cathodique (200 ms) ──────────────────
  useEffect(() => {
    const t = window.setTimeout(() => setPhase("sequence"), 200);
    return () => window.clearTimeout(t);
  }, []);

  // ── Phase 2 → 3 : fin de la séquence console ─────────────────────────────
  const handleSequenceFinie = useCallback(() => {
    // L'animation CSS de sortie (translateY -105%) dure 350 ms
    setSequenceSortie(true);
    window.setTimeout(() => {
      setPhase("actif");
      setCibleActive(true);
    }, 350);
  }, []);

  // ── Journal discret ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "actif") return;

    // Première ligne immédiate
    journalCptRef.current = 1;
    setJournal([{ id: 0, texte: LIGNES_JOURNAL[0] }]);
    setCursorClignote(true);
    // Après 3 clignotements (3 × 0,7 s ≈ 2,1 s), le curseur reste fixe
    const tFixe = window.setTimeout(() => setCursorClignote(false), 2200);

    const t = window.setInterval(() => {
      if (pauseRef.current) return;
      setJournal((prev) => {
        const id = journalCptRef.current++;
        const texte = LIGNES_JOURNAL[id % LIGNES_JOURNAL.length];
        return [...prev.slice(-5), { id, texte }];
      });
    }, 2800);

    return () => {
      window.clearTimeout(tFixe);
      window.clearInterval(t);
    };
  }, [phase]);

  // ── Sync pause ref ────────────────────────────────────────────────────────
  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  // ── Canvas : pluie hexadécimale en parallaxe (canvas 2D, 12 i/s) ─────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    interface Col {
      y: number;
      /** Vitesse de descente (pixels par frame 60 fps) — 3 plans de profondeur */
      v: number;
      /** Opacité du caractère */
      a: number;
    }

    let cols: Col[] = [];

    const init = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const nb = Math.floor(canvas.width / 18);
      cols = Array.from({ length: nb }, (_, i) => {
        const plan = i % 3; // 0 = proche, 1 = milieu, 2 = loin
        return {
          y: Math.random() * canvas.height,
          v: plan === 0 ? 0.55 : plan === 1 ? 0.35 : 0.2,
          a: plan === 0 ? 0.066 : plan === 1 ? 0.04 : 0.022,
        };
      });
    };
    init();

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    let dernierTs = 0;
    const INTERVALLE = 1000 / 12; // 12 i/s

    const frame = (ts: number) => {
      if (document.hidden || pauseRef.current) {
        rafRef.current = window.requestAnimationFrame(frame);
        return;
      }
      const delta = ts - dernierTs;
      if (delta < INTERVALLE) {
        rafRef.current = window.requestAnimationFrame(frame);
        return;
      }
      dernierTs = ts - (delta % INTERVALLE);

      // Traîne phosphore légère
      ctx.fillStyle = "rgba(2, 6, 13, 0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "11px 'Courier New', Courier, monospace";

      const avance = (delta / 16.67); // normalisation à 60 fps
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i];
        const hex = Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase();
        ctx.fillStyle = `rgba(125, 211, 252, ${col.a})`;
        ctx.fillText(hex, i * 18, col.y);
        col.y += col.v * avance;
        if (col.y > canvas.height + 14) col.y = -14;
      }

      rafRef.current = window.requestAnimationFrame(frame);
    };

    // Arrêt quand l'onglet est masqué
    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = window.requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, []);

  const actif = phase === "actif";

  return (
    <section
      aria-label="Développement web et référencement — Dépassez les limites"
      className="ht"
    >
      <style>{STYLES}</style>

      {/* Fond hexadécimal — décor pur, absent de l'arbre d'accessibilité */}
      <canvas ref={canvasRef} aria-hidden="true" className="ht-canvas" />

      {/* Scanlines CRT */}
      <div aria-hidden="true" className="ht-scanlines" />

      {/* Vignette phosphore */}
      <div aria-hidden="true" className="ht-vignette" />

      {/* Scintillement phosphore */}
      <div aria-hidden="true" className="ht-flicker" />

      {/* Allumage cathodique */}
      {phase === "allumage" && <div aria-hidden="true" className="ht-allumage" />}

      {/* Séquence console plein cadre */}
      {phase === "sequence" && (
        <SequenceDemarrage
          variante="plein"
          dureeMs={2600}
          onFini={handleSequenceFinie}
          className={`ht-sequence${sequenceSortie ? " ht-sequence--sortie" : ""}`}
        />
      )}

      {/* Cible de calibrage — se pose derrière le titre, zoome sur « limites » */}
      <CibleCalibrage
        demarrer={cibleActive}
        couleur="#7dd3fc"
        className="ht-cible"
      />

      {/* Texte principal — toujours dans le DOM (rendu serveur = rendu initial) */}
      <div className={`ht-col${actif ? " ht-col--visible" : ""}`}>
        {/*
         * h1 en petites capitales : libellé descriptif de la page.
         * h2 type-hero : l'accroche visuelle.
         * Le conteneur ht-col déclare container-name: hcColonneTexte
         * pour que type-hero puisse lire cqi.
         */}
        <h1 className="ht-h1">Développement web et référencement</h1>
        <h2 className="ht-h2 type-hero">
          Dépassez les <span className="ht-neon">limites</span>
        </h2>
        <p className="type-lead ht-chapeau">
          Sites, applications, outils métier. Nous concevons des solutions
          digitales durables, dont les résultats se mesurent.
        </p>
        <Bouton href="/contact" taille="l">Démarrer un projet</Bouton>
      </div>

      {/* Journal discret — côté droit, décor pur */}
      <div
        aria-hidden="true"
        className={`ht-journal${actif ? " ht-journal--visible" : ""}`}
      >
        {journal.map((l) => (
          <div key={l.id} className="ht-journal-ligne">
            <span style={{ color: "rgba(74,222,128,0.28)" }}>{">"}</span>
            {" "}
            {l.texte}
          </div>
        ))}
        {actif && (
          <span className={`ht-cursor${cursorClignote ? " ht-cursor--clignote" : ""}`}>
            _
          </span>
        )}
      </div>

      {/* Bouton pause — RGAA 13.8, animation > 5 s */}
      <button
        type="button"
        className="ht-pause"
        aria-label={pause ? "Reprendre l'animation" : "Mettre en pause l'animation"}
        onClick={() => setPause((p) => !p)}
      >
        {pause ? "▶ reprendre" : "⏸ pause"}
      </button>
    </section>
  );
}
