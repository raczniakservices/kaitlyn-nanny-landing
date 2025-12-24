import { useEffect, useMemo, useState } from "react";

type IntakeRow = {
  id: string;
  created_at: string;
  parent_name: string | null;
  email: string | null;
  phone: string | null;
  care_type: string | null;
  one_time_date: string | null;
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

  useEffect(() => {
    let ok = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/kaitlyn/intakes?limit=200");
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
        if (ok) setRows(json.intakes || []);
      } catch (e: any) {
        if (ok) setError(String(e?.message || e));
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  const count = useMemo(() => rows.length, [rows.length]);

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900, letterSpacing: 0.3 }}>ADMIN</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 28, lineHeight: 1.1 }}>Kaitlyn – Intake inbox</h1>
            <div style={{ marginTop: 6, color: "#374151" }}>
              {loading ? "Loading…" : `${count} submissions`}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/leads" style={{ color: "#111827", fontWeight: 900 }}>Dashboard leads</a>
            <a href="/" style={{ color: "#2563eb", fontWeight: 900 }}>Home</a>
          </div>
        </div>

        {error ? <div style={errorBox}>{error}</div> : null}

        <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", background: "white" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #e5e7eb", background: "#fafafa", fontWeight: 900 }}>
            Latest submissions
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>Received</Th>
                  <Th>Parent</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Care type</Th>
                  <Th>One-time date</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <Td>{fmt(r.created_at)}</Td>
                    <Td>{r.parent_name || "—"}</Td>
                    <Td>{r.email || "—"}</Td>
                    <Td>{r.phone || "—"}</Td>
                    <Td>{r.care_type || "—"}</Td>
                    <Td>{r.one_time_date || "—"}</Td>
                    <Td>
                      <a href={`/admin/kaitlyn-intakes/${encodeURIComponent(r.id)}`} style={{ color: "#2563eb", fontWeight: 900 }}>
                        View →
                      </a>
                    </Td>
                  </tr>
                ))}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <Td colSpan={7} style={{ padding: 16, color: "#6b7280" }}>
                      No submissions yet.
                    </Td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12, lineHeight: 1.4 }}>
          Tip: bookmark this URL. If you set <code>ADMIN_BASIC_USER</code> and <code>ADMIN_BASIC_PASS</code> on Render, the whole <code>/admin</code> area is password protected.
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children?: any }) {
  return (
    <th style={{ textAlign: "left", fontSize: 12, color: "#6b7280", fontWeight: 900, padding: 10, whiteSpace: "nowrap" }}>
      {children ?? ""}
    </th>
  );
}

function Td(props: any) {
  return <td {...props} style={{ padding: 10, fontSize: 13, color: "#111827", verticalAlign: "top", ...(props.style || {}) }} />;
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


