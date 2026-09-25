/**
 * Section Parallaxe (famille Sections Image, système Console).
 *
 * Le fond image défile plus lentement que la page, uniquement via CSS
 * (animation-timeline: view(), amélioration progressive). Sans prise en
 * charge du navigateur, le fond reste fixe et propre (scale 1, pas de
 * translation). Texte lisible sur fond sombre (voile).
 *
 * Server Component. Aucun état, aucun script.
 *
 * Arbitrage éco / perf :
 *  - L'image de fond est chargée avec loading="lazy" (pas le LCP).
 *  - Le surdimensionnement du conteneur (-15% inset) est minimal.
 *  - @supports garantit que la feuille CSS de la parallaxe n'est activée
 *    que sur les navigateurs qui la prennent en charge.
 *
 * RGAA 4.1 :
 *  - Critère 1.1 : alt="" sur l'image de fond (décorative, la sémantique
 *    vient du texte superposé).
 *  - Critère 9.1 : section avec titre.
 *  - Critère 10.7 : focus CTA géré par les classes csBouton des fondations.
 *
 * Mouvement réduit :
 *  - La règle @media dans StylesSections neutralise l'animation et remet
 *    inset: 0 pour que l'image occupe exactement la section.
 */

import Image from "next/image";

import { Bouton, type VarianteBouton } from "../Bouton";
import { Etiquette, StylesConsole } from "../fondations";
import { StylesSections } from "./StylesSections";

export interface ParallaxeProps {
  etiquette?: string;
  titre: string;
  niveauTitre?: 2 | 3;
  chapeau?: string;
  /** Image de fond. alt="" car décorative (le texte porte l'information). */
  image: { src: string; alt?: string };
  cta?: { label: string; href: string; variante?: VarianteBouton };
  /** Hauteur minimale de la section. Par défaut 480px. */
  hauteurMin?: string;
  className?: string;
}

export function Parallaxe({
  etiquette,
  titre,
  niveauTitre = 2,
  chapeau,
  image,
  cta,
  hauteurMin = "480px",
  className = "",
}: ParallaxeProps) {
  const Titre = `h${niveauTitre}` as "h2" | "h3";

  return (
    <section
      className={`csSecParallaxe ${className}`}
      style={{ minHeight: hauteurMin }}
    >
      <StylesConsole />
      <StylesSections />

      {/* Image de fond : décorative (aria-hidden). */}
      <div className="csSecParallaxeFond" aria-hidden="true">
        <Image
          src={image.src}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          loading="lazy"
        />
      </div>

      {/* Voile sombre pour la lisibilité. */}
      <div className="csSecVoile" aria-hidden="true" />

      {/* Contenu. */}
      <div className="csSecParallaxeContenu mx-auto max-w-[1280px] px-6 py-20 md:px-12 md:py-28">
        <div className="max-w-[600px]" data-app="texte">
          {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
          <Titre className="type-h2 mt-4 text-white">{titre}</Titre>
          <span
            aria-hidden="true"
            className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
          />
          {chapeau ? (
            <p className="type-lead mt-5 text-(--cs-texte-2)">{chapeau}</p>
          ) : null}
          {cta ? (
            <div className="mt-8">
              <Bouton href={cta.href} variante={cta.variante ?? "secondaire"} taille="m">
                {cta.label}
              </Bouton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
