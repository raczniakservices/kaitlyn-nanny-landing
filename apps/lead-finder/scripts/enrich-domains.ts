#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import chalk from 'chalk';

interface SeedRecord {
    business_name: string;
    domain: string;
    possible_site_url: string;
    niche: string;
    city: string;
    region: string;
    phone?: string;
    email?: string;
    source: string;
}

async function enrichDomains() {
    console.log(chalk.blue('🔍 Starting domain enrichment...'));
    console.log(chalk.yellow('Note: This script helps validate and enrich domains manually'));
    console.log(chalk.yellow('For automated domain discovery, consider using Bing Web Search API\n'));

    const seedsDir = './data/seeds';

    try {
        const files = await fs.readdir(seedsDir);
        const csvFiles = files.filter(file => file.endsWith('.csv') && file.includes('seeds'));

        if (csvFiles.length === 0) {
            console.log(chalk.red('❌ No seed files found. Run ingest-permits first.'));
            return;
        }

        for (const file of csvFiles) {
            const filePath = path.join(seedsDir, file);
            console.log(chalk.blue(`📁 Processing ${file}...`));

            const seeds = await loadSeeds(filePath);
            const enrichedSeeds = await enrichSeedDomains(seeds);

            // Write enriched file
            const enrichedPath = filePath.replace('.csv', '_enriched.csv');
            await writeEnrichedSeeds(enrichedSeeds, enrichedPath);

            console.log(chalk.green(`✅ Enriched ${enrichedSeeds.length} seeds -> ${path.basename(enrichedPath)}`));
        }

        console.log(chalk.green('\n🎉 Domain enrichment complete!'));
        console.log(chalk.blue('\n💡 Manual Review Suggestions:'));
        console.log(chalk.blue('1. Check the *_enriched.csv files'));
        console.log(chalk.blue('2. Manually verify/correct domains for high-value targets'));
        console.log(chalk.blue('3. Add any missing domains you find through web searches'));

    } catch (error) {
        console.error(chalk.red(`❌ Error during enrichment: ${error}`));
        process.exit(1);
    }
}

async function loadSeeds(filePath: string): Promise<SeedRecord[]> {
    return new Promise((resolve, reject) => {
        const seeds: SeedRecord[] = [];

        createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                seeds.push(row);
            })
            .on('end', () => {
                resolve(seeds);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

async function enrichSeedDomains(seeds: SeedRecord[]): Promise<SeedRecord[]> {
    const enriched: SeedRecord[] = [];

    for (const seed of seeds) {
        const enrichedSeed = { ...seed };

        // If no domain, try to generate better candidates
        if (!seed.domain || seed.domain.length < 5) {
            const candidates = generateDomainCandidates(seed.business_name);
            enrichedSeed.domain = candidates[0] || '';
            enrichedSeed.possible_site_url = candidates[0] ? `https://${candidates[0]}` : '';

            // Add a note about domain candidates
            enrichedSeed.source = `${seed.source} (auto-generated domain)`;
        }

        // Validate existing domains
        if (seed.domain) {
            const isValid = validateDomainFormat(seed.domain);
            if (!isValid) {
                console.log(chalk.yellow(`⚠️  Invalid domain format: ${seed.domain} for ${seed.business_name}`));
                const candidates = generateDomainCandidates(seed.business_name);
                enrichedSeed.domain = candidates[0] || '';
                enrichedSeed.possible_site_url = candidates[0] ? `https://${candidates[0]}` : '';
            }
        }

        enriched.push(enrichedSeed);
    }

    return enriched;
}

function generateDomainCandidates(businessName: string): string[] {
    // Clean up business name
    let cleanName = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '') // Remove spaces
        .replace(/llc|inc|corp|company|co|ltd|services|service/g, '') // Remove business suffixes
        .trim();

    if (cleanName.length < 3) {
        return [];
    }

    // Generate domain candidates
    const candidates = [
        `${cleanName}.com`,
        `${cleanName}llc.com`,
        `${cleanName}inc.com`,
        `${cleanName}services.com`,
        `${cleanName}co.com`,
        `${cleanName}.net`,
        `${cleanName}.org`
    ];

    // Add variations with common words
    if (cleanName.length < 15) {
        candidates.push(
            `${cleanName}roofing.com`,
            `${cleanName}hvac.com`,
            `${cleanName}contractors.com`,
            `${cleanName}construction.com`
        );
    }

    return candidates.slice(0, 3); // Return top 3 candidates
}

function validateDomainFormat(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
}

async function writeEnrichedSeeds(seeds: SeedRecord[], outputPath: string): Promise<void> {
    const csvWriter = createObjectCsvWriter({
        path: outputPath,
        header: [
            { id: 'business_name', title: 'business_name' },
            { id: 'domain', title: 'domain' },
            { id: 'possible_site_url', title: 'possible_site_url' },
            { id: 'niche', title: 'niche' },
            { id: 'city', title: 'city' },
            { id: 'region', title: 'region' },
            { id: 'phone', title: 'phone' },
            { id: 'email', title: 'email' },
            { id: 'source', title: 'source' }
        ]
    });

    await csvWriter.writeRecords(seeds);
}

// Create a manual domain enrichment template
async function createManualTemplate() {
    const templatePath = './data/seeds/manual_domain_enrichment_template.csv';

    const template = [
        {
            business_name: 'Example Roofing LLC',
            domain: 'exampleroofing.com',
            possible_site_url: 'https://exampleroofing.com',
            niche: 'roofing',
            city: 'Baltimore',
            region: 'Baltimore County, MD',
            phone: '410-555-0123',
            email: 'info@exampleroofing.com',
            source: 'manual_research'
        }
    ];

    const csvWriter = createObjectCsvWriter({
        path: templatePath,
        header: [
            { id: 'business_name', title: 'business_name' },
            { id: 'domain', title: 'domain' },
            { id: 'possible_site_url', title: 'possible_site_url' },
            { id: 'niche', title: 'niche' },
            { id: 'city', title: 'city' },
            { id: 'region', title: 'region' },
            { id: 'phone', title: 'phone' },
            { id: 'email', title: 'email' },
            { id: 'source', title: 'source' }
        ]
    });

    await csvWriter.writeRecords(template);
    console.log(chalk.blue(`📝 Created manual enrichment template: ${templatePath}`));
}

if (require.main === module) {
    enrichDomains().catch(console.error);
}


