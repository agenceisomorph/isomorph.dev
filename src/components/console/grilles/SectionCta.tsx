/**
 * SectionCta : appel à l'action de fin de section, style Console.
 *
 * Titre, une phrase, deux boutons (principal → /contact, secondaire).
 * Décor d'orbite SVG derrière le texte, repris du hero (HeroConsole.tsx).
 * L'orbite est purement décorative (aria-hidden) et ne porte aucune
 * information. Elle est neutralisée en mouvement réduit par CSS.
 *
 * Textes sourcés :
 *   - titre   : familles.ts, FAMILLES.developpement.appelFinal.titre
 *   - phrase  : familles.ts, FAMILLES.developpement.appelFinal.texte
 *   - bouton  : "Démarrer un projet" repris de HeroConsole.tsx
 *
 * RGAA 4.1 :
 *   - Critère 6.1 : les boutons ont des intitulés explicites.
 *   - Critère 10.7 : focus clavier géré par les fondations via csBouton.
 * Éco : Server Component. L'orbite SVG est inline (aucune requête réseau).
 */

import { Bouton } from "../Bouton";
import { StylesConsole } from "../fondations";
import { StylesGrilles } from "./StylesGrilles";

/* ------------------------------------------------------------------ */
/* Décor : orbite simplifiée (reprise de HeroConsole)                  */
/* ------------------------------------------------------------------ */

/**
 * Deux orbites et un satellite, 400 × 300 px SVG.
 * Le groupe satellite contient un cercle invisible pour caler le bounding
 * box sur le centre de l'orbite (200, 150) ; la rotation tourne alors
 * autour du centre géométrique de l'orbite, comme dans HeroConsole.tsx.
 */
function OrbiteCta() {
  return (
    <div aria-hidden="true" className="csGriCtaDecorWrap">
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full max-w-[520px] opacity-60"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Cercles statiques */}
        <circle cx="200" cy="150" r="130" fill="none" stroke="rgba(125,211,252,0.14)" />
        <circle cx="200" cy="150" r="80" fill="none" stroke="rgba(125,211,252,0.08)" />

        {/* Orbite en tirets, rotation lente */}
        <g className="csGriCtaOrbite">
          <circle
            cx="200"
            cy="150"
            r="110"
            fill="none"
            stroke="rgba(125,211,252,0.22)"
            strokeDasharray="2 10"
          />
        </g>

        {/* Groupe satellite : invisible + point, tourne autour de (200, 150) */}
        <g className="csGriCtaOrbite" data-sens="inverse">
          {/* Cercle fantôme pour cadrer le bounding box sur (200, 150), r=110 */}
          <circle cx="200" cy="150" r="110" fill="none" stroke="none" />
          {/* Point satellite à (200, 40) = centre_y − r = 150 − 110 */}
          <circle cx="200" cy="40" r="3" fill="#7dd3fc" className="csGriCtaPoint" />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface SectionCtaProps {
  /**
   * Titre principal.
   * Source par défaut : familles.ts, FAMILLES.developpement.appelFinal.titre
   */
  titre?: string;
  /**
   * Phrase d'accroche.
   * Source par défaut : familles.ts, FAMILLES.developpement.appelFinal.texte
   */
  phrase?: string;
  /** Libellé du CTA principal. Destination toujours /contact. */
  ctaPrimaire?: string;
  /** CTA secondaire optionnel ; `null` le retire. */
  ctaSecondaire?: { label: string; href: string } | null;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Composant                                                            */
/* ------------------------------------------------------------------ */

export function SectionCta({
  // Source : familles.ts, FAMILLES.developpement.appelFinal
  titre = "Décrivez votre projet, nous répondons par un cadrage écrit",
  phrase = "Le cadrage précède le chiffrage, et il vous appartient.",
  // Source : HeroConsole.tsx, bouton principal
  ctaPrimaire = "Démarrer un projet",
  // Source : familles.ts, FAMILLES.developpement.hub
  ctaSecondaire = { label: "Voir nos prestations", href: "/developpement" },
  className = "",
}: SectionCtaProps) {
  return (
    <>
      <StylesConsole />
      <StylesGrilles />
      <div className={`csGriCta csGrille ${className}`}>

        {/* Décor d'orbite, derrière le contenu */}
        <OrbiteCta />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col items-center gap-5 max-w-[640px]" data-app="texte">
          <h2 className="type-h2 text-white text-balance text-center">{titre}</h2>
          <p className="type-lead text-(--cs-texte-2) text-center">{phrase}</p>

          <div className="csGriCtaBoutons">
            <Bouton href="/contact" taille="l" variante="principal">
              {ctaPrimaire}
            </Bouton>
            {ctaSecondaire ? (
              <Bouton href={ctaSecondaire.href} taille="l" variante="secondaire">
                {ctaSecondaire.label}
              </Bouton>
            ) : null}
          </div>
        </div>

      </div>
    </>
  );
}
