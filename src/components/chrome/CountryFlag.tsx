import type { Locale } from "@/lib/i18n";

/**
 * CountryFlag : mini drapeau 16:11 pour une locale du site.
 *
 * Porté depuis morphin-site (components/ui/CountryFlag.tsx), restreint aux
 * deux locales isomorph.fr (fr, en) : les autres pays du composant d'origine
 * n'ont pas d'usage ici, les reprendre aurait été du code mort.
 *
 * Composant pur (aucun état, aucun effet) : compatible Server Component.
 */

/**
 * Codes acceptés : les deux locales du site, plus les deux zones citées par
 * la page Airtable au sujet de l'hébergement des données.
 */
export type FlagCode = Locale | "us" | "eu";

interface CountryFlagProps {
  locale: FlagCode;
  /** Largeur en px (hauteur = width × 11/16). Défaut 16. */
  width?: number;
}

function FlagBody({ locale }: { locale: FlagCode }) {
  if (locale === "us") {
    return (
      <svg viewBox="0 0 16 11" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
        <rect width="16" height="11" fill="#FFFFFF" />
        {[0, 2, 4, 6, 8, 10].map((y) => (
          <rect key={y} y={y} width="16" height="0.85" fill="#B22234" />
        ))}
        <rect width="7" height="6" fill="#3C3B6E" />
      </svg>
    );
  }

  if (locale === "eu") {
    return (
      <svg viewBox="0 0 16 11" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
        <rect width="16" height="11" fill="#003399" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={8 + 3.1 * Math.sin(a)}
              cy={5.5 - 3.1 * Math.cos(a)}
              r="0.5"
              fill="#FFCC00"
            />
          );
        })}
      </svg>
    );
  }

  if (locale === "fr") {
    return (
      <>
        <span style={{ flex: 1, background: "#0055A4" }} />
        <span style={{ flex: 1, background: "#FFFFFF" }} />
        <span style={{ flex: 1, background: "#EF4135" }} />
      </>
    );
  }

  // en : Union Jack simplifié (identique au port morphin-site).
  return (
    <svg viewBox="0 0 16 11" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <rect width="16" height="11" fill="#012169" />
      <path d="M0 0 L16 11 M16 0 L0 11" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M0 0 L16 11" stroke="#C8102E" strokeWidth="0.8" />
      <path d="M16 0 L0 11" stroke="#C8102E" strokeWidth="0.8" />
      <rect x="0" y="4" width="16" height="3" fill="#FFFFFF" />
      <rect x="6.5" y="0" width="3" height="11" fill="#FFFFFF" />
      <rect x="0" y="4.7" width="16" height="1.6" fill="#C8102E" />
      <rect x="7.2" y="0" width="1.6" height="11" fill="#C8102E" />
    </svg>
  );
}

export function CountryFlag({ locale, width = 16 }: CountryFlagProps) {
  const height = (width * 11) / 16;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        width,
        height,
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
        flexShrink: 0,
        verticalAlign: "middle",
      }}
    >
      <FlagBody locale={locale} />
    </span>
  );
}
