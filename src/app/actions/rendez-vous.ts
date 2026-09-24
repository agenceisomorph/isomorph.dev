"use server";

/**
 * Stub des Server Actions de prise de rendez-vous.
 * Le composant PriseRendezVous.tsx existe dans le système Console mais n'est
 * pas monté dans l'atelier d'isomorph.dev. Ce stub satisfait les imports
 * TypeScript sans nécessiter une connexion au Cockpit.
 */

export interface BookingSlot {
  start: string;
  end: string;
}

/** Champs du formulaire de rendez-vous (mirroir du schéma Zod dans isomorph.fr). */
type ChampsRdv = {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  message?: string;
  startTime: string;
  endTime: string;
  website_url2?: string;
};

export type EtatRdv = {
  success: boolean;
  errors?: Partial<Record<keyof ChampsRdv, string>>;
  globalError?: string;
  /** Le créneau a été pris entre l'affichage et la soumission. */
  conflict?: boolean;
  confirmed?: { startTime: string; meetLink: string | null };
};

/** Retourne une liste vide : pas de Cockpit connecté sur isomorph.dev. */
export async function lireCreneaux(): Promise<{
  slots: BookingSlot[];
  connected: boolean;
}> {
  return { slots: [], connected: false };
}

/** Stub : aucune réservation sur isomorph.dev. */
export async function soumettreRdv(
  _prevState: EtatRdv,
  _formData: FormData,
): Promise<EtatRdv> {
  return { success: false, globalError: "Non disponible sur ce site." };
}
