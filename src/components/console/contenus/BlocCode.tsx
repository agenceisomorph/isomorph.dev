/**
 * Bloc de code du système Console.
 *
 * Deux variantes :
 *  - "commande" : une ligne de terminal, invite $ affichée (jamais copiée).
 *  - "fichier"  : extrait multi-lignes, numéros de ligne facultatifs.
 *
 * Arbitrages piliers :
 *  - RGAA 4.1 crit. 7.1 : état du presse-papiers annoncé via aria-live="polite".
 *  - RGAA 4.1 crit. 10.7 : pas d'anneau de focus ; le bouton s'allume comme au
 *    survol (fond néon, text-shadow) sans modifier la forme.
 *  - Éco : "use client" limité à ce composant (état du bouton Copier).
 *    Aucune librairie de coloration syntaxique.
 *  - Perf : rendu serveur et premier rendu navigateur identiques.
 *    navigator.clipboard n'est jamais appelé au rendu, seulement au clic.
 *  - Sécu : le code est passé en contenu texte, jamais injecté en innerHTML.
 *
 * Police : aucune police à chasse fixe propre au système Console (polices.ts)
 * ne couvre ce besoin. On utilise la pile système monospace de Tailwind
 * (ui-monospace → SFMono-Regular → Menlo → Monaco → Consolas → Courier New).
 */

"use client";

import { useCallback, useState } from "react";

import { StylesConsole } from "../fondations";

/* ------------------------------------------------------------------ */
/* Feuille propre au composant                                         */
/* ------------------------------------------------------------------ */

const STYLES_CODE = `
/* ===================== BlocCode ===================== */

/* Le conteneur cache tout dépassement de la zone de code pour que le
   défilement horizontal reste à l'intérieur du bloc, jamais sur la page.
   overflow: hidden est sûr : csVerre et csBord sont position: absolute et
   clip-path ne dépend pas de overflow. */
.csCodeBloc {
  overflow: hidden;
  max-width: 100%;
}

/* En-tête : étiquette à gauche, bouton Copier à droite.
   min-height: 44px garantit la cible tactile sur le bouton (s'il prend
   toute la hauteur via align-items: stretch). */
.csCodeTete {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--cs-trait);
  min-height: 44px;
}

/* Étiquette : langue ou nom de fichier, style instrument. */
.csCodeEtiq {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0 12px 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--cs-texte-3);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Bouton Copier : pas d'outline, s'allume au survol et au focus clavier.
   Cible de 44 px : padding + min-width couvrent le minimum WCAG 2.5.5. */
.csCodeBtn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 44px;
  height: 100%;
  min-height: 44px;
  padding: 0 14px;
  background: transparent;
  border: none;
  border-left: 1px solid var(--cs-trait);
  cursor: pointer;
  color: var(--cs-texte-3);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  transition: color var(--cs-rapide) linear;
  white-space: nowrap;
  outline: none;
}
.csCodeBtn:is(:hover, :focus-visible) {
  color: var(--cs-neon);
}
.csCodeBtn[data-copie="true"] {
  color: var(--cs-succes);
}

/* Zone de défilement interne. */
.csCodeZone {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Le pre ne génère pas de margin, le padding donne l'espacement interne. */
.csCodePre {
  margin: 0;
  padding: 16px;
  tab-size: 2;
}

/* Invite $ : visible, jamais sélectionnée ni copiée. */
.csCodeInvite {
  color: var(--cs-neon);
  user-select: none;
  padding-right: 10px;
}

/* Variante "fichier" avec numéros de ligne : structure en tableau CSS
   pour aligner les colonnes sans fixer une largeur. */
.csCodeAvecNums {
  display: table;
  width: max-content;
  min-width: 100%;
}
.csCodeLigneRow {
  display: table-row;
}
.csCodeNumCell {
  display: table-cell;
  text-align: right;
  padding-right: 20px;
  color: var(--cs-texte-3);
  user-select: none;
  vertical-align: top;
  white-space: pre;
}
.csCodeContenuCell {
  display: table-cell;
  vertical-align: top;
  white-space: pre;
}

/* Commentaires shell (#) et en-têtes Markdown (#, >) : légèrement atténués. */
.csCodeComm {
  color: var(--cs-texte-3);
}

@media (prefers-reduced-motion: reduce) {
  .csCodeBtn { transition: none; }
}
`;

function StylesCode() {
  return (
    <style href="console-code" precedence="ds">
      {STYLES_CODE}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Types publics                                                       */
/* ------------------------------------------------------------------ */

export type VarianteBlocCode = "commande" | "fichier";

export interface BlocCodeProps {
  /**
   * Variante d'affichage.
   * - "commande" : commande shell sur une ligne, invite $ affichée.
   * - "fichier"  : extrait multi-lignes (défaut).
   */
  variante?: VarianteBlocCode;
  /**
   * Étiquette : langage ou nom de fichier, affichée dans l'en-tête
   * (ex. "bash", "llms.txt", "robots.txt", "json").
   */
  etiquette?: string;
  /**
   * Contenu texte du bloc.
   * Pour "commande" : ne pas inclure le $, il est affiché automatiquement.
   * Pour "fichier" : inclure les sauts de ligne.
   */
  code: string;
  /**
   * Numéros de ligne (variante "fichier" seulement). Défaut : false.
   */
  lignes?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeCopier() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
    >
      {/* Feuille de fond */}
      <rect x="3" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Feuille de dessus */}
      <path
        d="M6 5V3.5A1.5 1.5 0 0 1 7.5 2h4A1.5 1.5 0 0 1 13 3.5v8A1.5 1.5 0 0 1 11.5 13H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeCoche() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
    >
      <path
        d="M3 8.5 6.5 12 13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Coloration légère des commentaires                                  */
/* ------------------------------------------------------------------ */

/**
 * Enveloppe une ligne dans .csCodeComm quand elle est un commentaire shell (#)
 * ou un en-tête / blockquote Markdown (#, >). Aucune regex complexe.
 */
function LigneCode({ texte }: { texte: string }) {
  const trim = texte.trimStart();
  if (trim.startsWith("#") || trim.startsWith(">")) {
    return <span className="csCodeComm">{texte}</span>;
  }
  return <>{texte}</>;
}

/* ------------------------------------------------------------------ */
/* Contenu de la zone de code                                          */
/* ------------------------------------------------------------------ */

function ContenuCode({
  code,
  variante,
  lignes,
}: {
  code: string;
  variante: VarianteBlocCode;
  lignes: boolean;
}) {
  /* Variante commande : une seule ligne avec invite $ */
  if (variante === "commande") {
    return (
      <code className="type-caption font-mono text-(--cs-texte)">
        <span className="csCodeInvite" aria-hidden="true">$</span>
        {code}
      </code>
    );
  }

  /* Variante fichier */
  const lignesCode = code.split("\n");
  const largeurNum = String(lignesCode.length).length;

  if (lignes) {
    return (
      <code className="type-caption font-mono text-(--cs-texte) csCodeAvecNums">
        {lignesCode.map((ligne, i) => (
          <span key={i} className="csCodeLigneRow">
            <span className="csCodeNumCell" aria-hidden="true">
              {String(i + 1).padStart(largeurNum, " ")}
            </span>
            <span className="csCodeContenuCell">
              <LigneCode texte={ligne} />
            </span>
          </span>
        ))}
      </code>
    );
  }

  return (
    <code className="type-caption font-mono text-(--cs-texte)">
      {lignesCode.map((ligne, i) => (
        <span key={i}>
          {i > 0 && "\n"}
          <LigneCode texte={ligne} />
        </span>
      ))}
    </code>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                  */
/* ------------------------------------------------------------------ */

/**
 * Bloc de code Console avec bouton Copier.
 *
 * "use client" justifié : état du bouton Copier (useState). Aucune logique
 * serveur ne dépend de ce composant.
 *
 * @example
 * // Commande d'installation :
 * <BlocCode variante="commande" etiquette="bash"
 *   code="npm install @isomorph-agency/strapi-plugin-link" />
 *
 * // Extrait de fichier avec numéros de ligne :
 * <BlocCode variante="fichier" etiquette="robots.txt" lignes code="..." />
 */
export function BlocCode({
  variante = "fichier",
  etiquette,
  code,
  lignes = false,
  className = "",
}: BlocCodeProps) {
  const [copie, setCopie] = useState(false);

  const copier = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    });
  }, [code]);

  return (
    <>
      <StylesConsole />
      <StylesCode />
      {/* Annonce accessible : aria-live="polite" annonce le changement d'état
          sans interrompre la lecture en cours. aria-atomic garantit la lecture
          complète de la phrase. Toujours dans le DOM pour que le navigateur
          initialise correctement la région avant la première annonce. */}
      <span
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {copie ? "Code copié." : ""}
      </span>

      <div
        className={`csPanneau csCoupe csCodeBloc ${className}`}
        data-coupe="m"
      >
        {/* Fond et bords du panneau de verre */}
        <span aria-hidden="true" className="csVerre" />
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />

        {/* En-tête : étiquette et bouton Copier */}
        <div className="csCodeTete">
          {etiquette !== undefined ? (
            <span className="csCodeEtiq">{etiquette}</span>
          ) : (
            /* Espace réservé pour que le bouton reste aligné à droite */
            <span className="csCodeEtiq" aria-hidden="true" />
          )}
          <button
            type="button"
            className="csCodeBtn"
            onClick={copier}
            aria-label={copie ? "Code copié" : "Copier le code"}
            data-copie={copie ? "true" : undefined}
          >
            {copie ? (
              <>
                <IconeCoche />
                <span>Copié</span>
              </>
            ) : (
              <>
                <IconeCopier />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Zone de défilement horizontal interne */}
        <div className="csCodeZone">
          <pre className="csCodePre">
            <ContenuCode code={code} variante={variante} lignes={lignes} />
          </pre>
        </div>
      </div>
    </>
  );
}
