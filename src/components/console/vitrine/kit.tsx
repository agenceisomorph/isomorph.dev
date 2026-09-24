/**
 * Outils de la vitrine du système Console (`/atelier/console`) : une section
 * par famille, des planches pour poser les exemples. Rien ici ne sert au site.
 */

import type { ReactNode } from "react";

import { EnTeteSection } from "../fondations";

/** Une famille de composants. Les fonds alternent d'une section à l'autre. */
export function SectionVitrine({
  id,
  index,
  surtitre,
  titre,
  chapeau,
  alterne,
  children,
}: {
  id: string;
  index: number;
  surtitre: string;
  titre: string;
  chapeau?: string;
  alterne?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titre`}
      className={`relative scroll-mt-24 ${alterne ? "bg-(--cs-fond-2)" : "bg-(--cs-fond)"}`}
    >
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-12 md:py-24">
        <div id={`${id}-titre`}>
          <EnTeteSection index={index} surtitre={surtitre} titre={titre} chapeau={chapeau} />
        </div>
        <div className="mt-12 space-y-12">{children}</div>
      </div>
    </section>
  );
}

/** Une planche : le nom d'un composant et son rendu. */
export function Planche({ nom, note, children, className = "" }: { nom: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/[0.08] pb-3">
        <h3 className="type-h3 text-white">{nom}</h3>
        {note ? <p className="type-caption text-(--cs-texte-3)">{note}</p> : null}
      </div>
      <div className={`mt-6 ${className}`}>{children}</div>
    </div>
  );
}
