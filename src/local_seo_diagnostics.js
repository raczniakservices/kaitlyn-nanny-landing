/**
 * Local SEO / GBP Diagnostics (Google Places API)
 *
 * Goal:
 * Given a business name and city/location string, analyze how Google identifies the business
 * and why it may not rank or appear correctly in GBP results.
 *
 * Constraints:
 * - Official Google Places API only (no scraping)
 * - No hardcoded secrets
 * - API key is read from process.env.GOOGLE_PLACES_API_KEY
 * - Uses native fetch (Node >= 18)
 *
 * Usage (PowerShell):
 *   $env:GOOGLE_PLACES_API_KEY="YOUR_KEY"
 *   node src/local_seo_diagnostics.js --businessName "Hood Masters LLC" --location "Baltimore County, MD"
 *
 * Or positional:
 *   node src/local_seo_diagnostics.js "Hood Masters LLC" "Baltimore County, MD"
 */

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

function parseArgs(argv) {
  const args = { businessName: null, location: null, help: false };

  // positional support: node script.js "Name" "Location"
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      args.help = true;
      continue;
    }
    if (a === "--businessName" || a === "--business" || a === "-b") {
      args.businessName = argv[i + 1];
      i++;
      continue;
    }
    if (a === "--location" || a === "--city" || a === "-l") {
      args.location = argv[i + 1];
      i++;
      continue;
    }
    positional.push(a);
  }

  if (!args.businessName && positional[0]) args.businessName = positional[0];
  if (!args.location && positional[1]) args.location = positional[1];

  return args;
}

function usageAndExit(code = 0) {
  console.log(`
Local SEO Diagnostics (Google Places API)

Required env:
  GOOGLE_PLACES_API_KEY

Usage:
  node src/local_seo_diagnostics.js --businessName "Business Name" --location "City, ST"
  node src/local_seo_diagnostics.js "Business Name" "City, ST"
`);
  process.exit(code);
}

function toQuery(params) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) usp.set(k, v.join(","));
    else usp.set(k, String(v));
  }
  return usp.toString();
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
  return n ? n.split(" ").filter(Boolean) : [];
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

function mapsUrlFromPlaceId(placeId, query) {
  const q = encodeURIComponent(query || "");
  const pid = encodeURIComponent(placeId || "");
  return `https://www.google.com/maps/search/?api=1&query=${q}&query_place_id=${pid}`;
}

async function googleGetJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 300)}`);
  }
  return { httpStatus: res.status, json };
}

/**
 * Step 1: Find Place From Text
 */
async function findPlaceFromText({ apiKey, businessName, location }) {
  const input = `${businessName} ${location}`.trim();
  const fields = ["place_id", "name", "formatted_address", "business_status", "types"];
  const qs = toQuery({
    input,
    inputtype: "textquery",
    fields,
    key: apiKey,
  });
  const url = `${PLACES_BASE_URL}/findplacefromtext/json?${qs}`;
  return { input, ...(await googleGetJson(url)) };
}

/**
 * Step 3: Place Details
 */
async function placeDetails({ apiKey, placeId }) {
  // "type" is not a documented Places Details field; "types" is.
  // We'll treat the first element of `types` as a proxy for a "primary type".
  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "address_components",
    "business_status",
    "types",
    "rating",
    "user_ratings_total",
    "geometry",
    "url",
  ];
  const qs = toQuery({
    place_id: placeId,
    fields,
    key: apiKey,
  });
  const url = `${PLACES_BASE_URL}/details/json?${qs}`;
  return await googleGetJson(url);
}

function computeEntityConfidence({ findStatus, candidateCount, nameSimilarity }) {
  if (findStatus !== "OK") return "LOW";

  // If Google returns a clear single candidate and the name matches strongly -> HIGH
  if (candidateCount === 1 && nameSimilarity >= 0.8) return "HIGH";

  // Multiple candidates or weaker name match -> MEDIUM
  if (candidateCount >= 1 && nameSimilarity >= 0.55) return "MEDIUM";

  return "LOW";
}

function possibleBlockers({ findStatus, candidateCount, nameSimilarity, details }) {
  const blockers = [];

  if (findStatus === "ZERO_RESULTS") {
    blockers.push(
      "Google Places API returned ZERO_RESULTS for your name+location query. This can happen due to name mismatch, incomplete/incorrect address signals, or an entity that Google can’t confidently resolve."
    );
    blockers.push("Try variations: remove LLC/Inc, add street address, add phone, or use a known citation/website name.");
    return blockers;
  }

  if (candidateCount > 1) {
    blockers.push(
      "Multiple candidates returned for the same/similar name. This can indicate name collision/brand confusion."
    );
  }

  if (nameSimilarity < 0.7) {
    blockers.push(
      "Returned place name differs materially from your input. Name mismatch can reduce entity confidence and contribute to visibility instability."
    );
  }

  if (details?.business_status && details.business_status !== "OPERATIONAL") {
    blockers.push(`Business status is '${details.business_status}'. Non-operational entities can be suppressed.`);
  }

  if ((details?.user_ratings_total ?? null) === 0) {
    blockers.push("This entity has 0 reviews (low trust signal). Getting the first real review often improves stability.");
  }

  return blockers;
}

function collisionSignals({ candidates, inputName }) {
  const inputTokens = tokenize(inputName);
  const similar = [];

  for (const c of candidates || []) {
    const sim = jaccard(tokenize(c.name), inputTokens);
    if (sim >= 0.6) {
      similar.push({
        place_id: c.place_id,
        name: c.name,
        formatted_address: c.formatted_address,
        business_status: c.business_status,
        types: c.types,
        name_similarity: Number(sim.toFixed(3)),
      });
    }
  }

  // Only report collisions we can confirm: multiple similar-name candidates
  const hasCollision = similar.length >= 2;
  return { hasCollision, similarCandidates: similar };
}

function printReport({ input, find, selected, details, confidence, blockers, collision }) {
  console.log("\n=== Local SEO Diagnostics Report (Google Places API) ===\n");
  console.log(`Input:`);
  console.log(`- businessName: ${input.businessName}`);
  console.log(`- location:     ${input.location}`);
  console.log(`- query sent:   ${find.input}`);

  console.log(`\nFind Place From Text:`);
  console.log(`- status: ${find.json.status}`);
  console.log(`- candidates: ${find.json.candidates?.length ?? 0}`);

  if (find.json.status === "ZERO_RESULTS") {
    console.log(`\nGoogle does NOT recognize this entity cleanly for that query (ZERO_RESULTS).`);
    console.log(`\nPossible causes (not exhaustive):`);
    console.log(`- Name mismatch (LLC vs no-LLC, abbreviations, old name)`);
    console.log(`- Category mismatch / unclear relevance signals`);
    console.log(`- Address/location mismatch (service-area business, wrong city hint)`);
    console.log(`- Entity is new/low-trust or inconsistent across citations`);
    return;
  }

  console.log(`\nSelected candidate (top):`);
  console.log(`- place_id: ${selected?.place_id || ""}`);
  console.log(`- name: ${selected?.name || ""}`);
  console.log(`- address: ${selected?.formatted_address || ""}`);
  console.log(`- business_status: ${selected?.business_status || ""}`);
  console.log(`- types: ${(selected?.types || []).join(", ")}`);
  console.log(`- maps_url: ${selected?.place_id ? mapsUrlFromPlaceId(selected.place_id, find.input) : ""}`);

  const nameSim = jaccard(tokenize(selected?.name || ""), tokenize(input.businessName));
  console.log(`\nName comparison:`);
  console.log(`- input name:    ${input.businessName}`);
  console.log(`- returned name: ${selected?.name || ""}`);
  console.log(`- similarity:    ${nameSim.toFixed(3)} (1.0 = identical tokens)`);

  console.log(`\nPlace Details:`);
  console.log(`- business_status: ${details?.business_status || ""}`);
  console.log(`- primary type (proxy): ${(details?.types && details.types[0]) || ""}`);
  console.log(`- rating: ${details?.rating ?? ""}`);
  console.log(`- user_ratings_total: ${details?.user_ratings_total ?? ""}`);
  console.log(`- geometry: ${details?.geometry?.location ? JSON.stringify(details.geometry.location) : ""}`);

  console.log(`\nEntity confidence: ${confidence}`);

  console.log(`\nPossible ranking/visibility blockers (API-evidence-based):`);
  if (!blockers.length) console.log(`- (none detected by these checks)`);
  for (const b of blockers) console.log(`- ${b}`);

  console.log(`\nDuplicate / collision / weak entity signals:`);
  if (collision.hasCollision) {
    console.log(`- Multiple similar-name candidates detected (collision risk).`);
  } else {
    console.log(`- No confirmed multi-candidate collision detected in Find Place response.`);
  }
  if (collision.similarCandidates.length) {
    console.log(`\nSimilar-name candidates (confirmed by API):`);
    for (const c of collision.similarCandidates) {
      console.log(
        `- ${c.name} | ${c.formatted_address} | status=${c.business_status || ""} | sim=${c.name_similarity}`
      );
    }
  }

  console.log(`\nNotes:`);
  console.log(
    `- This tool does NOT scrape Google and does NOT guess rankings. It only reports what Places API confirms.`
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) usageAndExit(0);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error("Missing env var: GOOGLE_PLACES_API_KEY");
    usageAndExit(1);
  }

  if (!args.businessName || !args.location) usageAndExit(1);

  // Step 1
  const find = await findPlaceFromText({
    apiKey,
    businessName: args.businessName,
    location: args.location,
  });

  const status = find.json.status;
  const candidates = find.json.candidates || [];

  if (status === "ZERO_RESULTS") {
    printReport({
      input: { businessName: args.businessName, location: args.location },
      find,
      selected: null,
      details: null,
      confidence: "LOW",
      blockers: possibleBlockers({
        findStatus: status,
        candidateCount: 0,
        nameSimilarity: 0,
        details: null,
      }),
      collision: { hasCollision: false, similarCandidates: [] },
    });
    return;
  }

  if (status !== "OK") {
    console.error(`Find Place error: status=${status}`);
    console.error(JSON.stringify(find.json, null, 2));
    process.exit(1);
  }

  const selected = candidates[0] || null;
  if (!selected?.place_id) {
    console.error("Unexpected: OK status but no place_id returned.");
    console.error(JSON.stringify(find.json, null, 2));
    process.exit(1);
  }

  // Step 3
  const detRes = await placeDetails({ apiKey, placeId: selected.place_id });
  const detStatus = detRes.json.status;
  if (detStatus !== "OK") {
    console.error(`Place Details error: status=${detStatus}`);
    console.error(JSON.stringify(detRes.json, null, 2));
    process.exit(1);
  }

  const details = detRes.json.result || null;
  const nameSimilarity = jaccard(tokenize(selected.name || ""), tokenize(args.businessName));

  const confidence = computeEntityConfidence({
    findStatus: status,
    candidateCount: candidates.length,
    nameSimilarity,
  });

  const blockers = possibleBlockers({
    findStatus: status,
    candidateCount: candidates.length,
    nameSimilarity,
    details,
  });

  const collision = collisionSignals({ candidates, inputName: args.businessName });

  printReport({
    input: { businessName: args.businessName, location: args.location },
    find,
    selected,
    details,
    confidence,
    blockers,
    collision,
  });
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});




