/**
 * Footer — Server Component
 * RGAA 12.6 : liens vers plan du site et contact accessibles
 * RGAA 6.1 : intitulés de liens explicites (pas de "cliquez ici")
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Logo ISOMORPH SVG inline */
function IsomorphLogo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="28" height="28" rx="6" fill="#7C3AED" />
      <path
        d="M8 14h12M14 8v12"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="3" fill="white" />
    </svg>
  );
}

/** Icône GitHub SVG inline */
function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/** Icône npm SVG inline */
function NpmIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
    </svg>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Colonne marque */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group"
              aria-label="ISOMORPH — Retour à l'accueil"
            >
              <IsomorphLogo />
              <span className="font-semibold text-gray-900 text-sm tracking-tight group-hover:text-violet-600 transition-colors duration-150">
                ISOMORPH
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-xs">
              {t("tagline")}
            </p>
            {/* Liens réseaux sociaux */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://github.com/isomorph-agency"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ISOMORPH sur GitHub (ouvre dans un nouvel onglet)"
                className="text-gray-400 hover:text-gray-700 transition-colors duration-150"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://www.npmjs.com/~isomorph-agency"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ISOMORPH sur npm (ouvre dans un nouvel onglet)"
                className="text-gray-400 hover:text-gray-700 transition-colors duration-150"
              >
                <NpmIcon />
              </a>
            </div>
          </div>

          {/* Colonne plugins */}
          <nav aria-label="Liens plugins">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Plugins
            </h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link
                  href="/plugins/strapi-comments"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  strapi-plugin-comments
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-300 cursor-default">
                  Plus à venir…
                </span>
              </li>
            </ul>
          </nav>

          {/* Colonne ressources */}
          <nav aria-label="Liens ressources">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Ressources
            </h3>
            <ul className="space-y-3" role="list">
              <li>
                <a
                  href="https://github.com/isomorph-agency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  {t("links.github")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/~isomorph-agency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  {t("links.npm")}
                </a>
              </li>
            </ul>
          </nav>

          {/* Colonne société */}
          <nav aria-label="Liens société">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              ISOMORPH
            </h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  {t("links.about")}
                </Link>
              </li>
              <li>
                <a
                  href="https://isomorph.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  isomorph.fr
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@isomorph.fr"
                  className="text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
                >
                  contact@isomorph.fr
                </a>
              </li>
              {/* Lien admin — discret, en bas de colonne */}
              <li>
                <Link
                  href="/admin/licenses"
                  className="text-xs text-gray-300 hover:text-gray-500 transition-colors duration-150"
                  aria-label="Accès administration licences (réservé à ISOMORPH)"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Barre de copyright */}
        <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} {t("legal.copyright")}
          </p>
          <p className="text-xs text-gray-400">{t("legal.license")}</p>
        </div>
      </div>
    </footer>
  );
}
