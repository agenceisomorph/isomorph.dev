"use client";

/**
 * Séquence de démarrage : lignes de console qui s'impriment, défilé
 * hexadécimal, barres de chargement vertes façon installation de
 * dépendances. Pièce commune aux cinq heros de `/atelier/console/heros`.
 *
 * CONTRAT (signatures inchangées, les heros en dépendent) :
 * - rendu serveur = premier rendu navigateur ; l'animation démarre au montage ;
 * - mouvement réduit : état final direct, `onFini` appelé au montage ;
 * - `onFini` appelé une seule fois, à la fin de la séquence.
 *
 * Performances :
 * - zéro setState à chaque image ; le défilé hexa est une CSS animation
 *   sur un bloc de texte pré-généré (plusieurs colonnes indépendantes) ;
 * - IntersectionObserver pour suspendre les animations hors écran.
 */

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/* Données statiques (calculées une seule fois au chargement du module)       */
/* -------------------------------------------------------------------------- */

/**
 * Bloc hexadécimal généré statiquement : 80 lignes × 16 octets.
 * Assez haut pour remplir n'importe quelle hauteur d'écran sans répétition
 * visible pendant les 2,6 s de la séquence.
 */
const CONTENU_HEX: string = (() => {
  const G = [0x4e, 0x65, 0x78, 0x74, 0x52, 0x65, 0x61, 0x63, 0x54, 0x68, 0x72, 0x65, 0x4d, 0x6f, 0x74, 0x69];
  return Array.from({ length: 80 }, (_, i) => {
    const addr = (i * 16).toString(16).padStart(8, "0");
    const octets = Array.from({ length: 16 }, (_, j) => (G[(i + j) % G.length] ^ (i * 7 + j * 3)) & 0xff);
    const h1 = octets.slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join(" ");
    const h2 = octets.slice(8).map(b => b.toString(16).padStart(2, "0")).join(" ");
    const txt = octets.map(b => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : ".")).join("");
    return `0x${addr}  ${h1}  ${h2}  ${txt}`;
  }).join("\n");
})();

/**
 * Paquets réels issus de package.json — noms et versions exacts.
 * RGAA : ces informations ne sont pas lues par les lecteurs d'écran
 * (`aria-hidden` sur le composant entier).
 */
const PAQUETS = [
  { nom: "next",               version: "15.5.22" },
  { nom: "react",              version: "19.0.0"  },
  { nom: "three",              version: "0.178.0" },
  { nom: "motion",             version: "12.43.0" },
  { nom: "@react-three/fiber", version: "9.2.0"   },
  { nom: "@react-three/drei",  version: "10.6.0"  },
  { nom: "tailwindcss",        version: "4.0.0"   },
  { nom: "typescript",         version: "5.7.0"   },
  { nom: "zod",                version: "3.24.1"  },
  { nom: "@sentry/nextjs",     version: "10.75.3" },
] as const;

/**
 * Messages pour la variante panneau (compact, linéaire, tout affiché d'un bloc).
 * 4 lignes max pour tenir dans h-52.
 */
const MESSAGES_PANNEAU = [
  { tag: "INIT", texte: "Amorçage du noyau système",      ok: false, dots: true },
  { tag: "INIT", texte: "Vérification des volumes",       ok: false, dots: false },
  { tag: " OK ", texte: "Interfaces configurées",         ok: true,  dots: false },
  { tag: "LOAD", texte: "Résolution des dépendances",     ok: false, dots: false },
] as const;

/**
 * Messages pour la variante plein, répartis entre haut et bas du cadre.
 * Le milieu est occupé par les barres de progression.
 */
const MESSAGES_PLEIN_HAUT = [
  { tag: "INIT", texte: "Amorçage du noyau système",        ok: false, dots: true  },
  { tag: "INIT", texte: "Vérification des volumes montés",  ok: false, dots: false },
  { tag: " OK ", texte: "Interfaces réseau configurées",    ok: true,  dots: false },
] as const;

const MESSAGES_PLEIN_BAS = [
  { tag: " OK ", texte: "Registre accessible",              ok: true,  dots: false },
  { tag: " OK ", texte: "Compilation réussie",              ok: true,  dots: false },
] as const;

/**
 * Colonnes hex pour la variante plein :
 * vitesse et décalage de départ (animation-delay négatif = déjà en cours).
 * L'enjambement visuel entre colonnes crée l'impression d'un terminal immersif.
 */
const HEX_COLONNES_PLEIN = [
  { vitesse: 1.00, offsetMs: 0    },
  { vitesse: 0.82, offsetMs: 420  },
  { vitesse: 1.18, offsetMs: 840  },
  { vitesse: 0.93, offsetMs: 210  },
] as const;

/* -------------------------------------------------------------------------- */
/* Keyframes CSS partagées entre toutes les instances                         */
/* React 19 déduplique le <style> via l'attribut href.                       */
/* -------------------------------------------------------------------------- */
const CSS_KEYFRAMES = `
@keyframes seq-hex-defilement {
  from { transform: translateY(0); }
  to { transform: translateY(-60%); }
}
@keyframes seq-hex-fondu {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes seq-ligne-entre {
  from { opacity: 0; translate: 0 5px; }
  to   { opacity: 1; translate: 0 0; }
}
@keyframes seq-barre-remplissage {
  from { width: 0; }
  to   { width: 100%; }
}
@keyframes seq-final-entre {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes seq-curseur-clignotement {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes seq-dot-pulse {
  0%, 100% { opacity: 0; }
  30%, 70% { opacity: 1; }
}

.seq-hex      { animation: seq-hex-defilement linear forwards; }
.seq-hex-wrap { animation: seq-hex-fondu linear both; }
.seq-ligne    { opacity: 0; animation: seq-ligne-entre 0.2s ease-out both; }
.seq-barre    { width: 0; animation: seq-barre-remplissage ease-out forwards; }
.seq-final    { opacity: 0; animation: seq-final-entre 0.35s ease-out forwards; }
.seq-curseur  { animation: seq-curseur-clignotement 0.65s ease-in-out infinite; }
.seq-dot      { animation: seq-dot-pulse 1.4s ease-in-out 3; }

/* Pause hors écran (IntersectionObserver) */
.seq-paused .seq-hex,
.seq-paused .seq-hex-wrap,
.seq-paused .seq-ligne,
.seq-paused .seq-barre,
.seq-paused .seq-final,
.seq-paused .seq-curseur,
.seq-paused .seq-dot {
  animation-play-state: paused;
}

/* Mouvement réduit : état final immédiat, sans transition. */
@media (prefers-reduced-motion: reduce) {
  .seq-hex-wrap  { display: none !important; }
  .seq-ligne     { opacity: 1 !important; animation: none !important; translate: none !important; }
  .seq-barre     { width: 100% !important; animation: none !important; }
  .seq-final     { opacity: 1 !important; animation: none !important; }
  .seq-curseur   { animation: none !important; }
  .seq-dot       { opacity: 0 !important; animation: none !important; }
}
`;

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

export interface SequenceDemarrageProps {
  /** Durée totale visée, en millisecondes (défaut 2600, plafond 3200). */
  dureeMs?: number;
  /** Présentation : panneau compact posé dans un coin du hero, ou plein cadre. */
  variante?: "panneau" | "plein";
  /** Appelé une fois la séquence terminée (ou tout de suite en mouvement réduit). */
  onFini?: () => void;
  className?: string;
}

export function SequenceDemarrage({
  dureeMs = 2600,
  variante = "panneau",
  onFini,
  className = "",
}: SequenceDemarrageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /** Ref stable vers le callback — évite de relancer l'effet à chaque rendu. */
  const onFiniRef = useRef(onFini);
  useEffect(() => { onFiniRef.current = onFini; }, [onFini]);

  useEffect(() => {
    /* Mouvement réduit : état final direct, callback immédiat. */
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onFiniRef.current?.();
      return;
    }

    /* Timer principal — déclenche onFini à la fin de la séquence. */
    const timer = window.setTimeout(() => onFiniRef.current?.(), dureeMs);

    /* IntersectionObserver : pause CSS des animations quand hors écran. */
    const el = containerRef.current;
    let observer: IntersectionObserver | undefined;
    if (el) {
      observer = new IntersectionObserver(
        ([entry]) => el.classList.toggle("seq-paused", !entry.isIntersecting),
        { threshold: 0.05 },
      );
      observer.observe(el);
    }

    return () => {
      window.clearTimeout(timer);
      observer?.disconnect();
    };
    // onFini géré par ref : changement de référence n'a pas d'effet.
  }, [dureeMs]);

  /* Délais proportionnels à dureeMs, communs aux deux variantes. */
  const hexDuree      = Math.round(dureeMs * 0.42);
  const hexFadeDelay  = Math.round(dureeMs * 0.22);
  const hexFadeDuree  = Math.round(dureeMs * 0.20);
  const barreBase     = Math.round(dureeMs * 0.26);
  const barreDecalage = Math.round(dureeMs * 0.055);
  const barreDuree    = Math.round(dureeMs * 0.28);
  const finalDelay    = Math.round(dureeMs * 0.85);

  if (variante === "panneau") {
    /* ------------------------------------------------------------------ */
    /* Variante PANNEAU — bloc compact h-52 w-72, une seule colonne hex   */
    /* ------------------------------------------------------------------ */
    const ligneBase     = Math.round(dureeMs * 0.08);
    const ligneDecalage = Math.round(dureeMs * 0.07);
    const dotDelay      = Math.round(dureeMs * 0.05);
    const nbPaquets     = 5;

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={["relative overflow-hidden bg-black/90 rounded h-52 w-72 text-[10px] leading-[1.4]", className].join(" ")}
        style={{ fontFamily: "var(--font-geist-mono, ui-monospace, monospace)" }}
      >
        <style href="seq-demarrage-keyframes" precedence="default">{CSS_KEYFRAMES}</style>

        {/* Hex en fond, une colonne */}
        <div
          className="seq-hex-wrap pointer-events-none absolute inset-0 overflow-hidden text-[#22d3ee]/50 text-[9px] leading-[1.25]"
          style={{ animationDelay: `${hexFadeDelay}ms`, animationDuration: `${hexFadeDuree}ms` }}
        >
          <pre className="seq-hex select-none p-2" style={{ animationDuration: `${hexDuree}ms` }}>
            {CONTENU_HEX}
          </pre>
        </div>

        {/* Contenu principal */}
        <div className="relative z-10 flex h-full flex-col gap-[2px] p-2">
          {/* Messages d'amorçage */}
          {(MESSAGES_PANNEAU as readonly (typeof MESSAGES_PANNEAU)[number][]).map((m, i) => (
            <div
              key={i}
              className="seq-ligne flex shrink-0 gap-1"
              style={{ animationDelay: `${ligneBase + i * ligneDecalage}ms` }}
            >
              <span className={`shrink-0 ${m.ok ? "text-[#4ade80]" : "text-[#22d3ee]/60"}`}>[{m.tag}]</span>
              <span className="text-[#86efac]">
                {m.texte}
                {m.dots && (
                  [".", ".", ".", ".", "."].map((d, j) => (
                    <span key={j} className="seq-dot" style={{ animationDelay: `${dotDelay + j * 180}ms` }}>{d}</span>
                  ))
                )}
              </span>
            </div>
          ))}

          {/* Séparateur */}
          <div className="seq-ligne my-0.5 shrink-0 border-t border-[#4ade80]/15"
            style={{ animationDelay: `${barreBase - 60}ms` }} />

          {/* Barres */}
          <div className="space-y-[2px]">
            {PAQUETS.slice(0, nbPaquets).map((p, i) => {
              const delay = barreBase + i * barreDecalage;
              const nom = p.nom.length > 10 ? p.nom.slice(0, 9) + "…" : p.nom;
              return (
                <div key={p.nom} className="seq-ligne flex min-w-0 items-center gap-1" style={{ animationDelay: `${delay}ms` }}>
                  <span className="shrink-0 text-[#22d3ee]" style={{ width: "10ch" }}>{nom}</span>
                  <div className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-[#4ade80]/15">
                    <div className="seq-barre h-full rounded-full bg-[#4ade80]"
                      style={{ animationDelay: `${delay + 40}ms`, animationDuration: `${barreDuree}ms` }} />
                  </div>
                  <span className="shrink-0 text-[#4ade80]/40 tabular-nums" style={{ fontSize: "8px" }}>{p.version}</span>
                </div>
              );
            })}
          </div>

          {/* Ligne finale */}
          <div className="seq-final mt-auto shrink-0 tracking-wide text-[#4ade80]"
            style={{ animationDelay: `${finalDelay}ms` }}>
            {">"} {"Système prêt."}<span className="seq-curseur ml-0.5">_</span>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------- */
  /* Variante PLEIN — occupe tout le conteneur, immersive                  */
  /* 4 colonnes hex indépendantes + 3 zones de contenu (haut/mid/bas)     */
  /* -------------------------------------------------------------------- */
  const ligneHautBase     = Math.round(dureeMs * 0.06);
  const ligneHautDecalage = Math.round(dureeMs * 0.07);
  const dotDelay          = Math.round(dureeMs * 0.04);
  const ligneBas1Delay    = Math.round(dureeMs * 0.66);
  const ligneBas2Delay    = Math.round(dureeMs * 0.73);
  const loadHeaderDelay   = Math.round(dureeMs * 0.23);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={["relative overflow-hidden bg-black/90 h-full w-full text-[13px] leading-[1.5]", className].join(" ")}
      style={{ fontFamily: "var(--font-geist-mono, ui-monospace, monospace)" }}
    >
      <style href="seq-demarrage-keyframes" precedence="default">{CSS_KEYFRAMES}</style>

      {/* ---------------------------------------------------------------- */}
      {/* 4 colonnes hexadécimales indépendantes — fond atténué, plein écran */}
      {/* Chaque colonne scroll à une vitesse différente, décalée dans      */}
      {/* le temps par animation-delay négatif (déjà en cours au montage). */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="seq-hex-wrap pointer-events-none absolute inset-0 flex overflow-hidden text-[#22d3ee]/35 text-[9px] leading-[1.25]"
        style={{ animationDelay: `${hexFadeDelay}ms`, animationDuration: `${hexFadeDuree}ms` }}
      >
        {HEX_COLONNES_PLEIN.map(({ vitesse, offsetMs }, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            <pre
              className="seq-hex select-none px-1"
              style={{
                animationDuration: `${Math.round(hexDuree * vitesse)}ms`,
                /* Décalage négatif = animation déjà en cours au montage */
                animationDelay: `-${offsetMs}ms`,
              }}
            >
              {CONTENU_HEX}
            </pre>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Contenu principal : 3 zones distribuées sur toute la hauteur     */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8">

        {/* Zone haute : messages d'amorçage */}
        <div className="space-y-2">
          {(MESSAGES_PLEIN_HAUT as readonly (typeof MESSAGES_PLEIN_HAUT)[number][]).map((m, i) => (
            <div
              key={i}
              className="seq-ligne flex items-baseline gap-2"
              style={{ animationDelay: `${ligneHautBase + i * ligneHautDecalage}ms` }}
            >
              <span className={`shrink-0 text-[11px] ${m.ok ? "text-[#4ade80]" : "text-[#22d3ee]/55"}`}>
                [{m.tag}]
              </span>
              <span className="text-[#86efac]">
                {m.texte}
                {m.dots && (
                  [".", ".", ".", ".", "."].map((d, j) => (
                    <span key={j} className="seq-dot" style={{ animationDelay: `${dotDelay + j * 180}ms` }}>{d}</span>
                  ))
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Zone centrale : barres de progression */}
        <div className="w-full max-w-2xl space-y-3">
          {/* En-tête */}
          <div
            className="seq-ligne text-[11px] text-[#22d3ee]/60 tracking-widest uppercase"
            style={{ animationDelay: `${loadHeaderDelay}ms` }}
          >
            [LOAD] Installation des modules
          </div>

          {/* Toutes les barres */}
          {PAQUETS.map((p, i) => {
            const delay = barreBase + i * barreDecalage;
            const nomAffiche = p.nom.length > 22 ? p.nom.slice(0, 21) + "…" : p.nom;
            return (
              <div key={p.nom} className="seq-ligne flex min-w-0 items-center gap-3"
                style={{ animationDelay: `${delay}ms` }}>
                <span className="shrink-0 text-[#22d3ee]" style={{ width: "22ch" }}>{nomAffiche}</span>
                <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#4ade80]/12">
                  <div className="seq-barre h-full rounded-full bg-[#4ade80]"
                    style={{ animationDelay: `${delay + 40}ms`, animationDuration: `${barreDuree}ms` }} />
                </div>
                <span className="shrink-0 text-[#4ade80]/40 tabular-nums text-[11px]">{p.version}</span>
              </div>
            );
          })}
        </div>

        {/* Zone basse : confirmation + ligne finale */}
        <div className="space-y-2">
          {/* Messages de confirmation */}
          <div
            className="seq-ligne flex items-baseline gap-2"
            style={{ animationDelay: `${ligneBas1Delay}ms` }}
          >
            <span className="shrink-0 text-[11px] text-[#4ade80]">[{MESSAGES_PLEIN_BAS[0].tag}]</span>
            <span className="text-[#86efac]">{MESSAGES_PLEIN_BAS[0].texte}</span>
          </div>
          <div
            className="seq-ligne flex items-baseline gap-2"
            style={{ animationDelay: `${ligneBas2Delay}ms` }}
          >
            <span className="shrink-0 text-[11px] text-[#4ade80]">[{MESSAGES_PLEIN_BAS[1].tag}]</span>
            <span className="text-[#86efac]">{MESSAGES_PLEIN_BAS[1].texte}</span>
          </div>

          {/* Ligne finale avec curseur */}
          <div
            className="seq-final text-[#4ade80] tracking-widest text-[14px] pt-1"
            style={{ animationDelay: `${finalDelay}ms` }}
          >
            {">"} {"Système prêt."}<span className="seq-curseur ml-1">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
