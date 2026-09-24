/**
 * Composant « Page de service » du système Console.
 *
 * Rendu data-driven à partir d'un `PageServiceData`. Reproduit fidèlement
 * le gabarit `atelier/console/service/page.tsx` : mêmes composants Console,
 * même ordre S1 à S15, mêmes ancres, mêmes fonds alternés, BarreConsole,
 * FilAriane, SommaireLecture, SectionCta,
 * PiedDePage.
 *
 * Différences intentionnelles par rapport au gabarit :
 *   - Blocs optionnels (choisir, budget, mesures, projets, articles,
 *     appelFinal) : absents si non définis dans la donnée. L'alternance
 *     des fonds reste correcte grâce à un compteur de position.
 *   - S7 choisir : cartes à parts égales, pas de tableau oui/non.
 *   - S11 articles : pris dans ARTICLES par slug.
 *   - S14 voisins : ListeServices construite depuis data.voisins.items.
 *   - S15 appelFinal : data.appelFinal sinon FAMILLES[famille].appelFinal.
 *   - Fil d'Ariane : Accueil > famille > badge.
 *   - Liens dans le texte : syntaxe [texte](/chemin) rendue via TexteAvecLiens.
 *   - FAQ : reponse passée sans crochets à ItemAccordeon (type string).
 *
 * Arbitrages piliers :
 *   RGAA 4.1 — H1 unique, H2 comme questions/réponses, FilAriane,
 *     <time dateTime>, listes sémantiques, Faq avec aria-labelledby,
 *     focus clavier délégué aux fondations Console (jamais d'outline).
 *   RGESN 2024 — Server Component, aucune dépendance npm ajoutée,
 *     images différées sauf première CarteArticle (LCP candidat),
 *     StylesConsole/StylesPages insérés une seule fois (href React).
 *   CWV — premier rendu serveur identique au navigateur,
 *     aucun rendu conditionnel côté client (mouvement réduit par CSS).
 *   OWASP — aucun secret exposé, JSON-LD produit par JSON.stringify sur
 *     des constantes internes — même pattern que les gabarits du site.
 */

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import type { PageServiceData } from "@/content/services/types";
import { ARTICLES } from "@/lib/actualites";
import { BASE_URL } from "@/lib/i18n";
import { ORGANIZATION, breadcrumbJsonLd } from "@/lib/schema-org";
import { FAMILLES } from "@/components/site/familles";
import { Etiquette, Panneau, StylesConsole } from "@/components/console/fondations";
import { Faq } from "@/components/console/comparaison/Faq";
import { Encadre } from "@/components/console/contenus/Encadre";
import { ListeServices } from "@/components/console/contenus/ListeServices";
import { PiedDePage } from "@/components/console/contenus/PiedDePage";
import { Kpi } from "@/components/console/grilles/Kpi";
import { SectionCta } from "@/components/console/grilles/SectionCta";
import { SelecteurPolice } from "@/components/console/identite/SelecteurPolice";
import { BarreConsole } from "@/components/console/navigation/BarreConsole";
import { FilAriane } from "@/components/console/navigation/FilAriane";
import { CarteArticle, StylesArticles } from "@/components/console/pages/CarteArticle";
import { FicheProjet } from "@/components/console/pages/FicheProjet";
import { Glossaire } from "@/components/console/pages/Glossaire";
import { SommaireLecture } from "@/components/console/pages/SommaireLecture";
import { StylesPages } from "@/components/console/pages/StylesPages";
import { FriseEtapes } from "@/components/console/sections/FriseEtapes";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Formate une date ISO `AAAA-MM-JJ` en date française longue.
 * Ex. "2026-09-24" → "24 septembre 2026".
 */
function formaterDateFr(dateISO: string): string {
  const MOIS = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  const [annee, mois, jour] = dateISO.split("-");
  return `${parseInt(jour, 10)} ${MOIS[parseInt(mois, 10) - 1]} ${annee}`;
}

/**
 * Supprime la syntaxe de lien Markdown `[texte](/chemin)` en ne gardant
 * que le texte du lien. Utilisé pour les champs passés à des composants
 * qui n'acceptent que des `string` (ItemAccordeon.reponse, JSON-LD).
 */
function stripLiens(texte: string): string {
  return texte.replace(/\[([^\]]+)\]\(\/[^)]+\)/g, "$1");
}

/**
 * Rend un texte contenant la syntaxe `[texte](/chemin)` en JSX.
 *
 * Seules les adresses commençant par « / » deviennent des `next/link` ;
 * le reste reste du texte brut. Les adresses externes sont ignorées et
 * conservées telles quelles dans le texte.
 *
 * RGAA 6.1 : l'intitulé du lien est le texte entre crochets, affiché.
 */
function TexteAvecLiens({ texte }: { texte: string }): ReactNode {
  const parties = texte.split(/(\[[^\]]+\]\(\/[^)]+\))/g);
  return (
    <>
      {parties.map((partie, i) => {
        const m = partie.match(/^\[([^\]]+)\]\((\/[^)]+)\)$/);
        if (m) {
          return (
            <Link key={i} href={m[2]} className="text-(--cs-neon) underline hover:no-underline">
              {m[1]}
            </Link>
          );
        }
        return <span key={i}>{partie}</span>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Alternance des fonds post-S6                                        */
/* ------------------------------------------------------------------ */

/**
 * Retourne la classe Tailwind de fond pour une section dont la position
 * dans la séquence post-S6 est connue. S6 est toujours fond-2 ; la
 * première section qui suit est fond, puis fond-2, etc.
 */
function fondAlterne(position: number): string {
  return position % 2 === 0 ? "bg-(--cs-fond)" : "bg-(--cs-fond-2)";
}

/* ------------------------------------------------------------------ */
/* metadataService                                                     */
/* ------------------------------------------------------------------ */

/**
 * Produit les métadonnées Next.js pour une page de service.
 *
 * La prop `robots` n'est pas définie ici ; la route d'aperçu d'atelier
 * (`[slug]/page.tsx`) force `robots: { index: false, follow: false }`.
 * Les vraies pages de service l'omettent pour hériter du défaut.
 *
 * Image de partage : la vignette du service (640 × 800, portrait), en
 * attendant des visuels 1200 × 630 ; d'où la carte « summary » côté X.
 */
export function metadataService(data: PageServiceData): Metadata {
  const url = `${BASE_URL}${data.chemin}`;
  const vignette = {
    url: `${BASE_URL}${data.vignette}`,
    width: 640,
    height: 800,
    alt: data.badge,
  };
  return {
    title: `${data.seo.titre} • ISOMORPH`,
    description: data.seo.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${data.seo.titre} • ISOMORPH`,
      description: data.seo.description,
      locale: "fr_FR",
      siteName: "ISOMORPH",
      images: [vignette],
    },
    twitter: {
      card: "summary",
      title: `${data.seo.titre} • ISOMORPH`,
      description: data.seo.description,
      images: [vignette.url],
    },
  };
}

/* ------------------------------------------------------------------ */
/* jsonLdService                                                       */
/* ------------------------------------------------------------------ */

/**
 * Produit le graphe JSON-LD d'une page de service :
 * WebPage, Service, BreadcrumbList, FAQPage.
 *
 * Les réponses de la FAQPage sont en texte brut (stripLiens) pour
 * respecter le format attendu par schema.org.
 *
 * OWASP : données issues de constantes internes uniquement.
 */
export function jsonLdService(data: PageServiceData): object {
  const famille = FAMILLES[data.famille];
  const url = `${BASE_URL}${data.chemin}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "ISOMORPH", path: "/" },
    { name: famille.nom, path: famille.chemin },
    { name: data.badge },
  ]);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: data.seo.titre,
        description: data.seo.description,
        inLanguage: "fr-FR",
        dateModified: data.dateModifiee,
        author: { "@id": `${BASE_URL}/#organization` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          url: BASE_URL,
          name: "ISOMORPH",
        },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: data.badge,
        serviceType: data.seo.typeService,
        description: data.seo.description,
        provider: {
          "@type": "Organization",
          "@id": ORGANIZATION["@id"],
          name: ORGANIZATION.name,
          url: ORGANIZATION.url,
        },
        areaServed: { "@type": "Country", name: "France" },
        url,
      },
      /* BreadcrumbList : "@context" retiré, déjà dans le graphe parent. */
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.itemListElement,
      },
      {
        "@type": "FAQPage",
        mainEntity: data.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripLiens(item.reponse),
          },
        })),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* PageService                                                         */
/* ------------------------------------------------------------------ */

/**
 * Vue complète d'une page de service Console, pilotée par `data`.
 *
 * Server Component. Aucun état côté client.
 */
export function PageService({ data }: { data: PageServiceData }) {
  const famille = FAMILLES[data.famille];

  /* Blocs optionnels présents */
  const aChoisir = !!data.choisir;
  const aBudget = !!data.budget;
  const aMesures = !!data.mesures;
  const aProjets = !!data.projets;
  const aArticles = !!data.articles;

  /* Alternance des fonds après S6 (toujours fond-2)
     position 0 → fond, 1 → fond-2, 2 → fond… */
  let pos = 0;
  const fondChoisir = aChoisir ? fondAlterne(pos++) : "";
  const fondBudget = aBudget ? fondAlterne(pos++) : "";
  const fondMesures = aMesures ? fondAlterne(pos++) : "";
  const fondProjets = aProjets ? fondAlterne(pos++) : "";
  const fondArticles = aArticles ? fondAlterne(pos++) : "";
  const fondGlossaire = fondAlterne(pos++);
  const fondQuestions = fondAlterne(pos++);
  const fondVoisins = fondAlterne(pos);

  /* Sommaire de lecture : uniquement les sections présentes */
  const sections = [
    { id: "en-bref", titre: data.enBref.titre },
    { id: "bonnes-situations", titre: data.situations.titre },
    { id: "livrables", titre: data.livrables.titre },
    { id: "deroule", titre: data.deroule.titre },
    ...(aChoisir ? [{ id: "choisir", titre: data.choisir!.titre }] : []),
    ...(aBudget ? [{ id: "budget", titre: data.budget!.titre }] : []),
    ...(aMesures ? [{ id: "mesures", titre: data.mesures!.titre }] : []),
    ...(aProjets ? [{ id: "projets", titre: data.projets!.titre }] : []),
    ...(aArticles ? [{ id: "lire", titre: data.articles!.titre }] : []),
    { id: "glossaire", titre: data.glossaire.titre },
    { id: "questions", titre: data.faq.titre },
    { id: "services-voisins", titre: data.voisins.titre },
  ] as const satisfies ReadonlyArray<{ id: string; titre: string }>;

  /* S15 : appel final de la page ou de la famille */
  const appelFinalTitre = data.appelFinal?.titre ?? famille.appelFinal.titre;
  const appelFinalTexte = data.appelFinal?.texte ?? famille.appelFinal.texte;

  /* S11 : articles filtrés par slug (même ordre que dans data.articles.slugs) */
  const articlesAffiches = data.articles
    ? data.articles.slugs
        .map((slug) => ARTICLES.find((a) => a.slug === slug))
        .filter(Boolean)
    : [];

  /* Lignes de la fiche express */
  const lignesFiche = data.fiche.map((ligne) => ({
    libelle: ligne.libelle,
    contenu: <TexteAvecLiens texte={ligne.contenu} /> as ReactNode,
  }));

  /* Étapes du déroulé (ElementTexte → NumberedStep) */
  const etapesDeroule = data.deroule.etapes.map((e) => ({
    title: e.titre,
    body: stripLiens(e.texte),
  }));

  /* Services voisins (voisins.items → LigneService) */
  const lignesVoisins = data.voisins.items.map((item) => ({
    titre: item.libelle,
    href: item.chemin,
    description: item.texte,
  }));

  return (
    <div data-atelier-console className="relative -mt-12 bg-(--cs-fond) text-white">
      <BarreConsole locale="fr" frPath={data.chemin} position="fixe" />
      {/* Sélecteur de police : fixe en haut à droite, atteint au clavier juste après la barre. */}
      <SelecteurPolice />

      <main className="pt-16">
        <StylesConsole />
        <StylesPages />

        {/* S0 — JSON-LD : un seul graphe (WebPage, Service, BreadcrumbList, FAQPage).
            Produit par JSON.stringify sur des constantes internes — pattern identique
            au gabarit et aux pages d'actualités du site. */}
        <script type="application/ld+json">{JSON.stringify(jsonLdService(data))}</script>

        {/* ============================================================
            S1 — En-tête
            Question : « Suis-je au bon endroit ? »
            SEO : H1 = requête principale ; 1re phrase du chapeau = la réponse.
        ============================================================ */}
        <section aria-labelledby="service-h1" className="csGrille overflow-hidden bg-(--cs-fond-2)">
          <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
            {/* Fil d'Ariane : RGAA 12.9 — nav nommé, liste ordonnée, page courante aria-current. */}
            <FilAriane
              etapes={[
                { libelle: "Accueil", href: "/" },
                { libelle: famille.nom, href: famille.chemin },
                { libelle: data.badge },
              ]}
              className="mb-8"
            />

            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
              <div className="min-w-0 flex-1">
                {data.enTete.surtitre && (
                  <Etiquette>{data.enTete.surtitre}</Etiquette>
                )}

                {/* H1 unique : contient la requête principale de la page. */}
                <h1 id="service-h1" className="type-h1 mt-4 text-white">
                  {data.enTete.h1}
                </h1>

                <span
                  aria-hidden="true"
                  className="mt-5 block h-px w-16 bg-(--cs-neon) shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                />

                {/* Première phrase = la réponse. Reprise par Google et les assistants. */}
                <p className="type-lead mt-5 text-(--cs-texte-2)">
                  <TexteAvecLiens texte={data.enTete.chapeau} />
                </p>

                {/* Date visible : signal de fraîcheur (EEAT). RGAA 13.1 : time[dateTime]. */}
                <p className="type-caption mt-4 text-(--cs-texte-3)">
                  Mis à jour le{" "}
                  <time dateTime={data.dateModifiee}>
                    {formaterDateFr(data.dateModifiee)}
                  </time>
                  .
                </p>
              </div>

              {/* S2 — Fiche express : liste de définitions (dl/dt/dd via FicheProjet).
                  Question : « En résumé, c'est quoi l'offre ? » */}
              <div className="w-full lg:w-[340px] lg:shrink-0">
                <FicheProjet lignes={lignesFiche} />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            S3, S4, S5 — Colonne de lecture avec sommaire latéral.
        ============================================================ */}
        <section aria-label="Description du service" className="bg-(--cs-fond)">
          <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
            <div className="flex gap-16">
              {/* Sommaire latéral : visible sur grand écran uniquement. */}
              <aside className="hidden w-[220px] shrink-0 lg:block">
                <SommaireLecture sections={sections} />
              </aside>

              <div className="min-w-0 flex-1 space-y-16">

                {/* S3 En bref */}
                <div>
                  <h2 id="en-bref" className="type-h2 text-white">
                    {data.enBref.titre}
                  </h2>
                  <p className="type-body mt-4 text-(--cs-texte-2)">
                    <TexteAvecLiens texte={data.enBref.texte} />
                  </p>
                </div>

                {/* S4 Les bonnes situations */}
                <div>
                  <h2 id="bonnes-situations" className="type-h2 text-white">
                    {data.situations.titre}
                  </h2>
                  {data.situations.chapeau && (
                    <p className="type-body mt-4 text-(--cs-texte-2)">
                      <TexteAvecLiens texte={data.situations.chapeau} />
                    </p>
                  )}
                  <ul role="list" className="mt-6 space-y-3">
                    {data.situations.items.map((item) => (
                      <li key={item.titre} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--cs-neon)"
                        />
                        <span className="type-body text-(--cs-texte-2)">
                          <strong className="block text-white">{item.titre}</strong>
                          <TexteAvecLiens texte={item.texte} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* S5 Ce que nous livrons */}
                <div>
                  <h2 id="livrables" className="type-h2 text-white">
                    {data.livrables.titre}
                  </h2>
                  {data.livrables.chapeau && (
                    <p className="type-body mt-4 text-(--cs-texte-2)">
                      <TexteAvecLiens texte={data.livrables.chapeau} />
                    </p>
                  )}
                  <ul role="list" className="mt-6 space-y-3">
                    {data.livrables.items.map((item) => (
                      <li key={item.titre} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--cs-neon)"
                        />
                        <span className="type-body text-(--cs-texte-2)">
                          <strong className="block text-white">{item.titre}</strong>
                          <TexteAvecLiens texte={item.texte} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            S6 Le déroulé
            FriseEtapes gère son propre fond ; bg-(--cs-fond-2)! force
            l'alternance après la section précédente (bg-fond).
        ============================================================ */}
        <div id="deroule">
          <FriseEtapes
            etiquette="Déroulé"
            titre={data.deroule.titre}
            chapeau={data.deroule.chapeau && stripLiens(data.deroule.chapeau)}
            items={etapesDeroule}
            className="bg-(--cs-fond-2)!"
          />
        </div>

        {/* ============================================================
            S7 Choisir (optionnel)
            Cartes à parts égales : nom, « quand c'est le bon choix », texte.
        ============================================================ */}
        {aChoisir && (
          <section id="choisir" aria-labelledby="choisir-titre" className={fondChoisir}>
            <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
              <Etiquette>Comparatif</Etiquette>
              <h2 id="choisir-titre" className="type-h2 mt-4 mb-8 text-white">
                {data.choisir!.titre}
              </h2>
              {data.choisir!.chapeau && (
                <p className="type-body mb-8 text-(--cs-texte-2)">
                  <TexteAvecLiens texte={data.choisir!.chapeau} />
                </p>
              )}
              {/* RGAA 9.1 : liste de choix. Parts égales via grid. */}
              <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.choisir!.options.map((option) => (
                  <li key={option.nom}>
                    <Panneau equerres className="flex h-full flex-col gap-3 p-6">
                      <p className="type-h3 text-white">{option.nom}</p>
                      <p className="type-caption text-(--cs-neon)">
                        Quand c&apos;est le bon choix
                      </p>
                      <p className="type-body text-(--cs-texte-2)"><TexteAvecLiens texte={option.quand} /></p>
                      {option.texte && (
                        <p className="type-body mt-2 text-(--cs-texte-2)">
                          <TexteAvecLiens texte={option.texte} />
                        </p>
                      )}
                    </Panneau>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ============================================================
            S8 Le budget (optionnel)
        ============================================================ */}
        {aBudget && (
          <section id="budget" aria-labelledby="budget-titre" className={fondBudget}>
            <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
              <Etiquette>Budget</Etiquette>
              <h2 id="budget-titre" className="type-h2 mt-4 text-white">
                {data.budget!.titre}
              </h2>
              {data.budget!.chapeau && (
                <p className="type-body mt-4 text-(--cs-texte-2)">
                  <TexteAvecLiens texte={data.budget!.chapeau} />
                </p>
              )}
              <Encadre
                variante="info"
                titre="Ce qui fait varier le budget"
                className="mt-8"
              >
                <ul role="list" className="space-y-3">
                  {data.budget!.facteurs.map((facteur) => (
                    <li key={facteur.titre} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--cs-neon)"
                      />
                      <span className="type-body">
                        <strong className="block">{facteur.titre}</strong>
                        <TexteAvecLiens texte={facteur.texte} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Encadre>
            </div>
          </section>
        )}

        {/* ============================================================
            S9 Ce qui se mesure (optionnel)
        ============================================================ */}
        {aMesures && (
          <section id="mesures" aria-labelledby="mesures-titre" className={fondMesures}>
            <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
              <Etiquette>Résultats</Etiquette>
              <h2 id="mesures-titre" className="type-h2 mt-4 mb-8 text-white">
                {data.mesures!.titre}
              </h2>
              {data.mesures!.chapeau && (
                <p className="type-body mb-8 text-(--cs-texte-2)">
                  <TexteAvecLiens texte={data.mesures!.chapeau} />
                </p>
              )}
              <Kpi
                items={data.mesures!.indicateurs.map((ind) => ({
                  libelle: ind.libelle,
                  valeur: ind.valeur,
                  unite: ind.unite,
                  source: ind.source,
                }))}
              />
            </div>
          </section>
        )}

        {/* ============================================================
            S10 Projets (optionnel)
            Accord écrit du client obligatoire avant toute publication.
        ============================================================ */}
        {aProjets && (
          <section id="projets" aria-labelledby="projets-titre" className={fondProjets}>
            <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
              <Etiquette>Réalisations</Etiquette>
              <h2 id="projets-titre" className="type-h2 mt-4 mb-8 text-white">
                {data.projets!.titre}
              </h2>
              <ul role="list" className="space-y-3">
                {data.projets!.items.map((item) => (
                  <li key={item.titre} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--cs-neon)"
                    />
                    <span className="type-body text-(--cs-texte-2)">
                      {item.href ? (
                        /* RGAA 6.1 : intitulé descriptif, jamais « voir le projet ». */
                        <Link
                          href={item.href}
                          className="block w-fit text-(--cs-neon) underline hover:no-underline"
                        >
                          {item.titre}
                        </Link>
                      ) : (
                        <strong className="block text-white">{item.titre}</strong>
                      )}
                      <TexteAvecLiens texte={item.texte} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ============================================================
            S11 À lire (optionnel)
            Articles pris dans ARTICLES par slug, dans l'ordre de slugs.
        ============================================================ */}
        {aArticles && articlesAffiches.length > 0 && (
          <section id="lire" aria-labelledby="lire-titre" className={fondArticles}>
            <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
              <StylesArticles />
              <Etiquette>Articles</Etiquette>
              <h2 id="lire-titre" className="type-h2 mt-4 mb-8 text-white">
                {data.articles!.titre}
              </h2>
              <ul role="list" className="csArtGrille">
                {articlesAffiches.map((article, i) => (
                  <li key={article!.slug}>
                    {/* Première carte prioritaire : candidat LCP. */}
                    <CarteArticle article={article!} prioritaire={i === 0} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ============================================================
            S12 Glossaire (toujours présent)
        ============================================================ */}
        <section id="glossaire" aria-labelledby="glossaire-titre" className={fondGlossaire}>
          <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
            <Etiquette>Glossaire</Etiquette>
            <h2 id="glossaire-titre" className="type-h2 mt-4 mb-8 text-white">
              {data.glossaire.titre}
            </h2>
            <Glossaire
              termes={data.glossaire.termes.map((t) => ({ ...t, definition: stripLiens(t.definition) }))}
            />
          </div>
        </section>

        {/* ============================================================
            S13 Questions fréquentes (toujours présent)
            jsonLd={false} : données structurées déjà dans jsonLdService.
            Les réponses sont passées via stripLiens car ItemAccordeon.reponse
            est de type string : la syntaxe de lien est retirée, seul le
            texte du lien est conservé (critère RGAA 6.1 respecté dans
            le composant Accordeon qui affiche le texte visible).
        ============================================================ */}
        <section id="questions" className={fondQuestions}>
          <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
            <Faq
              surtitre="Questions fréquentes"
              titre={data.faq.titre}
              items={data.faq.items.map((item) => ({
                question: item.question,
                reponse: stripLiens(item.reponse),
              }))}
              jsonLd={false}
            />
          </div>
        </section>

        {/* ============================================================
            S14 Services voisins (toujours présent)
        ============================================================ */}
        <section
          id="services-voisins"
          aria-labelledby="services-voisins-titre"
          className={fondVoisins}
        >
          <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-12 md:py-20">
            <Etiquette>Aller plus loin</Etiquette>
            <h2 id="services-voisins-titre" className="type-h2 mt-4 mb-8 text-white">
              {data.voisins.titre}
            </h2>
            {/* RGAA 6.1 : intitulé de chaque lien = titre visible du service. */}
            <ListeServices label="Services voisins" items={lignesVoisins} />
          </div>
        </section>

        {/* ============================================================
            S15 Appel final
        ============================================================ */}
        <SectionCta titre={appelFinalTitre} phrase={appelFinalTexte} />


        <PiedDePage locale="fr" frPath={data.chemin} />
      </main>
    </div>
  );
}
