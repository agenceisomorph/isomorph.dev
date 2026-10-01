/**
 * Aperçu vivant — composant Bouton Console.
 *
 * Montre les trois variantes (principal, secondaire, tertiaire) dans leur
 * contexte Console réel. Server Component : aucune interactivité requise.
 */

import { Bouton } from "@/components/console/Bouton";
import { StylesConsole } from "@/components/console/fondations";

export default function ApercuBouton() {
  return (
    <>
      <StylesConsole />
      <div className="flex flex-wrap items-center gap-4">
        <Bouton variante="principal" href="#">
          Démarrer
        </Bouton>
        <Bouton variante="secondaire" href="#">
          En savoir plus
        </Bouton>
        <Bouton variante="tertiaire" href="#">
          Documentation
        </Bouton>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <Bouton variante="principal" desactive>
          Indisponible
        </Bouton>
        <Bouton variante="secondaire" chargement>
          Envoi en cours
        </Bouton>
      </div>
    </>
  );
}
