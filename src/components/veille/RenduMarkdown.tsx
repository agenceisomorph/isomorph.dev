/**
 * Rendu Markdown maison pour le corps des éditions de veille.
 *
 * Sous-ensemble volontairement restreint au besoin réel des éditions :
 * titres (## / ###), paragraphes, gras (**texte**), liens Markdown et URL
 * nues, tableaux à barres verticales. Aucune dépendance ajoutée : le
 * contenu vient de fichiers versionnés dans ce dépôt (jamais d'une entrée
 * utilisateur), donc aucun risque d'injection ne justifie une bibliothèque
 * de sanitisation.
 *
 * Server Component, aucun script envoyé au client.
 *
 * RGAA 4.1 :
 *   - Critère 9.1 : les titres ## / ### produisent des <h2>/<h3>, jamais un
 *     niveau au-dessus du <h1> de la page qui les contient.
 *   - Critère 6.1 : les liens sources sont explicites (texte = URL ou titre),
 *     ouverts dans le même onglet, `rel="noopener"` posé par l'appelant.
 * Éco : aucun calcul côté client, pas de librairie Markdown complète.
 */

import type { ReactNode } from "react";

import { StylesConsole } from "../console/fondations";

/* ------------------------------------------------------------------ */
/* Mise en forme en ligne (gras, liens)                                */
/* ------------------------------------------------------------------ */

const MOTIF_EN_LIGNE = /(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/[^\s)]+)/g;

/** Découpe une ligne de texte et transforme gras, liens Markdown et URL nues. */
function rendreEnLigne(texte: string): ReactNode[] {
  const noeuds: ReactNode[] = [];
  let dernierIndex = 0;
  let cle = 0;

  for (const correspondance of texte.matchAll(MOTIF_EN_LIGNE)) {
    const [jeton] = correspondance;
    const index = correspondance.index ?? 0;

    if (index > dernierIndex) {
      noeuds.push(texte.slice(dernierIndex, index));
    }

    if (jeton.startsWith("**")) {
      noeuds.push(<strong key={cle++}>{jeton.slice(2, -2)}</strong>);
    } else if (jeton.startsWith("[")) {
      const fin = jeton.indexOf("](");
      const libelle = jeton.slice(1, fin);
      const url = jeton.slice(fin + 2, -1);
      noeuds.push(
        <a key={cle++} href={url} className="csLien csLienTexte" rel="noopener" target="_blank">
          {libelle}
        </a>,
      );
    } else {
      // URL nue : le libellé affiché est l'URL elle-même (source citée telle quelle).
      noeuds.push(
        <a key={cle++} href={jeton} className="csLien csLienTexte" rel="noopener" target="_blank">
          {jeton}
        </a>,
      );
    }

    dernierIndex = index + jeton.length;
  }

  if (dernierIndex < texte.length) {
    noeuds.push(texte.slice(dernierIndex));
  }

  return noeuds;
}

/* ------------------------------------------------------------------ */
/* Découpage en blocs (titres, tableaux, paragraphes)                  */
/* ------------------------------------------------------------------ */

type Bloc =
  | { type: "titre2"; texte: string }
  | { type: "titre3"; texte: string }
  | { type: "paragraphe"; texte: string }
  | { type: "tableau"; entetes: string[]; lignes: string[][] };

function decouperLigneTableau(ligne: string): string[] {
  return ligne
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cellule) => cellule.trim());
}

function estLigneSeparateurTableau(ligne: string): boolean {
  return /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(ligne.trim());
}

function analyserBlocs(markdown: string): Bloc[] {
  const lignes = markdown.split("\n");
  const blocs: Bloc[] = [];
  let tamponParagraphe: string[] = [];

  function clorreParagraphe() {
    if (tamponParagraphe.length > 0) {
      blocs.push({ type: "paragraphe", texte: tamponParagraphe.join(" ") });
      tamponParagraphe = [];
    }
  }

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];

    if (ligne.trim() === "") {
      clorreParagraphe();
      continue;
    }

    if (ligne.startsWith("### ")) {
      clorreParagraphe();
      blocs.push({ type: "titre3", texte: ligne.slice(4).trim() });
      continue;
    }

    if (ligne.startsWith("## ")) {
      clorreParagraphe();
      blocs.push({ type: "titre2", texte: ligne.slice(3).trim() });
      continue;
    }

    if (ligne.startsWith("# ")) {
      // Le titre de niveau 1 est déjà rendu par l'en-tête de la page.
      continue;
    }

    if (ligne.trim().startsWith("|")) {
      clorreParagraphe();
      const entetes = decouperLigneTableau(ligne);
      let j = i + 1;
      if (j < lignes.length && estLigneSeparateurTableau(lignes[j])) {
        j++;
      }
      const lignesTableau: string[][] = [];
      while (j < lignes.length && lignes[j].trim().startsWith("|")) {
        lignesTableau.push(decouperLigneTableau(lignes[j]));
        j++;
      }
      blocs.push({ type: "tableau", entetes, lignes: lignesTableau });
      i = j - 1;
      continue;
    }

    tamponParagraphe.push(ligne.trim());
  }

  clorreParagraphe();
  return blocs;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export function RenduMarkdown({ contenu }: { contenu: string }) {
  const blocs = analyserBlocs(contenu);

  return (
    <div className="flex flex-col gap-5">
      <StylesConsole />
      {blocs.map((bloc, index) => {
        if (bloc.type === "titre2") {
          return (
            <h2 key={index} className="type-h2 mt-4 text-white">
              {rendreEnLigne(bloc.texte)}
            </h2>
          );
        }
        if (bloc.type === "titre3") {
          return (
            <h3 key={index} className="type-h3 mt-2 text-white">
              {rendreEnLigne(bloc.texte)}
            </h3>
          );
        }
        if (bloc.type === "tableau") {
          return (
            <div key={index} className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    {bloc.entetes.map((entete, i) => (
                      <th
                        key={i}
                        className="type-caption border-b border-(--cs-trait) px-3 py-2 uppercase tracking-[0.08em] text-(--cs-texte-3)"
                      >
                        {rendreEnLigne(entete)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloc.lignes.map((ligne, i) => (
                    <tr key={i}>
                      {ligne.map((cellule, j) => (
                        <td
                          key={j}
                          className="type-body border-b border-(--cs-trait) px-3 py-2 align-top text-(--cs-texte-2)"
                        >
                          {rendreEnLigne(cellule)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={index} className="type-body text-(--cs-texte-2)">
            {rendreEnLigne(bloc.texte)}
          </p>
        );
      })}
    </div>
  );
}
