"use client";

/**
 * Démonstration des fonds de section du système Console.
 *
 * Réutilise FondCretes (fonds/animes) et les composants de fonds/relief.
 * Canvas 2D, aucune bibliothèque 3D.
 *
 * RGAA 4.1 — critère 13.8 : bouton pause pour les animations > 5 s.
 * Les fonds sont des décors purs (aria-hidden) ; le bouton pause contrôle
 * la variable CSS animation-play-state.
 */

import { useState } from "react";

import { StylesConsole } from "@/components/console/fondations";
import { FondCretes } from "@/components/console/fonds/animes";

export function DemoFonds() {
  const [enPause, setEnPause] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-full w-full overflow-hidden"
      style={{ background: "var(--cs-fond)", animationPlayState: enPause ? "paused" : "running" }}
    >
      <StylesConsole />

      {/* Fond Crêtes — plein cadre */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{ animationPlayState: enPause ? "paused" : "running" }}
      >
        <FondCretes />
      </div>

      {/* Contenu par-dessus */}
      <div className="relative z-10 text-center px-8 space-y-4">
        <p className="type-h3 font-semibold text-(--cs-texte)">Fond Crêtes</p>
        <p className="type-body text-(--cs-texte-2) max-w-sm">
          Lignes horizontales animées, occlusion procédurale, canvas 2D.
        </p>
      </div>

      {/* Bouton pause — RGAA 13.8 */}
      <button
        type="button"
        aria-pressed={enPause}
        aria-label={enPause ? "Reprendre l'animation" : "Mettre en pause l'animation"}
        onClick={() => setEnPause((v) => !v)}
        className={[
          "absolute bottom-6 right-6 z-20",
          "px-4 py-2 rounded border text-(--cs-neon) border-(--cs-neon)/40 bg-(--cs-surface)",
          "type-caption uppercase tracking-wider",
          "hover:bg-(--cs-surface-2) transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--cs-neon)",
        ].join(" ")}
      >
        {enPause ? "Reprendre" : "Pause"}
      </button>
    </div>
  );
}
