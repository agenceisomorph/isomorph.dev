"use client";

/**
 * Carte Console : copie du thème Snazzy Maps dans le presse-papiers.
 *
 * « use client » justifié : l'écriture dans le presse-papiers et le retour
 * « Copié » n'existent qu'au clic, dans le navigateur. Le rendu serveur est
 * celui du repos (message vide).
 *
 * RGAA : le résultat est annoncé par une zone `role="status"` toujours
 * présente dans la page, dont seul le texte change.
 */

import { useEffect, useRef, useState } from "react";

import { Bouton } from "../Bouton";
import { JSON_SNAZZY } from "./themeSnazzy";

/** Durée d'affichage du retour, en millisecondes. */
const DUREE_RETOUR = 2500;

type Retour = "" | "Copié" | "Copie impossible";

export function CopieTheme() {
  const [retour, setRetour] = useState<Retour>("");
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (minuterie.current) clearTimeout(minuterie.current);
    },
    [],
  );

  const afficher = (texte: Retour) => {
    setRetour(texte);
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => setRetour(""), DUREE_RETOUR);
  };

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(JSON_SNAZZY);
      afficher("Copié");
    } catch {
      /* Presse-papiers refusé ou absent (contexte non sécurisé). */
      afficher("Copie impossible");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Bouton variante="secondaire" fleche={false} onClick={copier}>
        Copier le JSON
      </Bouton>
      <p role="status" className={`type-caption min-h-5 ${retour === "Copié" ? "text-(--cs-neon)" : "text-(--cs-texte-2)"}`}>
        {retour}
      </p>
    </div>
  );
}
