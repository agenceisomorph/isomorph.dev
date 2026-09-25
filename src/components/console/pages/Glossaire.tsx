/**
 * Glossaire : les termes techniques d'une page, expliqués en une phrase.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *   - Critère 9.3 : liste de définitions (dl/dt/dd).
 *   - Critère 3.2 : contrastes du système Console (≥ 4.5:1).
 * Eco : aucun script, aucune image.
 */

import { Panneau } from "../fondations";

export interface TermeGlossaire {
  terme: string;
  definition: string;
}

export interface GlossaireProps {
  termes: TermeGlossaire[];
  className?: string;
}

export function Glossaire({ termes, className = "" }: GlossaireProps) {
  return (
    <Panneau as="div" coupe="m" className={className}>
      <dl className="grid gap-x-12 px-6 py-4 md:grid-cols-2 md:px-10 md:py-6">
        {termes.map((t) => (
          <div key={t.terme} className="border-b border-white/8 py-5 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
            <dt className="type-body text-white">{t.terme}</dt>
            <dd className="type-caption mt-1 text-(--cs-texte-2)">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </Panneau>
  );
}
