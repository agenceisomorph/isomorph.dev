"use client";

/**
 * Filtre Quotidienne / Hebdomadaire pour la liste des éditions de veille.
 *
 * Calqué sur `console/pages/FiltreThemes.tsx` (mêmes classes `csArt*`, même
 * comportement), adapté à un choix fixe de deux thèmes plutôt qu'une liste
 * dynamique de catégories d'articles.
 *
 * RGAA 4.1 :
 *   - Critère 11.2 : aria-pressed sur chaque bouton bascule.
 *   - Critère 7.1 : aria-live="polite" annonce le nombre de résultats.
 *   - Critère 11.1 : hauteur minimale 44 px sur chaque bouton.
 */

import type { TypeVeille } from "@/lib/veille";
import { StylesArticles } from "../console/pages/CarteArticle";
import { StylesConsole } from "../console/fondations";

export interface FiltreTypeVeilleProps {
  actif: TypeVeille | "";
  compteurs: Record<TypeVeille, number>;
  total: number;
  resultats: number;
  locale?: string;
  onChange: (type: TypeVeille | "") => void;
}

const LIBELLES = {
  fr: { tous: "Toutes", quotidienne: "Quotidienne", hebdomadaire: "Hebdomadaire" },
  en: { tous: "All", quotidienne: "Daily", hebdomadaire: "Weekly" },
} as const;

export function FiltreTypeVeille({
  actif,
  compteurs,
  total,
  resultats,
  locale = "fr",
  onChange,
}: FiltreTypeVeilleProps) {
  const libelles = locale === "en" ? LIBELLES.en : LIBELLES.fr;
  const messageAnnonce =
    locale === "en"
      ? `${resultats} edition${resultats > 1 ? "s" : ""}`
      : `${resultats} édition${resultats > 1 ? "s" : ""}`;

  return (
    <div>
      <StylesConsole />
      <StylesArticles />

      <p aria-live="polite" aria-atomic="true" className="csArtAnnonce">
        {messageAnnonce}
      </p>

      <div
        role="group"
        aria-label={locale === "en" ? "Filter by frequency" : "Filtrer par fréquence"}
        className="csArtFiltreZone"
      >
        <button
          type="button"
          aria-pressed={actif === ""}
          className="csArtFiltreBtn"
          onClick={() => onChange("")}
        >
          {libelles.tous}
          <span aria-hidden="true" className="csArtFiltreCount">
            {total}
          </span>
        </button>

        {(["quotidienne", "hebdomadaire"] as const).map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={actif === type}
            className="csArtFiltreBtn"
            onClick={() => onChange(type)}
          >
            {libelles[type]}
            <span aria-hidden="true" className="csArtFiltreCount">
              {compteurs[type]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
