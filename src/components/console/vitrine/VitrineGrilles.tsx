/**
 * Vitrine : famille Grilles du système de design Console.
 *
 * Données réelles :
 *   - EXPERTISE_FAMILIES : expertiseNav.ts → familles.ts (11/09/2026)
 *   - Bpifrance : CLAUDE.md du dépôt (diaginno.bpifrance.fr,
 *     catalogue officiel) : 50 %, 13 000 € HT, 6 500 € HT.
 *   - npm (@isomorph-agency/cookie-consent, 1 366 installations) :
 *     PACKAGES_FULL dans data.ts, relevé le 10 septembre 2026 sur npmjs.org.
 */

import type { KpiItemDonnee } from "../grilles/Kpi";
import { Bento } from "../grilles/Bento";
import { Explorateur } from "../grilles/Explorateur";
import { Kpi } from "../grilles/Kpi";
import { SectionCta } from "../grilles/SectionCta";
import { BlocAnime } from "../animations/BlocAnime";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Données KPI sourcées                                                */
/* ------------------------------------------------------------------ */

/**
 * Chiffres Bpifrance.
 * Source : CLAUDE.md du dépôt, section "Vérités factuelles" (diaginno.bpifrance.fr).
 * Plafond maximal 13 000 € HT, subvention 50 %, reste à charge 6 500 € HT.
 */
const KPI_DATA: KpiItemDonnee[] = [
  { libelle: "Prise en charge", valeur: "50", unite: "%", source: "Bpifrance" },
  { libelle: "Montant plafonné", valeur: "13 000", unite: "€ HT", source: "Bpifrance" },
  { libelle: "Reste à charge", valeur: "6 500", unite: "€ HT", source: "Bpifrance" },
  /**
   * npm : @isomorph-agency/cookie-consent, 1 366 installations cumulées
   * depuis la première publication. Relevé le 10 septembre 2026 sur npmjs.org.
   * Source : src/lib/expertises/data.ts, PACKAGES_FULL.
   */
  { libelle: "Cookie Consent React", valeur: "1 366", unite: "install.", source: "npm, cumul au 10/09/2026" },
];

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineGrilles() {
  return (
    <SectionVitrine
      id="grilles"
      index={8}
      surtitre="Grilles"
      titre="Bento, explorateur, chiffres, appel à l'action"
      alterne
    >

      {/* ===== Bento ===== */}
      <Planche
        nom="Bento"
        note="Des cases de tailles différentes."
      >
        <BlocAnime bloc="bento">
          <Bento />
        </BlocAnime>
      </Planche>

      {/* ===== Explorateur ===== */}
      <Planche
        nom="Explorateur"
        note="Le détail suit le survol."
      >
        <BlocAnime bloc="explorateur">
          <Explorateur />
        </BlocAnime>
      </Planche>

      {/* ===== KPI ===== */}
      <Planche
        nom="Chiffres clés"
        note="Uniquement des chiffres sourcés."
      >
        {/*
          Données : Diag Axes d'Innovation Bpifrance + plugin npm.
          Sources : CLAUDE.md du dépôt (diaginno.bpifrance.fr) et data.ts (npmjs.org).
        */}
        <BlocAnime bloc="kpi">
          <Kpi items={KPI_DATA} />
        </BlocAnime>
      </Planche>

      {/* ===== SectionCta ===== */}
      <Planche
        nom="Appel à l'action"
        note="Pour finir une page."
      >
        <BlocAnime bloc="section-cta">
          <SectionCta />
        </BlocAnime>
      </Planche>

    </SectionVitrine>
  );
}
