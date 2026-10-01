/**
 * Aperçu vivant — Retours utilisateur Console (Notification).
 *
 * Montre les trois niveaux de notification dans leur dessin « Journal ».
 * Utilise `CarteNotification` (figée, sans minuterie) pour un affichage statique.
 * Server Component.
 */

import { CarteNotification } from "@/components/console/retours/Notification";
import { StylesConsole } from "@/components/console/fondations";

export default function ApercuAccordeon() {
  return (
    <>
      <StylesConsole />
      <div className="flex flex-col gap-3 max-w-sm">
        <CarteNotification
          notif={{ type: "succes", message: "Message envoyé. Réponse sous 24 h." }}
        />
        <CarteNotification
          notif={{ type: "alerte", titre: "Quota", message: "Le quota mensuel est presque atteint." }}
        />
        <CarteNotification
          notif={{ type: "erreur", message: "Adresse email invalide." }}
        />
        <CarteNotification
          notif={{ type: "info", message: "Une mise à jour est disponible." }}
        />
      </div>
    </>
  );
}
