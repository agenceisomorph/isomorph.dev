/**
 * Feuille partagée de la famille « Retours » du système Console : modale,
 * notifications, info-bulle, progression, chargement. Rendue par chaque
 * composant de la famille, React la place une seule fois dans le document
 * grâce à `href="console-retours"`.
 */

const STYLES_RETOURS = `
/* =========== Famille Retours : système Console =========== */

/* ---- Modale ---- */
/* Marge automatique : la remise à zéro de Tailwind retire le centrage natif. */
.csRetDialog {
  margin: auto; padding: 0; border: 0; background: transparent;
  max-width: min(90vw, 640px); width: 100%;
  max-height: min(90dvh, 800px); overflow: visible;
}
.csRetDialog::backdrop {
  background: rgba(2, 6, 13, 0.82);
}
@media (min-width: 1024px) {
  .csRetDialog::backdrop {
    backdrop-filter: blur(8px) saturate(120%);
    -webkit-backdrop-filter: blur(8px) saturate(120%);
  }
}
.csRetModaleFrame {
  max-height: min(90dvh, 800px); display: flex; flex-direction: column; overflow: hidden;
}
.csRetModaleEntete {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; padding: 20px 24px 16px; flex-shrink: 0; position: relative;
}
.csRetModaleContenu {
  overflow-y: auto; flex: 1; padding: 0 24px 24px;
  scrollbar-color: var(--cs-neon-doux) transparent; scrollbar-width: thin;
}
.csRetFermer {
  min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: 0; cursor: pointer;
  color: var(--cs-texte-3); flex-shrink: 0;
  transition: color var(--cs-rapide) linear;
}
.csRetFermer:hover { color: var(--cs-texte); }
.csRetFermer:focus-visible { color: var(--cs-neon); filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9)); }

/* Allumage de la modale : le contenu scintille après l'ouverture du cadre. */
.csRetDialog[open] .csRetModaleCorps { animation: csAllume 560ms ease-out both; }

/* Scan : une lueur traverse le panneau à l'ouverture. */
.csRetScan {
  position: absolute; inset-inline: 0; top: 0; height: 2px; pointer-events: none; z-index: 10;
  background: linear-gradient(90deg, transparent, var(--cs-neon-vif) 18%, var(--cs-neon-vif) 82%, transparent);
  box-shadow: 0 0 16px 2px rgba(56, 189, 248, 0.65);
  opacity: 0;
}
.csRetDialog[open] .csRetScan { animation: csRetScanDesc 900ms 80ms ease-out forwards; }
@keyframes csRetScanDesc {
  0% { opacity: 0; translate: 0 0; }
  8%, 80% { opacity: 1; }
  100% { opacity: 0; translate: 0 560px; }
}

/* Bord de la modale : apparaît avec l'allumage. */
.csRetDialog[open] .csBord,
.csRetDialog[open] .csDiag { animation: csRetBordEntree 400ms ease-out both; }
.csRetDialog[open] .csEquerre { animation: csRetBordEntree 400ms 200ms ease-out both; }
@keyframes csRetBordEntree { from { opacity: 0; } to { opacity: 1; } }

/* ---- Notifications : dessin « Journal » ---- */
.csRetZoneNotif {
  position: fixed; z-index: 9000; pointer-events: none;
  bottom: 16px; left: 16px; right: 16px;
  display: flex; flex-direction: column;
}
@media (min-width: 640px) {
  .csRetZoneNotif { bottom: 24px; left: auto; right: 24px; width: 360px; }
}
/* Deux régions live toujours présentes : l'écart ne vient qu'entre deux régions remplies. */
.csRetRegion { display: flex; flex-direction: column; gap: 8px; }
.csRetRegion:not(:empty) + .csRetRegion:not(:empty) { margin-top: 8px; }

.csRetNotif {
  pointer-events: all; position: relative; overflow: hidden;
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 6px 14px 14px;
  animation: csRetApparait 160ms linear backwards;
}
.csRetNotif[data-type="succes"] { --csRetTon: var(--cs-succes); --csRetLueur: rgba(94, 234, 212, 0.8); }
.csRetNotif[data-type="alerte"] { --csRetTon: var(--cs-alerte); --csRetLueur: rgba(251, 191, 36, 0.8); }
.csRetNotif[data-type="erreur"] { --csRetTon: var(--cs-erreur); --csRetLueur: rgba(252, 165, 165, 0.8); }
.csRetNotif[data-type="info"]   { --csRetTon: var(--cs-neon);   --csRetLueur: rgba(125, 211, 252, 0.8); }
@keyframes csRetApparait { from { opacity: 0; } }

.csRetJouFond {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-color: #02060d;
  background-image: repeating-linear-gradient(180deg, rgba(125, 211, 252, 0.035) 0 1px, transparent 1px 3px);
  border: 1px solid var(--cs-neon-doux);
}
.csRetJouCorps { flex: 1; min-width: 0; }
/* Ligne tapée à l'heure de l'envoi, curseur qui clignote trois fois. */
.csRetJouLigne {
  display: flex; align-items: center; min-height: 24px; white-space: nowrap; letter-spacing: 0;
  font-family: var(--font-geist-mono), ui-monospace, monospace; color: var(--csRetTon);
}
.csRetJouFrappe {
  display: inline-block; overflow: hidden; width: calc(var(--csRetCar) * 1ch);
  animation: csRetFrappe calc(var(--csRetCar) * 24ms) steps(var(--csRetCar), end) 120ms both;
}
@keyframes csRetFrappe { from { width: 0; } }
.csRetJouCurseur {
  display: inline-block; width: 0.6em; height: 1.1em; margin-left: 2px;
  background: var(--csRetTon); box-shadow: 0 0 6px var(--csRetLueur);
  animation: csRetClignote 900ms step-end calc(var(--csRetCar) * 24ms + 120ms) 3;
}
@keyframes csRetClignote { 50% { opacity: 0; } }
.csRetNotifTextes { margin-top: 6px; }

.csRetNotifFermer {
  min-width: 36px; min-height: 36px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: 0; color: var(--cs-texte-3);
  transition: color var(--cs-rapide) linear;
}
button.csRetNotifFermer { cursor: pointer; }
button.csRetNotifFermer:hover { color: var(--cs-texte); }
button.csRetNotifFermer:focus-visible { color: var(--cs-neon); filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9)); }

/* Filet du temps restant : même durée que la minuterie, suspendu avec elle. */
.csRetProgNotif {
  position: absolute; bottom: 0; left: 0; height: 1.5px; width: 100%;
  transform-origin: 0 50%; background: var(--csRetTon); opacity: 0.65;
  animation: csRetProgShrink var(--csRetDuree) linear forwards;
}
@keyframes csRetProgShrink { from { scale: 1 1; } to { scale: 0 1; } }
.csRetNotif[data-pause] .csRetProgNotif { animation-play-state: paused; }
.csRetNotif[data-fige] .csRetProgNotif { animation: none; scale: 0.62 1; }

/* Vitrine : les quatre types à la largeur réelle, deux par rangée. */
.csRetApercu { --l: 360px; display: grid; gap: 16px; max-width: calc(var(--l) * 2 + 16px); grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--l)), 1fr)); }

/* ---- Info-bulle ---- */
.csRetIBulle { position: relative; display: inline-flex; align-items: center; }

/* Bouton icône, cible de 44 px. */
.csRetIcone {
  display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px;
  color: var(--cs-neon); background: rgba(56, 189, 248, 0.06);
  border: 1px solid var(--cs-neon-doux); border-radius: 50%;
  transition: border-color var(--cs-rapide) linear, background-color var(--cs-rapide) linear;
}
.csRetIcone:is(:hover, :focus-visible) { border-color: var(--cs-neon); background: var(--cs-neon-voile); }
.csRetIcone:focus-visible { box-shadow: 0 0 10px rgba(56, 189, 248, 0.7); }
.csRetIBulleCorps {
  position: absolute; z-index: 9001; left: 50%; translate: -50% 0;
  pointer-events: none; white-space: nowrap;
  animation: csRetIBulleApparait 160ms ease-out;
}
.csRetIBulleCorps[data-placement="haut"] { bottom: calc(100% + 10px); }
.csRetIBulleCorps[data-placement="bas"]  { top: calc(100% + 10px); }
.csRetIBulleContenu { padding: 6px 14px; }
@keyframes csRetIBulleApparait { from { opacity: 0; } to { opacity: 1; } }

/* ---- Progression : barre ---- */
.csRetBarreFond {
  height: 4px; border-radius: 2px; overflow: hidden;
  background: var(--cs-neon-voile);
}
.csRetBarreRemplissage {
  height: 100%; transform-origin: 0 50%;
  background: var(--cs-neon);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
  transition: scale var(--cs-moyen) var(--cs-ease);
}

/* ---- Progression : étapes ---- */
.csRetEtapes { display: flex; align-items: flex-start; position: relative; }
.csRetEtape  { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.csRetEtapePastille {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--cs-neon-doux); color: var(--cs-texte-3);
  background: var(--cs-surface); position: relative; z-index: 1;
  transition: border-color var(--cs-moyen) linear, color var(--cs-moyen) linear,
              background-color var(--cs-moyen) linear;
}
.csRetEtape[aria-current="step"] .csRetEtapePastille {
  border-color: var(--cs-neon); color: var(--cs-neon);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.55);
}
.csRetEtape[data-faite="true"] .csRetEtapePastille {
  background: var(--cs-neon); color: #02060d; border-color: var(--cs-neon);
}
.csRetEtapeTrait {
  position: absolute; top: 15px; left: calc(50% + 16px);
  width: calc(100% - 32px);
  height: 1px; background: var(--cs-neon-doux);
}
.csRetEtape[data-faite="true"] .csRetEtapeTrait {
  background: var(--cs-neon); box-shadow: 0 0 4px rgba(56, 189, 248, 0.7);
}
.csRetEtapeLabel {
  margin-top: 10px; text-align: center; color: var(--cs-texte-3);
  transition: color var(--cs-moyen) linear;
}
.csRetEtape[aria-current="step"] .csRetEtapeLabel { color: var(--cs-texte); }
.csRetEtape[data-faite="true"] .csRetEtapeLabel  { color: var(--cs-texte-2); }

/* ---- Squelettes ---- */
.csRetSquelette {
  position: relative; overflow: hidden;
  background: rgba(14, 30, 50, 0.64);
}
.csRetSqueletteBalayage {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: linear-gradient(100deg, transparent 20%, rgba(125, 211, 252, 0.07) 50%, transparent 80%);
  translate: -100% 0; animation: csRetBalayage 1800ms ease-in-out infinite;
}
@keyframes csRetBalayage { to { translate: 200% 0; } }

/* ---- Mouvement réduit ---- */
@media (prefers-reduced-motion: reduce) {
  .csRetSqueletteBalayage { animation: none; }
  .csRetBarreRemplissage  { transition: none; }
  .csRetNotif,
  .csRetNotif :is(.csRetJouFrappe, .csRetJouCurseur) { animation: none; }
  .csRetDialog[open] .csRetScan,
  .csRetDialog[open] .csRetModaleCorps { animation: none; opacity: 1; }
  .csRetIBulleCorps { animation: none; }
}
`;

/**
 * Feuille CSS de la famille Retours. Rendue par chaque composant de la famille,
 * React la place une seule fois dans le document grâce à `href="console-retours"`.
 */
export function StylesRetours() {
  return (
    <style href="console-retours" precedence="ds">
      {STYLES_RETOURS}
    </style>
  );
}
