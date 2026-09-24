/**
 * Carte Console : chargement de MapLibre à la demande.
 *
 * La bibliothèque (JS et feuille CSS) n'entre dans la page que lorsque la
 * carte approche de l'écran : `import()` en fait un morceau séparé, absent du
 * premier chargement. Une seule fois par page, quel que soit le nombre de
 * cartes.
 *
 * Fil de calcul (worker) : MapLibre 6 le livre en deux modules,
 * `maplibre-gl-worker.mjs` qui importe `./maplibre-gl-shared.mjs`. Sous
 * webpack, chaque fichier cité par `new URL(..., import.meta.url)` est copié
 * avec une empreinte dans son nom, ce qui casse cet import relatif. Le module
 * du fil est donc relu et son import pointé vers l'adresse réelle du second
 * fichier, puis servi depuis une adresse `blob:` de même origine
 * (guide de migration MapLibre v5 vers v6, « Worker configuration »).
 * CSP à prévoir le jour où le site en aura une : `worker-src 'self' blob:`,
 * `connect-src https://tiles.openfreemap.org`.
 */

import type * as MapLibre from "maplibre-gl";

export type BibliothequeCarte = typeof MapLibre;

/** Import relatif écrit dans le module du fil de MapLibre 6. */
const IMPORT_PARTAGE = '"./maplibre-gl-shared.mjs"';

let chargement: Promise<BibliothequeCarte> | null = null;

/** Adresse absolue d'un fichier copié par webpack (il la rend relative au site). */
function absolue(url: URL): string {
  return new URL(url.href, document.baseURI).href;
}

async function adresseDuFil(): Promise<string> {
  const fil = absolue(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url));
  const partage = absolue(new URL("maplibre-gl/dist/maplibre-gl-shared.mjs", import.meta.url));
  const reponse = await fetch(fil);
  if (!reponse.ok) throw new Error(`Fil de calcul MapLibre introuvable (${reponse.status})`);
  const source = await reponse.text();
  if (!source.includes(IMPORT_PARTAGE)) throw new Error("Fil de calcul MapLibre : import partagé absent");
  const code = source.replaceAll(IMPORT_PARTAGE, JSON.stringify(partage));
  return URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
}

/** Charge MapLibre une seule fois ; un échec permet un nouvel essai. */
export function chargerMapLibre(): Promise<BibliothequeCarte> {
  if (!chargement) {
    chargement = Promise.all([
      import("maplibre-gl"),
      import("maplibre-gl/dist/maplibre-gl.css"),
      adresseDuFil(),
    ]).then(([bibliotheque, , adresse]) => {
      bibliotheque.setWorkerUrl(adresse);
      return bibliotheque;
    });
    chargement.catch(() => {
      chargement = null;
    });
  }
  return chargement;
}
