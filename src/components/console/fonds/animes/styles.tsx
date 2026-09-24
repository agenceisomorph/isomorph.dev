/**
 * Feuille du fond animé du système Console. React la place une seule fois
 * dans le document (même `href`).
 *
 * Contient aussi le voile de lecture commun : un dégradé radial vers
 * `--cs-fond` qui atténue le fond derrière le titre, la phrase et les
 * boutons centrés d'une section.
 */

const STYLES = `
/* ---------- Commun ---------- */
.csFa { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.csFa > * { position: absolute; inset: 0; }
.csFaToile { display: block; width: 100%; height: 100%; }

/* Voile de lecture : le fond s'efface derrière le texte centré, jusqu'à
   tenir la phrase (--cs-texte-2) au-dessus de 4,5:1 même quand une crête
   claire passe derrière. L'ellipse est portée par la taille de l'élément :
   un dégradé radial n'accepte pas min() entre pourcentage et pixels. */
.csFa > .csFaVoile {
  inset: auto;
  left: 50%;
  top: 50%;
  width: min(128%, 1240px);
  height: min(86%, 480px);
  translate: -50% -50%;
  background: radial-gradient(closest-side,
    color-mix(in srgb, var(--cs-fond) 90%, transparent) 0%,
    color-mix(in srgb, var(--cs-fond) 86%, transparent) 45%,
    color-mix(in srgb, var(--cs-fond) 50%, transparent) 75%,
    transparent 100%);
}
@media (max-width: 767px) {
  .csFa > .csFaVoile { width: 200%; height: 76%; }
}
`;

export function StylesFondsAnimes() {
  return (
    <style href="console-fonds-animes" precedence="ds">
      {STYLES}
    </style>
  );
}
