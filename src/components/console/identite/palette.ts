/**
 * Palette proposée pour l'identité Console, inspirée des relevés du film
 * Oblivion : noir bleuté, bleu pâle, blanc cassé, jaune pâle, et une pointe
 * d'orange rouge réservée à l'alerte. Proposition seulement : aucun composant
 * ne la lit, les jetons `--cs-*` restent la référence.
 *
 * Les contrastes sont calculés au rendu selon la formule WCAG 2.1
 * (luminance relative, sRGB), jamais recopiés à la main.
 */

export interface TeintePalette {
  nom: string;
  role: string;
  hex: `#${string}`;
}

export const FOND_PALETTE = "#050a12";

export const PALETTE: readonly TeintePalette[] = [
  { nom: "Nuit", role: "Fond", hex: FOND_PALETTE },
  { nom: "Glace", role: "Libellés et repères", hex: "#a8dcf0" },
  { nom: "Craie", role: "Texte et grands chiffres", hex: "#ece8dd" },
  { nom: "Paille", role: "Valeur mise en avant", hex: "#f0e2a0" },
  { nom: "Alerte", role: "Alerte", hex: "#ff5b3a" },
  { nom: "Filet", role: "Filets et bords", hex: "#4a6782" },
];

/** Teinte de la palette par son nom, pour l'échantillon. */
export function teinte(nom: string): string {
  return PALETTE.find((t) => t.nom === nom)?.hex ?? FOND_PALETTE;
}

function canalLineaire(octet: number): number {
  const c = octet / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG 2.1 d'une couleur `#rrggbb`. */
export function luminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * canalLineaire((n >> 16) & 255) + 0.7152 * canalLineaire((n >> 8) & 255) + 0.0722 * canalLineaire(n & 255);
}

/** Rapport de contraste WCAG 2.1 entre deux couleurs `#rrggbb`. */
export function contraste(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * « 13,3:1 ». Tronqué au dixième, jamais arrondi au-dessus : 4,49 ne doit pas
 * s'afficher 4,5.
 */
export function formaterRapport(rapport: number): string {
  return `${(Math.floor(rapport * 10) / 10).toFixed(1).replace(".", ",")}:1`;
}

/** Usage permis par le contraste (texte 4,5:1, traits et grand texte 3:1). */
export function usagePermis(rapport: number): string {
  if (rapport >= 4.5) return "Texte";
  if (rapport >= 3) return "Traits et bords";
  return "Décor seulement";
}
