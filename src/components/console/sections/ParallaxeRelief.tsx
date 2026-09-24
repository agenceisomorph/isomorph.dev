/**
 * Section Parallaxe en relief (famille Sections, système Console) : pleine
 * largeur, cinq plans de crêtes du lointain au premier plan, qui se déplacent
 * chacun à sa vitesse au défilement. Aucune image : le relief est celui du
 * fond « Crêtes », figé (voir reliefParallaxe.ts).
 *
 * Cinq variantes (`variante`) :
 *  - strates : chaque plan défile à sa vitesse, le lointain plus lentement ;
 *  - travelling : les plans glissent de côté, le premier plan plus vite ;
 *  - approche : les plans s'agrandissent depuis l'horizon, comme en avançant ;
 *  - mise-au-point : la netteté passe du lointain au premier plan ;
 *  - lever : la scène se fige à l'écran et les plans montent un à un.
 *
 * Server Component : le relief est calculé au rendu serveur. Seul
 * PiloteParallaxe tourne dans le navigateur, pour écrire l'avancement du
 * défilement (`--p`) ; tout le mouvement est en CSS, sur les propriétés
 * translate, scale et filter, jamais transform.
 *
 * Arbitrages :
 *  - RGAA : relief décoratif (aria-hidden) ; voile de lecture sous le texte.
 *    Mouvement réduit (13.8) : plans immobiles, scène jamais figée.
 *  - RGESN : aucune image, aucune dépendance ; lecture du défilement limitée
 *    à une par image et à la section visible.
 *  - Sans script : la composition de repos s'affiche (--p à 0,5).
 */

import type { CSSProperties } from "react";

import { Bouton, type VarianteBouton } from "../Bouton";
import { Etiquette, StylesConsole } from "../fondations";
import { PiloteParallaxe } from "./PiloteParallaxe";
import { HAUTEUR_RELIEF, LARGEUR_RELIEF, NOMBRE_PLANS, plansRelief } from "./reliefParallaxe";

export type VarianteParallaxe = "strates" | "travelling" | "approche" | "mise-au-point" | "lever";

/**
 * Chaque plan porte son rang `--i` (0 au fond) et sa proximité `--d` (0 au
 * fond, 1 au premier plan). `--c` vaut 0 quand la section est centrée à
 * l'écran, de -0,5 à l'entrée à 0,5 à la sortie.
 */
const STYLES = `
.csPx {
  --p: 0.5;
  --c: calc(var(--p) - 0.5);
  position: relative;
  background: var(--cs-fond);
}
.csPxScene {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: clamp(600px, 92vh, 880px);
  overflow: clip;
  isolation: isolate;
}

/* Ciel : léger dégradé et lueur à l'horizon, derrière les crêtes de droite. */
.csPxCiel {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 55% 38% at 72% 56%, rgba(56, 189, 248, 0.1), transparent 70%),
    linear-gradient(180deg, var(--cs-fond-2), var(--cs-fond) 62%);
}

.csPxPlans { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.csPxPlan {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  will-change: translate;
}
.csPxPlan path {
  fill: var(--cs-fond);
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
}
/* Sur téléphone, le relief occupe le bas de la section, sous le texte. */
@media (max-width: 767px) {
  .csPxPlan { height: 60%; }
}

/* Voile de lecture : le relief s'efface derrière le texte (4,5:1 tenu). */
.csPxVoile {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--cs-fond) 84%, transparent) 0%,
    color-mix(in srgb, var(--cs-fond) 60%, transparent) 38%,
    transparent 66%);
}
@media (max-width: 767px) {
  .csPxVoile {
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--cs-fond) 88%, transparent) 0%,
      color-mix(in srgb, var(--cs-fond) 64%, transparent) 50%,
      transparent 72%);
  }
}

.csPxContenu {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-block: 64px;
}
@media (min-width: 768px) {
  .csPxContenu { padding-block: 112px; }
}

/* Strates : le lointain traîne, le premier plan file. */
.csPx[data-parallaxe="strates"] .csPxPlan {
  translate: 0 calc(var(--c) * (0.3 - var(--d)) * 44%);
}

/* Travelling : glissement latéral, du lent au rapide. */
.csPx[data-parallaxe="travelling"] .csPxPlan {
  translate: calc(var(--c) * (0.1 + 0.9 * var(--d)) * -40%) 0;
}

/* Approche : les plans grandissent depuis l'horizon, le premier plan d'abord.
   Jamais en dessous de l'échelle 1 : aucun bord du dessin n'entre à l'écran.
   Sans will-change : le trait est redessiné net à chaque échelle. */
.csPx[data-parallaxe="approche"] .csPxPlan {
  transform-origin: 50% 52%;
  scale: calc(1 + var(--p) * (0.1 + 0.9 * var(--d)) * 0.7);
  will-change: auto;
}

/* Mise au point : le plan net (--f) avance du fond (0) au premier plan (4)
   pendant que la section traverse l'écran ; les autres se floutent. */
.csPx[data-parallaxe="mise-au-point"] {
  --f: clamp(0, (var(--p) - 0.2) / 0.6 * ${NOMBRE_PLANS - 1}, ${NOMBRE_PLANS - 1});
}
.csPx[data-parallaxe="mise-au-point"] .csPxPlan {
  translate: 0 calc(var(--c) * (0.35 - var(--d)) * 28%);
  filter: blur(min(4px, max(calc((var(--f) - var(--i)) * 1.5px), calc((var(--i) - var(--f)) * 1.5px))));
  will-change: translate, filter;
}

/* Lever : la scène se fige le temps que les plans montent, du fond vers l'avant. */
.csPx[data-parallaxe="lever"] { --p: 1; height: 240vh; }
.csPx[data-parallaxe="lever"] .csPxScene {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  min-height: 560px;
}
.csPx[data-parallaxe="lever"] .csPxPlan {
  --r: clamp(0, (var(--p) - var(--i) * 0.13) / 0.4, 1);
  translate: 0 calc((1 - var(--r)) * (34% + var(--i) * 9%));
  opacity: clamp(0, var(--r) * 3, 1);
}

/* Mouvement réduit : plans immobiles, scène jamais figée. */
@media (prefers-reduced-motion: reduce) {
  .csPx[data-parallaxe] .csPxPlan { translate: none; scale: none; filter: none; opacity: 1; will-change: auto; }
  .csPx[data-parallaxe="lever"] { height: auto; }
  .csPx[data-parallaxe="lever"] .csPxScene { position: relative; height: auto; min-height: clamp(600px, 92vh, 880px); }
}
`;

export interface ParallaxeReliefProps {
  variante?: VarianteParallaxe;
  etiquette?: string;
  titre: string;
  niveauTitre?: 2 | 3;
  chapeau?: string;
  cta?: { label: string; href: string; variante?: VarianteBouton };
  className?: string;
}

export function ParallaxeRelief({
  variante = "strates",
  etiquette,
  titre,
  niveauTitre = 2,
  chapeau,
  cta,
  className = "",
}: ParallaxeReliefProps) {
  const Titre = `h${niveauTitre}` as "h2" | "h3";
  const plans = plansRelief();

  return (
    <section
      className={`csPx ${className}`}
      data-parallaxe={variante}
      data-epingle={variante === "lever" ? "" : undefined}
    >
      <style href="console-parallaxe-relief" precedence="ds">
        {STYLES}
      </style>
      <StylesConsole />

      <div className="csPxScene">
        <div aria-hidden="true" className="csPxCiel" />
        <div aria-hidden="true" className="csPxPlans">
          {plans.map((plan, i) => (
            <svg
              key={i}
              className="csPxPlan"
              viewBox={`0 0 ${LARGEUR_RELIEF} ${HAUTEUR_RELIEF}`}
              preserveAspectRatio="xMidYMax slice"
              focusable="false"
              style={{ "--i": i, "--d": i / (NOMBRE_PLANS - 1) } as CSSProperties}
            >
              {plan.map((ligne, k) => (
                <path key={k} d={ligne.d} stroke={ligne.couleur} strokeWidth={ligne.epaisseur} />
              ))}
            </svg>
          ))}
        </div>
        <div aria-hidden="true" className="csPxVoile" />

        <div className="csPxContenu">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12">
            <div className="max-w-[560px]">
              {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
              <Titre className="type-h2 mt-4 text-white">{titre}</Titre>
              <span
                aria-hidden="true"
                className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
              />
              {chapeau ? <p className="type-lead mt-5 text-(--cs-texte-2)">{chapeau}</p> : null}
              {cta ? (
                <div className="mt-8">
                  <Bouton href={cta.href} variante={cta.variante ?? "principal"} taille="m">
                    {cta.label}
                  </Bouton>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <PiloteParallaxe />
    </section>
  );
}
