/**
 * Feuille de styles du sous-système « Formulaires » de la Console.
 * Rendue par chaque composant ; React la hoiste et la déduplique (même href).
 * Conventions : toutes les classes sont préfixées csChamp…, csListe…, csCase…,
 * csRadio…, csInterrupteur… pour ne pas entrer en collision avec le reste du DS.
 */

const STYLES = `
/* =====================================================
   Console : Formulaires
   ===================================================== */

/* Fond sombre commun aux champs et à la Liste */
.csChampFond {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  clip-path: var(--cs-clip);
  background: rgba(4, 10, 20, 0.82);
}

/* Le cadre seul porte les états : il s'éclaire au survol, s'allume au focus
   (aucun anneau autour), passe au rouge en erreur et au vert une fois valide.
   Les états lisent --cs-bord, la variable de .csBord et .csDiag. */
:is(.csChampWrap, .csListeWrap) > :is(.csBord, .csDiag) { transition: background-color var(--cs-rapide) linear, filter var(--cs-rapide) linear; }
:is(.csChampWrap, .csListeWrap):hover { --cs-bord: rgba(125, 211, 252, 0.6); }
:is(.csChampWrap, .csListeWrap):focus-within { --cs-bord: var(--cs-neon); }
:is(.csChampWrap, .csListeWrap):focus-within > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.8)); }
:is(.csChampWrap, .csListeWrap)[data-etat="erreur"] { --cs-bord: rgba(252, 165, 165, 0.85); }
:is(.csChampWrap, .csListeWrap)[data-etat="erreur"]:focus-within > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(252, 165, 165, 0.6)); }
:is(.csChampWrap, .csListeWrap)[data-etat="valide"] { --cs-bord: rgba(94, 234, 212, 0.8); }
:is(.csChampWrap, .csListeWrap)[data-etat="valide"]:focus-within > :is(.csBord, .csDiag) { filter: drop-shadow(0 0 4px rgba(94, 234, 212, 0.6)); }

/* Champ <input> et <textarea> */
.csChampInput {
  position: relative; z-index: 1; display: block; width: 100%;
  background: transparent; color: var(--cs-texte);
  font-size: 1rem; font-family: inherit; line-height: 1.5;
  padding: 12px 14px; min-height: 48px;
  outline: none; border: none;
  caret-color: var(--cs-neon);
  clip-path: var(--cs-clip);
}
.csChampInput::placeholder { color: var(--cs-texte-3); }
.csChampInput:disabled { opacity: 0.42; cursor: not-allowed; }
/* Autofill : forcer les couleurs Console */
.csChampInput:-webkit-autofill,
.csChampInput:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--cs-texte);
  -webkit-box-shadow: 0 0 0 1000px rgba(4, 10, 20, 0.92) inset;
  caret-color: var(--cs-neon);
}

/* Textarea */
textarea.csChampInput {
  min-height: 120px;
  resize: vertical;
  padding-bottom: 28px;
}

/* Compteur de caractères */
.csChampCompteur {
  position: absolute; right: 12px; bottom: 8px; z-index: 3;
  color: var(--cs-texte-3); font-size: 0.8125rem; font-family: inherit;
  pointer-events: none; font-variant-numeric: tabular-nums;
}
.csChampCompteur[data-proche="true"] { color: var(--cs-alerte); }

/* Message d'erreur */
.csChampMsgErreur {
  display: flex; align-items: flex-start; gap: 6px;
  color: var(--cs-erreur);
  font-size: 0.8125rem; font-family: inherit; line-height: 1.4;
  margin-top: 6px;
}

/* =====================================================
   Liste déroulante (combobox / listbox)
   ===================================================== */

.csListeWrap { position: relative; isolation: isolate; }

/* Le trigger reprend l'apparence d'un champ */
.csListeTrigger {
  display: flex; align-items: center; justify-content: space-between;
  position: relative; z-index: 1;
  width: 100%; min-height: 48px;
  padding: 0 14px;
  background: transparent; border: none; outline: none;
  color: var(--cs-texte); font-size: 1rem; font-family: inherit;
  text-align: left; cursor: pointer;
}
.csListeTrigger[data-vide="true"] { color: var(--cs-texte-3); }
.csListeTrigger:disabled { opacity: 0.42; cursor: not-allowed; }

.csListeFleche {
  flex-shrink: 0; width: 16px; height: 16px; color: var(--cs-neon);
  transition: rotate var(--cs-rapide) var(--cs-ease);
}
.csListeWrap[data-ouvert="true"] .csListeFleche { rotate: 180deg; }

/* Menu déroulant : couche supérieure de la page (popover), placé sous le
   champ par Liste.tsx. Les valeurs par défaut du popover sont remises à zéro. */
.csListeMenuWrap {
  position: fixed; inset: auto; margin: 0; padding: 0; z-index: 1000;
  color: inherit;
  --cs-c-menu: 10px;
  --cs-clip-menu: polygon(
    var(--cs-c-menu) 0, 100% 0,
    100% calc(100% - var(--cs-c-menu)),
    calc(100% - var(--cs-c-menu)) 100%,
    0 100%, 0 var(--cs-c-menu)
  );
  clip-path: var(--cs-clip-menu);
  background: rgba(4, 10, 20, 0.96);
  border: 1px solid var(--cs-neon-doux);
  max-height: 240px; overflow-y: auto;
  overscroll-behavior: contain;
}
/* Verre dépoli : ce qui est derrière se devine flouté, jamais lisible. Reflet
   clair en haut, lueur froide sur les bords. Flou réservé au grand écran. */
@media (min-width: 1024px) {
  .csListeMenuWrap {
    background:
      linear-gradient(180deg, rgba(186, 230, 253, 0.09) 0%, rgba(186, 230, 253, 0) 38%),
      rgba(6, 14, 28, 0.72);
    backdrop-filter: blur(22px) saturate(170%) brightness(0.85);
    -webkit-backdrop-filter: blur(22px) saturate(170%) brightness(0.85);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.10),
      inset 0 0 28px rgba(125, 211, 252, 0.07);
  }
}

.csListeMenu { list-style: none; padding: 6px 0; margin: 0; outline: none; }
.csListeOption {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; min-height: 44px;
  color: var(--cs-texte-2); font-size: 1rem; font-family: inherit;
  cursor: pointer;
  transition: background-color var(--cs-rapide) linear, color var(--cs-rapide) linear;
}
.csListeOption:hover { background: var(--cs-neon-voile); color: var(--cs-texte); }
.csListeOption[data-actif="true"] { background: var(--cs-neon-voile); color: var(--cs-texte); }
.csListeOption[aria-selected="true"] { color: var(--cs-neon); }

/* =====================================================
   Case à cocher
   ===================================================== */

.csCaseWrap {
  position: relative; display: flex; align-items: flex-start; gap: 12px;
  min-height: 44px; cursor: pointer;
}
.csCaseWrap[data-desactive="true"] { opacity: 0.42; cursor: not-allowed; }

/* Contrôle natif gardé pour l'accessibilité, masqué visuellement */
.csCaseNatif {
  position: absolute;
  opacity: 0; width: 20px; height: 20px; margin: 0;
  cursor: inherit; z-index: 1;
}

.csCaseFond {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px;
  --cs-c: 4px;
  --cs-clip: polygon(
    var(--cs-c) 0, 100% 0,
    100% calc(100% - var(--cs-c)),
    calc(100% - var(--cs-c)) 100%,
    0 100%, 0 var(--cs-c)
  );
  clip-path: var(--cs-clip);
  background: rgba(4, 10, 20, 0.82);
  border: 1px solid var(--cs-neon-doux);
  transition: background-color var(--cs-rapide) linear, border-color var(--cs-rapide) linear, box-shadow var(--cs-rapide) linear;
  pointer-events: none;
  position: relative; z-index: 0;
}
.csCaseWrap:has(.csCaseNatif:checked) .csCaseFond {
  background: var(--cs-neon);
  border-color: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}
/* Focus : la case s'allume, aucun anneau. */
.csCaseWrap:has(.csCaseNatif:focus-visible) .csCaseFond {
  border-color: var(--cs-neon);
  background-color: var(--cs-neon-voile);
}
.csCaseWrap:has(.csCaseNatif:checked:focus-visible) .csCaseFond { background-color: #a8e4fd; }

/* =====================================================
   Boutons radio
   ===================================================== */

.csRadioWrap {
  position: relative; display: flex; align-items: center; gap: 12px;
  min-height: 44px; cursor: pointer;
}
.csRadioWrap[data-desactive="true"] { opacity: 0.42; cursor: not-allowed; }

.csRadioNatif {
  position: absolute;
  opacity: 0; width: 20px; height: 20px; margin: 0;
  cursor: inherit; z-index: 1;
}

.csRadioFond {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 50%;
  background: rgba(4, 10, 20, 0.82);
  border: 1.5px solid var(--cs-neon-doux);
  transition: border-color var(--cs-rapide) linear;
  pointer-events: none;
  position: relative; z-index: 0;
}
.csRadioPoint {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--cs-neon);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.8);
  scale: 0;
  transition: scale var(--cs-rapide) var(--cs-ease);
}
.csRadioWrap:has(.csRadioNatif:checked) .csRadioFond { border-color: var(--cs-neon); }
.csRadioWrap:has(.csRadioNatif:checked) .csRadioPoint { scale: 1; }
.csRadioWrap:has(.csRadioNatif:focus-visible) .csRadioFond {
  border-color: var(--cs-neon);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
}

/* =====================================================
   Interrupteur (switch)
   ===================================================== */

.csInterrupteurBouton {
  display: inline-flex; align-items: center; gap: 12px;
  cursor: pointer; background: transparent; border: none; padding: 2px 0; outline: none;
  font-family: inherit; font-size: 1rem; color: var(--cs-texte);
  min-height: 44px; text-align: left;
}
.csInterrupteurBouton[aria-disabled="true"] { opacity: 0.42; cursor: not-allowed; pointer-events: none; }

/* Piste : même coupe que le pouce (haut gauche, bas droit), bord d'un pixel
   qui suit la coupe. La lueur passe par drop-shadow pour épouser la forme. */
.csInterrupteurPiste {
  position: relative; width: 44px; height: 24px; flex-shrink: 0;
  --cs-c: 5px;
  --cs-clip: polygon(
    var(--cs-c) 0, 100% 0,
    100% calc(100% - var(--cs-c)),
    calc(100% - var(--cs-c)) 100%,
    0 100%, 0 var(--cs-c)
  );
  --cs-bord: var(--cs-neon-doux);
  transition: filter var(--cs-rapide) linear;
}
.csInterrupteurFond {
  position: absolute; inset: 0; clip-path: var(--cs-clip);
  background: rgba(4, 10, 20, 0.82);
  transition: background-color var(--cs-rapide) linear;
}
.csInterrupteurBouton:hover .csInterrupteurPiste { --cs-bord: rgba(125, 211, 252, 0.6); }
.csInterrupteurBouton[aria-checked="true"] .csInterrupteurPiste {
  --cs-bord: var(--cs-neon);
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.45));
}
.csInterrupteurBouton[aria-checked="true"] .csInterrupteurFond { background: rgba(56, 189, 248, 0.14); }
/* Focus : la piste s'allume, aucun anneau. */
.csInterrupteurBouton:focus-visible .csInterrupteurPiste {
  --cs-bord: var(--cs-neon);
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.75));
}

/* Pouce centré : 4 px d'écart sur les quatre côtés, dans les deux états. */
.csInterrupteurPouce {
  position: absolute; top: 4px; left: 4px;
  width: 16px; height: 16px;
  --cs-c: 3px;
  --cs-clip: polygon(
    var(--cs-c) 0, 100% 0,
    100% calc(100% - var(--cs-c)),
    calc(100% - var(--cs-c)) 100%,
    0 100%, 0 var(--cs-c)
  );
  clip-path: var(--cs-clip);
  background: var(--cs-texte-3);
  transition: translate var(--cs-rapide) var(--cs-ease), background-color var(--cs-rapide) linear, box-shadow var(--cs-rapide) linear;
}
.csInterrupteurBouton[aria-checked="true"] .csInterrupteurPouce {
  translate: 20px 0;
  background: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
}

/* =====================================================
   Mouvement réduit
   ===================================================== */
@media (prefers-reduced-motion: reduce) {
  .csChampWrap > .csBord,
  .csChampWrap > .csDiag,
  .csListeWrap > .csBord,
  .csListeWrap > .csDiag,
  .csListeFleche,
  .csListeOption,
  .csCaseFond,
  .csRadioPoint,
  .csInterrupteurPouce,
  .csInterrupteurPiste,
  .csInterrupteurFond { transition: none; }
}
`;

/** Styles du sous-système Formulaires. Rendue par chaque composant, dédupliquée par React. */
export function StylesFormulaires() {
  return (
    <style href="console-formulaires" precedence="ds">
      {STYLES}
    </style>
  );
}
