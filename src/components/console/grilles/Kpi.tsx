/**
 * Kpi : rangée de chiffres clés dans des cadres d'instrument.
 *
 * Chaque cadre affiche : libellé, valeur, unité et source courte.
 * Les cases s'allument en décalé à l'apparition (animation CSS csAllume
 * définie dans fondations.tsx), sans aucun script.
 *
 * RGAA 4.1 :
 *   - Critère 10.7 : contrastes ≥ 4,5:1 sur toutes les valeurs.
 * Éco : Server Component, aucun état.
 *
 * Chiffres utilisables uniquement sourcés :
 *   - Bpifrance : CLAUDE.md du dépôt (diaginno.bpifrance.fr, catalogue officiel).
 *   - npm : PACKAGES_FULL (data.ts), relevé au 10 septembre 2026 sur npmjs.org.
 */

import { StylesConsole, Panneau } from "../fondations";
import { StylesGrilles } from "./StylesGrilles";

/* ------------------------------------------------------------------ */
/* Type                                                                  */
/* ------------------------------------------------------------------ */

export interface KpiItemDonnee {
  /** Libellé de l'indicateur (ex. "Prise en charge"). */
  libelle: string;
  /** Valeur affichée (ex. "50" ou "1 366"). */
  valeur: string;
  /** Unité courte (ex. "%", "€ HT", "install."). Optionnel. */
  unite?: string;
  /** Source courte affichée en mention (ex. "Bpifrance", "npmjs.org"). */
  source: string;
}

export interface KpiProps {
  items: KpiItemDonnee[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

/**
 * Rangée de relevés d'instrument.
 * Utiliser uniquement avec des données réelles et sourcées.
 */
export function Kpi({ items, className = "" }: KpiProps) {
  return (
    <>
      <StylesConsole />
      <StylesGrilles />
      <div className={`csGriKpi ${className}`} role="list">
        {items.map((item, i) => (
          <Panneau
            key={item.libelle}
            as="div"
            coupe="m"
            className="csGriKpiItem"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Libellé */}
            <p className="type-caption uppercase tracking-[0.16em] text-(--cs-neon)">
              {item.libelle}
            </p>

            {/* Valeur + unité */}
            <p className="csGriKpiVal">
              <span className="type-h1 font-semibold text-white">{item.valeur}</span>
              {item.unite ? (
                <span className="type-body text-(--cs-texte-2)">{item.unite}</span>
              ) : null}
            </p>

            {/* Trait d'instrument */}
            <span
              aria-hidden="true"
              className="block h-px w-8 bg-(--cs-neon) opacity-55"
            />

            {/* Source */}
            <p className="csGriKpiSource">{item.source}</p>
          </Panneau>
        ))}
      </div>
    </>
  );
}
