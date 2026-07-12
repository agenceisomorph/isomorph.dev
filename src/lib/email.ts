/**
 * Envoi d'emails transactionnels — livraison de la clé de licence.
 *
 * Fournisseur : Scaleway TEM (Transactional Email), défaut ISOMORPH.
 * Aucune dépendance : appel direct à l'API HTTP TEM.
 *
 * Sécu : module SERVEUR uniquement (utilise SCW_SECRET_KEY). Ne jamais importer
 * dans un Client Component.
 *
 * Variables d'environnement :
 *   - SCW_SECRET_KEY        : clé secrète Scaleway (scopée TEM)
 *   - SCW_TEM_PROJECT_ID    : id de projet Scaleway (fallback SCW_DEFAULT_PROJECT_ID)
 *   - SCW_TEM_REGION        : région TEM (défaut fr-par)
 *   - TEM_FROM_EMAIL        : expéditeur vérifié (défaut support@isomorph.fr)
 *   - TEM_FROM_NAME         : nom d'expéditeur (défaut "ISOMORPH")
 */

import type { License } from "./license";

interface LicenseEmailContent {
  subject: string;
  html: string;
  text: string;
}

/** Libellé lisible du plan. */
function planLabel(plan: License["plan"]): string {
  return plan === "enterprise" ? "Enterprise" : "Pro";
}

/** Formate une date ISO en JJ/MM/AAAA (fr-FR), sans dépendance. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Construit le contenu de l'email de livraison de licence (PURE — testable).
 * Le corps contient la clé, le plugin, le plan et l'échéance, ainsi que la
 * marche à suivre pour l'activer côté Strapi.
 */
export function buildLicenseEmail(license: License): LicenseEmailContent {
  const plan = planLabel(license.plan);
  const expires = formatDate(license.expiresAt);
  const pluginPkg = `strapi-plugin-${license.plugin}`;

  const subject = `Votre licence ISOMORPH ${plan} — ${pluginPkg}`;

  const text = [
    `Merci pour votre achat !`,
    ``,
    `Voici votre clé de licence ${plan} pour ${pluginPkg} :`,
    ``,
    `    ${license.key}`,
    ``,
    `Valable jusqu'au ${expires}.`,
    ``,
    `Activation (config/plugins.ts de votre projet Strapi) :`,
    ``,
    `  export default ({ env }) => ({`,
    `    ${license.plugin}: {`,
    `      enabled: true,`,
    `      config: { licenseKey: env('COMMENTS_LICENSE_KEY') },`,
    `    },`,
    `  });`,
    ``,
    `Placez la clé dans la variable d'environnement COMMENTS_LICENSE_KEY, puis`,
    `redémarrez Strapi. Le tier Pro se débloque après vérification en ligne.`,
    ``,
    `Besoin d'aide ? support@isomorph.fr`,
    `— ISOMORPH · https://isomorph.dev`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="fr"><body style="margin:0;padding:0;background:#0f0f14;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6e6ea">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:20px;margin:0 0 8px">Merci pour votre achat 🎉</h1>
    <p style="color:#a6a6b0;margin:0 0 24px">Voici votre licence <strong>${plan}</strong> pour <code>${pluginPkg}</code>.</p>
    <div style="background:#17171f;border:1px solid #2a2a36;border-radius:10px;padding:16px 20px;margin:0 0 20px">
      <div style="color:#8a8a96;font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Clé de licence</div>
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;color:#c4b5fd;word-break:break-all">${license.key}</div>
      <div style="color:#8a8a96;font-size:13px;margin-top:10px">Valable jusqu'au ${expires}</div>
    </div>
    <p style="color:#a6a6b0;font-size:14px;line-height:1.6;margin:0 0 8px">Activez-la dans <code>config/plugins.ts</code> :</p>
    <pre style="background:#17171f;border:1px solid #2a2a36;border-radius:10px;padding:16px;overflow:auto;font-size:13px;color:#e6e6ea;margin:0 0 20px"><code>export default ({ env }) =&gt; ({
  ${license.plugin}: {
    enabled: true,
    config: { licenseKey: env('COMMENTS_LICENSE_KEY') },
  },
});</code></pre>
    <p style="color:#a6a6b0;font-size:14px;line-height:1.6;margin:0 0 24px">Placez la clé dans <code>COMMENTS_LICENSE_KEY</code> puis redémarrez Strapi. Le tier Pro se débloque après vérification en ligne.</p>
    <p style="color:#6a6a76;font-size:13px;margin:0">Besoin d'aide ? <a href="mailto:support@isomorph.fr" style="color:#a78bfa">support@isomorph.fr</a><br>— ISOMORPH · <a href="https://isomorph.dev" style="color:#a78bfa">isomorph.dev</a></p>
  </div>
</body></html>`;

  return { subject, html, text };
}

/**
 * Envoie l'email de licence via Scaleway TEM.
 * Ne LÈVE PAS : en cas d'échec (env manquant, erreur TEM), loggue et retourne
 * false — le traitement du webhook Stripe ne doit pas échouer (sinon Stripe
 * retenterait et la licence serait recréée). L'email est rejouable manuellement.
 *
 * @returns true si l'email est parti, false sinon.
 */
export async function sendLicenseEmail(license: License): Promise<boolean> {
  const secretKey = process.env.SCW_SECRET_KEY;
  const projectId =
    process.env.SCW_TEM_PROJECT_ID ?? process.env.SCW_DEFAULT_PROJECT_ID;
  const region = process.env.SCW_TEM_REGION ?? "fr-par";
  const fromEmail = process.env.TEM_FROM_EMAIL ?? "support@isomorph.fr";
  const fromName = process.env.TEM_FROM_NAME ?? "ISOMORPH";

  if (!secretKey || !projectId) {
    console.warn(
      "[email] SCW_SECRET_KEY / SCW_TEM_PROJECT_ID manquant — email de licence non envoyé.",
      { license: license.id }
    );
    return false;
  }

  const { subject, html, text } = buildLicenseEmail(license);

  try {
    const res = await fetch(
      `https://api.scaleway.com/transactional-email/v1alpha1/regions/${region}/emails`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": secretKey,
        },
        body: JSON.stringify({
          from: { email: fromEmail, name: fromName },
          to: [{ email: license.email }],
          subject,
          html,
          text,
          project_id: projectId,
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] TEM ${res.status} — licence ${license.id} : ${detail}`);
      return false;
    }
    console.log(`[email] Licence ${license.key} envoyée à ${license.email}`);
    return true;
  } catch (err) {
    console.error(`[email] Échec envoi licence ${license.id} :`, err);
    return false;
  }
}
