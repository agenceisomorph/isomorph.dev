/**
 * Route API : Création d'une session Stripe Checkout
 *
 * POST /api/checkout
 * Body: { plan: "pro" | "enterprise", email: string, plugin: string }
 *
 * Sécu :
 * - Validation manuelle des inputs (pas de Zod pour garder le bundle léger)
 * - La clé secrète Stripe n'est accessible que côté serveur
 * - Enterprise n'est pas disponible via checkout automatisé → renvoi vers contact
 * - Rate limiting à implémenter en V2 (middleware Vercel Edge)
 *
 * Perf : Server Route — aucun JS ajouté au bundle client
 */

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckoutBody {
  plan: string;
  email: string;
  plugin: string;
}

// ---------------------------------------------------------------------------
// Initialisation Stripe (lazy — évite l'initialisation au build)
// ---------------------------------------------------------------------------

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY n'est pas défini dans les variables d'environnement");
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
  try {
    // --- Lecture et validation du corps de la requête ---
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête JSON invalide" },
        { status: 400 }
      );
    }

    const { plan, email, plugin } = body as Partial<CheckoutBody>;

    // Validation des champs obligatoires
    if (!plan || !email || !plugin) {
      return NextResponse.json(
        { error: "Les champs plan, email et plugin sont requis" },
        { status: 400 }
      );
    }

    // Validation du plan
    if (plan !== "pro" && plan !== "enterprise") {
      return NextResponse.json(
        { error: "Le plan doit être 'pro' ou 'enterprise'" },
        { status: 400 }
      );
    }

    // Enterprise → pas de checkout automatique
    if (plan === "enterprise") {
      return NextResponse.json(
        {
          error: "Le plan Enterprise nécessite un devis personnalisé",
          contactUrl: "mailto:contact@isomorph.fr?subject=Enterprise License",
        },
        { status: 422 }
      );
    }

    // Validation du format email (vérification basique)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Validation du plugin
    const allowedPlugins = ["comments"];
    if (!allowedPlugins.includes(plugin)) {
      return NextResponse.json(
        { error: `Plugin non reconnu. Valeurs acceptées : ${allowedPlugins.join(", ")}` },
        { status: 400 }
      );
    }

    // Vérification de la variable de prix Stripe
    const priceId = process.env.STRIPE_PRICE_PRO;
    if (!priceId) {
      console.error("[checkout] STRIPE_PRICE_PRO n'est pas configuré");
      return NextResponse.json(
        { error: "Configuration de paiement indisponible" },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://isomorph.dev";

    // --- Création de la session Stripe Checkout ---
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Métadonnées transmises au webhook pour la création de licence
      metadata: {
        plugin,
        plan,
      },
      subscription_data: {
        metadata: {
          plugin,
          plan,
        },
      },
      // URLs de redirection après paiement
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      // Options UX
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "fr",
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas retourné d'URL de checkout");
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) {
    // Erreur Stripe connue — vérification par type guard
    if (
      error !== null &&
      typeof error === "object" &&
      "type" in error &&
      typeof (error as { type: unknown }).type === "string" &&
      (error as { type: string }).type.startsWith("Stripe")
    ) {
      const stripeErr = error as unknown as { message: string };
      console.error("[checkout] Erreur Stripe:", stripeErr.message);
      return NextResponse.json(
        { error: "Erreur lors de la création du paiement. Veuillez réessayer." },
        { status: 502 }
      );
    }

    // Erreur inattendue
    console.error("[checkout] Erreur inattendue:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Méthodes non autorisées
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Méthode non autorisée" }, { status: 405 });
}
