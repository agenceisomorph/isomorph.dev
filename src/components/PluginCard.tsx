/**
 * PluginCard — Server Component
 * Card réutilisable pour le catalogue de plugins
 * RGAA 4.1 : images décoratives avec alt vide, images informatives avec alt pertinent
 * RGAA 6.1 : le lien "View Details" porte le nom du plugin pour être explicite
 */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Download, Tag, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PluginCardData {
  /** Identifiant unique du plugin (slug URL) */
  slug: string;
  /** Nom du package npm */
  name: string;
  /** Description courte (1-2 phrases) */
  description: string;
  /** Version actuelle */
  version: string;
  /** Type de licence */
  license: string;
  /** Nombre approximatif de téléchargements (affiché) */
  downloads?: string;
  /** Compatibilité Strapi */
  strapiVersion: string;
  /** Si le plugin est mis en avant */
  featured?: boolean;
}

interface PluginCardProps {
  plugin: PluginCardData;
  /** Affichage horizontal (landing page) ou vertical (catalogue) */
  variant?: "default" | "featured";
}

export default function PluginCard({
  plugin,
  variant = "default",
}: PluginCardProps) {
  const t = useTranslations("plugins");

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-zinc-900/40 p-6",
        "border-zinc-800 hover:border-violet-500/50",
        "transition-all duration-200",
        variant === "featured" && "sm:p-8"
      )}
    >
      {/* Badge "featured" */}
      {plugin.featured && (
        <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-violet-600/20 border border-violet-500/30 px-2.5 py-0.5 text-xs font-medium text-violet-400">
          {t("badges.license")}
        </span>
      )}

      {/* Icône plugin */}
      <div
        aria-hidden="true"
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 text-violet-500"
      >
        <Box size={20} />
      </div>

      {/* Nom du plugin — code monospace */}
      <h3
        className={cn(
          "font-mono font-semibold text-zinc-100 mb-2",
          variant === "featured" ? "text-lg" : "text-base"
        )}
      >
        {plugin.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-500 leading-relaxed mb-5">
        {plugin.description}
      </p>

      {/* Badges métadonnées */}
      <div className="flex flex-wrap gap-2 mb-5" aria-label="Métadonnées du plugin">
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
          <Tag size={11} aria-hidden="true" />
          v{plugin.version}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
          {plugin.license}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
          Strapi {plugin.strapiVersion}
        </span>
        {plugin.downloads && (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
            <Download size={11} aria-hidden="true" />
            {plugin.downloads}
          </span>
        )}
      </div>

      {/* Lien vers la page détaillée — RGAA 6.1 : intitulé explicite */}
      <Link
        href={`/plugins/${plugin.slug}`}
        aria-label={`${t("viewDetails")} — ${plugin.name}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors duration-150"
      >
        {t("viewDetails")}
        <ArrowRight
          size={14}
          aria-hidden="true"
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}
