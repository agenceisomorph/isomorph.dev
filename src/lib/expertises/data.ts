/**
 * Types partagés des pages d'expertise.
 * Stub minimal pour la compatibilité avec les composants Console.
 */

export interface NumberedStep {
  title: string;
  body: string;
}

export interface StepsBlock {
  heading: string;
  anchorId?: string;
  items: NumberedStep[];
}
