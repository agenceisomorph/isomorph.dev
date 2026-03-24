/**
 * Composant utilitaire JSON-LD — données structurées Schema.org
 *
 * Pattern officiel Next.js App Router pour l'injection de JSON-LD.
 * Référence : https://nextjs.org/docs/app/guides/json-ld
 *
 * Sécurité XSS : les caractères "<" sont remplacés par leur équivalent Unicode
 * "\u003c" conformément à la recommandation Next.js. Ce composant n'accepte
 * que des objets JavaScript typés — jamais de contenu utilisateur non validé.
 *
 * Note : next/script est optimisé pour du JS exécutable. Pour les données
 * structurées non-exécutables, la balise <script> native est le bon choix
 * (confirmé par la doc Next.js v16).
 *
 * SIGNAL — ISOMORPH SEO technique
 */

interface JsonLdProps {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>;
}

export default function JsonLd({ id, schema }: JsonLdProps) {
  // Sérialise et échappe "<" pour prévenir les injections dans les strings JSON
  // Voir : https://nextjs.org/docs/app/guides/json-ld
  const serialized = JSON.stringify(schema).replace(/</g, "\\u003c");

  return (
    <script
      id={id}
      type="application/ld+json"
      // nosemgrep: react-dangerouslysetinnerhtml
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
