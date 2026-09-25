"use client";

import { useSyncExternalStore } from "react";

const sAbonner = () => () => {};

/**
 * Adresse réellement demandée, lue dans le navigateur. Les pages d'erreur sont
 * générées d'avance : côté serveur, le routeur ne connaît pas l'adresse du
 * visiteur, et l'afficher dès le premier rendu provoquait un écart de rendu
 * (erreur d'hydratation). Vide au premier rendu, remplie juste après.
 */
export function useCheminNavigateur(): string {
  return useSyncExternalStore(
    sAbonner,
    () => window.location.pathname,
    () => "",
  );
}
