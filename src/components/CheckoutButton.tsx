"use client";

/**
 * Bouton de déclenchement du checkout Stripe.
 *
 * Justification "use client" :
 * - Formulaire de saisie de l'email (état local)
 * - Appel fetch vers /api/checkout
 * - Redirection vers l'URL Stripe retournée
 * - Gestion des états : attente, chargement, erreur
 *
 * Impact éco : < 2 kB — aucune dépendance externe, logique minimale.
 *
 * RGAA 4.1 :
 * - 11.1 : label explicite sur le champ email
 * - 11.9 : bouton d'envoi avec intitulé explicite
 * - 11.10 : message d'erreur lié au champ via aria-describedby
 * - 7.1 : aria-busy pendant le chargement
 * - 12.8 : Escape ferme le formulaire, focus rendu au bouton déclencheur
 * - 10.9 : information non transmise par la couleur seule (icône + texte)
 */

import { useEffect, useId, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: "pro" | "pro-multi" | "enterprise";
  plugin: string;
  label: string;
  className?: string;
  locale?: "fr" | "en";
}

/** Libellés du formulaire selon la locale. */
const LIBELLES = {
  fr: {
    labelEmail: "Adresse email",
    placeholder: "vous@exemple.fr",
    soumettre: "Procéder au paiement",
    annuler: "Annuler",
    chargement: "Redirection…",
    erreurFormat: "Format d'email invalide. Veuillez réessayer.",
    erreurDefaut: "Impossible de démarrer le paiement. Réessayez.",
  },
  en: {
    labelEmail: "Email address",
    placeholder: "you@example.com",
    soumettre: "Proceed to payment",
    annuler: "Cancel",
    chargement: "Redirecting…",
    erreurFormat: "Invalid email format. Please try again.",
    erreurDefaut: "Unable to start payment. Please try again.",
  },
} as const;

export default function CheckoutButton({
  plan,
  plugin,
  label,
  className,
  locale = "fr",
}: CheckoutButtonProps) {
  const [formulaireVisible, setFormulaireVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const boutonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const l = LIBELLES[locale] ?? LIBELLES.fr;

  const idInput = useId();
  const idErreur = useId();

  /** Ouvrir le formulaire et placer le focus sur le champ email. */
  function ouvrir() {
    setFormulaireVisible(true);
    setError(null);
    setEmail("");
  }

  /** Fermer le formulaire et restituer le focus au bouton déclencheur. */
  function fermer() {
    setFormulaireVisible(false);
    setLoading(false);
    setError(null);
    setEmail("");
    // Restitution du focus (RGAA 12.8)
    boutonRef.current?.focus();
  }

  /* Focus sur le champ dès l'ouverture. */
  useEffect(() => {
    if (formulaireVisible) {
      inputRef.current?.focus();
    }
  }, [formulaireVisible]);

  /* Escape ferme le formulaire (RGAA 12.8). */
  useEffect(() => {
    if (!formulaireVisible) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        fermer();
      }
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [formulaireVisible]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const emailTrim = email.trim();

    /* Validation basique du format côté client (pré-validation UX). */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError(l.erreurFormat);
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, plugin, email: emailTrim }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? l.erreurDefaut);
      }

      /* Redirection vers Stripe Checkout. */
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  /* --- Bouton initial --- */
  if (!formulaireVisible) {
    return (
      <div className="mb-8">
        <button
          ref={boutonRef}
          type="button"
          onClick={ouvrir}
          className={className}
        >
          {label}
        </button>
      </div>
    );
  }

  /* --- Formulaire inline --- */
  return (
    <div className="mb-8">
      <form onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div className="mb-3">
          <label
            htmlFor={idInput}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {l.labelEmail}
          </label>
          <input
            id={idInput}
            ref={inputRef}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder={l.placeholder}
            aria-describedby={error ? idErreur : undefined}
            aria-invalid={error ? true : undefined}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
              placeholder:text-gray-400
              focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200
              disabled:opacity-50"
          />
          {/* Erreur liée au champ — RGAA 11.10 */}
          {error && (
            <p
              id={idErreur}
              role="alert"
              className="mt-1 text-xs text-red-600 flex items-center gap-1"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
                <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 ${className ?? ""}`}
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  aria-hidden="true"
                  className="animate-spin"
                />
                {l.chargement}
              </>
            ) : (
              l.soumettre
            )}
          </button>

          {/* Annuler — visible uniquement pendant la saisie, pas pendant la redirection */}
          {!loading && (
            <button
              type="button"
              onClick={fermer}
              className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2.5
                text-sm font-semibold text-gray-700
                hover:border-gray-400 hover:bg-gray-50
                transition-colors duration-150"
            >
              {l.annuler}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
