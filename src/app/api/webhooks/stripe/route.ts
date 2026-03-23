/**
 * Route API : Webhook Stripe
 *
 * POST /api/webhooks/stripe
 *
 * Écoute les événements Stripe pour gérer le cycle de vie des licences :
 * - checkout.session.completed     → Création de la licence
 * - customer.subscription.deleted  → Révocation de la licence
 * - customer.subscription.updated  → Mise à jour de la date d'expiration
 * - invoice.payment_failed         → Marquage de la licence comme expirée
 *
 * Sécu :
 * - Vérification de la signature HMAC via stripe.webhooks.constructEvent
 * - Lecture du corps brut (raw body) obligatoire pour la vérification Stripe
 * - Fail-closed : toute erreur de vérification renvoie 400
 * - Les erreurs métier (licence introuvable) ne renvoient PAS 5xx pour éviter
 *   les retry Stripe infinis sur des événements non récupérables
 *
 * Important Next.js App Router :
 * La route doit désactiver le body parsing par défaut pour lire le raw body.
 */

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import {
  createLicense,
  getLicenseBySubscriptionId,
  updateLicense,
  revokeLicense,
} from "@/lib/license";
import type { PluginId, LicensePlan } from "@/lib/license";

// ---------------------------------------------------------------------------
// Configuration Next.js — désactiver le body parser pour lire le raw body
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Initialisation Stripe
// ---------------------------------------------------------------------------

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY n'est pas défini");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

// ---------------------------------------------------------------------------
// Handler POST
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Récupérer le secret de signature webhook
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET n'est pas configuré");
    return NextResponse.json(
      { error: "Configuration webhook manquante" },
      { status: 500 }
    );
  }

  // Lire le corps brut (obligatoire pour la vérification de signature Stripe)
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[webhook] Requête sans header stripe-signature rejetée");
    return NextResponse.json(
      { error: "Signature manquante" },
      { status: 400 }
    );
  }

  // --- Vérification cryptographique de la signature ---
  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.warn("[webhook] Signature invalide:", (error as Error).message);
    return NextResponse.json(
      { error: "Signature webhook invalide" },
      { status: 400 }
    );
  }

  console.log(`[webhook] Événement reçu : ${event.type} (${event.id})`);

  // --- Dispatch des événements ---
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Événement non géré — on répond 200 pour éviter les retry Stripe
        console.log(`[webhook] Événement ignoré : ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(`[webhook] Erreur lors du traitement de ${event.type}:`, error);
    // Renvoyer 500 uniquement pour les erreurs inattendues → Stripe retentera
    return NextResponse.json(
      { error: "Erreur lors du traitement de l'événement" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Handlers d'événements
// ---------------------------------------------------------------------------

/**
 * Traite la complétion d'une session Stripe Checkout
 * → Crée la licence et l'enregistre dans licenses.json
 *
 * @param session - Session Stripe complétée
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const { metadata, customer, subscription, customer_details } = session;

  if (!metadata?.plugin || !metadata?.plan) {
    console.warn("[webhook] checkout.session.completed : metadata plugin/plan manquantes", {
      sessionId: session.id,
    });
    return;
  }

  if (!subscription || !customer) {
    console.warn("[webhook] checkout.session.completed : subscription ou customer manquant", {
      sessionId: session.id,
    });
    return;
  }

  const email = customer_details?.email ?? session.customer_email ?? "";
  if (!email) {
    console.warn("[webhook] checkout.session.completed : email introuvable", {
      sessionId: session.id,
    });
    return;
  }

  // Normaliser les IDs (peuvent être des objets expandés ou des strings)
  const customerId = typeof customer === "string" ? customer : customer.id;
  const subscriptionId = typeof subscription === "string" ? subscription : subscription.id;

  const license = createLicense({
    email,
    plan: metadata.plan as LicensePlan,
    plugin: metadata.plugin as PluginId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  console.log(`[webhook] Licence créée : ${license.key} pour ${email} (${metadata.plan})`);

  // TODO V2 : envoyer la licence par email via Resend / SES
}

/**
 * Traite la suppression d'un abonnement Stripe
 * → Révoque la licence associée
 *
 * @param subscription - Abonnement Stripe supprimé
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const license = getLicenseBySubscriptionId(subscription.id);

  if (!license) {
    console.warn("[webhook] customer.subscription.deleted : licence introuvable", {
      subscriptionId: subscription.id,
    });
    return;
  }

  revokeLicense(license.id);
  console.log(`[webhook] Licence révoquée : ${license.key} (abonnement annulé)`);
}

/**
 * Traite la mise à jour d'un abonnement Stripe
 * → Met à jour la date d'expiration de la licence
 *
 * @param subscription - Abonnement Stripe mis à jour
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const license = getLicenseBySubscriptionId(subscription.id);

  if (!license) {
    console.warn("[webhook] customer.subscription.updated : licence introuvable", {
      subscriptionId: subscription.id,
    });
    return;
  }

  // Mettre à jour la date d'expiration selon la période en cours
  if (subscription.current_period_end) {
    const newExpiresAt = new Date(subscription.current_period_end * 1000).toISOString();
    updateLicense(license.id, { expiresAt: newExpiresAt, status: "active" });
    console.log(`[webhook] Licence mise à jour : ${license.key}, expiration → ${newExpiresAt}`);
  }
}

/**
 * Traite l'échec de paiement d'une facture Stripe
 * → Marque la licence comme expirée
 *
 * @param invoice - Facture Stripe dont le paiement a échoué
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subscriptionId) {
    console.warn("[webhook] invoice.payment_failed : subscriptionId introuvable");
    return;
  }

  const license = getLicenseBySubscriptionId(subscriptionId);

  if (!license) {
    console.warn("[webhook] invoice.payment_failed : licence introuvable", { subscriptionId });
    return;
  }

  updateLicense(license.id, { status: "expired" });
  console.log(`[webhook] Licence expirée (paiement échoué) : ${license.key}`);

  // TODO V2 : notifier l'utilisateur par email du problème de paiement
}

// Méthodes non autorisées
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
