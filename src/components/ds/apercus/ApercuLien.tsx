/**
 * Aperçu vivant — liens texte Console (variante « Tension »).
 *
 * Les classes csLien/csLienTexte sont injectées par StylesLiens (inclus dans
 * StylesConsole via fondations.tsx). Server Component.
 */

import { StylesConsole } from "@/components/console/fondations";

export default function ApercuLien() {
  return (
    <>
      <StylesConsole />
      <div className="flex flex-col gap-5">
        <p className="type-body" style={{ color: "var(--cs-texte-2)" }}>
          Le plugin{" "}
          <a href="#" className="csLien csLienTexte" style={{ color: "var(--cs-neon)" }}>
            Custom Field Link
          </a>{" "}
          résout un seul champ pour tous les types de destinations.
        </p>
        <div className="flex flex-wrap gap-5">
          <a
            href="#"
            className="csLien type-caption block"
            style={{ color: "var(--cs-texte-2)" }}
          >
            Documentation
          </a>
          <a
            href="#"
            className="csLien type-caption block"
            style={{ color: "var(--cs-texte-2)" }}
          >
            GitHub
          </a>
          <a
            href="#"
            className="csLien type-caption block"
            style={{ color: "var(--cs-texte-2)" }}
          >
            npm
          </a>
        </div>
      </div>
    </>
  );
}
