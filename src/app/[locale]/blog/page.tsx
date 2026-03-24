import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPostsByLocale, formatDate } from "@/lib/blog";
import type { Locale } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

/**
 * Page listing du blog — /[locale]/blog
 *
 * SEO : contenu riche, mots-clés Strapi + headless CMS
 * RGAA 9.1 : h1 unique, articles en liste
 * Cocon sémantique : page pilier du contenu éditorial ISOMORPH
 */

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const title = t("title");
  const description = t("subtitle");

  return {
    title,
    description,
    keywords:
      locale === "fr"
        ? ["blog strapi", "tutoriel strapi v5", "guide headless cms", "strapi next.js"]
        : ["strapi blog", "strapi v5 tutorial", "headless cms guide", "strapi next.js"],
    openGraph: {
      title,
      description,
      url: `https://isomorph.dev/${locale}/blog`,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    alternates: {
      canonical: `https://isomorph.dev/${locale}/blog`,
      languages: {
        fr: "https://isomorph.dev/fr/blog",
        en: "https://isomorph.dev/en/blog",
        "x-default": "https://isomorph.dev/en/blog",
      },
    },
  };
}

const CATEGORY_STYLES: Record<string, string> = {
  tutorial: "bg-violet-50 text-violet-700 border border-violet-200",
  guide: "bg-blue-50 text-blue-700 border border-blue-200",
  comparison: "bg-orange-50 text-orange-700 border border-orange-200",
  news: "bg-green-50 text-green-700 border border-green-200",
};

function BlogListing({ locale }: { locale: Locale }) {
  const t = useTranslations("blog");
  const posts = getPostsByLocale(locale);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-500 leading-relaxed">{t("subtitle")}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {locale === "fr"
            ? "Aucun article disponible pour l'instant."
            : "No articles available yet."}
        </p>
      ) : (
        <ul role="list" className="space-y-8">
          {posts.map((post) => {
            const content = post.content[locale];
            if (!content) return null;

            return (
              <li key={post.slug}>
                <article>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-gray-100 bg-white p-6 hover:border-violet-200 hover:shadow-sm transition-all duration-150"
                    aria-label={content.title}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[post.category] ?? ""}`}
                      >
                        {t(`categories.${post.category}`)}
                      </span>
                      <time
                        dateTime={post.publishedAt}
                        className="text-xs text-gray-400"
                      >
                        {t("publishedOn")} {formatDate(post.publishedAt, locale)}
                      </time>
                      <span className="text-xs text-gray-400">
                        · {post.readingTime} {t("minRead")}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors duration-150">
                      {content.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-2xl">
                      {content.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 group-hover:gap-2.5 transition-all duration-150">
                      {t("readMore")}
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  return <BlogListing locale={locale as Locale} />;
}
