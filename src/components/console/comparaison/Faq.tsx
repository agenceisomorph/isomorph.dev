/**
 * Section FAQ du système Console.
 *
 * Réutilise le composant Accordeon existant (contenus/Accordeon.tsx) pour
 * l'interactivité, et ajoute en option les données structurées FAQPage
 * (schema.org) via la prop `jsonLd`.
 *
 * "use client" non requis : Server Component qui délègue l'état et les
 * interactions au Client Component Accordeon.
 *
 * Le script JSON-LD est rendu côté serveur, avec le même pattern que les
 * autres pages du site (script avec enfant JSON.stringify, cf. actualités).
 * La prop `jsonLd` doit rester désactivée sur les pages non indexées
 * (vitrine, atelier).
 *
 * RGAA 4.1 :
 *  - Critère 9.1 : structure sémantique par <section> et <h2>.
 *  - Critère 6.1 : lien "Poser une question" vers /contact, intitulé explicite.
 *  - Critères 7.1, 10.1 : délégués à l'Accordeon existant.
 *  - Focus : le trait de l'item s'allume, sans anneau (StylesContenus).
 *
 * Éco : Server Component, aucun état propre, aucune dépendance npm ajoutée.
 */

import Link from "next/link";

import { Accordeon, type ItemAccordeon } from "../contenus/Accordeon";
import { Etiquette, StylesConsole } from "../fondations";
import { StylesComparaison } from "./TableauComparaison";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface FaqProps {
  /** Surtitre affiché en étiquette néon. */
  surtitre?: string;
  /** Titre principal de la section. */
  titre: string;
  items: ItemAccordeon[];
  /**
   * Données structurées FAQPage (schema.org) dans un script ld+json.
   * Réservé aux pages indexées. Laisser à false sur la vitrine.
   */
  jsonLd?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Schéma FAQPage                                                      */
/* ------------------------------------------------------------------ */

/**
 * Objet FAQPage schema.org construit à partir des items de l'accordéon.
 * Défini ici pour rester dans le périmètre du dossier comparaison
 * (périmètre de fichiers : pas de modification de schema-org.ts).
 */
function faqSchema(items: ItemAccordeon[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.reponse,
      },
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Faq                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Section FAQ complète : étiquette, titre, accordéon, lien vers /contact.
 */
export function Faq({
  surtitre = "Questions fréquentes",
  titre,
  items,
  jsonLd = false,
  className = "",
}: FaqProps) {
  return (
    <section className={className} aria-labelledby="csCmpFaqTitre">
      <StylesConsole />
      <StylesComparaison />

      {/* Données structurées FAQPage. Pattern identique à celui des actualités
          du site (script avec enfant JSON.stringify, jamais dangerouslySetInnerHTML).
          Le contenu est produit par JSON.stringify sur des données internes,
          sans entrée utilisateur. */}
      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema(items))}
        </script>
      ) : null}

      <header className="mb-8 max-w-[640px]">
        <Etiquette>{surtitre}</Etiquette>
        <h2 id="csCmpFaqTitre" className="type-h2 mt-4 text-white">
          {titre}
        </h2>
        <span
          aria-hidden="true"
          className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
        />
      </header>

      <Accordeon items={items} className="max-w-[720px]" />

      <div className="mt-8">
        <Link href="/contact" className="csCmpFaqLien">
          <span aria-hidden="true" className="csRepere shrink-0" />
          Poser une question
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="csCmpFaqLienFleche h-4 w-4 shrink-0"
          >
            <path
              d="M3 8H12.5M8.5 4L12.5 8L8.5 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
