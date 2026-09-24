/**
 * Bloc auteur : carte de présentation de l'auteur en fin d'article.
 *
 * Photo circulaire, nom, rôle et courte biographie dans un panneau de verre.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *   - Critère 1.1 : alt vide sur la photo (décorative : le nom est à côté).
 *   - Critère 9.1 : aside nommé par un titre masqué (sr-only) pour les lecteurs
 *     d'écran, afin de ne pas polluer la hiérarchie visible des titres.
 * Eco : Server Component, image différée (non LCP).
 */

import Image from "next/image";

import { Panneau, StylesConsole } from "../fondations";
import { StylesPages } from "./StylesPages";

export interface BlocAuteurProps {
  nom: string;
  role: string;
  bio: string;
  /** Chemin depuis public/ : ex. "/actualites/florent-ducase.webp". */
  avatar: string;
}

export function BlocAuteur({ nom, role, bio, avatar }: BlocAuteurProps) {
  return (
    <>
      <StylesConsole />
      <StylesPages />
      {/* Le Panneau rend un aside, repéré par les lecteurs d'écran. */}
      <Panneau as="aside" coupe="m" className="mt-12 p-6">
        {/* Titre masqué visuellement pour nommer la région. */}
        <p className="sr-only">A propos de {nom}</p>
        <div className="flex items-start gap-5">
          <Image
            src={avatar}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="type-body font-semibold text-white">{nom}</p>
            <p className="type-caption mt-0.5 text-(--cs-neon)">{role}</p>
            <p className="type-body mt-3 text-(--cs-texte-2)">{bio}</p>
          </div>
        </div>
      </Panneau>
    </>
  );
}
