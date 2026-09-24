"use client";

/**
 * Liste des éditions de veille avec filtre Quotidienne / Hebdomadaire.
 *
 * Composant Client : seul l'état du filtre en a besoin. Calqué sur
 * `console/pages/ListeArticles.tsx` (même orchestration filtre + grille).
 *
 * RGAA 4.1 : critère 7.1 porté par FiltreTypeVeille (annonce aria-live).
 * Éco : aucune requête réseau, calcul en useMemo.
 */

import { useMemo, useState } from "react";

import type { EditionVeille, TypeVeille } from "@/lib/veille";
import { StylesArticles } from "../console/pages/CarteArticle";
import { CarteVeille } from "./CarteVeille";
import { FiltreTypeVeille } from "./FiltreTypeVeille";

export interface ListeVeilleProps {
  editions: EditionVeille[];
  locale?: string;
}

const MESSAGES_VIDE = {
  fr: "Aucune édition dans cette fréquence.",
  en: "No edition in this frequency.",
};

export function ListeVeille({ editions, locale = "fr" }: ListeVeilleProps) {
  const [typeActif, setTypeActif] = useState<TypeVeille | "">("");

  const compteurs = useMemo<Record<TypeVeille, number>>(() => {
    const base: Record<TypeVeille, number> = { quotidienne: 0, hebdomadaire: 0 };
    for (const edition of editions) {
      base[edition.type] += 1;
    }
    return base;
  }, [editions]);

  const editionsFiltrees = useMemo(
    () => (typeActif === "" ? editions : editions.filter((e) => e.type === typeActif)),
    [editions, typeActif],
  );

  return (
    <div className="flex flex-col gap-8">
      <StylesArticles />

      <FiltreTypeVeille
        actif={typeActif}
        compteurs={compteurs}
        total={editions.length}
        resultats={editionsFiltrees.length}
        locale={locale}
        onChange={setTypeActif}
      />

      <ul role="list" className="csArtGrille">
        {editionsFiltrees.length === 0 ? (
          <li className="csArtVide">
            <p className="type-body">{locale === "en" ? MESSAGES_VIDE.en : MESSAGES_VIDE.fr}</p>
          </li>
        ) : (
          editionsFiltrees.map((edition) => (
            <li key={edition.slug}>
              <CarteVeille edition={edition} locale={locale} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
