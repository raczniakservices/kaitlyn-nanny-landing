#!/usr/bin/env ts-node

import fs from 'fs/promises';
import path from 'path';
import csv from 'csv-parser';
import { createReadStream, createWriteStream } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import chalk from 'chalk';

interface PermitRecord {
    contractor_name?: string;
    business_name?: string;
    company_name?: string;
    name?: string;
    address?: string;
    city?: string;
    county?: string;
    region?: string;
    phone?: string;
    email?: string;
    permit_type?: string;
    work_type?: string;
    description?: string;
    date?: string;
    [key: string]: any;
}

interface NormalizedSeed {
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

async function ingestPermits() {
    console.log(chalk.blue('🔄 Starting permit data ingestion...'));

    const inputDir = './data/seeds/raw';
    const outputDir = './data/seeds';

    try {
        // Ensure directories exist
        await fs.mkdir(inputDir, { recursive: true });
        await fs.mkdir(outputDir, { recursive: true });

        // Check for raw permit files
        const files = await fs.readdir(inputDir);
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        if (csvFiles.length === 0) {
            console.log(chalk.yellow('⚠️  No CSV files found in ./data/seeds/raw/'));
            console.log(chalk.blue('Please place permit CSV files in ./data/seeds/raw/ directory'));
            console.log(chalk.blue('Expected columns: contractor_name, city, permit_type, etc.'));
            return;
        }

        for (const file of csvFiles) {
            const inputPath = path.join(inputDir, file);
            const niche = inferNicheFromFilename(file);
            const outputPath = path.join(outputDir, `${niche}_seeds.csv`);

            console.log(chalk.blue(`📁 Processing ${file} -> ${niche}_seeds.csv`));

            const records = await loadPermitRecords(inputPath);
            const seeds = normalizeRecords(records, niche, file);

            await writeSeedsFile(seeds, outputPath);

            console.log(chalk.green(`✅ Processed ${records.length} permits -> ${seeds.length} seeds`));
        }

        console.log(chalk.green('🎉 Permit ingestion complete!'));

    } catch (error) {
        console.error(chalk.red(`❌ Error during ingestion: ${error}`));
        process.exit(1);
    }
}

async function loadPermitRecords(filePath: string): Promise<PermitRecord[]> {
    return new Promise((resolve, reject) => {
        const records: PermitRecord[] = [];

        createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                records.push(row);
            })
            .on('end', () => {
                resolve(records);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

function normalizeRecords(records: PermitRecord[], niche: string, sourceFile: string): NormalizedSeed[] {
    const seeds: NormalizedSeed[] = [];
    const seenNames = new Set<string>();

    for (const record of records) {
        // Extract business name from various possible columns
        const businessName = (
            record.contractor_name ||
            record.business_name ||
            record.company_name ||
            record.name ||
            ''
        ).trim();

        if (!businessName || businessName.length < 3) {
            continue; // Skip invalid names
        }

        // Deduplicate by business name
        const normalizedName = businessName.toLowerCase();
        if (seenNames.has(normalizedName)) {
            continue;
        }
        seenNames.add(normalizedName);

        // Extract location info
        const city = (record.city || '').trim();
        const region = (record.county || record.region || '').trim();

        // Generate potential website URL
        const domain = generatePotentialDomain(businessName);
        const possibleSiteUrl = domain ? `https://${domain}` : '';

        const seed: NormalizedSeed = {
            business_name: businessName,
            domain: domain,
            possible_site_url: possibleSiteUrl,
            niche,
            city,
            region,
            phone: record.phone,
            email: record.email,
            source: sourceFile
        };

        seeds.push(seed);
    }

    return seeds;
}

function generatePotentialDomain(businessName: string): string {
    // Clean up business name for domain generation
    let domain = businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '') // Remove spaces
        .replace(/llc|inc|corp|company|co|ltd/g, '') // Remove business suffixes
        .trim();

    if (domain.length < 3) {
        return '';
    }

    // Try common domain patterns
    const patterns = [
        `${domain}.com`,
        `${domain}llc.com`,
        `${domain}inc.com`,
        `${domain}services.com`
    ];

    // Return the first pattern (we'll validate these later)
    return patterns[0];
}

function inferNicheFromFilename(filename: string): string {
    const name = filename.toLowerCase();

    if (name.includes('roof')) return 'roofing';
    if (name.includes('hvac') || name.includes('heating') || name.includes('cooling')) return 'hvac';
    if (name.includes('remodel') || name.includes('contractor') || name.includes('construction')) return 'remodeling';
    if (name.includes('landscape') || name.includes('lawn') || name.includes('garden')) return 'landscaping';
    if (name.includes('tree') || name.includes('arborist')) return 'tree';
    if (name.includes('pest') || name.includes('exterminator')) return 'pest';

    return 'general';
}

async function writeSeedsFile(seeds: NormalizedSeed[], outputPath: string): Promise<void> {
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

// Create sample data if no raw files exist
async function createSampleData() {
    const sampleDir = './data/seeds/raw';
    await fs.mkdir(sampleDir, { recursive: true });

    const sampleRoofingData = [
        {
            contractor_name: 'ABC Roofing LLC',
            city: 'Baltimore',
            county: 'Baltimore County, MD',
            permit_type: 'Roofing',
            phone: '410-555-0123'
        },
        {
            contractor_name: 'Quality Roof Solutions',
            city: 'Towson',
            county: 'Baltimore County, MD',
            permit_type: 'Roof Repair'
        },
        {
            contractor_name: 'Elite Roofing Services',
            city: 'Bel Air',
            county: 'Harford County, MD',
            permit_type: 'New Roof Installation'
        }
    ];

    const csvWriter = createObjectCsvWriter({
        path: path.join(sampleDir, 'roofing_permits_sample.csv'),
        header: [
            { id: 'contractor_name', title: 'contractor_name' },
            { id: 'city', title: 'city' },
            { id: 'county', title: 'county' },
            { id: 'permit_type', title: 'permit_type' },
            { id: 'phone', title: 'phone' }
        ]
    });

    await csvWriter.writeRecords(sampleRoofingData);
    console.log(chalk.blue('📝 Created sample roofing permit data in ./data/seeds/raw/roofing_permits_sample.csv'));
}

// Main execution
if (require.main === module) {
    ingestPermits().catch(console.error);
}


