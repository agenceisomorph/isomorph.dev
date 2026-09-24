/**
 * Sommaire de lecture : navigation latérale qui suit le défilement.
 *
 * "use client" justifié : utilise un listener scroll pour détecter
 * quelle section h2 est couramment visible et mettre à jour l'état actif.
 * Le rendu serveur initial (courant: null) est identique au premier rendu
 * navigateur : aucun écart d'hydratation.
 *
 * Affichage : uniquement sur grand écran (lg). Sur mobile, le composant
 * parent le masque via hidden lg:block.
 *
 * RGAA 4.1 :
 *   - Critère 12.9 : navigation nommée "Sommaire" (aria-label).
 *   - Critère 12.6 : lien vers la section courante distinguée visuellement.
 *   - Critère 10.7 : focus visible par le bord néon (pas d'outline).
 * Eco : listener passif, sans debounce ni bibliothèque externe.
 */

"use client";

import { useEffect, useState } from "react";

import { StylesPages } from "./StylesPages";

export interface SectionSommaire {
  id: string;
  titre: string;
}

export interface SommaireLectureProps {
  sections: readonly SectionSommaire[];
  /** Libellé de la zone de navigation. */
  libelle?: string;
}

export function SommaireLecture({
  sections,
  libelle = "Sommaire",
}: SommaireLectureProps) {
  const [courant, setCourant] = useState<string | null>(null);

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    /** Retrouve la dernière section dont le titre est passé au-dessus du
     *  premier tiers de la fenêtre. Si aucune section n'est encore passée,
     *  on conserve l'état précédent (null au chargement). */
    const actualiser = () => {
      let actif: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= window.innerHeight * 0.35) {
          actif = id;
        }
      }
      setCourant(actif);
    };

    window.addEventListener("scroll", actualiser, { passive: true });
    /* Appel initial : utile quand la page charge avec une ancre ou
       quand l'utilisateur revient sur un article déjà partiellement lu. */
    actualiser();

    return () => window.removeEventListener("scroll", actualiser);
  }, [sections]);

  return (
    <nav aria-label={libelle} className="csPagSommaire">
      <StylesPages />
      <p className="type-caption mb-4 uppercase tracking-[0.16em] text-(--cs-neon)">
        {libelle}
      </p>
      <ol role="list" className="space-y-0.5">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              data-actif={courant === s.id ? "true" : undefined}
              className="csPagSomItem type-caption"
            >
              {s.titre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
