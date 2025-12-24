import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Intake = {
  id: string;
  created_at: string;
  payload: Record<string, any>;
};

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

function Row({ k, v }: { k: string; v: any }) {
  const value = typeof v === "string" ? v : v == null ? "" : JSON.stringify(v, null, 2);
  return (
    <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 10, marginTop: 10 }}>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>{k}</div>
      <pre style={{ margin: "6px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13 }}>{value}</pre>
    </div>
  );
}

export default function KaitlynIntakeDetailPage() {
  const router = useRouter();
  const id = String(router.query.id || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<Intake | null>(null);

  useEffect(() => {
    if (!id) return;
    let ok = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/kaitlyn/intakes/${encodeURIComponent(id)}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
        if (ok) setData(json.intake);
      } catch (e: any) {
        if (ok) setError(String(e?.message || e));
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, [id]);

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900, letterSpacing: 0.3 }}>ADMIN</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 24, lineHeight: 1.1 }}>Kaitlyn – intake detail</h1>
            <div style={{ marginTop: 6, color: "#374151", fontSize: 13 }}>
              {loading ? "Loading…" : data ? `Received ${fmt(data.created_at)}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/admin/kaitlyn-intakes" style={{ color: "#2563eb", fontWeight: 900 }}>← Back to inbox</a>
          </div>
        </div>

        {error ? <div style={errorBox}>{error}</div> : null}

        {data ? (
          <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "white" }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>Submission</div>
            <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
              <div><span style={{ fontWeight: 900 }}>ID:</span> {data.id}</div>
            </div>

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

            <Row k="budgetRange" v={data.payload?.budgetRange} />
            <Row k="notes" v={data.payload?.notes} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  padding: 22,
  fontFamily: "system-ui, Arial, sans-serif",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
};

const errorBox: React.CSSProperties = {
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
  borderRadius: 12,
  padding: 10,
  fontWeight: 800,
  marginTop: 12
};



