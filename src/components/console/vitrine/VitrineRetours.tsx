/**
 * Vitrine du système Console : famille « Retours ».
 *
 * Démos interactives de Modale, ZoneNotifications, InfoBulle, Progression
 * et Chargement. Les boutons ouvrent réellement les composants.
 *
 * "use client" : état des démos (modale ouverte, étape courante, valeur barre).
 */

"use client";

import { useRef, useState } from "react";

import { Bouton } from "../Bouton";
import { Panneau } from "../fondations";
import { RoueChargement, SquelettesChargement } from "../retours/Chargement";
import { InfoBulle } from "../retours/InfoBulle";
import { Modale } from "../retours/Modale";
import {
  CarteNotification,
  ZoneNotifications,
  useNotifications,
} from "../retours/Notification";
import { ETAPES_CONTACT, ProgressionBarre, ProgressionEtapes } from "../retours/Progression";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Planche Modale                                                      */
/* ------------------------------------------------------------------ */

function DemoModale() {
  const [ouvert, setOuvert] = useState(false);
  const refDeclencheur = useRef<HTMLButtonElement>(null);

  return (
    <Planche nom="Modale" note="Échap ou un clic à côté la ferment.">
      <Bouton ref={refDeclencheur} onClick={() => setOuvert(true)}>
        Ouvrir la modale
      </Bouton>

      {/* Textes : confirmation réelle de /contact (`contact/ContactJourney.tsx`). */}
      <Modale
        ouvert={ouvert}
        onFermer={() => setOuvert(false)}
        titre="Votre projet est arrivé."
        refDeclencheur={refDeclencheur}
      >
        <div className="py-4">
          <p className="type-lead text-(--cs-texte-2)">
            Votre message est arrivé en entier. Vous recevrez un accusé de réception par courriel, puis une réponse
            personnelle.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Bouton onClick={() => setOuvert(false)} fleche={false}>
              Fermer
            </Bouton>
          </div>
        </div>
      </Modale>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Notifications                                              */
/* ------------------------------------------------------------------ */

/** Messages réels du formulaire de contact (`contact/ContactJourney.tsx`). */
const MESSAGES = {
  succes: { titre: "Votre projet est arrivé.", message: "Vous recevrez un accusé de réception par courriel." },
  alerte: { message: "Trop de messages depuis cet appareil. Réessayez dans une heure, ou écrivez à contact@isomorph.fr." },
  erreur: { titre: "Envoi impossible", message: "Le message n'est pas parti. Réessayez, ou écrivez à contact@isomorph.fr." },
  info: { message: "La messagerie est momentanément indisponible. Écrivez à contact@isomorph.fr, votre message arrivera au même endroit." },
} as const;

/** Durées des démos : l'erreur reste jusqu'à sa fermeture. */
const DUREES = { succes: 4000, alerte: 4000, erreur: undefined, info: 6000 } as const;
const TYPES = ["succes", "alerte", "erreur", "info"] as const;
const BOUTONS = { succes: "Succès", alerte: "Alerte", erreur: "Erreur", info: "Information" } as const;

function DemoNotifications() {
  const { notifications, afficher, fermer } = useNotifications();

  return (
    <Planche nom="Notifications" note="Disparaissent seules, sauf l'erreur. Le survol les retient.">
      <ZoneNotifications notifications={notifications} onFermer={fermer} />

      <div className="csRetApercu">
        {TYPES.map((type) => (
          <CarteNotification key={type} notif={{ type, ...MESSAGES[type], duree: DUREES[type] }} />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {TYPES.map((type) => (
          <Bouton
            key={type}
            variante="secondaire"
            fleche={false}
            onClick={() => afficher({ type, ...MESSAGES[type], duree: DUREES[type] })}
          >
            {BOUTONS[type]}
          </Bouton>
        ))}
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Info-bulle                                                  */
/* ------------------------------------------------------------------ */

function DemoInfoBulle() {
  return (
    <Planche nom="Info-bulle" note="Au survol et au clavier. Jamais d'information indispensable.">
      <div className="flex flex-wrap items-center gap-6">
        <InfoBulle contenu="Parcours en trois étapes" placement="haut">
          <Bouton href="/contact" variante="secondaire">
            Décrire votre projet
          </Bouton>
        </InfoBulle>

        <InfoBulle contenu="Composants publiés en open source" placement="bas">
          <Bouton href="/plugins" variante="tertiaire">
            Notre code
          </Bouton>
        </InfoBulle>

        {/* Statut sourcé : `CLAUDE.md` du dépôt, « Vérités factuelles ». */}
        <InfoBulle contenu="Expert conseil agréé Bpifrance" placement="haut">
          <button type="button" className="csRetIcone" aria-label="Agrément Bpifrance">
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
              <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 7.2 V11.5 M8 4.6 V5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="none" />
            </svg>
          </button>
        </InfoBulle>
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Progression                                                 */
/* ------------------------------------------------------------------ */

function DemoProgression() {
  const [etape, setEtape] = useState(1);
  const valeur = Math.round((etape / ETAPES_CONTACT.length) * 100);

  return (
    <Planche nom="Progression" note="Les trois étapes du formulaire de contact.">
      <div className="max-w-2xl space-y-8">
        <ProgressionEtapes etapes={ETAPES_CONTACT} etapeCourante={etape} />
        <ProgressionBarre valeur={valeur} label="Avancement du formulaire" afficherValeur />
        <div className="flex flex-wrap gap-6">
          <Bouton variante="tertiaire" fleche={false} desactive={etape <= 1} onClick={() => setEtape((e) => Math.max(1, e - 1))}>
            Étape précédente
          </Bouton>
          <Bouton
            variante="tertiaire"
            desactive={etape >= ETAPES_CONTACT.length}
            onClick={() => setEtape((e) => Math.min(ETAPES_CONTACT.length, e + 1))}
          >
            Étape suivante
          </Bouton>
        </div>
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Chargement                                                  */
/* ------------------------------------------------------------------ */

function DemoChargement() {
  return (
    <Planche nom="Chargement" note="Roue pour une action, silhouettes pour un contenu qui arrive.">
      <div className="space-y-8">
        {/* Roues */}
        <div className="flex flex-wrap items-center gap-6">
          <RoueChargement taille="s" />
          <RoueChargement taille="m" />
          <RoueChargement taille="l" />

          <Panneau coupe="s" className="flex items-center gap-3 px-4 py-3">
            <RoueChargement taille="s" />
            <span className="type-body text-(--cs-texte-2)">Chargement…</span>
          </Panneau>
        </div>

        {/* Squelettes */}
        <SquelettesChargement nombre={3} />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Section vitrine                                                     */
/* ------------------------------------------------------------------ */

export function VitrineRetours() {
  return (
    <SectionVitrine
      id="retours"
      index={6}
      surtitre="Retours"
      titre="Modale, notifications, progression"
      alterne
    >
      <DemoModale />
      <DemoNotifications />
      <DemoInfoBulle />
      <DemoProgression />
      <DemoChargement />
    </SectionVitrine>
  );
}
