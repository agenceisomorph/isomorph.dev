import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire de fusion de classes Tailwind CSS
 * Combine clsx (conditions) + tailwind-merge (déduplication des classes conflictuelles)
 *
 * @param inputs - Classes CSS conditionnelles ou statiques
 * @returns Chaîne de classes CSS fusionnée et dédupliquée
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-violet-600", "px-8")
 * // → "py-2 bg-violet-600 px-8" (px-4 écrasé par px-8)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// --- Tests unitaires minimaux (à exécuter avec Vitest) ---
// describe("cn", () => {
//   it("fusionne les classes statiques", () => {
//     expect(cn("px-4", "py-2")).toBe("px-4 py-2");
//   });
//   it("résout les conflits Tailwind", () => {
//     expect(cn("px-4", "px-8")).toBe("px-8");
//   });
//   it("ignore les valeurs falsy", () => {
//     expect(cn("px-4", false, undefined, null)).toBe("px-4");
//   });
// });
