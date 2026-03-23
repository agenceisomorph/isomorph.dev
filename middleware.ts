import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

/**
 * Middleware next-intl — gestion du routage i18n FR/EN
 * Redirige automatiquement vers la locale détectée depuis Accept-Language
 */
export default createMiddleware(routing);

export const config = {
  // Exclure les routes API, fichiers statiques et métadonnées Next.js
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
