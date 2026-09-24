/**
 * Étiquette de niveau d'une édition de veille (reprend les trois niveaux des
 * rapports internes : action immédiate, à surveiller, bon à savoir), plus un
 * quatrième état pour une édition sans nouveauté notable.
 *
 * S'appuie sur le composant Badge du système Console : le texte porte seul
 * l'information (RGAA 1.3), la couleur n'est qu'un renfort.
 */

import type { NiveauVeille } from "@/lib/veille";
import { Badge } from "../console/contenus/Badge";
import type { VarianteBadge } from "../console/contenus/Badge";

const LIBELLES: Record<NiveauVeille, string> = {
  action: "À action immédiate",
  surveiller: "À surveiller",
  "bon-a-savoir": "Bon à savoir",
  calme: "Rien de neuf",
};

const LIBELLES_EN: Record<NiveauVeille, string> = {
  action: "Immediate action",
  surveiller: "To watch",
  "bon-a-savoir": "Good to know",
  calme: "Nothing new",
};

const VARIANTES: Record<NiveauVeille, VarianteBadge> = {
  action: "erreur",
  surveiller: "alerte",
  "bon-a-savoir": "neon",
  calme: "neutre",
};

export function Niveau({ niveau, locale = "fr" }: { niveau: NiveauVeille; locale?: string }) {
  const libelles = locale === "en" ? LIBELLES_EN : LIBELLES;
  return <Badge variante={VARIANTES[niveau]}>{libelles[niveau]}</Badge>;
}
