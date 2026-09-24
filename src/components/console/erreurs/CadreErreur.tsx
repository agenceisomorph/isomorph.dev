import type { ReactNode } from "react";

import { StylesConsole } from "@/components/console/fondations";
import { PiedDePage } from "@/components/console/contenus/PiedDePage";
import { BarreConsole } from "@/components/console/navigation/BarreConsole";

/**
 * Gabarit des pages d'erreur (404 et 500) : barre fixe et pied de page du
 * système Console, comme les autres pages. Sans état : utilisable depuis
 * `not-found.tsx` (serveur) comme depuis `error.tsx` (client).
 */
export function CadreErreur({ children }: { children: ReactNode }) {
  return (
    <div data-atelier-console className="relative bg-(--cs-fond) text-white">
      <BarreConsole locale="fr" frPath="/" position="fixe" />
      <main className="pt-16">
        <StylesConsole />
        {children}
      </main>
      <PiedDePage locale="fr" frPath="/" />
    </div>
  );
}
