import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ExternalLink, Mail, Globe, Github } from "lucide-react";

/**
 * Page à propos — /[locale]/about
 * Présentation ISOMORPH, mission, valeurs, contact
 * RGAA 9.1 : h1 unique, hiérarchie h2/h3 cohérente
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | ISOMORPH`,
      description: t("description"),
      url: `https://isomorph.dev/${locale}/about`,
    },
  };
}

function AboutContent() {
  const t = useTranslations("about");

  const values = ["openSource", "quality", "transparency"] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* En-tête */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-400 mb-4">{t("subtitle")}</p>
        <p className="text-zinc-500 leading-relaxed">{t("description")}</p>
      </div>

      {/* Section mission */}
      <section
        aria-labelledby="mission-heading"
        className="mb-16 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8"
      >
        <h2 id="mission-heading" className="text-xl font-bold text-zinc-100 mb-4">
          {t("mission.title")}
        </h2>
        <p className="text-zinc-500 leading-relaxed max-w-2xl">
          {t("mission.description")}
        </p>
      </section>

      {/* Section valeurs */}
      <section aria-labelledby="values-heading" className="mb-16">
        <h2
          id="values-heading"
          className="text-xl font-bold text-zinc-100 mb-8"
        >
          Nos valeurs
        </h2>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {values.map((key) => (
            <li
              key={key}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6"
            >
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                {t(`values.${key}.title`)}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {t(`values.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Section contact */}
      <section
        aria-labelledby="contact-heading"
        className="max-w-lg"
      >
        <h2 id="contact-heading" className="text-xl font-bold text-zinc-100 mb-6">
          {t("contact.title")}
        </h2>
        <ul role="list" className="space-y-4">
          <li>
            <a
              href={`mailto:${t("contact.email")}`}
              className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            >
              <Mail
                size={16}
                aria-hidden="true"
                className="text-violet-500 shrink-0"
              />
              <span>{t("contact.email")}</span>
            </a>
          </li>
          <li>
            <a
              href="https://isomorph.fr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("contact.website")} (ouvre dans un nouvel onglet)`}
              className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            >
              <Globe
                size={16}
                aria-hidden="true"
                className="text-violet-500 shrink-0"
              />
              <span>{t("contact.website")}</span>
              <ExternalLink size={12} aria-hidden="true" className="text-zinc-600" />
            </a>
          </li>
          <li>
            <a
              href="https://github.com/isomorph-agency"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t("contact.github")} (ouvre dans un nouvel onglet)`}
              className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            >
              <Github
                size={16}
                aria-hidden="true"
                className="text-violet-500 shrink-0"
              />
              <span>{t("contact.github")}</span>
              <ExternalLink size={12} aria-hidden="true" className="text-zinc-600" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default function AboutPage() {
  return <AboutContent />;
}
