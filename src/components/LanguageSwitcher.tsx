"use client";

/**
 * LanguageSwitcher — Client Component (justification : interaction utilisateur
 * avec useRouter/usePathname de next-intl qui nécessitent le contexte navigateur)
 * RGAA 8.7 : changement de langue accessible et explicite
 */

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div
      role="group"
      aria-label="Choisir la langue / Choose language"
      className="flex items-center gap-1"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          aria-pressed={locale === loc}
          aria-label={loc === "fr" ? "Français" : "English"}
          className={cn(
            "px-2 py-1 rounded text-xs font-medium uppercase tracking-wide transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-violet-500",
            locale === loc
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-100"
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
