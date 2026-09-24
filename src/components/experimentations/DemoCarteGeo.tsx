"use client";

/**
 * Démonstration de la carte géographique MapLibre du système Console.
 *
 * Réutilise CarteGeo de console/carte.
 * MapLibre GL est chargé côté client uniquement.
 */

import { StylesConsole } from "@/components/console/fondations";
import { CarteGeo } from "@/components/console/carte";

export function DemoCarteGeo() {
  return (
    <div
      className="relative flex items-center justify-center min-h-full w-full p-8"
      style={{ background: "var(--cs-fond)" }}
    >
      <StylesConsole />
      <div className="w-full max-w-3xl aspect-video rounded-[16px] overflow-hidden border border-(--cs-neon)/20">
        <CarteGeo titre="Carte géographique Console" className="h-full" />
      </div>
    </div>
  );
}
