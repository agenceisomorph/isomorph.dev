/**
 * Vitrine « Réseau neuronal » du système Console : l'illustration plein cadre
 * dans un panneau à coins coupés et équerres. Format 16:9, resserré en 4:3
 * sur téléphone pour que la masse reste lisible.
 */

import { Panneau } from "../fondations";
import { ReseauNeuronal } from "../illustrations/ReseauNeuronal";
import { Planche, SectionVitrine } from "./kit";

export function VitrineReseau() {
  return (
    <SectionVitrine id="reseau-neuronal" index={15} surtitre="Illustrations" titre="Réseau neuronal">
      <Planche nom="Prise de contrôle" note="Toutes les 10 à 14 secondes">
        <Panneau coupe="l" equerres className="aspect-[4/3] w-full sm:aspect-video">
          {/* Sous le bord du panneau, découpée selon ses coins. */}
          <ReseauNeuronal className="absolute inset-0 -z-1 [clip-path:var(--cs-clip)]" />
        </Panneau>
      </Planche>
    </SectionVitrine>
  );
}
