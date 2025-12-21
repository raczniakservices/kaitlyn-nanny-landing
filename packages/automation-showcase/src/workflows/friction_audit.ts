import { AutomationArtifact, AutomationStep } from '../types';
import { isoNow, shortId, safeJson } from '../utils';

type Params = {
    dryRun: boolean;
    inputs?: Record<string, unknown>;
};

function asString(v: unknown, fallback: string): string {
    return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

function normalizeUrl(input: string): URL {
    const trimmed = input.trim();
    if (!trimmed) throw new Error('Missing URL');
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return new URL(trimmed);
    // If user passes bare domain, assume https
    return new URL(`https://${trimmed}`);
}

async function fetchText(url: URL, timeoutMs: number): Promise<{ ok: boolean; status: number; html: string; finalUrl: string }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url.toString(), {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: {
                // Keep it polite & recognizable
                'user-agent': 'InstantQuote Audit Bot (demo-safe; read-only)',
                'accept': 'text/html,application/xhtml+xml'
            }
        });
        const text = await res.text();
        // guard against absurd payloads
        const capped = text.length > 1_500_000 ? text.slice(0, 1_500_000) : text;
        return { ok: res.ok, status: res.status, html: capped, finalUrl: res.url || url.toString() };
    } catch (e) {
        return { ok: false, status: 0, html: '', finalUrl: url.toString() };
    } finally {
        clearTimeout(timer);
    }
}

function detectCms(html: string): string {
    const h = html.toLowerCase();
    if (h.includes('wp-content') || h.includes('wp-includes')) return 'wordpress';
    if (h.includes('cdn.shopify.com') || h.includes('shopify')) return 'shopify';
    if (h.includes('wixstatic.com') || h.includes('wix.com')) return 'wix';
    if (h.includes('squarespace.com') || h.includes('static.squarespace.com')) return 'squarespace';
    if (h.includes('webflow') || h.includes('webflow.com')) return 'webflow';
    return 'unknown';
}

function countMatches(re: RegExp, s: string): number {
    let n = 0;
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    while (r.exec(s)) n++;
    return n;
}

function firstHrefMatching(html: string, predicate: (href: string) => boolean): string | null {
    const re = /href\s*=\s*["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
        const href = (m[1] || '').trim();
        if (!href) continue;
        if (predicate(href)) return href;
    }
    return null;
}

function resolveSameHost(base: URL, href: string): URL | null {
    try {
        const u = new URL(href, base);
        // stay on same host for analysis
        if (u.host !== base.host) return null;
        return u;
    } catch {
        return null;
    }
}

function analyzeHtml(html: string): {
    hasViewport: boolean;
    hasTelLink: boolean;
    hasPhoneText: boolean;
    hasMailto: boolean;
    hasEmailText: boolean;
    hasBooking: boolean;
    hasChat: boolean;
    hasFileUpload: boolean;
    formInputs: number;
    formRequired: number;
    ctaQuote: boolean;
} {
    const hasViewport = /<meta[^>]+name\s*=\s*["']viewport["'][^>]*>/i.test(html);
    const hasTelLink = /href\s*=\s*["']tel:/i.test(html);
    const hasPhoneText = /\b(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(html);
    const hasMailto = /href\s*=\s*["']mailto:/i.test(html);
    const hasEmailText = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(html);

    const lower = html.toLowerCase();
    const hasBooking =
        lower.includes('calendly.com') ||
        lower.includes('acuityscheduling') ||
        lower.includes('square.site/appointments') ||
        lower.includes('squareup.com/appointments') ||
        lower.includes('setmore.com') ||
        lower.includes('simplybook') ||
        lower.includes('youcanbook.me');

    const hasChat =
        lower.includes('tawk.to') ||
        lower.includes('intercom') ||
        lower.includes('drift.com') ||
        lower.includes('crisp.chat') ||
        lower.includes('livechatinc') ||
        lower.includes('zendesk') ||
        lower.includes('hubspot') ||
        lower.includes('facebook.com/tr/') && lower.includes('customerchat');

    const hasFileUpload = /<input\b[^>]*type\s*=\s*["']file["'][^>]*>/i.test(html);
    const formInputs = countMatches(/<(input|textarea|select)\b/gi, html);
    const formRequired = countMatches(/<(input|textarea|select)\b[^>]*\srequired\b/gi, html);
    const ctaQuote =
        lower.includes('get a quote') ||
        lower.includes('request a quote') ||
        lower.includes('free estimate') ||
        lower.includes('request estimate');

    return {
        hasViewport,
        hasTelLink,
        hasPhoneText,
        hasMailto,
        hasEmailText,
        hasBooking,
        hasChat,
        hasFileUpload,
        formInputs,
        formRequired,
        ctaQuote
    };
}

function extractInternalCandidates(base: URL, html: string): URL[] {
    const hrefs: string[] = [];
    const re = /href\s*=\s*["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
        const raw = (m[1] || '').trim();
        if (!raw) continue;
        const lower = raw.toLowerCase();
        if (lower.startsWith('#')) continue;
        if (lower.startsWith('javascript:')) continue;
        if (lower.startsWith('mailto:')) continue;
        if (lower.startsWith('tel:')) continue;
        if (lower.startsWith('sms:')) continue;
        if (lower.startsWith('whatsapp:')) continue;
        hrefs.push(raw);
    }

    // Score likely useful pages first
    const scored = hrefs
        .map(h => {
            const lower = h.toLowerCase();
            let score = 0;
            if (/(contact|estimate|quote|request|book|schedule)/i.test(lower)) score += 100;
            if (/(services|service|pricing|rates|about|team|reviews)/i.test(lower)) score += 40;
            if (/(privacy|terms|login|signup|account|cart)/i.test(lower)) score -= 100;
            if (lower.includes('.pdf')) score -= 50;
            return { h, score };
        })
        .sort((a, b) => b.score - a.score);

    const urls: URL[] = [];
    const seen = new Set<string>();
    for (const s of scored) {
        const u = resolveSameHost(base, s.h);
        if (!u) continue;
        const key = u.toString();
        if (seen.has(key)) continue;
        seen.add(key);
        urls.push(u);
        if (urls.length >= 7) break; // keep it fast: homepage + up to 6 internal
    }
    return urls;
}

export async function runFrictionAudit(params: Params): Promise<{
    title: string;
    steps: AutomationStep[];
    artifacts: { artifact: AutomationArtifact; content: string }[];
    stats: Record<string, number>;
}> {
    const { inputs } = params;
    const targetInput = asString(inputs?.url ?? inputs?.domain, 'https://example.com');
    const baseUrl = normalizeUrl(targetInput);

    const steps: AutomationStep[] = [];
    const artifacts: { artifact: AutomationArtifact; content: string }[] = [];

    // Step 1: Crawl + extract UX signals (real fetch)
    const start1 = isoNow();
    const homeFetch = await fetchText(baseUrl, 6500);
    const homeHtml = homeFetch.html;
    const homeAnalysis = analyzeHtml(homeHtml);
    const cms = detectCms(homeHtml);

    const baseFinal = new URL(homeFetch.finalUrl);
    const internalCandidates = extractInternalCandidates(baseFinal, homeHtml);
    const candidatePages = [baseFinal, ...internalCandidates].slice(0, 7);

    const pageFetches = await Promise.all(
        candidatePages.map(async (u, idx) => {
            const fetched = idx === 0 ? homeFetch : await fetchText(u, 6500);
            const html = idx === 0 ? homeHtml : fetched.html;
            const analysis = analyzeHtml(html);
            return {
                name: idx === 0 ? 'homepage' : `page_${idx}`,
                url: fetched.finalUrl,
                ok: fetched.ok,
                status: fetched.status,
                htmlKb: Math.round(html.length / 1024),
                analysis
            };
        })
    );

    // "Contact page found" heuristic: any fetched page has contact/quote/estimate in path and is ok
    const contactPageFound = pageFetches.some(p => p.ok && /(contact|estimate|quote|request)/i.test(new URL(p.url).pathname));
    const pages = pageFetches.map(p => ({ name: p.name, url: p.url, ok: p.ok, status: p.status, htmlKb: p.htmlKb }));

    const merged = {
        hasBooking: pageFetches.some(p => p.analysis.hasBooking),
        hasChat: pageFetches.some(p => p.analysis.hasChat),
        hasFileUpload: pageFetches.some(p => p.analysis.hasFileUpload),
        hasViewport: pageFetches.some(p => p.analysis.hasViewport),
        hasTelLink: pageFetches.some(p => p.analysis.hasTelLink),
        hasPhoneText: pageFetches.some(p => p.analysis.hasPhoneText),
        hasEmail: pageFetches.some(p => p.analysis.hasMailto || p.analysis.hasEmailText),
        formInputs: Math.max(...pageFetches.map(p => p.analysis.formInputs)),
        formRequired: Math.max(...pageFetches.map(p => p.analysis.formRequired)),
        ctaQuote: pageFetches.some(p => p.analysis.ctaQuote)
    };

    const crawl = {
        input: targetInput,
        finalHost: new URL(homeFetch.finalUrl).host,
        pagesScanned: pages.length,
        pages,
        cms,
        contactPageFound,
        ...merged
    };
    steps.push({
        id: shortId('step'),
        name: 'Crawl site + extract UX signals',
        startedAt: start1,
        finishedAt: isoNow(),
        status: 'success',
        summary: `Fetched ${pages.length} page(s) and extracted quote-friction signals`,
        data: crawl
    });

    // Step 2: Score + recommendations
    const start2 = isoNow();
    let score = 0;
    const notes: string[] = [];

    const noBooking = !merged.hasBooking;
    const longForm = merged.formInputs > 6 || merged.formRequired > 3;
    const noChat = !merged.hasChat;
    const noPhoneLink = !merged.hasTelLink;
    const noEmail = !merged.hasEmail;
    const noFileUpload = !merged.hasFileUpload;
    const poorMobile = !merged.hasViewport || pages.some(p => p.htmlKb > 1200);

    if (noBooking) { score += 25; notes.push('No online booking detected'); }
    if (longForm) { score += 20; notes.push(`Long contact form (${merged.formInputs} fields, ${merged.formRequired} required)`); }
    if (noChat) { score += 10; notes.push('No chat widget detected'); }
    if (noPhoneLink) {
        score += 10;
        notes.push(merged.hasPhoneText ? 'Phone number present but not clickable (no tel: link)' : 'No tel: phone link detected');
    }
    if (noEmail) { score += 10; notes.push('No email detected'); }
    if (noFileUpload) { score += 10; notes.push('No file upload on forms'); }
    if (poorMobile) { score += 5; notes.push('Potential mobile UX issue (missing viewport or large HTML)'); }

    if (merged.hasBooking) { score -= 20; notes.push('Online booking detected (reduces friction)'); }
    if (merged.hasChat) { score -= 10; notes.push('Chat widget detected (reduces friction)'); }

    const frictionScore = Math.max(0, Math.min(100, score));

    const pros: string[] = [];
    const cons: string[] = [];
    if (merged.hasViewport) pros.push('Mobile viewport meta detected');
    else cons.push('Missing mobile viewport meta tag');
    if (merged.hasTelLink) pros.push('Clickable phone link (tel:) detected');
    else cons.push(merged.hasPhoneText ? 'Phone number detected, but not clickable (missing tel:)' : 'No clickable phone link (tel:)');
    if (merged.hasEmail) pros.push('Email found on site');
    else cons.push('No email found');
    if (merged.ctaQuote) pros.push('Quote/estimate CTA text detected');
    else cons.push('No clear quote/estimate CTA detected');
    if (merged.hasBooking) pros.push('Online booking/scheduling detected');
    else cons.push('No online booking/scheduling detected');
    if (merged.hasChat) pros.push('Chat widget detected');
    else cons.push('No chat widget detected');
    if (merged.hasFileUpload) pros.push('File upload detected on a form');
    else cons.push('No file upload detected (missed chance to capture photos)');
    if (longForm) cons.push(`Form looks long (${merged.formInputs} fields; ${merged.formRequired} required)`);

    const recs: string[] = [];
    if (!merged.ctaQuote) recs.push('Add a clear above-the-fold CTA: “Get Quote” / “Request Estimate” (mobile-first)');
    if (longForm) recs.push(`Reduce form fields to ~4 (name, phone, service, short notes) — current max is ${merged.formInputs}`);
    if (!merged.hasFileUpload) recs.push('Add photo upload to speed up quoting + qualify leads');
    if (!merged.hasViewport) recs.push('Add `<meta name="viewport" content="width=device-width, initial-scale=1" />`');
    if (!merged.hasBooking) recs.push('Add a scheduling link (optional) OR a “call back in 5 minutes” promise');

    const band = frictionScore >= 80 ? 'A' : frictionScore >= 60 ? 'B' : frictionScore >= 40 ? 'C' : 'D';

    const audit = {
        input: targetInput,
        analyzedHost: crawl.finalHost,
        frictionScore,
        band,
        cms,
        pagesScanned: pages.length,
        pros,
        cons,
        signals: {
            hasBooking: merged.hasBooking,
            hasChat: merged.hasChat,
            hasFileUpload: merged.hasFileUpload,
            hasViewport: merged.hasViewport,
            hasTelLink: merged.hasTelLink,
            hasEmail: merged.hasEmail,
            formInputs: merged.formInputs,
            formRequired: merged.formRequired
        },
        notes,
        quickWins: recs,
        disclaimer:
            'This is a lightweight read-only scan (no form submissions). Some widgets render client-side and may not be visible without a headless browser.'
    };
    steps.push({
        id: shortId('step'),
        name: 'Generate friction score + playbook',
        startedAt: start2,
        finishedAt: isoNow(),
        status: 'success',
        summary: `Computed friction score ${frictionScore}/100 and generated a quick-win playbook`,
        data: { frictionScore, recommendations: recs.length }
    });

    artifacts.push({
        artifact: {
            name: 'audit.json',
            type: 'json',
            relPath: 'artifacts/audit.json',
            summary: 'Friction audit output (demo)'
        },
        content: safeJson(audit)
    });

    // Step 3: Produce a "client-ready" HTML report
    const start3 = isoNow();
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>InstantQuote Friction Audit — ${crawl.finalHost}</title>
    <style>
      body { font-family: system-ui, Segoe UI, Arial, sans-serif; margin: 24px; color: #111827; }
      .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 12px 0; }
      .score { font-size: 42px; font-weight: 800; }
      .muted { color: #6b7280; }
      ul { margin: 8px 0 0 20px; }
      .pill { display:inline-block; padding: 4px 10px; border-radius: 999px; background:#dcfce7; color:#065f46; font-weight:700; font-size:12px; }
      .pillB { background:#fef3c7; color:#92400e; }
      .pillC { background:#fed7aa; color:#9a3412; }
      .pillD { background:#fecaca; color:#991b1b; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
      code { background:#f3f4f6; padding:2px 6px; border-radius:8px; }
    </style>
  </head>
  <body>
    <h1>InstantQuote Friction Audit</h1>
    <div class="muted">Target: <b>${targetInput}</b> • Scanned host: <b>${crawl.finalHost}</b> • Generated: ${new Date().toLocaleString()}</div>

    <div class="card">
      <div class="pill ${band === 'B' ? 'pillB' : band === 'C' ? 'pillC' : band === 'D' ? 'pillD' : ''}">${band}-tier friction</div>
      <div class="score">${frictionScore}/100</div>
      <div class="muted">Higher friction usually means more lost leads (and a bigger upside from simplifying the quote flow).</div>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <div class="grid">
        <div>
          <div class="muted" style="font-weight:700">Pros</div>
          <ul>${pros.map(p => `<li>${p}</li>`).join('') || '<li class="muted">None detected</li>'}</ul>
        </div>
        <div>
          <div class="muted" style="font-weight:700">Cons / Friction</div>
          <ul>${cons.map(c => `<li>${c}</li>`).join('') || '<li class="muted">None detected</li>'}</ul>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Top quick wins (48 hours)</h2>
      <ul>${recs.map(r => `<li>${r}</li>`).join('') || '<li class="muted">No major issues detected</li>'}</ul>
    </div>

    <div class="card">
      <h2>What we detected</h2>
      <ul>
        <li>Form inputs (max across pages): <b>${merged.formInputs}</b> (required: <b>${merged.formRequired}</b>)</li>
        <li>Booking: <b>${merged.hasBooking ? 'Yes' : 'No'}</b></li>
        <li>Chat: <b>${merged.hasChat ? 'Yes' : 'No'}</b></li>
        <li>File upload: <b>${merged.hasFileUpload ? 'Yes' : 'No'}</b></li>
        <li>Mobile viewport meta: <b>${merged.hasViewport ? 'Yes' : 'No'}</b></li>
        <li>CMS guess: <b>${cms}</b></li>
      </ul>
      <div class="muted" style="margin-top:10px">
        Pages scanned:
        <ul>
          ${pages.map(p => `<li><code>${p.status || ''}</code> ${p.ok ? '✅' : '⚠️'} <a href="${p.url}" target="_blank" rel="noreferrer">${p.name}</a> (${p.htmlKb}KB)</li>`).join('')}
        </ul>
      </div>
      <div class="muted" style="margin-top:10px">
        Note: This is a lightweight HTML scan. Some chat/booking widgets render client-side and may not appear without a headless browser.
      </div>
    </div>
  </body>
</html>`;

    steps.push({
        id: shortId('step'),
        name: 'Render client-ready audit report',
        startedAt: start3,
        finishedAt: isoNow(),
        status: 'success',
        summary: 'Generated an HTML audit report',
        data: { pages: crawl.pagesScanned }
    });

    artifacts.push({
        artifact: {
            name: 'audit_report.html',
            type: 'html',
            relPath: 'artifacts/audit_report.html',
            summary: 'Client-ready HTML report (demo)'
        },
        content: html
    });

    return {
        title: 'Website Friction Audit → Client Report',
        steps,
        artifacts,
        stats: {
            friction_score: frictionScore,
            recommendations: recs.length
        }
    };
}


