# InstantQuote Lead Finder

Find and rank local service businesses (roofing, HVAC, remodeling, landscaping, tree/pest) that are ideal targets for the InstantQuote microform. Output owners' contact emails + key website heuristics for targeted outreach.

## 🎯 Goal

Identify businesses with high "quote friction" - those missing online booking, using long forms, lacking mobile optimization, etc. These are prime candidates for InstantQuote's one-tap quote widget.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Prepare Seed Data

Place permit CSV files in `./data/seeds/raw/` with columns like:
- `contractor_name` or `business_name`
- `city`
- `county` or `region`
- `permit_type`

```bash
# Process permit data into normalized seeds
npm run ingest-permits
```

### 3. Run Lead Finder

```bash
# Target roofing companies in Harford County, MD (limit 200)
npm run run-seeds -- --niche=roofing --region="Harford County, MD" --limit=200

# Or use the CLI directly
npx lead-finder run --niche=roofing --region="Harford County, MD" --limit=200
```

### 4. Review Results

- **CSV**: `./data/outputs/lead_finder_results_YYYYMMDD.csv`
- **HTML Report**: `./data/outputs/lead_finder_report_YYYYMMDD.html`
- **JSONL**: `./data/outputs/lead_finder_results_YYYYMMDD.jsonl`

## 📊 Friction Scoring Algorithm

Businesses are scored 0-100 based on quote friction:

### Positive Friction (Higher Score = Better Target)
- **+25**: No "Book now" or "Schedule" link detected
- **+20**: Contact form has >6 inputs OR >3 required fields  
- **+10**: No phone as tel: link
- **+10**: No email found
- **+10**: No chat widget
- **+10**: No file upload available
- **+5**: No meta viewport OR HTML >1.2MB

### Negative Friction (Lower Score)
- **-20**: Online booking detected (Calendly, etc.)
- **-10**: Chat widget detected

### Score Bands
- **80-100 (A)**: 🎯 **PRIORITY** - Ideal targets, send emails immediately
- **60-79 (B)**: ✅ **GOOD** - Worth outreach
- **40-59 (C)**: ⚠️ **PASS** - Consider if niche priority is high
- **<40 (D)**: ❌ **SKIP**

## 🛠️ CLI Commands

### Run Lead Finder
```bash
npx lead-finder run [options]

Options:
  -n, --niche <niche>        Target niche (roofing, hvac, remodeling, landscaping, tree, pest)
  -r, --region <region>      Target region
  -l, --limit <number>       Limit businesses to crawl (default: 200)
  -c, --concurrency <number> Concurrent crawlers (default: 2)
  --delay-min <number>       Min delay between requests ms (default: 3000)
  --delay-max <number>       Max delay between requests ms (default: 5000)
  --timeout <number>         Request timeout ms (default: 30000)
  --no-robots               Ignore robots.txt
  --clear                   Clear previous results
  --export-format <format>  Export format: csv, jsonl, both (default: both)
  --output-dir <dir>        Output directory (default: ./data/outputs)
```

### View Statistics
```bash
npx lead-finder stats
```

### Export Filtered Results
```bash
npx lead-finder export --score-band=A --email-only --limit=50
```

### Clear Database
```bash
npx lead-finder clear
```

## 📁 Project Structure

```
├── packages/core/          # Shared types and scoring logic
│   ├── src/types.ts        # TypeScript interfaces
│   └── src/scoring.ts      # Friction scoring algorithm
├── apps/lead-finder/       # Main application
│   ├── src/
│   │   ├── crawler.ts      # Playwright-based web crawler
│   │   ├── heuristics.ts   # Website analysis (forms, booking, chat)
│   │   ├── database.ts     # SQLite storage
│   │   ├── exporters.ts    # CSV/JSONL/HTML export
│   │   ├── runner.ts       # Orchestration logic
│   │   └── cli.ts          # Command-line interface
│   └── scripts/
│       ├── ingest-permits.ts    # Process permit CSV files
│       ├── run-seeds.ts         # Main runner script
│       └── enrich-domains.ts    # Domain validation/enrichment
├── data/
│   ├── seeds/raw/          # Raw permit CSV files (place here)
│   ├── seeds/              # Processed seed files
│   └── outputs/            # Results (CSV, JSONL, HTML)
└── README.md
```

## 🔍 Data Sources (Legal-Friendly)

### 1. Municipal Open Data (Primary)
- County building/HVAC/roofing permits with contractor names
- Examples: Baltimore City/County, Harford County MD, Anne Arundel, etc.
- **Why**: Active contractors in last 6-12 months = current businesses

### 2. Public Business Directories
- Local chambers of commerce
- Trade associations (NRCA state chapters)
- Better Business Bureau category pages
- **Process**: Extract business profiles → crawl their websites

### 3. Direct Website Crawls
- Seed lists from previous research
- **Note**: Always respect robots.txt, avoid search engine scraping

## 🤖 Politeness & Legal Compliance

- ✅ Respects robots.txt by default
- ✅ 1-2 concurrent requests max
- ✅ 3-5 second delays between hosts with jitter
- ✅ Identifies as InstantQuote bot with contact email
- ✅ Read-only crawling (no form submissions)
- ✅ Caches results to avoid repeat requests

## 📧 Sample Outreach Email

**Subject**: Quick fix for missed mobile leads on {BusinessName}

Hi {FirstName},

I checked {domain} on my phone. The contact form has {form_inputs} fields and no "book now" option. Most people bounce at that point.

I have a one‑tap quote widget you can add with a single line of code. It sends you the lead instantly with photos.

Want me to add it to your site for a week so you can see if it brings in jobs? If text is easier, reply here and I'll set it up.

— Cody

## 🎯 Targeting Strategy

### Niche Priority
1. **Roofing** (highest value)
2. **HVAC** 
3. **Remodeling**
4. **Landscaping**
5. **Tree/Pest**

### Geographic Waves
1. **Harford County MD** → Baltimore County/City → Anne Arundel → Howard → Montgomery
2. Each wave = 100-300 businesses
3. Stop once you have 100 A-tier targets with emails

## ✅ Acceptance Criteria

- [ ] Runs end-to-end on 200-500 businesses in <30 minutes
- [ ] Yields ≥40% with valid email OR working contact form URL
- [ ] Heuristics consistent on 3 random manual audits
- [ ] CSV exports open in Excel/Google Sheets (UTF-8 without BOM)
- [ ] ≥100 A/B targets with emails after one evening of crawling
- [ ] First positive replies within 72 hours
- [ ] First paid install within 7 days

## 🔧 Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

## 🐛 Troubleshooting

### No seed data found
1. Place permit CSV files in `./data/seeds/raw/`
2. Run `npm run ingest-permits`
3. Check `./data/seeds/` for processed files

### Crawling failures
- Check robots.txt compliance with `--no-robots` flag
- Reduce concurrency with `-c 1`
- Increase timeouts with `--timeout 60000`

### Low success rate
- Verify domain formats in seed files
- Check network connectivity
- Review failed URLs in console output

---

## GBP Diagnostics (Google Business Profile / review link troubleshooting)

This repo includes a small CLI tool that helps diagnose common causes of unstable/missing review links or Maps visibility when a GBP exists and is managed.

### What it checks (official APIs only)
- Place identity discovery via **Google Places API** (Find Place / Text Search / Details)
- **Category/type mismatch** proxy detection (via Places `types`)
- **Entity collision / name confusion** signals (multiple similar-name places in different states/domains)
- **Low-trust / throttle likelihood** heuristics (review-less + mismatch + collision)

### Setup

1) Create a Places API key (Google Maps Platform) and enable **Places API**.

2) Put your key in either:
- A config JSON field: `google_places_api_key`
- Or a `.env` file at repo root:

```bash
GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE
```

### Run (PowerShell-safe)

```bash
node src/gbp_diagnostics.js --config gbp.config.example.json
```

Outputs are written (overwritten each run) to:
- `./output/report.json`
- `./output/report.md`

### Manual mode (no API key)
If no key is present, the tool will still generate a report and tell you what URLs to paste:
- The GBP **Ask for reviews** link
- The Maps URL from clicking the listing
- Any `cid=` value you can find


## 📈 Performance Tuning

- **Concurrency**: Start with 2, increase carefully to avoid rate limiting
- **Delays**: 3-5s between requests is polite; reduce for internal testing only
- **Timeout**: 30s default; increase for slow sites
- **Caching**: Enabled by default to avoid re-crawling

## 🔮 Future Enhancements

- Auto-enrich owner names from About/Team pages
- PageSpeed/Lighthouse integration
- GMB review scraping
- Email deliverability checks (MX validation)
- Automated domain discovery via search APIs

---

**Built for InstantQuote** | Find high-friction service businesses and convert them to customers with targeted outreach.

