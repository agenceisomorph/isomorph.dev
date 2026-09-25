"use client";

import { Etiquette } from "../fondations";
import { Introuvable } from "../erreurs/Introuvable";
import { Panne } from "../erreurs/Panne";

/**
 * Vitrine des pages d'erreur retenues (dessin Journal) : la 404 puis la 500,
 * chacune à la taille d'un écran. Les quatre autres dessins de chaque page
 * sont récupérables dans le commit ab15064. Dans la vitrine, « Réessayer »
 * ne relance rien (aucune erreur réelle à reprendre).
 */
function Bandeau({ code }: { code: string }) {
  return (
    <div className="border-y border-(--cs-trait) bg-(--cs-fond-2)">
      <div className="mx-auto max-w-[1280px] px-6 py-3 md:px-12">
        <Etiquette>{code}</Etiquette>
      </div>
    </div>
  );
}

const reessayerFactice = () => {};

export function VitrineErreurs() {
  return (
    <>
      <Bandeau code="404" />
      <Introuvable />
      <Bandeau code="500" />
      <Panne reessayer={reessayerFactice} reference="exemple-4f2a9c" />
    </>
  );
}
