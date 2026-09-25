/**
 * Planche « Liens » : l'effet retenu (crochets « Tension »), sur un lien de
 * pied de page et sur un lien pris dans une phrase, les deux seuls endroits
 * où il s'applique.
 *
 * Libellés repris du pied de page ; phrase reprise de l'article d'essai
 * (`atelier/console/article`).
 */

import Link from "next/link";

import { StylesLiens } from "../liens";
import { Planche } from "./kit";

const CLASSE_LIEN = "csLien type-caption block w-fit text-(--cs-texte-2) transition-colors hover:text-white focus-visible:text-white";

export function PlancheLiens() {
  return (
    <Planche nom="Liens">
      <StylesLiens />

      <div className="grid gap-10 md:grid-cols-2">
        <nav aria-label="Exemple de pied de page">
          <p className="type-caption mb-3 uppercase tracking-[0.1em] text-(--cs-texte-3)">Agence</p>
          <ul role="list" className="space-y-2">
            <li>
              <Link href="/agence" className={CLASSE_LIEN}>
                L&apos;agence
              </Link>
            </li>
            <li>
              <Link href="/methode" className={CLASSE_LIEN}>
                Méthode
              </Link>
            </li>
          </ul>
        </nav>

        <p className="type-body text-(--cs-texte-2)">
          Le détail est public sur la page{" "}
          <a
            href="https://www.scaleway.com/en/environmental-leadership/"
            target="_blank"
            rel="noopener noreferrer"
            className="csLien csLienTexte text-(--cs-neon)"
          >
            Environmental leadership de Scaleway
          </a>
          .
        </p>
      </div>
    </Planche>
  );
}
