"use client";

/**
 * Chargeur client des démonstrations — DemoViewer.
 *
 * Next.js interdit `next/dynamic` avec `ssr: false` dans les Server Components.
 * Ce composant client est le point d'entrée unique : il charge à la demande
 * le composant de démonstration correspondant au slug.
 *
 * Éco :
 *   - Un seul import par démonstration ; aucun bundle 3D sur les autres pages.
 *   - Chargement déclenché uniquement quand le composant est monté.
 *
 * RGAA 13.8 : chaque hero gère lui-même le bouton pause pour ses animations.
 */

import dynamic from "next/dynamic";

/* ------------------------------------------------------------------ */
/* Imports dynamiques                                                  */
/* ------------------------------------------------------------------ */
const DemoCarteMere = dynamic(
  () => import("./carte-mere/HeroCarteMere").then((m) => m.HeroCarteMere),
  { ssr: false },
);

const DemoCoeurQuantique = dynamic(
  () => import("./coeur-quantique/HeroCoeurQuantique").then((m) => m.HeroCoeurQuantique),
  { ssr: false },
);

const DemoMontagnesRusses = dynamic(
  () => import("./montagnes-russes/HeroMontagnesRusses").then((m) => m.HeroMontagnesRusses),
  { ssr: false },
);

const DemoTerminal = dynamic(
  () => import("./terminal/HeroTerminal").then((m) => m.HeroTerminal),
  { ssr: false },
);

const DemoTunnel = dynamic(
  () => import("./tunnel-donnees/HeroTunnel").then((m) => m.HeroTunnel),
  { ssr: false },
);

const DemoGlobeComp = dynamic(
  () => import("./DemoGlobe").then((m) => m.DemoGlobe),
  { ssr: false },
);

const DemoCarteGeoComp = dynamic(
  () => import("./DemoCarteGeo").then((m) => m.DemoCarteGeo),
  { ssr: false },
);

const DemoDecorsComp = dynamic(
  () => import("./DemoDecors").then((m) => m.DemoDecors),
  { ssr: false },
);

const DemoFondsComp = dynamic(
  () => import("./DemoFonds").then((m) => m.DemoFonds),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/* Table slug → composant                                             */
/* ------------------------------------------------------------------ */
const DEMOS: Record<string, React.ComponentType> = {
  "carte-mere": DemoCarteMere,
  "coeur-quantique": DemoCoeurQuantique,
  "montagnes-russes": DemoMontagnesRusses,
  terminal: DemoTerminal,
  "tunnel-donnees": DemoTunnel,
  globe: DemoGlobeComp,
  carte: DemoCarteGeoComp,
  "decors-instruments": DemoDecorsComp,
  "fonds-console": DemoFondsComp,
};

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */
export interface DemoViewerProps {
  slug: string;
  /** Titre de la section pour l'attribut aria-label. */
  titre: string;
}

export function DemoViewer({ slug, titre }: DemoViewerProps) {
  const Demo = DEMOS[slug];

  if (!Demo) {
    return (
      <div
        className="flex items-center justify-center h-full text-(--cs-texte-2)"
        aria-label={titre}
      >
        {titre}
      </div>
    );
  }

  return <Demo />;
}
