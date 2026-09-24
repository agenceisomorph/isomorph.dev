import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Éditions de veille technique publiées sur isomorph.dev.
 *
 * Source : fichiers Markdown dans `content/veille/`, un fichier par édition.
 * Chaque fichier porte un en-tête JSON entre deux lignes `---`, suivi du
 * corps en Markdown. Contenu recopié et nettoyé depuis les rapports de veille
 * internes (mentions internes retirées avant publication) : voir
 * `_docs/inventaire-contenu-2026-09-25.md` §4 pour la source d'origine.
 *
 * Lecture au build uniquement (Server Components, generateStaticParams) :
 * pas d'accès réseau, pas de coût à l'exécution côté client.
 * Sécurité : le contenu vient de fichiers versionnés dans ce dépôt, jamais
 * d'une entrée utilisateur — aucune validation Zod nécessaire ici.
 */

/** Niveau d'alerte d'une édition, réutilisé pour le badge de la liste. */
export type NiveauVeille = "action" | "surveiller" | "bon-a-savoir" | "calme";

/** Fréquence de publication de l'édition. */
export type TypeVeille = "quotidienne" | "hebdomadaire";

/** Forme de base attendue par les autres composants de la rubrique Veille. */
export interface EditionVeille {
  slug: string;
  titre: string;
  /** Date ISO 8601 (AAAA-MM-JJ). */
  date: string;
  resume: string;
  /** Champs supplémentaires, non requis par la forme de base. */
  type: TypeVeille;
  niveau: NiveauVeille;
}

/** Édition complète, avec le corps Markdown. Réservé à la page de détail. */
export interface EditionVeilleComplete extends EditionVeille {
  contenu: string;
}

const DOSSIER_VEILLE = path.join(process.cwd(), "content", "veille");
const SEPARATEUR_FRONTMATTIERE = /^---\s*$/m;

function listerFichiersMarkdown(): string[] {
  return readdirSync(DOSSIER_VEILLE)
    .filter((nom) => nom.endsWith(".md"))
    .sort();
}

/**
 * Découpe un fichier d'édition en en-tête JSON et corps Markdown.
 * Format attendu :
 * ```
 * ---
 * {"slug": "...", ...}
 * ---
 * # Corps Markdown
 * ```
 */
function analyserFichier(nomFichier: string): EditionVeilleComplete {
  const brut = readFileSync(path.join(DOSSIER_VEILLE, nomFichier), "utf-8");
  const parties = brut.split(SEPARATEUR_FRONTMATTIERE);

  if (parties.length < 3) {
    throw new Error(
      `Édition de veille malformée (en-tête JSON manquant) : ${nomFichier}`,
    );
  }

  const [, enTeteBrut, ...resteDuCorps] = parties;
  const enTete = JSON.parse(enTeteBrut.trim()) as EditionVeille;
  const contenu = resteDuCorps.join("---").trim();

  return { ...enTete, contenu };
}

/** Toutes les éditions, corps compris, triées de la plus récente à la plus ancienne. */
const EDITIONS_COMPLETES: EditionVeilleComplete[] = listerFichiersMarkdown()
  .map(analyserFichier)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

function retirerContenu(edition: EditionVeilleComplete): EditionVeille {
  return {
    slug: edition.slug,
    titre: edition.titre,
    date: edition.date,
    resume: edition.resume,
    type: edition.type,
    niveau: edition.niveau,
  };
}

/** Éditions sans le corps Markdown, pour les listes et les filtres. */
export const EDITIONS: EditionVeille[] = EDITIONS_COMPLETES.map(retirerContenu);

/** Édition complète par slug, corps Markdown compris. `undefined` si absente. */
export function obtenirEdition(slug: string): EditionVeilleComplete | undefined {
  return EDITIONS_COMPLETES.find((edition) => edition.slug === slug);
}
