/**
 * Vitrine : famille Décors du système de design Console.
 *
 * Huit petites animations abstraites inspirées du hero : orbites, radar,
 * viseur, etc. Chaque pièce est un SVG aria-hidden, sans texte à l'écran.
 * Les titres des deux mises en situation sont ceux des familles du site
 * (`src/components/site/familles.ts`).
 */

import { Etiquette, Panneau } from "../fondations";
import { Cadran } from "../decors/Cadran";
import { Engrenage } from "../decors/Engrenage";
import { Jauge } from "../decors/Jauge";
import { Orbites } from "../decors/Orbites";
import { Oscilloscope } from "../decors/Oscilloscope";
import { Pulsation } from "../decors/Pulsation";
import { Radar } from "../decors/Radar";
import { Viseur } from "../decors/Viseur";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Cases de la grille                                                  */
/* ------------------------------------------------------------------ */

function Case({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Panneau coupe="s" className="flex h-[220px] w-full items-center justify-center p-6">
        {children}
      </Panneau>
      <p className="type-caption text-center text-(--cs-texte-3)">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineDecors() {
  return (
    <SectionVitrine
      id="decors"
      index={11}
      surtitre="Décors"
      titre="Animations abstraites"
    >
      {/* ===== Grille des huit pièces ===== */}
      <Planche
        nom="Catalogue"
        note="En fond de section ou dans un coin de panneau."
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <Case label="Cadran">
            <Cadran taille={140} />
          </Case>
          <Case label="Orbites">
            <Orbites taille={160} />
          </Case>
          <Case label="Radar">
            <Radar taille={140} />
          </Case>
          <Case label="Viseur">
            <Viseur taille={140} />
          </Case>
          <Case label="Oscilloscope">
            <Oscilloscope largeur={200} hauteur={90} />
          </Case>
          <Case label="Jauge">
            <Jauge taille={140} />
          </Case>
          <Case label="Pulsation">
            <Pulsation taille={140} />
          </Case>
          <Case label="Engrenage">
            <Engrenage taille={160} />
          </Case>
        </div>
      </Planche>

      {/* ===== En situation : Orbites derrière un titre de section ===== */}
      <Planche
        nom="En situation"
        note="Derrière un titre de section."
      >
        <Panneau coupe="m" className="relative min-h-[260px] overflow-hidden">
          {/* Décor de fond */}
          <Orbites
            taille={320}
            className="absolute right-0 top-1/2 opacity-40"
            style={{ translate: "30% -50%" }}
          />

          {/* Contenu par-dessus */}
          <div className="relative max-w-[480px] px-6 py-12 sm:px-10 sm:py-14">
            <Etiquette index={2}>Intégrations</Etiquette>
            <h2 className="type-h2 mt-4 text-white">Connecter et étendre</h2>
            <p className="type-body mt-3 text-(--cs-texte-2)">
              Le code qui prolonge les outils déjà en place, et qui les relie entre eux.
            </p>
          </div>
        </Panneau>
      </Planche>

      {/* ===== En situation : Viseur dans un coin de panneau ===== */}
      <Planche
        nom="Dans un panneau"
        note="Dans le coin d'un panneau."
      >
        <Panneau coupe="l" className="relative min-h-[200px] overflow-hidden p-6 sm:p-8">
          {/* Décor dans le coin bas droit */}
          <Viseur
            taille={160}
            className="absolute bottom-0 right-0 opacity-25"
            style={{ translate: "20% 20%" }}
          />
          <div className="relative max-w-[300px]">
            <Etiquette index={3}>Visibilité</Etiquette>
            <h3 className="type-h3 mt-3 text-white">Être trouvé</h3>
            <p className="type-body mt-2 text-(--cs-texte-2)">
              Ce qui fait venir vos clients, mesuré avec les outils des moteurs.
            </p>
          </div>
        </Panneau>
      </Planche>
    </SectionVitrine>
  );
}
