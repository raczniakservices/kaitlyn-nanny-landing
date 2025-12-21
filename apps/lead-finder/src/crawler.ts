import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { Business, SeedBusiness, CrawlResult, CrawlerConfig, HeuristicResult } from '@instantquote/core';
import { calculateFrictionScore, getScoreBand } from '@instantquote/core';
import { extractHeuristics } from './heuristics';
import { checkRobotsTxt } from './robots';
import chalk from 'chalk';

export class LeadCrawler {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private config: CrawlerConfig;
    private crawledDomains = new Set<string>();

    constructor(config: Partial<CrawlerConfig> = {}) {
        this.config = {
            concurrency: 2,
            delay_min_ms: 3000,
            delay_max_ms: 5000,
            timeout_ms: 30000,
            user_agent: 'InstantQuote Lead Finder Bot (+mailto:cody@instantquote.com)',
            respect_robots: true,
            cache_results: true,
            ...config
        };
    }

    async initialize(): Promise<void> {
        this.browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.context = await this.browser.newContext({
            userAgent: this.config.user_agent,
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true
        });
    }

    async close(): Promise<void> {
        if (this.context) {
            await this.context.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    async crawlBusiness(seed: SeedBusiness): Promise<CrawlResult> {
        if (!this.context) {
            throw new Error('Crawler not initialized. Call initialize() first.');
        }

        const domain = seed.domain || this.extractDomainFromUrl(seed.possible_site_url || '');

        if (!domain) {
            return {
                success: false,
                error: 'No domain found',
                url: seed.possible_site_url || ''
            };
        }

        // Skip if already crawled (caching)
        if (this.config.cache_results && this.crawledDomains.has(domain)) {
            return {
                success: false,
                error: 'Already crawled',
                url: `https://${domain}`
            };
        }

        const url = seed.possible_site_url || `https://${domain}`;

        try {
            // Check robots.txt if enabled
            if (this.config.respect_robots) {
                const robotsAllowed = await checkRobotsTxt(domain, '/', this.config.user_agent);
                if (!robotsAllowed) {
                    console.log(chalk.yellow(`⚠️  Robots.txt disallows crawling ${domain}`));
                    return {
                        success: false,
                        error: 'Blocked by robots.txt',
                        url
                    };
                }
            }

            // Add delay between requests
            await this.randomDelay();

            const page = await this.context.newPage();

            try {
                // Set timeout
                page.setDefaultTimeout(this.config.timeout_ms);

                console.log(chalk.blue(`🔍 Crawling ${domain}...`));

                // Navigate to homepage
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                // Get page content
                const html = await page.content();

                // Extract heuristics
                const heuristics = await extractHeuristics(page, html);

                // Try to find and analyze contact page
                if (heuristics.contact_urls.length > 0) {
                    const contactUrl = heuristics.contact_urls[0];
                    try {
                        await page.goto(contactUrl, { waitUntil: 'domcontentloaded' });
                        const contactHtml = await page.content();
                        const contactHeuristics = await extractHeuristics(page, contactHtml);

                        // Merge contact page data (prefer contact page for forms)
                        heuristics.form_inputs = Math.max(heuristics.form_inputs, contactHeuristics.form_inputs);
                        heuristics.form_required = Math.max(heuristics.form_required, contactHeuristics.form_required);
                        heuristics.has_file_upload = heuristics.has_file_upload || contactHeuristics.has_file_upload;
                        heuristics.emails = [...new Set([...heuristics.emails, ...contactHeuristics.emails])];
                        heuristics.phones = [...new Set([...heuristics.phones, ...contactHeuristics.phones])];
                    } catch (e) {
                        console.log(chalk.yellow(`⚠️  Could not load contact page for ${domain}`));
                    }
                }

                // Calculate friction score
                const scoring = calculateFrictionScore(heuristics);

                // Build business object
                const business: Business = {
                    niche: seed.niche,
                    business_name: seed.name,
                    domain,
                    homepage: url,
                    contact_url: heuristics.contact_urls[0],
                    email_primary: this.selectPrimaryEmail(heuristics.emails) || seed.email,
                    email_all: heuristics.emails,
                    phone: heuristics.phones[0] || seed.phone,
                    has_booking: heuristics.has_booking,
                    has_chat: heuristics.has_chat,
                    has_instant_quote: heuristics.has_instant_quote,
                    instant_quote_services: heuristics.instant_quote_services,
                    is_wordpress: heuristics.is_wordpress,
                    cms: heuristics.cms,
                    form_inputs: heuristics.form_inputs,
                    form_required: heuristics.form_required,
                    has_file_upload: heuristics.has_file_upload,
                    mobile_meta_viewport: heuristics.mobile_meta_viewport,
                    html_kb: Math.round(heuristics.html_size_bytes / 1024),
                    // Ads/marketing signals (opportunity gaps)
                    has_ga: heuristics.has_ga,
                    has_gtm: heuristics.has_gtm,
                    has_google_ads_tag: heuristics.has_google_ads_tag,
                    has_meta_pixel: heuristics.has_meta_pixel,
                    has_privacy_policy: heuristics.has_privacy_policy,
                    has_terms: heuristics.has_terms,
                    friction_score: scoring.score,
                    score_band: getScoreBand(scoring.score),
                    notes: this.mergeNotes(scoring.notes, heuristics).join(';'),
                    crawled_at: new Date(),
                    region: seed.region
                };

                this.crawledDomains.add(domain);

                console.log(chalk.green(`✅ ${domain} - Score: ${scoring.score} (${business.score_band})`));

                return {
                    success: true,
                    business,
                    url
                };

            } finally {
                await page.close();
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error crawling ${domain}: ${error}`));
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                url
            };
        }
    }

    async crawlMultiple(seeds: SeedBusiness[]): Promise<CrawlResult[]> {
        const results: CrawlResult[] = [];
        const chunks = this.chunkArray(seeds, this.config.concurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(seed => this.crawlBusiness(seed));
            const chunkResults = await Promise.allSettled(chunkPromises);

            for (const result of chunkResults) {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        success: false,
                        error: result.reason?.message || 'Promise rejected',
                        url: 'unknown'
                    });
                }
            }

            // Delay between chunks
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.randomDelay();
            }
        }

        return results;
    }

    private async randomDelay(): Promise<void> {
        const delay = Math.random() * (this.config.delay_max_ms - this.config.delay_min_ms) + this.config.delay_min_ms;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    private extractDomainFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            return urlObj.hostname;
        } catch {
            return null;
        }
    }

    private selectPrimaryEmail(emails: string[]): string | undefined {
        if (emails.length === 0) return undefined;

        // Prefer role emails that suggest owner/ops
        const preferredPrefixes = ['owner', 'office', 'service', 'contact', 'hello'];

        for (const prefix of preferredPrefixes) {
            const preferred = emails.find(email => email.startsWith(prefix + '@'));
            if (preferred) return preferred;
        }

        // Avoid generic info@ if other options exist
        const nonInfo = emails.filter(email => !email.startsWith('info@'));
        if (nonInfo.length > 0) return nonInfo[0];

        return emails[0];
    }

    private mergeNotes(scoringNotes: string[], heuristics: HeuristicResult): string[] {
        const notes = [...scoringNotes];
        if (!heuristics.has_gtm) notes.push('no_gtm');
        if (!heuristics.has_ga) notes.push('no_ga');
        if (!heuristics.has_google_ads_tag) notes.push('no_google_ads_tag');
        if (!heuristics.has_privacy_policy) notes.push('no_privacy_policy');
        if (!heuristics.has_terms) notes.push('no_terms');
        return notes;
    }
}
