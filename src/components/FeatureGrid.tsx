/**
 * FeatureGrid — Server Component
 * Grille de features réutilisable (landing et page plugin)
 * RGAA 9.3 : liste sémantique avec <ul>/<li>
 */

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon?: LucideIcon;
}

interface FeatureGridProps {
  features: Feature[];
  /** Nombre de colonnes sur desktop (2 ou 3) */
  columns?: 2 | 3;
}

export default function FeatureGrid({
  features,
  columns = 3,
}: FeatureGridProps) {
  return (
    <ul
      role="list"
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
      )}
    >
      {features.map((feature, index) => (
        <li
          key={index}
          className={cn(
            "rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
            "hover:border-violet-200 hover:shadow-md transition-all duration-150"
          )}
        >
          {/* Icône optionnelle — fond violet pastel */}
          {feature.icon && (
            <div
              aria-hidden="true"
              className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600"
            >
              <feature.icon size={16} />
            </div>
          )}

          {/* Titre de la feature */}
          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed">
            {feature.description}
          </p>
        </li>
      ))}
    </ul>
  );
}
