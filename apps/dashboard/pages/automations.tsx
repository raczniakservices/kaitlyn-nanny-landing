export default function AutomationsPage() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui, Arial, sans-serif", maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Automations</h1>
      <div style={{ color: "#6b7280", marginTop: 8, lineHeight: 1.5 }}>
        This page is a placeholder. Use the API routes under <code>/api/automations</code> or return to the dashboard.
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/leads" style={{ color: "#111827", fontWeight: 800 }}>Leads inbox</a>
        <a href="/admin/kaitlyn-intakes" style={{ color: "#2563eb", fontWeight: 800 }}>Kaitlyn intake inbox</a>
      </div>
    </div>
  );
}

