import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

/**
 * Middleware next-intl — gestion du routage i18n FR/EN
 * Redirige automatiquement vers la locale détectée depuis Accept-Language
 */
export default createMiddleware(routing);

export const config = {
  // Matcher qui inclut explicitement "/" et toutes les routes non-statiques
  matcher: [
    "/",
    "/(fr|en)/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
