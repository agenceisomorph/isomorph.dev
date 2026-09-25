"use client";

/**
 * Explorateur : interface de navigation à la console.
 *
 * « use client » justifié : suivi de l'élément survolé ou focalisé
 * (index actif en state) pour alimenter le panneau de relevé à droite ;
 * navigation clavier aux flèches entre les boutons de la liste.
 *
 * Contenu : EXPERTISE_FAMILIES (expertiseNav.ts -> familles.ts,
 * plan du site du 11 septembre 2026). Aucune donnée inventée.
 *
 * Structure :
 *   - Gauche : liste des rubriques (familles puis services) ;
 *     chaque item est un <button> qui active le panneau de relevé sur
 *     grand écran et rend sa description visible sur mobile.
 *   - Droite : panneau de relevé (titre, description, lien),
 *     visible sur grand écran (≥ 1024 px) uniquement.
 *   - Mobile : la description s'affiche directement sous chaque
 *     libellé (toujours visible, sans interaction supplémentaire).
 *
 * RGAA 4.1 :
 *   - Critère 7.1 : nav + liste de boutons ; aria-expanded signale
 *     l'état actif. Sur mobile, la description ne se masque jamais :
 *     pas de critère 10.7 à risque.
 *   - Critère 7.3 : Flèche haut / bas déplace le focus entre les items.
 *   - Critère 10.7 : focus clavier = tracé néon, identique au survol.
 * Éco : rendu serveur identique au rendu client (aucun Math.random,
 * aucune lecture de window, rendus conditionnels absents).
 */

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { EXPERTISE_FAMILIES } from "@/components/chrome/expertiseNav";
import { StylesConsole, Panneau } from "../fondations";
import { StylesGrilles } from "./StylesGrilles";

/* ------------------------------------------------------------------ */
/* Données (source : expertiseNav.ts, plan du site 11/09/2026)         */
/* ------------------------------------------------------------------ */

interface ItemPlat {
  familleKey: string;
  familleHeading: string;
  familleHub: string;
  label: string;
  href: string;
  description?: string;
  indexPlat: number;
}

interface GroupeExpl {
  familleKey: string;
  familleHeading: string;
  familleHub: string;
  items: ItemPlat[];
}

let _idx = 0;

const GROUPES: GroupeExpl[] = EXPERTISE_FAMILIES.map((f) => {
  const tousItems = [
    ...f.items,
    ...(f.subGroups?.flatMap((sg) => sg.items) ?? []),
  ];
  return {
    familleKey: f.key,
    familleHeading: f.heading,
    familleHub: f.hub,
    items: tousItems.map((item) => ({
      familleKey: f.key,
      familleHeading: f.heading,
      familleHub: f.hub,
      label: item.label,
      href: item.href,
      description: item.desc,
      indexPlat: _idx++,
    })),
  };
});

const ITEMS_PLATS: ItemPlat[] = GROUPES.flatMap((g) => g.items);

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

export interface ExplorateurProps {
  className?: string;
}

/**
 * Interface d'exploration à la console.
 * Sur téléphone : liste avec descriptions visibles sous chaque item.
 * Sur grand écran : liste + panneau de relevé à droite.
 */
export function Explorateur({ className = "" }: ExplorateurProps) {
  const [actifIndex, setActifIndex] = useState<number>(0);

  // Références vers les boutons pour déplacer le focus par flèches
  const btnRefs = useRef<(HTMLButtonElement | null)[]>(
    new Array(ITEMS_PLATS.length).fill(null),
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const suivant = Math.min(idx + 1, ITEMS_PLATS.length - 1);
        setActifIndex(suivant);
        btnRefs.current[suivant]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const precedent = Math.max(idx - 1, 0);
        setActifIndex(precedent);
        btnRefs.current[precedent]?.focus();
      }
    },
    [],
  );

  const actif = ITEMS_PLATS[actifIndex];

  return (
    <>
      <StylesConsole />
      <StylesGrilles />
      <div className={`csGriExpl ${className}`}>

        {/* ── Liste gauche ── */}
        <Panneau as="div" coupe="m">
          <nav aria-label="Services">
            <ul className="csGriExplListe" role="list">
              {GROUPES.map((groupe) => (
                <li key={groupe.familleKey}>
                  {/* Séparateur de famille */}
                  <p className="csGriExplFamille" aria-hidden="true">
                    {groupe.familleHeading}
                  </p>
                  {/* Items du groupe */}
                  <ul role="list">
                    {groupe.items.map((item) => (
                      <li key={item.href}>
                        <button
                          ref={(el) => {
                            btnRefs.current[item.indexPlat] = el;
                          }}
                          type="button"
                          className="csGriExplBtn"
                          data-actif={actifIndex === item.indexPlat ? "true" : undefined}
                          aria-expanded={actifIndex === item.indexPlat}
                          onMouseEnter={() => setActifIndex(item.indexPlat)}
                          onFocus={() => setActifIndex(item.indexPlat)}
                          onKeyDown={(e) => handleKeyDown(e, item.indexPlat)}
                        >
                          <span aria-hidden="true" className="csGriExplBtnIdx">
                            {String(item.indexPlat + 1).padStart(2, "0")}
                          </span>
                          <span>{item.label}</span>
                          {/* Chevron : visible sur mobile, masqué sur grand écran */}
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="csGriExplChevron h-3 w-3"
                          >
                            <path
                              d="M6 4L10 8L6 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="square"
                            />
                          </svg>
                        </button>

                        {/* Description mobile : toujours visible sous l'item */}
                        {item.description ? (
                          <p className="csGriExplDescMobile">
                            {item.description}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </Panneau>

        {/* ── Panneau de relevé (grand écran) : absent sur téléphone, où la
             description suit chaque ligne. ── */}
        <Panneau as="div" coupe="l" equerres className="max-lg:hidden">
          <div
            className="csGriExplReleve"
            role="region"
            aria-label="Détail du service"
            aria-live="polite"
            aria-atomic="true"
          >
            {actif ? (
              <>
                <div aria-hidden="true" className="csGriExplFilet" />
                {/* Famille */}
                <p className="type-caption uppercase tracking-[0.18em] text-(--cs-neon)">
                  {actif.familleHeading}
                </p>
                {/* Titre du service */}
                <p className="type-h2 text-white">{actif.label}</p>
                {/* Description */}
                {actif.description ? (
                  <p className="type-lead text-(--cs-texte-2)">{actif.description}</p>
                ) : null}
                {/* Lien de navigation */}
                <Link href={actif.href} className="csGriExplReleveBtn">
                  <span>Voir la prestation</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="csGriExplReleveFleche h-4 w-4 shrink-0"
                  >
                    <path
                      d="M3 8H12.5M8.5 4L12.5 8L8.5 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    />
                  </svg>
                </Link>
              </>
            ) : null}
          </div>
        </Panneau>

      </div>
    </>
  );
}
