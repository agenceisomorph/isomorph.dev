/**
 * PricingTable — Server Component
 * Tableau comparatif des offres Community / Pro / Enterprise
 * RGAA 5.6 : tableau de données avec en-têtes <th> et scope
 * RGAA 9.3 : liste de features sémantique
 *
 * Le CTA Pro redirige vers le checkout Stripe via la route /api/checkout.
 * CheckoutButton est un Client Component minimal pour l'appel fetch.
 */

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import CheckoutButton from "./CheckoutButton";

interface TierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  ctaLabel: string;
  ctaHref?: string;
  ctaIsCheckout?: boolean;
  priceUnit?: string;
}

function PricingTier({
  name,
  price,
  description,
  features,
  isFeatured = false,
  ctaLabel,
  ctaHref,
  ctaIsCheckout = false,
  priceUnit,
}: TierProps) {
  const ctaClassName = cn(
    "mb-8 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150",
    isFeatured
      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-sm hover:shadow-md"
      : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
  );

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-6 sm:p-8",
        isFeatured
          ? "border-violet-300 bg-white shadow-md ring-1 ring-violet-200"
          : "border-gray-200 bg-white shadow-sm"
      )}
    >
      {/* Badge "Most Popular" */}
      {isFeatured && (
        <div
          aria-label="Offre la plus populaire"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white"
        >
          Most Popular
        </div>
      )}

      {/* En-tête du tier */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Prix */}
      <div className="mb-6" aria-label={`Prix : ${price}${priceUnit ?? ""}`}>
        <div className="flex items-end gap-1">
          {priceUnit ? (
            <>
              <span className="text-4xl font-bold text-gray-900">
                {price}€
              </span>
              <span className="text-sm text-gray-500 mb-1.5">{priceUnit}</span>
            </>
          ) : (
            <span className="text-4xl font-bold text-gray-900">{price}</span>
          )}
        </div>
      </div>

      {/* CTA — checkout Stripe ou lien simple selon le tier */}
      {ctaIsCheckout ? (
        <CheckoutButton
          plan="pro"
          plugin="comments"
          label={ctaLabel}
          className={ctaClassName}
        />
      ) : (
        <a
          href={ctaHref ?? "#"}
          className={ctaClassName}
        >
          {ctaLabel}
        </a>
      )}

      {/* Liste de features — RGAA 9.3 */}
      <ul role="list" className="space-y-3 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <Check
              size={15}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-violet-600"
            />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingTable() {
  const t = useTranslations("pricing");
  const tiers = t.raw("tiers") as Record<
    string,
    { name: string; price: string; description: string; features: string[] }
  >;

  return (
    <section aria-labelledby="pricing-heading">
      <div className="text-center mb-12">
        <h2
          id="pricing-heading"
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
        >
          {t("title")}
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Grille 3 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <PricingTier
          name={tiers.community.name}
          price={tiers.community.price}
          description={tiers.community.description}
          features={tiers.community.features}
          ctaLabel={t("getStarted")}
          ctaHref="https://www.npmjs.com/package/strapi-plugin-comments"
        />
        <PricingTier
          name={tiers.pro.name}
          price={tiers.pro.price}
          description={tiers.pro.description}
          features={tiers.pro.features}
          isFeatured
          ctaLabel={t("getStarted")}
          ctaIsCheckout
          priceUnit={t("perYear")}
        />
        <PricingTier
          name={tiers.enterprise.name}
          price={tiers.enterprise.price}
          description={tiers.enterprise.description}
          features={tiers.enterprise.features}
          ctaLabel={t("contactUs")}
          ctaHref="mailto:contact@isomorph.fr?subject=Enterprise License"
        />
      </div>
    </section>
  );
}
