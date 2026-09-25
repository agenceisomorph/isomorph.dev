import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Introuvable } from "@/components/console/erreurs/Introuvable";
import { StylesConsole } from "@/components/console/fondations";
import BarreIsomorphDev from "@/components/BarreIsomorphDev";
import PiedPageIsomorphDev from "@/components/PiedPageIsomorphDev";
import "./globals.css";

/**
 * 404 globale — adresses hors de tout segment de locale.
 *
 * Porte elle-même le chrome (html, body, barre, pied de page) car elle n'hérite
 * d'aucune mise en page quand Next.js la sert hors du segment [locale].
 *
 * Langue : français par défaut (les adresses hors locale n'ont pas de locale
 * connue ; le middleware redirige la plupart vers /fr ou /en).
 *
 * noindex : une page introuvable ne doit pas être indexée.
 */
export const metadata: Metadata = {
  title: "Page introuvable • ISOMORPH",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased" style={{ background: "#02060d", color: "#ffffff" }}>
        <div
          className="flex min-h-screen flex-col"
          style={{ background: "var(--cs-fond)", color: "var(--cs-texte)" }}
        >
          <BarreIsomorphDev />
          <main id="main-content" className="flex-1 pt-16" tabIndex={-1}>
            <StylesConsole />
            <Introuvable />
          </main>
          <PiedPageIsomorphDev locale="fr" />
        </div>
      </body>
    </html>
  );
}
