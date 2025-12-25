/**
 * Google Places API (Web Service) minimal client.
 *
 * Uses official endpoints:
 * - Find Place From Text
 * - Text Search
 * - Place Details
 *
 * Docs:
 * - https://developers.google.com/maps/documentation/places/web-service/overview
 */

const PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place";

function withTimeoutMs(timeoutMs) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, done: () => clearTimeout(t) };
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

async function googleGetJson(url, { timeoutMs = 15000 } = {}) {
  const { signal, done } = withTimeoutMs(timeoutMs);
  try {
    const res = await fetch(url, { signal });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 300)}`);
    }
    return { httpStatus: res.status, json };
  } finally {
    done();
  }
}

export class PlacesClient {
  constructor({ apiKey, timeoutMs = 15000 } = {}) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  assertKey() {
    if (!this.apiKey) throw new Error("google_places_api_key is required for API mode.");
  }

  async findPlaceFromText({
    input,
    inputtype = "textquery",
    fields = [
      "place_id",
      "name",
      "formatted_address",
      "types",
      "business_status",
      "rating",
      "user_ratings_total",
    ],
    language,
  }) {
    this.assertKey();
    const qs = toQuery({
      input,
      inputtype,
      fields,
      key: this.apiKey,
      language,
    });
    const url = `${PLACES_BASE_URL}/findplacefromtext/json?${qs}`;
    return await googleGetJson(url, { timeoutMs: this.timeoutMs });
  }

  async textSearch({
    query,
    region,
    language,
    fields, // not supported for textsearch (kept for signature symmetry)
  }) {
    this.assertKey();
    const qs = toQuery({
      query,
      key: this.apiKey,
      region,
      language,
    });
    const url = `${PLACES_BASE_URL}/textsearch/json?${qs}`;
    return await googleGetJson(url, { timeoutMs: this.timeoutMs });
  }

  async placeDetails({
    place_id,
    fields = [
      "place_id",
      "name",
      "formatted_address",
      "types",
      "business_status",
      "rating",
      "user_ratings_total",
      "website",
      "formatted_phone_number",
      "international_phone_number",
      "url",
    ],
    language,
  }) {
    this.assertKey();
    const qs = toQuery({
      place_id,
      fields,
      key: this.apiKey,
      language,
    });
    const url = `${PLACES_BASE_URL}/details/json?${qs}`;
    return await googleGetJson(url, { timeoutMs: this.timeoutMs });
  }
}




