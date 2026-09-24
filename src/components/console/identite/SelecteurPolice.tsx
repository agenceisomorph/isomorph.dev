/**
 * Choix de la police des titres en direct, pour une page d'atelier Console.
 * À monter une fois dans l'élément `[data-atelier-console]` : il apporte sa
 * feuille (texte en Saira, police des titres, curseurs) et les polices
 * candidates.
 */

import { ModulePolice } from "./ModulePolice";
import type { OptionPolice } from "./ModulePolice";
import { POLICES } from "./polices";
import { StylesIdentite } from "./StylesIdentite";

/* Saira en tête : c'est la police du texte, et le choix par défaut. */
const OPTIONS: readonly OptionPolice[] = [
  ...[...POLICES]
    .sort((a, b) => Number(b.id === "saira") - Number(a.id === "saira"))
    .map((p) => ({ id: p.id, nom: p.nom, variable: p.variable, classe: p.classe })),
  { id: "actuelle", nom: "Actuelle", variable: "", classe: "" },
];

export function SelecteurPolice() {
  return (
    <>
      <StylesIdentite />
      <ModulePolice options={OPTIONS} />
    </>
  );
}
