/**
 * Famille « Retours » du système Console : modale.
 *
 * Basée sur `<dialog>` natif avec `showModal()` :
 * - Piège du focus et Échap gérés nativement par le navigateur.
 * - `aria-labelledby` relie le titre à la boîte de dialogue.
 * - Fond assombri via `::backdrop` ; flou sur ≥ 1024 px.
 * - Allumage à l'ouverture : scintillement `csAllume` + scan lumineux.
 * - Focus rendu à l'élément déclencheur à la fermeture.
 * - Défilement de la page bloqué pendant l'ouverture.
 * - Fermeture sur clic du fond ou sur la croix.
 *
 * RGAA 4.1 :
 * - Critère 7.3 : navigation clavier complète (focus trap natif `<dialog>`).
 * - Critère 10.2 : focus visible sur la croix et tous les interactifs internes.
 * - Critère 11.1 : titre relié par `aria-labelledby`.
 * - Critère 11.9 : bouton de fermeture ≥ 44 × 44 px.
 *
 * "use client" : refs DOM, `useEffect`, `useId`.
 */

"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { StylesRetours } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ModaleProps {
  /** La modale est affichée quand `true`. */
  ouvert: boolean;
  /** Callback déclenché à la fermeture (croix, Échap, clic fond). */
  onFermer: () => void;
  /** Contenu du titre relié à la boîte de dialogue via `aria-labelledby`. */
  titre: ReactNode;
  children: ReactNode;
  /**
   * Ref de l'élément déclencheur.
   * Le focus y revient après fermeture.
   */
  refDeclencheur?: React.RefObject<HTMLElement | null>;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/**
 * Modale console.
 *
 * @example
 * const [ouvert, setOuvert] = useState(false);
 * const refBtn = useRef<HTMLButtonElement>(null);
 *
 * <button ref={refBtn} onClick={() => setOuvert(true)}>Ouvrir</button>
 * <Modale
 *   ouvert={ouvert}
 *   onFermer={() => setOuvert(false)}
 *   titre="Titre de la fenêtre"
 *   refDeclencheur={refBtn}
 * >
 *   Contenu
 * </Modale>
 */
export function Modale({ ouvert, onFermer, titre, children, refDeclencheur, className = "" }: ModaleProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const idTitre = `modale-titre-${uid.replace(/[^a-z0-9]/gi, "")}`;

  /* Ouvrir / fermer le dialog natif selon la prop `ouvert`. */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (ouvert) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [ouvert]);

  /* Bloquer le défilement de la page pendant l'ouverture. */
  useEffect(() => {
    if (!ouvert) return;
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "hidden";
    return () => { document.body.style.overflowY = prev; };
  }, [ouvert]);

  /* Rendre le focus à l'élément déclencheur à la fermeture, jamais au
     chargement : la page sauterait jusqu'au bouton. */
  const etaitOuvert = useRef(false);
  useEffect(() => {
    if (ouvert) {
      etaitOuvert.current = true;
    } else if (etaitOuvert.current) {
      etaitOuvert.current = false;
      refDeclencheur?.current?.focus();
    }
  }, [ouvert, refDeclencheur]);

  return (
    <>
      <StylesConsole />
      <StylesRetours />

      <dialog
        ref={dialogRef}
        className={`csRetDialog ${className}`}
        aria-labelledby={idTitre}
        aria-modal="true"
        /* onCancel est déclenché par Échap : on prévient la fermeture native
           pour laisser le parent mettre à jour son état, puis on appelle onFermer. */
        onCancel={(e) => {
          e.preventDefault();
          onFermer();
        }}
        /* Certains navigateurs embarqués ne transmettent pas Échap au dialog
           natif : la touche est aussi écoutée ici. */
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.preventDefault();
          onFermer();
        }}
        /* Fermer sur clic du fond (zone hors du Panneau). */
        onClick={(e) => {
          if (e.target === dialogRef.current) onFermer();
        }}
      >
        <Panneau coupe="l" accent equerres flou className={`csRetModaleFrame`}>
          {/* Scan : traverse le panneau à l'ouverture. Décoration, aria-hidden. */}
          <span aria-hidden="true" className="csRetScan" />

          <div className="csRetModaleCorps">
            {/* En-tête */}
            <div className="csRetModaleEntete">
              <p id={idTitre} className="type-h3 text-white">
                {titre}
              </p>
              <button
                type="button"
                className="csRetFermer"
                onClick={onFermer}
                aria-label="Fermer la fenêtre"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
                  <path
                    d="M2 2 L14 14 M14 2 L2 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Séparateur néon */}
            <span
              aria-hidden="true"
              className="mx-6 block h-px bg-(--cs-neon-doux) shadow-[0_0_4px_rgba(56,189,248,0.5)]"
            />

            {/* Corps défilable */}
            <div className="csRetModaleContenu">
              {children}
            </div>
          </div>
        </Panneau>
      </dialog>
    </>
  );
}
