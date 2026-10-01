/**
 * Aperçu vivant — composant Panneau Console (surface de verre).
 *
 * Montre les deux variantes (standard et avec flou) et la coupe de coin.
 * Server Component.
 */

import { Panneau, StylesConsole } from "@/components/console/fondations";

export default function ApercuCarte() {
  return (
    <>
      <StylesConsole />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Panneau coupe="m">
          <div className="p-5 flex flex-col gap-2">
            <p className="type-h3" style={{ color: "var(--cs-texte)" }}>
              Standard
            </p>
            <p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
              Surface de verre, coupe m (16 px).
            </p>
          </div>
        </Panneau>
        <Panneau coupe="m" flou accent>
          <div className="p-5 flex flex-col gap-2">
            <p className="type-h3" style={{ color: "var(--cs-texte)" }}>
              Avec flou
            </p>
            <p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
              backdrop-blur activé, bord néon accent.
            </p>
          </div>
        </Panneau>
        <Panneau coupe="s">
          <div className="p-4">
            <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
              Coupe s — compacte (10 px), pour les badges et étiquettes.
            </p>
          </div>
        </Panneau>
        <Panneau coupe="l">
          <div className="p-5">
            <p className="type-caption" style={{ color: "var(--cs-texte-3)" }}>
              Coupe l — grande (22 px), pour les sections héros.
            </p>
          </div>
        </Panneau>
      </div>
    </>
  );
}
