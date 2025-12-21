# Raczniak Automations — Master Context (Project North Star)

Last updated: 2025-12-21

## What we’re building (one sentence)
**A lead-engine + audit + outreach platform that finds perfect-fit local service businesses (starting Baltimore area), diagnoses what’s missing on their website/marketing, and helps you close them—Facebook-first—using a high-converting intake funnel and a dashboard inbox.**

## Core outcomes (what “success” looks like)
- **Find the best clients** (service businesses that can pay, have demand, and have obvious fixable gaps).
- **Show them proof** (site audit + “quick wins” + screenshots) so you’re not “another marketer.”
- **Capture leads** through a **premium intake** (detailed, tailored questions; optional upgrades).
- **Close efficiently** with a Facebook-first outreach workflow and tracking (statuses, notes, next actions).

## Current state (what exists right now)

### Live deployment (Render)
- Repo pushed to GitHub: `raczniakservices/raczniak-automations`
- Render web service: `raczniak-automations`
- Public URL: `https://raczniak-automations.onrender.com`
  - Intake landing page: `/intake`
  - Leads inbox: `/leads`

### Dashboard app (Next.js) — already implemented
- **Intake landing page**: `apps/dashboard/pages/intake.tsx`
  - Multi-step form (4 steps) with progress bar
  - Service type dropdown + “Other (type it)”
  - **Contact preference defaults to Facebook message**
  - Optional upgrades checklist (GBP, Google Ads, Meta ads, landing page, tracking, automations, etc.)
  - Consent checkbox + honeypot spam trap
- **Submission API**: `apps/dashboard/pages/api/intake/submit.ts`
  - Validates required fields
  - Writes submissions to JSONL file: `data/outputs/intake_leads.jsonl`
- **Leads Inbox UI**: `apps/dashboard/pages/leads.tsx`
  - Search + filter by contact method
  - “Copy FB message” button for instant outreach
- Dashboard home links to `/intake` and `/leads`: `apps/dashboard/pages/index.tsx`

### Lead Finder engine (crawler) — partially implemented (not fully wired to dashboard yet)
- Crawler (`apps/lead-finder`) uses Playwright + heuristics to detect:
  - booking / chat / instant quote presence
  - form length, file upload, mobile viewport, CMS
  - **ads/tracking/compliance signals**: GA/GTM/Google Ads tag/Meta pixel + privacy/terms
- Exporter writes `data/outputs/leads_latest.csv` for the dashboard (current dashboard home reads this CSV).
- New Baltimore seed generator exists (OSM Overpass based) but **local runtime deps are partially installed** on the Windows machine; for production seed-gen we’ll keep it dependency-free.

## Strategy (how we choose perfect clients)
We target the overlap of:
- **Need leads** (poor conversion funnels, missing tracking/CTA/booking/quote)
- **Ability to pay** (high-ticket services, signs of scale)
- **Trust/legitimacy** (reviews, brand, policies)
- **Fixability** (WordPress/Wix/Squarespace/Webflow, clear site structure)
- **Speed-to-win** (gaps we can fix fast and demonstrate ROI)

## Outreach strategy (how we close)
- **Facebook-first**: more trust than cold email/phone for many service businesses.
- Permission-based flow:
  - “I made a quick plan / quick audit—want me to send it?”
  - Offer optional upgrades (not forced).
- System should support: **FB message / text / email / phone**, but default to FB.

## Key technical notes / constraints discovered
- GitHub push protection blocked a Twilio SID in docs; we redacted it.
- Render build originally failed due to TS typing; fixed by:
  - `apps/dashboard/tsconfig.json` adding `lib: ["ES2022","DOM","DOM.Iterable"]`
  - switching handlers away from `e.target.value` to `e.currentTarget.value`
- Render Free instances sleep (cold-start). Paid instance avoids slow wake-ups.
- Intake storage is currently JSONL on disk. **Render filesystem is not durable** across deploys/restarts.

## Immediate next upgrades (highest leverage)
1) **Persist intake leads in a real DB** (Render Postgres or Supabase) instead of JSONL.
2) Add lead workflow fields:
   - status: New → Contacted → Qualified → Won/Lost
   - tags, notes, next follow-up date
3) Add “perfect client score” and explainability:
   - capability to pay + urgency + fixability + trust + missing tracking/CTA
4) Improve the landing page “proof”:
   - add logo/branding, hero proof tiles, example audits, before/after visuals
5) Connect crawler results into the dashboard:
   - runs history (seed runs, audits)
   - per-lead detail view with audit breakdown
6) Add channel-native outreach helper:
   - FB script variants (short, confident)
   - follow-up sequences + reminders

## UX principles for everything we build
- Be **obvious** and **simple** on the surface, deep under the hood.
- Every lead should show:
  - Why it’s a fit (explainable)
  - What’s broken (audit)
  - What to do next (action)
- The system should feel like a “client acquisition OS,” not a spreadsheet.


