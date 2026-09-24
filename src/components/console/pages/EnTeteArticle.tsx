/**
 * En-tête d'article pour les gabarits Console.
 *
 * Mobile : image pleine largeur (16/9) en premier, puis métadonnées.
 * Bureau : métadonnées à gauche, image à droite dans un cadre coupé.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *   - Critère 1.1 : alt descriptif fourni par le consommateur.
 *   - Critère 9.1 : l'élément <header> contient le <h1> unique de la page.
 *   - Critère 13.1 : time[datetime] pour la date.
 *   - Critère 10.7 : focus clavier via les fondations (csBouton, csNavArianeLien).
 * Eco : Server Component, next/image avec priority sur le LCP.
 */

import Image from "next/image";

import { Etiquette, Panneau, StylesConsole } from "../fondations";
import { StylesPages } from "./StylesPages";

export interface EnTeteArticleProps {
  /** Catégorie affichée comme etiquette instrument. */
  categorie: string;
  /** Titre principal de l'article. Rendu en h1. */
  titre: string;
  /** Chapeau optionnel sous le titre. */
  chapeau?: string;
  /** Date ISO 8601 : valeur de l'attribut datetime. */
  dateISO: string;
  /** Date lisible affichée dans le document. */
  dateAffichee: string;
  /** Auteur : nom affiché, rôle, chemin de l'avatar. */
  auteur?: { nom: string; role: string; avatar: string };
  /** Image hero. alt="" pour une image décorative. */
  /** Absente : le titre prend toute la largeur (article sans illustration). */
  image?: { src: string; alt: string; largeur: number; hauteur: number };
}

export function EnTeteArticle({
  categorie,
  titre,
  chapeau,
  dateISO,
  dateAffichee,
  auteur,
  image,
}: EnTeteArticleProps) {
  return (
    <>
      <StylesConsole />
      <StylesPages />
      {/* Sur téléphone, l'image s'affiche avant (column-reverse). Sur bureau,
          le flex-row place le texte a gauche et l'image a droite. */}
      <div className="csPagArticleHero">
        {/* Bloc de métadonnées */}
        <header className={image ? "min-w-0 flex-1" : "min-w-0 max-w-[820px]"}>
          <Etiquette>{categorie}</Etiquette>
          <h1 className="type-h1 mt-4 text-white">{titre}</h1>
          {/* Trait néon sous le titre */}
          <span
            aria-hidden="true"
            className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
          {chapeau ? (
            <p className="type-lead mt-5 text-(--cs-texte-2)">{chapeau}</p>
          ) : null}
          {/* Date et auteur */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <time
              dateTime={dateISO}
              className="type-caption text-(--cs-texte-3)"
            >
              {dateAffichee}
            </time>
            {auteur ? (
            <div className="flex items-center gap-2">
              <Image
                src={auteur.avatar}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <div>
                <span className="type-caption font-semibold text-(--cs-texte-2)">
                  {auteur.nom}
                </span>
                <span className="type-caption ml-1.5 text-(--cs-texte-3)">
                  {auteur.role}
                </span>
              </div>
            </div>
            ) : null}
          </div>
        </header>

        {/* Image hero dans un cadre coupé */}
        {image ? (
          <div className="csPagArticleImg">
            <Panneau coupe="l" equerres className="h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 340px"
                style={{ objectFit: "cover" }}
              />
            </Panneau>
          </div>
        ) : null}
      </div>
    </>
  );
}
