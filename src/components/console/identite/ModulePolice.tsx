/**
 * Module fixe de choix de la police des titres de l'atelier Console (coin
 * haut droit, sous la barre). Le texte reste en Saira.
 *
 * Le choix se pose sur la racine `[data-atelier-console]` : attribut
 * `data-police` et classe de la variable CSS de la police. Il est gardé dans
 * la mémoire locale du navigateur ; sans elle (navigation privée, stockage
 * bloqué), il vaut pour la visite.
 *
 * Premier rendu identique au serveur : Saira, module replié. Le choix
 * mémorisé arrive juste après, par
 * `useSyncExternalStore`, sans écart d'hydratation.
 *
 * RGAA 4.1 : boutons natifs à `aria-pressed` (7.1), bascule à
 * `aria-expanded` (7.1), Échap replie et rend le focus à la bascule (7.3),
 * cibles de 44 px, bord allumé au focus clavier (10.7).
 *
 * "use client" : état du choix, mémoire locale, attribut posé hors de
 * l'arbre du composant.
 */

"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";

import { Panneau } from "../fondations";

export interface OptionPolice {
  id: string;
  nom: string;
  /** Classe qui définit la variable CSS de la police ; vide pour « Actuelle ». */
  variable: string;
  /** Classe qui applique la police au libellé du bouton. */
  classe: string;
}

/* Clé neuve : l'ancienne gardait le choix de la police de toute la page. */
const CLE = "isomorph-atelier-console-police-titres";
const DEFAUT = "saira";

/* ---- Choix mémorisé, partagé par toutes les instances du module ---- */

let memoire: string | null = null;
const abonnes = new Set<() => void>();

function lireChoix(): string {
  if (memoire !== null) return memoire;
  try {
    return window.localStorage.getItem(CLE) ?? DEFAUT;
  } catch {
    return DEFAUT;
  }
}

function ecrireChoix(id: string) {
  memoire = id;
  try {
    window.localStorage.setItem(CLE, id);
  } catch {
    /* Stockage indisponible : le choix vaut pour la visite. */
  }
  abonnes.forEach((prevenir) => prevenir());
}

function abonnerChoix(prevenir: () => void) {
  abonnes.add(prevenir);
  const surStockage = (e: StorageEvent) => {
    if (e.key !== CLE) return;
    memoire = null;
    prevenir();
  };
  window.addEventListener("storage", surStockage);
  return () => {
    abonnes.delete(prevenir);
    window.removeEventListener("storage", surStockage);
  };
}

/** Fond, bord et coins d'un bouton à coins coupés. */
function CadreBouton() {
  return (
    <>
      <span aria-hidden="true" className="csPolFond" />
      <span aria-hidden="true" className="csBord" />
      <span aria-hidden="true" className="csDiag" data-coin="hg" />
      <span aria-hidden="true" className="csDiag" data-coin="bd" />
    </>
  );
}

export function ModulePolice({ options }: { options: readonly OptionPolice[] }) {
  const lu = useSyncExternalStore(abonnerChoix, lireChoix, () => DEFAUT);
  const choix = options.some((o) => o.id === lu) ? lu : DEFAUT;
  /* Replié d'office, à toutes les largeurs : ouvert, il couvrirait les
     commandes des blocs qui passent dessous (zoom de la carte, mentions). */
  const [ouvert, setOuvert] = useState(false);

  const moduleRef = useRef<HTMLDivElement>(null);
  const basculeRef = useRef<HTMLButtonElement>(null);
  const idListe = useId();
  const courante = options.find((o) => o.id === choix);

  useEffect(() => {
    const racine = moduleRef.current?.closest<HTMLElement>("[data-atelier-console]");
    if (!racine) return;
    const option = options.find((o) => o.id === choix);
    const classes = option?.variable ? option.variable.split(" ").filter(Boolean) : [];
    if (classes.length > 0) racine.classList.add(...classes);
    racine.dataset.police = choix;
    return () => {
      racine.classList.remove(...classes);
      delete racine.dataset.police;
    };
  }, [choix, options]);

  function surTouche(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Escape" || !ouvert) return;
    e.stopPropagation();
    setOuvert(false);
    basculeRef.current?.focus();
  }

  return (
    <div ref={moduleRef} className="csPolFixe" data-ouvert={ouvert ? "" : undefined}>
      <Panneau coupe="s" flou className="csPolModule">
        <div className="csPolCorps" onKeyDown={surTouche}>
          <button
            ref={basculeRef}
            type="button"
            className="csPolBouton csPolBascule csCoupe"
            data-coupe="s"
            aria-expanded={ouvert}
            aria-controls={idListe}
            onClick={() => setOuvert(!ouvert)}
          >
            <CadreBouton />
            {/* Sur téléphone, la pastille garde « Aa » à l'écran et « Titres » pour les lecteurs d'écran. */}
            <span aria-hidden="true" className="csPolAa type-body text-(--cs-neon)">
              Aa
            </span>
            <span className="csPolLibelle type-caption uppercase tracking-[0.22em] text-(--cs-neon)">Titres</span>
            <span className="type-caption text-white">{courante?.nom}</span>
            <svg aria-hidden="true" className="csPolChevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4.5 6 8.5 10 4.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div id={idListe} role="group" aria-label="Police des titres" hidden={!ouvert} className="csPolListe">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`csPolBouton csPolOption csCoupe ${o.classe}`}
                data-coupe="s"
                data-option={o.id}
                aria-pressed={o.id === choix}
                onClick={() => ecrireChoix(o.id)}
              >
                <CadreBouton />
                <span aria-hidden="true" className="csPolRepere" />
                <span className="type-body truncate">{o.nom}</span>
              </button>
            ))}
          </div>
        </div>
      </Panneau>
    </div>
  );
}
