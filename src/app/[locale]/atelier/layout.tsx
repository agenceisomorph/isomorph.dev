import type { Metadata } from "next";

/**
 * Layout de l'atelier : bypasse le Header et Footer du site public.
 * Le système Console porte sa propre barre et son propre pied de page.
 *
 * noindex et nofollow : l'atelier n'est pas indexé par les moteurs.
 */
export const metadata: Metadata = {
  title: "Atelier Console • ISOMORPH",
  robots: { index: false, follow: false },
};

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
