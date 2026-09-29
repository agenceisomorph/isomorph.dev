/**
 * Aperçu vivant — Lien.
 * Variantes : inline, navigation (type-caption), externe.
 */

import Link from "next/link";

interface Props { fr: boolean; }

export default function ApercuLien({ fr }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body text-noir max-w-md">
        {fr
          ? <>Exemple de <Link href="/fr/plugins" className="underline hover:no-underline focus-visible:no-underline transition-all">lien inline</Link> dans un paragraphe.</>
          : <>Example of an <Link href="/en/plugins" className="underline hover:no-underline focus-visible:no-underline transition-all">inline link</Link> in a paragraph.</>
        }
      </p>

      <Link
        href="/fr/design-system"
        className="type-caption text-gris hover:text-noir focus-visible:text-noir transition-colors duration-150"
      >
        {fr ? "Lien de navigation" : "Navigation link"}
      </Link>

      <a
        href="https://github.com/agenceisomorph"
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption text-gris hover:text-noir focus-visible:text-noir transition-colors duration-150 flex items-center gap-1"
      >
        {fr ? "Lien externe" : "External link"}
        <span className="sr-only">{fr ? "(ouvre dans un nouvel onglet)" : "(opens in new tab)"}</span>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </a>
    </div>
  );
}
