import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * En-têtes de sécurité HTTP — OWASP / ISOMORPH SecOps standard
   * Appliqués sur toutes les routes
   */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Stripe.js nécessite l'exécution de scripts depuis js.stripe.com
              // 'unsafe-inline' conservé pour Next.js inline scripts (à restreindre en V2 avec nonce)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              // Stripe héberge des assets statiques (logo, icônes) — q.stripe.com pour les pixels
              "img-src 'self' data: blob: https://*.stripe.com",
              "font-src 'self'",
              // Connexions API Stripe (checkout sessions, webhooks côté client SDK)
              "connect-src 'self' https://api.stripe.com https://checkout.stripe.com",
              // iframe Stripe Checkout (3D Secure, formulaire de carte embarqué)
              "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
