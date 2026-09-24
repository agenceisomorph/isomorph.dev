import type { Metadata } from "next";
import Link from "next/link";
import { StylesConsole } from "@/components/console/fondations";

/**
 * Politique de confidentialité — /[locale]/confidentialite
 *
 * Texte fourni par LEGAL dans _docs/legal/politique-confidentialite.md (25/09/2026).
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
    title: fr ? "Politique de confidentialité" : "Privacy policy",
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
      <h1 className="type-h1 font-semibold mb-10" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
        Politique de confidentialité
      </h1>

      <p className="type-body mb-10">
        ISOMORPH traite les données personnelles collectées sur isomorph.dev conformément au règlement (UE) 2016/679 (RGPD) et à la loi n° 78-17 du 6 janvier 1978 modifiée.
      </p>

      <Bloc titre="Responsable du traitement">
        <p className="type-body mb-3">
          ISOMORPH, 58 rue de Monceau, 75008 Paris, France. Adresse électronique : contact@isomorph.fr.
        </p>
        <p className="type-body">
          ISOMORPH n'a pas désigné de délégué à la protection des données, aucune des situations prévues à l'article 37 du RGPD n'étant réunie. Les demandes sont traitées directement à contact@isomorph.fr.
        </p>
      </Bloc>

      <Bloc titre="Ce que le site collecte">
        <p className="type-body mb-4">
          Le site présente les projets de développement d'ISOMORPH et vend des licences annuelles pour certaines de ses extensions. Il ne comporte ni compte utilisateur, ni lettre d'information, ni mesure d'audience.
        </p>
        <p className="type-body">
          Quatre traitements existent : l'achat et la gestion d'une licence, la vérification de la licence par l'extension, les échanges par courrier électronique et les journaux techniques de l'hébergeur.
        </p>
      </Bloc>

      <Bloc titre="Achat et gestion d'une licence">
        <p className="type-body mb-3">
          Avant le paiement, le site recueille votre adresse électronique et le palier choisi. Le paiement a lieu ensuite sur la page de paiement sécurisée de Stripe. ISOMORPH n'a jamais accès au numéro de carte.
        </p>
        <p className="type-body mb-3">
          Une fois le paiement confirmé, ISOMORPH conserve auprès de Stripe les données de l'abonnement : adresse électronique, identifiant client et identifiant d'abonnement Stripe, palier, clé de licence, date d'échéance, statut de l'abonnement et noms de domaine des sites sur lesquels la licence est activée.
        </p>
        <p className="type-body mb-3">
          <strong style={{ color: "var(--cs-texte)" }}>Finalités.</strong> Conclure et exécuter le contrat de licence, délivrer la clé, gérer le renouvellement, la résiliation et les impayés.
        </p>
        <p className="type-body mb-3">
          <strong style={{ color: "var(--cs-texte)" }}>Base légale.</strong> L'exécution du contrat (article 6.1.b du RGPD). La conservation des pièces comptables repose sur l'obligation légale (article 6.1.c du RGPD).
        </p>
        <p className="type-body">
          <strong style={{ color: "var(--cs-texte)" }}>Durée de conservation.</strong> Les données de l'abonnement sont conservées pendant toute sa durée, puis cinq ans après son terme. Les factures sont conservées dix ans.
        </p>
      </Bloc>

      <Bloc titre="Vérification de la licence">
        <p className="type-body mb-3">
          L'extension installée sur le site du Client interroge périodiquement isomorph.dev pour vérifier la licence. Chaque vérification transmet la clé de licence et le nom de domaine du site.
        </p>
        <p className="type-body">
          <strong style={{ color: "var(--cs-texte)" }}>Base légale.</strong> L'exécution du contrat (article 6.1.b du RGPD). Durée : la durée de l'abonnement, puis cinq ans.
        </p>
      </Bloc>

      <Bloc titre="Ce que le site enregistre dans le navigateur">
        <p className="type-body mb-3">
          Le site ne dépose aucun cookie publicitaire ni de mesure d'audience. Deux informations peuvent être enregistrées, uniquement à la suite d'une action du visiteur :
        </p>
        <ul className="type-body mb-3 list-disc list-inside space-y-2">
          <li>
            <strong style={{ color: "var(--cs-texte)" }}>NEXT_LOCALE</strong> : cookie de langue, supprimé à la fermeture du navigateur.
          </li>
          <li>
            <strong style={{ color: "var(--cs-texte)" }}>isomorph-atelier-console-police-titres</strong> : police choisie dans l'atelier de démonstration, stockage local du navigateur.
          </li>
        </ul>
        <p className="type-body">
          Ces informations ne sont transmises à personne. Elles relèvent de l'exemption de consentement prévue à l'article 82 de la loi n° 78-17.
        </p>
      </Bloc>

      <Bloc titre="Destinataires">
        <p className="type-body mb-3">
          Les sous-traitants au sens de l'article 28 du RGPD sont :
        </p>
        <ul className="type-body list-disc list-inside space-y-2">
          <li><strong style={{ color: "var(--cs-texte)" }}>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis. Héberge le site.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Stripe Payments Europe, Limited</strong>, Dublin, Irlande. Traite les paiements.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Scaleway SAS</strong>, Paris, France. Achemine le courrier de livraison de la clé.</li>
          <li><strong style={{ color: "var(--cs-texte)" }}>Google Ireland Limited</strong>, Dublin. Héberge la messagerie professionnelle d'ISOMORPH.</li>
        </ul>
      </Bloc>

      <Bloc titre="Vos droits">
        <p className="type-body mb-3">
          Droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. Pour les exercer : contact@isomorph.fr. Délai de réponse : un mois.
        </p>
        <p className="type-body">
          Réclamation : Commission nationale de l'informatique et des libertés, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, www.cnil.fr.
        </p>
      </Bloc>

      <p className="type-caption mt-12" style={{ color: "var(--cs-texte-3)" }}>
        Dernière mise à jour : [À compléter : date de mise en ligne].
      </p>
    </div>
  );
}

function TexteEn() {
  return (
    <div className="mx-auto max-w-[800px] px-4 md:px-6 xl:px-8 py-16" style={{ color: "var(--cs-texte-2)" }}>
      <h1 className="type-h1 font-semibold mb-6" style={{ color: "var(--cs-texte)", fontWeight: 600 }}>
        Privacy policy
      </h1>
      <p className="type-body mb-8">
        The French version of this page is the legally binding version. Please refer to the{" "}
        <Link href="/fr/confidentialite" style={{ color: "var(--cs-neon)" }}>
          French privacy policy
        </Link>{" "}
        for the authoritative text.
      </p>
      <p className="type-body mb-4">
        ISOMORPH processes personal data collected on isomorph.dev in compliance with GDPR (EU) 2016/679. The site sells annual licenses for its Strapi plugins. No advertising or analytics cookies are used.
      </p>
      <p className="type-body">
        To exercise your rights or for any privacy-related request: contact@isomorph.fr.
      </p>
    </div>
  );
}

export default async function ConfidentialitePage({ params }: PageProps) {
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
