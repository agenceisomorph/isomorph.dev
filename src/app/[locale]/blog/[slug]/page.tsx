import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getPostBySlug,
  getAllPostParams,
  formatDate,
} from "@/lib/blog";
import type { Locale, ContentBlock } from "@/lib/blog";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

/**
 * Page article de blog — /[locale]/blog/[slug]
 *
 * SEO : generateMetadata dynamique, JSON-LD TechArticle
 * RGAA 9.1 : h1 unique (titre de l'article)
 * Rendu : blocs typés (pas d'injection HTML directe)
 * SSG : generateStaticParams pour tous les articles
 */

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale as Locale);
  if (!post) return {};
  const content = post.content[locale as Locale];
  if (!content) return {};

  return {
    title: content.title,
    description: content.description,
    keywords: post.keywords,
    authors: [{ name: "ISOMORPH", url: "https://isomorph.dev" }],
    openGraph: {
      title: content.title,
      description: content.description,
      url: `https://isomorph.dev/${locale}/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    alternates: {
      canonical: `https://isomorph.dev/${locale}/blog/${slug}`,
      languages: post.locales.reduce(
        (acc, l) => {
          acc[l] = `https://isomorph.dev/${l}/blog/${slug}`;
          return acc;
        },
        {} as Record<string, string>
      ),
    },
  };
}

const CATEGORY_STYLES: Record<string, string> = {
  tutorial: "bg-violet-50 text-violet-700 border border-violet-200",
  guide: "bg-blue-50 text-blue-700 border border-blue-200",
  comparison: "bg-orange-50 text-orange-700 border border-orange-200",
  news: "bg-green-50 text-green-700 border border-green-200",
};

/**
 * Rendu d'un bloc de contenu typé — zéro injection HTML
 */
function Block({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={index} className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p key={index} className="text-gray-600 leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={index} role="list" className="list-disc list-inside space-y-2 mb-6 text-gray-600">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-gray-600">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre
          key={index}
          className="bg-gray-900 text-gray-100 rounded-xl p-5 overflow-x-auto mb-6 text-sm font-mono leading-relaxed"
          aria-label={`Bloc de code ${block.lang}`}
        >
          <code>{block.value}</code>
        </pre>
      );
    case "note":
      return (
        <aside
          key={index}
          className="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg px-5 py-4 mb-6"
        >
          <p className="text-sm text-violet-800 leading-relaxed">{block.text}</p>
        </aside>
      );
    default:
      return null;
  }
}

function ArticlePage({ locale, slug }: { locale: Locale; slug: string }) {
  const t = useTranslations("blog");
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const content = post.content[locale];
  if (!content) notFound();

  const relatedPosts = (post.relatedSlugs ?? [])
    .map((relSlug) => {
      const relPost = getPostBySlug(relSlug, locale);
      if (!relPost) return null;
      const relContent = relPost.content[locale];
      if (!relContent) return null;
      return { slug: relSlug, title: relContent.title };
    })
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Lien retour — RGAA 12.1 */}
      <nav aria-label={t("backToBlog")} className="mb-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors duration-150"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t("backToBlog")}
        </Link>
      </nav>

      {/* En-tête */}
      <header className="mb-12">
        <div className="mb-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[post.category] ?? ""}`}
          >
            {t(`categories.${post.category}`)}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {content.title}
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-6">
          {content.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 border-t border-b border-gray-100 py-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} aria-hidden="true" />
            <time dateTime={post.publishedAt}>
              {t("publishedOn")} {formatDate(post.publishedAt, locale)}
            </time>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} aria-hidden="true" />
            {post.readingTime} {t("minRead")}
          </span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>ISOMORPH</span>
        </div>
      </header>

      {/* Corps de l'article — blocs typés */}
      <div className="article-body">
        {content.blocks.map((block, index) => (
          <Block key={index} block={block} index={index} />
        ))}
      </div>

      {/* Articles liés — maillage interne */}
      {relatedPosts.length > 0 && (
        <aside aria-labelledby="related-heading" className="mt-16 pt-10 border-t border-gray-100">
          <h2 id="related-heading" className="text-base font-semibold text-gray-900 mb-6">
            {t("relatedArticles")}
          </h2>
          <ul role="list" className="space-y-4">
            {relatedPosts.map((rel) => {
              if (!rel) return null;
              return (
                <li key={rel.slug}>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="group flex items-start gap-3 text-sm text-gray-700 hover:text-violet-600 transition-colors duration-150"
                  >
                    <ArrowLeft
                      size={14}
                      aria-hidden="true"
                      className="rotate-180 mt-0.5 text-violet-400 shrink-0"
                    />
                    {rel.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
      )}

      {/* CTA blog */}
      <aside
        aria-labelledby="blog-cta-heading"
        className="mt-16 rounded-xl border border-violet-200 bg-violet-50 p-8 text-center"
      >
        <h2 id="blog-cta-heading" className="text-lg font-bold text-gray-900 mb-2">
          {t("cta.title")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">{t("cta.description")}</p>
        <a
          href="mailto:contact@isomorph.fr"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150"
        >
          {t("cta.button")}
        </a>
      </aside>
    </div>
  );
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const post = getPostBySlug(slug, locale as Locale);
  if (!post) notFound();
  const content = post.content[locale as Locale];
  if (!content) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: content.title,
    description: content.description,
    datePublished: post.publishedAt,
    url: `https://isomorph.dev/${locale}/blog/${slug}`,
    author: {
      "@type": "Organization",
      "@id": "https://isomorph.dev/#organization",
      name: "ISOMORPH",
    },
    publisher: { "@id": "https://isomorph.dev/#organization" },
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    keywords: post.keywords.join(", "),
  };

  return (
    <>
      <script
        id={`ld-article-${slug}`}
        type="application/ld+json"
        suppressHydrationWarning
      >
        {JSON.stringify(articleSchema)}
      </script>
      <ArticlePage locale={locale as Locale} slug={slug} />
    </>
  );
}
