/**
 * Layout du design system Console — navigation latérale.
 *
 * Server Component : pas d'interactivité.
 * La sidebar est masquée sous 768 px (navigation par la barre principale).
 * RGAA 12.2 : nav avec aria-label.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { COMPOSANTS } from "@/lib/design-system";
import { StylesConsole } from "@/components/console/fondations";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const SECTIONS_FR = [{ libelle: "Fondations", href: "/fr/design-system" }];
const SECTIONS_EN = [{ libelle: "Foundations", href: "/en/design-system" }];

export default async function DesignSystemLayout({ children, params }: Props) {
  const { locale } = await params;
  const fr = locale !== "en";
  const sections = fr ? SECTIONS_FR : SECTIONS_EN;
  const prefixe = fr ? "/fr" : "/en";

  return (
    <>
      <StylesConsole />
      <div className="flex min-h-screen" style={{ background: "var(--cs-fond)" }}>
        {/* Sidebar */}
        <aside
          aria-label={fr ? "Navigation du design system" : "Design system navigation"}
          className="hidden md:block w-56 shrink-0 sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto"
          style={{
            borderRight: "1px solid var(--cs-trait)",
            background: "var(--cs-fond-2)",
          }}
        >
          <nav className="py-6 px-4">
            {/* Fondations */}
            <p
              className="type-caption mb-3"
              style={{ color: "var(--cs-texte-3)", letterSpacing: "0.08em" }}
            >
              {fr ? "FONDATIONS" : "FOUNDATIONS"}
            </p>
            <ul role="list" className="space-y-1 mb-6">
              {sections.map((s) => (
                <li key={s.href}>
                  <Link
                    href={fr ? s.href : s.href.replace("/fr/", "/en/")}
                    className="type-body block py-1 transition-colors duration-150"
                    style={{ color: "var(--cs-texte-2)" }}
                  >
                    {s.libelle}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Composants */}
            <p
              className="type-caption mb-3"
              style={{ color: "var(--cs-texte-3)", letterSpacing: "0.08em" }}
            >
              {fr ? "COMPOSANTS" : "COMPONENTS"}
            </p>
            <ul role="list" className="space-y-1">
              {COMPOSANTS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`${prefixe}/design-system/composants/${c.slug}`}
                    className="type-body block py-1 transition-colors duration-150"
                    style={{ color: "var(--cs-texte-2)" }}
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
    </>
  );
}
