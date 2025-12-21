# Output Directory

This directory contains the results from the InstantQuote Lead Finder.

## File Types

### CSV Files (`lead_finder_results_YYYYMMDD.csv`)
Spreadsheet-friendly format with columns:
- `business_name`: Company name
- `domain`: Website domain
- `homepage`: Full homepage URL
- `contact_url`: Contact page URL (if found)
- `email_primary`: Best email for outreach
- `email_all`: All emails found (semicolon-separated)
- `phone`: Phone number (if found)
- `has_booking`: TRUE/FALSE - online booking detected
- `has_chat`: TRUE/FALSE - chat widget detected
- `form_inputs`: Number of form input fields
- `form_required`: Number of required form fields
- `has_file_upload`: TRUE/FALSE - file upload available
- `mobile_meta_viewport`: TRUE/FALSE - mobile-optimized
- `html_kb`: Homepage size in KB
- `friction_score`: Score 0-100 (higher = better target)
- `score_band`: A/B/C/D tier
- `targeting_tier`: PRIORITY/GOOD/PASS/SKIP
- `notes`: Scoring factors (semicolon-separated)
- `region`: Geographic region
- `crawled_at`: Timestamp

### JSONL Files (`lead_finder_results_YYYYMMDD.jsonl`)
One JSON object per line for programmatic processing.

### HTML Reports (`lead_finder_report_YYYYMMDD.html`)
Visual dashboard with:
- Summary statistics
- Top 50 targets table
- Score distribution
- Filterable results

## Using the Results

### Priority Targets (A-Tier, 80-100 Score)
1. **Review the HTML report** for visual overview
2. **Filter CSV for A-tier with email**: `score_band=A AND email_primary != ""`
3. **Send targeted emails** using the sample template
4. **Track responses** and conversion rates

### Sample Email Template
```
Subject: Quick fix for missed mobile leads on {BusinessName}

Hi {FirstName},

I checked {domain} on my phone. The contact form has {form_inputs} fields and no "book now" option. Most people bounce at that point.

I have a one‑tap quote widget you can add with a single line of code. It sends you the lead instantly with photos.

Want me to add it to your site for a week so you can see if it brings in jobs?

— Cody
```

### Personalization Tips
- Replace `{BusinessName}` with actual business name
- Replace `{domain}` with their website
- Replace `{form_inputs}` with actual count from CSV
- Research owner name for `{FirstName}` (check About page)
- Reference specific friction points from `notes` column

## Opening in Spreadsheet Apps

### Google Sheets (Recommended)
1. Go to [sheets.google.com](https://sheets.google.com)
2. File → Import → Upload → Select CSV
3. Choose "Comma" as separator
4. Import data

### Excel
1. Open Excel
2. Data → From Text/CSV
3. Select the CSV file
4. Choose UTF-8 encoding
5. Import data

## Filtering and Sorting

### High-Value Targets
- Sort by `friction_score` descending
- Filter `score_band` = "A"
- Filter `email_primary` is not empty
- Focus on `targeting_tier` = "PRIORITY"

### By Business Type
- Filter `niche` column for specific industries
- Prioritize: roofing → hvac → remodeling → landscaping → tree → pest

### By Location
- Filter `region` or `city` columns
- Start with closest geographic areas

## Tracking Outreach

Consider adding columns to track:
- `email_sent_date`
- `response_received`
- `meeting_scheduled`
- `demo_completed`
- `deal_closed`
- `notes_followup`

This helps measure campaign effectiveness and ROI.

