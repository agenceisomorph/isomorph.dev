import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * Root layout — niveau html/body uniquement
 *
 * Remarque architecture : avec Next.js App Router + next-intl, le segment
 * dynamique [locale] est un layout enfant. Le root layout ne reçoit pas
 * les params de segments enfants. L'attribut lang est donc défini ici à
 * "en" par défaut — next-intl gère la locale effective via son middleware
 * et les balises hreflang dans generateMetadata du layout [locale].
 *
 * Geist chargée via le package officiel Vercel (zero layout shift, RGESN)
 * suppressHydrationWarning requis pour éviter le warning de dark mode
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://isomorph.dev"),
  title: {
    default: "ISOMORPH — Open Source Plugins for Strapi",
    template: "%s | ISOMORPH",
  },
  description:
    "Production-ready open source plugins for Strapi V5. Secure, performant, and framework-agnostic.",
  openGraph: {
    type: "website",
    siteName: "ISOMORPH",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
