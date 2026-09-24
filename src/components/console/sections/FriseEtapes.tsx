/**
 * Section Frise d'étapes numérotées (famille Sections, système Console).
 *
 * Narration visuelle d'une démarche en plusieurs temps : chaque étape
 * porte un numéro néon, un titre et un texte court. Les étapes sont
 * reliées par un trait néon fin, horizontal sur grand écran et vertical
 * sur mobile, façon instrument de bord.
 *
 * Source des étapes : NumberedStep (src/lib/expertises/data.ts).
 * Utilisé sur /methode et les pages de compétences.
 *
 * Server Component. Aucun état local.
 *
 * Arbitrages :
 *  - RGAA 9.1 (critère liste) : liste ordonnée <ol>, titres d'étape
 *    au niveau approprié via la prop niveauTitre.
 *  - RGAA 10.7 (focus visible) : la lueur du diamant et le surlignage
 *    du numéro se déclenchent aussi sur :focus-within.
 *  - RGESN 2024 : Server Component, aucune image, aucune dépendance
 *    ajoutée, animations CSS pures.
 *  - Sécurité : aucune saisie, aucune donnée sensible exposée.
 *  - Rendu serveur = premier rendu navigateur : aucun état conditionnel
 *    côté client (les animations sont armées après hydratation par
 *    Apparition, voir animations/Apparition.tsx).
 */

import type { CSSProperties } from "react";

import type { NumberedStep } from "@/lib/expertises/data";
import { Etiquette, StylesConsole } from "../fondations";

/* ------------------------------------------------------------------ */
/* Styles propres à la frise                                           */
/* ------------------------------------------------------------------ */

/**
 * Feuille CSS de la frise. Une seule insertion React (href unique).
 *
 * Classes préfixées csFrise. Aucune taille écrite à la main : tout
 * passe par les classes type-* du système.
 *
 * Trait de connexion : il relie les diamants sans jamais croiser un
 * numéro (au-dessus du diamant sur bureau, à droite du trait sur mobile).
 *  - .csFriseLigneH (bureau) : un seul trait, du premier au dernier
 *    diamant, ciblé par l'animation « Tracé ».
 *  - .csFriseEtape::before (mobile) : un segment par étape, du diamant
 *    de l'étape à celui de la suivante.
 * La frise passe à l'horizontale à 1024 px : en dessous, cinq colonnes
 * sont trop étroites pour un titre d'étape.
 */
const STYLES_FRISE = `
/* Section et intérieur */
.csFrise { background: var(--cs-fond); }

.csFriseInterieur {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 24px;
}
@media (min-width: 768px) {
  .csFriseInterieur { padding: 96px 48px; }
}

/* En-tête */
.csFriseEntete {
  max-width: 640px;
  margin-bottom: 56px;
}

/* Enveloppe de la frise (ancre des lignes de connexion) */
.csFriseCorpsWrap { position: relative; }

/* Mobile : un segment par étape, du centre de son diamant (8 px sous le
   haut de l'étape, axe à 12 px) au centre du diamant suivant. */
.csFriseEtape:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 11.5px;
  top: 8px;
  bottom: -8px;
  width: 1px;
  background: var(--cs-neon);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.35);
  pointer-events: none;
  transform-origin: top center;
}

/* Bureau : un seul trait à la hauteur des diamants (numéro de 16 px,
   écart de 10 px, demi-diamant de 4 px). Il part du premier diamant
   (4 px) et s'arrête au dernier (25 px après le début de la dernière
   colonne : filet de 1 px, retrait de 20 px, demi-diamant). */
.csFriseLigneH { display: none; }
@media (min-width: 1024px) {
  .csFriseEtape:not(:last-child)::before { display: none; }
  .csFriseLigneH {
    display: block;
    position: absolute;
    top: 29.5px;
    left: 4px;
    right: calc(100% / var(--frise-n, 4) - 25px);
    height: 1px;
    background: var(--cs-neon);
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.35);
    pointer-events: none;
    transform-origin: left center;
  }
}

/* Liste et étapes */
.csFriseOl {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .csFriseOl {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
  }
}

/* Étape (mobile) : indicateur sur la gauche, texte à droite */
.csFriseEtape {
  position: relative;
  display: grid;
  grid-template-columns: 24px 1fr;
  grid-template-rows: 16px auto;
  column-gap: 20px;
  row-gap: 6px;
  padding-bottom: 40px;
}
.csFriseEtape:last-child { padding-bottom: 0; }

/* Étape (bureau) : indicateur en haut, texte en dessous */
@media (min-width: 1024px) {
  .csFriseEtape {
    display: flex;
    flex-direction: column;
    padding-bottom: 0;
    padding-left: 20px;
    /* Séparateur gauche : souligne la frontière entre étapes */
    border-left: 1px solid var(--cs-trait);
  }
  .csFriseEtape:first-child {
    padding-left: 0;
    border-left: none;
  }
}

/* Indicateur (diamant + numéro), purement visuel. Mobile : ses enfants
   se placent dans la grille de l'étape (diamant à gauche, numéro au-dessus
   du titre). Bureau : numéro, puis diamant sur le trait. */
.csFriseIndicateur { display: contents; }
.csFriseIndicateur > .csFriseDiam { grid-column: 1; grid-row: 1; justify-self: center; align-self: center; }
.csFriseIndicateur > .csFriseNum { grid-column: 2; grid-row: 1; }
@media (min-width: 1024px) {
  .csFriseIndicateur {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 20px;
  }
  .csFriseIndicateur > .csFriseDiam { align-self: auto; }
  .csFriseIndicateur > .csFriseNum { order: -1; }
}

/* Diamant néon, peint par-dessus le trait */
.csFriseDiam {
  position: relative;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.85);
  rotate: 45deg;
  transition: box-shadow var(--cs-rapide) linear;
}

/* Numéro : hauteur fixe, le trait se cale dessus */
.csFriseNum {
  display: block;
  height: 16px;
  line-height: 16px;
  color: rgba(125, 211, 252, 0.55);
  font-variant-numeric: tabular-nums;
  transition:
    color var(--cs-rapide) linear,
    text-shadow var(--cs-rapide) linear;
}

/* Texte de l'étape */
.csFriseTexte {
  grid-column: 2;
  grid-row: 2;
}
@media (min-width: 1024px) {
  .csFriseTexte { grid-column: auto; grid-row: auto; }
}

/* Titre de l'étape */
.csFriseTitre { display: block; margin-bottom: 8px; }

/* Corps de l'étape */
.csFriseCorps { display: block; }

/* Survol et focus clavier : allumage du numéro, lueur du diamant.
   Aucun décalage de mise en page (transition uniquement sur color/box-shadow). */
.csFriseEtape:is(:hover, :focus-within) .csFriseDiam {
  box-shadow:
    0 0 14px rgba(56, 189, 248, 1),
    0 0 4px rgba(56, 189, 248, 0.9);
}
.csFriseEtape:is(:hover, :focus-within) .csFriseNum {
  color: var(--cs-neon);
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
}

/* Focus clavier : le titre s'allume à son tour via :focus-within */
.csFriseEtape:focus-within .csFriseTitre { outline: none; }

/* Mouvement réduit : transitions désactivées */
@media (prefers-reduced-motion: reduce) {
  .csFriseDiam,
  .csFriseNum { transition: none; }
}
`;

/* ------------------------------------------------------------------ */
/* Types et props                                                      */
/* ------------------------------------------------------------------ */

export interface FriseEtapesProps {
  /** Libellé d'instrument au-dessus du titre. */
  etiquette?: string;
  /** Titre de la section frise. */
  titre?: string;
  /** Niveau de titre pour le titre de section (par défaut h2). */
  niveauTitre?: 2 | 3;
  /** Niveau de titre pour les étapes (par défaut h3). */
  niveauEtape?: 3 | 4;
  /** Chapeau sous le titre. */
  chapeau?: string;
  /** Les étapes, dans l'ordre. Source : NumberedStep (lib/expertises/data.ts). */
  items: NumberedStep[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/**
 * Frise d'étapes numérotées.
 *
 * Accepte les données NumberedStep de lib/expertises/data.ts sans
 * transformation. Aucune durée, aucun livrable, aucune donnée inventée :
 * seuls title et body sont affichés, tels que fournis par la source.
 */
export function FriseEtapes({
  etiquette,
  titre,
  niveauTitre = 2,
  niveauEtape = 3,
  chapeau,
  items,
  className = "",
}: FriseEtapesProps) {
  const TitreSec = `h${niveauTitre}` as "h2" | "h3";
  const TitreEtape = `h${niveauEtape}` as "h3" | "h4";

  return (
    <section className={`csFrise ${className}`}>
      <style href="console-frise" precedence="ds">
        {STYLES_FRISE}
      </style>
      <StylesConsole />

      <div className="csFriseInterieur">
        {/* En-tête optionnel */}
        {(etiquette || titre || chapeau) && (
          <header className="csFriseEntete">
            {etiquette ? <Etiquette>{etiquette}</Etiquette> : null}
            {titre ? (
              <>
                <TitreSec className="type-h2 mt-4 text-white">{titre}</TitreSec>
                <span
                  aria-hidden="true"
                  className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                />
              </>
            ) : null}
            {chapeau ? (
              <p className="type-lead mt-5 text-(--cs-texte-2)">{chapeau}</p>
            ) : null}
          </header>
        )}

        {/* Corps de la frise */}
        <div
          className="csFriseCorpsWrap"
          style={{ "--frise-n": items.length } as CSSProperties}
        >
          {/* Trait de connexion (bureau). Sur mobile : segments par étape. */}
          <span aria-hidden="true" className="csFriseLigneH" />

          {/*
           * Liste ordonnée : la numérotation sémantique est assurée par <ol>.
           * Les indicateurs visuels (diamant, numéro) sont aria-hidden.
           */}
          <ol className="csFriseOl">
            {items.map((etape, i) => (
              <li key={i} className="csFriseEtape">
                {/* Indicateur visuel : diamant néon + numéro */}
                <span aria-hidden="true" className="csFriseIndicateur">
                  <span className="csFriseDiam" />
                  <span aria-hidden="true" className="csFriseNum type-caption">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                {/* Texte de l'étape */}
                <span className="csFriseTexte">
                  <TitreEtape className="csFriseTitre type-h3 text-white">
                    {etape.title}
                  </TitreEtape>
                  <p className="csFriseCorps type-body text-(--cs-texte-2)">
                    {etape.body}
                  </p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
