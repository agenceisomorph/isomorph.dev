/**
 * Section Image + Texte (famille Sections Image, système Console).
 *
 * Image dans un cadre coupé (équerres aux coins non coupés) et bloc de texte
 * côte à côte. Sur téléphone : empilé, image en premier.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *  - Critère 1.1 : alt descriptif requis si l'image porte de l'information,
 *    alt="" si elle est décorative.
 *  - Critère 9.1 : usage d'un <section> sémantique avec titre.
 *  - Critère 10.7 : focus visible via la règle csSec* des fondations.
 * Éco : Server Component, next/image avec chargement différé par défaut.
 */

import Image from "next/image";

import { Bouton, type VarianteBouton } from "../Bouton";
import { Etiquette, Panneau, StylesConsole } from "../fondations";
import { StylesSections } from "./StylesSections";

export interface ImageTexteProps {
  /** Libellé court au-dessus du titre (instrument). */
  etiquette?: string;
  /** Titre de la section (h2 ou h3 selon la hiérarchie de la page). */
  titre: string;
  /** Niveau du titre. Par défaut h2. */
  niveauTitre?: 2 | 3;
  /** Corps de texte. */
  corps: string;
  /** CTA facultatif. */
  cta?: { label: string; href: string; variante?: VarianteBouton };
  /** Image. alt="" pour une image décorative. */
  image: { src: string; alt: string; largeur: number; hauteur: number };
  /**
   * Côté de l'image sur bureau (gauche par défaut).
   * Sur téléphone, l'image est toujours en premier.
   */
  cote?: "gauche" | "droite";
  className?: string;
}

export function ImageTexte({
  etiquette,
  titre,
  niveauTitre = 2,
  corps,
  cta,
  image,
  cote = "gauche",
  className = "",
}: ImageTexteProps) {
  const Titre = `h${niveauTitre}` as "h2" | "h3";
  const inverse = cote === "droite";

  return (
    <section className={`bg-(--cs-fond) ${className}`}>
      <StylesConsole />
      <StylesSections />

      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
        <div className={`csSecGrille`} data-inverse={inverse ? "true" : undefined}>
          {/* Image dans le cadre coupé. */}
          {/* L'image est toujours en premier dans le HTML (ordre téléphone). */}
          <div className="csSecCadreImg" data-app="image">
            <Panneau equerres coupe="l" className="h-full w-full">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </Panneau>
          </div>

          {/* Bloc de texte. */}
          <div className="csSecBloc flex flex-col gap-6" data-app="texte">
            {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
            <Titre className="type-h2 text-white">{titre}</Titre>
            <span
              aria-hidden="true"
              className="block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            />
            <p className="type-body text-(--cs-texte-2)">{corps}</p>
            {cta ? (
              <div>
                <Bouton href={cta.href} variante={cta.variante ?? "secondaire"} taille="m">
                  {cta.label}
                </Bouton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
