/**
 * Citation client : la parole du client dans un panneau de verre.
 *
 * Server Component. Aucun état.
 *
 * Utiliser uniquement avec un témoignage réel, cité mot pour mot, et
 * l'accord écrit du client pour la publication de son nom.
 *
 * RGAA 4.1 :
 *   - Critère 8.9 : blockquote pour la citation, figcaption pour l'auteur.
 *   - Critère 3.2 : texte blanc et gris clair sur fond nuit (≥ 4.5:1).
 * Eco : aucune image obligatoire, aucun script.
 */

import Image from "next/image";

import { Panneau } from "../fondations";

export interface CitationClientProps {
  citation: string;
  auteur: string;
  fonction: string;
  entreprise: string;
  /** Portrait carré, facultatif. */
  portrait?: { src: string; alt: string };
  className?: string;
}

export function CitationClient({ citation, auteur, fonction, entreprise, portrait, className = "" }: CitationClientProps) {
  return (
    <Panneau as="div" coupe="l" accent equerres className={className}>
      <figure className="relative px-6 py-10 md:px-12 md:py-14">
        <span aria-hidden="true" className="type-display block leading-none text-(--cs-neon)">
          «
        </span>
        <blockquote className="type-h3 mt-2 text-white">
          <p>{citation}</p>
        </blockquote>
        <span aria-hidden="true" className="mt-8 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        <figcaption className="mt-6 flex items-center gap-4">
          {portrait ? (
            <Image
              src={portrait.src}
              alt={portrait.alt}
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span className="flex flex-col">
            <span className="type-body text-white">{auteur}</span>
            <span className="type-caption text-(--cs-texte-2)">
              {fonction}, {entreprise}
            </span>
          </span>
        </figcaption>
      </figure>
    </Panneau>
  );
}
