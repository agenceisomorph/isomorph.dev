"use client";

/**
 * Onglets du système Console : motif WAI-ARIA « Tabs » complet.
 *
 * « use client » justifié : onglet choisi, navigation au clavier (flèches,
 * Début, Fin) et curseur néon qui glisse d'un onglet à l'autre.
 *
 * Rendu serveur identique au premier rendu navigateur : tous les panneaux
 * sont rendus (les autres portent `hidden`, leur texte reste dans la page),
 * et le trait sous l'onglet choisi est fixe. Au montage seulement, la
 * position de l'onglet est mesurée et le curseur glissant prend le relais ;
 * ses déplacements suivants passent par `translate` et `width`.
 *
 * RGAA et APG :
 *  - `tablist` nommée, `tab` avec `aria-selected` et `aria-controls`,
 *    `tabpanel` avec `aria-labelledby` ;
 *  - tabulation itinérante : seul l'onglet choisi est dans l'ordre de
 *    tabulation, les flèches passent d'un onglet à l'autre (en boucle),
 *    Début et Fin vont au premier et au dernier ;
 *  - activation automatique au déplacement par défaut, ou manuelle
 *    (Entrée ou Espace) quand le changement de panneau coûte cher ;
 *  - onglets de 44 px de haut, focus signalé par le trait néon et le fond ;
 *  - curseur décoratif (`aria-hidden`), l'onglet choisi est aussi en blanc.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { StylesNavigation } from "./FilAriane";

export interface Onglet {
  /** Identifiant stable, sans espace : il entre dans les `id` du DOM. */
  id: string;
  libelle: string;
  contenu: ReactNode;
}

export interface OngletsProps {
  onglets: Onglet[];
  /** Nom de la liste d'onglets, lu par les lecteurs d'écran. */
  libelle: string;
  /** Onglet choisi au départ. Premier onglet par défaut. */
  initial?: string;
  /** « automatique » : l'onglet atteint aux flèches s'affiche. « manuelle » : Entrée ou Espace. */
  activation?: "automatique" | "manuelle";
  className?: string;
}

interface Curseur {
  x: number;
  y: number;
  largeur: number;
}

export function Onglets({ onglets, libelle, initial, activation = "automatique", className = "" }: OngletsProps) {
  const base = useId();
  const [choisi, setChoisi] = useState<string | undefined>(() =>
    onglets.some((o) => o.id === initial) ? initial : onglets[0]?.id,
  );
  const [curseur, setCurseur] = useState<Curseur | null>(null);
  const [anime, setAnime] = useState(false);
  const cadreRef = useRef<HTMLDivElement>(null);
  const boutonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const indexChoisi = Math.max(0, onglets.findIndex((o) => o.id === choisi));
  const idOnglet = (id: string) => `${base}-onglet-${id}`;
  const idPanneau = (id: string) => `${base}-panneau-${id}`;

  /* Mesure de l'onglet choisi, reprise quand un onglet change de taille
     (police chargée, retour à la ligne, rotation d'écran). */
  useLayoutEffect(() => {
    const mesurer = () => {
      const bouton = boutonsRef.current[indexChoisi];
      if (!bouton) return;
      const suivant = { x: bouton.offsetLeft, y: bouton.offsetTop + bouton.offsetHeight - 2, largeur: bouton.offsetWidth };
      setCurseur((avant) =>
        avant && avant.x === suivant.x && avant.y === suivant.y && avant.largeur === suivant.largeur ? avant : suivant,
      );
    };
    mesurer();
    const observateur = new ResizeObserver(mesurer);
    if (cadreRef.current) observateur.observe(cadreRef.current);
    for (const bouton of boutonsRef.current) if (bouton) observateur.observe(bouton);
    return () => observateur.disconnect();
  }, [indexChoisi]);

  /* Le glissement ne s'active qu'après la première pose : le curseur ne part
     pas du bord gauche au chargement. */
  useEffect(() => {
    if (!curseur || anime) return;
    const id = requestAnimationFrame(() => setAnime(true));
    return () => cancelAnimationFrame(id);
  }, [curseur, anime]);

  const surTouche = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = onglets.length;
    const actuel = boutonsRef.current.findIndex((b) => b === document.activeElement);
    if (actuel < 0 || n === 0) return;
    let cible: number;
    switch (e.key) {
      case "ArrowRight":
        cible = (actuel + 1) % n;
        break;
      case "ArrowLeft":
        cible = (actuel - 1 + n) % n;
        break;
      case "Home":
        cible = 0;
        break;
      case "End":
        cible = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    boutonsRef.current[cible]?.focus();
    if (activation === "automatique") setChoisi(onglets[cible].id);
  };

  return (
    <div className={className}>
      <StylesNavigation />
      <div
        ref={cadreRef}
        className="csNavOngletsCadre"
        data-curseur={curseur ? "" : undefined}
        data-anime={anime ? "" : undefined}
      >
        <div role="tablist" aria-label={libelle} onKeyDown={surTouche} className="flex flex-wrap">
          {onglets.map((onglet, i) => {
            const selectionne = onglet.id === choisi;
            return (
              <button
                key={onglet.id}
                ref={(el) => {
                  boutonsRef.current[i] = el;
                }}
                type="button"
                role="tab"
                id={idOnglet(onglet.id)}
                aria-selected={selectionne}
                aria-controls={idPanneau(onglet.id)}
                tabIndex={selectionne ? 0 : -1}
                onClick={() => setChoisi(onglet.id)}
                className="csNavOnglet type-caption font-semibold uppercase tracking-[0.12em]"
              >
                {onglet.libelle}
              </button>
            );
          })}
        </div>
        <span
          aria-hidden="true"
          className="csNavCurseur"
          style={curseur ? { translate: `${curseur.x}px ${curseur.y}px`, width: `${curseur.largeur}px` } : undefined}
        />
      </div>

      {onglets.map((onglet) => (
        <div
          key={onglet.id}
          role="tabpanel"
          id={idPanneau(onglet.id)}
          aria-labelledby={idOnglet(onglet.id)}
          tabIndex={0}
          hidden={onglet.id !== choisi}
          className="csNavOngletPanneau pt-8"
        >
          {/* Un panneau masqué ne joue pas son animation : elle part quand il
              s'affiche, d'où le scintillement à chaque changement d'onglet. */}
          <div className="csNavFlash">{onglet.contenu}</div>
        </div>
      ))}
    </div>
  );
}
