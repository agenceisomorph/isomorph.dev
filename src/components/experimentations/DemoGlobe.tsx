/**
 * Démonstration du globe du système Console.
 *
 * Wrapper autour de Globe (Server Component).
 * Centrage et fond de page.
 */

import { StylesConsole } from "@/components/console/fondations";
import { Globe } from "@/components/console/globe";

export function DemoGlobe() {
  return (
    <div
      className="flex items-center justify-center min-h-full w-full p-8"
      style={{ background: "var(--cs-fond)" }}
    >
      <StylesConsole />
      <div className="w-full max-w-lg">
        <Globe />
      </div>
    </div>
  );
}
