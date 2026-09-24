/**
 * Vitrine « Carte » du système Console : la carte et son thème Snazzy Maps.
 */

import { Panneau } from "../fondations";
import { CarteGeo, caseContenant, CopieTheme, PALETTE_CARTE, PASTILLES_CARTE } from "../carte";
import type { PointGeo, RepereCarte, ZoneCarte } from "../carte";
import { Planche, SectionVitrine } from "./kit";

/* Villes : CLAUDE.md du dépôt (siège social à Paris 8e, implantation à Toulon). */

/* Source : Wikipédia FR, article Paris, coordonnées de la commune (48° 51′ 24″ N, 2° 21′ 07″ E). */
const PARIS: PointGeo = [2.3519, 48.8567];
/* Source : Wikipédia FR, article Toulon, coordonnées de la commune (43° 07′ 20″ N, 5° 55′ 48″ E). */
const TOULON: PointGeo = [5.93, 43.1222];

const CADRAGE: readonly PointGeo[] = [PARIS, TOULON];

/*
 * Zones de démonstration : formes arbitraires tracées en mer, sans aucune
 * signification. Un polygone dans le golfe de Gascogne, trois cases de 0,5°
 * en mer Ligure, tenues à l'écart des libellés des repères.
 */
const ZONES: readonly ZoneCarte[] = [
  {
    id: "demo-polygone",
    polygone: [
      [-8.5, 47.6],
      [-4.6, 47.3],
      [-2.6, 45.8],
      [-2.3, 44.4],
      [-5.0, 44.3],
      [-8.2, 44.9],
    ],
  },
  {
    id: "demo-cases",
    pas: 0.5,
    cases: (
      [
        [8.25, 43.4],
        [8.75, 43.4],
        [8.75, 43.75],
      ] as const
    ).map((point) => caseContenant(point, 0.5)),
  },
];

const REPERES: readonly RepereCarte[] = [
  { id: "paris", point: PARIS, libelle: "Paris" },
  { id: "toulon", point: TOULON, libelle: "Toulon" },
  /* Repère d'alerte de démonstration, sans nom, dans les cases de mer Ligure. */
  { id: "demo-alerte", point: [8.6, 43.4], ton: "alerte" },
];

export function VitrineCarte() {
  return (
    <SectionVitrine id="carte" index={13} surtitre="Données" titre="Carte">
      <Planche nom="Carte" note="Glisser pour déplacer">
        <CarteGeo titre="Carte des implantations" libelle="Implantations" cadrage={CADRAGE} reperes={REPERES} zones={ZONES} />
      </Planche>

      <Planche nom="Thème Snazzy Maps" note="Format Google Maps, les mêmes couleurs que la carte">
        <ul role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PASTILLES_CARTE.map(({ cle, nom }) => (
            <li key={cle}>
              <Panneau coupe="s" className="p-4">
                <span aria-hidden="true" className="block h-14 w-full border border-white/15" style={{ background: PALETTE_CARTE[cle] }} />
                <p className="type-body mt-3 font-semibold text-white">{nom}</p>
                <p className="type-caption tabular-nums text-(--cs-neon)/80">{PALETTE_CARTE[cle]}</p>
              </Panneau>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <CopieTheme />
        </div>
      </Planche>
    </SectionVitrine>
  );
}
