import { useEffect, useMemo, useState } from 'react';

type Lead = {
    id: string;
    createdAt: string;
    businessName: string;
    serviceType: string;
    serviceArea: string;
    urgency: string;
    goals: string[];
    contactMethod: string;
    facebookUrl?: string;
    facebookName?: string;
    phone?: string;
    email?: string;
    website?: string;
    gbpUrl?: string;
    optionalUpgrades?: string[];
    notes?: string;
};

export default function LeadsInboxPage() {
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [q, setQ] = useState('');
    const [contactFilter, setContactFilter] = useState<string>('facebook');

    async function refresh() {
        setLoading(true);
        const res = await fetch('/api/intake/leads?limit=500');
        const json = await res.json();
        setLeads((json.leads || []) as Lead[]);
        setLoading(false);
    }

    useEffect(() => {
        refresh();
    }, []);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return leads
            .filter(l => {
                if (contactFilter && l.contactMethod !== contactFilter) return false;
                if (!query) return true;
                const hay = [
                    l.businessName,
                    l.serviceType,
                    l.serviceArea,
                    l.urgency,
                    (l.goals || []).join(' '),
                    l.facebookName,
                    l.facebookUrl,
                    l.phone,
                    l.email,
                    l.website,
                    l.gbpUrl,
                    l.notes
                ].filter(Boolean).join(' ').toLowerCase();
                return hay.includes(query);
            })
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }, [leads, q, contactFilter]);

    function copy(text: string) {
        navigator.clipboard.writeText(text);
    }

    function buildFacebookMessage(lead: Lead) {
        const upgrades = (lead.optionalUpgrades || []).join(', ');
        return `Hey ${lead.businessName} - quick question. I put together a tailored plan for ${lead.serviceType} in ${lead.serviceArea}. You mentioned: ${lead.goals?.join(', ') || 'more leads'}. If you want, I can send it over and we can implement only what you choose (${upgrades || 'GBP / Google Ads / landing page / tracking'}). Want me to send it?`;
    }

    return (
        <div style={{ padding: 24, fontFamily: 'system-ui, Arial, sans-serif', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Leads Inbox</h1>
                    <div style={{ color: '#6b7280', marginTop: 6 }}>
                        Intake submissions (Facebook-first by default). Total loaded: {leads.length}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <a href="/intake" style={{ color: '#2563eb', fontWeight: 800 }}>Open intake page →</a>
                    <a href="/" style={{ color: '#111827', fontWeight: 800 }}>Public landing</a>
                    <a href="/admin/targets" style={{ color: '#111827', fontWeight: 800 }}>Targets</a>
                </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.currentTarget.value)}
                    placeholder="Search leads (name, service, area, etc.)"
                    style={{ padding: 10, borderRadius: 12, border: '1px solid #d1d5db', minWidth: 320 }}
                />
                <select value={contactFilter} onChange={(e) => setContactFilter(e.currentTarget.value)} style={{ padding: 10, borderRadius: 12, border: '1px solid #d1d5db' }}>
                    <option value="">All contact methods</option>
                    <option value="facebook">Facebook</option>
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                </select>
                <button onClick={() => refresh()} style={btn} disabled={loading}>
                    {loading ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            <div style={{ marginTop: 14, border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            {['Business', 'Service', 'Urgency', 'Contact', 'Actions'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: 14, color: '#6b7280' }}>
                                    {loading ? 'Loading…' : 'No leads found.'}
                                </td>
                            </tr>
                        ) : filtered.map(l => (
                            <tr key={l.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: 10 }}>
                                    <div style={{ fontWeight: 900 }}>{l.businessName}</div>
                                    <div style={{ color: '#6b7280', fontSize: 12 }}>{new Date(l.createdAt).toLocaleString()}</div>
                                    <div style={{ color: '#374151', fontSize: 12, marginTop: 6 }}>
                                        {(l.goals || []).slice(0, 3).join(' • ')}
                                    </div>
                                </td>
                                <td style={{ padding: 10 }}>
                                    <div style={{ fontWeight: 800 }}>{l.serviceType}</div>
                                    <div style={{ color: '#6b7280', fontSize: 12 }}>{l.serviceArea}</div>
                                </td>
                                <td style={{ padding: 10 }}>{l.urgency}</td>
                                <td style={{ padding: 10, fontSize: 12 }}>
                                    <div style={{ fontWeight: 900, textTransform: 'capitalize' }}>{l.contactMethod}</div>
                                    {l.contactMethod === 'facebook' ? (
                                        <div style={{ color: '#6b7280' }}>
                                            {l.facebookName || ''}
                                            {l.facebookUrl ? (
                                                <div><a href={l.facebookUrl} target="_blank" rel="noreferrer">Open FB</a></div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                    {l.contactMethod === 'text' || l.contactMethod === 'phone' ? <div style={{ color: '#6b7280' }}>{l.phone || ''}</div> : null}
                                    {l.contactMethod === 'email' ? <div style={{ color: '#6b7280' }}>{l.email || ''}</div> : null}
                                </td>
                                <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                                    {l.contactMethod === 'facebook' ? (
                                        <button style={btnSmall} onClick={() => copy(buildFacebookMessage(l))}>Copy FB message</button>
                                    ) : (
                                        <button style={btnSmall} onClick={() => copy(JSON.stringify(l, null, 2))}>Copy details</button>
                                    )}
                                    {l.website ? <a href={l.website} target="_blank" rel="noreferrer" style={{ marginLeft: 10 }}>Website</a> : null}
                                    {l.gbpUrl ? <a href={l.gbpUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 10 }}>GBP</a> : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const btn: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: 12,
    border: '1px solid #111827',
    background: '#111827',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer'
};

const btnSmall: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 12,
    border: '1px solid #111827',
    background: '#2563eb',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer'
};


