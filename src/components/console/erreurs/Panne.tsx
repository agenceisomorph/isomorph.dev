/**
 * Page d'erreur 500, dessin « Journal » retenu le 24 septembre 2026 :
 * lignes de terminal tapées à l'écran.
 *
 * Inspiré du dessin « Journal » de la notification Console :
 * frappe CSS step-end, curseur clignotant trois fois.
 * Aucune donnée temporelle au rendu (pas de Date.now()) : rendu
 * serveur et premier rendu navigateur identiques.
 *
 * Briques réutilisées : StylesConsole, Panneau, Etiquette, Bouton.
 *
 * RGAA 4.1, critères respectés :
 * - La ligne tapée est aria-hidden ; le message textuel accessible
 *   est dans le h1 et le paragraphe visibles.
 * - Mouvement réduit : les animations de frappe sont supprimées,
 *   le texte reste lisible dans son état final.
 */

"use client";

import type { CSSProperties } from "react";

import { Panneau, Etiquette, StylesConsole } from "../fondations";
import { useCheminNavigateur } from "./cheminNavigateur";
import { Bouton } from "../Bouton";
import { StylesErreur500 } from "./StylesPanne";

interface Props {
  reessayer: () => void;
  reference?: string;
}

interface LigneTerminalProps {
  texte: string;
  /** Couleur du texte via variable CSS. */
  couleur: string;
  /** Délai avant le début de la frappe (ms). */
  delai: number;
  /** Afficher le curseur clignotant après la frappe. */
  curseur?: boolean;
}

/** Une ligne de terminal avec animation de frappe CSS. */
function LigneTerminal({ texte, couleur, delai, curseur = false }: LigneTerminalProps) {
  const style = {
    "--csErr500Car": texte.length,
    "--csErr500Delai": `${delai}ms`,
    color: `var(${couleur})`,
  } as CSSProperties;

  return (
    <p className="csErr500Ligne type-caption" style={style} aria-hidden="true">
      <span className="csErr500Frappe">{texte}</span>
      {curseur ? <span className="csErr500Curseur" style={{ background: `var(${couleur})` }} /> : null}
    </p>
  );
}

export function Panne({ reessayer, reference }: Props) {
  /* Contenu des lignes terminal. */
  const chemin = useCheminNavigateur();
  // Une ligne tapée ne passe pas à la ligne : l'adresse longue garde sa fin, qui la distingue.
  const cheminCourt = chemin.length > 18 ? `…${chemin.slice(-17)}` : chemin;
  const ligne1 = `> [REQ]  GET ${cheminCourt}`;
  const ligne2 = "< [RES]  500";
  const ligne3 = reference ? `  [REF]  ${reference}` : null;

  /* Délai ligne 2 : après la frappe de ligne 1 + pause. */
  const delai2 = Math.ceil(ligne1.length * 26) + 320;
  /* Délai ligne 3 : après la frappe de ligne 2 + pause. */
  const delai3 = delai2 + Math.ceil(ligne2.length * 26) + 320;

  return (
    <section className="min-h-[calc(100dvh-64px)] bg-(--cs-fond) relative overflow-hidden csGrille flex items-center">
      <StylesConsole />
      <StylesErreur500 />
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-16 w-full flex flex-col items-center gap-8">
        {/* En-tête accessible */}
        <div className="text-center max-w-[560px]">
          <Etiquette className="justify-center">Erreur 500</Etiquette>
          <h1 className="type-h1 mt-4 text-white">Une erreur s&apos;est produite.</h1>
          <p className="type-body mt-4 text-(--cs-texte-2)">Nous travaillons pour la résoudre.</p>
        </div>

        {/* Terminal */}
        <Panneau
          coupe="m"
          flou
          className="w-full max-w-[560px] overflow-hidden"
        >
          {/* Clé : la frappe repart une fois l'adresse connue. */}
          <div key={chemin} className="csErr500Journal p-6 rounded-none">
            <LigneTerminal
              texte={ligne1}
              couleur="--cs-texte-3"
              delai={0}
            />
            <LigneTerminal
              texte={ligne2}
              couleur="--cs-erreur"
              delai={delai2}
              curseur={!ligne3}
            />
            {ligne3 ? (
              <LigneTerminal
                texte={ligne3}
                couleur="--cs-texte-3"
                delai={delai3}
                curseur
              />
            ) : null}
          </div>
        </Panneau>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Bouton onClick={reessayer}>Réessayer</Bouton>
          <Bouton variante="secondaire" href="/">Retour à l&apos;accueil</Bouton>
        </div>
      </div>
    </section>
  );
}
