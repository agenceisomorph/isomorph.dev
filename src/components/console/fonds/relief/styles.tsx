/**
 * Famille « Fonds en relief » du système Console : feuille de style partagée.
 * Chaque fond la rend, React ne la place qu'une fois dans la page (même `href`).
 *
 * Le voile assombrit le fond derrière le contenu centré d'une section (titre,
 * phrase, boutons) : dégradé radial vers `--cs-fond`, plus large en format
 * étroit où le texte occupe toute la largeur.
 */

export function StylesRelief() {
  return (
    <style href="console-fonds-relief" precedence="ds">
      {STYLES}
    </style>
  );
}

const STYLES = `
.csRel {
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
  background: var(--cs-fond);
}
.csRelToile {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.csRelVoile {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 40% 36% at 50% 50%,
    var(--cs-fond) 0%,
    rgb(2 6 13 / 0.9) 42%,
    rgb(2 6 13 / 0.55) 72%,
    rgb(2 6 13 / 0) 100%
  );
}
@container (max-width: 640px) {
  .csRelVoile {
    background: radial-gradient(
      ellipse 78% 40% at 50% 50%,
      var(--cs-fond) 0%,
      rgb(2 6 13 / 0.9) 45%,
      rgb(2 6 13 / 0.5) 75%,
      rgb(2 6 13 / 0) 100%
    );
  }
}
`;
