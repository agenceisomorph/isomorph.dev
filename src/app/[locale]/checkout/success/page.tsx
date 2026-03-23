/**
 * Page de succès après paiement Stripe
 *
 * /[locale]/checkout/success?session_id=cs_...
 *
 * Récupère la session Stripe côté serveur pour afficher la clé de licence.
 * La clé est stockée dans licenses.json via le webhook — cette page la retrouve
 * par le stripeSubscriptionId contenu dans la session.
 *
 * Perf : Server Component pur — aucun JS client ajouté
 * RGAA 9.1 : h1 unique
 * RGAA 6.1 : liens avec intitulés explicites
 * RGAA 10.9 : informations non transmises uniquement par la couleur
 *
 * Sécu :
 * - La clé secrète Stripe n'est jamais exposée au client
 * - session_id validé côté serveur uniquement
 * - Si session invalide → message d'erreur sans fuite de détails
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle, Copy, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import Stripe from "stripe";
import { getLicenseBySubscriptionId } from "@/lib/license";
import { Link } from "@/i18n/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

// ---------------------------------------------------------------------------
// Métadonnées
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout.success" });

  return {
    title: t("title"),
    description: t("description"),
    // Empêcher l'indexation de la page de succès (données personnelles)
    robots: { index: false, follow: false },
  };
}

// ---------------------------------------------------------------------------
// Initialisation Stripe (côté serveur uniquement)
// ---------------------------------------------------------------------------

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquant");
  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

// ---------------------------------------------------------------------------
// Composant de copie de clé — Client Component minimal
// ---------------------------------------------------------------------------

/**
 * Bouton de copie de la clé de licence
 * Justification "use client" : interaction clipboard (navigator.clipboard.writeText)
 * Impact bundle : < 1 kB (logique minimale, pas de dépendance externe)
 */
import CopyKeyButton from "./CopyKeyButton";

// ---------------------------------------------------------------------------
// Page principale (Server Component)
// ---------------------------------------------------------------------------

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout.success" });

  // --- Récupération de la session Stripe et de la licence ---
  let licenseKey: string | null = null;
  let customerEmail: string | null = null;
  let errorMessage: string | null = null;

  if (session_id && typeof session_id === "string") {
    try {
      const stripe = getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["subscription"],
      });

      customerEmail = session.customer_details?.email ?? null;

      // Retrouver la licence via l'ID d'abonnement
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        // Attente courte : le webhook peut arriver légèrement après le redirect
        // En production, prévoir une page de polling ou un email de confirmation
        const license = getLicenseBySubscriptionId(subscriptionId);
        if (license) {
          licenseKey = license.key;
        }
      }
    } catch (err) {
      console.error("[checkout/success] Erreur récupération session:", err);
      errorMessage = t("errorRetrieve");
    }
  } else {
    errorMessage = t("errorNoSession");
  }

  // ---------------------------------------------------------------------------
  // Rendu — état d'erreur
  // ---------------------------------------------------------------------------

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
          <AlertCircle
            size={32}
            className="text-red-400"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">
          {t("errorTitle")}
        </h1>
        <p className="text-zinc-500 mb-8">{errorMessage}</p>
        <a
          href="mailto:contact@isomorph.fr"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150"
        >
          {t("contactSupport")}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Rendu — succès
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20">
      {/* Icône de succès */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-600/10 mb-6">
          <CheckCircle
            size={32}
            className="text-violet-400"
            aria-hidden="true"
          />
        </div>

        {/* RGAA 9.1 : h1 unique de la page */}
        <h1 className="text-3xl font-bold text-zinc-100 mb-3">
          {t("title")}
        </h1>
        <p className="text-zinc-500">
          {customerEmail ? t("descriptionWithEmail", { email: customerEmail }) : t("description")}
        </p>
      </div>

      {/* Carte clé de licence */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-600/5 p-6 sm:p-8 mb-8">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
          {t("licenseKeyLabel")}
        </p>

        {licenseKey ? (
          <>
            {/* Clé affichée — aria-label pour les lecteurs d'écran */}
            <div className="flex items-center gap-3 mb-4">
              <code
                className="flex-1 font-mono text-sm sm:text-base text-zinc-100 bg-zinc-900 rounded-lg px-4 py-3 border border-zinc-700 break-all"
                aria-label={`${t("licenseKeyLabel")} : ${licenseKey}`}
              >
                {licenseKey}
              </code>
              {/* Bouton de copie — Client Component justifié */}
              <CopyKeyButton licenseKey={licenseKey} label={t("copyKey")} copiedLabel={t("copied")} />
            </div>
            <p className="text-xs text-zinc-600">
              {t("saveKeyWarning")}
            </p>
          </>
        ) : (
          /* Cas où le webhook n'a pas encore créé la licence */
          <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3">
            <p className="text-sm text-zinc-400">
              {t("licenseGenerating")}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {t("licenseGeneratingHint")}
            </p>
          </div>
        )}
      </div>

      {/* Instructions d'installation */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 mb-8">
        <h2 className="text-base font-semibold text-zinc-100 mb-4">
          {t("installTitle")}
        </h2>
        <ol className="space-y-3" role="list">
          {[
            t("installStep1"),
            t("installStep2"),
            t("installStep3"),
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span
                className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-sm text-zinc-400 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://github.com/isomorph-agency/strapi-plugin-comments"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150"
        >
          <BookOpen size={16} aria-hidden="true" />
          {t("readDocs")}
        </a>
        <Link
          href="/plugins/strapi-comments"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150"
        >
          {t("backToPlugin")}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
