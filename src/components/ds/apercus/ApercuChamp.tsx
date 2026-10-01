"use client";

/**
 * Aperçu vivant — composant Champ Console.
 *
 * Client Component justifié : le Champ Console est un composant contrôlé
 * (valeur + onChange), il nécessite un état local pour la démo.
 * RGAA 11.1 : libellé visible sur chaque champ.
 * Règle focus ISOMORPH : le bord change de couleur, aucun ring ni outline.
 */

import { useState } from "react";
import { Champ } from "@/components/console/formulaires/Champ";
import { StylesConsole } from "@/components/console/fondations";

export default function ApercuChamp() {
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");

  return (
    <>
      <StylesConsole />
      <div className="flex flex-col gap-5 max-w-sm">
        <Champ
          libelle="Adresse email"
          type="email"
          placeholder="vous@exemple.fr"
          valeur={email}
          onChange={setEmail}
        />
        <Champ
          libelle="Nom"
          type="text"
          placeholder="Jean Dupont"
          valeur={nom}
          onChange={setNom}
          erreur={nom.length === 0 ? "Ce champ est obligatoire." : undefined}
        />
      </div>
    </>
  );
}
