/**
 * Données du design system ISOMORPH.
 *
 * Source de vérité pour les jetons, composants documentés et leurs variantes.
 * Aucune donnée inventée : tout ce qui est ici est réel et présent dans le dépôt.
 */

/* ------------------------------------------------------------------ */
/* Jetons de couleur                                                   */
/* ------------------------------------------------------------------ */

export interface JetonCouleur {
  nom: string;
  variable: string;
  valeur: string;
  usage: string;
}

export const COULEURS: JetonCouleur[] = [
  { nom: "Noir", variable: "--noir", valeur: "#000000", usage: "Texte principal, fonds forts" },
  { nom: "Blanc", variable: "--blanc", valeur: "#ffffff", usage: "Fond de page, texte sur fond noir" },
  { nom: "Gris", variable: "--gris", valeur: "#6b6b6b", usage: "Texte secondaire, libellés discrets" },
  { nom: "Gris clair", variable: "--gris-clair", valeur: "#f5f5f5", usage: "Sections alternées, survol de carte" },
  { nom: "Trait", variable: "--trait", valeur: "rgba(0,0,0,0.10)", usage: "Séparateurs, bordures légères" },
];

/* ------------------------------------------------------------------ */
/* Échelle typographique                                               */
/* ------------------------------------------------------------------ */

export interface EchelleTypo {
  classe: string;
  taille: string;
  usage: string;
}

export const ECHELLE_TYPO: EchelleTypo[] = [
  { classe: "type-display", taille: "36–48 px", usage: "Titre de page d'accueil, une seule fois" },
  { classe: "type-h1", taille: "28–36 px", usage: "Titre de page" },
  { classe: "type-h2", taille: "22–26 px", usage: "Titre de section" },
  { classe: "type-h3", taille: "18 px", usage: "Sous-section, titre de carte" },
  { classe: "type-lead", taille: "17 px", usage: "Chapeau, introduction de section" },
  { classe: "type-body", taille: "16 px", usage: "Texte courant" },
  { classe: "type-caption", taille: "13 px", usage: "Mention, étiquette, horodatage" },
];

/* ------------------------------------------------------------------ */
/* Espacement                                                          */
/* ------------------------------------------------------------------ */

export interface EchelleEspace {
  valeur: string;
  px: string;
  usage: string;
}

export const ESPACEMENT: EchelleEspace[] = [
  { valeur: "1", px: "4 px", usage: "Espace interne minimal (icône + libellé)" },
  { valeur: "2", px: "8 px", usage: "Espace interne compact" },
  { valeur: "3", px: "12 px", usage: "Padding d'étiquette" },
  { valeur: "4", px: "16 px", usage: "Padding de carte, gouttière mobile" },
  { valeur: "6", px: "24 px", usage: "Padding de section mobile" },
  { valeur: "8", px: "32 px", usage: "Espacement entre sections" },
  { valeur: "12", px: "48 px", usage: "Padding de section tablet" },
  { valeur: "16", px: "64 px", usage: "Padding de section desktop" },
  { valeur: "24", px: "96 px", usage: "Espacement hero" },
  { valeur: "32", px: "128 px", usage: "Espacement hero desktop" },
];

/* ------------------------------------------------------------------ */
/* Composants documentés                                               */
/* ------------------------------------------------------------------ */

export interface Variante {
  /** Identifiant court */
  id: string;
  /** Libellé affiché */
  libelle: string;
  /** Description courte de la variante */
  description: string;
  /** Classe(s) ou prop principale */
  classeOuProp: string;
}

export interface EtatComposant {
  id: string;
  libelle: string;
  description: string;
}

export interface PropComposant {
  nom: string;
  type: string;
  defaut?: string;
  requis: boolean;
  description: string;
}

export interface ComposantDS {
  slug: string;
  nom: string;
  description: string;
  variantes: Variante[];
  etats: EtatComposant[];
  props: PropComposant[];
  /** Règles RGAA applicables */
  rgaa: string[];
  /** Exemple de code à copier */
  codeExemple: string;
}

export const COMPOSANTS: ComposantDS[] = [
  {
    slug: "bouton",
    nom: "Bouton",
    description: "Déclencheur d'action principal. Rendu en <button> sans href, en <a> avec href.",
    variantes: [
      { id: "principal", libelle: "Principal", description: "CTA fort, fond noir.", classeOuProp: 'variante="principal"' },
      { id: "secondaire", libelle: "Secondaire", description: "Action voisine, bord noir.", classeOuProp: 'variante="secondaire"' },
      { id: "tertiaire", libelle: "Tertiaire", description: "Action de lecture, sans cadre.", classeOuProp: 'variante="tertiaire"' },
    ],
    etats: [
      { id: "repos", libelle: "Repos", description: "État par défaut." },
      { id: "survol", libelle: "Survol", description: "Fond légèrement atténué." },
      { id: "focus", libelle: "Focus clavier", description: "Fond noir sur la variante principale, bord visible sur les autres." },
      { id: "desactive", libelle: "Désactivé", description: "Opacité 40 %, pointer-events none." },
      { id: "chargement", libelle: "Chargement", description: "Roue à la place de la flèche, bouton inactif." },
    ],
    props: [
      { nom: "variante", type: '"principal" | "secondaire" | "tertiaire"', defaut: '"principal"', requis: false, description: "Apparence du bouton." },
      { nom: "href", type: "string", requis: false, description: "Si fourni, le bouton est rendu comme un lien <a>." },
      { nom: "desactive", type: "boolean", defaut: "false", requis: false, description: "Désactive le bouton sans le masquer." },
      { nom: "chargement", type: "boolean", defaut: "false", requis: false, description: "Affiche une roue et désactive l'interaction." },
      { nom: "taille", type: '"m" | "l"', defaut: '"m"', requis: false, description: "Taille du bouton." },
      { nom: "fleche", type: "boolean", defaut: "true", requis: false, description: "Flèche à droite du libellé." },
      { nom: "externe", type: "boolean", requis: false, description: "Ajoute target=_blank et rel=noopener (avec href)." },
    ],
    rgaa: [
      "RGAA 11.9 : l'intitulé du bouton est explicite.",
      "RGAA 12.8 : le focus est visible sur chaque variante.",
      "RGAA 10.3 : le bouton désactivé garde un contraste ≥ 3:1.",
    ],
    codeExemple: `import { Bouton } from "@/components/console/Bouton";

// Lien principal
<Bouton href="/fr/plugins" variante="principal">
  Voir les plugins
</Bouton>

// Bouton d'action avec chargement
<Bouton
  type="submit"
  variante="secondaire"
  chargement={enCours}
>
  Envoyer
</Bouton>`,
  },
  {
    slug: "lien",
    nom: "Lien",
    description: "Lien de navigation inline. Soulignement au survol et au focus, jamais d'outline.",
    variantes: [
      { id: "inline", libelle: "Inline", description: "Dans un paragraphe, souligné au survol.", classeOuProp: "lienInline" },
      { id: "navigation", libelle: "Navigation", description: "Dans la barre ou le pied de page, CAPITALES.", classeOuProp: "type-caption" },
      { id: "externe", libelle: "Externe", description: "Ouvre dans un nouvel onglet, mention sr-only.", classeOuProp: 'target="_blank"' },
    ],
    etats: [
      { id: "repos", libelle: "Repos", description: "Couleur du texte courant." },
      { id: "survol", libelle: "Survol", description: "Soulignement visible." },
      { id: "focus", libelle: "Focus clavier", description: "Soulignement visible, fond gris clair." },
    ],
    props: [
      { nom: "href", type: "string", requis: true, description: "URL de destination." },
      { nom: "target", type: '"_blank"', requis: false, description: "Ouvre dans un nouvel onglet." },
      { nom: "rel", type: "string", defaut: '"noopener noreferrer"', requis: false, description: "Relation avec la cible (obligatoire si target=_blank)." },
    ],
    rgaa: [
      "RGAA 6.1 : l'intitulé du lien est explicite hors contexte.",
      "RGAA 6.2 : les liens externes signalent l'ouverture d'un nouvel onglet.",
      "RGAA 12.8 : le focus est visible.",
    ],
    codeExemple: `import Link from "next/link";

// Lien interne
<Link href="/fr/plugins" className="hover:underline focus-visible:underline">
  Voir les plugins
</Link>

// Lien externe avec mention RGAA
<a
  href="https://github.com/agenceisomorph"
  target="_blank"
  rel="noopener noreferrer"
>
  GitHub
  <span className="sr-only"> (ouvre dans un nouvel onglet)</span>
</a>`,
  },
  {
    slug: "carte",
    nom: "Carte",
    description: "Conteneur d'information cliquable ou statique. Bord noir au survol et au focus.",
    variantes: [
      { id: "standard", libelle: "Standard", description: "Fond blanc, bord gris, hover gris clair.", classeOuProp: "bg-blanc border border-[var(--trait)]" },
      { id: "pleine", libelle: "Pleine largeur", description: "Dans une grille gap-px bg-trait.", classeOuProp: "bg-blanc" },
    ],
    etats: [
      { id: "repos", libelle: "Repos", description: "Fond blanc, bord trait." },
      { id: "survol", libelle: "Survol (cliquable)", description: "Fond gris clair." },
      { id: "focus", libelle: "Focus clavier (cliquable)", description: "Fond gris clair." },
    ],
    props: [
      { nom: "href", type: "string", requis: false, description: "Si fourni, la carte entière est un lien." },
      { nom: "children", type: "ReactNode", requis: true, description: "Contenu de la carte." },
    ],
    rgaa: [
      "RGAA 12.8 : le focus est visible quand la carte est cliquable.",
      "RGAA 6.1 : l'aria-label de la carte est explicite.",
    ],
    codeExemple: `// Carte cliquable (lien)
<Link
  href="/fr/plugins/comments"
  className="group block p-6 bg-blanc hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
  aria-label="Plugin Comments, voir la fiche"
>
  <h3 className="type-h3 text-noir mb-2">Comments</h3>
  <p className="type-body text-gris">Système de commentaires pour Strapi v5.</p>
</Link>`,
  },
  {
    slug: "champ",
    nom: "Champ de formulaire",
    description: "Input texte, email ou zone de texte. Bord noir au focus, rouge en erreur.",
    variantes: [
      { id: "texte", libelle: "Texte", description: "input type=text.", classeOuProp: 'type="text"' },
      { id: "email", libelle: "Email", description: "input type=email.", classeOuProp: 'type="email"' },
      { id: "zone", libelle: "Zone de texte", description: "textarea.", classeOuProp: "<textarea>" },
    ],
    etats: [
      { id: "repos", libelle: "Repos", description: "Bord gris clair." },
      { id: "focus", libelle: "Focus", description: "Bord noir, outline none." },
      { id: "erreur", libelle: "Erreur", description: "Bord rouge, message aria-describedby." },
      { id: "desactive", libelle: "Désactivé", description: "Fond gris clair, opacité réduite." },
    ],
    props: [
      { nom: "id", type: "string", requis: true, description: "Lié au <label> par htmlFor." },
      { nom: "label", type: "string", requis: true, description: "Libellé du champ, toujours visible." },
      { nom: "erreur", type: "string", requis: false, description: "Message d'erreur (aria-describedby)." },
      { nom: "required", type: "boolean", requis: false, description: "Champ obligatoire." },
    ],
    rgaa: [
      "RGAA 11.1 : chaque champ possède un label visible.",
      "RGAA 11.11 : les erreurs sont identifiables et décrivent la correction attendue.",
      "RGAA 12.8 : le focus est visible (bord noir).",
    ],
    codeExemple: `// Champ avec label et erreur
<div>
  <label htmlFor="email" className="type-caption text-noir block mb-1">
    Adresse email <span aria-hidden="true">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-describedby={erreur ? "email-erreur" : undefined}
    aria-invalid={!!erreur}
    className={[
      "type-body w-full px-4 py-3 border bg-blanc transition-colors duration-150",
      "focus-visible:border-noir",
      erreur ? "border-red-600" : "border-[var(--trait)]",
    ].join(" ")}
  />
  {erreur && (
    <p id="email-erreur" role="alert" className="type-caption text-red-600 mt-1">
      {erreur}
    </p>
  )}
</div>`,
  },
  {
    slug: "accordeon",
    nom: "Accordéon",
    description: "Liste de panneaux expansibles. Un seul ouvert à la fois (aria-expanded).",
    variantes: [
      { id: "standard", libelle: "Standard", description: "Bords, chevron, fond blanc.", classeOuProp: "standard" },
    ],
    etats: [
      { id: "ferme", libelle: "Fermé", description: "Contenu masqué, aria-expanded=false." },
      { id: "ouvert", libelle: "Ouvert", description: "Contenu visible, aria-expanded=true." },
      { id: "focus", libelle: "Focus clavier", description: "Fond gris clair sur le déclencheur." },
    ],
    props: [
      { nom: "items", type: "{ question: string; reponse: string }[]", requis: true, description: "Liste des panneaux." },
    ],
    rgaa: [
      "RGAA 12.8 : le focus est visible sur le déclencheur.",
      "ARIA : aria-expanded, aria-controls, aria-labelledby corrects.",
    ],
    codeExemple: `"use client";
import { useState } from "react";

const items = [
  { question: "Compatible avec Strapi v5 ?", reponse: "Oui, le plugin cible Strapi 5.x." },
];

export function Accordeon() {
  const [ouvert, setOuvert] = useState<number | null>(null);
  return (
    <dl>
      {items.map((item, i) => (
        <div key={i} className="border-b border-[var(--trait)]">
          <dt>
            <button
              type="button"
              aria-expanded={ouvert === i}
              aria-controls={\`panneau-\${i}\`}
              id={\`declencheur-\${i}\`}
              onClick={() => setOuvert(ouvert === i ? null : i)}
              className="type-body w-full flex items-center justify-between py-4 text-left hover:bg-gris-clair focus-visible:bg-gris-clair transition-colors duration-150"
            >
              {item.question}
            </button>
          </dt>
          <dd
            id={\`panneau-\${i}\`}
            role="region"
            aria-labelledby={\`declencheur-\${i}\`}
            hidden={ouvert !== i}
            className="type-body text-gris pb-4"
          >
            {item.reponse}
          </dd>
        </div>
      ))}
    </dl>
  );
}`,
  },
  {
    slug: "etiquette",
    nom: "Étiquette",
    description: "Badge de statut ou de catégorie. Toujours en type-caption, jamais cliquable seule.",
    variantes: [
      { id: "defaut", libelle: "Par défaut", description: "Fond gris clair, texte gris.", classeOuProp: "bg-gris-clair text-gris" },
      { id: "forte", libelle: "Forte", description: "Fond noir, texte blanc.", classeOuProp: "bg-noir text-blanc" },
    ],
    etats: [
      { id: "repos", libelle: "Repos", description: "Non interactive, pas de focus." },
    ],
    props: [
      { nom: "children", type: "ReactNode", requis: true, description: "Libellé de l'étiquette." },
      { nom: "variante", type: '"defaut" | "forte"', defaut: '"defaut"', requis: false, description: "Apparence." },
    ],
    rgaa: [
      "RGAA 10.1 : le texte de l'étiquette est lisible par un lecteur d'écran.",
      "RGAA 3.2 : contraste ≥ 4.5:1 sur les deux variantes.",
    ],
    codeExemple: `// Étiquette par défaut
<span className="type-caption bg-gris-clair text-gris px-2 py-0.5">
  Stable
</span>

// Étiquette forte
<span className="type-caption bg-noir text-blanc px-2 py-0.5">
  Nouveau
</span>`,
  },
];

/** Récupère un composant par son slug. */
export function getComposant(slug: string): ComposantDS | undefined {
  return COMPOSANTS.find((c) => c.slug === slug);
}
