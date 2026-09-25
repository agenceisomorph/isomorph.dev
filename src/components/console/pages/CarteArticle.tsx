/**
 * Carte d'article pour la liste d'actualités, dans le style Console.
 *
 * Structure calquée sur `contenus/Carte.tsx` (csVerre, csBord, csDiag, Trace),
 * enrichie d'une image, d'un thème, d'un résumé et d'une date.
 *
 * RGAA 4.1 :
 *   - Critère 6.1 : le lien bloc est intitulé par le titre visible de l'article.
 *   - Critère 1.2 : l'image est décorative (alt=""), le titre transmet l'information.
 *   - Critère 13.1 : time[dateTime] pour la date publiée.
 *   - Critère 10.7 : focus clavier = tracé néon, identique au survol.
 * Eco : next/image lazy sauf la première carte (prioritaire = candidat LCP).
 *
 * Source des données : src/app/(fr)/actualites/page.tsx, tableau `articles`.
 */

import Image from "next/image";
import Link from "next/link";

import { StylesConsole, Trace } from "../fondations";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * Résumé d'article identique à l'interface du même nom dans
 * src/app/(fr)/actualites/page.tsx.
 */
export interface ResumeArticle {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  /** Date affichée. */
  date: string;
  /** Date ISO 8601, valeur de l'attribut dateTime. */
  dateISO: string;
  image: string;
}

/* ------------------------------------------------------------------ */
/* Styles de la famille « Articles »                                   */
/* ------------------------------------------------------------------ */

const STYLES_ARTICLES = `
/* ===================== Carte article ===================== */
/* Lien bloc ; la structure reprend csVerre/csBord/csDiag du Panneau.
   L'image et le corps sont empilés en colonne. */
.csArtCarte {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Image : coupée comme le coin haut gauche de la carte ; le bord et les
   diagonales passent au-dessus d'elle. */
.csArtImg {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  flex-shrink: 0;
  clip-path: polygon(var(--cs-c) 0, 100% 0, 100% 100%, 0 100%, 0 var(--cs-c));
}
.csArtCarte > :is(.csBord, .csDiag, .csTrace) { z-index: 2; }
.csArtImg img {
  transition: filter var(--cs-moyen) var(--cs-ease);
}
.csArtCarte:is(:hover, :focus-visible) .csArtImg img {
  filter: brightness(1.1) saturate(1.05);
}

/* Corps : métadonnées. */
.csArtCorps {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
  gap: 8px;
}

/* Thème : étiquette néon en petites capitales. */
.csArtTheme {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cs-neon);
}

/* Titre : type-h3 sans surcharge (poids 300 défini par l'échelle). */
.csArtTitre {
  color: var(--cs-texte);
  line-height: 1.35;
  margin-top: 2px;
}

/* Résumé : trois lignes maximum. */
.csArtResume {
  color: var(--cs-texte-2);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Date : filet de séparation discret. */
.csArtDate {
  color: var(--cs-texte-3);
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--cs-trait);
}

/* ===================== Filtre par thème ===================== */
/* Groupe de boutons bascule aria-pressed. */
.csArtFiltreZone {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* Bouton : coins coupés de 8 px, allumage au survol et au focus. */
.csArtFiltreBtn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--cs-texte-2);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  cursor: pointer;
  white-space: nowrap;
  --cs-c: 8px;
  clip-path: polygon(var(--cs-c) 0, 100% 0, 100% calc(100% - var(--cs-c)), calc(100% - var(--cs-c)) 100%, 0 100%, 0 var(--cs-c));
  transition: color var(--cs-rapide) linear, border-color var(--cs-rapide) linear, background-color var(--cs-rapide) linear;
}
.csArtFiltreCount {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--cs-texte-3);
  transition: color var(--cs-rapide) linear;
}
/* Survol, focus et état actif (aria-pressed="true") s'allument de la même façon.
   Aucun anneau outline. */
.csArtFiltreBtn:is(:hover, :focus-visible),
.csArtFiltreBtn[aria-pressed="true"] {
  outline: none;
  color: var(--cs-neon);
  border-color: rgba(125, 211, 252, 0.38);
  background: var(--cs-neon-voile);
}
.csArtFiltreBtn:is(:hover, :focus-visible) .csArtFiltreCount,
.csArtFiltreBtn[aria-pressed="true"] .csArtFiltreCount {
  color: var(--cs-neon);
}

/* Annonce du nombre de résultats : visuellement masquée. */
.csArtAnnonce {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* ===================== Grille ===================== */
.csArtGrille {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .csArtGrille { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .csArtGrille { grid-template-columns: repeat(3, 1fr); }
}

/* Etat vide. */
.csArtVide {
  grid-column: 1 / -1;
  padding: 48px 24px;
  text-align: center;
  color: var(--cs-texte-3);
}

/* ===================== Mouvement réduit ===================== */
@media (prefers-reduced-motion: reduce) {
  .csArtImg img,
  .csArtFiltreBtn,
  .csArtFiltreCount { transition: none; }
}
`;

/** Feuille partagée de la famille Articles. Rendue par chaque composant, placée une seule fois. */
export function StylesArticles() {
  return (
    <style href="console-articles" precedence="ds">
      {STYLES_ARTICLES}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export function CarteArticle({
  article,
  prioritaire = false,
}: {
  article: ResumeArticle;
  prioritaire?: boolean;
}) {
  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="csPanneau csCoupe csTracable csArtCarte"
    >
      <StylesConsole />
      <StylesArticles />
      {/* Structure panneau de verre */}
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <Trace />

      {/* Image décorative (RGAA critère 1.2 : alt vide, le titre transmet l'information) */}
      <div className="csArtImg">
        <Image
          src={article.image}
          alt=""
          fill
          priority={prioritaire}
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {/* Corps */}
      <div className="csArtCorps">
        <p className="csArtTheme">{article.category}</p>
        <h3 className="type-h3 csArtTitre">{article.title}</h3>
        <p className="type-body csArtResume">{article.excerpt}</p>
        <time dateTime={article.dateISO} className="type-caption csArtDate">
          {article.date}
        </time>
      </div>
    </Link>
  );
}
