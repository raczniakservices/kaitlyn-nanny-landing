import { useEffect, useMemo, useState } from 'react';

type RunIndexEntry = {
    id: string;
    workflowId: string;
    title: string;
    dryRun: boolean;
    startedAt: string;
    finishedAt: string;
    status: 'success' | 'failed';
    runDir: string;
};

type RunsResponse = {
    ok: true;
    index: {
        updatedAt: string;
        entries: RunIndexEntry[];
    };
};

const WORKFLOWS = [
    { id: 'lead_welcome', title: 'Lead Intake → Enrichment → Notifications' },
    { id: 'permit_watch', title: 'Daily Permit Watcher → Slack Digest' },
    { id: 'friction_audit', title: 'Website Friction Audit → Client Report' }
] as const;

export default function AutomationsPage() {
    const [loading, setLoading] = useState(true);
    const [runs, setRuns] = useState<RunIndexEntry[]>([]);
    const [url, setUrl] = useState('https://example.com');
    const [running, setRunning] = useState<string>('');

    async function refresh() {
        setLoading(true);
        const res = await fetch('/api/automations/runs');
        const json = (await res.json()) as RunsResponse;
        setRuns(json.index.entries || []);
        setLoading(false);
    }

    useEffect(() => {
        refresh();
    }, []);

    const grouped = useMemo(() => {
        const map = new Map<string, RunIndexEntry[]>();
        for (const r of runs) {
            map.set(r.workflowId, [...(map.get(r.workflowId) || []), r]);
        }
        return map;
    }, [runs]);

    async function runWorkflow(workflowId: string) {
        setRunning(workflowId);
        try {
            const body: any = { workflowId, dryRun: true };
            if (workflowId === 'friction_audit') body.url = url;

            await fetch(`/api/automations/run?workflowId=${encodeURIComponent(workflowId)}&dryRun=1`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body)
            });
            await refresh();
        } finally {
            setRunning('');
        }
    }

    return (
        <div style={{ padding: 24, fontFamily: 'system-ui, Arial, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Automation Showcase</h1>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>
                        Demo-safe workflows that generate realistic logs + artifacts (no real sending).
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <a href="/" style={{ color: '#2563eb' }}>← Back to targets</a>
                </div>
            </div>

            <div style={{ marginTop: 18, padding: 14, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fafafa' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Friction audit target (real fetch + analysis)</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        style={{ padding: 10, borderRadius: 10, border: '1px solid #d1d5db', minWidth: 280 }}
                    />
                    <button onClick={() => runWorkflow('friction_audit')} disabled={running !== ''} style={buttonStyle}>
                        {running === 'friction_audit' ? 'Running…' : 'Run friction audit'}
                    </button>
                    <button onClick={() => refresh()} disabled={running !== ''} style={{ ...buttonStyle, background: '#111827' }}>
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                {WORKFLOWS.map(w => {
                    const list = grouped.get(w.id) || [];
                    const latest = list[0];
                    return (
                        <div key={w.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <div>
                                    <div style={{ fontWeight: 800 }}>{w.title}</div>
                                    <div style={{ color: '#6b7280', marginTop: 4 }}>id: <code>{w.id}</code></div>
                                </div>
                                <button onClick={() => runWorkflow(w.id)} disabled={running !== ''} style={buttonStyle}>
                                    {running === w.id ? 'Running…' : 'Run demo'}
                                </button>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontWeight: 700 }}>Latest run</div>
                                {!latest ? (
                                    <div style={{ color: '#6b7280', marginTop: 6 }}>No runs yet.</div>
                                ) : (
                                    <div style={{ marginTop: 6, lineHeight: 1.35 }}>
                                        <div>
                                            <b>Status:</b>{' '}
                                            <span style={{ color: latest.status === 'success' ? '#059669' : '#dc2626' }}>
                                                {latest.status}
                                            </span>{' '}
                                            <span style={{ color: '#6b7280' }}>• dry-run</span>
                                        </div>
                                        <div><b>Started:</b> {new Date(latest.startedAt).toLocaleString()}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                                            Run folder: <code>{latest.runDir.split('automation_showcase').pop() || latest.runDir}</code>
                                        </div>
                                        <div style={{ marginTop: 10 }}>
                                            <span style={{ color: '#6b7280' }}>
                                                Tip: open <code>run.json</code> and <code>artifacts/</code> inside that folder.
                                            </span>
                                        </div>
                                        {w.id === 'friction_audit' ? (
                                            <div style={{ marginTop: 10 }}>
                                                <a
                                                    href={`/api/automations/artifact?runId=${encodeURIComponent(latest.id)}&path=${encodeURIComponent('artifacts/audit_report.html')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ color: '#2563eb', fontWeight: 800 }}
                                                >
                                                    Open audit report →
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontWeight: 700 }}>Recent ({Math.min(list.length, 5)})</div>
                                <div style={{ marginTop: 6 }}>
                                    {list.slice(0, 5).map(r => (
                                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderTop: '1px dashed #e5e7eb' }}>
                                            <div style={{ color: '#111827' }}>
                                                <span style={{ fontWeight: 700 }}>{r.status}</span>{' '}
                                                <span style={{ color: '#6b7280' }}>•</span>{' '}
                                                <span style={{ color: '#6b7280' }}>{new Date(r.startedAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ color: '#6b7280', fontSize: 12 }}>
                                                <code>{r.id}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #111827',
    background: '#2563eb',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer'
};


