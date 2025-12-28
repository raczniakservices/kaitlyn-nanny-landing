"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Intake = {
  id: string;
  created_at: string;
  payload: Record<string, any>;
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
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(dt));
  } catch {
    return dt;
  }
}

function fmtTimeHHMM(t: string) {
  // Admin display helper: convert stored HH:mm (24h) into 12-hour time with AM/PM.
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t).trim());
  if (!m) return t;
  const hh24 = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh24) || !Number.isFinite(mm)) return t;
  if (hh24 < 0 || hh24 > 23 || mm < 0 || mm > 59) return t;
  const ampm = hh24 >= 12 ? "PM" : "AM";
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${hh12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function Row({ k, v }: { k: string; v: any }) {
  const value =
    typeof v === "string"
      ? (k === "startTime" || k === "endTime")
        ? fmtTimeHHMM(v)
        : v
      : v == null
        ? ""
        : JSON.stringify(v, null, 2);
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="text-xs font-extrabold text-slate-500">{k}</div>
      <pre className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold text-slate-900">{value}</pre>
    </div>
  );
}

export default function KaitlynIntakeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Intake | null>(null);
  const [meta, setMeta] = useState<StorageMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ok = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/kaitlyn-intakes/${encodeURIComponent(id)}`, {
          cache: "no-store" as any
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
        if (ok) setData(json.intake);
        if (ok) setMeta(json.meta || null);
      } catch (e: any) {
        if (ok) setError(String(e?.message || e));
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, [id]);

  async function handleDelete() {
    const ok = window.confirm("Delete this submission? This cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/kaitlyn-intakes/${encodeURIComponent(id)}`, { 
        method: "DELETE" 
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to delete");
      
      // Redirect back to inbox after successful deletion
      router.push("/admin/kaitlyn-intakes");
    } catch (e: any) {
      setError(String(e?.message || e));
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold tracking-widest text-slate-500">ADMIN</div>
            <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">Kaitlyn – intake detail</h1>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {loading ? "Loading…" : data ? `Received ${fmt(data.created_at)}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting || loading}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-extrabold text-red-700 shadow-sm hover:bg-red-100 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <Link href="/admin/kaitlyn-intakes" className="text-sm font-extrabold text-blue-600">
              ← Back to inbox
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-extrabold text-slate-900">Submission</div>
            <div className="mt-2 text-xs font-semibold text-slate-500">
              <span className="font-extrabold">ID:</span> {data.id}
            </div>
            {meta ? (
              <div className="mt-2 text-xs font-semibold text-slate-700">
                <span className="font-extrabold text-slate-900">Storage:</span>{" "}
                {meta.source === "postgres" ? "Postgres (persistent)" : "File fallback (may be temporary)"}
                {meta.source === "file" ? <span className="text-slate-500"> · {meta.reason}</span> : null}
                {meta.usedFallback ? <span className="ml-1 text-amber-700">· using fallback right now</span> : null}
              </div>
            ) : null}

            <Row k="parentName" v={data.payload?.parentName} />
            <Row k="email" v={data.payload?.email} />
            <Row k="phone" v={data.payload?.phone} />
            <Row k="contactMethod" v={data.payload?.contactMethod} />

            <Row k="familyType" v={data.payload?.familyType} />
            <Row k="referralSource" v={data.payload?.referralSource} />
            <Row k="referralDetails" v={data.payload?.referralDetails} />
            <Row k="metKaitlyn" v={data.payload?.metKaitlyn} />
            <Row k="wantsInterview" v={data.payload?.wantsInterview} />
            <Row k="returningChanges" v={data.payload?.returningChanges} />

            <Row k="city" v={data.payload?.city} />
            <Row k="zip" v={data.payload?.zip} />

            <Row k="careType" v={data.payload?.careType} />
            <Row k="oneTimeDate" v={data.payload?.oneTimeDate} />
            <Row k="startTime" v={data.payload?.startTime} />
            <Row k="endTime" v={data.payload?.endTime} />
            <Row k="occasionalNotes" v={data.payload?.occasionalNotes} />
            <Row k="recurringNotes" v={data.payload?.recurringNotes} />
            <Row k="notSureDateNotes" v={data.payload?.notSureDateNotes} />

            <Row k="requestOutsideHours" v={data.payload?.requestOutsideHours} />
            <Row k="outsideHoursNotes" v={data.payload?.outsideHoursNotes} />

            <Row k="numChildren" v={data.payload?.numChildren} />
            <Row k="ages" v={data.payload?.ages} />
            <Row k="hasAllergiesOrNeeds" v={data.payload?.hasAllergiesOrNeeds} />
            <Row k="allergiesNotes" v={data.payload?.allergiesNotes} />

            <Row k="servicesNeeded" v={data.payload?.servicesNeeded} />
            <Row k="notes" v={data.payload?.notes} />
          </div>
        ) : null}
      </div>
    </main>
  );
}



