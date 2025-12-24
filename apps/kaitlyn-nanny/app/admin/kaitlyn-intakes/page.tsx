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
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [meta, setMeta] = useState<StorageMeta | null>(null);
  const refreshTimer = useRef<any>(null);

  async function refresh() {
    setError("");
    try {
      const res = await fetch(`/api/admin/kaitlyn-intakes?limit=200&t=${Date.now()}`, {
        cache: "no-store" as any
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      setRows(json.intakes || []);
      setMeta(json.meta || null);
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

  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    if (autoRefresh) {
      refreshTimer.current = setInterval(() => {
        refresh().catch(() => {});
      }, 8000);
    }
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

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
              disabled={loading}
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>

            <label className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh
            </label>

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
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700">
            <span className="font-extrabold text-slate-900">Storage:</span>{" "}
            {meta.source === "postgres" ? "Postgres (persistent)" : "File fallback (may be temporary)"}
            {meta.source === "file" ? (
              <span className="text-slate-500"> · {meta.reason}</span>
            ) : null}
            {meta.usedFallback ? <span className="ml-1 text-amber-700">· using fallback right now</span> : null}
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
                  <div className="min-w-0">
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

                  <div className="shrink-0 text-right">
                    <div className="text-xs font-extrabold text-slate-500">{fmt(r.created_at)}</div>
                    <div className="mt-2 text-sm font-extrabold text-blue-600">View →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs font-semibold text-slate-500">
          Tip: bookmark <code className="font-bold">/admin/kaitlyn-intakes</code> on your phone.
        </div>
      </div>
    </main>
  );
}



