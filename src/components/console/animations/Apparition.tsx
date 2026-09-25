"use client";

/**
 * Enveloppe des animations d'apparition au défilement.
 *
 * Client Component, justifié : IntersectionObserver, lecture des animations
 * en cours et pose impérative des attributs d'état (data-arme, data-visible,
 * data-fini) sur le nœud DOM.
 *
 * Rendu serveur identique au premier rendu navigateur : la variante est
 * rendue en attributs, l'armement est posé après hydratation (useEffect).
 *
 * Cycle : armé (état de départ masqué), visible (la chorégraphie joue), fini
 * (le bloc retrouve son état normal). Le passage à « fini » attend la fin
 * réelle de chaque animation et de chaque compteur, sans durée figée.
 *
 * Mouvement réduit : rien n'est armé, et une préférence activée en cours de
 * route termine aussitôt l'animation (RGAA 4.1.2, critère 13.8).
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

import { CATALOGUE, type BlocAnimable } from "./catalogue";
import { lancerCompteur, type Compteur } from "./compteur";
import { StylesApparition } from "./styles";

export interface ApparitionHandle {
  /** Rejoue l'animation depuis le début. */
  rejouer: () => void;
}

interface ApparitionProps {
  bloc: BlocAnimable;
  /** Identifiant d'une variante du bloc (catalogue.ts). */
  variante: string;
  children: ReactNode;
  className?: string;
}

/** Couches d'un panneau : ni du texte, ni un élément de la séquence. */
const STRUCTURE = /\bcs(Verre|Bord|Diag|Equerre|Trace)\b/;

/** Filet de sécurité si le navigateur ne fait pas avancer les animations. */
const SECOURS = 6000;

const REDUIT = "(prefers-reduced-motion: reduce)";

/**
 * Numérote les éléments de la séquence (--app-n, visibles seulement) et
 * découpe les blocs de texte en lignes (data-app-u, --app-i plafonné à 8).
 * Relancé à chaque lecture : la mise en page change avec la largeur.
 */
function poserIndices(el: HTMLElement, sequence: string | undefined) {
  el.querySelectorAll<HTMLElement>("[data-app-u]").forEach((n) => n.removeAttribute("data-app-u"));

  let total = 0;
  if (sequence) {
    el.querySelectorAll<HTMLElement>(sequence).forEach((n) => {
      if (n.getClientRects().length === 0) return;
      n.style.setProperty("--app-n", String(total));
      total += 1;
    });
  }
  el.style.setProperty("--app-total", String(total));

  const unites: HTMLElement[] = [];
  el.querySelectorAll<HTMLElement>('[data-app="texte"]').forEach((bloc) => {
    const enfants = (Array.from(bloc.children) as HTMLElement[]).filter(
      (n) =>
        n.tagName.toLowerCase() !== "svg" &&
        !STRUCTURE.test(n.getAttribute("class") ?? "") &&
        !(sequence && (n.matches(sequence) || n.querySelector(sequence))),
    );
    if (enfants.length > 0) unites.push(...enfants);
    else if (bloc.children.length === 0) unites.push(bloc);
  });
  unites.forEach((n, i) => {
    n.setAttribute("data-app-u", "");
    n.style.setProperty("--app-i", String(Math.min(i, 8)));
  });
}

export const Apparition = forwardRef<ApparitionHandle, ApparitionProps>(function Apparition(
  { bloc, variante, children, className = "" },
  ref,
) {
  const elRef = useRef<HTMLDivElement>(null);
  const monteRef = useRef(false);
  /* Numéro de lecture : une lecture remplacée ne termine jamais la suivante. */
  const lectureRef = useRef(0);
  const secoursRef = useRef<number | undefined>(undefined);
  const compteursRef = useRef<Compteur[]>([]);

  const definition = CATALOGUE[bloc];
  const choix = definition.variantes.find((v) => v.id === variante) ?? definition.variantes[0];

  /* Lu dans les effets sans les relancer. */
  const choixRef = useRef(choix);
  choixRef.current = choix;

  const arreterCompteurs = () => {
    compteursRef.current.forEach((c) => c.arreter());
    compteursRef.current = [];
  };

  const lancer = (el: HTMLElement) => {
    const lecture = ++lectureRef.current;
    window.clearTimeout(secoursRef.current);
    arreterCompteurs();

    el.removeAttribute("data-fini");
    el.removeAttribute("data-visible");
    poserIndices(el, definition.sequence);
    /* Reflow : les animations CSS repartent de zéro. */
    void el.offsetWidth;
    el.setAttribute("data-visible", "");

    const { compteur } = choixRef.current;
    if (compteur) {
      compteursRef.current = Array.from(el.querySelectorAll<HTMLElement>(compteur))
        .filter((n) => n.getClientRects().length > 0)
        .map((n, i) => lancerCompteur(n, 250 + i * 110, 1300));
    }

    const finir = () => {
      if (lecture !== lectureRef.current) return;
      window.clearTimeout(secoursRef.current);
      arreterCompteurs();
      el.setAttribute("data-fini", "");
    };

    const animations = el
      .getAnimations({ subtree: true })
      .filter((a): a is CSSAnimation => a instanceof CSSAnimation && a.animationName.startsWith("app"));

    Promise.all([...animations.map((a) => a.finished), ...compteursRef.current.map((c) => c.fini)]).then(
      finir,
      /* Animation annulée : une nouvelle lecture a pris la main. */
      () => {},
    );
    secoursRef.current = window.setTimeout(finir, SECOURS);
  };

  useImperativeHandle(ref, () => ({
    rejouer() {
      const el = elRef.current;
      if (!el || !el.hasAttribute("data-arme")) return;
      lancer(el);
    },
  }));

  /* Armement et déclenchement à l'entrée dans l'écran (montage seulement). */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduit = window.matchMedia(REDUIT);
    if (reduit.matches) return;

    poserIndices(el, definition.sequence);
    el.setAttribute("data-arme", "");

    const obs = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          lancer(el);
          obs.unobserve(el);
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);

    const surPreference = () => {
      if (!reduit.matches) return;
      lectureRef.current += 1;
      window.clearTimeout(secoursRef.current);
      arreterCompteurs();
      el.setAttribute("data-fini", "");
    };
    reduit.addEventListener("change", surPreference);

    return () => {
      obs.disconnect();
      reduit.removeEventListener("change", surPreference);
      lectureRef.current += 1;
      window.clearTimeout(secoursRef.current);
      arreterCompteurs();
      el.removeAttribute("data-arme");
      el.removeAttribute("data-visible");
      el.removeAttribute("data-fini");
    };
    // Montage seulement : la variante se relit par choixRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Changement de variante : rejouer si le bloc a déjà été vu. */
  useEffect(() => {
    if (!monteRef.current) {
      monteRef.current = true;
      return;
    }
    const el = elRef.current;
    if (!el || !el.hasAttribute("data-arme") || !el.hasAttribute("data-visible")) return;
    lancer(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variante]);

  const style = choix.t0 !== undefined ? ({ "--app-t0": `${choix.t0}ms` } as CSSProperties) : undefined;

  return (
    <div
      ref={elRef}
      data-bloc={bloc}
      data-variante={choix.id}
      data-img={choix.image}
      data-txt={choix.texte}
      className={className}
      style={style}
    >
      <StylesApparition />
      {children}
    </div>
  );
});
