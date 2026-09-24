/**
 * Composant « Globe » du système Console : globe terrestre en semis de points,
 * repère de Toulon relié à un repère hors du globe, habillage d'instrument.
 *
 * Server Component : l'habillage (filets, graduations, libellés, étiquette)
 * est rendu côté serveur, sans JavaScript. Seule la scène WebGL est un îlot
 * client (`GlobeScene`), qui charge three.js à l'approche du bloc.
 *
 * Illustration pure : `aria-hidden`, aucun élément focalisable. Le cadre a un
 * rapport fixe, la scène qui arrive ensuite ne décale rien.
 */

import type { CSSProperties } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { ORANGE_REPERE, TOULON } from "./constantes";
import { degresMinutesSecondes } from "./geometrie";
import { GlobeScene } from "./GlobeScene";

/** Graduations : trait long tous les 48 px, court tous les 8 px. */
const GRADUATIONS: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(125,211,252,0.5) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(125,211,252,0.24) 0 1px, transparent 1px 8px)",
  backgroundSize: "100% 7px, 100% 4px",
  backgroundRepeat: "no-repeat",
};

/** Étiquette orange : bord, verre et teinte de la référence. */
const STYLE_ETIQUETTE = {
  "--cs-bord": "rgba(255, 91, 46, 0.75)",
  "--cs-surface": "rgba(48, 14, 6, 0.55)",
  "--cs-surface-2": "rgba(4, 8, 14, 0.86)",
} as CSSProperties;

const LIBELLE = "type-caption uppercase tracking-[0.22em]";

/** Double filet sur toute la largeur, libellés et rangée de graduations. */
function Filets({ bas = false, gauche, droite }: { bas?: boolean; gauche: string; droite: string }) {
  const libelles = (
    <div className={`flex justify-between gap-4 px-4 md:px-6 ${LIBELLE} text-(--cs-neon)/70`}>
      <span>{gauche}</span>
      <span>{droite}</span>
    </div>
  );
  const traits = (
    <div className="my-2">
      <span className="block h-px bg-(--cs-neon)/45" />
      <span className="mt-[3px] block h-px bg-(--cs-neon)/20" />
    </div>
  );
  const graduations = (
    <span
      className="mx-auto block h-[7px] w-1/2"
      style={{ ...GRADUATIONS, backgroundPosition: bas ? "0 100%, 0 100%" : "0 0, 0 0" }}
    />
  );

  return (
    <div className={`pointer-events-none absolute inset-x-0 ${bas ? "bottom-3 md:bottom-4" : "top-3 md:top-4"}`}>
      {bas ? graduations : libelles}
      {traits}
      {bas ? libelles : graduations}
    </div>
  );
}

export function Globe({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`csGrille relative isolate aspect-[4/5] overflow-hidden bg-(--cs-fond) select-none sm:aspect-[3/2] ${className}`}
    >
      <StylesConsole />
      <GlobeScene className="absolute inset-0" />

      <Filets gauche="GL-01" droite="Liaison" />
      <Filets bas gauche="Implantation" droite="Transmission" />

      <div className="pointer-events-none absolute bottom-[4.75rem] left-4 md:bottom-20 md:left-6">
        <Panneau coupe="s" style={STYLE_ETIQUETTE}>
          <div className="px-3.5 py-2.5">
            <p className={LIBELLE}>
              <span style={{ color: ORANGE_REPERE }}>{TOULON.code}</span>
              <span className="ml-3 text-white">{TOULON.nom}</span>
            </p>
            <dl className="type-caption mt-1.5 grid grid-cols-[auto_auto] gap-x-4 tabular-nums">
              <dt className="uppercase tracking-[0.22em] text-(--cs-texte-3)">Lat</dt>
              <dd className="text-white">{degresMinutesSecondes(TOULON.lat, "N", "S")}</dd>
              <dt className="uppercase tracking-[0.22em] text-(--cs-texte-3)">Lon</dt>
              <dd className="text-white">{degresMinutesSecondes(TOULON.lon, "E", "O")}</dd>
            </dl>
          </div>
        </Panneau>
      </div>
    </div>
  );
}
