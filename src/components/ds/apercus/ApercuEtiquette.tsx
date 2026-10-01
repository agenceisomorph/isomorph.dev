/**
 * Aperçu vivant — Navigation Console.
 *
 * Montre les éléments de navigation du système Console : barre de verre,
 * liens avec crochets néon au survol, sélecteur de langue.
 * Server Component.
 */

import { Etiquette, StylesConsole } from "@/components/console/fondations";

export default function ApercuEtiquette() {
  return (
    <>
      <StylesConsole />
      <div className="flex flex-col gap-6">
        {/* Barre de navigation simulée */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-sm"
          style={{
            background: "var(--cs-surface)",
            border: "1px solid var(--cs-trait)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="type-caption" style={{ color: "var(--cs-neon)", letterSpacing: "0.1em" }}>
            ISOMORPH.DEV
          </span>
          <nav aria-label="Prévisualisation navigation" className="flex items-center gap-5">
            {["Plugins", "Code", "Expérimentations", "Veille", "Design system"].map((item) => (
              <a
                key={item}
                href="#"
                className="csLien type-caption"
                style={{ color: "var(--cs-texte-2)" }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Étiquettes */}
        <div className="flex flex-wrap gap-2">
          <Etiquette>Open source</Etiquette>
          <Etiquette>Strapi v5</Etiquette>
          <Etiquette index={1}>Plugin</Etiquette>
          <Etiquette index={2}>TypeScript</Etiquette>
        </div>
      </div>
    </>
  );
}
