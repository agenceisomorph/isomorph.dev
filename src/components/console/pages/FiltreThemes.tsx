"use client";

/**
 * Barre de filtrage par thème pour la liste d'articles.
 *
 * Boutons bascule (aria-pressed) : "Tous" puis un par thème présent.
 * Le nombre d'articles par thème est affiché dans chaque bouton.
 * Une région aria-live annonce le nombre de résultats après changement.
 *
 * RGAA 4.1 :
 *   - Critère 11.2 : aria-pressed sur chaque bouton bascule.
 *   - Critère 7.1 : aria-live="polite" aria-atomic="true" pour l'annonce.
 *   - Critère 10.7 : focus sans outline, s'allume comme au survol.
 *   - Critère 11.1 : hauteur minimale 44 px sur chaque bouton.
 * Pas de select natif.
 */

import { StylesArticles } from "./CarteArticle";
import { StylesConsole } from "../fondations";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ThemeFiltre {
  nom: string;
  count: number;
}

export interface FiltreThemesProps {
  themes: ThemeFiltre[];
  /** Thème actif. Chaîne vide = "Tous". */
  actif: string;
  /** Nombre total d'articles (tous thèmes). */
  total: number;
  /** Nombre d'articles après filtrage. */
  resultats: number;
  onChange: (theme: string) => void;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export function FiltreThemes({ themes, actif, total, resultats, onChange }: FiltreThemesProps) {
  const messageAnnonce =
    actif === ""
      ? `${total} article${total > 1 ? "s" : ""}`
      : `${resultats} article${resultats > 1 ? "s" : ""} sur le thème ${actif}`;

  return (
    <div>
      <StylesConsole />
      <StylesArticles />

      {/* Annonce lecteur d'écran du nombre de résultats (visuellement masquée). */}
      <p aria-live="polite" aria-atomic="true" className="csArtAnnonce">
        {messageAnnonce}
      </p>

      <div role="group" aria-label="Filtrer par thème" className="csArtFiltreZone">
        <button
          type="button"
          aria-pressed={actif === ""}
          className="csArtFiltreBtn"
          onClick={() => onChange("")}
        >
          Tous
          <span aria-hidden="true" className="csArtFiltreCount">
            {total}
          </span>
        </button>

        {themes.map((t) => (
          <button
            key={t.nom}
            type="button"
            aria-pressed={actif === t.nom}
            className="csArtFiltreBtn"
            onClick={() => onChange(t.nom)}
          >
            {t.nom}
            <span aria-hidden="true" className="csArtFiltreCount">
              {t.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
