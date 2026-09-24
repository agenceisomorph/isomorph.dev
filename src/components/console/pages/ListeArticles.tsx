"use client";

/**
 * Liste d'articles avec filtre par thème.
 *
 * Composant Client : gère l'état du thème actif, calcule les thèmes
 * disponibles depuis les articles fournis, filtre la liste et orchestre
 * CarteArticle + FiltreThemes.
 *
 * Source des articles passés en prop : src/app/(fr)/actualites/page.tsx,
 * tableau `articles`. Dans la vitrine, les données sont recopiées avec
 * référence de source dans VitrinePages.tsx.
 *
 * RGAA 4.1 :
 *   - Critère 7.1 : FiltreThemes annonce le nombre de résultats en aria-live.
 * Eco : aucune requête réseau, calculs en useMemo.
 */

import { useMemo, useState } from "react";

import type { ResumeArticle } from "./CarteArticle";
import { CarteArticle, StylesArticles } from "./CarteArticle";
import type { ThemeFiltre } from "./FiltreThemes";
import { FiltreThemes } from "./FiltreThemes";

export interface ListeArticlesProps {
  articles: ResumeArticle[];
}

export function ListeArticles({ articles }: ListeArticlesProps) {
  const [themeActif, setThemeActif] = useState<string>("");

  /** Thèmes distincts avec leur nombre d'articles, dans l'ordre d'apparition. */
  const themes = useMemo<ThemeFiltre[]>(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    }
    return [...counts.entries()].map(([nom, count]) => ({ nom, count }));
  }, [articles]);

  const articlesFiltres = useMemo(
    () => (themeActif === "" ? articles : articles.filter((a) => a.category === themeActif)),
    [articles, themeActif],
  );

  return (
    <div className="flex flex-col gap-8">
      <StylesArticles />

      <FiltreThemes
        themes={themes}
        actif={themeActif}
        total={articles.length}
        resultats={articlesFiltres.length}
        onChange={setThemeActif}
      />

      <ul role="list" className="csArtGrille">
        {articlesFiltres.length === 0 ? (
          <li className="csArtVide">
            <p className="type-body">Aucun article dans ce thème.</p>
          </li>
        ) : (
          articlesFiltres.map((a, i) => (
            <li key={a.slug}>
              {/* Première carte prioritaire uniquement quand aucun filtre n'est actif. */}
              <CarteArticle article={a} prioritaire={i === 0 && themeActif === ""} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
