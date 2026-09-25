/**
 * Carte de la galerie Expérimentations.
 *
 * Aperçu visuel statique (pas de canvas 3D par carte) : fond de motif
 * CSS + décor SVG propre à chaque groupe, poids nul.
 *
 * RGAA 4.1 :
 *   - Critère 6.1 : intitulé de lien significatif (`aria-label` si besoin).
 *   - Critère 10.3 : focus visible sur le bord du composant (jamais outline).
 *   - Critère 13.9 : lien vers la démonstration jouable indiqué visuellement.
 *
 * Éco : aucune bibliothèque 3D, aucun import dynamique.
 */

import Link from "next/link";

import type { Experimentation, Groupe } from "@/lib/experimentations";

/* ------------------------------------------------------------------ */
/* Motifs SVG par groupe (poids < 200 octets chacun)                  */
/* ------------------------------------------------------------------ */
function AperçuHero() {
  return (
    <svg
      viewBox="0 0 160 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Grille de points */}
      <pattern id="grille-h" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="0.8" fill="#7dd3fc" opacity="0.25" />
      </pattern>
      <rect width="160" height="90" fill="url(#grille-h)" />
      {/* Réticule central */}
      <circle cx="80" cy="45" r="20" fill="none" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.6" />
      <circle cx="80" cy="45" r="8" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.5" />
      <line x1="60" y1="45" x2="100" y2="45" stroke="#7dd3fc" strokeWidth="0.4" opacity="0.4" />
      <line x1="80" y1="25" x2="80" y2="65" stroke="#7dd3fc" strokeWidth="0.4" opacity="0.4" />
      {/* Lueur centrale */}
      <circle cx="80" cy="45" r="3" fill="#7dd3fc" opacity="0.7" />
    </svg>
  );
}

function AperçuInstrument() {
  return (
    <svg
      viewBox="0 0 160 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Fond de grille */}
      <rect width="160" height="90" fill="none" />
      {/* Radar simplifié */}
      <circle cx="80" cy="45" r="36" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.35" />
      <circle cx="80" cy="45" r="24" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.3" />
      <circle cx="80" cy="45" r="12" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.3" />
      <line x1="44" y1="45" x2="116" y2="45" stroke="#7dd3fc" strokeWidth="0.4" opacity="0.3" />
      <line x1="80" y1="9" x2="80" y2="81" stroke="#7dd3fc" strokeWidth="0.4" opacity="0.3" />
      {/* Balayage */}
      <path d="M 80 45 L 80 9 A 36 36 0 0 1 116 45 Z" fill="#7dd3fc" opacity="0.08" />
      <line x1="80" y1="45" x2="116" y2="45" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.6" />
      {/* Points de contact */}
      <circle cx="104" cy="20" r="1.5" fill="#7dd3fc" opacity="0.7" />
      <circle cx="68" cy="38" r="1" fill="#7dd3fc" opacity="0.5" />
    </svg>
  );
}

function AperçuTerrain() {
  return (
    <svg
      viewBox="0 0 160 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Courbes de niveau */}
      <path d="M 10 80 Q 40 55 80 50 Q 120 45 150 60" fill="none" stroke="#7dd3fc" strokeWidth="0.6" opacity="0.5" />
      <path d="M 15 70 Q 45 45 80 40 Q 115 35 145 50" fill="none" stroke="#7dd3fc" strokeWidth="0.6" opacity="0.4" />
      <path d="M 20 60 Q 50 35 80 28 Q 110 22 140 38" fill="none" stroke="#7dd3fc" strokeWidth="0.6" opacity="0.3" />
      <path d="M 30 50 Q 55 25 80 18 Q 105 12 134 28" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.22" />
      <path d="M 45 40 Q 62 16 80 10 Q 98 4 118 18" fill="none" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.15" />
    </svg>
  );
}

function Apercu({ groupe }: { groupe: Groupe }) {
  if (groupe === "hero") return <AperçuHero />;
  if (groupe === "instrument") return <AperçuInstrument />;
  return <AperçuTerrain />;
}

/* ------------------------------------------------------------------ */
/* Badge technologie                                                   */
/* ------------------------------------------------------------------ */
function Badge({ texte }: { texte: string }) {
  const court = texte.split("·")[0].trim();
  return (
    <span
      className="inline-block px-2 py-0.5 text-[11px] tracking-wider uppercase rounded border border-(--cs-neon)/30 text-(--cs-neon)/70"
      style={{ fontFamily: "ui-monospace, monospace" }}
    >
      {court}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export interface CarteExperimentationProps {
  experimentation: Experimentation;
  locale: string;
}

export function CarteExperimentation({ experimentation, locale }: CarteExperimentationProps) {
  const { slug, titre, resume, techno } = experimentation;
  const href = `/${locale}/experimentations/${slug}`;

  return (
    <Link
      href={href}
      aria-label={titre}
      className={[
        /* Conteneur verre Console */
        "group block rounded-[16px] overflow-hidden",
        "border border-(--cs-neon)/20",
        "bg-(--cs-surface) hover:bg-(--cs-surface-2)",
        "transition-colors duration-200",
        /* Focus visible : bord qui s'allume */
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--cs-neon)",
      ].join(" ")}
    >
      {/* Aperçu visuel — 160 × 90 px en rendu CSS */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: "var(--cs-fond-2)", aspectRatio: "16/9" }}
        aria-hidden="true"
      >
        <Apercu groupe={experimentation.groupe} />
        {/* Ligne néon en bas */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-(--cs-neon)/20" />
      </div>

      {/* Contenu textuel */}
      <div className="p-4 space-y-2">
        <h3 className="type-h3 font-semibold text-(--cs-texte) group-hover:text-(--cs-neon) transition-colors duration-150">
          {titre}
        </h3>
        <p className="type-body text-(--cs-texte-2) line-clamp-2">{resume}</p>
        <Badge texte={techno} />
      </div>
    </Link>
  );
}
