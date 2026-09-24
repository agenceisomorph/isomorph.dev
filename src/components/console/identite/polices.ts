/**
 * Polices candidates de l'identité Console, chargées pour l'atelier seulement
 * (jamais dans un layout : rien ne part sur le site public).
 *
 * Référence : les relevés du film Oblivion. Libellés fins en capitales,
 * grands chiffres très fins, formes larges, courbes presque carrées,
 * terminaisons droites.
 *
 * Graisses : 300 pour les titres (échelle `type-*`, globals.css, décision
 * du 21 septembre) et les grands chiffres du relevé, 400 pour le texte,
 * 600 pour les libellés appuyés. Une police variable se charge
 * en un seul fichier qui couvre toutes ses graisses ; les autres reçoivent
 * la liste exacte.
 *
 * Accents : le jeu « latin » de Google Fonts couvre é è ê à ç et œ
 * (U+0152 à U+0153). La présence réelle des glyphes a été contrôlée dans le
 * navigateur le 23 septembre 2026.
 *
 * `preload: false` : rien n'est téléchargé tant qu'aucun texte ne s'affiche
 * dans la police. Saira fait exception : elle porte le texte de l'atelier.
 */

import { Chakra_Petch, Jura, Oxanium, Saira, Tomorrow } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--police-oxanium",
  fallback: ["system-ui", "sans-serif"],
});

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--police-chakra-petch",
  fallback: ["system-ui", "sans-serif"],
});

const tomorrow = Tomorrow({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--police-tomorrow",
  fallback: ["system-ui", "sans-serif"],
});

/* Seule police préchargée : elle porte tout le texte de l'atelier. */
const saira = Saira({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--police-saira",
  fallback: ["system-ui", "sans-serif"],
});

const jura = Jura({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--police-jura",
  fallback: ["system-ui", "sans-serif"],
});

/** Police du texte de l'atelier : Saira, retenue par Florent le 23 septembre 2026. */
export const FAMILLE_TEXTE = saira.style.fontFamily;

export type IdPolice = "oxanium" | "chakra-petch" | "tomorrow" | "saira" | "jura";

export interface PoliceAtelier {
  id: IdPolice;
  nom: string;
  /** Variable CSS définie par la classe `variable`. */
  proprieteCss: `--police-${IdPolice}`;
  /** Classe qui définit la variable CSS : à poser sur la racine de l'atelier. */
  variable: string;
  /** Classe qui applique directement la police : pour les planches. */
  classe: string;
  graisses: string;
  /** Ce qui distingue le dessin, en quelques mots. */
  trait: string;
}

export const POLICES: readonly PoliceAtelier[] = [
  {
    id: "oxanium",
    nom: "Oxanium",
    proprieteCss: "--police-oxanium",
    variable: oxanium.variable,
    classe: oxanium.className,
    graisses: "Variable, 200 à 800",
    trait: "Courbes carrées, angles coupés",
  },
  {
    id: "chakra-petch",
    nom: "Chakra Petch",
    proprieteCss: "--police-chakra-petch",
    variable: chakraPetch.variable,
    classe: chakraPetch.className,
    graisses: "300, 400, 600",
    trait: "Coins coupés, comme les panneaux",
  },
  {
    id: "tomorrow",
    nom: "Tomorrow",
    proprieteCss: "--police-tomorrow",
    variable: tomorrow.variable,
    classe: tomorrow.className,
    graisses: "300, 400, 600",
    trait: "Large, carré aux angles adoucis",
  },
  {
    id: "saira",
    nom: "Saira",
    proprieteCss: "--police-saira",
    variable: saira.variable,
    classe: saira.className,
    graisses: "Variable, 100 à 900",
    trait: "Sobre, courbes tendues",
  },
  {
    id: "jura",
    nom: "Jura",
    proprieteCss: "--police-jura",
    variable: jura.variable,
    classe: jura.className,
    graisses: "Variable, 300 à 700",
    trait: "Fine et technique",
  },
];
