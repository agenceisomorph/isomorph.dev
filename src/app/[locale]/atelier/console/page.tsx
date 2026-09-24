import type { Metadata } from "next";

import { PiedDePage } from "@/components/console/contenus/PiedDePage";
import { BarreConsole } from "@/components/console/navigation/BarreConsole";
import { SelecteurPolice } from "@/components/console/identite/SelecteurPolice";
import { VitrineActions } from "@/components/console/vitrine/VitrineActions";
import { VitrineCarrousels } from "@/components/console/vitrine/VitrineCarrousels";
import { VitrineCarte } from "@/components/console/vitrine/VitrineCarte";
import { VitrineComparaison } from "@/components/console/vitrine/VitrineComparaison";
import { VitrineContenus } from "@/components/console/vitrine/VitrineContenus";
import { VitrineDecors } from "@/components/console/vitrine/VitrineDecors";
import { VitrineFondations } from "@/components/console/vitrine/VitrineFondations";
import { VitrineFonds } from "@/components/console/vitrine/VitrineFonds";
import { VitrineFormulaires } from "@/components/console/vitrine/VitrineFormulaires";
import { VitrineGlobe } from "@/components/console/vitrine/VitrineGlobe";
import { VitrineGrilles } from "@/components/console/vitrine/VitrineGrilles";
import { VitrineIdentite } from "@/components/console/vitrine/VitrineIdentite";
import { VitrineNavigation } from "@/components/console/vitrine/VitrineNavigation";
import { VitrineParallaxe } from "@/components/console/vitrine/VitrineParallaxe";
import { VitrinePages } from "@/components/console/vitrine/VitrinePages";
import { VitrineReseau } from "@/components/console/vitrine/VitrineReseau";
import { VitrineRetours } from "@/components/console/vitrine/VitrineRetours";
import { VitrineSections } from "@/components/console/vitrine/VitrineSections";

export const dynamic = "force-static";

/**
 * Atelier : le système de design Console.
 * Adapté d'isomorph.fr/atelier/console — même structure, même planches.
 *
 * noindex posé dans le layout parent (atelier/layout.tsx).
 */
export const metadata: Metadata = {
  title: "Système Console • Atelier ISOMORPH",
  robots: { index: false, follow: false },
};

export default function AtelierConsolePage() {
  return (
    <div data-atelier-console className="relative -mt-12 bg-(--cs-fond) text-white">
      <BarreConsole locale="fr" frPath="/atelier/console" position="fixe" />
      {/* Choix de la police des titres : fixe en haut à droite. */}
      <SelecteurPolice />
      {/* La barre fixe mesure 64 px : la page lui laisse la place. */}
      <main className="pt-16">
        <VitrineFondations />
        <VitrineActions />
        <VitrineNavigation />
        <VitrineFormulaires />
        <VitrineContenus />
        <VitrineRetours />
        <VitrineSections />
        <VitrineParallaxe />
        <VitrineGrilles />
        <VitrineCarrousels />
        <VitrineComparaison />
        <VitrineDecors />
        <VitrinePages />
        <VitrineCarte />
        <VitrineGlobe />
        <VitrineReseau />
        <VitrineIdentite />
        <VitrineFonds />
      </main>
      <PiedDePage locale="fr" frPath="/atelier/console" />
    </div>
  );
}
