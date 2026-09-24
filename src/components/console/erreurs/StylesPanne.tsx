/**
 * Feuille de la page d'erreur 500 (dessin Journal). React ne place la
 * balise qu'une seule fois dans le document (même `href`).
 *
 * Préfixe : `csErr500`.
 */

const STYLES = `
/* ------------------------------------------------------------------ */
/* Journal terminal                                                   */
/* ------------------------------------------------------------------ */
.csErr500Journal {
  background-color: #020810;
  background-image: repeating-linear-gradient(
    180deg,
    rgba(125, 211, 252, 0.025) 0 1px,
    transparent 1px 3px
  );
  border: 1px solid rgba(125, 211, 252, 0.15);
}

.csErr500Ligne {
  display: flex;
  align-items: center;
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  white-space: nowrap;
  overflow: hidden;
}

.csErr500Frappe {
  display: inline-block;
  overflow: hidden;
  width: calc(var(--csErr500Car, 0) * 1ch);
  animation: csErr500Frappe
    calc(var(--csErr500Car, 0) * 26ms)
    steps(var(--csErr500Car, 1), end)
    var(--csErr500Delai, 0ms)
    both;
}
@keyframes csErr500Frappe { from { width: 0; } }

.csErr500Curseur {
  display: inline-block;
  width: 0.55em;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -1px;
  animation: csErr500Clignote
    900ms
    step-end
    calc(var(--csErr500Car, 0) * 26ms + var(--csErr500Delai, 0ms))
    3;
}
@keyframes csErr500Clignote { 50% { opacity: 0; } }

/* ------------------------------------------------------------------ */
/* Mouvement réduit                                                    */
/* ------------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  .csErr500Frappe {
    animation: none;
    width: calc(var(--csErr500Car, 0) * 1ch);
  }
  .csErr500Curseur { animation: none; opacity: 0; }
}
`;

/** Feuille de la page 500, placée une seule fois. */
export function StylesErreur500() {
  return (
    <style href="console-erreurs-500" precedence="ds">
      {STYLES}
    </style>
  );
}
