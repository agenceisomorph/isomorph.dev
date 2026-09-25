"use client";

/**
 * Vitrine : composants de formulaire du système Console.
 * Ce fichier n'appartient pas au site : c'est la page /atelier/console.
 *
 * Chaque Planche montre les états d'un composant.
 * La Planche "Parcours de contact" monte ParcoursContact.tsx avec les
 * vrais libellés et options de ContactJourney.tsx. Ce formulaire de
 * vitrine n'envoie rien au réseau.
 */

import { useState } from "react";
import { Bouton } from "../Bouton";
import { Champ } from "../formulaires/Champ";
import { ZoneTexte } from "../formulaires/ZoneTexte";
import { Liste } from "../formulaires/Liste";
import { Case } from "../formulaires/Case";
import { Radio } from "../formulaires/Radio";
import { Interrupteur } from "../formulaires/Interrupteur";
import { ParcoursContact } from "../formulaires/ParcoursContact";
import type { DonneesParcours } from "../formulaires/ParcoursContact";
import { Planche, SectionVitrine } from "./kit";

/* Options reprises de `contact/ContactJourney.tsx`, sans ajout. */
const OPTIONS_TYPE_PROJET = [
  { valeur: "web", libelle: "Un site internet" },
  { valeur: "saas", libelle: "Une plateforme ou un logiciel métier" },
  { valeur: "devops", libelle: "Un site existant à reprendre : performance, sécurité, conformité" },
  { valeur: "seo", libelle: "Être trouvé : référencement naturel et Google Ads" },
  { valeur: "app_native", libelle: "Une application mobile" },
];

const OPTIONS_BUDGET = [
  { valeur: "moins-15k", libelle: "Moins de 15 000 € HT" },
  { valeur: "15k-40k", libelle: "De 15 000 à 40 000 € HT" },
  { valeur: "40k-100k", libelle: "De 40 000 à 100 000 € HT" },
  { valeur: "plus-100k", libelle: "Plus de 100 000 € HT" },
  { valeur: "pas-encore", libelle: "Pas encore arrêté" },
];

/* ------------------------------------------------------------------ */
/* Planche Champ                                                       */
/* ------------------------------------------------------------------ */

function PlancheChamp() {
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("contact@exemple.fr");
  return (
    <Planche nom="Champ de saisie" note="Vide, rempli, en erreur, indisponible.">
      <div className="grid gap-6 md:grid-cols-2">
        <Champ libelle="Prénom" valeur={v1} onChange={setV1} obligatoire />
        <Champ
          libelle="Email"
          type="email"
          valeur={v2}
          onChange={setV2}
          valide
          autoComplete="email"
        />
        <Champ
          libelle="Nom"
          valeur=""
          onChange={() => {}}
          erreur="Il manque votre nom."
          obligatoire
        />
        <Champ
          libelle="Téléphone"
          type="tel"
          valeur="+33 6 00 00 00 00"
          onChange={() => {}}
          desactive
          aide="Utilisé seulement si vous préférez un échange de vive voix."
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche ZoneTexte                                                   */
/* ------------------------------------------------------------------ */

function PlancheZoneTexte() {
  const [desc, setDesc] = useState("");
  return (
    <Planche nom="Zone de texte" note="Avec compteur, en erreur, indisponible.">
      <div className="grid gap-6 md:grid-cols-2">
        <ZoneTexte
          libelle="Votre projet, avec vos mots"
          aide="Ce que vous voulez faire, pour qui, et ce qui vous a décidé à en parler maintenant. Trois lignes suffisent."
          valeur={desc}
          onChange={setDesc}
          limiteCaracteres={2000}
          obligatoire
          rows={4}
        />
        <ZoneTexte
          libelle="Description"
          valeur=""
          onChange={() => {}}
          erreur="Quelques mots sur votre projet, et nous pourrons commencer."
          rows={4}
        />
        <ZoneTexte
          libelle="Notes internes"
          valeur="Cette zone est désactivée."
          onChange={() => {}}
          desactive
          rows={3}
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Liste                                                       */
/* ------------------------------------------------------------------ */

function PlancheListe() {
  const [type, setType] = useState("");
  return (
    <Planche nom="Liste déroulante" note="Jamais la liste native du navigateur. Se pilote aussi au clavier.">
      <div className="grid gap-6 md:grid-cols-2">
        <Liste
          libelle="De quoi s'agit-il ?"
          options={OPTIONS_TYPE_PROJET}
          valeur={type}
          onChange={setType}
          placeholder="Choisissez un type"
          obligatoire
        />
        <Liste
          libelle="Type de projet"
          options={OPTIONS_TYPE_PROJET}
          valeur="seo"
          onChange={() => {}}
        />
        <Liste
          libelle="Type de projet"
          options={OPTIONS_TYPE_PROJET}
          valeur=""
          onChange={() => {}}
          erreur="Choisissez la ligne la plus proche. Nous préciserons ensemble."
        />
        <Liste
          libelle="Type de projet"
          options={OPTIONS_TYPE_PROJET}
          valeur="web"
          onChange={() => {}}
          desactive
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Case                                                        */
/* ------------------------------------------------------------------ */

function PlancheCase() {
  const [cochee, setCochee] = useState(false);
  return (
    <Planche nom="Case à cocher" note="Vide, cochée, en erreur, indisponible.">
      <div className="flex flex-wrap gap-8">
        <Case
          libelle="Case à cocher"
          cochee={cochee}
          onChange={setCochee}
        />
        <Case libelle="Case cochée" cochee={true} onChange={() => {}} />
        <Case
          libelle="Case en erreur"
          cochee={false}
          onChange={() => {}}
          erreur="Cette case est obligatoire."
        />
        <Case
          libelle="Case indisponible"
          cochee={false}
          onChange={() => {}}
          desactive
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Radio                                                       */
/* ------------------------------------------------------------------ */

function PlancheRadio() {
  const [budget, setBudget] = useState("");
  return (
    <Planche nom="Boutons radio" note="Un seul choix possible.">
      <div className="grid gap-8 md:grid-cols-2">
        <Radio
          nom="budget-demo"
          legende="Budget envisagé"
          aide="Cette fourchette sert à savoir si nous sommes le bon interlocuteur."
          options={OPTIONS_BUDGET}
          valeur={budget}
          onChange={setBudget}
        />
        <Radio
          nom="budget-demo2"
          legende="Budget envisagé, indisponible"
          options={OPTIONS_BUDGET}
          valeur="15k-40k"
          onChange={() => {}}
          desactive
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Interrupteur                                                */
/* ------------------------------------------------------------------ */

function PlancheInterrupteur() {
  const [notifs, setNotifs] = useState(false);
  return (
    <Planche nom="Interrupteur" note="Effet immédiat, sans bouton d'envoi.">
      <div className="flex flex-wrap gap-8">
        <Interrupteur
          libelle="Interrupteur éteint"
          coche={notifs}
          onChange={setNotifs}
        />
        <Interrupteur
          libelle="Interrupteur allumé"
          coche={true}
          onChange={() => {}}
        />
        <Interrupteur
          libelle="Interrupteur indisponible"
          coche={false}
          onChange={() => {}}
          desactive
        />
      </div>
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Planche Parcours de contact                                         */
/* ------------------------------------------------------------------ */

function PlancheParcours() {
  const [simulerEchec, setSimulerEchec] = useState(false);
  /* Clé pour réinitialiser le parcours depuis la vitrine. */
  const [cle, setCle] = useState(0);

  async function onEnvoyer(donnees: DonneesParcours): Promise<{ ok: boolean }> {
    /* Vitrine uniquement : aucun appel réseau. Délai court (1.2 s) pour
       que l'état "envoi en cours" soit visible. */
    void donnees;
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    return { ok: !simulerEchec };
  }

  return (
    <Planche nom="Parcours de contact" note="Le formulaire /contact en trois étapes, sans envoi réseau.">
      {/* Contrôles de la vitrine : en dehors du formulaire. */}
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <Case
          libelle="Simuler un échec d'envoi"
          cochee={simulerEchec}
          onChange={setSimulerEchec}
        />
        <Bouton
          variante="tertiaire"
          fleche={false}
          onClick={() => setCle((k) => k + 1)}
        >
          Réinitialiser
        </Bouton>
      </div>

      <ParcoursContact key={cle} onEnvoyer={onEnvoyer} />
    </Planche>
  );
}

/* ------------------------------------------------------------------ */
/* Section principale                                                  */
/* ------------------------------------------------------------------ */

export function VitrineFormulaires() {
  return (
    <SectionVitrine
      id="formulaires"
      index={4}
      surtitre="Formulaires"
      titre="Champs et contrôles"
      alterne
    >
      <PlancheChamp />
      <PlancheZoneTexte />
      <PlancheListe />
      <PlancheCase />
      <PlancheRadio />
      <PlancheInterrupteur />
      <PlancheParcours />
    </SectionVitrine>
  );
}
