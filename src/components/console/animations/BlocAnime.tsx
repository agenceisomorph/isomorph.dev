"use client";

/**
 * Enveloppe de vitrine : la barre de commandes et le bloc animé.
 *
 * Client Component, justifié : état de la variante active, partagé entre
 * CommandesApparition et Apparition. Les composants enfants (Server
 * Components) passent par children.
 *
 * Éco : état minimal (un identifiant de variante, une référence).
 */

import { useRef, useState, type ReactNode } from "react";

import { Apparition, type ApparitionHandle } from "./Apparition";
import { CATALOGUE, type BlocAnimable } from "./catalogue";
import { CommandesApparition } from "./CommandesApparition";

interface BlocAnimeProps {
  bloc: BlocAnimable;
  children: ReactNode;
}

/** À utiliser uniquement dans les vitrines de l'atelier. */
export function BlocAnime({ bloc, children }: BlocAnimeProps) {
  const variantes = CATALOGUE[bloc].variantes;
  const [variante, setVariante] = useState<string>(variantes[0].id);
  const apparitionRef = useRef<ApparitionHandle>(null);

  return (
    <>
      <CommandesApparition
        variantes={variantes}
        variante={variante}
        onVariante={setVariante}
        onRejouer={() => apparitionRef.current?.rejouer()}
      />
      <Apparition ref={apparitionRef} bloc={bloc} variante={variante}>
        {children}
      </Apparition>
    </>
  );
}
