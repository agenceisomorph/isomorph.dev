/**
 * Vitrine : famille Carrousels du système de design Console.
 *
 * Tout le contenu est un placeholder visible (aucun avis ni témoignage client
 * sourcé disponible). Les images utilisées sont celles présentes dans public/.
 *
 * Sources des images :
 *  - /salle-machines/couches.webp    (photo salle des machines)
 *  - /salle-machines/ecoutille.webp  (photo salle des machines)
 *  - /salle-machines/instrument.webp (photo salle des machines)
 *  - /salle-machines/socle.webp      (photo salle des machines)
 *
 * Dimensions estimées 1200x800 (images WebP proportionnelles ; remplacer par
 * les dimensions réelles si elles changent).
 */

import type { AvisClient } from "../carrousels/AvisClients";
import { AvisClients } from "../carrousels/AvisClients";
import type { ImageSlider } from "../carrousels/SliderImages";
import { SliderImages } from "../carrousels/SliderImages";
import type { Story } from "../carrousels/SliderStories";
import { SliderStories } from "../carrousels/SliderStories";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Données de démonstration : tout reste à compléter                   */
/* ------------------------------------------------------------------ */

/**
 * Images du site, avec les textes alternatifs de leurs pages d'origine :
 * actualites/hebergement-souverain-france, PluginsHubView, AgencyView.
 */
const IMAGES_DEMO: ImageSlider[] = [
  {
    src: "/actualites/hebergement-souverain-hero.png",
    alt: "Un serveur aux couleurs américaines et un serveur aux couleurs françaises reliés par un flux de données, évoquant la migration d'un cloud américain vers un cloud français",
    legende: "Hébergement souverain",
    width: 1536,
    height: 1024,
  },
  {
    src: "/actualites/hebergement-souverain-datacenter.png",
    alt: "Salle de datacenter lumineuse et ventilée, refroidissement naturel sans climatisation",
    legende: "Datacenter",
    width: 1536,
    height: 1024,
  },
  {
    src: "/plugins/agence-strapi-hero.png",
    alt: "Vue éclatée d'une plateforme de contenu : base de données, blocs de contenu modulaires et fenêtre de navigateur reliés entre eux",
    legende: "Agence Strapi",
    width: 1536,
    height: 1024,
  },
  {
    src: "/plugins/plugins-hub-hero.png",
    alt: "Illustration de modules de plugins venant s'assembler sur une plateforme centrale",
    legende: "Plugins Strapi",
    width: 1536,
    height: 1024,
  },
];

/**
 * Stories de démonstration.
 * Aucune vidéo ni image réelle : tout en placeholder.
 * Aucun accord client disponible : les noms, rôles et citations sont
 * des espaces réservés à compléter.
 */
const STORIES_DEMO: Story[] = [
  {
    id: "story-1",
    /* [À compléter — prénom, nom, accord écrit] */
    nom: "[À compléter — prénom, accord écrit]",
    /* [À compléter — rôle, accord écrit] */
    role: "[À compléter — rôle et entreprise, accord écrit]",
    /* Aucun fichier vidéo disponible dans public/ */
    src: undefined,
    poster: undefined,
    duree: 0,
  },
  {
    id: "story-2",
    nom: "[À compléter — prénom, accord écrit]",
    role: "[À compléter — rôle et entreprise, accord écrit]",
    src: undefined,
    poster: undefined,
    duree: 0,
  },
  {
    id: "story-3",
    nom: "[À compléter — prénom, accord écrit]",
    role: "[À compléter — rôle et entreprise, accord écrit]",
    src: undefined,
    poster: undefined,
    duree: 0,
  },
];

/**
 * Avis de démonstration.
 * Aucun avis réel ni accord client disponible.
 * Tout est un placeholder visible, jamais publiable tel quel.
 */
const AVIS_DEMO: AvisClient[] = [
  {
    id: "avis-1",
    /* Note fictive : à remplacer par la note réelle sourcée. */
    note: 5,
    citation: "[À compléter — avis client, source et accord écrit]",
    auteur: "[À compléter — prénom, accord écrit]",
    entreprise: "[À compléter — entreprise, accord écrit]",
    source: "[À compléter — Google, Trustpilot, email…]",
  },
  {
    id: "avis-2",
    note: 5,
    citation: "[À compléter — avis client, source et accord écrit]",
    auteur: "[À compléter — prénom, accord écrit]",
    entreprise: "[À compléter — entreprise, accord écrit]",
    source: "[À compléter — Google, Trustpilot, email…]",
  },
  {
    id: "avis-3",
    note: 5,
    citation: "[À compléter — avis client, source et accord écrit]",
    auteur: "[À compléter — prénom, accord écrit]",
    entreprise: "[À compléter — entreprise, accord écrit]",
    source: "[À compléter — Google, Trustpilot, email…]",
  },
];

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineCarrousels() {
  return (
    <SectionVitrine
      id="carrousels"
      index={9}
      surtitre="Carrousels"
      titre="Images, vidéos, avis"
    >
      {/* ===== SliderImages ===== */}
      <Planche
        nom="Carrousel d'images"
        note="Flèches, clavier ou doigt."
      >
        <SliderImages
          images={IMAGES_DEMO}
          label="Salle des machines ISOMORPH"
          className="max-w-[720px]"
        />
      </Planche>

      {/* ===== SliderStories ===== */}
      <Planche
        nom="Témoignages vidéo"
        note="Format vertical, la vidéo s'ouvre au clic."
      >
        {/*
          Aucune vidéo ni photo client disponible.
          Source : [À compléter — avis client, source et accord écrit]
        */}
        <SliderStories
          stories={STORIES_DEMO}
          label="Témoignages vidéo"
          className="max-w-[780px]"
        />
      </Planche>

      {/* ===== AvisClients ===== */}
      <Planche
        nom="Avis clients"
        note="En grille sur ordinateur, à faire défiler sur téléphone."
      >
        {/*
          Aucun avis réel disponible.
          Source : [À compléter — avis client, source et accord écrit]
        */}
        <AvisClients
          avis={AVIS_DEMO}
          label="Avis clients"
        />
      </Planche>
    </SectionVitrine>
  );
}
