/**
 * Gabarit de fiche composant — design system Console ISOMORPH.
 *
 * Structure réutilisable : aperçu vivant (slot), variantes, états, props, code, RGAA.
 * Pour documenter un nouveau composant : ajouter une entrée dans src/lib/design-system.ts
 * et brancher ce gabarit.
 *
 * Server Component : pas d'interactivité propre.
 * RGAA 9.1 : structure de titres cohérente (h1 sur chaque fiche).
 * Éco : aucun bundle client, code affiché en <pre> natif.
 */

import type { ReactNode } from "react";
import type { ComposantDS, Variante, EtatComposant, PropComposant } from "@/lib/design-system";
import { StylesConsole } from "@/components/console/fondations";

/* ------------------------------------------------------------------ */
/* Blocs de section                                                    */
/* ------------------------------------------------------------------ */

function BlocSection({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section
      className="pt-8 mt-8"
      style={{ borderTop: "1px solid var(--cs-trait)" }}
    >
      <h2
        className="type-h3 mb-6"
        style={{ color: "var(--cs-texte)" }}
      >
        {titre}
      </h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu vivant                                                       */
/* ------------------------------------------------------------------ */

interface ApercuProps {
  children: ReactNode;
  fr: boolean;
}

export function ApercuComposant({ children, fr }: ApercuProps) {
  return (
    <section>
      <h2 className="type-h3 mb-4" style={{ color: "var(--cs-texte)" }}>
        {fr ? "Aperçu" : "Preview"}
      </h2>
      <div
        className="p-8 flex flex-wrap gap-4 items-start"
        style={{
          background: "var(--cs-fond-2)",
          border: "1px solid var(--cs-trait)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Styles partagés des tableaux                                        */
/* ------------------------------------------------------------------ */

const STYLE_TH: React.CSSProperties = { color: "var(--cs-texte-3)" };
const STYLE_TD_PRIMARY: React.CSSProperties = { color: "var(--cs-texte)", fontWeight: 600 };
const STYLE_TD: React.CSSProperties = { color: "var(--cs-texte-2)" };

/* ------------------------------------------------------------------ */
/* Variantes                                                           */
/* ------------------------------------------------------------------ */

function TableauVariantes({ variantes, fr }: { variantes: Variante[]; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "Variantes" : "Variants"}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-trait)" }}>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Identifiant" : "ID"}</th>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Libellé" : "Label"}</th>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Description" : "Description"}</th>
              <th className="type-caption py-2" style={STYLE_TH}>{fr ? "Prop" : "Prop"}</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((v) => (
              <tr key={v.id} style={{ borderBottom: "1px solid var(--cs-trait)" }} className="align-top">
                <td className="type-caption py-3 pr-6" style={STYLE_TD_PRIMARY}>{v.id}</td>
                <td className="type-body py-3 pr-6" style={STYLE_TD}>{v.libelle}</td>
                <td className="type-body py-3 pr-6" style={STYLE_TD}>{v.description}</td>
                <td className="py-3">
                  <code
                    className="type-caption px-2 py-0.5"
                    style={{
                      background: "var(--cs-surface)",
                      color: "var(--cs-neon)",
                      borderRadius: "3px",
                      fontFamily: "var(--font-geist-mono, monospace)",
                    }}
                  >
                    {v.classeOuProp}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* États                                                               */
/* ------------------------------------------------------------------ */

function TableauEtats({ etats, fr }: { etats: EtatComposant[]; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "États" : "States"}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-trait)" }}>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "État" : "State"}</th>
              <th className="type-caption py-2" style={STYLE_TH}>{fr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            {etats.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--cs-trait)" }} className="align-top">
                <td className="type-caption py-3 pr-6" style={STYLE_TD_PRIMARY}>{e.libelle}</td>
                <td className="type-body py-3" style={STYLE_TD}>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

function TableauProps({ props, fr }: { props: PropComposant[]; fr: boolean }) {
  return (
    <BlocSection titre="Props">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-trait)" }}>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Nom" : "Name"}</th>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>Type</th>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Défaut" : "Default"}</th>
              <th className="type-caption py-2 pr-6" style={STYLE_TH}>{fr ? "Requis" : "Required"}</th>
              <th className="type-caption py-2" style={STYLE_TH}>{fr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.nom} style={{ borderBottom: "1px solid var(--cs-trait)" }} className="align-top">
                <td className="py-3 pr-6">
                  <code
                    className="type-caption px-2 py-0.5"
                    style={{
                      background: "var(--cs-surface)",
                      color: "var(--cs-neon)",
                      borderRadius: "3px",
                      fontFamily: "var(--font-geist-mono, monospace)",
                    }}
                  >
                    {p.nom}
                  </code>
                </td>
                <td className="py-3 pr-6">
                  <code
                    className="type-caption"
                    style={{ color: "var(--cs-texte-3)", fontFamily: "var(--font-geist-mono, monospace)" }}
                  >
                    {p.type}
                  </code>
                </td>
                <td className="type-caption py-3 pr-6" style={{ color: "var(--cs-texte-3)" }}>
                  {p.defaut ?? <span style={{ opacity: 0.3 }}>—</span>}
                </td>
                <td className="type-caption py-3 pr-6">
                  {p.requis ? (
                    <span
                      className="px-1.5 py-0.5"
                      style={{
                        background: "rgba(125,211,252,0.12)",
                        color: "var(--cs-neon)",
                        borderRadius: "3px",
                        fontSize: "11px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      OUI
                    </span>
                  ) : (
                    <span style={{ color: "var(--cs-texte-3)", opacity: 0.5 }}>non</span>
                  )}
                </td>
                <td className="type-body py-3" style={STYLE_TD}>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* Bloc de code                                                        */
/* ------------------------------------------------------------------ */

import BoutonCopier from "@/components/ds/BoutonCopier";

function BlocCode({ code, fr }: { code: string; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "Code" : "Code"}>
      <div className="relative">
        <pre
          className="type-caption p-6 overflow-x-auto leading-relaxed whitespace-pre"
          style={{
            background: "rgba(2,4,10,0.92)",
            border: "1px solid var(--cs-trait)",
            color: "var(--cs-texte-2)",
            fontFamily: "var(--font-geist-mono, monospace)",
          }}
        >
          <code>{code}</code>
        </pre>
        <div className="absolute top-3 right-3">
          <BoutonCopier code={code} />
        </div>
      </div>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* RGAA                                                                */
/* ------------------------------------------------------------------ */

function BlocRgaa({ regles, fr }: { regles: string[]; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "Accessibilité (RGAA 4.1)" : "Accessibility (RGAA 4.1)"}>
      <ul role="list" className="space-y-2">
        {regles.map((r, i) => (
          <li key={i} className="type-body flex gap-3" style={{ color: "var(--cs-texte-2)" }}>
            <span
              aria-hidden="true"
              className="shrink-0"
              style={{ color: "var(--cs-neon)" }}
            >
              —
            </span>
            {r}
          </li>
        ))}
      </ul>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* Gabarit complet                                                     */
/* ------------------------------------------------------------------ */

interface GabariComposantProps {
  composant: ComposantDS;
  apercu: ReactNode;
  fr: boolean;
}

export default function GabariComposant({ composant, apercu, fr }: GabariComposantProps) {
  return (
    <>
      <StylesConsole />
      <article
        className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-8 py-12"
        style={{ color: "var(--cs-texte)" }}
      >
        {/* En-tête */}
        <header className="mb-8">
          <h1 className="type-h1 mb-3" style={{ color: "var(--cs-texte)" }}>
            {composant.nom}
          </h1>
          <p className="type-lead max-w-2xl" style={{ color: "var(--cs-texte-2)" }}>
            {composant.description}
          </p>
        </header>

        {/* Aperçu vivant */}
        <ApercuComposant fr={fr}>{apercu}</ApercuComposant>

        {/* Documentation */}
        <TableauVariantes variantes={composant.variantes} fr={fr} />
        <TableauEtats etats={composant.etats} fr={fr} />
        <TableauProps props={composant.props} fr={fr} />
        <BlocCode code={composant.codeExemple} fr={fr} />
        <BlocRgaa regles={composant.rgaa} fr={fr} />
      </article>
    </>
  );
}
