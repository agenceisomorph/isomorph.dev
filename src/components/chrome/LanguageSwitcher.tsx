"use client";

/**
 * LanguageSwitcher : sélecteur de langue FR/EN, monté dans NavBar (barre et
 * menu mobile) et dans Footer.
 *
 * "use client" justifié : ouverture/fermeture au clic, fermeture au clavier
 * (Échap) et au clic extérieur, impossible en Server Component.
 *
 * Port adapté depuis morphin-site (components/layout/LanguageSwitcher.tsx,
 * révision 37ca191) : ici seulement 2 locales (pas de next-intl, routing par
 * dossiers (fr)/en avec des chemins indépendants), drapeaux en toutes lettres
 * plutôt qu'en code ISO (RGAA : un lecteur d'écran ne devine pas "FR").
 *
 * Système Console (2026-09-24) : déclencheur discret au repos, plein au
 * survol et à l'ouverture ; panneau de verre sombre à bords coupés, bord
 * néon. La langue courante porte une coche en plus de la couleur (RGAA 3.1 :
 * l'information ne repose pas sur la couleur seule). Icônes au trait en
 * SVG inline : plus d'import de bibliothèque d'icônes dans ce composant
 * client, présent sur toutes les pages.
 *
 * RGAA :
 * - 7.3  : Échap ferme et rend le focus au déclencheur ; clic extérieur ferme.
 *          L'Échap est consommé (preventDefault) pour qu'un conteneur qui
 *          écoute aussi Échap (menu mobile du NavBar) ne se ferme pas avec.
 * - 8.1  : lang + hrefLang sur chaque option (langue de la page de destination)
 * - 10.7 : focus sans anneau, le bord ou le fond s'allume comme au survol
 * - 11.1 : bouton natif <button>, panneau en liste de vrais liens (pas de
 *          role="menu" : un changement de langue n'est pas une action de menu
 *          applicatif, c'est une navigation ; le motif "disclosure" convient)
 */

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { CountryFlag } from "./CountryFlag";
import { cn } from "@/lib/cn";
import { LOCALIZED_PATHS, type Locale } from "@/lib/i18n";
import { cheminMiroir } from "@/components/site/familles";

/**
 * Page EN de repli quand la page FR courante n'a pas de miroir anglais :
 * "l'index EN de fait" du site (les 10 pages d'expertise, les actualités et
 * les pages légales n'existent qu'en français). Plutôt que de masquer le
 * sélecteur comme avant cette unification, on assume la navigation vers
 * l'entrée EN la plus proche, avec un aria-label qui le dit explicitement.
 */
const EN_FALLBACK_PATH = "/en/plugins";

interface LanguageOption {
  locale: Locale;
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface LanguageSwitcherProps {
  locale: Locale;
  /** Chemin FR canonique de la page courante (clé de LOCALIZED_PATHS). */
  frPath: string;
  /** Ton du fond sur lequel est posé le déclencheur : "dark" (barre de l'accueil, menu mobile) ou "light". */
  tone?: "dark" | "light";
  /**
   * Sens d'ouverture du panneau. "up" pour un sélecteur posé en bas d'écran
   * ou de page (menu mobile, pied de page), où un panneau ouvert vers le bas
   * sortirait de la fenêtre. Défaut "down" (comportement historique, barre).
   */
  placement?: "down" | "up";
}

/* Classes complètes par ton : un nom construit par morceaux échapperait au
 * scan statique de Tailwind. */
const TRIGGER_TONE = {
  dark: "text-(--cs-texte-2) hover:text-(--cs-texte) focus-visible:text-(--cs-texte) aria-expanded:text-(--cs-texte)",
  light: "text-(--cs-texte-2) hover:text-(--cs-texte) focus-visible:text-(--cs-texte) aria-expanded:text-(--cs-texte)",
} as const;

const PANEL_PLACEMENT = {
  down: "top-full mt-2",
  up: "bottom-full mb-2",
} as const;

export function LanguageSwitcher({ locale, frPath, tone = "light", placement = "down" }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  /** Panneau calé à gauche du déclencheur au lieu de sa droite (voir l'effet ci-dessous). */
  const [alignStart, setAlignStart] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  /* RGAA 10.11 (320 px) : le panneau est calé sur le bord droit du
   * déclencheur ; quand le déclencheur est proche du bord gauche de l'écran
   * (pied de page replié sur une ligne étroite), il sortirait de la fenêtre.
   * Mesure unique à l'ouverture, avant peinture : aucun saut visible. */
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    if (panelRef.current.getBoundingClientRect().left < 8) setAlignStart(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Échap consommé : le menu mobile (écouteur en phase de bouillonnement)
        // lit defaultPrevented et reste ouvert.
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    // Phase de capture : passe avant l'écouteur Échap du menu mobile, posé
    // sur document en phase de bouillonnement.
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  /* Les pages de la refonte tiennent leur miroir dans `familles.ts` ; les
     autres restent dans la table historique. La question est la même : cette
     page existe-t-elle en anglais. */
  const mirroredEnPath = LOCALIZED_PATHS[frPath] ?? cheminMiroir(frPath);
  const isExactMirror = mirroredEnPath !== undefined;
  const enHref = mirroredEnPath ?? EN_FALLBACK_PATH;

  const options: LanguageOption[] = [
    { locale: "fr", label: "Français", href: frPath },
    {
      locale: "en",
      label: "English",
      href: enHref,
      ariaLabel:
        locale === "fr" && !isExactMirror
          ? "Cette page n'existe pas en anglais : ouvrir l'accueil anglais du site"
          : undefined,
    },
  ];

  const current = options.find((o) => o.locale === locale) ?? options[0];

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={locale === "fr" ? "Changer de langue" : "Change language"}
        onClick={() => {
          setAlignStart(false);
          setOpen((v) => !v);
        }}
        className={cn(
          "type-caption flex h-9 items-center gap-1.5 border border-transparent px-3 outline-none transition-colors duration-(--cs-rapide) hover:border-(--cs-neon-doux) focus-visible:border-(--cs-neon) motion-reduce:transition-none",
          TRIGGER_TONE[tone],
        )}
      >
        <CountryFlag locale={current.locale} width={16} />
        <span className="uppercase tracking-wide">{current.locale}</span>
        <ChevronDownIcon
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          className={cn(
            "absolute z-50 min-w-[168px] border border-(--cs-neon-doux) bg-(--cs-surface-2) p-1.5 shadow-[0_0_24px_rgba(56,189,248,0.14)] backdrop-blur-md [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]",
            alignStart ? "left-0" : "right-0",
            PANEL_PLACEMENT[placement],
          )}
        >
          <ul role="list" className="space-y-0.5">
            {options.map((option) => {
              const isCurrent = option.locale === locale;
              return (
                <li key={option.locale}>
                  <Link
                    href={option.href}
                    lang={option.locale}
                    hrefLang={option.locale}
                    aria-current={isCurrent ? "page" : undefined}
                    aria-label={option.ariaLabel}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "type-caption flex items-center gap-2.5 px-3 py-2 outline-none transition-colors duration-(--cs-rapide) hover:bg-(--cs-neon-voile) focus-visible:bg-(--cs-neon-voile) motion-reduce:transition-none",
                      isCurrent ? "text-(--cs-texte)" : "text-(--cs-texte-2) hover:text-(--cs-texte) focus-visible:text-(--cs-texte)",
                    )}
                  >
                    <CountryFlag locale={option.locale} width={16} />
                    {option.label}
                    {isCurrent && <CheckIcon className="ml-auto h-4 w-4 text-(--cs-neon)" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─── Icônes au trait (grille 24 px, trait 1,5 px, style Lucide ISC) ────── */

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
