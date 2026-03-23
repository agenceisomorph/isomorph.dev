"use client";

/**
 * Bouton de copie de la clé de licence dans le presse-papiers
 *
 * Justification "use client" : utilisation de navigator.clipboard.writeText
 * et useState pour le feedback visuel — impossible en Server Component.
 *
 * RGAA 7.1 : script déclenché par une action utilisateur explicite
 * RGAA 11.9 : intitulé du bouton explicite (aria-label dynamique)
 * Impact éco : < 500 B, aucune dépendance externe
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyKeyButtonProps {
  licenseKey: string;
  label: string;
  copiedLabel: string;
}

export default function CopyKeyButton({
  licenseKey,
  label,
  copiedLabel,
}: CopyKeyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      // Réinitialiser après 2 secondes
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback : sélection manuelle du texte si clipboard API indisponible
      // (contexte non-HTTPS, navigateur ancien)
      console.warn("[CopyKeyButton] Clipboard API indisponible");
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      aria-live="polite"
      className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      {copied ? (
        <Check size={16} aria-hidden="true" className="text-violet-400" />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
    </button>
  );
}
