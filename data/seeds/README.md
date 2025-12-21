# Seed Data Directory

This directory contains the seed data for the InstantQuote Lead Finder.

## Directory Structure

```
data/seeds/
├── raw/                    # Place raw permit CSV files here
│   ├── roofing_permits.csv
│   ├── hvac_permits.csv
│   └── ...
├── roofing_seeds.csv      # Processed roofing seeds
├── hvac_seeds.csv         # Processed HVAC seeds
└── ...
```

## Getting Started

1. **Place raw permit data** in the `raw/` subdirectory
2. **Run the ingestion script**: `npm run ingest-permits`
3. **Review processed seeds** in the main directory
4. **Run the crawler**: `npm run run-seeds`

## Expected CSV Format

### Raw Permit Files
Your raw permit CSV files should contain columns like:
- `contractor_name` or `business_name` or `company_name`
- `city`
- `county` or `region`
- `permit_type` (optional, helps with niche detection)
- `phone` (optional)
- `email` (optional)

### Processed Seed Files
After ingestion, you'll get normalized seed files with:
- `business_name`: Cleaned business name
- `domain`: Generated domain (may need validation)
- `possible_site_url`: Full URL to try
- `niche`: Detected business type
- `city`: Location
- `region`: County/region
- `phone`: Phone number if available
- `email`: Email if available
- `source`: Original file name

## Data Sources

### Municipal Open Data (Recommended)
- **Baltimore City**: [Open Baltimore](https://data.baltimorecity.gov/)
- **Baltimore County**: [Baltimore County Open Data](https://opendata.baltimorecountymd.gov/)
- **Harford County**: [Harford County GIS](https://www.harfordcountymd.gov/1963/GIS-Open-Data)
- **Anne Arundel County**: [Anne Arundel County Open Data](https://opendata.aacounty.org/)

Look for datasets like:
- Building permits
- HVAC permits
- Roofing permits
- Contractor licenses
- Business licenses

### Business Directories
- Local chamber of commerce member lists
- Trade association directories (NRCA, ACCA, etc.)
- Better Business Bureau listings
- State contractor license databases

## Manual Enrichment

If you have businesses without domains, you can:

1. **Use the enrichment script**: `npm run enrich-domains`
2. **Manual research**: Search "{business name} {city}" and add domains
3. **Use the template**: Copy `manual_domain_enrichment_template.csv`

## Sample Data

If you don't have permit data yet, the ingestion script will create sample data to test with.

## Tips

- **Start small**: Begin with 50-100 businesses to test the system
- **Focus on recent permits**: Last 6-12 months = active businesses  
- **Verify domains**: Auto-generated domains may need manual validation
- **Geographic targeting**: Start with one county, expand gradually

