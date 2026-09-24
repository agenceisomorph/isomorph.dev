import type { Metadata } from "next";
import Link from "next/link";
import { StylesConsole } from "@/components/console/fondations";

/**
 * Conditions générales de vente — /[locale]/cgv
 *
 * Texte fourni par LEGAL dans _docs/legal/cgv-licences.md (25/09/2026).
 * Version française faisant foi. Sous /en : indication + résumé court.
 *
 * RGAA 9.1 : h1 unique.
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const fr = locale !== "en";
  return {
    title: fr ? "Conditions générales de vente" : "Terms of sale",
    robots: { index: false, follow: false },
  };
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="type-h2 font-semibold mb-4"
        style={{ color: "var(--cs-texte)", fontWeight: 600 }}
      >
        {titre}
      </h2>
      {children}
    </section>
  );
}

function TexteFr() {
  return (
    <div className="mx-auto max-w-[800px] px-4 md:px-6 xl:px-8 py-16" style={{ color: "var(--cs-texte-2)" }}>
      <h1 className="type-h1 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
        Conditions générales de vente des licences
      </h1>
      <p className="type-caption mb-10" style={{ color: "var(--cs-texte-3)" }}>
        Date d'entrée en vigueur : [À compléter : date de mise en ligne]
      </p>

      <Bloc titre="Article 1. Vendeur">
        <p className="type-body">
          Les licences sont vendues par ISOMORPH, société à responsabilité limitée au capital de 500 euros, dont le siège social est situé 58 rue de Monceau, 75008 Paris, France, immatriculée au registre du commerce et des sociétés de Paris sous le numéro 881 258 792, numéro de TVA intracommunautaire FR66 881 258 792.
        </p>
        <p className="type-body mt-3">
          Adresse électronique : contact@isomorph.fr. Téléphone : [À compléter].
        </p>
      </Bloc>

      <Bloc titre="Article 2. Objet et champ d'application">
        <p className="type-body mb-3">
          Les présentes conditions régissent la vente, sur le site isomorph.dev, des licences annuelles payantes des extensions logicielles éditées par ISOMORPH.
        </p>
        <p className="type-body">
          Elles ne s'appliquent ni au palier gratuit Community, ni aux extensions et projets diffusés gratuitement sous licence libre.
        </p>
      </Bloc>

      <Bloc titre="Article 3. Définitions">
        <ul className="type-body space-y-2">
          <li><strong style={{ color: "var(--cs-texte)" }}>Extension</strong> : le logiciel édité par ISOMORPH pour lequel une licence payante est proposée.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Licence</strong> : l'abonnement annuel qui donne accès aux fonctionnalités du palier souscrit.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Clé</strong> : la clé de licence délivrée après paiement.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Site</strong> : une instance de l'Extension identifiée par son nom de domaine.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Client</strong> : la personne qui commande une Licence.</li>
        </ul>
      </Bloc>

      <Bloc titre="Article 4. Paliers et caractéristiques">
        <p className="type-body">
          Les paliers payants, leurs fonctionnalités, le nombre de Sites couverts et les niveaux d'assistance sont décrits sur la page de l'offre au jour de la commande. Le Client vérifie avant sa commande la compatibilité de l'Extension avec son environnement technique.
        </p>
      </Bloc>

      <Bloc titre="Article 5. Commande">
        <ol className="type-body list-decimal list-inside space-y-2">
          <li>Choix du palier sur la page de l'offre.</li>
          <li>Saisie de l'adresse électronique.</li>
          <li>Redirection vers la page de paiement sécurisée de Stripe.</li>
          <li>Validation du paiement : le contrat est conclu à ce moment.</li>
          <li>Affichage de la Clé sur la page de confirmation et envoi par courrier électronique.</li>
        </ol>
      </Bloc>

      <Bloc titre="Article 6. Prix">
        <p className="type-body mb-3">
          Les prix sont ceux affichés sur la page de l'offre au jour de la commande, exprimés en euros. [À compléter : traitement de la TVA selon le pays et la qualité du Client.]
        </p>
        <p className="type-body">
          Un prix de lancement, lorsqu'il est proposé, s'applique dans les conditions indiquées sur la page de l'offre. ISOMORPH peut modifier ses prix ; le nouveau prix s'applique à l'échéance suivante, après notification au Client trente jours avant.
        </p>
      </Bloc>

      <Bloc titre="Article 7. Paiement">
        <p className="type-body mb-3">
          Le prix est payable d'avance, par carte bancaire, via Stripe. Le premier paiement intervient à la commande, les suivants à chaque date anniversaire.
        </p>
        <p className="type-body">
          Pour le Client professionnel, tout impayé porte intérêt au taux BCE majoré de dix points et donne lieu à une indemnité forfaitaire de 40 euros (articles L. 441-10 et D. 441-5 du Code de commerce).
        </p>
      </Bloc>

      <Bloc titre="Article 8. Délivrance de la Clé">
        <p className="type-body">
          La Clé est délivrée dès la confirmation du paiement, sur la page de confirmation et par courrier électronique. Le Client qui ne la reçoit pas écrit à contact@isomorph.fr.
        </p>
      </Bloc>

      <Bloc titre="Article 9. Durée, renouvellement et résiliation">
        <p className="type-body mb-3">
          La Licence est conclue pour un an et renouvelée automatiquement, sauf résiliation par le Client [À compléter : modalité de résiliation]. À l'expiration ou résiliation, l'Extension fonctionne avec les seules fonctionnalités du palier Community.
        </p>
      </Bloc>

      <Bloc titre="Article 10. Utilisation de la Clé">
        <p className="type-body">
          La Clé est personnelle. Elle couvre au plus le nombre de Sites prévu par le palier souscrit. Toute communication à un tiers ou tout contournement du mécanisme de vérification peut entraîner la résiliation sans remboursement, après mise en demeure restée sans effet pendant quinze jours.
        </p>
      </Bloc>

      <Bloc titre="Article 11. Propriété intellectuelle">
        <p className="type-body">
          L'Extension, sa documentation, ses marques et ses logos restent la propriété d'ISOMORPH. Les droits sur le code sont ceux de la licence publiée dans le dépôt public.
        </p>
      </Bloc>

      <Bloc titre="Article 12. Assistance et mises à jour">
        <p className="type-body">
          L'assistance est fournie selon le niveau prévu par le palier souscrit. Les mises à jour sont publiées dans le dépôt ; le Client choisit le moment de leur installation.
        </p>
      </Bloc>

      <Bloc titre="Article 13. Garanties">
        <p className="type-body mb-3">
          ISOMORPH garantit la conformité des fonctionnalités du palier souscrit à leur description, dans l'environnement compatible indiqué. Le Client signale tout défaut à contact@isomorph.fr.
        </p>
      </Bloc>

      <Bloc titre="Article 14. Responsabilité">
        <p className="type-body">
          À l'égard du Client professionnel, la responsabilité d'ISOMORPH est limitée aux dommages directs et prévisibles, plafonnée au montant payé au cours des douze mois précédant le fait générateur. Cette limitation ne s'applique ni en cas de faute lourde ou dolosive, ni en cas de dommage corporel.
        </p>
      </Bloc>

      <Bloc titre="Article 15. Force majeure">
        <p className="type-body">
          Aucune partie n'est responsable d'un manquement causé par un cas de force majeure au sens de l'article 1218 du Code civil. Si l'empêchement dure plus de deux mois, chaque partie peut résilier la Licence ; le prix de la période non exécutée est remboursé au prorata.
        </p>
      </Bloc>

      <Bloc titre="Article 16. Données personnelles">
        <p className="type-body">
          Les données du Client sont traitées conformément à la{" "}
          <Link href="/fr/confidentialite" style={{ color: "var(--cs-neon)" }}>
            politique de confidentialité
          </Link>{" "}
          du site.
        </p>
      </Bloc>

      <Bloc titre="Article 17. Modification des conditions">
        <p className="type-body">
          Les conditions modifiées s'appliquent à la période de renouvellement suivante, après notification trente jours avant l'échéance.
        </p>
      </Bloc>

      <Bloc titre="Article 18. Dispositions propres au Client consommateur">
        <p className="type-body mb-3">
          <strong style={{ color: "var(--cs-texte)" }}>Droit de rétractation.</strong> Le Client consommateur dispose de quatorze jours à compter de la conclusion du contrat pour se rétracter (article L. 221-18 du Code de la consommation), par courrier électronique à contact@isomorph.fr. ISOMORPH rembourse dans les quatorze jours.
        </p>
        <p className="type-body mb-3">
          <strong style={{ color: "var(--cs-texte)" }}>Médiation.</strong> En cas de litige non résolu, le Client consommateur peut recourir au médiateur de la consommation : [À compléter : nom et site du médiateur].
        </p>
        <p className="type-body">
          <strong style={{ color: "var(--cs-texte)" }}>Renouvellement.</strong> ISOMORPH informe le Client consommateur par courrier électronique, au plus tôt trois mois et au plus tard un mois avant l'échéance, de la possibilité de ne pas renouveler (article L. 215-1 du Code de la consommation). Résiliation possible par voie électronique [À compléter : modalité].
        </p>
      </Bloc>

      <Bloc titre="Article 19. Droit applicable et juridiction">
        <p className="type-body mb-3">
          Les présentes conditions sont soumises au droit français.
        </p>
        <p className="type-body">
          Tout litige entre commerçants relève de la compétence exclusive du tribunal de commerce de Paris.
        </p>
      </Bloc>

      <section className="mb-10">
        <h2 className="type-h2 font-semibold mb-4" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
          Annexe. Formulaire de rétractation
        </h2>
        <div
          className="p-4 rounded type-body"
          style={{ background: "var(--cs-surface)", border: "1px solid var(--cs-trait)" }}
        >
          <p className="mb-3">À l'attention d'ISOMORPH, 58 rue de Monceau, 75008 Paris, France, contact@isomorph.fr :</p>
          <p className="mb-2">Je vous notifie par la présente ma rétractation du contrat portant sur :</p>
          <p className="mb-2">Licence (palier) :</p>
          <p className="mb-2">Commandée le :</p>
          <p className="mb-2">Nom du consommateur :</p>
          <p className="mb-2">Adresse du consommateur :</p>
          <p className="mb-2">Signature (uniquement si envoi papier) :</p>
          <p>Date :</p>
        </div>
      </section>
    </div>
  );
}

function TexteEn() {
  return (
    <div className="mx-auto max-w-[800px] px-4 md:px-6 xl:px-8 py-16" style={{ color: "var(--cs-texte-2)" }}>
      <h1 className="type-h1 font-semibold mb-6" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
        Terms of sale
      </h1>
      <p className="type-body mb-8">
        The French version of this page is the legally binding version. Please refer to the{" "}
        <Link href="/fr/cgv" style={{ color: "var(--cs-neon)" }}>
          French terms of sale
        </Link>{" "}
        for the authoritative text.
      </p>
      <p className="type-body mb-4">
        ISOMORPH sells annual licenses for its Strapi plugins via Stripe. Annual automatic renewal. The free Community tier is not subject to these terms.
      </p>
      <p className="type-body">
        Contact: contact@isomorph.fr — ISOMORPH, 58 rue de Monceau, 75008 Paris, France.
      </p>
    </div>
  );
}

export default async function CgvPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <>
      <StylesConsole />
      <div style={{ background: "var(--cs-fond)", minHeight: "100vh" }}>
        {locale === "en" ? <TexteEn /> : <TexteFr />}
      </div>
    </>
  );
}
