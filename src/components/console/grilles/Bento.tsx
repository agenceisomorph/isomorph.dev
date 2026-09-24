/**
 * Bento : grille asymétrique de panneaux à tailles différentes.
 *
 * Cinq cases cliquables, tracées au survol :
 *   - 1 grande (2 × 2) : famille "Concevoir et développer"
 *   - 2 moyennes (1 × 1) : "Connecter et étendre" et "Être trouvé"
 *   - 2 petites (1 × 1) : Strapi et Google Ads
 *
 * Contenu : EXPERTISE_FAMILIES (expertiseNav.ts -> familles.ts,
 * plan du site du 11 septembre 2026). Aucune donnée inventée.
 *
 * RGAA 4.1 :
 *   - Critère 6.1 : l'intitulé de chaque lien vient de son titre visible.
 *   - Critère 10.7 : focus clavier = tracé néon, identique au survol.
 * Éco : Server Component, aucun état client.
 */

import Link from "next/link";

import { EXPERTISE_FAMILIES } from "@/components/chrome/expertiseNav";
import { FAMILLES } from "@/components/site/familles";
import { StylesConsole, Trace } from "../fondations";
import { StylesGrilles } from "./StylesGrilles";

/* ------------------------------------------------------------------ */
/* Données (source unique : familles.ts, plan du site 11/09/2026)      */
/* ------------------------------------------------------------------ */

// Famille 1 : Concevoir et développer
const fDev = EXPERTISE_FAMILIES.find((f) => f.key === "developpement")!;
// Famille 2 : Connecter et étendre
const fInt = EXPERTISE_FAMILIES.find((f) => f.key === "integrations")!;
// Famille 3 : Être trouvé
const fVis = EXPERTISE_FAMILIES.find((f) => f.key === "visibilite")!;

// Chapeaux (source : FAMILLES, familles.ts)
const chapeauDev = FAMILLES.developpement.chapeau;
const chapeauInt = FAMILLES.integrations.chapeau;
const chapeauVis = FAMILLES.visibilite.chapeau;

// Trois premiers services de la famille développement, pour la sous-liste
const sousListe = fDev.items.slice(0, 3);

// Cellule 4 : Strapi (sous-groupe "Technologies" de la famille developpement)
const itemStrapi =
  fDev.subGroups?.find((sg) => sg.heading === "Technologies")?.items[0] ??
  fDev.items.find((i) => i.label === "Strapi") ??
  { label: "Strapi", href: "/developpement/strapi", desc: "Le back-office que vos équipes administrent." };

// Cellule 5 : Google Ads (famille visibilite)
const itemGoogleAds =
  fVis.items.find((i) => i.label === "Google Ads") ??
  { label: "Google Ads", href: "/visibilite/google-ads", desc: "Audit et pilotage de vos campagnes, données extraites par l'API Google Ads." };

/* ------------------------------------------------------------------ */
/* Sous-composants                                                      */
/* ------------------------------------------------------------------ */

function FlecheCase({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`csGriBentoFleche h-4 w-4 shrink-0 ${className}`}
    >
      <path
        d="M3 8H12.5M8.5 4L12.5 8L8.5 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Structure interne d'un panneau (identique à Carte, sur le lien lui-même). */
function DecorPanneau() {
  return (
    <>
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <Trace />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

export interface BentoProps {
  className?: string;
}

/**
 * Grille bento des cinq familles et services.
 * Sur téléphone : une colonne, cases empilées.
 */
export function Bento({ className = "" }: BentoProps) {
  return (
    <>
      <StylesConsole />
      <StylesGrilles />
      <div className={`csGriBento ${className}`}>

        {/* ── Case 1 : grande (2 × 2), famille "Concevoir et développer" ── */}
        <div className="csGriBentoGrande">
          <Link
            href={fDev.hub}
            className="csPanneau csCoupe csTracable csGriBentoLien"
            data-coupe="l"
          >
            <DecorPanneau />
            <p aria-hidden="true" className="type-caption csGriBentoIdx">01</p>
            <p className="type-h2 mt-3 text-white">{fDev.heading}</p>
            <p className="type-body mt-2 text-(--cs-texte-2) max-w-[28ch]">
              {/* Source : familles.ts, FAMILLES.developpement.chapeau */}
              {chapeauDev}
            </p>
            <ul aria-hidden="true" className="csGriBentoSubliste">
              {sousListe.map((item) => (
                <li key={item.href} className="csGriBentoSousItem">
                  {item.label}
                </li>
              ))}
            </ul>
            <FlecheCase />
          </Link>
        </div>

        {/* ── Case 2 : famille "Connecter et étendre" ── */}
        <Link
          href={fInt.hub}
          className="csPanneau csCoupe csTracable csGriBentoLien"
          data-coupe="m"
        >
          <DecorPanneau />
          <p aria-hidden="true" className="type-caption csGriBentoIdx">02</p>
          <p className="type-h3 mt-3 text-white">{fInt.heading}</p>
          <p className="type-caption mt-1 text-(--cs-texte-2) line-clamp-2">
            {/* Source : familles.ts, FAMILLES.integrations.chapeau */}
            {chapeauInt}
          </p>
          <FlecheCase />
        </Link>

        {/* ── Case 3 : famille "Être trouvé" ── */}
        <Link
          href={fVis.hub}
          className="csPanneau csCoupe csTracable csGriBentoLien"
          data-coupe="m"
        >
          <DecorPanneau />
          <p aria-hidden="true" className="type-caption csGriBentoIdx">03</p>
          <p className="type-h3 mt-3 text-white">{fVis.heading}</p>
          <p className="type-caption mt-1 text-(--cs-texte-2) line-clamp-2">
            {/* Source : familles.ts, FAMILLES.visibilite.chapeau */}
            {chapeauVis}
          </p>
          <FlecheCase />
        </Link>

        {/* ── Case 4 : Strapi (Technologies, famille developpement) ── */}
        <Link
          href={itemStrapi.href}
          className="csPanneau csCoupe csTracable csGriBentoLien"
          data-coupe="s"
        >
          <DecorPanneau />
          <p aria-hidden="true" className="type-caption csGriBentoIdx">04</p>
          <p className="type-h3 mt-3 text-white">{itemStrapi.label}</p>
          {itemStrapi.desc ? (
            <p className="type-caption mt-1 text-(--cs-texte-2) line-clamp-2">
              {itemStrapi.desc}
            </p>
          ) : null}
          <FlecheCase />
        </Link>

        {/* ── Case 5 : Google Ads (famille visibilite) ── */}
        <Link
          href={itemGoogleAds.href}
          className="csPanneau csCoupe csTracable csGriBentoLien"
          data-coupe="s"
        >
          <DecorPanneau />
          <p aria-hidden="true" className="type-caption csGriBentoIdx">05</p>
          <p className="type-h3 mt-3 text-white">{itemGoogleAds.label}</p>
          {itemGoogleAds.desc ? (
            <p className="type-caption mt-1 text-(--cs-texte-2) line-clamp-2">
              {itemGoogleAds.desc}
            </p>
          ) : null}
          <FlecheCase />
        </Link>

      </div>
    </>
  );
}
