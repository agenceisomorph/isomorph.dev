import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Helpers de navigation typés next-intl v4
 * Exporte useRouter, usePathname, Link et redirect avec locale intégrée
 * À importer depuis "@/i18n/navigation" dans toute l'application
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
