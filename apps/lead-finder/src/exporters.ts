import { Business, ExportOptions } from '@instantquote/core';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs/promises';
import path from 'path';

export class LeadExporter {
    async exportResults(businesses: Business[], options: ExportOptions): Promise<string[]> {
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const files: string[] = [];

        // Ensure output directory exists
        await fs.mkdir(options.output_dir, { recursive: true });

        if (options.format === 'csv' || options.format === 'both') {
            const csvFile = await this.exportToCsv(businesses, options, timestamp);
            files.push(csvFile);
        }

        if (options.format === 'jsonl' || options.format === 'both') {
            const jsonlFile = await this.exportToJsonl(businesses, options, timestamp);
            files.push(jsonlFile);
        }

        return files;
    }

    private async exportToCsv(businesses: Business[], options: ExportOptions, timestamp: string): Promise<string> {
        const filename = `${options.filename_prefix}_${timestamp}.csv`;
        const filepath = path.join(options.output_dir, filename);

        const csvWriter = createObjectCsvWriter({
            path: filepath,
            header: [
                { id: 'niche', title: 'niche' },
                { id: 'business_name', title: 'business_name' },
                { id: 'domain', title: 'domain' },
                { id: 'homepage', title: 'homepage' },
                { id: 'contact_url', title: 'contact_url' },
                { id: 'email_primary', title: 'email_primary' },
                { id: 'email_all', title: 'email_all' },
                { id: 'phone', title: 'phone' },
                { id: 'has_booking', title: 'has_booking' },
                { id: 'has_chat', title: 'has_chat' },
                { id: 'has_instant_quote', title: 'has_instant_quote' },
                { id: 'instant_quote_services', title: 'instant_quote_services' },
                { id: 'is_wordpress', title: 'is_wordpress' },
                { id: 'cms', title: 'cms' },
                { id: 'has_ga', title: 'has_ga' },
                { id: 'has_gtm', title: 'has_gtm' },
                { id: 'has_google_ads_tag', title: 'has_google_ads_tag' },
                { id: 'has_meta_pixel', title: 'has_meta_pixel' },
                { id: 'has_privacy_policy', title: 'has_privacy_policy' },
                { id: 'has_terms', title: 'has_terms' },
                { id: 'form_inputs', title: 'form_inputs' },
                { id: 'form_required', title: 'form_required' },
                { id: 'has_file_upload', title: 'has_file_upload' },
                { id: 'mobile_meta_viewport', title: 'mobile_meta_viewport' },
                { id: 'html_kb', title: 'html_kb' },
                { id: 'friction_score', title: 'friction_score' },
                { id: 'score_band', title: 'score_band' },
                { id: 'targeting_tier', title: 'targeting_tier' },
                { id: 'gap_summary', title: 'gap_summary' },
                { id: 'suggested_subject', title: 'suggested_subject' },
                { id: 'suggested_first_line', title: 'suggested_first_line' },
                { id: 'notes', title: 'notes' },
                { id: 'region', title: 'region' },
                { id: 'crawled_at', title: 'crawled_at' }
            ]
        });

        const records = businesses.map(business => ({
            niche: business.niche,
            business_name: business.business_name,
            domain: business.domain,
            homepage: business.homepage,
            contact_url: business.contact_url || '',
            email_primary: business.email_primary || '',
            email_all: business.email_all.join(';'),
            phone: business.phone || '',
            has_booking: business.has_booking ? 'TRUE' : 'FALSE',
            has_chat: business.has_chat ? 'TRUE' : 'FALSE',
            has_instant_quote: business.has_instant_quote ? 'TRUE' : 'FALSE',
            instant_quote_services: (business.instant_quote_services || []).join(';'),
            is_wordpress: business.is_wordpress ? 'TRUE' : 'FALSE',
            cms: business.cms || '',
            has_ga: business.has_ga ? 'TRUE' : 'FALSE',
            has_gtm: business.has_gtm ? 'TRUE' : 'FALSE',
            has_google_ads_tag: business.has_google_ads_tag ? 'TRUE' : 'FALSE',
            has_meta_pixel: business.has_meta_pixel ? 'TRUE' : 'FALSE',
            has_privacy_policy: business.has_privacy_policy ? 'TRUE' : 'FALSE',
            has_terms: business.has_terms ? 'TRUE' : 'FALSE',
            form_inputs: business.form_inputs,
            form_required: business.form_required,
            has_file_upload: business.has_file_upload ? 'TRUE' : 'FALSE',
            mobile_meta_viewport: business.mobile_meta_viewport ? 'TRUE' : 'FALSE',
            html_kb: business.html_kb,
            friction_score: business.friction_score,
            score_band: business.score_band,
            targeting_tier: this.getTargetingTier(business),
            gap_summary: this.buildGapSummary(business),
            suggested_subject: this.buildSubject(business),
            suggested_first_line: this.buildFirstLine(business),
            notes: business.notes,
            region: business.region || '',
            crawled_at: business.crawled_at.toISOString()
        }));

        await csvWriter.writeRecords(records);
        // Also write/update a stable latest file for dashboard consumption
        try {
            const latestPath = path.join(options.output_dir, 'leads_latest.csv');
            const header = 'niche,business_name,domain,homepage,contact_url,email_primary,email_all,phone,has_booking,has_chat,has_instant_quote,instant_quote_services,is_wordpress,cms,has_ga,has_gtm,has_google_ads_tag,has_meta_pixel,has_privacy_policy,has_terms,form_inputs,form_required,has_file_upload,mobile_meta_viewport,html_kb,friction_score,score_band,targeting_tier,gap_summary,suggested_subject,suggested_first_line,notes,region,crawled_at';
            const lines = records.map(r => [
                r.niche,
                escapeCsv(r.business_name),
                r.domain,
                r.homepage,
                r.contact_url,
                r.email_primary,
                escapeCsv(r.email_all),
                r.phone,
                r.has_booking,
                r.has_chat,
                r.has_instant_quote,
                escapeCsv(r.instant_quote_services),
                r.is_wordpress,
                r.cms,
                r.has_ga,
                r.has_gtm,
                r.has_google_ads_tag,
                r.has_meta_pixel,
                r.has_privacy_policy,
                r.has_terms,
                r.form_inputs,
                r.form_required,
                r.has_file_upload,
                r.mobile_meta_viewport,
                r.html_kb,
                r.friction_score,
                r.score_band,
                r.targeting_tier,
                escapeCsv(r.gap_summary),
                escapeCsv(r.suggested_subject),
                escapeCsv(r.suggested_first_line),
                escapeCsv(r.notes),
                r.region,
                r.crawled_at
            ].join(','));
            await fs.writeFile(latestPath, [header, ...lines].join('\n'), 'utf8');
        } catch { }
        return filepath;
    }

    private async exportToJsonl(businesses: Business[], options: ExportOptions, timestamp: string): Promise<string> {
        const filename = `${options.filename_prefix}_${timestamp}.jsonl`;
        const filepath = path.join(options.output_dir, filename);

        const jsonlContent = businesses
            .map(business => JSON.stringify({
                ...business,
                targeting_tier: this.getTargetingTier(business),
                crawled_at: business.crawled_at.toISOString()
            }))
            .join('\n');

        await fs.writeFile(filepath, jsonlContent, 'utf8');
        return filepath;
    }

    async generateHtmlReport(businesses: Business[], outputPath: string): Promise<string> {
        const stats = this.calculateStats(businesses);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lead Finder Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; }
        .stat-number { font-size: 2em; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
        .score-A { background-color: #dcfce7; }
        .score-B { background-color: #fef3c7; }
        .score-C { background-color: #fed7aa; }
        .score-D { background-color: #fecaca; }
        .priority { font-weight: bold; color: #dc2626; }
        .good { color: #059669; }
        .pass { color: #d97706; }
        .skip { color: #6b7280; }
    </style>
</head>
<body>
    <h1>Lead Finder Results</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${stats.total}</div>
            <div>Total Businesses</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.withEmail}</div>
            <div>With Email</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.aTier}</div>
            <div>A-Tier (Priority)</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.avgScore}</div>
            <div>Avg Friction Score</div>
        </div>
    </div>

    <h2>Top Targets</h2>
    <table>
        <thead>
            <tr>
                <th>Business</th>
                <th>Domain</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Score</th>
                <th>Band</th>
                <th>Tier</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            ${businesses.slice(0, 50).map(business => `
                <tr class="score-${business.score_band}">
                    <td>${business.business_name}</td>
                    <td><a href="${business.homepage}" target="_blank">${business.domain}</a></td>
                    <td>${business.email_primary || ''}</td>
                    <td>${business.phone || ''}</td>
                    <td>${business.friction_score}</td>
                    <td>${business.score_band}</td>
                    <td class="${this.getTargetingTier(business).toLowerCase()}">${this.getTargetingTier(business)}</td>
                    <td>${business.notes}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

        await fs.writeFile(outputPath, html, 'utf8');
        return outputPath;
    }

    private calculateStats(businesses: Business[]) {
        return {
            total: businesses.length,
            withEmail: businesses.filter(b => b.email_primary).length,
            aTier: businesses.filter(b => b.score_band === 'A').length,
            avgScore: Math.round(businesses.reduce((sum, b) => sum + b.friction_score, 0) / businesses.length)
        };
    }

    private getTargetingTier(business: Business): string {
        if (business.score_band === 'A') return 'PRIORITY';
        if (business.score_band === 'B') return 'GOOD';
        if (business.score_band === 'C') return 'PASS';
        return 'SKIP';
    }

    private buildGapSummary(b: Business): string {
        const gaps: string[] = [];
        if (!b.has_instant_quote) gaps.push('No instant quote');
        if (!b.has_booking) gaps.push('No booking');
        if (!b.has_chat) gaps.push('No chat');
        if (!b.has_gtm) gaps.push('No GTM');
        if (!b.has_ga) gaps.push('No GA');
        if (!b.has_privacy_policy) gaps.push('No privacy policy');
        if (b.form_inputs > 6 || b.form_required > 3) gaps.push('Long form');
        if (!b.mobile_meta_viewport) gaps.push('No viewport meta');
        if (b.is_wordpress) gaps.push('WordPress (easy install)');
        return gaps.join('; ');
    }

    private buildSubject(b: Business): string {
        if (!b.has_instant_quote) return `Quick win: Instant quote + tracking for ${b.domain}`;
        return `Quick win: Tracking + conversion upgrades for ${b.domain}`;
    }

    private buildFirstLine(b: Business): string {
        const parts: string[] = [];
        if (!b.has_instant_quote) parts.push(`Noticed ${b.domain} lacks an instant quote`);
        if (!b.has_gtm && !b.has_ga) parts.push(`and I didn't see Google Tag Manager/Analytics`);
        if (b.form_inputs > 0) parts.push(`and the contact form has ${b.form_inputs} fields`);
        if (b.is_wordpress) parts.push(`— we install via 1-line WordPress embed`);
        return parts.join(' ') + '.';
    }
}

// Minimal CSV escaping for fields that may contain commas or quotes
function escapeCsv(value: string | number | boolean | undefined): string {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}
