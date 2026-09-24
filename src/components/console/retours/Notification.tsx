/**
 * Famille « Retours » du système Console : notifications éphémères.
 *
 * Exports :
 * - `useNotifications()` : hook de gestion (afficher, fermer, liste).
 * - `ZoneNotifications` : région live qui affiche les notifications.
 * - `CarteNotification` : la même carte, figée, pour un aperçu.
 *
 * Architecture : composant contrôlé. Le consommateur monte `<ZoneNotifications>`
 * là où il en a besoin (vitrine, page spécifique) et appelle `afficher()` depuis
 * son propre code. Rien n'est monté dans le layout global.
 *
 * Dessin « Journal », retenu par Florent le 23 septembre 2026 : ligne de
 * terminal tapée à l'heure réelle de l'envoi, message dessous, filet du temps
 * restant au pied.
 *
 * RGAA 4.1 :
 * - Deux régions `aria-live` : `polite` pour succès/alerte/info,
 *   `assertive` pour les erreurs (critère 13.4).
 * - Le type est toujours écrit, jamais porté par la seule couleur (critère 3.1).
 * - Le survol et le focus suspendent la fermeture automatique (critère 13.1).
 * - Ligne tapée, curseur et filet : `aria-hidden`, purement visuels.
 * - Clignotement du curseur limité à trois cycles (critère 13.8).
 *
 * Minuterie : une seule, en JS, qui garde le temps restant pendant la pause.
 * La barre CSS suit le même état par `data-pause`.
 *
 * "use client" : état des notifications, minuterie.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { StylesConsole } from "../fondations";
import { StylesRetours } from "./_styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type TypeNotification = "succes" | "alerte" | "erreur" | "info";

export interface Notification {
  id: string;
  type: TypeNotification;
  /** Titre court affiché en gras. Optionnel. */
  titre?: string;
  /** Message principal. */
  message: string;
  /**
   * Durée d'affichage en ms avant fermeture automatique.
   * `undefined` = permanente jusqu'à fermeture manuelle.
   * Par défaut : 4 000 ms.
   */
  duree?: number;
  /** Heure de l'envoi (ms). Posée par `afficher()`, écrite sur la ligne du journal. */
  creeLe?: number;
}

export type NouvelleNotification = Omit<Notification, "id" | "creeLe">;

const LIBELLES: Record<TypeNotification, string> = {
  succes: "Succès",
  alerte: "Alerte",
  erreur: "Erreur",
  info: "Information",
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

/**
 * Gestion des notifications.
 *
 * @example
 * const { notifications, afficher, fermer } = useNotifications();
 * afficher({ type: "succes", message: "Votre projet est arrivé." });
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const afficher = useCallback((n: NouvelleNotification) => {
    const creeLe = Date.now();
    const id = `notif-${creeLe}-${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((prev) => [...prev, { duree: 4000, ...n, id, creeLe }]);
  }, []);

  const fermer = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, afficher, fermer };
}

/* ------------------------------------------------------------------ */
/* Pictogrammes                                                        */
/* ------------------------------------------------------------------ */

function Croix() {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" width="10" height="10">
      <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

/** Heure de l'envoi. Un aperçu figé affiche un cadran vide, identique au serveur et au navigateur. */
function heure(ms: number | undefined) {
  if (!ms) return "--:--:--";
  return new Date(ms).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface CarteProps {
  notif: Notification;
  /** Absent : aperçu figé, sans minuterie ni bouton. */
  onFermer?: (id: string) => void;
}

function Carte({ notif, onFermer }: CarteProps) {
  const fige = !onFermer;
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);
  const pause = survol || focus;
  const restant = useRef(notif.duree ?? 0);

  /* Minuterie unique : à chaque pause, le temps écoulé est retiré du reste. */
  useEffect(() => {
    if (!onFermer || !notif.duree || pause) return;
    const debut = performance.now();
    const t = setTimeout(() => onFermer(notif.id), Math.max(0, restant.current));
    return () => {
      clearTimeout(t);
      restant.current -= performance.now() - debut;
    };
  }, [pause, notif.duree, notif.id, onFermer]);

  const libelle = LIBELLES[notif.type];
  const style = notif.duree ? ({ "--csRetDuree": `${notif.duree}ms` } as CSSProperties) : undefined;
  const ligne = `> ${libelle.toUpperCase()} · ${heure(fige ? undefined : notif.creeLe)}`;
  const labelFermer = `Fermer la notification${notif.titre ? ` : ${notif.titre}` : ""}`;

  return (
    <div
      className="csRetNotif csPanneau"
      data-type={notif.type}
      data-pause={pause || undefined}
      data-fige={fige || undefined}
      style={style}
      onPointerEnter={fige ? undefined : () => setSurvol(true)}
      onPointerLeave={fige ? undefined : () => setSurvol(false)}
      onFocus={fige ? undefined : () => setFocus(true)}
      onBlur={
        fige
          ? undefined
          : (e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
            }
      }
    >
      <span aria-hidden="true" className="csRetJouFond" />
      <div className="csRetJouCorps">
        <p aria-hidden="true" className="csRetJouLigne type-caption" style={{ "--csRetCar": ligne.length } as CSSProperties}>
          <span className="csRetJouFrappe">{ligne}</span>
          <span className="csRetJouCurseur" />
        </p>
        <div className="csRetNotifTextes">
          <span className="sr-only">{libelle} : </span>
          {notif.titre ? <p className="type-body font-semibold text-white">{notif.titre}</p> : null}
          <p className={`type-body ${notif.titre ? "mt-0.5" : ""} text-(--cs-texte-2)`}>{notif.message}</p>
        </div>
      </div>
      {fige ? (
        <span aria-hidden="true" className="csRetNotifFermer">
          <Croix />
        </span>
      ) : (
        <button type="button" className="csRetNotifFermer" onClick={() => onFermer(notif.id)} aria-label={labelFermer}>
          <Croix />
        </button>
      )}
      {notif.duree ? <span aria-hidden="true" className="csRetProgNotif" /> : null}
    </div>
  );
}

/**
 * Aperçu figé d'une notification : ni minuterie, ni bouton, ni région live.
 * Réservé aux vitrines.
 */
export function CarteNotification({ notif }: { notif: NouvelleNotification }) {
  return (
    <>
      <StylesConsole />
      <StylesRetours />
      <Carte notif={{ duree: 4000, ...notif, id: "apercu" }} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Zone de notifications                                               */
/* ------------------------------------------------------------------ */

export interface ZoneNotificationsProps {
  notifications: Notification[];
  onFermer: (id: string) => void;
}

/**
 * Région live fixe qui affiche les notifications.
 * Deux sous-régions séparées : `polite` pour succes/alerte/info,
 * `assertive` pour les erreurs.
 *
 * Monter ce composant au niveau de la page ou de la section concernée.
 * Ne pas le placer dans le layout global pour ne pas parasiter les autres pages.
 *
 * @example
 * const { notifications, afficher, fermer } = useNotifications();
 * return (
 *   <>
 *     <ZoneNotifications notifications={notifications} onFermer={fermer} />
 *     <button onClick={() => afficher({ type: "succes", message: "Enregistré." })}>
 *       Enregistrer
 *     </button>
 *   </>
 * );
 */
export function ZoneNotifications({ notifications, onFermer }: ZoneNotificationsProps) {
  const nonCritiques = notifications.filter((n) => n.type !== "erreur");
  const critiques = notifications.filter((n) => n.type === "erreur");

  return (
    <>
      <StylesConsole />
      <StylesRetours />

      <div className="csRetZoneNotif">
        {/* Région polite : succès, alertes, informations. */}
        <div aria-live="polite" aria-relevant="additions removals" aria-atomic="false" className="csRetRegion">
          {nonCritiques.map((n) => (
            <Carte key={n.id} notif={n} onFermer={onFermer} />
          ))}
        </div>

        {/* Région assertive : erreurs uniquement. */}
        <div aria-live="assertive" aria-relevant="additions removals" aria-atomic="false" className="csRetRegion">
          {critiques.map((n) => (
            <Carte key={n.id} notif={n} onFermer={onFermer} />
          ))}
        </div>
      </div>
    </>
  );
}
