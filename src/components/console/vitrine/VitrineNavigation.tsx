/**
 * Vitrine : la famille Navigation (barre, méga-menu, menu mobile, fil
 * d'Ariane, pagination, onglets).
 *
 * Contenus réels du site uniquement :
 *  - barre, méga-menu et menu mobile : `chrome/expertiseNav.ts` et les liens
 *    de la barre actuelle ;
 *  - fil d'Ariane : celui de la page Strapi, construit comme dans
 *    `site/PageCompetence.tsx` (Accueil, famille, badge « Strapi » de
 *    `content/competences/strapi.tsx`) ;
 *  - onglets : les quatre référentiels de `/methode`
 *    (`expertises/MethodeView.tsx`, constante `REFERENTIELS`), parties fixes
 *    du texte seulement, sans les relevés PageSpeed.
 */

import IsomorphLogo from "@/components/IsomorphLogo";
import { FAMILLES } from "@/components/site/familles";
import { Bouton } from "../Bouton";
import { BarreConsole, SelecteurLangue, appelPrincipal, liensPrincipaux } from "../navigation/BarreConsole";
import { FilAriane } from "../navigation/FilAriane";
import { PanneauMegaMenu } from "../navigation/MegaMenuConsole";
import { MenuBurger, PanneauBurger } from "../navigation/MenuBurger";
import { Onglets, type Onglet } from "../navigation/Onglets";
import { Pagination } from "../navigation/Pagination";
import { Planche, SectionVitrine } from "./kit";

const PAGE_STRAPI = "/developpement/strapi";
const developpement = FAMILLES.developpement;
const strapi = developpement.items.find((item) => item.chemin === PAGE_STRAPI);

interface Referentiel {
  id: string;
  libelle: string;
  titre: string;
  texte: string;
  href: string;
  lien: string;
}

/** Les quatre référentiels de `/methode`, texte repris mot pour mot. */
const REFERENTIELS: Referentiel[] = [
  {
    id: "rgaa",
    libelle: "RGAA 4.1.2",
    titre: "106 critères d'accessibilité.",
    texte:
      "Une obligation légale pour les organismes publics et les grandes entreprises (article 47 de la loi du 11 février 2005), étendue au commerce en ligne depuis le 28 juin 2025 par la directive européenne 2019/882. Les microentreprises en sont dispensées.",
    href: "https://accessibilite.numerique.gouv.fr/",
    lien: "accessibilite.numerique.gouv.fr",
  },
  {
    id: "rgesn",
    libelle: "RGESN 2024",
    titre: "Éco-conception des services numériques.",
    texte:
      "Quatre critères de référence : pages sous 1 Mo, images en formats WebP et AVIF, chargement différé des images hors premier écran, deux familles de polices au maximum. Ces critères s’appliquent aux projets que nous livrons.",
    href: "https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/",
    lien: "ecoresponsable.numerique.gouv.fr",
  },
  {
    id: "cwv",
    libelle: "Core Web Vitals",
    titre: "LCP, INP et CLS mesurés en données réelles (CrUX).",
    texte: "Ce sont les métriques que Google Search prend en compte pour le classement.",
    href: "https://web.dev/articles/vitals",
    lien: "web.dev/articles/vitals",
  },
  {
    id: "owasp",
    libelle: "OWASP Top 10 : 2025",
    titre: "Sécurité applicative.",
    texte:
      "En-têtes de sécurité, accès vérifiés côté serveur, chaque saisie contrôlée, aucun secret dans le code envoyé au navigateur, nombre de requêtes limité.",
    href: "https://owasp.org/www-project-top-ten/",
    lien: "owasp.org",
  },
];

const ONGLETS: Onglet[] = REFERENTIELS.map((r) => ({
  id: r.id,
  libelle: r.libelle,
  contenu: (
    <div className="max-w-[68ch]">
      <h4 className="type-h3 text-white">{r.titre}</h4>
      <p className="type-body mt-2 text-(--cs-texte-2)">{r.texte}</p>
      <div className="mt-5">
        <Bouton href={r.href} variante="tertiaire">
          {r.lien}
        </Bouton>
      </div>
    </div>
  ),
}));

/** Cadre de téléphone : 375 px de large au plus. */
const TELEPHONE = "w-full max-w-[375px] overflow-hidden border border-white/10";

export function VitrineNavigation() {
  return (
    <SectionVitrine id="navigation" index={3} surtitre="Navigation" titre="Barre, méga-menu, menu mobile">
      <Planche nom="Barre" note="Liens dès 1024 px, burger en dessous.">
        {/* Pleine largeur de la section, comme sur le site : la barre garde
            la place prévue pour ses liens à 1024 px. */}
        <div className="-mx-6 md:-mx-12">
          <BarreConsole position="statique" frPath="/methode" />
        </div>
      </Planche>

      <Planche nom="Méga-menu" note="Ouvert depuis Compétences.">
        <PanneauMegaMenu cheminCourant={PAGE_STRAPI} />
      </Planche>

      <Planche nom="Menu mobile" note="Sous 1024 px.">
        <div className="flex flex-wrap items-start gap-8">
          <div className={TELEPHONE}>
            <div className="flex h-16 items-center justify-between gap-4 bg-(--cs-fond) px-4">
              <span aria-hidden="true" className="flex h-11 items-center px-1 text-white">
                <IsomorphLogo className="h-[14px] w-auto" />
              </span>
              <MenuBurger
                cheminCourant={PAGE_STRAPI}
                liens={liensPrincipaux("fr")}
                appel={appelPrincipal("fr")}
                langue={<SelecteurLangue locale="fr" frPath={PAGE_STRAPI} />}
              />
            </div>
          </div>
          <div className={TELEPHONE}>
            <PanneauBurger
              className="h-[700px]"
              cheminCourant={PAGE_STRAPI}
              liens={liensPrincipaux("fr")}
              appel={appelPrincipal("fr")}
              langue={<SelecteurLangue locale="fr" frPath={PAGE_STRAPI} />}
            />
          </div>
        </div>
      </Planche>

      <Planche nom="Fil d'Ariane">
        <FilAriane
          etapes={[
            { libelle: "Accueil", href: "/" },
            { libelle: developpement.nom, href: developpement.chemin },
            { libelle: strapi?.libelle ?? "[À compléter : source familles.ts]" },
          ]}
        />
      </Planche>

      <Planche nom="Pagination">
        <Pagination pageCourante={4} totalPages={12} chemin="/atelier/console" ancre="navigation" />
      </Planche>

      <Planche nom="Onglets" note="Flèches, Début, Fin.">
        <Onglets libelle="Référentiels" onglets={ONGLETS} />
      </Planche>
    </SectionVitrine>
  );
}
