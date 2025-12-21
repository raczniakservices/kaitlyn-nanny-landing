import Database from 'better-sqlite3';
import { Business, CrawlResult } from '@instantquote/core';
import path from 'path';

export class LeadDatabase {
    private db: Database.Database;

    constructor(dbPath: string = './data/leads.db') {
        this.db = new Database(dbPath);
        this.initializeTables();
    }

    private initializeTables(): void {
        // Create businesses table
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        niche TEXT NOT NULL,
        business_name TEXT NOT NULL,
        domain TEXT NOT NULL UNIQUE,
        homepage TEXT NOT NULL,
        contact_url TEXT,
        email_primary TEXT,
        email_all TEXT, -- JSON array
        phone TEXT,
        has_booking BOOLEAN NOT NULL,
        has_chat BOOLEAN NOT NULL,
        has_instant_quote BOOLEAN NOT NULL,
        instant_quote_services TEXT, -- JSON array
        is_wordpress BOOLEAN NOT NULL,
        cms TEXT,
        has_ga BOOLEAN,
        has_gtm BOOLEAN,
        has_google_ads_tag BOOLEAN,
        has_meta_pixel BOOLEAN,
        has_privacy_policy BOOLEAN,
        has_terms BOOLEAN,
        form_inputs INTEGER NOT NULL,
        form_required INTEGER NOT NULL,
        has_file_upload BOOLEAN NOT NULL,
        mobile_meta_viewport BOOLEAN NOT NULL,
        html_kb INTEGER NOT NULL,
        friction_score INTEGER NOT NULL,
        score_band TEXT NOT NULL,
        notes TEXT,
        region TEXT,
        crawled_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Create index on domain for faster lookups
        this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_businesses_domain ON businesses(domain);
      CREATE INDEX IF NOT EXISTS idx_businesses_score ON businesses(friction_score DESC);
      CREATE INDEX IF NOT EXISTS idx_businesses_niche ON businesses(niche);
    `);

        // Best-effort migrations for newly added columns
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_instant_quote BOOLEAN NOT NULL DEFAULT 0`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN instant_quote_services TEXT`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN is_wordpress BOOLEAN NOT NULL DEFAULT 0`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN cms TEXT`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_ga BOOLEAN`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_gtm BOOLEAN`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_google_ads_tag BOOLEAN`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_meta_pixel BOOLEAN`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_privacy_policy BOOLEAN`); } catch { }
        try { this.db.exec(`ALTER TABLE businesses ADD COLUMN has_terms BOOLEAN`); } catch { }
    }

    saveBusiness(business: Business): void {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO businesses (
        niche, business_name, domain, homepage, contact_url,
        email_primary, email_all, phone, has_booking, has_chat, has_instant_quote, instant_quote_services, is_wordpress, cms,
        has_ga, has_gtm, has_google_ads_tag, has_meta_pixel, has_privacy_policy, has_terms,
        form_inputs, form_required, has_file_upload, mobile_meta_viewport,
        html_kb, friction_score, score_band, notes, region, crawled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            business.niche,
            business.business_name,
            business.domain,
            business.homepage,
            business.contact_url,
            business.email_primary,
            JSON.stringify(business.email_all),
            business.phone,
            business.has_booking ? 1 : 0,
            business.has_chat ? 1 : 0,
            business.has_instant_quote ? 1 : 0,
            JSON.stringify(business.instant_quote_services || []),
            business.is_wordpress ? 1 : 0,
            business.cms,
            business.has_ga ? 1 : 0,
            business.has_gtm ? 1 : 0,
            business.has_google_ads_tag ? 1 : 0,
            business.has_meta_pixel ? 1 : 0,
            business.has_privacy_policy ? 1 : 0,
            business.has_terms ? 1 : 0,
            business.form_inputs,
            business.form_required,
            business.has_file_upload ? 1 : 0,
            business.mobile_meta_viewport ? 1 : 0,
            business.html_kb,
            business.friction_score,
            business.score_band,
            business.notes,
            business.region,
            business.crawled_at.toISOString()
        );
    }

    saveResults(results: CrawlResult[]): void {
        const transaction = this.db.transaction(() => {
            for (const result of results) {
                if (result.success && result.business) {
                    this.saveBusiness(result.business);
                }
            }
        });

        transaction();
    }

    getBusinesses(filters: {
        niche?: string;
        region?: string;
        minScore?: number;
        scoreBand?: string;
        hasEmail?: boolean;
        limit?: number;
    } = {}): Business[] {
        let query = `
      SELECT * FROM businesses
      WHERE 1=1
    `;
        const params: any[] = [];

        if (filters.niche) {
            query += ` AND niche = ?`;
            params.push(filters.niche);
        }

        if (filters.region) {
            query += ` AND region = ?`;
            params.push(filters.region);
        }

        if (filters.minScore !== undefined) {
            query += ` AND friction_score >= ?`;
            params.push(filters.minScore);
        }

        if (filters.scoreBand) {
            query += ` AND score_band = ?`;
            params.push(filters.scoreBand);
        }

        if (filters.hasEmail) {
            query += ` AND email_primary IS NOT NULL`;
        }

        query += ` ORDER BY friction_score DESC, niche`;

        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);
        }

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...params);

        return rows.map(this.rowToBusiness);
    }

    getStats(): {
        total: number;
        byNiche: Record<string, number>;
        byScoreBand: Record<string, number>;
        withEmail: number;
        withPhone: number;
    } {
        const total = this.db.prepare('SELECT COUNT(*) as count FROM businesses').get() as { count: number };

        const byNiche = this.db.prepare(`
      SELECT niche, COUNT(*) as count 
      FROM businesses 
      GROUP BY niche 
      ORDER BY count DESC
    `).all() as { niche: string; count: number }[];

        const byScoreBand = this.db.prepare(`
      SELECT score_band, COUNT(*) as count 
      FROM businesses 
      GROUP BY score_band 
      ORDER BY score_band
    `).all() as { score_band: string; count: number }[];

        const withEmail = this.db.prepare('SELECT COUNT(*) as count FROM businesses WHERE email_primary IS NOT NULL').get() as { count: number };
        const withPhone = this.db.prepare('SELECT COUNT(*) as count FROM businesses WHERE phone IS NOT NULL').get() as { count: number };

        return {
            total: total.count,
            byNiche: Object.fromEntries(byNiche.map(row => [row.niche, row.count])),
            byScoreBand: Object.fromEntries(byScoreBand.map(row => [row.score_band, row.count])),
            withEmail: withEmail.count,
            withPhone: withPhone.count
        };
    }

    clearResults(): void {
        this.db.exec('DELETE FROM businesses');
    }

    close(): void {
        this.db.close();
    }

    private rowToBusiness(row: any): Business {
        return {
            niche: row.niche,
            business_name: row.business_name,
            domain: row.domain,
            homepage: row.homepage,
            contact_url: row.contact_url,
            email_primary: row.email_primary,
            email_all: JSON.parse(row.email_all || '[]'),
            phone: row.phone,
            has_booking: Boolean(row.has_booking),
            has_chat: Boolean(row.has_chat),
            has_instant_quote: Boolean(row.has_instant_quote),
            instant_quote_services: JSON.parse(row.instant_quote_services || '[]'),
            is_wordpress: Boolean(row.is_wordpress),
            cms: row.cms || undefined,
            has_ga: row.has_ga === null || row.has_ga === undefined ? undefined : Boolean(row.has_ga),
            has_gtm: row.has_gtm === null || row.has_gtm === undefined ? undefined : Boolean(row.has_gtm),
            has_google_ads_tag: row.has_google_ads_tag === null || row.has_google_ads_tag === undefined ? undefined : Boolean(row.has_google_ads_tag),
            has_meta_pixel: row.has_meta_pixel === null || row.has_meta_pixel === undefined ? undefined : Boolean(row.has_meta_pixel),
            has_privacy_policy: row.has_privacy_policy === null || row.has_privacy_policy === undefined ? undefined : Boolean(row.has_privacy_policy),
            has_terms: row.has_terms === null || row.has_terms === undefined ? undefined : Boolean(row.has_terms),
            form_inputs: row.form_inputs,
            form_required: row.form_required,
            has_file_upload: Boolean(row.has_file_upload),
            mobile_meta_viewport: Boolean(row.mobile_meta_viewport),
            html_kb: row.html_kb,
            friction_score: row.friction_score,
            score_band: row.score_band as 'A' | 'B' | 'C' | 'D',
            notes: row.notes,
            region: row.region,
            crawled_at: new Date(row.crawled_at)
        };
    }
}


