"use client";

/**
 * Parcours de contact en trois étapes, style Console.
 *
 * Source des champs, libellés, options et messages d'erreur :
 * src/components/contact/ContactJourney.tsx (DA CANVAS §5,
 * _docs/da-canvas-home-contact-2026-07-31.md).
 *
 * Arbitrages :
 * - RGAA 4.1 : critère 7.1 (aria-current="step" via ProgressionEtapes) ;
 *   critère 11.10 (erreurs reliées par aria-invalid + aria-describedby,
 *   portés par Champ, ZoneTexte, Liste, Radio) ; critère 9.1 (focus déplacé
 *   sur le titre de l'étape au changement, tabIndex=-1 + .focus()) ;
 *   aria-live "polite" pour l'annonce AT.
 * - Éco : transition CSS seulement (fondu 200 ms), aucune librairie tierce.
 * - Perf : "use client" justifié par l'état multi-étapes ; premier rendu
 *   navigateur identique au rendu serveur (aucun conditionnel sur window
 *   ni sur la préférence de mouvement).
 * - Sécu : prop onEnvoyer côté appelant ; honeypot identique à
 *   ContactJourney.tsx (/api/contact/route.ts) ; aucune donnée exposée.
 * - Mouvement réduit : @media (prefers-reduced-motion: reduce) neutralise le
 *   fondu en CSS ; jamais de conditionnel React sur la préférence.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Panneau, StylesConsole } from "../fondations";
import { Bouton } from "../Bouton";
import { Champ } from "./Champ";
import { ZoneTexte } from "./ZoneTexte";
import { Liste } from "./Liste";
import { Radio } from "./Radio";
import { ProgressionEtapes, ETAPES_CONTACT } from "../retours/Progression";

/* ------------------------------------------------------------------ */
/* Constantes reprises de ContactJourney.tsx sans ajout ni modification */
/* ------------------------------------------------------------------ */

/** Source : ContactJourney.tsx, PROJECT_TYPE_OPTIONS. */
const OPTIONS_TYPE_PROJET = [
  { valeur: "web", libelle: "Un site internet" },
  { valeur: "saas", libelle: "Une plateforme ou un logiciel métier" },
  {
    valeur: "devops",
    libelle: "Un site existant à reprendre : performance, sécurité, conformité",
  },
  {
    valeur: "seo",
    libelle: "Être trouvé : référencement naturel et Google Ads",
  },
  { valeur: "app_native", libelle: "Une application mobile" },
];

/** Source : ContactJourney.tsx, BUDGET_OPTIONS. */
export const OPTIONS_BUDGET = [
  { valeur: "moins-15k", libelle: "Moins de 15 000 € HT" },
  { valeur: "15k-40k", libelle: "De 15 000 à 40 000 € HT" },
  { valeur: "40k-100k", libelle: "De 40 000 à 100 000 € HT" },
  { valeur: "plus-100k", libelle: "Plus de 100 000 € HT" },
  { valeur: "pas-encore", libelle: "Pas encore arrêté" },
];

/* Expressions régulières : source ContactJourney.tsx. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPHONE_RE = /^[0-9+().\s-]{6,}$/;

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

type Etape = 1 | 2 | 3;

interface ValeursParcours {
  typeProjet: string;
  description: string;
  societe: string;
  budget: string;
  siteActuel: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
}

const VALEURS_INITIALES: ValeursParcours = {
  typeProjet: "",
  description: "",
  societe: "",
  budget: "",
  siteActuel: "",
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
};

/** Données passées à onEnvoyer. */
export interface DonneesParcours {
  typeProjet: string;
  description: string;
  societe: string;
  budget: string;
  siteActuel: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  /** Champ piège à robots, vide chez un humain (vérifié par /api/contact). */
  honeypot: string;
}

/** Réponse de onEnvoyer ; `message` remplace le texte d'échec par défaut. */
export interface ResultatEnvoi {
  ok: boolean;
  message?: string;
}

export interface ParcoursContactProps {
  /**
   * Rappelé lors de l'envoi final (étape 3 validée).
   * Dans la vitrine : simule un envoi sans appel réseau.
   * En production : appelle /api/contact et retourne { ok: boolean }.
   */
  onEnvoyer: (donnees: DonneesParcours) => Promise<ResultatEnvoi>;
}

/* ------------------------------------------------------------------ */
/* Styles propres au composant                                          */
/* ------------------------------------------------------------------ */

/** Feuille injectée une seule fois par React (même href). */
function StylesParcours() {
  return (
    <style href="console-parcours" precedence="ds">
      {`
/* Conteneur d'étape : fondu court au changement d'étape (re-montage via key). */
.csParcEtape {
  animation: csParcApparition 200ms ease-out both;
}
@keyframes csParcApparition {
  from { opacity: 0; translate: 0 6px; }
  to   { opacity: 1; translate: 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .csParcEtape { animation: none; }
}

/* Titre d'étape : focus clavier allume le texte, jamais d'anneau. */
.csParcTitre:focus-visible {
  outline: none;
  color: var(--cs-neon);
  text-shadow: 0 0 18px rgba(56, 189, 248, 0.45);
}

/* Séparateur néon sous la barre de progression. */
.csParcSeparateur {
  height: 1px;
  background: var(--cs-neon-doux);
  margin: 1.5rem 0 2rem;
}

/* Bloc de récapitulatif (étape 3, aside). */
.csParcRecap {
  border-left: 1px solid var(--cs-neon-doux);
  padding-left: 1.5rem;
}

/* Erreur d'envoi. */
.csParcErreurEnvoi {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  margin-top: 1rem;
  background: rgba(252, 165, 165, 0.07);
  color: var(--cs-erreur);
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.45;
}

/* Écran de confirmation. */
.csParcConfirmation {
  animation: csParcApparition 300ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .csParcConfirmation { animation: none; }
}
      `}
    </style>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                  */
/* ------------------------------------------------------------------ */

/**
 * Formulaire de contact en trois étapes dans le style Console.
 * La prop onEnvoyer pilote l'envoi ; le composant ne connaît pas l'URL.
 *
 * @example
 * // Production
 * <ParcoursContact onEnvoyer={async (d) => {
 *   const res = await fetch("/api/contact", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(d),
 *   });
 *   const json = await res.json().catch(() => ({ ok: false }));
 *   return { ok: res.ok && Boolean(json.ok) };
 * }} />
 */
export function ParcoursContact({ onEnvoyer }: ParcoursContactProps) {
  const [etape, setEtape] = useState<Etape>(1);
  const [statut, setStatut] = useState<"formulaire" | "succes">("formulaire");
  const [valeurs, setValeurs] = useState<ValeursParcours>(VALEURS_INITIALES);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [annonce, setAnnonce] = useState("");

  /** Refs des titres d'étapes pour le déplacement du focus (RGAA 9.1). */
  const titrePas1 = useRef<HTMLHeadingElement>(null);
  const titrePas2 = useRef<HTMLHeadingElement>(null);
  const titrePas3 = useRef<HTMLHeadingElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const premierRendu = useRef(true);

  const TITRE_REFS: Record<Etape, React.RefObject<HTMLHeadingElement | null>> = {
    1: titrePas1,
    2: titrePas2,
    3: titrePas3,
  };

  /* Source : noms des étapes, ContactJourney.tsx, STEP_TITLES. */
  const LIBELLES_ETAPES: Record<Etape, string> = {
    1: "Votre projet",
    2: "Votre contexte",
    3: "Vous joindre",
  };

  function definir<K extends keyof ValeursParcours>(
    cle: K,
    val: ValeursParcours[K],
  ) {
    setValeurs((v) => ({ ...v, [cle]: val }));
  }

  /* Déplacement du focus et annonce AT à chaque changement d'étape.
     Ignoré au premier rendu : le focus ne doit pas être volé au visiteur.
     Source : ContactJourney.tsx, useEffect sur [step]. */
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    setAnnonce(`Étape ${etape} sur 3 : ${LIBELLES_ETAPES[etape]}`);
    TITRE_REFS[etape].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etape]);

  /* Focus sur la région de confirmation (RGAA). */
  useEffect(() => {
    if (statut === "succes") {
      confirmationRef.current?.focus();
    }
  }, [statut]);

  /* ------ Validation (messages : ContactJourney.tsx validateStep1/2/3) ------ */

  function validerEtape1(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!valeurs.typeProjet)
      e.typeProjet =
        "Choisissez la ligne la plus proche. Nous préciserons ensemble.";
    const desc = valeurs.description.trim();
    if (!desc)
      e.description =
        "Quelques mots sur votre projet, et nous pourrons commencer.";
    else if (desc.length < 20)
      e.description =
        "Quelques mots de plus nous aideront à préparer une réponse utile.";
    else if (desc.length > 2000)
      e.description =
        "Vous avez atteint la limite de ce champ. La suite, nous en parlerons.";
    return e;
  }

  function validerEtape2(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!valeurs.societe.trim()) e.societe = "Il manque le nom de votre société.";
    const site = valeurs.siteActuel.trim();
    if (site && !/^https?:\/\//.test(site))
      e.siteActuel = "Ajoutez http:// ou https:// devant l'adresse.";
    return e;
  }

  function validerEtape3(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!valeurs.prenom.trim()) e.prenom = "Il manque votre prénom.";
    if (!valeurs.nom.trim()) e.nom = "Il manque votre nom.";
    const email = valeurs.email.trim();
    if (!email)
      e.email = "Sans adresse, la réponse ne pourra pas vous parvenir.";
    else if (!EMAIL_RE.test(email)) e.email = "Cette adresse semble incomplète.";
    const tel = valeurs.telephone.trim();
    if (tel && !TELEPHONE_RE.test(tel))
      e.telephone = "Ce numéro ne semble pas complet.";
    return e;
  }

  const VALIDATEURS: Record<Etape, () => Record<string, string>> = {
    1: validerEtape1,
    2: validerEtape2,
    3: validerEtape3,
  };

  function focusChampInvalide(cle: string) {
    /* Les ids sont préfixés "parc-" : parc-typeProjet, parc-description, etc. */
    const el = document.getElementById(`parc-${cle}`);
    if (el) {
      el.focus();
    } else {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs = VALIDATEURS[etape]();
    setErreurs(errs);
    const premiereCle = Object.keys(errs)[0];
    if (premiereCle) {
      focusChampInvalide(premiereCle);
      return;
    }

    if (etape < 3) {
      setEtape((s) => (s + 1) as Etape);
    } else {
      void soumettre();
    }
  }

  function reculer() {
    setErreurs({});
    setEtape((s) => (s - 1) as Etape);
  }

  /* Vérification du format email au blur.
     Source : ContactJourney.tsx, onEmailBlur(). */
  function onEmailBlur() {
    const email = valeurs.email.trim();
    if (!email) return;
    setErreurs((prev) => {
      if (EMAIL_RE.test(email)) {
        if (!prev.email) return prev;
        const suivant = { ...prev };
        delete suivant.email;
        return suivant;
      }
      return { ...prev, email: "Cette adresse semble incomplète." };
    });
  }

  async function soumettre() {
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      const resultat = await onEnvoyer({
        typeProjet: valeurs.typeProjet,
        description: valeurs.description.trim(),
        societe: valeurs.societe.trim(),
        budget: valeurs.budget,
        siteActuel: valeurs.siteActuel.trim(),
        prenom: valeurs.prenom.trim(),
        nom: valeurs.nom.trim(),
        email: valeurs.email.trim(),
        telephone: valeurs.telephone.trim(),
        honeypot,
      });
      if (resultat.ok) {
        setStatut("succes");
      } else {
        setErreurEnvoi(
          resultat.message ??
            "Le message n'est pas parti. Réessayez, ou écrivez à contact@isomorph.fr.",
        );
      }
    } catch {
      setErreurEnvoi(
        "Le message n'est pas parti. Réessayez, ou écrivez à contact@isomorph.fr.",
      );
    } finally {
      setEnvoi(false);
    }
  }

  /* ------ Écran de confirmation ------ */

  if (statut === "succes") {
    const libelleType =
      OPTIONS_TYPE_PROJET.find((o) => o.valeur === valeurs.typeProjet)
        ?.libelle ?? "";
    const libelleBudget = OPTIONS_BUDGET.find(
      (o) => o.valeur === valeurs.budget,
    )?.libelle;

    return (
      <Panneau coupe="l" accent equerres flou className="p-6 md:p-10">
        <StylesConsole />
        <StylesParcours />

        <div
          ref={confirmationRef}
          tabIndex={-1}
          role="region"
          aria-label="Confirmation d'envoi"
          className="csParcConfirmation outline-none"
        >
          {/* Titre et texte : source ContactJourney.tsx, lignes 309-313. */}
          <h2 className="type-h2 text-white">Votre projet est arrivé.</h2>
          <p className="type-lead mt-4 text-(--cs-texte-2)">
            Votre message est arrivé en entier. Vous recevrez un accusé de
            réception par courriel, puis une réponse personnelle.
          </p>

          {/* Récapitulatif de ce qui a été envoyé. */}
          <div className="mt-8 space-y-5 csParcRecap">
            <div>
              <p className="type-caption uppercase tracking-[0.18em] text-(--cs-texte-3)">
                Votre projet
              </p>
              <p className="type-body mt-1 text-white">{libelleType}</p>
              {valeurs.description.trim() && (
                <p className="type-caption mt-1 line-clamp-3 text-(--cs-texte-2)">
                  {valeurs.description.trim()}
                </p>
              )}
            </div>
            <div>
              <p className="type-caption uppercase tracking-[0.18em] text-(--cs-texte-3)">
                Votre contexte
              </p>
              <p className="type-body mt-1 text-white">{valeurs.societe.trim()}</p>
              {libelleBudget && (
                <p className="type-caption mt-1 text-(--cs-texte-2)">
                  {libelleBudget}
                </p>
              )}
            </div>
            <div>
              <p className="type-caption uppercase tracking-[0.18em] text-(--cs-texte-3)">
                Destinataire de la réponse
              </p>
              <p className="type-body mt-1 text-white">
                {valeurs.prenom.trim()} {valeurs.nom.trim()}
              </p>
              <p className="type-caption mt-1 text-(--cs-texte-2)">
                {valeurs.email.trim()}
              </p>
            </div>
          </div>
        </div>
      </Panneau>
    );
  }

  /* ------ Formulaire ------ */

  return (
    <Panneau coupe="l" accent equerres flou className="p-6 md:p-10">
      <StylesConsole />
      <StylesParcours />

      {/* Annonce de transition d'étape pour les technologies d'assistance. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {annonce}
      </div>

      {/* Indicateur d'étapes : ProgressionEtapes de retours/Progression.tsx.
          ETAPES_CONTACT = [Votre projet, Votre contexte, Vous joindre]. */}
      <ProgressionEtapes
        etapes={ETAPES_CONTACT}
        etapeCourante={etape}
        label="Étapes du parcours de contact"
      />
      <div aria-hidden="true" className="csParcSeparateur" />

      <form noValidate aria-busy={envoi} onSubmit={onSubmit}>
        {/* La div reçoit key={etape} : à chaque changement, React la remonte
            et la classe csParcEtape déclenche le fondu d'entrée. */}
        <div key={etape} className="csParcEtape">
          {/* ---- Étape 1 : Votre projet ---- */}
          {etape === 1 && (
            <>
              <h2
                ref={titrePas1}
                tabIndex={-1}
                className="type-h2 text-white csParcTitre"
              >
                Votre projet
              </h2>
              {/* Source : ContactJourney.tsx, step 1 intro. */}
              <p className="type-body mt-2 text-(--cs-texte-2)">
                Commençons par ce qui vous amène. Le reste attendra.
              </p>

              <div className="mt-8 space-y-6">
                {/* Source : ContactJourney.tsx, champ projectType + label
                    "De quoi s'agit-il ?" + placeholder "Choisissez un type". */}
                <Liste
                  id="parc-typeProjet"
                  libelle="De quoi s'agit-il ?"
                  options={OPTIONS_TYPE_PROJET}
                  valeur={valeurs.typeProjet}
                  onChange={(v) => definir("typeProjet", v)}
                  erreur={erreurs.typeProjet}
                  obligatoire
                  placeholder="Choisissez un type"
                />

                {/* Source : ContactJourney.tsx, champ description + libellé
                    "Votre projet, avec vos mots" + aide + 5 lignes + max 2000. */}
                <ZoneTexte
                  id="parc-description"
                  libelle="Votre projet, avec vos mots"
                  aide="Ce que vous voulez faire, pour qui, et ce qui vous a décidé à en parler maintenant. Trois lignes suffisent."
                  valeur={valeurs.description}
                  onChange={(v) => definir("description", v)}
                  erreur={erreurs.description}
                  limiteCaracteres={2000}
                  obligatoire
                  rows={5}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Bouton type="submit">Continuer</Bouton>
              </div>
            </>
          )}

          {/* ---- Étape 2 : Votre contexte ---- */}
          {etape === 2 && (
            <>
              <h2
                ref={titrePas2}
                tabIndex={-1}
                className="type-h2 text-white csParcTitre"
              >
                Votre contexte
              </h2>
              {/* Source : ContactJourney.tsx, step 2 intro. */}
              <p className="type-body mt-2 text-(--cs-texte-2)">
                Deux repères pour préparer une réponse utile.
              </p>

              <div className="mt-8 space-y-6">
                {/* Source : ContactJourney.tsx, champ company + placeholder
                    "Acme SAS" + autoComplete organization. */}
                <Champ
                  id="parc-societe"
                  libelle="Société"
                  valeur={valeurs.societe}
                  onChange={(v) => definir("societe", v)}
                  erreur={erreurs.societe}
                  obligatoire
                  autoComplete="organization"
                  placeholder="Acme SAS"
                />

                {/* Source : ContactJourney.tsx, fieldset budget + aide. */}
                <Radio
                  nom="parc-budget"
                  legende="Budget envisagé"
                  aide="Nous chiffrons après un cadrage écrit, jamais sur une grille de tarifs. Cette fourchette sert à savoir si nous sommes le bon interlocuteur, pas à préparer un prix."
                  options={OPTIONS_BUDGET}
                  valeur={valeurs.budget}
                  onChange={(v) => definir("budget", v)}
                />

                {/* Source : ContactJourney.tsx, champ currentSite + placeholder
                    "https://..." (type url non disponible dans Champ Console :
                    type text utilisé, la validation vérifie le préfixe http/s). */}
                <Champ
                  id="parc-siteActuel"
                  libelle="Votre site actuel, si vous en avez un (optionnel)"
                  valeur={valeurs.siteActuel}
                  onChange={(v) => definir("siteActuel", v)}
                  erreur={erreurs.siteActuel}
                  placeholder="https://..."
                  autoComplete="url"
                />
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Bouton type="button" variante="secondaire" onClick={reculer}>
                  Précédent
                </Bouton>
                <Bouton type="submit">Continuer</Bouton>
              </div>
            </>
          )}

          {/* ---- Étape 3 : Vous joindre ---- */}
          {etape === 3 && (
            <div className="lg:grid lg:grid-cols-[1fr_18rem] lg:gap-10">
              {/* Champs de coordonnées */}
              <div>
                <h2
                  ref={titrePas3}
                  tabIndex={-1}
                  className="type-h2 text-white csParcTitre"
                >
                  Vous joindre
                </h2>
                {/* Source : ContactJourney.tsx, step 3 intro. */}
                <p className="type-body mt-2 text-(--cs-texte-2)">
                  Pour que la réponse arrive au bon endroit.
                </p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {/* Source : ContactJourney.tsx, champs firstName + lastName. */}
                  <Champ
                    id="parc-prenom"
                    libelle="Prénom"
                    valeur={valeurs.prenom}
                    onChange={(v) => definir("prenom", v)}
                    erreur={erreurs.prenom}
                    obligatoire
                    autoComplete="given-name"
                  />
                  <Champ
                    id="parc-nom"
                    libelle="Nom"
                    valeur={valeurs.nom}
                    onChange={(v) => definir("nom", v)}
                    erreur={erreurs.nom}
                    obligatoire
                    autoComplete="family-name"
                  />
                </div>

                <div className="mt-6 space-y-6">
                  {/* Source : ContactJourney.tsx, champs email + phone. */}
                  <Champ
                    id="parc-email"
                    libelle="Email"
                    type="email"
                    valeur={valeurs.email}
                    onChange={(v) => definir("email", v)}
                    onBlur={onEmailBlur}
                    erreur={erreurs.email}
                    obligatoire
                    autoComplete="email"
                  />
                  <Champ
                    id="parc-telephone"
                    libelle="Téléphone (facultatif)"
                    type="tel"
                    valeur={valeurs.telephone}
                    onChange={(v) => definir("telephone", v)}
                    erreur={erreurs.telephone}
                    aide="Utilisé seulement si vous préférez un échange de vive voix."
                    autoComplete="tel"
                  />
                </div>

                {/* Piège à bots : masqué visuellement et aux technologies
                    d'assistance. Source : ContactJourney.tsx, champ honeypot. */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />

                {/* Mention légale. Source : ContactJourney.tsx. */}
                <p className="type-caption mt-6 text-(--cs-texte-3)">
                  Ces informations servent uniquement à traiter votre demande.{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="text-(--cs-texte-2) underline underline-offset-2 hover:text-white focus-visible:text-(--cs-neon) focus-visible:outline-none"
                  >
                    Politique de confidentialité
                  </Link>
                  .
                </p>

                {/* Erreur d'envoi (rate-limit, service indisponible, erreur réseau).
                    Source : ContactJourney.tsx, messages d'erreur handleSubmit. */}
                {erreurEnvoi && (
                  <div role="alert" className="csParcErreurEnvoi">
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M7 4v3.5M7 9.5v.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    {erreurEnvoi}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between gap-3">
                  <Bouton
                    type="button"
                    variante="secondaire"
                    desactive={envoi}
                    onClick={reculer}
                  >
                    Précédent
                  </Bouton>
                  <Bouton type="submit" chargement={envoi} desactive={envoi}>
                    Confier votre projet
                  </Bouton>
                </div>
              </div>

              {/* Récapitulatif à droite (lg et plus).
                  Source : ContactJourney.tsx, <aside> de l'étape 3. */}
              <aside
                aria-label="Récapitulatif de votre demande"
                className="mt-10 lg:mt-0"
              >
                <div className="csParcRecap space-y-5">
                  <h3 className="type-h3 text-white">Votre demande</h3>

                  <div>
                    <p className="type-caption uppercase tracking-[0.18em] text-(--cs-texte-3)">
                      Votre projet
                    </p>
                    {/* typeProjet est requis et validé avant l'étape 3. */}
                    <p className="type-body mt-1 text-white">
                      {OPTIONS_TYPE_PROJET.find(
                        (o) => o.valeur === valeurs.typeProjet,
                      )?.libelle ?? ""}
                    </p>
                    {valeurs.description.trim() && (
                      <p className="type-caption mt-1 line-clamp-4 text-(--cs-texte-2)">
                        {valeurs.description.trim()}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="type-caption uppercase tracking-[0.18em] text-(--cs-texte-3)">
                      Votre contexte
                    </p>
                    {/* societe est requis et validé avant l'étape 3. */}
                    <p className="type-body mt-1 text-white">
                      {valeurs.societe.trim()}
                    </p>
                    {valeurs.budget && (
                      <p className="type-caption mt-1 text-(--cs-texte-2)">
                        {OPTIONS_BUDGET.find(
                          (o) => o.valeur === valeurs.budget,
                        )?.libelle}
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </form>
    </Panneau>
  );
}
