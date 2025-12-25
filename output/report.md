# GBP Diagnostics Report

## Executive summary

- **Selected place**: **(none)**
- **Throttle likelihood**: **UNKNOWN**
- **Category mismatch**: **NO/UNKNOWN**
- **Name collision risk**: **NO**

## Evidence table

| Field | Value |
| --- | --- |
| place_id |  |
| name |  |
| address |  |
| types |  |
| business_status |  |
| rating |  |
| user_ratings_total |  |
| phone |  |
| website |  |
| maps_url (place_id) |  |
| write_review_url |  |

## Collision candidates (name collision risk signals)

No collision candidates detected in the current Places API results.

## Category mismatch analysis

Category mismatch analysis unavailable.

## Next actions checklist (minimal edits, ordered)

- [ ] Provide a Google Places API key to run API mode diagnostics.
- [ ] Paste the GBP 'Ask for reviews' link into config as ask_for_reviews_url.
- [ ] Paste the Maps URL from clicking the listing into config as maps_url.

## Acceptance checks

- [ ] Places API returns a single best match with matching phone/website.
- [ ] Collision risk reduced (fewer close-name candidates).
- [ ] Review count transitions from 0 to 1 (later).
- [ ] Maps and write-review URLs consistently resolve.

## Manual step needed

This run used **manual mode** (no API key). To get API-based diagnostics, add `google_places_api_key` to config or set `GOOGLE_PLACES_API_KEY` in `.env`.

What to paste into config for better analysis:
- **ask_for_reviews_url** (Ask for reviews link)
- **maps_url** (full URL after clicking the Maps listing)
- **cid** (if you can find a cid=... in a Maps URL)

Parsed manual inputs:
- extracted_place_id:




