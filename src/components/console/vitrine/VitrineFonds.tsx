/**
 * Vitrine « Fonds de section » du système Console, essayés sous une vraie
 * section. Fond retenu par Florent le 24 septembre 2026 : Crêtes animé.
 * Topographie et Terrain ombré restent de côté ; les six autres essais sont
 * retirés (récupérables dans le commit 5fc8509).
 */

import { FondCretes } from "../fonds/animes";
import { CourbesNiveau, TerrainOmbre } from "../fonds/relief";
import { ApercuFond } from "./fonds/ApercuFond";
import { Planche, SectionVitrine } from "./kit";

export function VitrineFonds() {
  return (
    <SectionVitrine id="fonds" index={17} surtitre="Fonds" titre="Fonds de section">
      <Planche nom="Fond retenu : Crêtes">
        <ApercuFond groupe="Fond retenu" variantes={[{ id: "cretes", label: "Crêtes", fond: <FondCretes /> }]} />
      </Planche>
      <Planche nom="De côté">
        <ApercuFond
          groupe="Fonds de côté"
          variantes={[
            { id: "topographie", label: "Topographie", fond: <CourbesNiveau /> },
            { id: "terrain", label: "Terrain ombré", fond: <TerrainOmbre /> },
          ]}
        />
      </Planche>
    </SectionVitrine>
  );
}
