import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Redirections 301 permanentes.
   *
   * - /[locale]/about → /[locale] : page about supprimée, redirecte vers l'accueil.
   * - /[locale]/plugins/strapi-comments → /[locale]/plugins/comments :
   *   ancien slug renommé.
   *
   * Les deux locales (fr et en) sont couvertes par le segment :locale.
   */
  async redirects() {
    return [
      {
        source: "/:locale/about",
        destination: "/:locale",
        permanent: true,
      },
      {
        source: "/:locale/plugins/strapi-comments",
        destination: "/:locale/plugins/comments",
        permanent: true,
      },
      // Sans préfixe de locale (au cas où le middleware redirige d'abord)
      {
        source: "/about",
        destination: "/",
        permanent: true,
      },
      {
        source: "/plugins/strapi-comments",
        destination: "/plugins/comments",
        permanent: true,
      },
    ];
  },

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
              // + tuiles OpenFreeMap (carte MapLibre dans l'atelier)
              "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://tiles.openfreemap.org",
              // Workers MapLibre 6 servis en blob: depuis la même origine (voir carte/chargeur.ts)
              "worker-src 'self' blob:",
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
