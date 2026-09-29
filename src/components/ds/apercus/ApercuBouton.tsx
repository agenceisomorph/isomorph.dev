/**
 * Aperçu vivant — Bouton.
 * Présente les trois variantes : principal, secondaire, tertiaire.
 * Server Component : aucun état interne.
 */

interface Props { fr: boolean; }

export default function ApercuBouton({ fr }: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Principal */}
      <button
        type="button"
        className="type-caption bg-noir text-blanc px-5 py-3 flex items-center gap-2 hover:bg-noir/80 focus-visible:bg-noir/80 transition-colors duration-150"
      >
        {fr ? "Action principale" : "Primary action"}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
          <path d="M3 8H12.5M8.5 4L12.5 8L8.5 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </button>

      {/* Secondaire */}
      <button
        type="button"
        className="type-caption border border-noir text-noir px-5 py-3 flex items-center gap-2 hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
      >
        {fr ? "Action secondaire" : "Secondary action"}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
          <path d="M3 8H12.5M8.5 4L12.5 8L8.5 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </button>

      {/* Tertiaire */}
      <button
        type="button"
        className="type-caption text-gris flex items-center gap-2 hover:text-noir focus-visible:text-noir transition-colors duration-150"
      >
        {fr ? "Action tertiaire" : "Tertiary action"}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0">
          <path d="M3 8H12.5M8.5 4L12.5 8L8.5 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </button>

      {/* Désactivé */}
      <button
        type="button"
        disabled
        className="type-caption bg-noir text-blanc px-5 py-3 flex items-center gap-2 opacity-40 cursor-not-allowed"
        aria-disabled="true"
      >
        {fr ? "Désactivé" : "Disabled"}
      </button>
    </div>
  );
}
