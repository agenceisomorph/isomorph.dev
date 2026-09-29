/**
 * Aperçu vivant — Carte.
 * Carte cliquable et carte statique.
 */

import Link from "next/link";

interface Props { fr: boolean; }

export default function ApercuCarte({ fr }: Props) {
  return (
    <div className="flex flex-wrap gap-4 w-full">
      {/* Carte cliquable */}
      <Link
        href="/fr/design-system"
        className="group block w-64 p-6 bg-blanc border border-[var(--trait)] hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
        aria-label={fr ? "Design system, voir la page" : "Design system, view page"}
      >
        <h3 className="type-h3 text-noir mb-2">Design system</h3>
        <p className="type-body text-gris mb-3">
          {fr ? "Fondations et composants réutilisables." : "Foundations and reusable components."}
        </p>
        <span className="type-caption text-noir group-hover:underline">
          {fr ? "Voir" : "View"}
        </span>
      </Link>

      {/* Carte statique */}
      <div className="w-64 p-6 bg-blanc border border-[var(--trait)]">
        <h3 className="type-h3 text-noir mb-2">{fr ? "Carte statique" : "Static card"}</h3>
        <p className="type-body text-gris">
          {fr ? "Non cliquable, pas de hover." : "Not clickable, no hover."}
        </p>
      </div>
    </div>
  );
}
