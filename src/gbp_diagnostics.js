/**
 * GBP / Review Link Troubleshooter + Entity Conflict Scanner
 *
 * Constraints:
 * - Uses only official Google Places API Web Service endpoints (when API key provided)
 * - If API key missing, runs in "manual mode" and instructs user what to paste
 *
 * Usage:
 *   node src/gbp_diagnostics.js --config gbp.config.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PlacesClient } from "./lib/places_client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--config" || a === "-c") {
      out.config = argv[i + 1];
      i++;
      continue;
    }
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
  }
  return out;
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileAtomic(filePath, contents) {
  ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, filePath);
}

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s) {
  const n = normalizeText(s);
  if (!n) return [];
  return n.split(" ").filter(Boolean);
}

function jaccard(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function normalizePhone(p) {
  const digits = String(p || "").replace(/\D/g, "");
  // Keep last 10 for US comparisons
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function safeUrl(u) {
  try {
    return new URL(u);
  } catch {
    return null;
  }
}

function hostnameOf(u) {
  const url = safeUrl(u);
  if (!url) return null;
  return url.hostname.toLowerCase();
}

function approxRegistrableDomain(hostname) {
  if (!hostname) return null;
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  // naive last-2 labels; good enough for typical .com/.net domains
  return parts.slice(-2).join(".");
}

function locationMatchScore(address, locationHint) {
  const a = normalizeText(address);
  const hintTokens = tokenize(locationHint).filter((t) => t.length >= 2);
  if (!a || hintTokens.length === 0) return 0;
  let hits = 0;
  for (const t of hintTokens) {
    if (a.includes(t)) hits++;
  }
  // cap at 1.0
  return Math.min(1, hits / Math.max(4, hintTokens.length));
}

function mapsPlaceUrl({ placeId, query }) {
  const q = query ? encodeURIComponent(query) : "";
  const pid = encodeURIComponent(placeId || "");
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${pid}`;
}

function writeReviewUrl(placeId) {
  const pid = encodeURIComponent(placeId || "");
  return `https://search.google.com/local/writereview?placeid=${pid}`;
}

function pickTop(arr, n) {
  return Array.isArray(arr) ? arr.slice(0, n) : [];
}

function computeCandidateScore({
  candidate,
  businessName,
  locationHint,
  phone,
  website,
}) {
  const nameSim = jaccard(tokenize(candidate.name), tokenize(businessName));
  const locScore = locationMatchScore(candidate.formatted_address, locationHint);

  const candPhone = normalizePhone(candidate.formatted_phone_number || candidate.international_phone_number);
  const inputPhone = normalizePhone(phone);
  const phoneMatch = inputPhone && candPhone && inputPhone === candPhone;

  const candHost = approxRegistrableDomain(hostnameOf(candidate.website));
  const inputHost = approxRegistrableDomain(hostnameOf(website));
  const websiteMatch = inputHost && candHost && inputHost === candHost;

  let score = 0;
  score += nameSim * 35;
  score += locScore * 20;
  if (phoneMatch) score += 35;
  if (websiteMatch) score += 25;

  // small boost for having reviews (trust proxy)
  if (typeof candidate.user_ratings_total === "number" && candidate.user_ratings_total > 0) {
    score += 2;
  }

  return {
    score,
    signals: {
      name_similarity: Number(nameSim.toFixed(3)),
      location_match: Number(locScore.toFixed(3)),
      phone_match: Boolean(phoneMatch),
      website_match: Boolean(websiteMatch),
      cand_phone_last10: candPhone || null,
      input_phone_last10: inputPhone || null,
      cand_domain: candHost || null,
      input_domain: inputHost || null,
    },
  };
}

function analyzeCategoryMismatch({ place, expectedCategories = [], suspectedWrongCategory }) {
  const types = Array.isArray(place.types) ? place.types : [];
  const typeTokens = types.flatMap((t) => t.split("_")).map((t) => t.toLowerCase());

  const expectedTokens = expectedCategories.flatMap((c) => tokenize(c));
  const expectedSim = jaccard(new Set(typeTokens), new Set(expectedTokens));

  const wrongTokens = tokenize(suspectedWrongCategory);
  const wrongSim = wrongTokens.length ? jaccard(new Set(typeTokens), new Set(wrongTokens)) : 0;

  const irrelevantTypeKeywords = new Set([
    "pressure",
    "washing",
    "car",
    "wash",
    "laundry",
    "plumber",
    "electrician",
    "hair",
    "salon",
    "nail",
    "spa",
    "gym",
    "church",
  ]);

  const hasIrrelevant = typeTokens.some((t) => irrelevantTypeKeywords.has(t));
  const mismatch = hasIrrelevant || expectedSim < 0.12;

  return {
    mismatch,
    has_irrelevant_type_tokens: hasIrrelevant,
    types,
    expected_categories: expectedCategories,
    similarity_types_vs_expected: Number(expectedSim.toFixed(3)),
    similarity_types_vs_suspected_wrong: Number(wrongSim.toFixed(3)),
    notes:
      "Places API returns place 'types' which may not perfectly mirror GBP primary category. Treat this as a proxy signal.",
  };
}

function analyzeCollisionRisk({ candidates = [], selected, businessName, website }) {
  const selectedState = normalizeText(selected?.formatted_address || "").split(" ").pop() || "";
  const selectedDomain = approxRegistrableDomain(hostnameOf(selected?.website));
  const inputDomain = approxRegistrableDomain(hostnameOf(website));

  const collisions = [];

  for (const c of candidates) {
    if (!c || !c.place_id) continue;
    if (selected?.place_id && c.place_id === selected.place_id) continue;

    const nameSim = jaccard(tokenize(c.name), tokenize(businessName));
    if (nameSim < 0.55) continue;

    const cState = normalizeText(c.formatted_address || "").split(" ").pop() || "";
    const cDomain = approxRegistrableDomain(hostnameOf(c.website));

    const differentState = selectedState && cState && selectedState !== cState;
    const differentDomain =
      (selectedDomain && cDomain && selectedDomain !== cDomain) ||
      (inputDomain && cDomain && inputDomain !== cDomain);

    if (differentState || differentDomain) {
      collisions.push({
        place_id: c.place_id,
        name: c.name || null,
        formatted_address: c.formatted_address || null,
        website: c.website || null,
        rating: c.rating ?? null,
        user_ratings_total: c.user_ratings_total ?? null,
        name_similarity: Number(nameSim.toFixed(3)),
      });
    }
  }

  const risk = collisions.length > 0;
  const recommendations = risk
    ? [
        `${businessName} – Maryland`,
        `${businessName} of Baltimore County`,
        `${businessName} (Baltimore County, MD)`,
      ]
    : [];

  return {
    collision_risk: risk,
    collision_candidates: collisions,
    disambiguation_name_suggestions: recommendations,
  };
}

function throttleHeuristics({ selected, categoryMismatch, collisionRisk }) {
  const hasZeroReviews =
    typeof selected?.user_ratings_total === "number" ? selected.user_ratings_total === 0 : null;

  const flags = {
    zero_reviews: hasZeroReviews,
    collision_risk: Boolean(collisionRisk?.collision_risk),
    category_mismatch: Boolean(categoryMismatch?.mismatch),
    service_area_only_unknown: true,
  };

  const trueCount = Object.entries(flags)
    .filter(([k, v]) => k !== "service_area_only_unknown")
    .reduce((acc, [, v]) => acc + (v === true ? 1 : 0), 0);

  let severity = "LOW";
  if (trueCount >= 2) severity = "HIGH";
  else if (trueCount === 1) severity = "MEDIUM";

  return { flags, severity };
}

function parseManualInputs(config) {
  const ask = config.ask_for_reviews_url || null;
  const maps = config.maps_url || null;
  const cid = config.cid || null;

  let placeId = null;
  const fromAsk = typeof ask === "string" ? ask.match(/[?&]placeid=([^&]+)/i) : null;
  if (fromAsk?.[1]) placeId = decodeURIComponent(fromAsk[1]);

  // Google Maps URLs sometimes contain !1sPLACE_ID fragments; try a loose capture
  if (!placeId && typeof maps === "string") {
    const m = maps.match(/!1s(Ch[0-9A-Za-z_-]{10,})/); // some place_ids start with "ChI..."
    if (m?.[1]) placeId = m[1];
  }

  return { ask_for_reviews_url: ask, maps_url: maps, cid, extracted_place_id: placeId };
}

function mdEscape(s) {
  return String(s ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function renderMarkdown(report) {
  const sel = report.selected_place || {};

  const lines = [];
  lines.push(`# GBP Diagnostics Report`);
  lines.push(``);
  lines.push(`## Executive summary`);
  lines.push(``);
  lines.push(`- **Selected place**: ${sel.name ? `**${mdEscape(sel.name)}**` : "**(none)**"}`);
  lines.push(`- **Throttle likelihood**: **${report.throttle?.severity || "UNKNOWN"}**`);
  lines.push(
    `- **Category mismatch**: **${report.category_mismatch?.mismatch ? "YES" : "NO/UNKNOWN"}**`
  );
  lines.push(
    `- **Name collision risk**: **${report.collision?.collision_risk ? "YES" : "NO"}**`
  );
  lines.push(``);

  lines.push(`## Evidence table`);
  lines.push(``);
  lines.push(`| Field | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| place_id | ${mdEscape(sel.place_id || "")} |`);
  lines.push(`| name | ${mdEscape(sel.name || "")} |`);
  lines.push(`| address | ${mdEscape(sel.formatted_address || "")} |`);
  lines.push(`| types | ${mdEscape((sel.types || []).join(", "))} |`);
  lines.push(`| business_status | ${mdEscape(sel.business_status || "")} |`);
  lines.push(`| rating | ${sel.rating ?? ""} |`);
  lines.push(`| user_ratings_total | ${sel.user_ratings_total ?? ""} |`);
  lines.push(`| phone | ${mdEscape(sel.formatted_phone_number || sel.international_phone_number || "")} |`);
  lines.push(`| website | ${mdEscape(sel.website || "")} |`);
  lines.push(`| maps_url (place_id) | ${mdEscape(sel.maps_url || "")} |`);
  lines.push(`| write_review_url | ${mdEscape(sel.write_review_url || "")} |`);
  lines.push(``);

  lines.push(`## Collision candidates (name collision risk signals)`);
  lines.push(``);
  if (!report.collision?.collision_candidates?.length) {
    lines.push(`No collision candidates detected in the current Places API results.`);
  } else {
    lines.push(`| Name | Address | Website | place_id | Similarity |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    for (const c of report.collision.collision_candidates) {
      lines.push(
        `| ${mdEscape(c.name)} | ${mdEscape(c.formatted_address)} | ${mdEscape(
          c.website || ""
        )} | ${mdEscape(c.place_id)} | ${c.name_similarity} |`
      );
    }
  }
  lines.push(``);

  lines.push(`## Category mismatch analysis`);
  lines.push(``);
  if (!report.category_mismatch) {
    lines.push(`Category mismatch analysis unavailable.`);
  } else {
    lines.push(`- **Mismatch**: **${report.category_mismatch.mismatch ? "YES" : "NO"}**`);
    lines.push(
      `- **Similarity(types vs expected)**: ${report.category_mismatch.similarity_types_vs_expected}`
    );
    if (report.category_mismatch.has_irrelevant_type_tokens) {
      lines.push(`- **Irrelevant type tokens detected**: YES`);
    }
    lines.push(`- Note: ${report.category_mismatch.notes}`);
  }
  lines.push(``);

  lines.push(`## Next actions checklist (minimal edits, ordered)`);
  lines.push(``);
  const next = report.next_actions || [];
  if (next.length === 0) {
    lines.push(`- (none)`);
  } else {
    for (const n of next) lines.push(`- [ ] ${n}`);
  }
  lines.push(``);

  lines.push(`## Acceptance checks`);
  lines.push(``);
  const acc = report.acceptance_checks || [];
  for (const a of acc) lines.push(`- [ ] ${a}`);
  lines.push(``);

  if (report.manual_mode?.enabled) {
    lines.push(`## Manual step needed`);
    lines.push(``);
    lines.push(
      `This run used **manual mode** (no API key). To get API-based diagnostics, add \`google_places_api_key\` to config or set \`GOOGLE_PLACES_API_KEY\` in \`.env\`.`
    );
    lines.push(``);
    lines.push(`What to paste into config for better analysis:`);
    lines.push(`- **ask_for_reviews_url** (Ask for reviews link)`);
    lines.push(`- **maps_url** (full URL after clicking the Maps listing)`);
    lines.push(`- **cid** (if you can find a cid=... in a Maps URL)`);
    lines.push(``);
    const mi = report.manual_mode.inputs || {};
    lines.push(`Parsed manual inputs:`);
    lines.push(`- extracted_place_id: ${mdEscape(mi.extracted_place_id || "")}`);
  }

  lines.push(``);
  return lines.join("\n");
}

async function apiModeRun(config) {
  const apiKey = config.google_places_api_key || process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const places = new PlacesClient({ apiKey, timeoutMs: config.timeout_ms || 15000 });

  const queryWithHint = `${config.business_name} ${config.location_hint || ""}`.trim();

  const evidence = {
    find_place: null,
    text_search_with_hint: null,
    text_search_name_only: null,
    details_by_place_id: {},
  };

  const findRes = await places.findPlaceFromText({ input: queryWithHint });
  evidence.find_place = findRes;

  const ts1 = await places.textSearch({ query: queryWithHint });
  evidence.text_search_with_hint = ts1;

  const ts2 = await places.textSearch({ query: config.business_name });
  evidence.text_search_name_only = ts2;

  const candidatesRaw = [];
  for (const src of [findRes?.json?.candidates, ts1?.json?.results, ts2?.json?.results]) {
    for (const c of pickTop(src, 5)) {
      if (!c?.place_id) continue;
      candidatesRaw.push({
        place_id: c.place_id,
        name: c.name,
        formatted_address: c.formatted_address,
        types: c.types,
        business_status: c.business_status,
        rating: c.rating,
        user_ratings_total: c.user_ratings_total,
      });
    }
  }

  // de-dupe by place_id
  const byId = new Map();
  for (const c of candidatesRaw) if (c.place_id && !byId.has(c.place_id)) byId.set(c.place_id, c);
  const candidates = Array.from(byId.values()).slice(0, 5);

  // enrich candidates with details (website/phone) for scoring
  for (const c of candidates) {
    const det = await places.placeDetails({ place_id: c.place_id });
    evidence.details_by_place_id[c.place_id] = det;
    const r = det?.json?.result || {};
    c.website = r.website || null;
    c.formatted_phone_number = r.formatted_phone_number || null;
    c.international_phone_number = r.international_phone_number || null;
    c.url = r.url || null;
    // Prefer details types when available
    if (Array.isArray(r.types)) c.types = r.types;
    if (r.formatted_address) c.formatted_address = r.formatted_address;
    if (r.business_status) c.business_status = r.business_status;
    if (typeof r.rating === "number") c.rating = r.rating;
    if (typeof r.user_ratings_total === "number") c.user_ratings_total = r.user_ratings_total;
    if (r.name) c.name = r.name;
  }

  const scored = candidates.map((c) => {
    const s = computeCandidateScore({
      candidate: c,
      businessName: config.business_name,
      locationHint: config.location_hint || "",
      phone: config.phone,
      website: config.website,
    });
    return { ...c, __score: s.score, __signals: s.signals };
  });
  scored.sort((a, b) => (b.__score || 0) - (a.__score || 0));

  const selected = scored[0] || null;
  const categoryMismatch = selected
    ? analyzeCategoryMismatch({
        place: selected,
        expectedCategories: config.expected_categories || [],
        suspectedWrongCategory: config.suspected_wrong_category,
      })
    : null;

  const collision = selected
    ? analyzeCollisionRisk({
        candidates: scored,
        selected,
        businessName: config.business_name,
        website: config.website,
      })
    : { collision_risk: false, collision_candidates: [], disambiguation_name_suggestions: [] };

  const throttle = throttleHeuristics({ selected, categoryMismatch, collisionRisk: collision });

  const nextActions = [];
  if (categoryMismatch?.mismatch) {
    nextActions.push("Fix GBP primary category to the expected service category (minimal change).");
  }
  if (collision?.collision_risk) {
    nextActions.push(
      "Consider adding a non-spam location qualifier to the business name (only if needed) to reduce entity confusion."
    );
  }
  nextActions.push("Freeze profile edits for 7 days after changes to let Maps re-stabilize.");
  if ((selected?.user_ratings_total ?? 0) === 0) {
    nextActions.push("Get 1 real customer review (first review often increases trust/visibility).");
  }

  const acceptanceChecks = [
    "Places API returns a single best match with matching phone/website.",
    "Collision risk reduced (fewer close-name candidates).",
    "Review count transitions from 0 to 1 (later).",
    "Maps and write-review URLs consistently resolve for the selected place.",
  ];

  const report = {
    meta: {
      generated_at: new Date().toISOString(),
      mode: "api",
    },
    input: {
      business_name: config.business_name,
      location_hint: config.location_hint || null,
      phone: config.phone || null,
      website: config.website || null,
      suspected_wrong_category: config.suspected_wrong_category || null,
      expected_categories: config.expected_categories || [],
    },
    candidates: scored.map((c) => ({
      place_id: c.place_id,
      name: c.name || null,
      formatted_address: c.formatted_address || null,
      types: c.types || [],
      business_status: c.business_status || null,
      rating: c.rating ?? null,
      user_ratings_total: c.user_ratings_total ?? null,
      website: c.website || null,
      formatted_phone_number: c.formatted_phone_number || null,
      international_phone_number: c.international_phone_number || null,
      maps_url: mapsPlaceUrl({ placeId: c.place_id, query: `${c.name || ""} ${c.formatted_address || ""}`.trim() }),
      write_review_url: writeReviewUrl(c.place_id),
      score: Number((c.__score || 0).toFixed(2)),
      score_signals: c.__signals || {},
    })),
    selected_place: selected
      ? {
          place_id: selected.place_id,
          name: selected.name || null,
          formatted_address: selected.formatted_address || null,
          types: selected.types || [],
          business_status: selected.business_status || null,
          rating: selected.rating ?? null,
          user_ratings_total: selected.user_ratings_total ?? null,
          website: selected.website || null,
          formatted_phone_number: selected.formatted_phone_number || null,
          international_phone_number: selected.international_phone_number || null,
          google_maps_url_from_api: selected.url || null,
          maps_url: mapsPlaceUrl({
            placeId: selected.place_id,
            query: `${selected.name || ""} ${selected.formatted_address || ""}`.trim(),
          }),
          write_review_url: writeReviewUrl(selected.place_id),
        }
      : null,
    category_mismatch: categoryMismatch,
    collision,
    throttle,
    next_actions: nextActions,
    acceptance_checks: acceptanceChecks,
    raw_api_evidence: {
      find_place: evidence.find_place?.json || null,
      text_search_with_hint: evidence.text_search_with_hint?.json || null,
      text_search_name_only: evidence.text_search_name_only?.json || null,
      // omit details to keep report smaller; the critical fields are already surfaced
    },
  };

  return report;
}

async function manualModeRun(config) {
  const manual = parseManualInputs(config);
  const placeId = manual.extracted_place_id;

  const report = {
    meta: {
      generated_at: new Date().toISOString(),
      mode: "manual",
    },
    input: {
      business_name: config.business_name,
      location_hint: config.location_hint || null,
      phone: config.phone || null,
      website: config.website || null,
      suspected_wrong_category: config.suspected_wrong_category || null,
      expected_categories: config.expected_categories || [],
    },
    manual_mode: {
      enabled: true,
      inputs: manual,
    },
    candidates: placeId
      ? [
          {
            place_id: placeId,
            maps_url: mapsPlaceUrl({ placeId, query: `${config.business_name} ${config.location_hint || ""}`.trim() }),
            write_review_url: writeReviewUrl(placeId),
          },
        ]
      : [],
    selected_place: placeId
      ? {
          place_id: placeId,
          name: null,
          formatted_address: null,
          types: [],
          business_status: null,
          rating: null,
          user_ratings_total: null,
          website: null,
          formatted_phone_number: null,
          international_phone_number: null,
          maps_url: mapsPlaceUrl({ placeId, query: `${config.business_name} ${config.location_hint || ""}`.trim() }),
          write_review_url: writeReviewUrl(placeId),
        }
      : null,
    category_mismatch: null,
    collision: { collision_risk: null, collision_candidates: [], disambiguation_name_suggestions: [] },
    throttle: { flags: { zero_reviews: null, collision_risk: null, category_mismatch: null, service_area_only_unknown: true }, severity: "UNKNOWN" },
    next_actions: [
      "Provide a Google Places API key to run API mode diagnostics.",
      "Paste the GBP 'Ask for reviews' link into config as ask_for_reviews_url.",
      "Paste the Maps URL from clicking the listing into config as maps_url.",
    ],
    acceptance_checks: [
      "Places API returns a single best match with matching phone/website.",
      "Collision risk reduced (fewer close-name candidates).",
      "Review count transitions from 0 to 1 (later).",
      "Maps and write-review URLs consistently resolve.",
    ],
  };

  return report;
}

function loadDotEnvIfPresent(projectRoot) {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.config) {
    console.log(`Usage: node src/gbp_diagnostics.js --config <config.json>`);
    process.exit(args.help ? 0 : 1);
  }

  const projectRoot = path.resolve(__dirname, "..");
  loadDotEnvIfPresent(projectRoot);

  const configPath = path.resolve(process.cwd(), args.config);
  const config = readJson(configPath);

  if (!config.business_name) throw new Error("config.business_name is required");

  const hasApiKey = Boolean(config.google_places_api_key || process.env.GOOGLE_PLACES_API_KEY);

  let report;
  if (hasApiKey) {
    report = await apiModeRun(config);
  } else {
    report = await manualModeRun(config);
  }

  const outDir = path.resolve(projectRoot, "output");
  ensureDir(outDir);

  const jsonPath = path.join(outDir, "report.json");
  const mdPath = path.join(outDir, "report.md");

  writeFileAtomic(jsonPath, JSON.stringify(report, null, 2));
  writeFileAtomic(mdPath, renderMarkdown(report));

  console.log(`Wrote: ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`Wrote: ${path.relative(process.cwd(), mdPath)}`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});



