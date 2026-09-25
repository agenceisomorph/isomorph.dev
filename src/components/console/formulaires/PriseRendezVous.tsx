"use client";

/**
 * PriseRendezVous — composant autonome de prise de rendez-vous.
 *
 * Charge ses créneaux lui-même au montage via la Server Action `lireCreneaux`.
 * Brancher en une ligne sous un formulaire existant :
 *   <PriseRendezVous />
 *
 * Parcours en deux étapes :
 *   1. Coordonnées (prénom, nom, email, téléphone, entreprise, message)
 *   2. Calendrier mensuel + créneaux du jour sélectionné
 *   3. Confirmation
 *
 * RGAA 7.1  : changement d'étape annoncé (aria-live), focus déplacé.
 * RGAA 11.1 : chaque champ a un libellé visible (composant Champ/ZoneTexte).
 * RGAA 11.10: erreurs identifiées par role="alert".
 * RGAA 4.1  : navigation clavier flèches dans la grille et les créneaux.
 * RGESN     : zéro dépendance de calendrier, Intl natif, aucune image.
 *
 * Animations : rendu serveur = premier rendu navigateur (ETAT_FINAL_REDUIT).
 * Mouvement réduit neutralisé par les classes du système Console (fondations.tsx).
 *
 * "use client" justifié : état multi-étapes, horloge, clavier, useActionState.
 */

import {
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StylesConsole, Panneau } from "../fondations";
import { StylesFormulaires } from "./_styles";
import { Champ } from "./Champ";
import { ZoneTexte } from "./ZoneTexte";
import { Bouton } from "../Bouton";
import { lireCreneaux, soumettreRdv } from "@/app/actions/rendez-vous";
import type { BookingSlot, EtatRdv } from "@/app/actions/rendez-vous";

const etatInitial: EtatRdv = { success: false };

/* ------------------------------------------------------------------ */
/* Styles locaux du composant                                          */
/* ------------------------------------------------------------------ */

const STYLES_LOCAL = `
/* Grille du calendrier */
.rdvGrille { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }

/* Case de jour */
.rdvCase {
  position: relative; isolation: isolate;
  display: flex; align-items: center; justify-content: center;
  height: 44px; min-width: 0;
  font-size: 0.9375rem; font-family: inherit; font-weight: 600;
  color: var(--cs-texte-3);
  background: transparent; border: none; outline: none; cursor: default;
  --cs-c: 6px;
  --cs-clip: polygon(
    var(--cs-c) 0, 100% 0,
    100% calc(100% - var(--cs-c)),
    calc(100% - var(--cs-c)) 100%,
    0 100%, 0 var(--cs-c)
  );
}

/* Jour disponible */
.rdvCase[data-dispo="true"] {
  color: var(--cs-texte-2);
  background: rgba(56, 189, 248, 0.06);
  clip-path: var(--cs-clip);
  cursor: pointer;
  transition: background-color var(--cs-rapide) linear, color var(--cs-rapide) linear;
}
.rdvCase[data-dispo="true"]:hover {
  background: rgba(56, 189, 248, 0.14);
  color: var(--cs-texte);
}
/* Focus : le bord s'allume, aucun anneau. */
.rdvCase[data-dispo="true"]:focus-visible {
  background: rgba(56, 189, 248, 0.18);
  color: var(--cs-texte);
  box-shadow: inset 0 0 0 1px var(--cs-neon);
}
/* Jour sélectionné */
.rdvCase[aria-pressed="true"] {
  background: var(--cs-neon) !important;
  color: #02060d !important;
}

/* Jour actuel */
.rdvCase[data-aujourd-hui="true"]::after {
  content: "";
  position: absolute; bottom: 4px; left: 50%; translate: -50% 0;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--cs-neon);
}
.rdvCase[aria-pressed="true"][data-aujourd-hui="true"]::after {
  background: #02060d;
}

/* Créneau horaire */
.rdvCreneau {
  display: flex; align-items: center; justify-content: center;
  min-height: 44px; width: 100%;
  font-size: 0.9375rem; font-family: inherit; font-weight: 600;
  color: var(--cs-texte-2);
  background: rgba(56, 189, 248, 0.06);
  border: none; outline: none; cursor: pointer;
  --cs-c: 6px;
  --cs-clip: polygon(
    var(--cs-c) 0, 100% 0,
    100% calc(100% - var(--cs-c)),
    calc(100% - var(--cs-c)) 100%,
    0 100%, 0 var(--cs-c)
  );
  clip-path: var(--cs-clip);
  transition: background-color var(--cs-rapide) linear, color var(--cs-rapide) linear;
}
.rdvCreneau:hover {
  background: rgba(56, 189, 248, 0.14);
  color: var(--cs-texte);
}
.rdvCreneau:focus-visible {
  background: rgba(56, 189, 248, 0.18);
  color: var(--cs-texte);
  box-shadow: inset 0 0 0 1px var(--cs-neon);
}
.rdvCreneau[aria-pressed="true"] {
  background: var(--cs-neon);
  color: #02060d;
}

/* Icône de succès */
.rdvSuccesIcone {
  display: inline-flex; align-items: center; justify-content: center;
  width: 52px; height: 52px;
  background: rgba(94, 234, 212, 0.12);
  color: var(--cs-succes);
  clip-path: polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px);
}

/* Indisponible : état agenda non connecté */
.rdvIndispo {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  text-align: center; padding: 3rem 1.5rem;
}

/* Mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  .rdvCase, .rdvCreneau { transition: none; }
}
`;

function StylesRendezVous() {
  return (
    <style href="console-rdv" precedence="component">
      {STYLES_LOCAL}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Utilitaires calendrier                                              */
/* ------------------------------------------------------------------ */

const PARIS = "Europe/Paris";

const fmtCleJour = new Intl.DateTimeFormat("fr-CA", {
  timeZone: PARIS,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const fmtMois = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  month: "long",
  year: "numeric",
});

const fmtJourCourt = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  weekday: "short",
  day: "numeric",
});

const fmtJourLong = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const fmtHeure = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  hour: "2-digit",
  minute: "2-digit",
});

const fmtHorlogeParallele = new Intl.DateTimeFormat("fr-FR", {
  timeZone: PARIS,
  hour: "2-digit",
  minute: "2-digit",
});

const JOURS_SEMAINE = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

const pad = (n: number) => String(n).padStart(2, "0");
const cleJour = (a: number, m: number, j: number) => `${a}-${pad(m)}-${pad(j)}`;
const cleSlot = (slot: BookingSlot) => fmtCleJour.format(new Date(slot.start));

/** Cellules du mois : null pour les cases vides avant le 1er. */
function cellulesMois(annee: number, mois: number): (number | null)[] {
  // Semaine française : lundi en premier (getUTCDay renvoie 0 pour dimanche).
  const premierJour = (new Date(Date.UTC(annee, mois - 1, 1)).getUTCDay() + 6) % 7;
  const nbJours = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const cells: (number | null)[] = Array(premierJour).fill(null);
  for (let j = 1; j <= nbJours; j++) cells.push(j);
  return cells;
}

/* ------------------------------------------------------------------ */
/* Icônes SVG inline (Phosphor-style, aria-hidden)                    */
/* ------------------------------------------------------------------ */

function IconeCheck() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10.5 L8.5 15 L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconeVideo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="4" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5 L17 5 V13 L12 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconeHorloge() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.5 V8.5 L11 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconeGlobe() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5 C6 4 5 6 5 8 C5 10 6 12 8 14.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5 C10 4 11 6 11 8 C11 10 10 12 8 14.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 8 H14.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconeChevronGauche() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function IconeChevronDroite() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3 L11 8 L6 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Composant Calendrier                                                */
/* ------------------------------------------------------------------ */

interface CalendrierProps {
  annee: number;
  mois: number;
  clesDispo: Set<string>;
  cleSelectionnee: string | null;
  cleAujourdhui: string;
  onSelect: (cle: string) => void;
  onChangeMois: (annee: number, mois: number) => void;
  /** Inerte : affiché mais non actionnable (étape 1). */
  inerte?: boolean;
  anneeMin: number;
  moisMin: number;
}

function Calendrier({
  annee,
  mois,
  clesDispo,
  cleSelectionnee,
  cleAujourdhui,
  onSelect,
  onChangeMois,
  inerte = false,
  anneeMin,
  moisMin,
}: CalendrierProps) {
  const cells = useMemo(() => cellulesMois(annee, mois), [annee, mois]);
  const libelleMois = fmtMois.format(new Date(Date.UTC(annee, mois - 1, 1)));
  const estPremierMois = annee === anneeMin && mois === moisMin;

  /* Références pour la navigation clavier. */
  const grilleRef = useRef<HTMLDivElement>(null);

  const aller = (delta: number) => {
    if (!cleSelectionnee) return;
    const cles = [...clesDispo].sort();
    const idx = cles.indexOf(cleSelectionnee);
    const nvCle = cles[idx + delta];
    if (nvCle) {
      onSelect(nvCle);
      /* Déplacement de focus vers le bouton du jour sélectionné. */
      requestAnimationFrame(() => {
        grilleRef.current
          ?.querySelector<HTMLButtonElement>(`[data-cle="${nvCle}"]`)
          ?.focus();
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (inerte) return;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        aller(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        aller(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        aller(7);
        break;
      case "ArrowUp":
        e.preventDefault();
        aller(-7);
        break;
    }
  };

  const goPrev = () => {
    const m = mois === 1 ? 12 : mois - 1;
    const a = mois === 1 ? annee - 1 : annee;
    onChangeMois(a, m);
  };
  const goNext = () => {
    const m = mois === 12 ? 1 : mois + 1;
    const a = mois === 12 ? annee + 1 : annee;
    onChangeMois(a, m);
  };

  return (
    <div aria-hidden={inerte || undefined}>
      {/* En-tête du mois */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="type-h3 capitalize text-(--cs-texte)" style={{ fontWeight: 600 }}>
          {libelleMois}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={inerte || estPremierMois}
            aria-label="Mois précédent"
            className="inline-flex h-9 w-9 items-center justify-center text-(--cs-texte-2)
                       transition-colors hover:text-(--cs-texte) disabled:opacity-30
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--cs-neon)"
          >
            <IconeChevronGauche />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={inerte}
            aria-label="Mois suivant"
            className="inline-flex h-9 w-9 items-center justify-center text-(--cs-texte-2)
                       transition-colors hover:text-(--cs-texte) disabled:opacity-30
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--cs-neon)"
          >
            <IconeChevronDroite />
          </button>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="rdvGrille mb-1">
        {JOURS_SEMAINE.map((j) => (
          <div
            key={j}
            className="flex h-8 items-center justify-center text-center type-caption
                       uppercase tracking-wide text-(--cs-texte-3)"
          >
            {j}
          </div>
        ))}
      </div>

      {/* Cases des jours */}
      <div
        ref={grilleRef}
        role="grid"
        aria-label="Calendrier"
        className="rdvGrille"
        onKeyDown={handleKeyDown}
      >
        {cells.map((jour, i) => {
          if (jour === null)
            return (
              <div key={`v-${i}`} role="gridcell" aria-hidden="true" />
            );

          const cle = cleJour(annee, mois, jour);
          const dispo = clesDispo.has(cle);
          const selectionne = cle === cleSelectionnee;
          const aujourdhui = cle === cleAujourdhui;

          return (
            <div key={cle} role="gridcell">
              <button
                type="button"
                className="rdvCase w-full"
                data-cle={cle}
                data-dispo={dispo ? "true" : undefined}
                data-aujourd-hui={aujourdhui ? "true" : undefined}
                aria-pressed={selectionne}
                aria-label={fmtJourLong.format(new Date(`${cle}T12:00:00Z`))}
                disabled={inerte || !dispo}
                tabIndex={dispo && selectionne ? 0 : dispo && !cleSelectionnee ? 0 : -1}
                onClick={() => onSelect(cle)}
              >
                {jour}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étiquette d'étape                                                   */
/* ------------------------------------------------------------------ */

function EtiquetteEtape({
  etat,
  libelle,
}: {
  etat: "fait" | "active" | "todo";
  libelle: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {etat === "fait" ? (
        <span aria-hidden="true" className="text-(--cs-succes)">
          <IconeCheck />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className={[
            "h-2 w-2 rotate-45",
            etat === "active" ? "bg-(--cs-neon)" : "bg-(--cs-texte-3)/40",
          ].join(" ")}
        />
      )}
      <span
        className={[
          "type-caption",
          etat === "active"
            ? "font-semibold text-(--cs-texte)"
            : "text-(--cs-texte-3)",
        ].join(" ")}
      >
        {libelle}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export interface PriseRendezVousProps {
  className?: string;
}

/**
 * Composant autonome de prise de rendez-vous, adapté au système Console.
 * Charge ses créneaux lui-même. Se branche en une ligne.
 *
 * @example
 * <PriseRendezVous />
 */
export function PriseRendezVous({ className = "" }: PriseRendezVousProps) {
  const uid = useId();
  const router = useRouter();

  /* État du Server Action */
  const [etat, action, isPending] = useActionState<EtatRdv, FormData>(
    soumettreRdv,
    etatInitial,
  );

  /* Chargement des créneaux */
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    lireCreneaux().then(({ slots: s, connected: c }) => {
      setSlots(s);
      setConnected(c);
    });
  }, []);

  /* Formulaire */
  const [etape, setEtape] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    entreprise: "",
    message: "",
  });

  /* Calendrier */
  const { slotsByDay, clesDispo, clesOrdonnees } = useMemo(() => {
    const map = new Map<string, BookingSlot[]>();
    for (const slot of slots) {
      const cle = cleSlot(slot);
      const liste = map.get(cle);
      if (liste) liste.push(slot);
      else map.set(cle, [slot]);
    }
    const cles = [...map.keys()].sort();
    return { slotsByDay: map, clesDispo: new Set(cles), clesOrdonnees: cles };
  }, [slots]);

  const clePremier = clesOrdonnees[0] ?? null;
  const cleAujourdhui = fmtCleJour.format(new Date());
  const [cleSelectionnee, setCleSelectionnee] = useState<string | null>(null);
  const [vue, setVue] = useState<{ annee: number; mois: number }>(() => {
    const base = clePremier ?? cleAujourdhui;
    const [a, m] = base.split("-").map(Number);
    return { annee: a, mois: m };
  });

  /* Synchronisation quand les créneaux arrivent */
  useEffect(() => {
    if (clePremier && cleSelectionnee === null) {
      setCleSelectionnee(clePremier);
      const [a, m] = clePremier.split("-").map(Number);
      setVue({ annee: a, mois: m });
    }
  }, [clePremier, cleSelectionnee]);

  const [slotSelectionne, setSlotSelectionne] = useState<BookingSlot | null>(null);

  /* Horloge de Paris (montée après hydratation pour éviter l'erreur 418) */
  const [heureParisStr, setHeureParisStr] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setHeureParisStr(fmtHorlogeParallele.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  /* Focus déplacé à chaque changement d'étape (RGAA 7.1). */
  const titreRef = useRef<HTMLHeadingElement>(null);

  /* Référence pour la navigation clavier dans la liste des créneaux (étape 2). */
  const creneauxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    titreRef.current?.focus({ preventScroll: true });
  }, [etape, etat.success]);

  /* Créneau pris entre affichage et soumission : recharge les créneaux. */
  useEffect(() => {
    if (etat.conflict) {
      setSlotSelectionne(null);
      router.refresh();
      lireCreneaux().then(({ slots: s, connected: c }) => {
        setSlots(s);
        setConnected(c);
      });
    }
  }, [etat.conflict, router]);

  const slotsJour = cleSelectionnee ? (slotsByDay.get(cleSelectionnee) ?? []) : [];

  /* Durée d'un créneau, lue sur les données (robuste aux changements Cockpit). */
  const dureeMin = useMemo(() => {
    if (!slots.length) return 30;
    const { start, end } = slots[0];
    return Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60_000,
    );
  }, [slots]);

  /* ── Confirmation ──────────────────────────────────────────────────── */
  if (etat.success) {
    return (
      <Panneau coupe="l" accent className={`p-10 ${className}`}>
        <StylesRendezVous />
        <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
          <span aria-hidden="true" className="rdvSuccesIcone">
            <IconeCheck />
          </span>
          <h2
            ref={titreRef}
            tabIndex={-1}
            className="type-h2 text-(--cs-texte) outline-none"
            style={{ fontWeight: 600 }}
          >
            Rendez-vous confirmé
          </h2>
          {etat.confirmed?.startTime ? (
            <p className="type-lead text-(--cs-texte-2)">
              <span className="font-semibold text-(--cs-texte)">
                {fmtJourLong.format(new Date(etat.confirmed.startTime))} à{" "}
                {fmtHeure.format(new Date(etat.confirmed.startTime))}
              </span>{" "}
              (heure de Paris)
            </p>
          ) : null}
          {etat.confirmed?.meetLink ? (
            <a
              href={etat.confirmed.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="csBouton csCoupe mt-2"
              data-variante="principal"
              data-taille="m"
              data-coupe="s"
            >
              <span aria-hidden="true" className="csBoutonFond" />
              <IconeVideo />
              <span>Rejoindre la visio</span>
            </a>
          ) : null}
          <p className="type-caption text-(--cs-texte-3)">
            Une invitation est envoyée sur {form.email}.
          </p>
        </div>
      </Panneau>
    );
  }

  /* ── Chargement des créneaux ────────────────────────────────────────── */
  const enChargement = connected === null;

  /* ── Agenda non connecté ou aucun créneau ───────────────────────────── */
  if (!enChargement && (!connected || clesOrdonnees.length === 0)) {
    return (
      <Panneau coupe="l" className={className}>
        <StylesRendezVous />
        <div className="rdvIndispo">
          <h2 className="type-h2 text-(--cs-texte)" style={{ fontWeight: 600 }}>
            Aucun créneau disponible
          </h2>
          <p className="type-lead text-(--cs-texte-2)">
            Écrivez directement, la réponse viendra rapidement.
          </p>
          <Bouton href="/contact" variante="secondaire">
            Formulaire de contact
          </Bouton>
        </div>
      </Panneau>
    );
  }

  /* ── Fil des étapes ─────────────────────────────────────────────────── */
  const filEtapes = (
    <div
      className="flex items-center justify-center gap-8 border-b border-(--cs-trait)
                 px-6 py-4"
    >
      <EtiquetteEtape etat={etape === 1 ? "active" : "fait"} libelle="Coordonnées" />
      <span aria-hidden="true" className="h-px w-8 bg-(--cs-trait)" />
      <EtiquetteEtape etat={etape === 2 ? "active" : "todo"} libelle="Créneau" />
    </div>
  );

  /* Annonce de l'étape pour les lecteurs d'écran (RGAA 7.1). */
  const annonce = (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {etape === 1
        ? "Étape 1 : remplir les coordonnées"
        : "Étape 2 : choisir un créneau"}
    </p>
  );

  /* ── Calendrier réutilisable ────────────────────────────────────────── */
  const calendrier = (inerte: boolean) => (
    <Calendrier
      annee={vue.annee}
      mois={vue.mois}
      clesDispo={clesDispo}
      cleSelectionnee={cleSelectionnee}
      cleAujourdhui={cleAujourdhui}
      onSelect={(cle) => {
        setCleSelectionnee(cle);
        setSlotSelectionne(null);
      }}
      onChangeMois={(a, m) => setVue({ annee: a, mois: m })}
      inerte={inerte}
      anneeMin={Number(cleAujourdhui.slice(0, 4))}
      moisMin={Number(cleAujourdhui.slice(5, 7))}
    />
  );

  /* ── Étape 1 : coordonnées ──────────────────────────────────────────── */
  if (etape === 1) {
    return (
      <Panneau coupe="l" className={className}>
        <StylesConsole />
        <StylesFormulaires />
        <StylesRendezVous />
        {filEtapes}
        {annonce}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Formulaire */}
          <div className="p-6 sm:p-8">
            <h2
              ref={titreRef}
              tabIndex={-1}
              className="type-h1 text-(--cs-texte) outline-none"
              style={{ fontWeight: 600 }}
            >
              Réserver un échange
            </h2>
            <p className="mt-3 type-lead text-(--cs-texte-2)">
              {dureeMin} minutes pour parler de votre projet. Confirmation immédiate,
              lien de visio Google Meet joint.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEtape(2);
              }}
              className="mt-7 flex flex-col gap-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Champ
                  libelle="Prénom"
                  obligatoire
                  type="text"
                  name="prenom-visible"
                  autoComplete="given-name"
                  placeholder="Marie"
                  valeur={form.prenom}
                  onChange={(v) => setForm({ ...form, prenom: v })}
                  erreur={etat.errors?.prenom}
                />
                <Champ
                  libelle="Nom"
                  obligatoire
                  type="text"
                  name="nom-visible"
                  autoComplete="family-name"
                  placeholder="Dupont"
                  valeur={form.nom}
                  onChange={(v) => setForm({ ...form, nom: v })}
                  erreur={etat.errors?.nom}
                />
              </div>

              <Champ
                libelle="Email"
                obligatoire
                type="email"
                name="email-visible"
                autoComplete="email"
                placeholder="marie.dupont@entreprise.fr"
                aide="L'invitation et le lien de visio y sont envoyés."
                valeur={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                erreur={etat.errors?.email}
              />

              <Champ
                libelle="Téléphone"
                type="tel"
                name="telephone-visible"
                autoComplete="tel"
                placeholder="+33 6 12 34 56 78"
                valeur={form.telephone}
                onChange={(v) => setForm({ ...form, telephone: v })}
              />

              <Champ
                libelle="Entreprise"
                type="text"
                name="entreprise-visible"
                autoComplete="organization"
                placeholder="Mon Entreprise (facultatif)"
                valeur={form.entreprise}
                onChange={(v) => setForm({ ...form, entreprise: v })}
              />

              <ZoneTexte
                libelle="Message"
                name="message-visible"
                placeholder="Décrivez votre projet en quelques mots (facultatif)."
                valeur={form.message}
                onChange={(v) => setForm({ ...form, message: v })}
                rows={3}
                limiteCaracteres={2000}
              />

              <p className="type-caption text-(--cs-texte-3)">
                Ces informations servent uniquement à organiser cet échange. Elles ne
                sont pas revendues.{" "}
                <Link
                  href="/confidentialite"
                  className="underline underline-offset-2 hover:text-(--cs-texte-2)"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>

              <Bouton type="submit" variante="principal" className="self-start">
                Continuer
              </Bouton>
            </form>
          </div>

          {/* Calendrier en attente — repère visuel */}
          <div className="relative hidden border-l border-(--cs-trait) p-6 sm:p-8 lg:block">
            <div className="pointer-events-none select-none opacity-30">
              {calendrier(true)}
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <Panneau coupe="m" className="max-w-[18rem] px-5 py-4 text-center">
                <p className="type-body text-(--cs-texte-2)">
                  Remplissez les coordonnées avant de choisir un créneau.
                </p>
              </Panneau>
            </div>
          </div>
        </div>
      </Panneau>
    );
  }

  /* ── Étape 2 : créneau ─────────────────────────────────────────────── */

  const handleKeyDownCreneaux = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const boutons = creneauxRef.current?.querySelectorAll<HTMLButtonElement>(
      "button.rdvCreneau",
    );
    if (!boutons?.length) return;
    const idx = Array.from(boutons).findIndex(
      (b) => b === document.activeElement,
    );
    if (idx < 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      boutons[Math.min(idx + 1, boutons.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      boutons[Math.max(idx - 1, 0)]?.focus();
    }
  };

  return (
    <Panneau coupe="l" className={className}>
      <StylesConsole />
      <StylesFormulaires />
      <StylesRendezVous />
      {filEtapes}
      {annonce}

      <div className="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)_16rem]">
        {/* Récapitulatif */}
        <aside className="border-b border-(--cs-trait) p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <h2
            ref={titreRef}
            tabIndex={-1}
            className="type-h3 text-(--cs-texte) outline-none"
            style={{ fontWeight: 600 }}
          >
            Réserver un échange
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <IconeVideo />
              <span className="type-caption text-(--cs-texte-2)">Google Meet</span>
            </div>
            <div className="flex items-center gap-3">
              <IconeHorloge />
              <span className="type-caption text-(--cs-texte-2)">
                {dureeMin} minutes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconeGlobe />
              <span className="type-caption text-(--cs-texte-2)">
                Heure de Paris
                {heureParisStr ? ` (${heureParisStr})` : ""}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEtape(1)}
            className="mt-7 type-caption text-(--cs-neon) underline underline-offset-2
                       hover:no-underline focus-visible:outline-none
                       focus-visible:ring-1 focus-visible:ring-(--cs-neon)"
          >
            Modifier les coordonnées
          </button>
        </aside>

        {/* Calendrier */}
        <div className="border-b border-(--cs-trait) p-6 sm:p-8 lg:border-b-0 lg:border-r">
          {enChargement ? (
            <div className="flex h-40 items-center justify-center">
              <span aria-hidden="true" className="csRoue text-(--cs-neon)" />
              <span className="sr-only">Chargement des créneaux</span>
            </div>
          ) : (
            calendrier(false)
          )}
        </div>

        {/* Créneaux du jour */}
        <div className="p-6 sm:p-8">
          <p
            className="type-h3 mb-4 capitalize text-(--cs-texte)"
            style={{ fontWeight: 600 }}
          >
            {cleSelectionnee
              ? fmtJourCourt
                  .format(new Date(`${cleSelectionnee}T12:00:00Z`))
                  .replace(".", "")
              : ""}
          </p>

          {etat.globalError ? (
            <div
              role="alert"
              className="mb-4 rounded px-3 py-2.5 type-caption
                         border border-(--cs-erreur)/50 text-(--cs-erreur)
                         bg-(--cs-erreur)/10"
            >
              {etat.globalError}
            </div>
          ) : null}

          <div
            ref={creneauxRef}
            role="listbox"
            aria-label="Créneaux disponibles"
            aria-orientation="vertical"
            className="flex max-h-[22rem] flex-col gap-2 overflow-y-auto pr-1"
            onKeyDown={handleKeyDownCreneaux}
          >
            {slotsJour.map((slot) => {
              const actif = slotSelectionne?.start === slot.start;
              return (
                <button
                  key={slot.start}
                  type="button"
                  role="option"
                  aria-selected={actif}
                  className="rdvCreneau"
                  onClick={() => setSlotSelectionne(slot)}
                >
                  {fmtHeure.format(new Date(slot.start))}
                </button>
              );
            })}
          </div>

          {/* Formulaire caché + honeypot */}
          <form action={action} className="mt-5">
            {/* Honeypot — doit rester vide */}
            <label htmlFor={`${uid}hp`} className="sr-only">
              Laisser ce champ vide
            </label>
            <input
              id={`${uid}hp`}
              type="text"
              name="website_url2"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
            />

            {/* Valeurs du formulaire step 1 */}
            <input type="hidden" name="prenom" value={form.prenom} />
            <input type="hidden" name="nom" value={form.nom} />
            <input type="hidden" name="email" value={form.email} />
            <input type="hidden" name="telephone" value={form.telephone} />
            <input type="hidden" name="entreprise" value={form.entreprise} />
            <input type="hidden" name="message" value={form.message} />
            <input type="hidden" name="startTime" value={slotSelectionne?.start ?? ""} />
            <input type="hidden" name="endTime" value={slotSelectionne?.end ?? ""} />

            <Bouton
              type="submit"
              variante="principal"
              chargement={isPending}
              desactive={!slotSelectionne || isPending}
              className="w-full justify-center"
            >
              Confirmer
            </Bouton>
          </form>
        </div>
      </div>
    </Panneau>
  );
}
