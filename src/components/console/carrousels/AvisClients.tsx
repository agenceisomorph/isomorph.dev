/**
 * AvisClients : grille d'avis sur grand écran, carrousel sur mobile.
 *
 * - Note en segments néon (lisible sans couleur : texte « 5 sur 5 » visible).
 * - Citation, auteur, entreprise, source : tout en placeholder visible.
 * - Grille 3 colonnes sur ≥ 768 px, piste défilante sur mobile.
 * - Aucun avis inventé : pas d'accord client disponible.
 *
 * Composant serveur : aucun état, rendu identique client / serveur.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : région `aria-roledescription="carrousel"` côté mobile
 *                  (la grille n'est pas un carrousel).
 *  - Critère 3.2 : note en segments + texte sr-only « N sur 5 ».
 *  - Critère 11.1 : aucune cible interactive dans la version statique.
 *
 * Éco : Server Component pur.
 */

import { Panneau, StylesConsole } from "../fondations";
import { StylesCarrousels } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface AvisClient {
  /**
   * Identifiant unique.
   */
  id: string;
  /**
   * Note sur 5. Entier de 1 à 5.
   * Placeholder : la note réelle doit être sourcée.
   */
  note: number;
  /**
   * Citation textuelle.
   * Doit être sourcée et publiée avec accord écrit du client.
   */
  citation: string;
  /**
   * Prénom et nom ou initiales de l'auteur.
   * Placeholder : "[À compléter — prénom, nom, accord écrit]"
   */
  auteur: string;
  /**
   * Nom de l'entreprise ou contexte.
   * Placeholder : "[À compléter — entreprise, accord écrit]"
   */
  entreprise: string;
  /**
   * Source de l'avis : Google, Trustpilot, email, etc.
   * Placeholder : "[À compléter — source de l'avis]"
   */
  source: string;
}

export interface AvisClientsProps {
  avis: AvisClient[];
  /** Libellé de la région sur mobile (RGAA 7.1). */
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Note en segments                                                    */
/* ------------------------------------------------------------------ */

function NoteSegments({ note, max = 5 }: { note: number; max?: number }) {
  return (
    <div className="csCarAvisNote" aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="csCarAvisSegment"
          {...(i < note ? { "data-actif": "" } : {})}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carte d'avis                                                        */
/* ------------------------------------------------------------------ */

function CarteAvis({
  avis,
  index,
  total,
}: {
  avis: AvisClient;
  index: number;
  total: number;
}) {
  return (
    <div
      role="group"
      aria-roledescription="diapositive"
      aria-label={`${index + 1} sur ${total}`}
    >
      <Panneau coupe="m" as="article" className="csCarAvisCarte h-full">
        {/* Note : accessible avec le texte sr-only, lisible sans couleur
            grâce aux segments + la légende « N sur 5 ». */}
        <div className="flex items-center gap-3">
          <NoteSegments note={avis.note} />
          <span className="sr-only">{avis.note} sur 5</span>
          <span aria-hidden="true" className="type-caption text-(--cs-texte-3)">
            {avis.note}&thinsp;/&thinsp;5
          </span>
        </div>

        {/* Citation */}
        <blockquote className="csCarAvisCitation type-body text-(--cs-texte-2)">
          &ldquo;{avis.citation}&rdquo;
        </blockquote>

        {/* Auteur et source */}
        <div className="csCarAvisSignature">
          <p className="type-caption font-semibold text-white">{avis.auteur}</p>
          <p className="type-caption text-(--cs-texte-3)">{avis.entreprise}</p>
          <p className="type-caption mt-1 text-(--cs-texte-3)">
            Source : {avis.source}
          </p>
        </div>
      </Panneau>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export function AvisClients({
  avis,
  label = "Avis clients",
  className = "",
}: AvisClientsProps) {
  if (avis.length === 0) return null;

  return (
    <>
      <StylesConsole />
      <StylesCarrousels />
      {/*
        Sur mobile : la `csCarAvisGrille` devient une piste défilante via CSS.
        Sur grand écran : grille 3 colonnes, pas de carousel.
        `aria-roledescription` posé sur l'enveloppe ; sur grand écran il n'a
        pas d'effet comportemental mais reste valide sémantiquement.
      */}
      <section
        aria-roledescription="carrousel"
        aria-label={label}
        className={className}
      >
        <div className="csCarAvisGrille">
          {avis.map((a, i) => (
            <CarteAvis key={a.id} avis={a} index={i} total={avis.length} />
          ))}
        </div>
      </section>
    </>
  );
}
