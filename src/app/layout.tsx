import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/**
 * Root layout — html/body uniquement.
 *
 * Fond sombre : le système Console utilise --cs-fond (#02060d) déclaré
 * dans StylesConsole. Le body reçoit la même couleur pour éviter le flash
 * blanc au chargement.
 *
 * lang="fr" par défaut ; next-intl injecte la vraie locale via le layout
 * [locale] enfant.
 *
 * Geist chargée via le package Vercel officiel (zéro réseau, RGESN).
 */

export const metadata: Metadata = {
  metadataBase: new URL("https://isomorph.dev"),
  title: {
    default: "ISOMORPH, plugins et code pour Strapi",
    template: "%s | ISOMORPH",
  },
  description:
    "Plugins Strapi open source, outils, expérimentations et veille technique de l'agence ISOMORPH.",
  openGraph: {
    type: "website",
    siteName: "ISOMORPH",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased" style={{ background: "#02060d", color: "#ffffff" }}>
        {children}
      </body>
    </html>
  );
}
