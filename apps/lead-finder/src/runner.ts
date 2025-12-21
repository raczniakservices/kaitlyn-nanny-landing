import { SeedBusiness, CrawlResult, CrawlerConfig } from '@instantquote/core';
import { LeadCrawler } from './crawler';
import { LeadDatabase } from './database';
import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import chalk from 'chalk';

export interface SeedFilters {
    niche?: string;
    region?: string;
    limit?: number;
}

export class LeadRunner {
    private crawler: LeadCrawler;
    private db: LeadDatabase;

    constructor(config: Partial<CrawlerConfig> = {}) {
        this.crawler = new LeadCrawler(config);
        this.db = new LeadDatabase();
    }

    async initialize(): Promise<void> {
        await this.crawler.initialize();
    }

    async close(): Promise<void> {
        await this.crawler.close();
        this.db.close();
    }

    async loadSeeds(filters: SeedFilters = {}): Promise<SeedBusiness[]> {
        const seedsDir = './data/seeds';
        const seeds: SeedBusiness[] = [];

        try {
            const files = await fs.readdir(seedsDir);
            const csvFiles = files.filter(file => file.endsWith('.csv'));

            for (const file of csvFiles) {
                const filePath = path.join(seedsDir, file);
                const fileSeeds = await this.loadSeedsFromCsv(filePath);
                seeds.push(...fileSeeds);
            }
        } catch (error) {
            console.warn(chalk.yellow(`Warning: Could not load seeds from directory: ${error}`));
        }

        // Apply filters
        let filteredSeeds = seeds;

        if (filters.niche) {
            filteredSeeds = filteredSeeds.filter(seed =>
                seed.niche.toLowerCase() === filters.niche!.toLowerCase()
            );
        }

        if (filters.region) {
            filteredSeeds = filteredSeeds.filter(seed =>
                seed.region?.toLowerCase().includes(filters.region!.toLowerCase()) ||
                seed.city.toLowerCase().includes(filters.region!.toLowerCase())
            );
        }

        if (filters.limit) {
            filteredSeeds = filteredSeeds.slice(0, filters.limit);
        }

        return filteredSeeds;
    }

    private async loadSeedsFromCsv(filePath: string): Promise<SeedBusiness[]> {
        return new Promise((resolve, reject) => {
            const seeds: SeedBusiness[] = [];

            createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    // Handle different CSV formats
                    const seed: SeedBusiness = {
                        name: row.business_name || row.name || row.contractor_name || '',
                        domain: row.domain || row.website || '',
                        possible_site_url: row.possible_site_url || row.website || row.url || '',
                        niche: row.niche || this.inferNicheFromFilename(filePath),
                        city: row.city || row.location || '',
                        region: row.region || row.county || '',
                        phone: row.phone || row.contact_phone || '',
                        email: row.email || row.contact_email || '',
                        source: row.source || path.basename(filePath)
                    };

                    // Skip if no name
                    if (seed.name.trim()) {
                        seeds.push(seed);
                    }
                })
                .on('end', () => {
                    console.log(chalk.blue(`📁 Loaded ${seeds.length} seeds from ${path.basename(filePath)}`));
                    resolve(seeds);
                })
                .on('error', (error) => {
                    console.error(chalk.red(`Error loading ${filePath}: ${error}`));
                    reject(error);
                });
        });
    }

    private inferNicheFromFilename(filePath: string): string {
        const filename = path.basename(filePath, '.csv').toLowerCase();

        if (filename.includes('roof')) return 'roofing';
        if (filename.includes('hvac')) return 'hvac';
        if (filename.includes('remodel') || filename.includes('contractor')) return 'remodeling';
        if (filename.includes('landscape') || filename.includes('lawn')) return 'landscaping';
        if (filename.includes('tree')) return 'tree';
        if (filename.includes('pest')) return 'pest';

        return 'general';
    }

    async crawlSeeds(seeds: SeedBusiness[]): Promise<CrawlResult[]> {
        await this.initialize();

        console.log(chalk.blue(`🚀 Starting crawl of ${seeds.length} businesses...`));

        const results = await this.crawler.crawlMultiple(seeds);

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log(chalk.green(`✅ Successfully crawled: ${successful.length}`));
        if (failed.length > 0) {
            console.log(chalk.red(`❌ Failed to crawl: ${failed.length}`));

            // Log first few failures for debugging
            failed.slice(0, 3).forEach(result => {
                console.log(chalk.red(`  • ${result.url}: ${result.error}`));
            });
        }

        return results;
    }

    async runFullPipeline(filters: SeedFilters = {}): Promise<CrawlResult[]> {
        const seeds = await this.loadSeeds(filters);

        if (seeds.length === 0) {
            throw new Error('No seed data found. Please run ingest-permits first.');
        }

        const results = await this.crawlSeeds(seeds);

        // Save results to database
        this.db.saveResults(results);

        return results;
    }
}
