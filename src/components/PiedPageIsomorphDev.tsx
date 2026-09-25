/**
 * Pied de page d'isomorph.dev — système Console.
 *
 * Liens légaux : mentions-légales, confidentialité, cgv.
 * Liens navigation : Plugins, Code, Expérimentations, Veille.
 * GitHub et npm publics.
 *
 * Server Component : pas d'interactivité.
 * RGAA 12.6 : nav nommée.
 * RGAA 6.1 : intitulés explicites.
 */

import Link from "next/link";
import IsomorphLogo from "@/components/IsomorphLogo";

/* ------------------------------------------------------------------ */
/* Icônes SVG inline (zéro requête réseau, éco-conception)            */
/* ------------------------------------------------------------------ */

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NpmIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

interface Props {
  locale?: "fr" | "en";
}

export default function PiedPageIsomorphDev({ locale = "fr" }: Props) {
  const annee = new Date().getFullYear();
  const l = locale;

  const liensPrincipaux = [
    { libelle: l === "fr" ? "Plugins" : "Plugins", href: `/${l}/plugins` },
    { libelle: l === "fr" ? "Code" : "Code", href: `/${l}/code` },
    { libelle: l === "fr" ? "Expérimentations" : "Experiments", href: `/${l}/experimentations` },
    { libelle: l === "fr" ? "Veille" : "Tech watch", href: `/${l}/veille` },
  ];

  const liensLegaux = [
    {
      libelle: l === "fr" ? "Mentions légales" : "Legal notice",
      href: `/${l}/mentions-legales`,
    },
    {
      libelle: l === "fr" ? "Confidentialité" : "Privacy",
      href: `/${l}/confidentialite`,
    },
    {
      libelle: l === "fr" ? "CGV" : "Terms of sale",
      href: `/${l}/cgv`,
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--cs-trait)",
        background: "var(--cs-fond-2)",
        color: "var(--cs-texte-3)",
      }}
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* Marque */}
          <div>
            <Link
              href={`/${l}`}
              aria-label={l === "fr" ? "Accueil ISOMORPH" : "ISOMORPH home"}
              className="inline-flex items-center mb-4"
            >
              <IsomorphLogo
                className="h-[12px] w-auto [color:var(--cs-texte-2)]"
              />
            </Link>
            <div className="flex items-center gap-3 mt-3">
              <a
                href="https://github.com/agenceisomorph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  l === "fr"
                    ? "ISOMORPH sur GitHub (ouvre dans un nouvel onglet)"
                    : "ISOMORPH on GitHub (opens in new tab)"
                }
                style={{ color: "var(--cs-texte-3)" }}
                className="hover:opacity-100 opacity-70 transition-opacity duration-150"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://www.npmjs.com/~isomorph-agency"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  l === "fr"
                    ? "ISOMORPH sur npm (ouvre dans un nouvel onglet)"
                    : "ISOMORPH on npm (opens in new tab)"
                }
                style={{ color: "var(--cs-texte-3)" }}
                className="hover:opacity-100 opacity-70 transition-opacity duration-150"
              >
                <NpmIcon />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label={l === "fr" ? "Liens du site" : "Site links"}>
            <ul role="list" className="space-y-2">
              {liensPrincipaux.map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="type-caption hover:opacity-100 opacity-70 transition-opacity duration-150"
                    style={{ color: "var(--cs-texte-3)" }}
                  >
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Légal */}
          <nav aria-label={l === "fr" ? "Liens légaux" : "Legal links"}>
            <ul role="list" className="space-y-2">
              {liensLegaux.map((lien) => (
                <li key={lien.href}>
                  <Link
                    href={lien.href}
                    className="type-caption hover:opacity-100 opacity-70 transition-opacity duration-150"
                    style={{ color: "var(--cs-texte-3)" }}
                  >
                    {lien.libelle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Barre de copyright */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
          style={{ borderTop: "1px solid var(--cs-trait)" }}
        >
          <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
            &copy; {annee} ISOMORPH.{" "}
            {l === "fr" ? "Tous droits réservés." : "All rights reserved."}
          </p>
          <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
            {l === "fr" ? "Plugins publiés sous licence MIT." : "Plugins published under MIT license."}
          </p>
        </div>
      </div>
    </footer>
  );
}
