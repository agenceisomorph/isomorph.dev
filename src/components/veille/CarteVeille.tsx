/**
 * Carte résumant une édition de veille dans la liste `/veille`.
 *
 * Panneau de verre du système Console, sans image (les éditions de veille
 * n'en ont pas). Le lien couvre toute la carte ; le titre visible suffit à
 * l'identifier au clavier et au lecteur d'écran (RGAA 6.1).
 *
 * RGAA 4.1 :
 *   - Critère 13.1 : <time datetime> pour la date de publication.
 *   - Critère 10.7 : focus clavier = tracé néon, identique au survol (Trace).
 * Éco : Server Component, aucune image à charger.
 */

import type { EditionVeille } from "@/lib/veille";
import { Link } from "@/i18n/navigation";
import { StylesConsole, Trace } from "../console/fondations";
import { Niveau } from "./Niveau";

const LIBELLES_TYPE: Record<EditionVeille["type"], { fr: string; en: string }> = {
  quotidienne: { fr: "Quotidienne", en: "Daily" },
  hebdomadaire: { fr: "Hebdomadaire", en: "Weekly" },
};

export function CarteVeille({
  edition,
  locale = "fr",
}: {
  edition: EditionVeille;
  locale?: string;
}) {
  const dateAffichee = new Date(edition.date).toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <Link
      href={`/veille/${edition.slug}`}
      className="csPanneau csCoupe csTracable flex h-full flex-col gap-3 p-5 no-underline"
      data-coupe="m"
    >
      <StylesConsole />
      <span aria-hidden="true" className="csVerre" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
      <Trace />

      <div className="flex flex-wrap items-center gap-2">
        <Niveau niveau={edition.niveau} locale={locale} />
      </div>

      <h3 className="type-h3 text-white">{edition.titre}</h3>
      <p className="type-body flex-1 text-(--cs-texte-2)">{edition.resume}</p>

      <div className="mt-2 flex items-center justify-between border-t border-(--cs-trait) pt-3">
        <time dateTime={edition.date} className="type-caption text-(--cs-texte-3)">
          {dateAffichee}
        </time>
        <span className="type-caption uppercase tracking-[0.1em] text-(--cs-texte-3)">
          {LIBELLES_TYPE[edition.type][locale === "en" ? "en" : "fr"]}
        </span>
      </div>
    </Link>
  );
}
