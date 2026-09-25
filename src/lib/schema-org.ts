/**
 * Données structurées Schema.org pour isomorph.dev.
 * Stub minimal compatible avec les composants Console copiés d'isomorph.fr.
 */

import { BASE_URL } from "@/lib/i18n";

export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: "ISOMORPH",
  url: BASE_URL,
  email: "contact@isomorph.fr",
};

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${BASE_URL}${item.path}` } : {}),
    })),
  };
}
