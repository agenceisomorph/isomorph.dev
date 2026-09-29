"use client";

/**
 * Bouton de copie du code d'exemple — design system Console.
 *
 * Client Component justifié : interaction navigateur (clipboard + état copié).
 * RGAA 4.1 : aria-label explicite, feedback visuel + textuel.
 * Focus : couleur de bord change, aucun ring ni outline.
 */

import { useState } from "react";
import { StylesConsole } from "@/components/console/fondations";

interface Props {
  code: string;
}

export default function BoutonCopier({ code }: Props) {
  const [copie, setCopie] = useState(false);

  async function handleCopie() {
    try {
      await navigator.clipboard.writeText(code);
      setCopie(true);
      setTimeout(() => setCopie(false), 1800);
    } catch {
      // Silencieux si l'accès clipboard est refusé
    }
  }

  return (
    <>
      <StylesConsole />
      <button
        type="button"
        onClick={handleCopie}
        aria-label={copie ? "Code copié" : "Copier le code"}
        style={{
          border: `1px solid ${copie ? "var(--cs-succes)" : "var(--cs-trait)"}`,
          color: copie ? "var(--cs-succes)" : "var(--cs-texte-3)",
          background: "transparent",
          borderRadius: "4px",
          padding: "4px 10px",
          cursor: "pointer",
          transition: "color 150ms linear, border-color 150ms linear",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: "11px",
          letterSpacing: "0.04em",
          outline: "none",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--cs-neon)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--cs-texte)";
        }}
        onBlur={(e) => {
          if (!copie) {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--cs-trait)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--cs-texte-3)";
          }
        }}
      >
        {copie ? "Copié" : "Copier"}
      </button>
    </>
  );
}
