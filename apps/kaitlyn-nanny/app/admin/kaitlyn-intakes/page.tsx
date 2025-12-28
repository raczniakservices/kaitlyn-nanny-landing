"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type IntakeRow = {
  id: string;
  created_at: string;
  parent_name: string | null;
  email: string | null;
  phone: string | null;
  care_type: string | null;
  one_time_date: string | null;
};

type StorageMeta =
  | { source: "postgres"; usedFallback: false }
  | { source: "file"; usedFallback: false; reason: string }
  | { source: "file"; usedFallback: true; reason: string };

type StorageHealth = {
  fileDir: string;
  filePath: string;
  fileExists: boolean;
  fileWritable: boolean;
  filePersistent: boolean;
  postgresConfigured: boolean;
};

function fmt(dt: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(dt));
  } catch {
    return dt;
  }
}

export default function KaitlynIntakesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<IntakeRow[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [meta, setMeta] = useState<StorageMeta | null>(null);
  const [health, setHealth] = useState<StorageHealth | null>(null);

  function mergeRows(prev: IntakeRow[], incoming: IntakeRow[]) {
    const byId = new Map<string, IntakeRow>();
    for (const r of prev) byId.set(r.id, r);
    for (const r of incoming) byId.set(r.id, r);
    return Array.from(byId.values()).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/kaitlyn-intakes?limit=200&t=${Date.now()}`, {
        cache: "no-store" as any
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      const incoming = (json.intakes || []) as IntakeRow[];
      setRows((prev) => mergeRows(prev, incoming));
      setMeta(json.meta || null);
      setHealth(json.health || null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function clearAllLeads() {
    const ok = window.confirm("Delete all requests? This cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/kaitlyn-intakes?t=${Date.now()}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to delete");
      setRows([]);
      setMeta(json.meta || null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setDeleting(false);
    }
  }

  async function deleteIndividual(id: string, e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation(); // Stop event bubbling
    
    const ok = window.confirm("Delete this submission? This cannot be undone.");
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/kaitlyn-intakes/${encodeURIComponent(id)}`, { 
        method: "DELETE" 
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to delete");
      
      // Remove from local state
      setRows((prev) => prev.filter((r) => r.id !== id));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    refresh()
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = useMemo(() => rows.length, [rows.length]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold tracking-widest text-slate-500">ADMIN</div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Kaitlyn – Requests</h1>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {loading ? "Loading…" : `${count} requests`}
              {lastUpdated ? <span className="text-slate-500"> · updated {lastUpdated}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refresh()}
              disabled={loading || deleting}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            <button
              onClick={() => clearAllLeads()}
              disabled={loading || deleting}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete all"}
            </button>

            <Link href="/admin" className="text-sm font-extrabold text-blue-600">
              Admin home
            </Link>

            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-extrabold text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {error}
          </div>
        ) : null}

        {meta ? (
          <div
            className={[
              "mt-4 rounded-2xl border px-4 py-3 text-xs font-semibold",
              meta.source === "postgres" || (meta.source === "file" && health?.filePersistent)
                ? "border-slate-200 bg-white text-slate-700"
                : "border-amber-200 bg-amber-50 text-amber-900"
            ].join(" ")}
          >
            <span className="font-extrabold text-slate-900">Storage:</span>{" "}
            {meta.source === "postgres"
              ? "Postgres (persistent)"
              : health?.filePersistent
                ? "Persistent disk storage"
                : "Temporary file storage"}
            {meta.source === "file" ? (
              <span className="text-slate-500"> · {meta.reason}</span>
            ) : null}
            {meta.usedFallback ? <span className="ml-1 text-amber-700">· using fallback right now</span> : null}
            {meta.source === "file" && health?.filePersistent ? (
              <span className="text-slate-500"> · saved under {health.fileDir}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-900">
            Latest requests
          </div>

          <div className="divide-y divide-slate-100">
            {!loading && rows.length === 0 ? (
              <div className="px-4 py-6 text-sm font-semibold text-slate-500">No requests yet.</div>
            ) : null}

            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/admin/kaitlyn-intakes/${encodeURIComponent(r.id)}`}
                className="block px-4 py-4 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-extrabold text-slate-900">{r.parent_name || "—"}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      <span className="text-slate-500">Care:</span> {r.care_type || "—"}
                      {r.one_time_date ? (
                        <span className="text-slate-500"> · Date:</span>
                      ) : null}
                      {r.one_time_date ? <span className="ml-1">{r.one_time_date}</span> : null}
                    </div>

                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      {r.email ? (
                        <span>
                          <span className="text-slate-500">Email:</span> {r.email}
                        </span>
                      ) : null}
                      {r.phone ? (
                        <span className={r.email ? "ml-3" : ""}>
                          <span className="text-slate-500">Phone:</span> {r.phone}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 text-right flex flex-col items-end gap-2">
                    <div className="text-xs font-extrabold text-slate-500">{fmt(r.created_at)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => deleteIndividual(r.id, e)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 hover:bg-red-100 transition-colors"
                        title="Delete this submission"
                      >
                        Delete
                      </button>
                      <div className="text-sm font-extrabold text-blue-600">View →</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-slate-500">
          Tip: this inbox does not auto-refresh. It only updates when you press Refresh.
        </div>
      </div>
    </main>
  );
}



