/**
 * Vitrine : Parallaxe en relief, suite de la famille Sections. Hors du cadre
 * des autres planches, car la section occupe toute la largeur de l'écran. Les
 * cinq variantes sont empilées pour se comparer au défilement.
 *
 * Textes : blocs de fin des pages de compétences, src/lib/expertises/data.ts
 * (champ cta), liens vers /contact comme sur ces pages.
 */

import { ParallaxeRelief, type VarianteParallaxe } from "../sections/ParallaxeRelief";
import { Etiquette } from "../fondations";

interface Demo {
  variante: VarianteParallaxe;
  nom: string;
  note: string;
  etiquette: string;
  titre: string;
  chapeau: string;
  cta: string;
}

const DEMOS: Demo[] = [
  {
    variante: "strates",
    nom: "Strates",
    note: "Chaque plan défile à sa vitesse, le lointain plus lentement.",
    // data.ts : developpement-logiciel-sur-mesure
    etiquette: "Logiciel sur mesure",
    titre: "Parlons de votre projet logiciel",
    chapeau:
      "Décrivez votre processus métier et l'outil que vous utilisez aujourd'hui. Nous revenons avec un cadrage écrit.",
    cta: "Décrire votre projet",
  },
  {
    variante: "travelling",
    nom: "Travelling",
    note: "Les plans glissent de côté, le premier plan plus vite.",
    // data.ts : developpement-web-sur-mesure
    etiquette: "Web sur mesure",
    titre: "Parlons de votre projet web",
    chapeau:
      "Refonte, création ou migration : décrivez votre site et son état actuel. Nous revenons avec un cadrage écrit.",
    cta: "Décrire votre projet",
  },
  {
    variante: "approche",
    nom: "Approche",
    note: "Les plans grandissent depuis l'horizon, comme en avançant.",
    // data.ts : consultant-google-ads
    etiquette: "Google Ads",
    titre: "Faire vérifier vos dépenses publicitaires",
    chapeau: "Décrivez votre compte et votre secteur. Nous revenons avec les données réelles de votre compte.",
    cta: "Faire auditer votre compte Google Ads",
  },
  {
    variante: "mise-au-point",
    nom: "Mise au point",
    note: "La netteté passe du lointain au premier plan.",
    // data.ts : audit-seo-technique
    etiquette: "Audit SEO technique",
    titre: "Faire vérifier votre site",
    chapeau:
      "Indiquez votre URL et votre principal problème actuel : trafic en baisse, refonte prévue ou pénalité. Nous revenons avec une proposition d'audit adaptée.",
    cta: "Demander un audit SEO technique",
  },
  {
    variante: "lever",
    nom: "Lever",
    note: "La section se fige à l'écran et les plans montent un à un.",
    // data.ts : agence-web-toulon
    etiquette: "Toulon",
    titre: "Travailler avec une agence implantée dans le Var",
    chapeau:
      "Décrivez votre projet : développement web, référencement ou logiciel sur mesure. Réponse directe, sans intermédiaire.",
    cta: "Rencontrer ISOMORPH à Toulon",
  },
];

export function VitrineParallaxe() {
  return (
    <section aria-labelledby="parallaxe-relief-titre" className="bg-(--cs-fond) pb-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-white/[0.08] pb-3">
          <h3 id="parallaxe-relief-titre" className="type-h3 text-white">
            Parallaxe en relief
          </h3>
          <p className="type-caption text-(--cs-texte-3)">Pleine largeur, cinq variantes.</p>
        </div>
      </div>

      {DEMOS.map((demo, i) => (
        <div key={demo.variante}>
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-baseline gap-x-4 gap-y-1 px-6 pb-6 pt-16 md:px-12">
            <Etiquette index={i + 1}>{demo.nom}</Etiquette>
            <p className="type-caption text-(--cs-texte-3)">{demo.note}</p>
          </div>
          <ParallaxeRelief
            variante={demo.variante}
            etiquette={demo.etiquette}
            titre={demo.titre}
            niveauTitre={3}
            chapeau={demo.chapeau}
            cta={{ label: demo.cta, href: "/contact" }}
          />
        </div>
      ))}
    </section>
  );
}
