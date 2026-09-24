/**
 * Vitrine « Globe » du système Console : une planche grand format.
 */

import { Globe } from "../globe";
import { Planche, SectionVitrine } from "./kit";

export function VitrineGlobe() {
  return (
    <SectionVitrine id="globe" index={14} surtitre="Données" titre="Globe" alterne>
      <Planche nom="Globe" note="Glisser pour faire tourner">
        <Globe />
      </Planche>
    </SectionVitrine>
  );
}
