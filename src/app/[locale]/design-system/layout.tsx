/**
 * Layout du design system — indexable (pas noindex).
 *
 * Sidebar de navigation entre les sections :
 * fondations (couleurs, typo, espacement) + liste des composants.
 *
 * Le layout hérite du layout locale (nav + footer).
 * Client Component : uniquement pour l'état de la sidebar sur mobile.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { COMPOSANTS } from "@/lib/design-system";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const SECTIONS_FR = [
  { libelle: "Fondations", href: "/fr/design-system" },
];

const SECTIONS_EN = [
  { libelle: "Foundations", href: "/en/design-system" },
];

export default async function DesignSystemLayout({ children, params }: Props) {
  const { locale } = await params;
  const fr = locale !== "en";
  const sections = fr ? SECTIONS_FR : SECTIONS_EN;
  const prefixe = fr ? "/fr" : "/en";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        aria-label={fr ? "Navigation du design system" : "Design system navigation"}
        className="hidden md:block w-56 shrink-0 border-r border-[var(--trait)] bg-blanc sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto"
      >
        <nav className="py-6 px-4">
          {/* Fondations */}
          <p className="type-caption text-gris mb-3">{fr ? "Fondations" : "Foundations"}</p>
          <ul role="list" className="space-y-1 mb-6">
            {sections.map((s) => (
              <li key={s.href}>
                <Link
                  href={fr ? s.href : s.href.replace("/fr/", "/en/")}
                  className="type-body block py-1 text-gris hover:text-noir focus-visible:text-noir transition-colors duration-150"
                >
                  {s.libelle}
                </Link>
              </li>
            ))}
          </ul>

          {/* Composants */}
          <p className="type-caption text-gris mb-3">{fr ? "Composants" : "Components"}</p>
          <ul role="list" className="space-y-1">
            {COMPOSANTS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`${prefixe}/design-system/composants/${c.slug}`}
                  className="type-body block py-1 text-gris hover:text-noir focus-visible:text-noir transition-colors duration-150"
                >
                  {c.nom}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
