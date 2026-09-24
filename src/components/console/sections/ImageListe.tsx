/**
 * Section Image + Liste numérotée (famille Sections Image, système Console).
 *
 * Image dans un cadre coupé, liste de points numérotés à la manière de la
 * liste de services du hero : index néon, trait vertical, pas de lien
 * obligatoire. Quand href est fourni, toute la ligne est un lien.
 *
 * Server Component. Aucun état.
 *
 * RGAA 4.1 :
 *  - Critère 1.1 : alt descriptif requis si l'image porte de l'information.
 *  - Critère 6.1 : chaque lien a un intitulé visible.
 *  - Critère 10.7 : focus visible par la barre néon gauche.
 * Éco : Server Component, next/image chargement différé.
 */

import Image from "next/image";
import Link from "next/link";

import { Etiquette, Panneau, StylesConsole } from "../fondations";
import { StylesSections } from "./StylesSections";

export interface ItemListe {
  titre: string;
  description?: string;
  /** Sans href, l'item est affiché mais non cliquable. */
  href?: string;
}

export interface ImageListeProps {
  etiquette?: string;
  titre: string;
  niveauTitre?: 2 | 3;
  chapeau?: string;
  items: ItemListe[];
  image: { src: string; alt: string; largeur: number; hauteur: number };
  cote?: "gauche" | "droite";
  className?: string;
}

export function ImageListe({
  etiquette,
  titre,
  niveauTitre = 2,
  chapeau,
  items,
  image,
  cote = "gauche",
  className = "",
}: ImageListeProps) {
  const Titre = `h${niveauTitre}` as "h2" | "h3";
  const inverse = cote === "droite";

  return (
    <section className={`bg-(--cs-fond) ${className}`}>
      <StylesConsole />
      <StylesSections />

      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
        <div className="csSecGrille" data-inverse={inverse ? "true" : undefined}>
          {/* Image. Toujours en premier dans le HTML (ordre téléphone). */}
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

          {/* Bloc liste. */}
          <div className="csSecBloc flex flex-col gap-6" data-app="texte">
            {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
            <Titre className="type-h2 text-white">{titre}</Titre>
            <span
              aria-hidden="true"
              className="block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            />
            {chapeau ? <p className="type-lead text-(--cs-texte-2)">{chapeau}</p> : null}

            <nav aria-label={titre}>
              <ul role="list">
                {items.map((item, i) => {
                  const index = (
                    <span aria-hidden="true" className="csSecListeIdx type-caption">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  );
                  const contenu = (
                    <span className="csSecListeTexte">
                      <span className="type-h3 block text-white">{item.titre}</span>
                      {item.description ? (
                        <span className="type-caption block text-(--cs-texte-3)">{item.description}</span>
                      ) : null}
                    </span>
                  );

                  if (item.href) {
                    return (
                      <li key={i}>
                        <Link
                          href={item.href}
                          className="csSecListeItem csSecListeLien"
                        >
                          {index}
                          {contenu}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={i}>
                      <div className="csSecListeItem csSecListeStatique">
                        {index}
                        {contenu}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
