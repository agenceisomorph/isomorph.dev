/**
 * Vitrine : famille Contenus du système de design Console.
 *
 * Contenus réels : services depuis expertiseNav.ts, FAQ depuis la page
 * /audit-seo-geo (src/content/competences/seo-et-geo.tsx), chiffres
 * Bpifrance depuis CLAUDE.md (source : diaginno.bpifrance.fr).
 *
 * Le pied de page n'est pas dans cette vitrine : Florent le place en bas
 * de la page de l'atelier (`/atelier/console`).
 */

import { EXPERTISE_FAMILIES } from "@/components/chrome/expertiseNav";

import { Accordeon } from "../contenus/Accordeon";
import { Badge } from "../contenus/Badge";
import { BlocCode } from "../contenus/BlocCode";
import { Carte } from "../contenus/Carte";
import { Encadre } from "../contenus/Encadre";
import { Lecture } from "../contenus/Lecture";
import { ListeServices } from "../contenus/ListeServices";
import { Tableau, type ColonneTableau, type LigneTableau } from "../contenus/Tableau";
import { Planche, SectionVitrine } from "./kit";

/* ------------------------------------------------------------------ */
/* Données réelles pour la démonstration                               */
/* ------------------------------------------------------------------ */

/**
 * Quatre services de la famille "Concevoir et développer", source :
 * expertiseNav.ts -> familles.ts (plan du site du 11 septembre 2026).
 */
const familleDevItems = EXPERTISE_FAMILIES.find((f) => f.key === "developpement")?.items ?? [];
const CARTES_DEMO = familleDevItems.slice(0, 4).map((item, i) => ({
  numero: i + 1,
  titre: item.label,
  description: item.desc ?? "",
  href: item.href,
}));

/**
 * Six services pour la liste, sources identiques.
 * On prend les trois familles, deux items par famille.
 */
const LISTE_DEMO = EXPERTISE_FAMILIES.flatMap((f) =>
  f.items.slice(0, 2),
).slice(0, 6).map((item, i) => ({
  numero: i + 1,
  titre: item.label,
  description: item.desc,
  href: item.href,
}));

/**
 * FAQ réelle de la page /audit-seo-technique.
 * Source : src/content/competences/seo-et-geo.tsx, section "faq".
 */
const FAQ_DEMO = [
  {
    question: "Le SEO et le GEO sont-ils deux prestations ?",
    reponse:
      "Une seule. Google écrit, dans son guide du 15 mai 2026, que l'optimisation pour ses fonctions d'IA générative reste du SEO : mêmes systèmes, mêmes fondamentaux. ChatGPT, Claude et Perplexity ajoutent leurs propres robots, que nous réglons un par un.",
  },
  {
    question: "Qu'est-ce qui dépend de nous, et qu'est-ce qui dépend du moteur ?",
    reponse:
      "Le site lisible, l'accès réglé, les contenus sourcés et la mesure : c'est notre travail, et il se vérifie. Le choix des sources citées dans une réponse appartient au moteur ; Google précise que l'indexation et l'affichage restent à sa discrétion.",
  },
  {
    question: "Comment se mesure la présence dans les réponses des IA ?",
    reponse:
      "Search Console compte les impressions dans les aperçus IA et le mode IA depuis juin 2026. Bing Webmaster Tools suit les citations dans Copilot depuis février 2026. Pour ChatGPT, Claude et Perplexity, la mesure passe par le trafic qu'ils envoient, visible dans votre outil d'analyse.",
  },
  {
    question: "Intervenez-vous sur un site développé par une autre équipe ?",
    reponse:
      "Oui. L'audit vaut pour tout site ; les corrections se font dans son code ou dans son CMS, selon les accès ouverts.",
  },
];

/**
 * Tableau Bpifrance Diag Axes d'Innovation.
 * Source : CLAUDE.md du dépôt, section "Vérités factuelles" (diaginno.bpifrance.fr).
 */
const COLONNES_BPIFRANCE: ColonneTableau[] = [
  { label: "Poste" },
  { label: "Montant", align: "right", numerique: true },
];

const LIGNES_BPIFRANCE: LigneTableau[] = [
  { cellules: ["Plafond de facturation", "13 000 € HT"] },
  { cellules: ["Subvention Bpifrance", "6 500 € HT max"] },
  { cellules: ["Reste à charge", "6 500 € HT max"] },
  { cellules: ["Prise en charge", "50 %"] },
  { cellules: ["Durée d'intervention", "10 jours"] },
];

/* ------------------------------------------------------------------ */
/* Données pour la planche BlocCode                                    */
/* ------------------------------------------------------------------ */

/**
 * Commande d'installation du plugin lien universel ISOMORPH.
 * Source : src/lib/plugins/data.ts, champ install[0].code du plugin "link".
 */
const CODE_COMMANDE = "npm install @isomorph-agency/strapi-plugin-link";

/**
 * Extrait du fichier llms.txt d'isomorph.fr, section d'en-tête.
 * Source : src/app/llms.txt/route.ts, lines const `lines` (handler GET).
 */
const CODE_LLMS = `# ISOMORPH : agence web, logiciels métier et intégrations

> ISOMORPH conçoit des sites web sur mesure, des logiciels métier et des
> intégrations avec les outils de gestion (Airtable, Shopify, HubSpot, SAP).
> Siège social à Paris, implantation à Toulon.

## Notre code

- [Plugin lien universel Strapi](/plugins/link): Custom Field Strapi v5 pour les liens internes, pages système, URL externes.
- [Plugin commentaires Strapi](/plugins/comments): Fils de discussion, modération, reCAPTCHA V3 et rate limiting.
- [Plugin cookie consent Strapi](/plugins/cookie-consent): Consentement RGPD, Google Consent Mode V2.`;

/**
 * Extrait du robots.txt généré par isomorph.fr, conforme aux règles de
 * src/app/robots.ts (MetadataRoute.Robots Next.js).
 * Trois entrées représentatives parmi les sept règles déclarées.
 */
const CODE_ROBOTS = `User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

Sitemap: https://www.isomorph.fr/sitemap.xml`;

/* ------------------------------------------------------------------ */
/* Vitrine                                                             */
/* ------------------------------------------------------------------ */

export function VitrineContenus() {
  return (
    <SectionVitrine
      id="contenus"
      index={5}
      surtitre="Contenus"
      titre="Cartes, relevés, tableaux"
    >
      {/* ===== Carte ===== */}
      <Planche
        nom="Carte"
        note="Toute la carte est cliquable."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARTES_DEMO.map((carte) => (
            <Carte
              key={carte.href}
              numero={carte.numero}
              titre={carte.titre}
              description={carte.description}
              href={carte.href}
            />
          ))}
        </div>
      </Planche>

      {/* ===== Badge ===== */}
      <Planche nom="Badge" note="Un état en un ou deux mots.">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variante="neutre">Neutre</Badge>
          <Badge variante="neon">En ligne</Badge>
          <Badge variante="succes">Validé</Badge>
          <Badge variante="alerte">En cours</Badge>
          <Badge variante="erreur">Erreur</Badge>
        </div>
      </Planche>

      {/* ===== Accordéon ===== */}
      <Planche
        nom="Accordéon"
        note="Questions fréquentes, plusieurs ouvertes à la fois."
      >
        <Accordeon items={FAQ_DEMO} className="max-w-[720px]" />
      </Planche>

      {/* ===== Tableau ===== */}
      <Planche
        nom="Tableau"
        note="Sur téléphone, le tableau défile seul, pas la page."
      >
        {/*
          Données : Diag Axes d'Innovation Bpifrance.
          Source : CLAUDE.md (diaginno.bpifrance.fr, catalogue officiel).
          Plafond maximal 13 000 € HT, subvention 50 %, reste à charge 6 500 € HT.
        */}
        <div className="max-w-[520px]">
          <Tableau
            legende="Diag Axes d'Innovation Bpifrance"
            colonnes={COLONNES_BPIFRANCE}
            lignes={LIGNES_BPIFRANCE}
          />
        </div>
      </Planche>

      {/* ===== Relevé d'instrument ===== */}
      <Planche
        nom="Relevé"
        note="Pour un chiffre sourcé, jamais estimé."
      >
        {/*
          Source : CLAUDE.md du dépôt (diaginno.bpifrance.fr, catalogue officiel Bpifrance).
        */}
        <div className="flex flex-wrap items-start gap-12">
          {/* Prise en charge Bpifrance */}
          <Lecture libelle="Prise en charge" valeur="50" unite="%" />
          {/* Plafond du devis */}
          <Lecture libelle="Plafond du devis" valeur="13 000" unite="€ HT" />
          {/* Reste à charge */}
          <Lecture libelle="Reste à charge" valeur="6 500" unite="€ HT" />
        </div>
      </Planche>

      {/* ===== Liste de services ===== */}
      <Planche
        nom="Liste de services"
        note="La liste de la console du hero."
      >
        <ListeServices
          label="Services"
          items={LISTE_DEMO}
          className="max-w-[640px]"
        />
      </Planche>

      {/* ===== Bloc de code ===== */}
      <Planche
        nom="Bloc de code"
        note="Commande, extrait de fichier, bouton Copier."
      >
        <div className="flex flex-col gap-6 max-w-[720px]">
          {/*
            Variante commande : installation du plugin lien universel.
            Source : src/lib/plugins/data.ts, champ install[0].code du plugin "link".
          */}
          <BlocCode
            variante="commande"
            etiquette="bash"
            code={CODE_COMMANDE}
          />
          {/*
            Variante fichier : en-tête du llms.txt d'isomorph.fr.
            Source : src/app/llms.txt/route.ts (handler GET, début du tableau lines).
            La coloration atténue les lignes commençant par # et >.
          */}
          <BlocCode
            variante="fichier"
            etiquette="llms.txt"
            code={CODE_LLMS}
          />
          {/*
            Variante fichier avec numéros de ligne : extrait du robots.txt.
            Source : src/app/robots.ts (MetadataRoute.Robots, trois règles sur sept).
          */}
          <BlocCode
            variante="fichier"
            etiquette="robots.txt"
            lignes
            code={CODE_ROBOTS}
          />
        </div>
      </Planche>

      {/* ===== Encadré ===== */}
      <Planche nom="Encadré" note="Information ou avertissement.">
        <div className="flex flex-col gap-4 max-w-[640px]">
          <Encadre variante="info" titre="Expert conseil Bpifrance agréé">
            ISOMORPH est expert conseil agréé sur le Diag Axes d&apos;Innovation.
            Le dispositif prend en charge 50&nbsp;% du montant.
          </Encadre>
          {/* Source : `src/lib/expertises/data.ts`, note du Diag Axes d'Innovation. */}
          <Encadre variante="alerte" titre="Délai à tenir">
            Environ 10 jours d&apos;intervention, à réaliser dans les 8 mois qui suivent la signature du contrat avec
            Bpifrance.
          </Encadre>
        </div>
      </Planche>
    </SectionVitrine>
  );
}
