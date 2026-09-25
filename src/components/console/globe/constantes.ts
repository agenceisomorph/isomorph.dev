/**
 * Globe Console : constantes partagées par l'habillage (serveur) et le
 * moteur three.js (navigateur). Aucune dépendance : importable partout.
 */

/**
 * Repère principal : Toulon, implantation d'ISOMORPH (CLAUDE.md du dépôt
 * isomorph : écrire « implantation », jamais « siège », le siège social étant
 * à Paris).
 * Source : Wikipédia FR, article Toulon, coordonnées de la commune
 * (43° 07′ 20″ N, 5° 55′ 48″ E).
 */
export const TOULON = {
  lat: 43.1222,
  lon: 5.93,
  nom: "Toulon",
  /** Code d'interface décoratif, ni mesure ni statistique. */
  code: "TLN-01",
} as const;

/** Néon du système (`--cs-neon`). */
export const NEON = "#7dd3fc";
/** Néon vif, teinte des lueurs (`--cs-neon-vif`, rgba(56,189,248,…)). */
export const NEON_VIF = "#38bdf8";
/** Rouge orangé de la référence : repère, courbes, étiquette. */
export const ORANGE_REPERE = "#ff5b2e";
/** Corps du globe, un cran au-dessus du fond `--cs-fond` (#02060d). */
export const CORPS_GLOBE = "#04101f";

/** Tour complet du globe, en secondes : lent, lisible. */
export const PERIODE_ROTATION = 220;
/** Cycle d'une transmission le long de la courbe, en secondes. */
export const PERIODE_TRANSMISSION = 3.6;
/** Part du cycle où le trait lumineux parcourt la courbe, en secondes. */
export const DUREE_TRAJET = 2.4;
