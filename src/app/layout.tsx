import type { Metadata } from "next";
import { Archivo_Black, Jost } from "next/font/google";
import "./globals.css";

/**
 * Root layout — html/body uniquement.
 *
 * Design noir et blanc : Archivo Black pour les titres, Jost pour le texte,
 * fond blanc par défaut. Les pages en mode Console (atelier) ajustent
 * elles-mêmes leur fond sombre.
 *
 * RGESN : polices chargées via next/font (pas d'import réseau depuis le navigateur).
 */

const texte = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const titre = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

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
    <html lang="fr" suppressHydrationWarning className={`${texte.variable} ${titre.variable}`}>
      <body className="antialiased bg-blanc text-noir">
        {children}
      </body>
    </html>
  );
}
