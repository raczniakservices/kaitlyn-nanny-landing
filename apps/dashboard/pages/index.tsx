import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { useMemo, useState } from 'react';

type Row = {
    niche: string;
    business_name: string;
    domain: string;
    homepage: string;
    contact_url: string;
    email_primary: string;
    email_all: string;
    phone: string;
    has_booking: string; // TRUE/FALSE
    has_chat: string; // TRUE/FALSE
    has_ga?: string; // TRUE/FALSE
    has_gtm?: string; // TRUE/FALSE
    has_google_ads_tag?: string; // TRUE/FALSE
    has_meta_pixel?: string; // TRUE/FALSE
    has_privacy_policy?: string; // TRUE/FALSE
    has_terms?: string; // TRUE/FALSE
    form_inputs: string;
    form_required: string;
    has_file_upload: string; // TRUE/FALSE
    mobile_meta_viewport: string; // TRUE/FALSE
    html_kb: string;
    friction_score: string;
    score_band: 'A' | 'B' | 'C' | 'D';
    targeting_tier: 'PRIORITY' | 'GOOD' | 'PASS' | 'SKIP';
    notes: string;
    region: string;
    crawled_at: string;
};

type Props = { rows: Row[] };

export async function getStaticProps() {
    const csvPath = path.resolve(process.cwd(), '../../data/outputs/leads_latest.csv');
    let rows: Row[] = [];

    if (fs.existsSync(csvPath)) {
        const csvText = fs.readFileSync(csvPath, 'utf8');
        const parsed = Papa.parse<Row>(csvText, { header: true, skipEmptyLines: true });
        rows = (parsed.data || []).filter(r => r.business_name);
    }

    return { props: { rows } };
}

export default function Home({ rows }: Props) {
    const [nicheFilter, setNicheFilter] = useState<string[]>([]);
    const [regionFilter, setRegionFilter] = useState<string>('');
    const [minScore, setMinScore] = useState<number>(0);
    const [hasEmailOnly, setHasEmailOnly] = useState<boolean>(false);

    const niches = useMemo(() => Array.from(new Set(rows.map(r => r.niche))).sort(), [rows]);
    const regions = useMemo(() => Array.from(new Set(rows.map(r => r.region))).sort(), [rows]);

    const filtered = useMemo(() => {
        return rows.filter(r => {
            const score = Number(r.friction_score || 0);
            const emailOk = !hasEmailOnly || (r.email_primary && r.email_primary.trim().length > 0);
            const nicheOk = nicheFilter.length === 0 || nicheFilter.includes(r.niche);
            const regionOk = !regionFilter || (r.region || '').toLowerCase().includes(regionFilter.toLowerCase());
            return score >= minScore && emailOk && nicheOk && regionOk;
        }).sort((a, b) => Number(b.friction_score) - Number(a.friction_score));
    }, [rows, nicheFilter, regionFilter, minScore, hasEmailOnly]);

    const top20 = filtered.slice(0, 20);

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function outreachTemplate(row: Row) {
        const gtm = (row.has_gtm || '').toUpperCase() === 'TRUE';
        const ga = (row.has_ga || '').toUpperCase() === 'TRUE';
        const trackingNote = (!gtm && !ga) ? `I also didn’t see Google Tag Manager / Analytics, so ad tracking is likely missing.` : '';
        return `Subject: Quick mobile fix for missed leads on ${row.business_name}
Hi, I checked ${row.domain} on my phone. The contact form has ${row.form_inputs} fields and there's no fast "book now" option. Most people bounce at that point. ${trackingNote} I build a one‑tap quote widget you can add with a single line of code. It sends you the lead instantly, with photos. Want me to add it to your site for a week so you can see if it brings jobs? If text is easier, reply here and I’ll set it up. — Cody`;
    }

    return (
        <div style={{ padding: 24, fontFamily: 'system-ui, Arial, sans-serif' }}>
            <h1>InstantQuote — Top Targets</h1>
            <div style={{ marginBottom: 10 }}>
                <a href="/automations" style={{ color: '#2563eb', fontWeight: 700 }}>
                    View automation showcase →
                </a>
                <span style={{ marginLeft: 12 }}>
                    <a href="/intake" style={{ color: '#2563eb', fontWeight: 700 }}>
                        Client intake landing page →
                    </a>
                </span>
                <span style={{ marginLeft: 12 }}>
                    <a href="/leads" style={{ color: '#2563eb', fontWeight: 700 }}>
                        Leads inbox →
                    </a>
                </span>
            </div>
            <p>Total rows: {rows.length}. Showing {filtered.length} after filters.</p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12, marginBottom: 20 }}>
                <div>
                    <label>Niche</label>
                    <select multiple value={nicheFilter} onChange={e => {
                        const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                        setNicheFilter(opts);
                    }} style={{ minWidth: 180, height: 100 }}>
                        {niches.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div>
                    <label>Region</label>
                    <input value={regionFilter} onChange={e => setRegionFilter(e.target.value)} placeholder="e.g., Harford" />
                </div>
                <div>
                    <label>Min Score: {minScore}</label>
                    <input type="range" min={0} max={100} value={minScore} onChange={e => setMinScore(Number(e.target.value))} />
                </div>
                <div>
                    <label>
                        <input type="checkbox" checked={hasEmailOnly} onChange={e => setHasEmailOnly(e.target.checked)} /> Has email only
                    </label>
                </div>
            </div>

            <h2>Top 20</h2>
            <ResultsTable rows={top20} onCopyEmail={(r) => copyToClipboard(r.email_primary)} onCopyOutreach={(r) => copyToClipboard(outreachTemplate(r))} />

            <h2 style={{ marginTop: 24 }}>All Results</h2>
            <ResultsTable rows={filtered} onCopyEmail={(r) => copyToClipboard(r.email_primary)} onCopyOutreach={(r) => copyToClipboard(outreachTemplate(r))} />
        </div>
    );
}

function ResultsTable({ rows, onCopyEmail, onCopyOutreach }: { rows: Row[]; onCopyEmail: (r: Row) => void; onCopyOutreach: (r: Row) => void; }) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {['Business', 'Niche', 'Email', 'Phone', 'Tracking', 'Score', 'Reasons', 'Actions'].map(h => (
                            <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: 8 }}>
                                <div style={{ fontWeight: 600 }}>{r.business_name}</div>
                                <div><a href={r.homepage} target="_blank" rel="noreferrer">{r.domain}</a></div>
                            </td>
                            <td style={{ padding: 8 }}>{r.niche}</td>
                            <td style={{ padding: 8 }}>{r.email_primary || ''}</td>
                            <td style={{ padding: 8 }}>{r.phone || ''}</td>
                            <td style={{ padding: 8 }}>
                                <div style={{ fontSize: 12, color: '#111827' }}>
                                    GTM: {(r.has_gtm || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'} • GA: {(r.has_ga || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'}
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>
                                    Ads tag: {(r.has_google_ads_tag || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'}
                                </div>
                            </td>
                            <td style={{ padding: 8 }}>{r.friction_score} ({r.score_band})</td>
                            <td style={{ padding: 8 }}>{(r.notes || '').replaceAll(';', ', ')}</td>
                            <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                                <button onClick={() => onCopyEmail(r)} style={{ marginRight: 8 }}>Copy email</button>
                                {r.contact_url ? <a href={r.contact_url} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>Open contact</a> : null}
                                <a href={r.homepage} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>Open site</a>
                                <button onClick={() => onCopyOutreach(r)}>Copy outreach</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}




