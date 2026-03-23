"use client";

/**
 * Bouton de déclenchement du checkout Stripe
 *
 * Justification "use client" :
 * - Collecte de l'email via prompt (V1 simple)
 * - Appel fetch vers /api/checkout
 * - Redirection vers l'URL Stripe retournée
 * - Gestion des états loading / erreur
 *
 * Impact éco : < 1 kB — pas de dépendance externe, logique minimale.
 * En V2 : remplacer le prompt par un modal avec un vrai input email.
 *
 * RGAA 7.1 : bouton avec aria-busy pendant le chargement
 * RGAA 11.9 : intitulé du bouton explicite
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: "pro" | "enterprise";
  plugin: string;
  label: string;
  className?: string;
}

export default function CheckoutButton({
  plan,
  plugin,
  label,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    // Collecter l'email — prompt simple pour V1 (à remplacer par un modal en V2)
    const email = window.prompt("Entrez votre adresse email pour continuer le paiement :");

    if (!email || !email.trim()) return;

    // Validation basique du format email côté client (pré-validation UX)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Format d'email invalide. Veuillez réessayer.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, plugin, email: email.trim() }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Impossible de démarrer le paiement. Réessayez.");
      }

      // Redirection vers Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => void handleClick()}
        disabled={loading}
        aria-busy={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2
              size={16}
              aria-hidden="true"
              className="animate-spin mr-2"
            />
            Redirection…
          </>
        ) : (
          label
        )}
      </button>

      {/* Erreur inline — RGAA 10.9 : information non transmise uniquement par la couleur */}
      {error && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-400 text-center"
        >
          {error}
        </p>
      )}
    </div>
  );
}
