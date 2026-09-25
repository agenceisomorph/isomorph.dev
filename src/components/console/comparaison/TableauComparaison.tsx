/**
 * Tableau de comparaison du système Console.
 *
 * Feuille StylesComparaison : partagée par toute la famille comparaison,
 * exportée depuis ce fichier (même principe que StylesContenus dans Carte.tsx).
 *
 * RGAA 4.1 :
 *  - Critère 5.4 : <caption> visible avec résumé du tableau.
 *  - Critère 5.6 : <th scope="col"> pour les colonnes de solution,
 *    <th scope="row"> pour les critères.
 *  - Critère 3.1 : repères (oui, non, partiel) communiqués en texte et
 *    en icône, jamais portés par la couleur seule.
 *  - Critère 10.7 : focus clavier sur la zone de défilement, visible par
 *    un bord lumineux (box-shadow), aucun anneau outline.
 *  - Critère 12.8 : zone de défilement accessible au clavier (tabIndex=0,
 *    role="region", aria-label).
 *
 * Éco : Server Component, aucun état, aucune dépendance npm ajoutée.
 * Sur téléphone, les colonnes se resserrent pour tenir dans l'écran ; la
 * zone défile de côté seulement au-delà de trois colonnes.
 */

import { StylesConsole } from "../fondations";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ValeurRepere = "oui" | "non" | "partiel";

export interface CelluleComparaison {
  /** Repère affiché. Non défini si la cellule porte un placeholder. */
  valeur?: ValeurRepere;
  /** Précision courte affichée sous le repère. */
  note?: string;
  /**
   * Cellule non sourcée : texte de substitution visible.
   * Format exact : "[À compléter — source X]" (jamais publiable tel quel).
   * Seule exception autorisée au tiret cadratin dans le projet.
   */
  placeholder?: string;
}

export interface LigneComparaison {
  critere: string;
  /** Une cellule par colonne, dans le même ordre que `colonnes`. */
  cellules: CelluleComparaison[];
}

export interface ColonneComparaison {
  libelle: string;
  /** Étiquette courte dans le cadre néon (ex. "Notre prestation"). */
  etiquette?: string;
  /** Mise en avant : fond néon voile, trait de tête néon. */
  accent?: boolean;
}

export interface TableauComparaisonProps {
  /** Légende du tableau : caption visible et label de la zone de défilement. */
  legende: string;
  colonnes: ColonneComparaison[];
  lignes: LigneComparaison[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Feuille de la famille comparaison                                   */
/* ------------------------------------------------------------------ */

const STYLES_COMPARAISON = `
/* ===================== Zone de défilement ===================== */
.csCmpZone {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
/* Focus de la zone : bord lumineux, aucun outline. */
.csCmpZone:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--cs-neon), 0 0 8px rgba(56, 189, 248, 0.35);
}

/* ===================== Tableau ===================== */
.csCmpTableau {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  caption-side: top;
}
.csCmpCaption {
  text-align: left;
  padding-bottom: 14px;
  color: var(--cs-texte-3);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* En-tête colonnes */
.csCmpTh {
  padding: 10px 16px 12px;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--cs-texte-2);
  border-bottom: 1px solid var(--cs-trait);
  white-space: nowrap;
  vertical-align: bottom;
}
/* Colonne mise en avant : cadre néon haut et bas. */
.csCmpTh[data-accent] {
  color: var(--cs-neon);
  background: var(--cs-neon-voile);
  border-top: 1px solid rgba(125, 211, 252, 0.6);
  border-bottom-color: rgba(125, 211, 252, 0.4);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.10) inset;
}
/* Colonne des critères : pas de fond, alignée à gauche. */
.csCmpThCritere {
  text-align: left;
  color: var(--cs-neon);
  padding-left: 0;
  border-bottom-color: rgba(125, 211, 252, 0.18);
  font-size: 0.8125rem;
}
/* Étiquette courte au-dessus du libellé de colonne. */
.csCmpEtiquette {
  display: block;
  font-size: 0.8125rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--cs-neon);
  margin-bottom: 5px;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8));
}

/* ===================== Lignes ===================== */
.csCmpTr td,
.csCmpTr th {
  border-bottom: 1px solid var(--cs-trait);
  transition: background-color var(--cs-rapide) linear, color var(--cs-rapide) linear;
}
.csCmpTr:last-child td,
.csCmpTr:last-child th { border-bottom: none; }
.csCmpTr:hover .csCmpCritere,
.csCmpTr:focus-within .csCmpCritere { color: var(--cs-texte); }
.csCmpTr:hover .csCmpTd,
.csCmpTr:focus-within .csCmpTd { background: rgba(56, 189, 248, 0.03); }
.csCmpTr:hover .csCmpTd[data-accent],
.csCmpTr:focus-within .csCmpTd[data-accent] { background: rgba(56, 189, 248, 0.10); }

/* Cellule critère (th scope="row") */
.csCmpCritere {
  padding: 14px 20px 14px 0;
  text-align: left;
  color: var(--cs-texte-2);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  min-width: 180px;
  max-width: 280px;
}

/* Cellules de valeur (td) */
.csCmpTd {
  padding: 14px 16px;
  text-align: center;
  vertical-align: top;
}
.csCmpTd[data-accent] { background: var(--cs-neon-voile); }

/* ===================== Repère ===================== */
/* Icône + texte : l'information n'est jamais portée par la couleur seule. */
.csCmpRepere {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.csCmpRepereIcone {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: block;
}
.csCmpRepereTexte {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}
/* Couleurs des repères. */
.csCmpRepere[data-valeur="oui"] .csCmpRepereIcone { color: var(--cs-succes); }
.csCmpRepere[data-valeur="oui"] .csCmpRepereTexte { color: var(--cs-succes); }
.csCmpRepere[data-valeur="non"] .csCmpRepereIcone { color: var(--cs-texte-3); }
.csCmpRepere[data-valeur="non"] .csCmpRepereTexte { color: var(--cs-texte-3); }
.csCmpRepere[data-valeur="partiel"] .csCmpRepereIcone { color: var(--cs-alerte); }
.csCmpRepere[data-valeur="partiel"] .csCmpRepereTexte { color: var(--cs-alerte); }

/* Note courte sous le repère. */
.csCmpNote {
  display: block;
  margin-top: 5px;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--cs-texte-3);
  max-width: 140px;
  text-align: center;
}

/* Téléphone : les trois colonnes tiennent dans l'écran, la colonne
   recommandée reste visible sans défilement. */
@media (max-width: 639px) {
  .csCmpTableau { min-width: 0; table-layout: fixed; }
  .csCmpThCritere { width: 36%; }
  .csCmpTh, .csCmpEtiquette { white-space: normal; letter-spacing: 0.03em; hyphens: auto; overflow-wrap: break-word; }
  .csCmpTh { padding: 10px 6px 12px; }
  .csCmpCritere { min-width: 0; padding-right: 10px; }
  .csCmpTd { padding: 14px 6px; }
  .csCmpNote { max-width: none; }
}

/* Placeholder : cellule non sourcée. */
.csCmpPlaceholder {
  display: inline-block;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--cs-alerte);
  font-style: italic;
  max-width: 150px;
  text-align: center;
  opacity: 0.9;
}

/* ===================== FAQ ===================== */
/* Le conteneur FAQ n'a pas de style particulier.          */
/* Les styles de l'accordéon viennent de StylesContenus.  */
.csCmpFaqLien {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--cs-neon);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: filter var(--cs-moyen) var(--cs-ease);
}
.csCmpFaqLien:is(:hover, :focus-visible) {
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
}
.csCmpFaqLienFleche {
  transition: translate var(--cs-moyen) var(--cs-ease);
}
.csCmpFaqLien:is(:hover, :focus-visible) .csCmpFaqLienFleche { translate: 4px 0; }

/* ===================== Mouvement réduit ===================== */
@media (prefers-reduced-motion: reduce) {
  .csCmpTr td,
  .csCmpTr th { transition: none; }
  .csCmpFaqLienFleche { transition: none; }
}
`;

/** Feuille de la famille comparaison. Rendue par chaque composant de la famille. */
export function StylesComparaison() {
  return (
    <style href="console-comparaison" precedence="ds">
      {STYLES_COMPARAISON}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Repères                                                             */
/* ------------------------------------------------------------------ */

function IconeOui() {
  return (
    <svg viewBox="0 0 18 18" className="csCmpRepereIcone" aria-hidden="true" focusable="false">
      <path
        d="M3.5 9 L7.5 13.5 L14.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeNon() {
  return (
    <svg viewBox="0 0 18 18" className="csCmpRepereIcone" aria-hidden="true" focusable="false">
      <line
        x1="4.5" y1="9" x2="13.5" y2="9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconePartiel() {
  return (
    <svg viewBox="0 0 18 18" className="csCmpRepereIcone" aria-hidden="true" focusable="false">
      <path
        d="M3 9 Q5.5 6 8 9 Q10.5 12 13 9 Q14.5 7.5 16 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RepereSymbole({ valeur }: { valeur: ValeurRepere }) {
  const labels: Record<ValeurRepere, string> = { oui: "Oui", non: "Non", partiel: "Partiel" };
  return (
    <span className="csCmpRepere" data-valeur={valeur}>
      {valeur === "oui" ? <IconeOui /> : valeur === "non" ? <IconeNon /> : <IconePartiel />}
      <span className="csCmpRepereTexte">{labels[valeur]}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* TableauComparaison                                                  */
/* ------------------------------------------------------------------ */

/**
 * Tableau de comparaison entre N solutions (2 ou 3 colonnes).
 *
 * La colonne mise en avant reçoit `accent: true` dans `colonnes`.
 * Les cellules non sourcées portent `placeholder` au lieu de `valeur`.
 */
export function TableauComparaison({
  legende,
  colonnes,
  lignes,
  className = "",
}: TableauComparaisonProps) {
  return (
    <>
      <StylesConsole />
      <StylesComparaison />
      <div
        className={`csCmpZone ${className}`}
        tabIndex={0}
        role="region"
        aria-label={legende}
      >
        <table className="csCmpTableau">
          <caption className="csCmpCaption">{legende}</caption>
          <thead>
            <tr>
              {/* Coin haut gauche : cellule vide, colonne des critères. */}
              <th scope="col" className="csCmpTh csCmpThCritere">
                <span className="sr-only">Critère</span>
              </th>
              {colonnes.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className="csCmpTh"
                  data-accent={col.accent ? "" : undefined}
                >
                  {col.etiquette ? (
                    <span className="csCmpEtiquette" aria-hidden="true">
                      {col.etiquette}
                    </span>
                  ) : null}
                  {col.libelle}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => (
              <tr key={i} className="csCmpTr">
                <th scope="row" className="csCmpCritere">
                  {ligne.critere}
                </th>
                {colonnes.map((col, j) => {
                  const cellule = ligne.cellules[j];
                  if (!cellule) {
                    return (
                      <td
                        key={j}
                        className="csCmpTd"
                        data-accent={col.accent ? "" : undefined}
                      />
                    );
                  }
                  return (
                    <td
                      key={j}
                      className="csCmpTd"
                      data-accent={col.accent ? "" : undefined}
                    >
                      {cellule.placeholder ? (
                        <span className="csCmpPlaceholder">{cellule.placeholder}</span>
                      ) : cellule.valeur ? (
                        <>
                          <RepereSymbole valeur={cellule.valeur} />
                          {cellule.note ? (
                            <span className="csCmpNote">{cellule.note}</span>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
