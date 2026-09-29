/**
 * Gabarit de fiche composant — design system ISOMORPH.
 *
 * Structure réutilisable : aperçu vivant (slot), variantes, états, props, code, RGAA.
 * Pour documenter un nouveau composant : créer un fichier de données dans
 * src/lib/design-system.ts et passer les données à ce gabarit.
 *
 * Server Component : pas d'interactivité propre.
 * RGAA 9.1 : structure de titres cohérente (h1 dans la page parente).
 * Éco : aucun client bundle, code affiché en <pre> natif.
 */

import type { ReactNode } from "react";
import type { ComposantDS, Variante, EtatComposant, PropComposant } from "@/lib/design-system";

/* ------------------------------------------------------------------ */
/* Blocs de section                                                    */
/* ------------------------------------------------------------------ */

function BlocSection({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--trait)] pt-8 mt-8">
      <h2 className="type-h3 text-noir mb-6">{titre}</h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu vivant                                                       */
/* ------------------------------------------------------------------ */

interface ApercuProps {
  /** Rendu vivant du composant (slot fourni par la page) */
  children: ReactNode;
  fr: boolean;
}

export function ApercuComposant({ children, fr }: ApercuProps) {
  return (
    <section>
      <h2 className="type-h3 text-noir mb-4">{fr ? "Aperçu" : "Preview"}</h2>
      <div className="border border-[var(--trait)] p-8 bg-gris-clair flex flex-wrap gap-4 items-start">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Variantes                                                           */
/* ------------------------------------------------------------------ */

function TableauVariantes({ variantes, fr }: { variantes: Variante[]; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "Variantes" : "Variants"}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--trait)]">
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Identifiant" : "ID"}</th>
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Libellé" : "Label"}</th>
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Description" : "Description"}</th>
              <th className="type-caption text-gris py-2">{fr ? "Classe / prop" : "Class / prop"}</th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((v) => (
              <tr key={v.id} className="border-b border-[var(--trait)] align-top">
                <td className="type-caption text-noir py-3 pr-6 font-semibold">{v.id}</td>
                <td className="type-body text-noir py-3 pr-6">{v.libelle}</td>
                <td className="type-body text-gris py-3 pr-6">{v.description}</td>
                <td className="py-3">
                  <code className="type-caption bg-gris-clair text-noir px-2 py-0.5">{v.classeOuProp}</code>
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
            <tr className="border-b border-[var(--trait)]">
              <th className="type-caption text-gris py-2 pr-6">{fr ? "État" : "State"}</th>
              <th className="type-caption text-gris py-2">{fr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            {etats.map((e) => (
              <tr key={e.id} className="border-b border-[var(--trait)] align-top">
                <td className="type-caption text-noir py-3 pr-6 font-semibold">{e.libelle}</td>
                <td className="type-body text-gris py-3">{e.description}</td>
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
            <tr className="border-b border-[var(--trait)]">
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Nom" : "Name"}</th>
              <th className="type-caption text-gris py-2 pr-6">Type</th>
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Défaut" : "Default"}</th>
              <th className="type-caption text-gris py-2 pr-6">{fr ? "Requis" : "Required"}</th>
              <th className="type-caption text-gris py-2">{fr ? "Description" : "Description"}</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.nom} className="border-b border-[var(--trait)] align-top">
                <td className="py-3 pr-6">
                  <code className="type-caption bg-gris-clair text-noir px-2 py-0.5">{p.nom}</code>
                </td>
                <td className="py-3 pr-6">
                  <code className="type-caption text-gris">{p.type}</code>
                </td>
                <td className="type-caption text-gris py-3 pr-6">
                  {p.defaut ?? <span className="opacity-30">—</span>}
                </td>
                <td className="type-caption py-3 pr-6">
                  {p.requis ? (
                    <span className="bg-noir text-blanc px-1.5 py-0.5">OUI</span>
                  ) : (
                    <span className="text-gris opacity-50">non</span>
                  )}
                </td>
                <td className="type-body text-gris py-3">{p.description}</td>
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

function BlocCode({ code, fr }: { code: string; fr: boolean }) {
  return (
    <BlocSection titre={fr ? "Code" : "Code"}>
      <div className="relative">
        <pre className="type-caption bg-noir text-blanc p-6 overflow-x-auto leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
        {/* Le bouton de copie est côté serveur : la copie réelle nécessite un îlot client */}
        <CopierCode code={code} fr={fr} />
      </div>
    </BlocSection>
  );
}

/* ------------------------------------------------------------------ */
/* Bouton copier — Client Component minimal                            */
/* ------------------------------------------------------------------ */

import BoutonCopier from "@/components/ds/BoutonCopier";

function CopierCode({ code, fr }: { code: string; fr: boolean }) {
  return (
    <div className="absolute top-3 right-3">
      <BoutonCopier code={code} fr={fr} />
    </div>
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
          <li key={i} className="type-body text-gris flex gap-3">
            <span aria-hidden="true" className="shrink-0 text-noir">—</span>
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
  /** Rendu vivant du composant */
  apercu: ReactNode;
  fr: boolean;
}

export default function GabariComposant({ composant, apercu, fr }: GabariComposantProps) {
  return (
    <article className="mx-auto max-w-[1280px] px-4 md:px-6 xl:px-8 py-12">
      {/* En-tête */}
      <header className="mb-8">
        <h1 className="type-h1 text-noir mb-3">{composant.nom}</h1>
        <p className="type-lead text-gris max-w-2xl">{composant.description}</p>
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
  );
}
