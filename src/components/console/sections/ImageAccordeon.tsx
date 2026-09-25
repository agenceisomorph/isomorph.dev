/**
 * Section Image + Accordéon (famille Sections Image, système Console).
 *
 * Une image à gauche et des items d'accordéon à droite. Ouvrir un item
 * fait passer l'image en fondu (transition opacity CSS). Un seul item
 * ouvert à la fois, un toujours ouvert (le premier par défaut).
 *
 * "use client" : état de l'item ouvert.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : bouton avec aria-expanded et aria-controls.
 *  - Critère 10.7 : focus visible par la barre néon gauche (bsSec*).
 *  - Critère 1.1 : alt descriptif ou "" selon l'image.
 * Éco : état minimal (un entier), pas de bibliothèque d'animation.
 */

"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { Etiquette, Panneau, StylesConsole } from "../fondations";
import { StylesSections } from "./StylesSections";

export interface ItemAccordeonImage {
  question: string;
  reponse: string;
  image: { src: string; alt: string; largeur: number; hauteur: number };
}

export interface ImageAccordeonProps {
  etiquette?: string;
  titre: string;
  niveauTitre?: 2 | 3;
  items: ItemAccordeonImage[];
  className?: string;
}

function IconePlus() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="csSecAccSigne"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="10" y1="4" x2="10" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ImageAccordeon({
  etiquette,
  titre,
  niveauTitre = 2,
  items,
  className = "",
}: ImageAccordeonProps) {
  const baseId = useId();
  /* Premier item ouvert par défaut. Jamais fermé (clic sur item ouvert = ignoré). */
  const [ouvert, setOuvert] = useState<number>(0);

  const Titre = `h${niveauTitre}` as "h2" | "h3";

  function ouvrir(index: number) {
    if (index !== ouvert) setOuvert(index);
  }

  return (
    <section className={`bg-(--cs-fond-2) ${className}`}>
      <StylesConsole />
      <StylesSections />

      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-12 md:py-24">
        {/* En-tête de section au-dessus de la grille. */}
        <header className="mb-12 max-w-[640px]" data-app="texte">
          {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
          <Titre className="type-h2 mt-4 text-white">{titre}</Titre>
          <span
            aria-hidden="true"
            className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
        </header>

        <div className="csSecAccGrille">
          {/* Zone image : les images s'empilent, seule l'active est visible. */}
          <div className="csSecAccImgZone" data-app="image">
            <Panneau equerres coupe="l" className="h-full w-full">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="csSecAccImg"
                  data-active={i === ouvert ? "true" : "false"}
                  aria-hidden={i !== ouvert}
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </Panneau>
          </div>

          {/* Accordéon. */}
          <div>
            {items.map((item, i) => {
              const btnId = `${baseId}-btn-${i}`;
              const panneauId = `${baseId}-panneau-${i}`;
              const estOuvert = i === ouvert;

              return (
                <div key={i} className="csSecAccItem">
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={estOuvert}
                    aria-controls={panneauId}
                    onClick={() => ouvrir(i)}
                    className="csSecAccBtn"
                  >
                    <span>{item.question}</span>
                    <IconePlus />
                  </button>
                  <div
                    id={panneauId}
                    role="region"
                    aria-labelledby={btnId}
                    className="csSecAccCorps"
                    data-open={estOuvert ? "true" : "false"}
                  >
                    <div className="csSecAccCorpsInner">
                      <p className="type-body pb-5 pl-3 text-(--cs-texte-2)">{item.reponse}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
