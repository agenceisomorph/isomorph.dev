import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Page racine — redirige vers /fr ou /en selon Accept-Language.
 * Fallback si le middleware next-intl ne matche pas "/".
 */
export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language") ?? "";

  // Détecte si le navigateur préfère le français
  const prefersFrench = acceptLang
    .split(",")
    .some((lang) => lang.trim().toLowerCase().startsWith("fr"));

  redirect(prefersFrench ? "/fr" : "/en");
}
