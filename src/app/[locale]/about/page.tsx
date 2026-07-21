import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ExternalLink, Mail, Globe, Github } from "lucide-react";
import JsonLd from "@/components/JsonLd";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const title = locale === "fr" ? "À propos — ISOMORPH, agence Strapi à Paris et Toulon" : "About — ISOMORPH, Strapi Agency in Paris & Toulon";
  const description = t("description");
  return {
    title, description,
    alternates: { canonical: `https://isomorph.dev/${locale}/about`, languages: { fr: "https://isomorph.dev/fr/about", en: "https://isomorph.dev/en/about", "x-default": "https://isomorph.dev/en/about" } },
    openGraph: { title, description, url: `https://isomorph.dev/${locale}/about`, type: "website", locale: locale === "fr" ? "fr_FR" : "en_US", images: [{ url: "https://isomorph.dev/og-image.png", width: 1200, height: 630, alt: "ISOMORPH — Strapi Agency" }] },
    twitter: { card: "summary_large_image", title, description, images: ["https://isomorph.dev/og-image.png"] },
  };
}

function AboutContent() {
  const t = useTranslations("about");
  const values = ["openSource", "quality", "transparency"] as const;
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">{t("title")}</h1>
        <p className="text-lg text-zinc-400 mb-4">{t("subtitle")}</p>
        <p className="text-zinc-500 leading-relaxed">{t("description")}</p>
      </div>
      <section aria-labelledby="mission-heading" className="mb-16 rounded-xl border border-zinc-800 bg-zinc-900/30 p-8">
        <h2 id="mission-heading" className="text-xl font-bold text-zinc-100 mb-4">{t("mission.title")}</h2>
        <p className="text-zinc-500 leading-relaxed max-w-2xl">{t("mission.description")}</p>
      </section>
      <section aria-labelledby="values-heading" className="mb-16">
        <h2 id="values-heading" className="text-xl font-bold text-zinc-100 mb-8">Nos valeurs</h2>
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map((key) => (
            <li key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h3 className="text-base font-semibold text-zinc-100 mb-2">{t(`values.${key}.title`)}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{t(`values.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="contact-heading" className="max-w-lg">
        <h2 id="contact-heading" className="text-xl font-bold text-zinc-100 mb-6">{t("contact.title")}</h2>
        <ul role="list" className="space-y-4">
          <li>
            <a href={`mailto:${t("contact.email")}`} className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150">
              <Mail size={16} aria-hidden="true" className="text-violet-500 shrink-0" />
              <span>{t("contact.email")}</span>
            </a>
          </li>
          <li>
            <a href="https://isomorph.fr" target="_blank" rel="noopener noreferrer" aria-label={`${t("contact.website")} (ouvre dans un nouvel onglet)`} className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150">
              <Globe size={16} aria-hidden="true" className="text-violet-500 shrink-0" />
              <span>{t("contact.website")}</span>
              <ExternalLink size={12} aria-hidden="true" className="text-zinc-600" />
            </a>
          </li>
          <li>
            <a href="https://github.com/isomorph-agency" target="_blank" rel="noopener noreferrer" aria-label={`${t("contact.github")} (ouvre dans un nouvel onglet)`} className="inline-flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-100 transition-colors duration-150">
              <Github size={16} aria-hidden="true" className="text-violet-500 shrink-0" />
              <span>{t("contact.github")}</span>
              <ExternalLink size={12} aria-hidden="true" className="text-zinc-600" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const organizationSchema = {
    "@context": "https://schema.org", "@type": "Organization", "@id": "https://isomorph.dev/#organization",
    name: "ISOMORPH", legalName: "ISOMORPH", url: "https://isomorph.dev",
    logo: { "@type": "ImageObject", url: "https://isomorph.dev/og-image.png", width: 1200, height: 630 },
    description: locale === "fr" ? "Agence de développement web spécialisée Strapi, Next.js et TypeScript, basée à Paris et Toulon. Éditeur de plugins open source pour Strapi V5." : "Web development agency specializing in Strapi, Next.js and TypeScript, based in Paris and Toulon, France. Publisher of open source plugins for Strapi V5.",
    foundingDate: "2020",
    foundingLocation: { "@type": "Place", name: "France" },
    founder: { "@type": "Person", name: "Florent Ducase", jobTitle: locale === "fr" ? "Fondateur & CTO" : "Founder & CTO" },
    address: [
      { "@type": "PostalAddress", addressLocality: "Paris", addressRegion: "Île-de-France", addressCountry: "FR", postalCode: "75000" },
      { "@type": "PostalAddress", addressLocality: "Toulon", addressRegion: "Provence-Alpes-Côte d'Azur", addressCountry: "FR", postalCode: "83000" },
    ],
    contactPoint: [{ "@type": "ContactPoint", email: "contact@isomorph.fr", contactType: "customer support", availableLanguage: ["French", "English"] }],
    knowsAbout: ["Strapi CMS", "Next.js", "TypeScript", "Headless CMS", "React", "Node.js", "PostgreSQL", "Web Development"],
    sameAs: ["https://github.com/isomorph-agency", "https://www.npmjs.com/~isomorph-agency", "https://isomorph.fr"],
  };
  return (
    <>
      <JsonLd id="ld-organization-about" schema={organizationSchema} />
      <AboutContent />
    </>
  );
}
