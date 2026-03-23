"use client";

/**
 * Dashboard admin — Gestion des licences
 *
 * /[locale]/admin/licenses
 *
 * Justification "use client" : interactions riches impossibles en Server Component :
 * - Protection par prompt mot de passe (sessionStorage)
 * - Tri des colonnes du tableau (state local)
 * - Recherche en temps réel (state local)
 * - Actions CRUD (fetch API → routes admin protégées)
 * - Copie des clés (clipboard API)
 *
 * Sécu :
 * - Protection côté client par mot de passe (premier niveau — UX, pas sécu forte)
 * - Toutes les mutations passent par l'API avec x-admin-key (sécu réelle)
 * - Le mot de passe admin n'est PAS le ADMIN_API_KEY — c'est un secret UI séparé
 * - En V2 : remplacer par NextAuth avec session server-side
 *
 * RGAA 5.6 : tableau avec en-têtes <th scope="col">
 * RGAA 9.1 : h1 unique
 * RGAA 11.1 : labels sur tous les inputs
 * RGAA 7.1 : boutons avec aria-labels explicites
 *
 * Impact bundle : composant admin non inclus dans le bundle public
 * (route protégée, pas de lien depuis le site public)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Clock,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { License, LicenseStatus } from "@/lib/license";

// ---------------------------------------------------------------------------
// Types locaux
// ---------------------------------------------------------------------------

type SortField = "createdAt" | "expiresAt" | "email" | "plan" | "status";
type SortDirection = "asc" | "desc";

interface Stats {
  active: number;
  expired: number;
  revoked: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/** Formate une date ISO en date lisible */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Tronque une clé de licence pour l'affichage condensé */
function truncateKey(key: string): string {
  const parts = key.split("-");
  if (parts.length < 4) return key;
  return `${parts[0]}-${parts[1]}-****-****-****-${parts[parts.length - 1]}`;
}

/** Couleur du badge de statut */
function statusColor(status: LicenseStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "expired":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "revoked":
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
}

/** Label français du statut */
function statusLabel(status: LicenseStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expirée";
    case "revoked":
      return "Révoquée";
  }
}

// ---------------------------------------------------------------------------
// Hook : récupération des licences
// ---------------------------------------------------------------------------

function useLicenses(adminKey: string) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenses = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/licenses", {
        headers: { "x-admin-key": adminKey },
      });
      if (res.status === 401) {
        setError("Clé admin invalide");
        setLicenses([]);
        return;
      }
      if (!res.ok) {
        throw new Error(`Erreur API : ${res.status}`);
      }
      const data = await res.json() as { licenses: License[] };
      setLicenses(data.licenses ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void fetchLicenses();
  }, [fetchLicenses]);

  return { licenses, loading, error, refresh: fetchLicenses, setLicenses };
}

// ---------------------------------------------------------------------------
// Composant : Badge statut
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: LicenseStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusColor(status)
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Composant : Bouton de copie de clé
// ---------------------------------------------------------------------------

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponible
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Clé copiée" : "Copier la clé de licence"}
      className="inline-flex items-center justify-center w-7 h-7 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-100 hover:border-zinc-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {copied ? (
        <Check size={13} aria-hidden="true" className="text-violet-400" />
      ) : (
        <Copy size={13} aria-hidden="true" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Composant : En-tête de colonne triable
// ---------------------------------------------------------------------------

interface SortableHeaderProps {
  field: SortField;
  label: string;
  current: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}

function SortableHeader({ field, label, current, direction, onSort }: SortableHeaderProps) {
  const isActive = current === field;
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap"
    >
      <button
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-zinc-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
        aria-label={`Trier par ${label}${isActive ? (direction === "asc" ? ", ordre croissant actif" : ", ordre décroissant actif") : ""}`}
      >
        {label}
        {isActive ? (
          direction === "asc" ? (
            <ChevronUp size={12} aria-hidden="true" className="text-violet-400" />
          ) : (
            <ChevronDown size={12} aria-hidden="true" className="text-violet-400" />
          )
        ) : (
          <ChevronsUpDown size={12} aria-hidden="true" className="text-zinc-600" />
        )}
      </button>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function AdminLicensesPage() {
  // --- Authentification par prompt simple ---
  const [adminKey, setAdminKey] = useState<string>("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authInput, setAuthInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // Vérifier si une clé est déjà en sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("isomorph-admin-key");
    if (stored) {
      setAdminKey(stored);
      setAuthenticated(true);
    }
  }, []);

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authInput.trim()) {
      setAuthError(true);
      return;
    }
    // Stocker en sessionStorage (effacé à la fermeture de l'onglet)
    sessionStorage.setItem("isomorph-admin-key", authInput.trim());
    setAdminKey(authInput.trim());
    setAuthenticated(true);
    setAuthError(false);
  }

  function handleLogout() {
    sessionStorage.removeItem("isomorph-admin-key");
    setAdminKey("");
    setAuthenticated(false);
    setAuthInput("");
  }

  // --- Données ---
  const { licenses, loading, error, refresh } = useLicenses(adminKey);

  // --- Recherche ---
  const [searchQuery, setSearchQuery] = useState("");

  // --- Tri ---
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  // --- Filtrage + tri (mémorisés) ---
  const filteredLicenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? licenses.filter(
          (l) =>
            l.email.toLowerCase().includes(q) ||
            l.key.toLowerCase().includes(q) ||
            l.plan.includes(q) ||
            l.status.includes(q)
        )
      : licenses;

    return [...filtered].sort((a, b) => {
      let valA: string = a[sortField] ?? "";
      let valB: string = b[sortField] ?? "";

      // Tri chronologique pour les dates
      if (sortField === "createdAt" || sortField === "expiresAt") {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [licenses, searchQuery, sortField, sortDirection]);

  // --- Statistiques ---
  const stats: Stats = useMemo(
    () => ({
      active: licenses.filter((l) => l.status === "active").length,
      expired: licenses.filter((l) => l.status === "expired").length,
      revoked: licenses.filter((l) => l.status === "revoked").length,
      total: licenses.length,
    }),
    [licenses]
  );

  // --- Actions ---
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleRevoke(id: string, key: string) {
    if (!confirm(`Révoquer la licence ${truncateKey(key)} ?\n\nCette action est irréversible.`)) {
      return;
    }
    setActionLoading(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/licenses/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la révocation");
      }
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExtend(id: string) {
    setActionLoading(id);
    setActionError(null);
    try {
      // Prolonger d'1 an à partir d'aujourd'hui
      const newExpiry = new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      const res = await fetch(`/api/licenses/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          expiresAt: newExpiry.toISOString(),
          status: "active",
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la prolongation");
      }
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Rendu — écran d'authentification
  // ---------------------------------------------------------------------------

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-32">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h1 className="text-xl font-bold text-zinc-100 mb-2 text-center">
            Admin ISOMORPH
          </h1>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Entrez votre clé d&apos;administration pour accéder au dashboard.
          </p>

          <form onSubmit={handleAuthSubmit} noValidate>
            <div className="mb-4">
              {/* RGAA 11.1 : label explicite associé à l'input */}
              <label
                htmlFor="admin-key-input"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2"
              >
                Clé d&apos;administration
              </label>
              <input
                id="admin-key-input"
                type="password"
                value={authInput}
                onChange={(e) => {
                  setAuthInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="isomorph-admin-..."
                autoComplete="current-password"
                aria-describedby={authError ? "auth-error" : undefined}
                aria-invalid={authError}
                className={cn(
                  "w-full rounded-lg border bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors duration-150",
                  authError ? "border-red-500/50" : "border-zinc-700"
                )}
              />
              {authError && (
                <p id="auth-error" role="alert" className="mt-1.5 text-xs text-red-400">
                  Veuillez saisir votre clé d&apos;administration.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
            >
              Accéder au dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Rendu — dashboard
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        {/* RGAA 9.1 : h1 unique */}
        <h1 className="text-2xl font-bold text-zinc-100">
          Licences ISOMORPH
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void refresh()}
            aria-label="Actualiser la liste des licences"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <RefreshCw size={14} aria-hidden="true" className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Erreur API */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 mb-6"
        >
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Erreur d'action */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400 mb-6"
        >
          <AlertCircle size={16} aria-hidden="true" />
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-zinc-100" },
          { label: "Actives", value: stats.active, color: "text-emerald-400" },
          { label: "Expirées", value: stats.expired, color: "text-amber-400" },
          { label: "Révoquées", value: stats.revoked, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-5 text-center"
          >
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-6">
        {/* RGAA 11.1 : label visuellement masqué mais présent pour les AT */}
        <label htmlFor="license-search" className="sr-only">
          Rechercher par email ou clé de licence
        </label>
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        />
        <input
          id="license-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par email ou clé..."
          className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors duration-150"
        />
      </div>

      {/* Tableau des licences */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        {/* Annonce pour les lecteurs d'écran */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loading
            ? "Chargement des licences en cours"
            : `${filteredLicenses.length} licence${filteredLicenses.length !== 1 ? "s" : ""} affichée${filteredLicenses.length !== 1 ? "s" : ""}`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tableau des licences ISOMORPH">
            <thead className="border-b border-zinc-800 bg-zinc-900/50">
              <tr>
                <SortableHeader
                  field="email"
                  label="Email"
                  current={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Clé
                </th>
                <SortableHeader
                  field="plan"
                  label="Plan"
                  current={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="status"
                  label="Statut"
                  current={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="createdAt"
                  label="Création"
                  current={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  field="expiresAt"
                  label="Expiration"
                  current={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && filteredLicenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600 text-sm">
                    {searchQuery ? "Aucune licence ne correspond à votre recherche." : "Aucune licence enregistrée."}
                  </td>
                </tr>
              )}
              {!loading &&
                filteredLicenses.map((license) => (
                  <tr
                    key={license.id}
                    className="bg-zinc-900/10 hover:bg-zinc-800/20 transition-colors duration-100"
                  >
                    {/* Email */}
                    <td className="px-4 py-3 text-zinc-300 max-w-[180px] truncate">
                      <span title={license.email}>{license.email}</span>
                    </td>

                    {/* Clé tronquée + bouton copie */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code
                          className="font-mono text-xs text-zinc-400 bg-zinc-800/50 rounded px-2 py-0.5"
                          title={license.key}
                          aria-label={`Clé : ${license.key}`}
                        >
                          {truncateKey(license.key)}
                        </code>
                        <CopyButton value={license.key} />
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                        {license.plan}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <StatusBadge status={license.status} />
                    </td>

                    {/* Date création */}
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                      {formatDate(license.createdAt)}
                    </td>

                    {/* Date expiration */}
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span
                        className={
                          new Date(license.expiresAt) < new Date()
                            ? "text-red-400"
                            : "text-zinc-500"
                        }
                      >
                        {formatDate(license.expiresAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* Prolonger d'1 an */}
                        <button
                          onClick={() => void handleExtend(license.id)}
                          disabled={actionLoading === license.id}
                          aria-label={`Prolonger la licence de ${license.email} d'un an`}
                          className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-100 transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                          <Clock size={11} aria-hidden="true" />
                          +1 an
                        </button>

                        {/* Révoquer */}
                        {license.status !== "revoked" && (
                          <button
                            onClick={() => void handleRevoke(license.id, license.key)}
                            disabled={actionLoading === license.id}
                            aria-label={`Révoquer la licence de ${license.email}`}
                            className="inline-flex items-center gap-1.5 rounded border border-red-500/20 px-2.5 py-1 text-xs text-red-400 hover:border-red-500/50 hover:text-red-300 transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <Trash2 size={11} aria-hidden="true" />
                            Révoquer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pied de tableau */}
        {!loading && filteredLicenses.length > 0 && (
          <div className="border-t border-zinc-800 px-4 py-3 text-xs text-zinc-600">
            {filteredLicenses.length} / {licenses.length} licence{licenses.length !== 1 ? "s" : ""}
            {searchQuery && ` correspondant à "${searchQuery}"`}
          </div>
        )}
      </div>
    </div>
  );
}
