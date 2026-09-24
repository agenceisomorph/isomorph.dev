/**
 * SliderImages : carrousel d'images à bords coupés.
 *
 * - Défilement natif `scroll-snap`, aucune bibliothèque externe.
 * - Boutons précédent / suivant en cadres coupés Console.
 * - Compteur d'instrument « 02 / 05 » + barre de progression néon.
 * - Navigation par flèches du clavier (← →).
 * - Balayage au doigt natif via `scroll-snap`.
 * - Aucun défilement automatique (RGAA : jamais de mouvement non contrôlé).
 *
 * "use client" : état du slide courant, ref sur la piste, listener clavier.
 *
 * RGAA 4.1 :
 *  - Critère 7.1 : région `aria-roledescription="carrousel"`, aria-label.
 *  - Critère 7.3 : diapositives `role="group"` `aria-roledescription="diapositive"`,
 *                  aria-label « 2 sur 5 ».
 *  - Critère 11.1 : boutons nommés, cibles 44 × 44 px (csCarBtn).
 *  - Critère 1.1 : alt fourni pour chaque image.
 *
 * Éco : next/image avec lazy loading sauf la première image (LCP).
 * Perf : scroll natif, 0 JS inutile, barre animée par CSS scale.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Panneau, StylesConsole, Trace } from "../fondations";
import { StylesCarrousels } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ImageSlider {
  /** Chemin relatif depuis `public/` : ex. `/salle-machines/couches.webp`. */
  src: string;
  alt: string;
  /** Légende affichée en bas de la diapositive. Optionnelle. */
  legende?: string;
  width: number;
  height: number;
  /**
   * Lien optionnel. Quand présent, l'image et la légende deviennent un lien
   * cliquable. Rétrocompatible : l'absence de href ne change rien à l'affichage.
   * RGAA 6.1 : le libellé accessible est fourni par `lienLabel` ou par `alt`.
   */
  href?: string;
  /** Libellé accessible du lien. Requis si `href` est fourni et que `alt` est vide. */
  lienLabel?: string;
}

export interface SliderImagesProps {
  images: ImageSlider[];
  /** Libellé de la région (RGAA 7.1). Ex. : « Salle des machines ». */
  label: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Icônes des boutons                                                  */
/* ------------------------------------------------------------------ */

function IcoChevron({ sens }: { sens: "gauche" | "droite" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0">
      <path
        d={sens === "gauche" ? "M10 3 L5 8 L10 13" : "M6 3 L11 8 L6 13"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Bouton précédent / suivant en cadre coupé                          */
/* ------------------------------------------------------------------ */

function BoutonNav({
  sens,
  onClick,
  disabled,
}: {
  sens: "precedent" | "suivant";
  onClick: () => void;
  disabled: boolean;
}) {
  const label = sens === "precedent" ? "Image précédente" : "Image suivante";
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="csCarBtn csCoupe csPanneau csTracable"
      data-coupe="s"
    >
      <StylesConsole />
      <StylesCarrousels />
      {/* Verre et bord du cadre coupé */}
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <Trace />
      <IcoChevron sens={sens === "precedent" ? "gauche" : "droite"} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export function SliderImages({ images, label, className = "" }: SliderImagesProps) {
  const [courant, setCourant] = useState(0);
  const pisteRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  /** Défile vers l'index demandé et met à jour l'état. */
  const allerA = useCallback(
    (index: number) => {
      const i = Math.min(Math.max(0, index), total - 1);
      setCourant(i);
      const piste = pisteRef.current;
      if (!piste) return;
      const diapo = piste.children[i] as HTMLElement | undefined;
      if (diapo) diapo.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    },
    [total],
  );

  /** Flèches du clavier sur la piste (← →). */
  useEffect(() => {
    const piste = pisteRef.current;
    if (!piste) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); allerA(courant - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); allerA(courant + 1); }
    };
    piste.addEventListener("keydown", handler);
    return () => piste.removeEventListener("keydown", handler);
  }, [courant, allerA]);

  /** Synchronise l'état quand l'utilisateur balaye au doigt. */
  useEffect(() => {
    const piste = pisteRef.current;
    if (!piste) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Array.from(piste.children).indexOf(entry.target as HTMLElement);
            if (idx >= 0) setCourant(idx);
          }
        }
      },
      { root: piste, threshold: 0.6 },
    );
    Array.from(piste.children).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (total === 0) return null;

  const progression = ((courant + 1) / total) * 100;

  return (
    <>
      <StylesConsole />
      <StylesCarrousels />
      <Panneau
        coupe="m"
        className={`csCarSliIm ${className}`}
        as="section"
        aria-roledescription="carrousel"
        aria-label={label}
        /* Panneau ne passe pas d'aria arbitraires ; on les pose via style */
        style={{ "--cs-c": "16px" } as React.CSSProperties}
      >
        {/* Piste de défilement */}
        <div
          ref={pisteRef}
          className="csCarPiste"
          /* La piste n'est pas focusable elle-même : les diapositives le sont. */
        >
          {images.map((img, i) => {
            /* Contenu commun : image + légende */
            const contenu = (
              <>
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  /* LCP : première image chargée en priorité, les autres en lazy. */
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 767px) 100vw, (max-width: 1280px) 80vw, 960px"
                  className="w-full h-full object-cover"
                />
                {img.legende ? (
                  <div aria-hidden={!!img.href} className="csCarSliImLegende">
                    <p className="type-caption text-white/80">{img.legende}</p>
                  </div>
                ) : null}
              </>
            );

            return (
              <div
                key={img.src}
                role="group"
                aria-roledescription="diapositive"
                aria-label={`${i + 1} sur ${total}`}
                className="csCarSliImDia"
              >
                {img.href ? (
                  /*
                   * RGAA 6.1 : le libellé du lien est fourni par lienLabel,
                   * ou par l'alt de l'image si lienLabel est absent.
                   * Le lien englobe l'image et la légende, pas la diapositive entière
                   * (role="group" et aria-roledescription restent sur le div parent).
                   */
                  <Link
                    href={img.href}
                    aria-label={img.lienLabel ?? img.alt}
                    className="block h-full w-full"
                  >
                    {contenu}
                  </Link>
                ) : (
                  contenu
                )}
              </div>
            );
          })}
        </div>

        {/* Contrôles : compteur, barre, boutons */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Compteur d'instrument */}
          <p
            aria-live="polite"
            aria-atomic="true"
            className="csCarSliImCompteur type-caption text-(--cs-neon)"
          >
            <span className="sr-only">Image </span>
            {String(courant + 1).padStart(2, "0")}
            <span aria-hidden="true" className="mx-1 text-white/30">/</span>
            <span className="sr-only"> sur </span>
            {String(total).padStart(2, "0")}
          </p>

          {/* Barre de progression néon */}
          <div className="csCarSliImBarre" aria-hidden="true">
            <div
              className="csCarSliImBarreNeon"
              style={{ scale: `${progression / 100} 1` }}
            />
          </div>

          {/* Boutons précédent / suivant */}
          <BoutonNav
            sens="precedent"
            onClick={() => allerA(courant - 1)}
            disabled={courant === 0}
          />
          <BoutonNav
            sens="suivant"
            onClick={() => allerA(courant + 1)}
            disabled={courant === total - 1}
          />
        </div>
      </Panneau>
    </>
  );
}
