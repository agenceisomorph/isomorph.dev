"use client";

/**
 * Header — Client Component (justification : menu mobile interactif avec état
 * d'ouverture/fermeture, nécessite useState)
 * RGAA 12.1 : liens d'évitement
 * RGAA 12.2 : navigation principale balisée <nav> avec aria-label
 * RGAA 6.1 : intitulés de liens explicites
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

/** Logo SVG inline — zéro requête réseau, éco-conception RGESN */
function IsomorphLogo() {
  return (
    <svg
      width="28"
      height="28"
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

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, children, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-gray-500 hover:text-violet-600 transition-colors duration-150 text-sm font-medium"
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* Lien d'évitement — RGAA 12.1 */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50",
          "focus:bg-violet-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg",
          "focus:text-sm focus:font-medium"
        )}
      >
        Aller au contenu principal
      </a>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + nom */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="ISOMORPH — Retour à l'accueil"
            >
              <IsomorphLogo />
              <span className="font-semibold text-gray-900 text-sm tracking-tight group-hover:text-violet-600 transition-colors duration-150">
                ISOMORPH
              </span>
            </Link>

            {/* Navigation desktop — RGAA 12.2 */}
            <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
              <NavLink href="/plugins">{t("plugins")}</NavLink>
              <NavLink href="/blog">{t("blog")}</NavLink>
              <NavLink href="/about">{t("about")}</NavLink>
              <NavLink
                href="https://github.com/isomorph-agency"
              >
                {t("github")}
              </NavLink>
            </nav>

            {/* Contrôles droite */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {/* Bouton menu mobile */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                className={cn(
                  "md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100",
                  "transition-colors duration-150"
                )}
              >
                {mobileOpen ? (
                  <X size={20} aria-hidden="true" />
                ) : (
                  <Menu size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile — RGAA 12.2 : accessible au clavier */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <nav
              aria-label="Navigation mobile"
              className="flex flex-col gap-1 px-4 py-4"
            >
              <NavLink href="/plugins" onClick={closeMobile}>
                {t("plugins")}
              </NavLink>
              <NavLink href="/blog" onClick={closeMobile}>
                {t("blog")}
              </NavLink>
              <NavLink href="/about" onClick={closeMobile}>
                {t("about")}
              </NavLink>
              <NavLink
                href="https://github.com/isomorph-agency"
                onClick={closeMobile}
              >
                {t("github")}
              </NavLink>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
