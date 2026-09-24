/**
 * SliderStories : témoignages vidéo au format story (9:16).
 *
 * - Plusieurs cartes côte à côte dans une piste défilante.
 * - Sur mobile une seule carte visible, sur grand écran trois.
 * - Lecture au clic dans une `Modale` Console existante.
 * - Barre de durée en haut de la carte (décoration, aria-hidden).
 * - Nom et rôle de l'intervenant en bas de la carte.
 * - Aucun média présent dans le dépôt : le composant accepte `src` et
 *   `poster` en props et affiche un cadre d'attente propre sans eux.
 * - Aucune lecture automatique avec le son (RGAA 4.1, critère 4.22).
 * - Tout le contenu est un placeholder visible (aucun accord client).
 *
 * "use client" : état d'ouverture de la modale, ref du déclencheur.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : région `aria-roledescription="carrousel"`.
 *  - Critère 7.3 : cartes `role="group"` `aria-roledescription="diapositive"`.
 *  - Critère 11.1 : bouton de lecture nommé, ≥ 44 px.
 *  - Critère 4.22 : vidéo sans lecture automatique ni son automatique.
 *
 * Éco : Server Component déconseillé ici car la modale est "use client" ;
 * l'état d'ouverture est local, pas de rendu redondant.
 */

"use client";

import { useRef, useState } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { Modale } from "../retours/Modale";
import { StylesCarrousels } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Story {
  /**
   * Identifiant unique de la carte.
   * Placeholder : "[À compléter — avis client, source et accord écrit]"
   */
  id: string;
  /**
   * Nom de l'intervenant.
   * Placeholder : aucun nom réel sans accord écrit.
   */
  nom: string;
  /**
   * Rôle ou entreprise.
   * Placeholder : "[À compléter — rôle, accord écrit]"
   */
  role: string;
  /**
   * URL de la vidéo (mp4 ou m3u8). Optionnel : affiche un cadre d'attente
   * propre si absent.
   */
  src?: string;
  /**
   * Image d'aperçu de la vidéo. Optionnelle.
   * Utiliser uniquement des fichiers présents dans `public/`.
   */
  poster?: string;
  /**
   * Durée affichée dans la barre (0 à 1, ratio rempli).
   * Décoration uniquement : n'implique pas de lecture automatique.
   */
  duree?: number;
}

export interface SliderStoriesProps {
  stories: Story[];
  /** Libellé de la région carrousel (RGAA 7.1). */
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Icône de lecture                                                    */
/* ------------------------------------------------------------------ */

function IcoLecture() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
      <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Carte story individuelle                                            */
/* ------------------------------------------------------------------ */

function CarteStory({
  story,
  index,
  total,
  onOuvrir,
}: {
  story: Story;
  index: number;
  total: number;
  onOuvrir: (id: string) => void;
}) {
  const refBtn = useRef<HTMLButtonElement>(null);

  return (
    <div
      role="group"
      aria-roledescription="diapositive"
      aria-label={`${index + 1} sur ${total}`}
      className="csCarStoDia"
    >
      <Panneau
        coupe="m"
        trace
        className="csCarStoCarte"
        /* Absence de médias : fond d'attente via data attribute */
        {...(!story.src ? { "data-sans-media": "" } : {})}
        as="div"
      >
        {/* Barre de durée (décoration) */}
        <div aria-hidden="true" className="csCarStoBarre">
          <div
            className="csCarStoBarreNeon"
            style={{ width: `${(story.duree ?? 0) * 100}%` }}
          />
        </div>

        {/* Affiche / fond d'attente */}
        {story.poster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={story.poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Grille de points façon Console quand aucun média n'est fourni */
          <div
            aria-hidden="true"
            className="absolute inset-0 csGrille opacity-50"
          />
        )}

        {/*
         * Bouton de lecture : affiché uniquement si une vidéo (`src`) est fournie.
         * RGAA 4.1 / 4.22 : aucun bouton ne promet une lecture inexistante.
         * Quand aucune vidéo n'est disponible, un texte d'attente remplace le bouton.
         */}
        {story.src ? (
          <div className="csCarStoLecture">
            <button
              ref={refBtn}
              type="button"
              aria-label={`Regarder le témoignage de ${story.nom}`}
              onClick={() => onOuvrir(story.id)}
              className="csCarStoIconeLecture text-(--cs-neon)"
            >
              <IcoLecture />
            </button>
          </div>
        ) : (
          /* Texte d'attente : visible dans la carte, pas de bouton trompeur. */
          <div className="csCarStoLecture pointer-events-none">
            <p className="type-caption text-center text-(--cs-texte-3) px-4">
              Vidéo à tourner
            </p>
          </div>
        )}

        {/* Auteur en bas */}
        <div className="csCarStoAuteur">
          <p className="type-caption font-semibold text-white">{story.nom}</p>
          <p className="type-caption mt-0.5 text-(--cs-texte-3)">{story.role}</p>
        </div>
      </Panneau>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export function SliderStories({
  stories,
  label = "Témoignages vidéo",
  className = "",
}: SliderStoriesProps) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const refDeclencheur = useRef<HTMLElement>(null);

  const storyActive = stories.find((s) => s.id === ouvert) ?? null;

  if (stories.length === 0) return null;

  return (
    <>
      <StylesConsole />
      <StylesCarrousels />

      <section
        aria-roledescription="carrousel"
        aria-label={label}
        className={className}
      >
        <div className="csCarPiste csCarStoPiste">
          {stories.map((story, i) => (
            <CarteStory
              key={story.id}
              story={story}
              index={i}
              total={stories.length}
              onOuvrir={(id) => setOuvert(id)}
            />
          ))}
        </div>
      </section>

      {/* Modale de lecture vidéo */}
      <Modale
        ouvert={ouvert !== null}
        onFermer={() => setOuvert(null)}
        titre={storyActive ? `Témoignage : ${storyActive.nom}` : "Témoignage"}
        refDeclencheur={refDeclencheur}
      >
        {storyActive ? (
          storyActive.src ? (
            <video
              src={storyActive.src}
              poster={storyActive.poster}
              controls
              /* Jamais de lecture automatique avec le son (RGAA 4.22). */
              autoPlay={false}
              playsInline
              /* Sous-titres : à fournir via une prop `tracks` si disponible. */
              className="w-full rounded"
              aria-label={`Témoignage de ${storyActive.nom}, ${storyActive.role}`}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="type-body text-(--cs-texte-2)">
                {/* Placeholder : aucune vidéo disponible sans accord client */}
                [À compléter — source vidéo et accord écrit du client]
              </p>
            </div>
          )
        ) : null}
      </Modale>
    </>
  );
}
