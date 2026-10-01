/**
 * Données du design system Console — ISOMORPH.
 *
 * Source de vérité pour les jetons, composants et variantes.
 * Tous les composants listés ici sont réellement présents dans
 * src/components/console/.
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
  { nom: "Fond",           variable: "--cs-fond",        valeur: "#02060d",                usage: "Fond de page principal" },
  { nom: "Fond alterné",   variable: "--cs-fond-2",      valeur: "#07101d",                usage: "Section voisine" },
  { nom: "Surface",        variable: "--cs-surface",     valeur: "rgba(14,30,50,0.64)",    usage: "Verre de panneau" },
  { nom: "Néon",           variable: "--cs-neon",        valeur: "#7dd3fc",                usage: "Traits, repères, action principale" },
  { nom: "Néon vif",       variable: "--cs-neon-vif",    valeur: "#38bdf8",                usage: "Lueurs" },
  { nom: "Texte",          variable: "--cs-texte",       valeur: "#ffffff",                usage: "Titres et texte courant" },
  { nom: "Texte 2",        variable: "--cs-texte-2",     valeur: "rgba(255,255,255,0.72)", usage: "Chapeaux, descriptions" },
  { nom: "Texte 3",        variable: "--cs-texte-3",     valeur: "rgba(255,255,255,0.56)", usage: "Mentions, légendes" },
  { nom: "Trait",          variable: "--cs-trait",       valeur: "rgba(255,255,255,0.08)", usage: "Séparateurs" },
  { nom: "Succès",         variable: "--cs-succes",      valeur: "#5eead4",                usage: "Confirmation" },
  { nom: "Alerte",         variable: "--cs-alerte",      valeur: "#fbbf24",                usage: "Avertissement" },
  { nom: "Erreur",         variable: "--cs-erreur",      valeur: "#fca5a5",                usage: "Champ invalide" },
];

/* ------------------------------------------------------------------ */
/* Coupe des coins                                                     */
/* ------------------------------------------------------------------ */

export interface EchelleCoupe {
  taille: string;
  px: string;
  usage: string;
}

export const COUPES: EchelleCoupe[] = [
  { taille: "s", px: "10 px", usage: "Éléments compacts (badge, étiquette)" },
  { taille: "m", px: "16 px", usage: "Panneau standard, carte de contenu" },
  { taille: "l", px: "22 px", usage: "Grande section, héros" },
];

/* ------------------------------------------------------------------ */
/* Composants documentés                                               */
/* ------------------------------------------------------------------ */

export interface Variante {
  id: string;
  libelle: string;
  description: string;
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
  rgaa: string[];
  codeExemple: string;
}

export const COMPOSANTS: ComposantDS[] = [
  {
    slug: "bouton",
    nom: "Bouton",
    description: "Déclencheur d'action. Rendu en <button> sans href, en <a> avec href. Trois variantes : principal (néon plein), secondaire (verre + bord), tertiaire (lien instrument).",
    variantes: [
      { id: "principal",   libelle: "Principal",  description: "CTA fort, fond néon.", classeOuProp: 'variante="principal"' },
      { id: "secondaire",  libelle: "Secondaire", description: "Action voisine, verre et bord néon.", classeOuProp: 'variante="secondaire"' },
      { id: "tertiaire",   libelle: "Tertiaire",  description: "Lien d'instrument, sans cadre.", classeOuProp: 'variante="tertiaire"' },
    ],
    etats: [
      { id: "repos",      libelle: "Repos",       description: "État par défaut." },
      { id: "survol",     libelle: "Survol",      description: "Lueur néon amplifiée." },
      { id: "focus",      libelle: "Focus clavier", description: "Même traitement que le survol, sans anneau outline." },
      { id: "desactive",  libelle: "Désactivé",   description: "Opacité 40 %, pointer-events none." },
      { id: "chargement", libelle: "Chargement",  description: "Roue à la place de la flèche, bouton inactif." },
    ],
    props: [
      { nom: "variante",    type: '"principal" | "secondaire" | "tertiaire"', defaut: '"principal"', requis: false, description: "Apparence." },
      { nom: "href",        type: "string",    requis: false, description: "Rend le bouton comme un lien <a>." },
      { nom: "desactive",   type: "boolean",   defaut: "false", requis: false, description: "Désactive sans masquer." },
      { nom: "chargement",  type: "boolean",   defaut: "false", requis: false, description: "Roue de chargement." },
      { nom: "taille",      type: '"m" | "l"', defaut: '"m"', requis: false, description: "Taille du bouton." },
      { nom: "fleche",      type: "boolean",   defaut: "true", requis: false, description: "Flèche à droite du libellé." },
      { nom: "externe",     type: "boolean",   requis: false, description: "target=_blank + rel=noopener (avec href)." },
    ],
    rgaa: [
      "RGAA 11.9 : l'intitulé du bouton est explicite.",
      "RGAA 12.8 : le focus est visible — la lueur néon s'allume comme au survol.",
      "RGAA 10.3 : le bouton désactivé garde un contraste ≥ 3:1.",
    ],
    codeExemple: `import { Bouton } from "@/components/console/Bouton";

// Lien CTA principal
<Bouton href="/fr/plugins" variante="principal">
  Voir les plugins
</Bouton>

// Bouton de soumission avec état de chargement
<Bouton
  type="submit"
  variante="secondaire"
  chargement={enCours}
>
  Envoyer
</Bouton>

// Lien tertiaire externe
<Bouton
  href="https://github.com/agenceisomorph"
  variante="tertiaire"
  externe
>
  GitHub
</Bouton>`,
  },
  {
    slug: "lien",
    nom: "Lien texte",
    description: "Lien Console (src/components/console/liens.tsx). Au survol et au focus : deux crochets néon encadrent le libellé (variante « Tension »). Deux variantes : inline (dans un paragraphe) et navigation (pied de page).",
    variantes: [
      { id: "inline",     libelle: "Inline",     description: "Dans un paragraphe, souligné au repos.", classeOuProp: "<LienTexte>" },
      { id: "navigation", libelle: "Navigation", description: "Pied de page, légende, mention.", classeOuProp: "<LienNav>" },
    ],
    etats: [
      { id: "repos",  libelle: "Repos",         description: "Souligné (inline) ou couleur texte-3 (nav)." },
      { id: "survol", libelle: "Survol / Focus", description: "Crochets néon, voile bleu, lueur." },
    ],
    props: [
      { nom: "href",     type: "string",  requis: true,  description: "URL de destination." },
      { nom: "externe",  type: "boolean", requis: false, description: "Ouvre dans un nouvel onglet + mention sr-only RGAA 6.2." },
      { nom: "children", type: "ReactNode", requis: true, description: "Libellé du lien." },
    ],
    rgaa: [
      "RGAA 6.1 : libellé explicite hors contexte.",
      "RGAA 6.2 : les liens externes signalent l'ouverture d'un nouvel onglet (sr-only).",
      "RGAA 10.6 : le lien inline reste souligné au repos pour se repérer sans couleur.",
      "RGAA 12.8 : les crochets néon constituent le focus visible.",
    ],
    codeExemple: `import { LienTexte, LienNav } from "@/components/console/liens";

// Lien inline dans un paragraphe
<p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
  Consultez la{" "}
  <LienTexte href="/fr/plugins">liste des plugins</LienTexte>
  {" "}disponibles.
</p>

// Lien de navigation (pied de page)
<LienNav href="/fr/mentions-legales">
  Mentions légales
</LienNav>

// Lien externe avec mention RGAA
<LienTexte href="https://github.com/agenceisomorph" externe>
  GitHub
</LienTexte>`,
  },
  {
    slug: "panneau",
    nom: "Panneau",
    description: "Surface de verre sur fond sombre. Bords coupés, effet verre + lueur néon. Composant de structure : il enveloppe n'importe quel contenu.",
    variantes: [
      { id: "standard", libelle: "Standard", description: "Coupe m (16 px), verre sans lueur.", classeOuProp: '<Panneau coupe="m">' },
      { id: "flou",     libelle: "Avec flou", description: "backdrop-blur activé.", classeOuProp: '<Panneau coupe="m" flou>' },
    ],
    etats: [
      { id: "repos", libelle: "Statique", description: "Non interactif, pas de focus." },
    ],
    props: [
      { nom: "coupe",    type: '"s" | "m" | "l"', defaut: '"m"', requis: false, description: "Taille de la coupe de coin." },
      { nom: "flou",     type: "boolean",          defaut: "false", requis: false, description: "Ajoute backdrop-blur." },
      { nom: "className", type: "string",          requis: false, description: "Classes additionnelles." },
      { nom: "children", type: "ReactNode",        requis: true, description: "Contenu du panneau." },
    ],
    rgaa: [
      "Le panneau est non interactif : aucune gestion de focus requise.",
      "RGAA 3.2 : les textes à l'intérieur maintiennent un contraste ≥ 4.5:1 sur la surface de verre.",
    ],
    codeExemple: `import { StylesConsole, Panneau } from "@/components/console/fondations";

// Carte de plugin dans une grille
<StylesConsole />
<Panneau coupe="m" flou className="h-full">
  <div className="p-6 flex flex-col gap-3 h-full">
    <p className="type-h3" style={{ color: "var(--cs-texte)" }}>
      Custom Field Link
    </p>
    <p className="type-body flex-1" style={{ color: "var(--cs-texte-2)" }}>
      Un seul champ Strapi pour tous les types de liens.
    </p>
  </div>
</Panneau>`,
  },
  {
    slug: "champ",
    nom: "Champ de formulaire",
    description: "Champ texte Console (src/components/console/formulaires/Champ.tsx). Bord néon au focus — jamais d'anneau ni de ring en plus. Rouge au survol si invalide.",
    variantes: [
      { id: "texte", libelle: "Texte",        description: "input type=text.",  classeOuProp: 'type="text"' },
      { id: "email", libelle: "Email",         description: "input type=email.", classeOuProp: 'type="email"' },
      { id: "zone",  libelle: "Zone de texte", description: "textarea.",         classeOuProp: "<ZoneTexte>" },
    ],
    etats: [
      { id: "repos",    libelle: "Repos",     description: "Bord trait (blanc/8 %)." },
      { id: "focus",    libelle: "Focus",     description: "Bord néon, transition 150 ms. Aucun ring ni outline." },
      { id: "erreur",   libelle: "Erreur",    description: "Bord rouge (--cs-erreur), message aria-describedby." },
      { id: "desactive",libelle: "Désactivé", description: "Opacité réduite, cursor not-allowed." },
    ],
    props: [
      { nom: "libelle",    type: "string",  requis: true,  description: "Libellé visible du champ." },
      { nom: "valeur",     type: "string",  requis: true,  description: "Valeur courante (composant contrôlé)." },
      { nom: "onChange",   type: "(v: string) => void", requis: true, description: "Appelé à chaque frappe." },
      { nom: "erreur",     type: "string",  requis: false, description: "Message d'erreur (aria-describedby)." },
      { nom: "obligatoire",type: "boolean", requis: false, description: "Mention obligatoire visible + aria-required." },
      { nom: "type",       type: '"text" | "email" | "tel"', defaut: '"text"', requis: false, description: "Type du champ input." },
    ],
    rgaa: [
      "RGAA 11.1 : chaque champ a un label visible.",
      "RGAA 11.11 : les erreurs décrivent la correction attendue.",
      "RGAA 12.8 : le bord néon change de couleur au focus — aucun ring ni outline.",
    ],
    codeExemple: `import { Champ } from "@/components/console/formulaires/Champ";

// Champ contrôlé email
<Champ
  libelle="Adresse email"
  type="email"
  valeur={email}
  onChange={setEmail}
  obligatoire
  erreur={erreurs.email}
/>

// Champ texte simple
<Champ
  libelle="Nom"
  type="text"
  valeur={nom}
  onChange={setNom}
/>`,
  },
  {
    slug: "retours",
    nom: "Retours utilisateur",
    description: "Notifications, alertes et états de chargement Console (src/components/console/retours/). Trois niveaux : succès (néon vert), alerte (ambre), erreur (rouge).",
    variantes: [
      { id: "succes",     libelle: "Succès",   description: "Confirmation positive.",    classeOuProp: 'niveau="succes"' },
      { id: "alerte",     libelle: "Alerte",   description: "Avertissement non bloquant.", classeOuProp: 'niveau="alerte"' },
      { id: "erreur",     libelle: "Erreur",   description: "Problème à corriger.",       classeOuProp: 'niveau="erreur"' },
    ],
    etats: [
      { id: "repos",    libelle: "Visible",   description: "Message affiché, rôle alert." },
      { id: "masque",   libelle: "Masqué",    description: "aria-live : annonce sans affichage." },
    ],
    props: [
      { nom: "niveau",   type: '"succes" | "alerte" | "erreur"', requis: true, description: "Niveau de sévérité." },
      { nom: "message",  type: "string",    requis: true, description: "Texte du retour." },
      { nom: "visible",  type: "boolean",   requis: false, description: "Affiche ou masque le composant." },
    ],
    rgaa: [
      "RGAA 7.3 : role=alert annonce le message aux lecteurs d'écran.",
      "RGAA 3.2 : contrastes ≥ 4.5:1 sur chaque variante de couleur.",
    ],
    codeExemple: `import { RetourSucces, RetourAlerte, RetourErreur } from "@/components/console/retours";

// Confirmation après envoi de formulaire
{envoiOk && (
  <RetourSucces message="Message envoyé. Réponse sous 24 h." />
)}

// Alerte non bloquante
<RetourAlerte message="Le quota mensuel est presque atteint." />

// Erreur de validation
{erreurServeur && (
  <RetourErreur message={erreurServeur} />
)}`,
  },
  {
    slug: "navigation",
    nom: "Navigation",
    description: "Barre de navigation Console (src/components/console/navigation/). Fond verre, logo néon, liens type-caption en capitales, burger mobile avec volet plein écran.",
    variantes: [
      { id: "fixe",     libelle: "Fixe",     description: "Position fixed, inset-x-0 top-0.", classeOuProp: 'position="fixe"' },
      { id: "statique", libelle: "Statique", description: "Dans le flux normal (atelier).", classeOuProp: 'position="statique"' },
    ],
    etats: [
      { id: "repos",  libelle: "Repos",   description: "Transparent ou verre selon le défilement." },
      { id: "mobile", libelle: "Mobile",  description: "Burger visible, volet plein écran (< 1024 px)." },
    ],
    props: [
      { nom: "locale",   type: '"fr" | "en"', requis: true,  description: "Langue courante." },
      { nom: "frPath",   type: "string",      requis: true,  description: "Chemin équivalent en français." },
      { nom: "position", type: '"fixe" | "statique"', defaut: '"fixe"', requis: false, description: "Positionnement CSS." },
    ],
    rgaa: [
      "RGAA 12.1 : lien d'évitement vers #main-content.",
      "RGAA 12.2 : <nav> avec aria-label.",
      "RGAA 12.6 : aria-current=page sur le lien actif.",
      "RGAA 8.7  : hreflang sur les liens de langue.",
    ],
    codeExemple: `import { BarreConsole } from "@/components/console/navigation/BarreConsole";

// Barre fixe (pages publiques)
<BarreConsole
  locale="fr"
  frPath="/fr/plugins"
  position="fixe"
/>

// Barre statique (atelier)
<BarreConsole
  locale="fr"
  frPath="/atelier/console"
  position="statique"
/>`,
  },
];

/** Récupère un composant par son slug. */
export function getComposant(slug: string): ComposantDS | undefined {
  return COMPOSANTS.find((c) => c.slug === slug);
}
