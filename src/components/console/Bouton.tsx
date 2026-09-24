/**
 * Boutons d'action du système Console.
 *
 * - `principal` : le CTA principal, plein néon. Un seul par écran.
 * - `secondaire` : la variante 1, verre et bord néon, pour l'action voisine.
 * - `tertiaire` : la variante 2, un lien d'instrument sans cadre, pour les
 *   actions de lecture (« Voir la méthode »).
 *
 * Avec `href`, le bouton est un lien ; sans, un vrai `<button>`. Aucun état
 * interne : il se rend côté serveur comme côté navigateur.
 */

import Link from "next/link";
import type { ButtonHTMLAttributes, FocusEventHandler, KeyboardEventHandler, ReactNode, Ref } from "react";

import { StylesConsole } from "./fondations";

export type VarianteBouton = "principal" | "secondaire" | "tertiaire";

interface Commun {
  children: ReactNode;
  variante?: VarianteBouton;
  taille?: "m" | "l";
  /** Flèche à droite du libellé. Présente par défaut. */
  fleche?: boolean;
  /** Action indisponible : le bouton reste visible, il ne répond plus. */
  desactive?: boolean;
  className?: string;
  /** Posés par une info-bulle ou un menu qui habille le bouton. */
  "aria-describedby"?: string;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
}

type Props =
  | (Commun & {
      href: string;
      externe?: boolean;
      ref?: Ref<HTMLAnchorElement>;
      chargement?: never;
      type?: never;
      onClick?: never;
    })
  | (Commun & {
      href?: undefined;
      externe?: never;
      /** Pour rendre le focus au bouton, à la fermeture d'une modale par exemple. */
      ref?: Ref<HTMLButtonElement>;
      /** Envoi en cours : roue à la place de la flèche, bouton inactif. */
      chargement?: boolean;
      type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    });

function Fleche() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="csBoutonFleche h-4 w-4 shrink-0">
      <path d="M3 8 H12.5 M8.5 4 L12.5 8 L8.5 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export function Bouton(props: Props) {
  const { children, variante = "principal", taille = "m", fleche = true, desactive, className = "" } = props;
  const chargement = props.href === undefined ? Boolean(props.chargement) : false;
  const inactif = desactive || chargement;
  const cadre = variante !== "tertiaire";

  const contenu = (
    <>
      <StylesConsole />
      {cadre ? (
        <>
          <span aria-hidden="true" className="csBoutonFond" />
          {variante === "secondaire" ? (
            <>
              <span aria-hidden="true" className="csBord" />
              <span aria-hidden="true" className="csDiag" data-coin="hg" />
              <span aria-hidden="true" className="csDiag" data-coin="bd" />
            </>
          ) : null}
        </>
      ) : (
        <>
          <span aria-hidden="true" className="csRepere shrink-0" />
          <span aria-hidden="true" className="csSouligne" />
        </>
      )}
      <span>{children}</span>
      {chargement ? <span aria-hidden="true" className="csRoue shrink-0" /> : fleche ? <Fleche /> : null}
    </>
  );

  const attributs = {
    className: `csBouton csCoupe ${className}`,
    "data-variante": variante,
    "data-taille": taille,
    "data-coupe": "s",
    "aria-disabled": inactif ? true : undefined,
    "aria-describedby": props["aria-describedby"],
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onKeyDown: props.onKeyDown,
  } as const;

  if (props.href !== undefined) {
    return props.externe ? (
      <a {...attributs} ref={props.ref} href={props.href} target="_blank" rel="noopener noreferrer" tabIndex={inactif ? -1 : undefined}>
        {contenu}
      </a>
    ) : (
      <Link {...attributs} ref={props.ref} href={props.href} tabIndex={inactif ? -1 : undefined}>
        {contenu}
      </Link>
    );
  }

  return (
    <button
      {...attributs}
      ref={props.ref}
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={desactive}
      aria-busy={chargement || undefined}
    >
      {contenu}
    </button>
  );
}
