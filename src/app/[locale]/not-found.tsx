import type { Metadata } from "next";

import { Introuvable } from "@/components/console/erreurs/Introuvable";
import { StylesConsole } from "@/components/console/fondations";

/**
 * Page 404 personnalisée — /[locale]/not-found.tsx
 *
 * Hérite du layout [locale] (BarreIsomorphDev + PiedPageIsomorphDev).
 * Le composant Introuvable affiche le dessin « Journal » du système Console.
 *
 * noindex : une page introuvable ne doit pas être indexée.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <StylesConsole />
      <Introuvable />
    </>
  );
}
