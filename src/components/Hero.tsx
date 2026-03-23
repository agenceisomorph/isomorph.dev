/**
 * Hero — Server Component
 * Section hero principale de la landing page
 * RGAA 9.1 : structure de titres cohérente (h1 unique par page)
 * Éco-conception : fond décoratif CSS pur, pas d'image raster
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Github } from "lucide-react";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      aria-label="Introduction ISOMORPH"
      className="relative overflow-hidden bg-white pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      {/* Gradient radial décoratif — fond blanc, halo violet très léger */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[700px] w-[700px] rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      {/* Grille de points décorative — opacité réduite pour fond clair */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge version */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs text-violet-700 mb-8">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500"
          />
          {t("badge")}
        </div>

        {/* Titre principal — RGAA 9.1 : h1 unique */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          {t("title")}{" "}
          <span className="text-gradient-violet">{t("titleAccent")}</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-lg sm:text-xl font-medium text-gray-600 mb-4">
          {t("subtitle")}
        </p>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-base text-gray-500 mb-10 leading-relaxed">
          {t("description")}
        </p>

        {/* CTAs — RGAA 6.1 : intitulés explicites */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/plugins"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all duration-150 shadow-sm hover:shadow-md min-w-[160px] justify-center"
          >
            {t("cta")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/isomorph-agency"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("ctaSecondary")} (ouvre dans un nouvel onglet)`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-150 min-w-[160px] justify-center"
          >
            <Github size={16} aria-hidden="true" />
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
