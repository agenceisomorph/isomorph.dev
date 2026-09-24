"use client";

/**
 * Liste déroulante personnalisée du système Console.
 * Jamais de <select> natif : motif listbox WAI-ARIA complet.
 *
 * RGAA 11.1 : libellé relié au trigger via aria-labelledby.
 * RGAA 11.9 : mention « obligatoire » écrite.
 * RGAA 11.10 : erreur reliée par aria-describedby + aria-invalid.
 *
 * Clavier (WAI-ARIA Authoring Practices 1.1, Listbox pattern) :
 *   ArrowDown / ArrowUp : déplacer l'option active
 *   Home / End : première / dernière option
 *   Entrée : sélectionner et fermer
 *   Échap : fermer sans sélectionner
 *   Lettre : type-ahead : première option dont le libellé
 *                          commence par la lettre tapée
 * Fermeture : clic en dehors ou perte de focus hors composant.
 * Valeur de formulaire : champ caché <input type="hidden"> nommé.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { StylesConsole } from "../fondations";
import { StylesFormulaires } from "./_styles";

export interface OptionListe {
  valeur: string;
  libelle: string;
}

export interface ListeProps {
  id?: string;
  libelle: string;
  options: OptionListe[];
  /** Valeur courante (composant contrôlé). */
  valeur: string;
  onChange: (valeur: string) => void;
  obligatoire?: boolean;
  aide?: string;
  erreur?: string;
  desactive?: boolean;
  placeholder?: string;
  name?: string;
  className?: string;
}

function FlecheBas() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="csListeFleche"
    >
      <path
        d="M4 6 L8 10 L12 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconeErreur() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="mt-px shrink-0"
    >
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 4v3.5M7 9.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconeCoche() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 text-(--cs-neon)"
    >
      <path
        d="M2.5 7 L5.5 10 L11.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Liste déroulante Console (jamais de `<select>` natif).
 * @example
 * <Liste libelle="Type de projet" options={types} valeur={type} onChange={setType} obligatoire />
 */
export function Liste({
  id,
  libelle,
  options,
  valeur,
  onChange,
  obligatoire,
  aide,
  erreur,
  desactive,
  placeholder = "Choisissez une option",
  name,
  className = "",
}: ListeProps) {
  const uid = useId();
  const triggerId = id ?? `${uid}liste`;
  const listboxId = `${uid}lb`;
  const labelId = `${uid}lbl`;
  const erreurId = `${uid}err`;
  const aideId = aide ? `${uid}aide` : undefined;

  const [ouvert, setOuvert] = useState(false);
  const [actifIdx, setActifIdx] = useState<number>(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Refs pour type-ahead */
  const rechercheRef = useRef("");
  const rechercheTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const labelOption = options.find((o) => o.valeur === valeur)?.libelle ?? "";
  const etat = erreur ? "erreur" : undefined;

  /* Fermeture sur clic en dehors */
  useEffect(() => {
    if (!ouvert) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [ouvert]);

  /* Fermeture sur perte de focus hors composant */
  useEffect(() => {
    if (!ouvert) return;
    const el = wrapRef.current;
    function onFocusOut(e: FocusEvent) {
      if (!el?.contains(e.relatedTarget as Node)) {
        setOuvert(false);
      }
    }
    el?.addEventListener("focusout", onFocusOut);
    return () => el?.removeEventListener("focusout", onFocusOut);
  }, [ouvert]);

  /* Menu ouvert dans la couche supérieure de la page : il passe devant tout,
     modale comprise, quels que soient les empilements autour du champ. Il
     reste un enfant du champ dans le DOM (clic extérieur, focus). Position
     recalculée au défilement et au redimensionnement ; ouverture vers le haut
     quand la place manque en bas. */
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const wrap = wrapRef.current;
    if (!ouvert || !menu || !wrap) return;
    if (typeof menu.showPopover === "function" && !menu.matches(":popover-open")) {
      menu.showPopover();
    }
    let raf = 0;
    function placer() {
      if (!menu || !wrap) return;
      const r = wrap.getBoundingClientRect();
      const h = menu.offsetHeight;
      const ecart = 6;
      const enHaut = r.bottom + ecart + h > window.innerHeight && r.top - ecart - h > 0;
      menu.style.left = `${r.left}px`;
      menu.style.width = `${r.width}px`;
      menu.style.top = `${enHaut ? r.top - ecart - h : r.bottom + ecart}px`;
    }
    function planifier() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(placer);
    }
    placer();
    window.addEventListener("scroll", planifier, { capture: true, passive: true });
    window.addEventListener("resize", planifier);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", planifier, { capture: true });
      window.removeEventListener("resize", planifier);
    };
  }, [ouvert]);

  /* Défilement pour garder l'option active visible */
  useEffect(() => {
    if (!ouvert || actifIdx < 0) return;
    const optEl = listboxRef.current?.querySelector<HTMLElement>(
      `[data-idx="${actifIdx}"]`,
    );
    optEl?.scrollIntoView({ block: "nearest" });
  }, [actifIdx, ouvert]);

  function ouvrir(idxInitial?: number) {
    const idx =
      idxInitial !== undefined
        ? idxInitial
        : options.findIndex((o) => o.valeur === valeur);
    setActifIdx(idx >= 0 ? idx : 0);
    setOuvert(true);
  }

  function fermer() {
    setOuvert(false);
    triggerRef.current?.focus();
  }

  function selectionner(idx: number) {
    onChange(options[idx]!.valeur);
    fermer();
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!ouvert) { ouvrir(); return; }
        setActifIdx((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!ouvert) { ouvrir(options.length - 1); return; }
        setActifIdx((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (ouvert) { e.preventDefault(); setActifIdx(0); }
        break;
      case "End":
        if (ouvert) { e.preventDefault(); setActifIdx(options.length - 1); }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!ouvert) { ouvrir(); return; }
        if (actifIdx >= 0) selectionner(actifIdx);
        break;
      case "Escape":
        if (ouvert) { e.preventDefault(); fermer(); }
        break;
      default: {
        /* Type-ahead : première lettre */
        if (!ouvert || e.key.length !== 1) break;
        e.preventDefault();
        if (rechercheTimeoutRef.current) clearTimeout(rechercheTimeoutRef.current);
        rechercheRef.current += e.key.toLowerCase();
        rechercheTimeoutRef.current = setTimeout(() => {
          rechercheRef.current = "";
        }, 500);
        const terme = rechercheRef.current;
        const idx = options.findIndex((o) =>
          o.libelle.toLowerCase().startsWith(terme),
        );
        if (idx >= 0) setActifIdx(idx);
        break;
      }
    }
  }

  const optActifId =
    ouvert && actifIdx >= 0 ? `${uid}opt${actifIdx}` : undefined;

  const describedBy =
    [erreur ? erreurId : undefined, aideId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={className}>
      <StylesConsole />
      <StylesFormulaires />

      {/* Libellé : relié au trigger par aria-labelledby */}
      <p
        id={labelId}
        className="type-body mb-1.5 flex flex-wrap items-baseline gap-x-2 font-semibold text-(--cs-texte)"
      >
        {libelle}
        {obligatoire ? (
          <span className="type-caption font-normal text-(--cs-texte-3)">
            obligatoire
          </span>
        ) : null}
      </p>

      {aide ? (
        <p id={aideId} className="type-caption mb-1.5 text-(--cs-texte-3)">
          {aide}
        </p>
      ) : null}

      {/* Champ caché pour la soumission de formulaire */}
      {name ? <input type="hidden" name={name} value={valeur} /> : null}

      {/* Conteneur avec fond + bord Console */}
      <div
        ref={wrapRef}
        className="csListeWrap csCoupe"
        data-coupe="s"
        data-ouvert={ouvert ? "true" : undefined}
        data-etat={etat}
      >
        <span aria-hidden="true" className="csChampFond" />
        <span aria-hidden="true" className="csBord" />
        <span aria-hidden="true" className="csDiag" data-coin="hg" />
        <span aria-hidden="true" className="csDiag" data-coin="bd" />

        {/* Trigger */}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={ouvert}
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-activedescendant={optActifId}
          aria-required={obligatoire || undefined}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={describedBy}
          disabled={desactive}
          className="csListeTrigger"
          data-vide={!valeur ? "true" : undefined}
          onClick={() => (ouvert ? fermer() : ouvrir())}
          onKeyDown={onTriggerKeyDown}
        >
          <span>{valeur ? labelOption : placeholder}</span>
          <FlecheBas />
        </button>

        {/* Listbox */}
        {ouvert ? (
          <div ref={menuRef} popover="manual" className="csListeMenuWrap" role="presentation">
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={libelle}
              tabIndex={-1}
              className="csListeMenu"
            >
              {options.map((opt, idx) => (
                <li
                  key={opt.valeur}
                  id={`${uid}opt${idx}`}
                  role="option"
                  aria-selected={opt.valeur === valeur}
                  data-actif={idx === actifIdx ? "true" : undefined}
                  data-idx={idx}
                  className="csListeOption"
                  onMouseEnter={() => setActifIdx(idx)}
                  onMouseDown={(e) => {
                    /* preventDefault garde le focus sur le trigger */
                    e.preventDefault();
                    selectionner(idx);
                  }}
                >
                  {opt.libelle}
                  {opt.valeur === valeur ? <IconeCoche /> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {erreur ? (
        <p id={erreurId} role="alert" className="csChampMsgErreur">
          <IconeErreur />
          {erreur}
        </p>
      ) : null}
    </div>
  );
}
