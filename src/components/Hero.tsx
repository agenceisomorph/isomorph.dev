/**
 * Hero — Server Component
 * Section hero principale de la landing page
 * RGAA 9.1 : structure de titres cohérente (h1 unique par page)
 * Éco-conception : fond SVG inline au lieu d'une image raster
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Github } from "lucide-react";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section
      aria-label="Introduction ISOMORPH"
      className="relative overflow-hidden bg-zinc-950 pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      {/* Fond décoratif SVG — éco-conception, pas d'image raster */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      {/* Grille de points décorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #52525b 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge version */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400 mb-8">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-violet-500"
          />
          {t("badge")}
        </div>

        {/* Titre principal — RGAA 9.1 : h1 unique */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-100 mb-6">
          {t("title")}{" "}
          <span className="text-gradient-violet">{t("titleAccent")}</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-lg sm:text-xl font-medium text-zinc-300 mb-4">
          {t("subtitle")}
        </p>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-base text-zinc-500 mb-10 leading-relaxed">
          {t("description")}
        </p>

        {/* CTAs — RGAA 6.1 : intitulés explicites */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/plugins"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150 min-w-[160px] justify-center"
          >
            {t("cta")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/isomorph-agency"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t("ctaSecondary")} (ouvre dans un nouvel onglet)`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150 min-w-[160px] justify-center"
          >
            <Github size={16} aria-hidden="true" />
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
