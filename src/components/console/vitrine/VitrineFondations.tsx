/**
 * Vitrine : couleurs, typographie, coupes, lueurs.
 */

import { COULEURS, COUPES, Etiquette, Panneau } from "../fondations";
import { Planche, SectionVitrine } from "./kit";

const TYPO = [
  { classe: "type-display", taille: "36 à 48 px", exemple: "Dépassez les limites" },
  { classe: "type-h1", taille: "28 à 36 px", exemple: "Titre de page" },
  { classe: "type-h2", taille: "22 à 26 px", exemple: "Titre de section" },
  { classe: "type-h3", taille: "18 px", exemple: "Titre de carte" },
  { classe: "type-lead", taille: "17 px", exemple: "Chapeau qui ouvre une section." },
  { classe: "type-body", taille: "16 px", exemple: "Texte courant, blanc sur fond sombre." },
  { classe: "type-caption", taille: "13 px", exemple: "Mention, légende, horodatage" },
] as const;

export function VitrineFondations() {
  return (
    <SectionVitrine id="fondations" index={1} surtitre="Fondations" titre="Couleurs, texte, coupes">
      <Planche nom="Couleurs" note="Le néon sert aux traits et à l'action principale, jamais au texte courant.">
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COULEURS.map((c) => (
            <li key={c.variable}>
              <Panneau coupe="s" className="p-4">
                <span
                  aria-hidden="true"
                  className="block h-14 w-full border border-white/10"
                  style={{ background: `var(${c.variable})` }}
                />
                <p className="type-body mt-3 font-semibold text-white">{c.nom}</p>
                <p className="type-caption text-(--cs-texte-3)">{c.usage}</p>
                <p className="type-caption mt-2 tabular-nums text-(--cs-neon)/80">{c.variable}</p>
              </Panneau>
            </li>
          ))}
        </ul>
      </Planche>

      <Planche nom="Typographie" note="Échelle unique du site, graisse de titre 600.">
        <Panneau coupe="m" className="divide-y divide-white/[0.07] px-6">
          {TYPO.map((t) => (
            <div key={t.classe} className="grid gap-2 py-5 md:grid-cols-[180px_1fr] md:items-baseline">
              <p className="type-caption tabular-nums text-(--cs-neon)/80">
                {t.classe} · {t.taille}
              </p>
              <p className={`${t.classe} text-white`}>{t.exemple}</p>
            </div>
          ))}
          <div className="grid gap-2 py-5 md:grid-cols-[180px_1fr] md:items-baseline">
            <p className="type-caption text-(--cs-neon)/80">Étiquette</p>
            <Etiquette index={1}>Libellé d&apos;instrument</Etiquette>
          </div>
        </Panneau>
      </Planche>

      <Planche nom="Coupes et cadres" note="Deux coins coupés, bord d'un pixel, équerres sur la pièce principale.">
        <div className="grid gap-8 md:grid-cols-4">
          {(Object.keys(COUPES) as (keyof typeof COUPES)[]).map((coupe) => (
            <Panneau key={coupe} coupe={coupe} className="flex h-32 items-end p-5">
              <p className="type-caption text-(--cs-texte-2)">
                Coupe {coupe.toUpperCase()} · {COUPES[coupe]} px
              </p>
            </Panneau>
          ))}
          <Panneau coupe="l" accent equerres className="flex h-32 items-end p-5">
            <p className="type-caption text-(--cs-texte-2)">Accent et équerres</p>
          </Panneau>
        </div>
      </Planche>
    </SectionVitrine>
  );
}
