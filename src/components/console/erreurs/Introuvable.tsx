"use client";

/**
 * Page 404, dessin « Journal » retenu le 24 septembre 2026 : ligne de terminal tapée, requête vers
 * l'adresse demandée, réponse 404, dans l'esprit du dessin « Journal » de la
 * notification Console.
 *
 * Arbitrages :
 * - RGAA 4.1, critère 13.8 : curseur limité à 3 clignotements. Les lignes
 *   tapées sont aria-hidden ; le contenu est porté par le h1 et le paragraphe.
 * - RGAA 4.1, critère 1.2 : aucune information portée par la seule animation.
 * - Éco : animation CSS pure, aucun canvas.
 * - Perf : "use client" pour lire l'adresse demandée.
 * - Sécu : chemin affiché tel que fourni par le routeur Next.js, jamais injecté dans
 *   du HTML brut ni dans eval.
 */

import type { CSSProperties } from "react";

import { useCheminNavigateur } from "./cheminNavigateur";
import { Bouton } from "../Bouton";
import { Panneau, StylesConsole } from "../fondations";

/** Durée par caractère, en ms. Cohérente avec la Notification « Journal ». */
const MS_PAR_CAR = 28;
/** Délai initial avant la frappe, en ms. */
const DELAI_INIT = 120;
/** Pause entre la fin de la ligne 1 et le début de la ligne 2, en ms. */
const PAUSE_INTER = 320;

const STYLES_V3 = `
/* Introuvable3, "Journal" ------------------------------------------ */
.csErr404V3Panneau {
  position: relative;
  width: 100%;
  max-width: 540px;
}
.csErr404V3Terminal {
  padding: 20px 24px 28px;
}
.csErr404V3Fond {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: #02060d;
  background-image: repeating-linear-gradient(
    180deg,
    rgba(125, 211, 252, 0.03) 0 1px,
    transparent 1px 3px
  );
}
.csErr404V3Ligue {
  display: flex;
  align-items: center;
  min-height: 26px;
  white-space: pre;
  overflow: hidden;
  font-family: var(--font-geist-mono, ui-monospace, monospace);
}
.csErr404V3Ligue[data-type="requete"] { color: var(--cs-neon); }
.csErr404V3Ligue[data-type="reponse"] { color: var(--cs-erreur); }
.csErr404V3Frappe {
  display: inline-block;
  overflow: hidden;
  width: calc(var(--csJou3Car) * 1ch);
  animation: csErr404Frappe3
    calc(var(--csJou3Car) * ${MS_PAR_CAR}ms)
    steps(var(--csJou3Car), end)
    var(--csJou3Delai, ${DELAI_INIT}ms)
    both;
}
@keyframes csErr404Frappe3 { from { width: 0; } }
.csErr404V3Curseur {
  display: inline-block;
  width: 0.55em;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: middle;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  animation: csErr404Clignote3
    900ms
    step-end
    calc(var(--csJou3Car) * ${MS_PAR_CAR}ms + var(--csJou3Delai, ${DELAI_INIT}ms))
    3;
}
@keyframes csErr404Clignote3 { 50% { opacity: 0; } }
.csErr404V3Separateur {
  height: 1px;
  background: var(--cs-neon-doux);
  margin: 16px 0;
}
@media (prefers-reduced-motion: reduce) {
  .csErr404V3Frappe  { animation: none; width: auto; }
  .csErr404V3Curseur { animation: none; opacity: 0; }
}
`;

export function Introuvable() {
  const chemin = useCheminNavigateur();

  // Une ligne tapée ne passe pas à la ligne : l'adresse longue garde sa fin, qui la distingue.
  const cheminCourt = chemin.length > 24 ? `…${chemin.slice(-23)}` : chemin;
  const ligne1 = `> GET ${cheminCourt}`;
  const ligne2 = `< 404`;
  const delai2 = DELAI_INIT + ligne1.length * MS_PAR_CAR + PAUSE_INTER;

  return (
    <section
      className="min-h-[calc(100dvh-64px)] bg-(--cs-fond) relative overflow-hidden flex items-center justify-center py-20"
      aria-labelledby="err404v3-titre"
    >
      <StylesConsole />
      <style href="csErr404-journal" precedence="ds">{STYLES_V3}</style>

      <div className="mx-auto max-w-[1280px] px-6 md:px-12 w-full flex justify-center">
        <Panneau accent equerres flou coupe="l" className="csErr404V3Panneau">
          {/* Fond scanlines du terminal */}
          <span aria-hidden="true" className="csErr404V3Fond" />

          <div className="csErr404V3Terminal">
            {/* Lignes tapées, purement visuelles */}
            {/* Clé : la frappe repart une fois l'adresse connue. */}
            <div aria-hidden="true" key={chemin}>
              {/* Ligne 1 : requête */}
              <p
                className="csErr404V3Ligue"
                data-type="requete"
              >
                <span
                  className="csErr404V3Frappe"
                  style={{
                    "--csJou3Car": ligne1.length,
                    "--csJou3Delai": `${DELAI_INIT}ms`,
                  } as CSSProperties}
                >
                  {ligne1}
                </span>
                <span className="csErr404V3Curseur"
                  style={{
                    "--csJou3Car": ligne1.length,
                    "--csJou3Delai": `${DELAI_INIT}ms`,
                  } as CSSProperties}
                />
              </p>

              {/* Ligne 2 : réponse */}
              <p
                className="csErr404V3Ligue mt-1"
                data-type="reponse"
              >
                <span
                  className="csErr404V3Frappe"
                  style={{
                    "--csJou3Car": ligne2.length,
                    "--csJou3Delai": `${delai2}ms`,
                  } as CSSProperties}
                >
                  {ligne2}
                </span>
                <span
                  className="csErr404V3Curseur"
                  style={{
                    "--csJou3Car": ligne2.length,
                    "--csJou3Delai": `${delai2}ms`,
                  } as CSSProperties}
                />
              </p>
            </div>

            <div aria-hidden="true" className="csErr404V3Separateur" />

            {/* Contenu accessible */}
            <h1
              id="err404v3-titre"
              className="type-h3 text-(--cs-texte) mb-3"
            >
              Page introuvable
            </h1>
            <p className="type-body text-(--cs-texte-2) mb-8">
              Cette adresse ne mène à aucune page.
            </p>

            <div className="flex flex-wrap gap-4">
              <Bouton href="/" variante="principal">{"Retour à l'accueil"}</Bouton>
              <Bouton href="/contact" variante="tertiaire">Nous contacter</Bouton>
            </div>
          </div>
        </Panneau>
      </div>
    </section>
  );
}
