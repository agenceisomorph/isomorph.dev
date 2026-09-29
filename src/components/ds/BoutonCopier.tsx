/**
 * Bouton copier — îlot client minimal.
 *
 * Copie le code dans le presse-papiers et confirme visuellement pendant 2 s.
 * Aucune dépendance externe.
 *
 * RGAA 12.8 : focus visible (fond noir au focus).
 */

"use client";

import { useState } from "react";

interface Props {
  code: string;
  fr: boolean;
}

export default function BoutonCopier({ code, fr }: Props) {
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(code);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      /* Clipboard non disponible (iframe sandboxé) : silencieux. */
    }
  }

  return (
    <button
      type="button"
      onClick={copier}
      aria-label={fr ? "Copier le code" : "Copy code"}
      className="type-caption bg-blanc text-noir px-2 py-1 hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
    >
      {copie
        ? (fr ? "Copié" : "Copied")
        : (fr ? "Copier" : "Copy")}
    </button>
  );
}
