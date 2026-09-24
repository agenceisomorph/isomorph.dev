import type { Famille } from "@/components/site/sections";

/**
 * Données d'une page de service au format Console.
 *
 * Suit le squelette S0 à S15 de `_docs/plan-redaction-services-2026-09-24/README.md`
 * et le plan de chaque page dans le même dossier. Un fichier par page dans
 * `src/content/services/<slug>.ts`, texte seulement : aucune balise, aucune
 * classe, aucune taille de texte.
 *
 * Un bloc optionnel sans fait vérifiable s'omet ; il n'est jamais rempli de
 * généralités ni de repères « À compléter ».
 *
 * Liens dans le texte : la syntaxe `[texte du lien](/chemin)` est permise dans
 * les champs `texte`, `chapeau`, `reponse` et `definition`, vers une adresse
 * interne seulement (commence par « / »).
 */

export interface ElementTexte {
  titre: string;
  texte: string;
}

export interface PageServiceData {
  /** Dernier segment de l'adresse, ex. "shopify". */
  slug: string;
  famille: Famille;
  /** Adresse complète, ex. "/integrations/shopify". */
  chemin: string;
  /** Nom court, affiché dans le fil d'Ariane. */
  badge: string;
  /**
   * Vignette du service (image de partage sur les réseaux), chemin sous
   * `public/`, ex. "/hero/services/crm.webp" (640 × 800).
   */
  vignette: string;
  /** Date de dernière mise à jour du contenu, AAAA-MM-JJ. */
  dateModifiee: string;

  /** S0 Référencement. */
  seo: {
    /** 60 caractères au plus, requête principale en tête, sans « • ISOMORPH ». */
    titre: string;
    /** 140 à 155 caractères. */
    description: string;
    requetePrincipale: string;
    requetesSecondaires: string[];
    /** Type de service pour les données structurées, ex. "Intégration Shopify". */
    typeService: string;
  };

  /** S1 En-tête : H1 et chapeau dont la première phrase est la réponse. */
  enTete: { surtitre?: string; h1: string; chapeau: string };

  /** S2 Fiche express : 3 à 5 lignes. */
  fiche: { libelle: string; contenu: string }[];

  /** S3 En bref : 40 à 60 mots, se comprend seul. */
  enBref: { titre: string; texte: string };

  /** S4 Les bonnes situations : 3 ou 4. */
  situations: { titre: string; chapeau?: string; items: ElementTexte[] };

  /** S5 Ce que nous livrons. */
  livrables: { titre: string; chapeau?: string; items: ElementTexte[] };

  /** S6 Le déroulé : 3 à 6 étapes. */
  deroule: { titre: string; chapeau?: string; etapes: ElementTexte[] };

  /** S7 Choisir : options présentées à parts égales, chacune avec son cas. */
  choisir?: {
    titre: string;
    chapeau?: string;
    options: { nom: string; quand: string; texte?: string }[];
  };

  /** S8 Le budget : les facteurs qui le font varier. Aucun prix non sourcé. */
  budget?: { titre: string; chapeau?: string; facteurs: ElementTexte[] };

  /** S9 Ce qui se mesure : chiffres sourcés uniquement. */
  mesures?: {
    titre: string;
    chapeau?: string;
    indicateurs: { libelle: string; valeur: string; unite?: string; source: string }[];
  };

  /** S10 Projets : seulement avec l'accord écrit du client. */
  projets?: { titre: string; items: (ElementTexte & { href?: string })[] };

  /** S11 À lire : slugs d'articles publiés (`src/lib/actualites.ts`). */
  articles?: { titre: string; slugs: string[] };

  /** S12 Glossaire : 3 à 6 termes. */
  glossaire: { titre: string; termes: { terme: string; definition: string }[] };

  /** S13 Questions fréquentes : 5 à 8, alimente aussi les données structurées. */
  faq: { titre: string; items: { question: string; reponse: string }[] };

  /** S14 Services voisins : 2 à 4, adresses existantes de `familles.ts`. */
  voisins: { titre: string; items: { libelle: string; chemin: string; texte: string }[] };

  /** S15 Appel final. Omis : celui de la famille. */
  appelFinal?: { titre: string; texte?: string };
}
