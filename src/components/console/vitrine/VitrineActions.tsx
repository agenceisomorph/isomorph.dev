/**
 * Vitrine : les trois boutons d'action.
 */

import { Bouton } from "../Bouton";
import { Panneau } from "../fondations";
import { Planche, SectionVitrine } from "./kit";
import { PlancheLiens } from "./PlancheLiens";

export function VitrineActions() {
  return (
    <SectionVitrine id="actions" index={2} surtitre="Actions" titre="CTA principal et variantes" alterne>
      <Planche nom="CTA principal" note="Plein néon. Un seul par écran.">
        <div className="flex flex-wrap items-center gap-6">
          <Bouton href="/contact" taille="l">
            Décrire votre projet
          </Bouton>
          <Bouton href="/contact">Démarrer un projet</Bouton>
          <Bouton chargement>Envoi</Bouton>
          <Bouton desactive>Indisponible</Bouton>
        </div>
      </Planche>

      <Planche nom="CTA variante 1" note="Verre et bord néon, pour l'action voisine du CTA principal.">
        <div className="flex flex-wrap items-center gap-6">
          <Bouton href="/methode" variante="secondaire" taille="l">
            Voir la méthode
          </Bouton>
          <Bouton href="/plugins" variante="secondaire">
            Notre code
          </Bouton>
          <Bouton variante="secondaire" desactive>
            Indisponible
          </Bouton>
        </div>
      </Planche>

      <Planche nom="CTA variante 2" note="Lien d'instrument, pour les actions de lecture.">
        <div className="flex flex-wrap items-center gap-10">
          <Bouton href="/actualites" variante="tertiaire">
            Lire les actualités
          </Bouton>
          <Bouton href="/developpement" variante="tertiaire">
            Concevoir et développer
          </Bouton>
        </div>
      </Planche>

      <PlancheLiens />

      <Planche nom="En situation" note="Principal et variante 1 côte à côte, sur un panneau.">
        <Panneau coupe="l" accent equerres flou className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="type-h3 text-white">Un projet à cadrer ?</p>
            <p className="type-body mt-2 text-(--cs-texte-2)">Réponse directe à chaque demande.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Bouton href="/contact">Décrire votre projet</Bouton>
            <Bouton href="/methode" variante="secondaire">
              Voir la méthode
            </Bouton>
          </div>
        </Panneau>
      </Planche>
    </SectionVitrine>
  );
}
