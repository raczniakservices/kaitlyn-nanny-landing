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

export default function TargetsPage({ rows }: Props) {
  const [nicheFilter, setNicheFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [minScore, setMinScore] = useState<number>(0);
  const [hasEmailOnly, setHasEmailOnly] = useState<boolean>(false);

  const niches = useMemo(() => Array.from(new Set(rows.map(r => r.niche))).sort(), [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter(r => {
        const score = Number(r.friction_score || 0);
        const emailOk = !hasEmailOnly || (r.email_primary && r.email_primary.trim().length > 0);
        const nicheOk = nicheFilter.length === 0 || nicheFilter.includes(r.niche);
        const regionOk = !regionFilter || (r.region || '').toLowerCase().includes(regionFilter.toLowerCase());
        return score >= minScore && emailOk && nicheOk && regionOk;
      })
      .sort((a, b) => Number(b.friction_score) - Number(a.friction_score));
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
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold tracking-widest text-slate-500">INTERNAL</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">InstantQuote — Top Targets</h1>
            <div className="mt-2 text-sm text-slate-600">
              Total rows: {rows.length}. Showing {filtered.length} after filters.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className="text-sm font-extrabold text-slate-900 hover:underline" href="/">← Public landing</a>
            <a className="text-sm font-extrabold text-brand-700 hover:underline" href="/intake">Intake</a>
            <a className="text-sm font-extrabold text-brand-700 hover:underline" href="/leads">Leads inbox</a>
            <a className="text-sm font-extrabold text-brand-700 hover:underline" href="/automations">Automation showcase</a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
          <div>
            <div className="text-xs font-extrabold text-slate-600">Niche</div>
            <select
              multiple
              value={nicheFilter}
              onChange={e => {
                const opts = Array.from(e.currentTarget.selectedOptions).map(o => o.value);
                setNicheFilter(opts);
              }}
              className="mt-2 h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs font-extrabold text-slate-600">Region</div>
            <input
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.currentTarget.value)}
              placeholder="e.g., Harford"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
              <span>Min score</span>
              <span className="text-slate-900">{minScore}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.currentTarget.value))}
              className="mt-4 w-full accent-brand-600"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="emailOnly"
              type="checkbox"
              checked={hasEmailOnly}
              onChange={e => setHasEmailOnly(e.currentTarget.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            <label htmlFor="emailOnly" className="text-sm font-extrabold text-slate-900">Has email only</label>
          </div>
        </div>

        <h2 className="mt-10 text-xl font-extrabold">Top 20</h2>
        <ResultsTable rows={top20} onCopyEmail={(r) => copyToClipboard(r.email_primary)} onCopyOutreach={(r) => copyToClipboard(outreachTemplate(r))} />

        <h2 className="mt-12 text-xl font-extrabold">All Results</h2>
        <ResultsTable rows={filtered} onCopyEmail={(r) => copyToClipboard(r.email_primary)} onCopyOutreach={(r) => copyToClipboard(outreachTemplate(r))} />
      </div>
    </div>
  );
}

function ResultsTable({ rows, onCopyEmail, onCopyOutreach }: { rows: Row[]; onCopyEmail: (r: Row) => void; onCopyOutreach: (r: Row) => void; }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            {['Business', 'Niche', 'Email', 'Phone', 'Tracking', 'Score', 'Reasons', 'Actions'].map(h => (
              <th key={h} className="whitespace-nowrap border-b border-slate-200 px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-slate-100 last:border-0">
              <td className="px-3 py-3">
                <div className="font-extrabold">{r.business_name}</div>
                <div className="text-xs text-slate-600">
                  <a className="hover:underline" href={r.homepage} target="_blank" rel="noreferrer">{r.domain}</a>
                </div>
              </td>
              <td className="px-3 py-3">{r.niche}</td>
              <td className="px-3 py-3">{r.email_primary || ''}</td>
              <td className="px-3 py-3">{r.phone || ''}</td>
              <td className="px-3 py-3">
                <div className="text-xs text-slate-900">
                  GTM: {(r.has_gtm || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'} • GA: {(r.has_ga || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'}
                </div>
                <div className="text-xs text-slate-500">
                  Ads tag: {(r.has_google_ads_tag || '').toUpperCase() === 'TRUE' ? 'Yes' : 'No'}
                </div>
              </td>
              <td className="px-3 py-3">{r.friction_score} ({r.score_band})</td>
              <td className="px-3 py-3">{(r.notes || '').replaceAll(';', ', ')}</td>
              <td className="whitespace-nowrap px-3 py-3">
                <button onClick={() => onCopyEmail(r)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold hover:bg-slate-50">
                  Copy email
                </button>
                {r.contact_url ? (
                  <a href={r.contact_url} target="_blank" rel="noreferrer" className="ml-2 text-xs font-extrabold text-brand-700 hover:underline">
                    Open contact
                  </a>
                ) : null}
                <a href={r.homepage} target="_blank" rel="noreferrer" className="ml-2 text-xs font-extrabold text-slate-900 hover:underline">
                  Open site
                </a>
                <button onClick={() => onCopyOutreach(r)} className="ml-2 rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800">
                  Copy outreach
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


