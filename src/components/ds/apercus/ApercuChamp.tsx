/**
 * Aperçu vivant — Champ de formulaire.
 * État repos, focus (rendu par le navigateur), erreur.
 * Server Component : les états sont représentés statiquement.
 */

interface Props { fr: boolean; }

export default function ApercuChamp({ fr }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* Champ normal */}
      <div>
        <label htmlFor="apercu-email" className="type-caption text-noir block mb-1">
          {fr ? "Adresse email" : "Email address"} <span aria-hidden="true">*</span>
        </label>
        <input
          id="apercu-email"
          type="email"
          placeholder={fr ? "nom@domaine.fr" : "name@domain.com"}
          className="type-body w-full px-4 py-3 border border-[var(--trait)] bg-blanc focus:outline-none focus:border-noir transition-colors duration-150"
        />
      </div>

      {/* Champ en erreur */}
      <div>
        <label htmlFor="apercu-email-erreur" className="type-caption text-noir block mb-1">
          {fr ? "Adresse email (erreur)" : "Email address (error)"}
        </label>
        <input
          id="apercu-email-erreur"
          type="email"
          defaultValue="invalide"
          aria-invalid="true"
          aria-describedby="apercu-msg-erreur"
          className="type-body w-full px-4 py-3 border border-red-600 bg-blanc focus:outline-none transition-colors duration-150"
        />
        <p id="apercu-msg-erreur" role="alert" className="type-caption text-red-600 mt-1">
          {fr ? "Format d'adresse invalide." : "Invalid email format."}
        </p>
      </div>

      {/* Zone de texte */}
      <div>
        <label htmlFor="apercu-message" className="type-caption text-noir block mb-1">
          {fr ? "Message" : "Message"}
        </label>
        <textarea
          id="apercu-message"
          rows={3}
          placeholder={fr ? "Décrivez votre besoin…" : "Describe your need…"}
          className="type-body w-full px-4 py-3 border border-[var(--trait)] bg-blanc focus:outline-none focus:border-noir transition-colors duration-150 resize-y"
        />
      </div>
    </div>
  );
}
