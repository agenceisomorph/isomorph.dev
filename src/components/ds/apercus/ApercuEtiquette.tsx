/**
 * Aperçu vivant — Étiquette.
 * Variantes : par défaut et forte.
 */

interface Props { fr: boolean; }

export default function ApercuEtiquette({ fr }: Props) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <span className="type-caption bg-gris-clair text-gris px-2 py-0.5">
        {fr ? "Stable" : "Stable"}
      </span>
      <span className="type-caption bg-gris-clair text-gris px-2 py-0.5">
        {fr ? "Pilote" : "Pilot"}
      </span>
      <span className="type-caption bg-gris-clair text-gris px-2 py-0.5">
        MIT
      </span>
      <span className="type-caption bg-noir text-blanc px-2 py-0.5">
        {fr ? "Nouveau" : "New"}
      </span>
      <span className="type-caption bg-noir text-blanc px-2 py-0.5">
        v5
      </span>
    </div>
  );
}
