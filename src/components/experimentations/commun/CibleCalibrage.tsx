"use client";

/**
 * Cible de calibrage : remplace la « roulette » (orbites graduées) du hero
 * console. Mire qui zoome, fait sa mise au point, se verrouille, puis
 * s'allume comme un néon. Pièce commune aux cinq heros.
 *
 * CONTRAT (signatures inchangées) :
 * - décor pur, `aria-hidden`, `pointer-events: none` ;
 * - s'adapte à son conteneur (le hero fixe taille et position via className) ;
 * - `demarrer` passe de false à true pour lancer la séquence (défaut true) ;
 * - `onVerrouillee` appelé une fois quand la cible est calée et allumée ;
 * - mouvement réduit : état final allumé, `onVerrouillee` appelé au montage.
 *
 * Séquence :
 * 0 s     — mire floue, surdimensionnée
 * 0–0.8 s — zoom + mise au point (scale + blur)
 * 0.7 s   — équerres de coin qui se referment (verrou)
 * 1.25 s  — allumage néon : clignotements irréguliers, puis lueur stable
 * 1.95 s+ — boucle discrète : rotation lente, pulsation de la lueur
 *
 * Implémentation : SVG + CSS keyframes dans un <style> scopé par useId().
 */

import { useEffect, useId, useRef } from "react";

/* -------------------------------------------------------------------------- */
/* Graduations — 120 traits (tous les 3 °) sur l'anneau extérieur            */
/* -------------------------------------------------------------------------- */
const GRADUATIONS = Array.from({ length: 120 }, (_, i) => {
  const angle   = (i * 3 * Math.PI) / 180;
  const majeure = i % 10 === 0; // tous les 30 °
  const moyenne = i % 5 === 0;  // tous les 15 °
  const r0 = 175;
  const len = majeure ? 14 : moyenne ? 8 : 5;
  const sw  = majeure ? 1.4 : moyenne ? 0.7 : 0.35;
  const op  = majeure ? 0.9 : moyenne ? 0.55 : 0.28;
  const x1 = 200 + r0 * Math.sin(angle);
  const y1 = 200 - r0 * Math.cos(angle);
  const x2 = 200 + (r0 - len) * Math.sin(angle);
  const y2 = 200 - (r0 - len) * Math.cos(angle);
  return { x1, y1, x2, y2, sw, op };
});

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

export interface CibleCalibrageProps {
  demarrer?: boolean;
  /** Couleur du néon (défaut : le cyan du système, #7dd3fc). */
  couleur?: string;
  onVerrouillee?: () => void;
  className?: string;
}

export function CibleCalibrage({
  demarrer = true,
  couleur  = "#7dd3fc",
  onVerrouillee,
  className = "",
}: CibleCalibrageProps) {
  /** ID unique pour les filtres SVG (les ids SVG sont globaux dans le document). */
  const rawId  = useId();
  const svgId  = "c" + rawId.replace(/[^a-z0-9]/gi, "x");
  const filtreId = `${svgId}-glow`;

  const onVerrouilleRef = useRef(onVerrouillee);
  useEffect(() => { onVerrouilleRef.current = onVerrouillee; }, [onVerrouillee]);

  /** Ref vers le groupe des valeurs de lecture (cycling JS, bas fréquence). */
  const readoutRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!demarrer) return;

    /* Mouvement réduit : état final direct, callback immédiat. */
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onVerrouilleRef.current?.();
      return;
    }

    /* Valeurs de calibrage qui défilent puis se fixent (bas débit, DOM ref). */
    const VALEURS = [
      { az: "247.83", el: "118.42" },
      { az: "195.17", el: "087.65" },
      { az: "142.39", el: "043.21" },
      { az: "063.84", el: "012.79" },
      { az: "000.00", el: "000.00" },
    ];
    let idx = 0;
    const readoutTimer = window.setInterval(() => {
      const g = readoutRef.current;
      if (!g) return;
      const v = VALEURS[idx] ?? VALEURS[VALEURS.length - 1];
      const [taz, tel] = g.querySelectorAll<SVGTextElement>("[data-readout]");
      if (taz) taz.textContent = `AZ: +${v.az}`;
      if (tel) tel.textContent = `EL: +${v.el}`;
      idx++;
      if (idx >= VALEURS.length) window.clearInterval(readoutTimer);
    }, 150);

    /* onVerrouillee : appelé à la fin de l'allumage (≈ 1.95 s). */
    const verrou = window.setTimeout(() => onVerrouilleRef.current?.(), 1950);

    return () => {
      window.clearInterval(readoutTimer);
      window.clearTimeout(verrou);
    };
    // onVerrouillee géré par ref : changement de référence n'a pas d'effet.
  }, [demarrer]);

  /* UID des animations CSS (scoping par SVG, pas global). */
  const A = svgId; // préfixe des noms d'animation

  const css = `
/* Phase 1 : zoom + mise au point */
@keyframes ${A}-calibrage {
  0%   { transform: scale(1.35); filter: blur(8px);   opacity: 0.4; }
  40%  { transform: scale(1.04); filter: blur(2.5px); opacity: 0.88; }
  62%  { transform: scale(0.98); filter: blur(0);     opacity: 1; }
  78%  { transform: scale(1.005); }
  100% { transform: scale(1);   filter: blur(0);     opacity: 1; }
}
/* Phase 2 : équerres de verrouillage */
@keyframes ${A}-equerre {
  from { transform: translate(var(--cib-dx, 0px), var(--cib-dy, 0px)); opacity: 0; }
  to   { transform: translate(0, 0); opacity: 1; }
}
/* Phase 3 : allumage néon irrégulier */
@keyframes ${A}-allumage {
  0%   { opacity: 0; }
  8%   { opacity: 0.72; }
  16%  { opacity: 0.05; }
  28%  { opacity: 0.95; }
  36%  { opacity: 0.3; }
  50%  { opacity: 1; }
  60%  { opacity: 0.78; }
  72%  { opacity: 0.12; }
  84%  { opacity: 1; }
  92%  { opacity: 0.9; }
  100% { opacity: 1; }
}
/* Phase 4 : pulsation stable de la lueur */
@keyframes ${A}-pulsation {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.78; }
}
/* Boucle : rotation lente de l'anneau extérieur */
@keyframes ${A}-rotation {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
/* Rotation inverse de l'anneau intermédiaire */
@keyframes ${A}-rotation-inv {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}

/* États par défaut des éléments animés (demarrer=false = pause) */
.${A}-anim { animation-play-state: paused; }
[data-running="true"] .${A}-anim { animation-play-state: running; }

/* Mouvement réduit : état final immédiat */
@media (prefers-reduced-motion: reduce) {
  .${A}-principal { transform: scale(1) !important; filter: blur(0) !important; opacity: 1 !important; animation: none !important; }
  .${A}-equerre   { transform: translate(0,0) !important; opacity: 1 !important; animation: none !important; }
  .${A}-lueur     { opacity: 1 !important; animation: none !important; }
  .${A}-anneau-ext { animation: none !important; }
  .${A}-anneau-int { animation: none !important; }
}
`;

  return (
    <div
      aria-hidden="true"
      className={["pointer-events-none w-full h-full", className].join(" ")}
    >
      <style href={`cib-${svgId}`} precedence="default">
        {css}
      </style>

      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ color: couleur }}
        data-running={demarrer ? "true" : "false"}
      >
        <defs>
          {/* Filtre lueur néon — flou + fusion additive */}
          <filter id={filtreId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" type="saturate" values="2.5" result="vivid" />
            <feMerge>
              <feMergeNode in="vivid" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Filtre flou doux pour fond de profondeur */}
          <filter id={`${svgId}-depth`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        {/* ---------------------------------------------------------------- */}
        {/* Groupe principal — animation zoom + mise au point                */}
        {/* ---------------------------------------------------------------- */}
        <g
          className={`${A}-anim ${A}-principal`}
          style={{
            transformOrigin: "200px 200px",
            transformBox: "fill-box",
            animationName: `${A}-calibrage`,
            animationDuration: "0.82s",
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationFillMode: "both",
          } as React.CSSProperties}
        >
          {/* Halo de profondeur, très discret */}
          <circle
            cx="200" cy="200" r="180"
            fill="none"
            stroke="currentColor"
            strokeWidth="32"
            opacity="0.04"
            filter={`url(#${svgId}-depth)`}
          />

          {/* Anneau extérieur : tourne lentement dans la boucle */}
          <g
            className={`${A}-anim ${A}-anneau-ext`}
            style={{
              transformOrigin: "200px 200px",
              transformBox: "fill-box",
              animationName: `${A}-rotation`,
              animationDuration: "90s",
              animationDelay: "1.95s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "none",
            } as React.CSSProperties}
          >
            {/* Cercle de fond de l'anneau */}
            <circle
              cx="200" cy="200" r="175"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="3 10"
              opacity="0.35"
            />
            {/* Graduations */}
            {GRADUATIONS.map(({ x1, y1, x2, y2, sw, op }, i) => (
              <line
                key={i}
                x1={x1.toFixed(2)} y1={y1.toFixed(2)}
                x2={x2.toFixed(2)} y2={y2.toFixed(2)}
                stroke="currentColor"
                strokeWidth={sw}
                opacity={op}
              />
            ))}
          </g>

          {/* Anneau intermédiaire — rotation inverse */}
          <g
            className={`${A}-anim ${A}-anneau-int`}
            style={{
              transformOrigin: "200px 200px",
              transformBox: "fill-box",
              animationName: `${A}-rotation-inv`,
              animationDuration: "120s",
              animationDelay: "1.95s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "none",
            } as React.CSSProperties}
          >
            <circle
              cx="200" cy="200" r="130"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="1 6"
              opacity="0.45"
            />
          </g>

          {/* Anneau intérieur — fixe */}
          <circle
            cx="200" cy="200" r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Réticule — barres de croisée */}
          <line x1="25"  y1="200" x2="375" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
          <line x1="200" y1="25"  x2="200" y2="375" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
          {/* Portion centrale plus marquée */}
          <line x1="170" y1="200" x2="230" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.7" />
          <line x1="200" y1="170" x2="200" y2="230" stroke="currentColor" strokeWidth="1" opacity="0.7" />

          {/* Cercle de pointage central */}
          <circle cx="200" cy="200" r="10"  fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          <circle cx="200" cy="200" r="3.5" fill="currentColor" opacity="0.9" />

          {/* ---------------------------------------------------------------- */}
          {/* Valeurs de calibrage — mises à jour par JS (bas débit, 5×)     */}
          {/* ---------------------------------------------------------------- */}
          <g
            ref={readoutRef}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: "8px" }}
          >
            <text data-readout="az" x="216" y="196" fill="currentColor" opacity="0.5">
              AZ: +000.00
            </text>
            <text data-readout="el" x="216" y="208" fill="currentColor" opacity="0.5">
              EL: +000.00
            </text>
            {/* Indicateur de verrou (statique) */}
            <text x="147" y="208" fill="currentColor" opacity="0.35" textAnchor="end">
              LOCK
            </text>
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* Équerres de verrouillage — convergent au montage                */}
          {/* ---------------------------------------------------------------- */}
          {/* Coin haut-gauche */}
          <g
            className={`${A}-anim ${A}-equerre`}
            style={{
              "--cib-dx": "-14px",
              "--cib-dy": "-14px",
              animationName: `${A}-equerre`,
              animationDuration: "0.4s",
              animationDelay: "0.72s",
              animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationFillMode: "both",
            } as React.CSSProperties}
          >
            <path d="M 98 116 L 98 98 L 116 98" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          </g>
          {/* Coin haut-droit */}
          <g
            className={`${A}-anim ${A}-equerre`}
            style={{
              "--cib-dx": "14px",
              "--cib-dy": "-14px",
              animationName: `${A}-equerre`,
              animationDuration: "0.4s",
              animationDelay: "0.78s",
              animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationFillMode: "both",
            } as React.CSSProperties}
          >
            <path d="M 284 98 L 302 98 L 302 116" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          </g>
          {/* Coin bas-gauche */}
          <g
            className={`${A}-anim ${A}-equerre`}
            style={{
              "--cib-dx": "-14px",
              "--cib-dy": "14px",
              animationName: `${A}-equerre`,
              animationDuration: "0.4s",
              animationDelay: "0.74s",
              animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationFillMode: "both",
            } as React.CSSProperties}
          >
            <path d="M 98 284 L 98 302 L 116 302" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          </g>
          {/* Coin bas-droit */}
          <g
            className={`${A}-anim ${A}-equerre`}
            style={{
              "--cib-dx": "14px",
              "--cib-dy": "14px",
              animationName: `${A}-equerre`,
              animationDuration: "0.4s",
              animationDelay: "0.80s",
              animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationFillMode: "both",
            } as React.CSSProperties}
          >
            <path d="M 302 284 L 302 302 L 284 302" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.9" />
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* Couche de lueur néon : allumage puis pulsation stable            */}
          {/* ---------------------------------------------------------------- */}
          <g
            className={`${A}-anim ${A}-lueur`}
            filter={`url(#${filtreId})`}
            style={{
              opacity: 0,
              animationName: `${A}-allumage, ${A}-pulsation`,
              animationDuration: "0.7s, 2.5s",
              animationDelay: "1.25s, 1.95s",
              animationTimingFunction: "ease-in-out, ease-in-out",
              animationFillMode: "both, none",
              animationIterationCount: "1, infinite",
            } as React.CSSProperties}
          >
            <circle cx="200" cy="200" r="175" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="200" cy="200" r="80"  fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="200" r="3.5" fill="currentColor" />
            {/* Lueur des équerres */}
            <path d="M 98 116 L 98 98 L 116 98"   fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 284 98 L 302 98 L 302 116"  fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 98 284 L 98 302 L 116 302"  fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 302 284 L 302 302 L 284 302" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
