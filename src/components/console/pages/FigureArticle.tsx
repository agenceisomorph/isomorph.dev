/**
 * Image d'article habillée par le système Console : panneau de verre à coins
 * coupés, équerres, image en retrait de 6 px coupée au même angle, vignette
 * sombre sur les bords pour fondre les illustrations claires dans la nuit.
 *
 * RGAA 1.1 : l'`alt` est porté par l'image ; le décor est aria-hidden.
 * Perf : `prioritaire` seulement pour la première image (candidate LCP).
 */

import Image from "next/image";

import { Panneau } from "../fondations";
import { StylesPages } from "./StylesPages";

export interface FigureArticleProps {
  src: string;
  alt: string;
  largeur: number;
  hauteur: number;
  prioritaire?: boolean;
}

export function FigureArticle({ src, alt, largeur, hauteur, prioritaire = false }: FigureArticleProps) {
  return (
    <figure className="csPagFig">
      <StylesPages />
      <Panneau coupe="l" equerres className="csPagFigCadre">
        <div className="csPagFigImg" style={{ aspectRatio: `${largeur} / ${hauteur}` }}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={prioritaire}
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover"
          />
          <span aria-hidden="true" className="csPagFigVoile" />
        </div>
      </Panneau>
    </figure>
  );
}
