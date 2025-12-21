#!/usr/bin/env node

/**
 * Baltimore seed generator (OpenStreetMap Overpass API)
 * - No ts-node required
 * - Writes CSV in the same format as ingest-permits output
 */

const fs = require('fs/promises');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// Baltimore metro bounding box (rough)
// south, west, north, east
const BALTIMORE_BBOX = [39.08, -76.92, 39.44, -76.3];

const NICHE_QUERIES = {
  roofing: [
    `nwr["craft"="roofer"]({{bbox}});`,
    `nwr["shop"="roofer"]({{bbox}});`,
    `nwr["craft"="roofing"]({{bbox}});`,
  ],
  hvac: [
    `nwr["craft"="hvac"]({{bbox}});`,
    `nwr["shop"="hvac"]({{bbox}});`,
    `nwr["service"="hvac"]({{bbox}});`,
  ],
  landscaping: [
    `nwr["craft"="landscaper"]({{bbox}});`,
    `nwr["craft"="gardener"]({{bbox}});`,
    `nwr["service"="landscaping"]({{bbox}});`,
  ],
  tree: [
    `nwr["craft"="tree_surgeon"]({{bbox}});`,
    `nwr["craft"="tree_worker"]({{bbox}});`,
    `nwr["service"="tree"]({{bbox}});`,
  ],
  pest: [
    `nwr["craft"="pest_control"]({{bbox}});`,
    `nwr["shop"="pest_control"]({{bbox}});`,
    `nwr["service"="pest_control"]({{bbox}});`,
  ],
  remodeling: [
    `nwr["office"="construction_company"]({{bbox}});`,
    `nwr["craft"="builder"]({{bbox}});`,
    `nwr["craft"="carpenter"]({{bbox}});`,
    `nwr["service"="construction"]({{bbox}});`,
  ],
};

function parseArgs(argv) {
  // Supports both:
  // 1) flags: --niche roofing --limit 200 --out ./data/seeds/...
  // 2) positional: [niche] [limit] [out]
  const out = {
    niche: '',
    limit: 400,
    includeMissingWebsite: false,
    outFile: './data/seeds/baltimore_osm_seeds.csv',
  };

  const args = argv.slice(2);
  const flags = new Map();
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--include-missing-website') {
      flags.set('include-missing-website', '1');
      continue;
    }
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = args[i + 1];
      if (v && !v.startsWith('--')) {
        flags.set(k, v);
        i++;
      } else {
        flags.set(k, '1');
      }
    }
  }

  if (flags.has('niche')) out.niche = String(flags.get('niche') || '');
  if (flags.has('limit')) out.limit = Number(flags.get('limit') || out.limit) || out.limit;
  if (flags.has('out')) out.outFile = String(flags.get('out') || out.outFile);
  if (flags.has('include-missing-website')) out.includeMissingWebsite = true;

  // Positional fallback (only if flags absent)
  const positional = args.filter(a => !a.startsWith('--') && a !== '--include-missing-website');
  if (!out.niche && positional[0]) out.niche = positional[0];
  if ((!flags.has('limit')) && positional[1] && !Number.isNaN(Number(positional[1]))) out.limit = Number(positional[1]);
  if ((!flags.has('out')) && positional[2]) out.outFile = positional[2];

  return out;
}

function getTag(tags, keys) {
  if (!tags) return '';
  for (const k of keys) {
    const v = tags[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function normalizeWebsite(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function extractDomain(urlOrDomain) {
  const input = String(urlOrDomain || '').trim();
  if (!input) return '';
  try {
    const u = new URL(input.startsWith('http') ? input : `https://${input}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function buildOverpassQuery(niche, bbox) {
  const [south, west, north, east] = bbox;
  const bboxStr = `${south},${west},${north},${east}`;
  const parts = (NICHE_QUERIES[niche] || []).map(q => q.replace('{{bbox}}', bboxStr)).join('\n  ');
  return `[out:json][timeout:35];
(
  ${parts}
);
out tags center;`;
}

async function overpassFetch(query) {
  const endpoint = 'https://overpass-api.de/api/interpreter';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Overpass error ${res.status}: ${text.slice(0, 240)}`);
  }
  return await res.json();
}

function toSeeds(niche, resp, includeMissingWebsite) {
  const out = [];
  const seen = new Set(); // niche:domain or niche:name

  for (const el of resp.elements || []) {
    const tags = el.tags || {};
    const name = String(tags.name || '').trim();
    if (!name || name.length < 3) continue;

    const rawWebsite = getTag(tags, ['contact:website', 'website', 'url', 'contact:url']);
    const website = normalizeWebsite(rawWebsite);
    const domain = extractDomain(website || rawWebsite);

    if (!includeMissingWebsite && !domain) continue;

    const city = getTag(tags, ['addr:city', 'contact:city']) || 'Baltimore';
    const region = 'Baltimore Metro, MD';

    const phone = getTag(tags, ['contact:phone', 'phone', 'contact:mobile', 'mobile']);
    const email = getTag(tags, ['contact:email', 'email']);

    const dedupeKey = domain ? `${niche}:${domain.toLowerCase()}` : `${niche}:${name.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    out.push({
      business_name: name,
      domain: domain,
      possible_site_url: website || (domain ? `https://${domain}` : ''),
      niche,
      city,
      region,
      phone: phone || '',
      email: email || '',
      source: `osm_overpass_${niche}`,
    });
  }

  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  const requestedNiche = String(opts.niche || '').toLowerCase().trim();
  const limit = Number(opts.limit || 0) || 400;
  const includeMissingWebsite = Boolean(opts.includeMissingWebsite);
  const outFile = String(opts.outFile || './data/seeds/baltimore_osm_seeds.csv');

  const niches = requestedNiche
    ? [requestedNiche]
    : Object.keys(NICHE_QUERIES);

  console.log(`🗺️  Baltimore OSM seed generator`);
  console.log(`BBox: ${BALTIMORE_BBOX.join(', ')}`);
  console.log(`Niches: ${niches.join(', ')}`);
  console.log(`Include missing website: ${includeMissingWebsite ? 'yes' : 'no'}`);
  console.log(`Limit per niche: ${limit}`);
  console.log(`Output: ${outFile}`);

  const all = [];

  for (const niche of niches) {
    if (!NICHE_QUERIES[niche]) {
      console.log(`⚠️  Unknown niche: ${niche} (skipping)`);
      continue;
    }
    console.log(`🔎 Fetching: ${niche}...`);
    const q = buildOverpassQuery(niche, BALTIMORE_BBOX);
    const resp = await overpassFetch(q);
    const seeds = toSeeds(niche, resp, includeMissingWebsite).slice(0, limit);
    console.log(`✅ ${niche}: ${seeds.length}`);
    all.push(...seeds);
  }

  // Global dedupe by domain
  const deduped = [];
  const byDomain = new Set();
  for (const s of all) {
    const d = String(s.domain || '').trim().toLowerCase();
    if (d) {
      if (byDomain.has(d)) continue;
      byDomain.add(d);
    }
    deduped.push(s);
  }

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  const csvWriter = createObjectCsvWriter({
    path: outFile,
    header: [
      { id: 'business_name', title: 'business_name' },
      { id: 'domain', title: 'domain' },
      { id: 'possible_site_url', title: 'possible_site_url' },
      { id: 'niche', title: 'niche' },
      { id: 'city', title: 'city' },
      { id: 'region', title: 'region' },
      { id: 'phone', title: 'phone' },
      { id: 'email', title: 'email' },
      { id: 'source', title: 'source' },
    ],
  });

  await csvWriter.writeRecords(deduped);
  console.log(`🎉 Wrote ${deduped.length} seed(s) → ${outFile}`);
}

main().catch((err) => {
  console.error(`❌ Failed: ${String(err)}`);
  process.exit(1);
});


