"use client";

/**
 * Page d'erreur 500 — /[locale]/error.tsx
 *
 * Hérite du layout [locale] (BarreIsomorphDev + PiedPageIsomorphDev).
 * Le composant Panne affiche le dessin « Journal » du système Console.
 *
 * Doit être "use client" : Next.js impose que error.tsx soit un Client Component
 * car il reçoit les props `error` et `reset` qui ne peuvent pas être sérialisées.
 *
 * La prop `reset` est passée directement à Panne qui la propose en bouton « Réessayer ».
 */

import { Panne } from "@/components/console/erreurs/Panne";
import { StylesConsole } from "@/components/console/fondations";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <>
      <StylesConsole />
      <Panne reessayer={reset} reference={error.digest} />
    </>
  );
}
