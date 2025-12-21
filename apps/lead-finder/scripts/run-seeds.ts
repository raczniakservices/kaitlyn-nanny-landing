#!/usr/bin/env ts-node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { LeadRunner } from '../src/runner';
import { LeadExporter } from '../src/exporters';
import { rankBusinesses } from '@instantquote/core';

const program = new Command();

program
    .name('run-seeds')
    .description('Run lead finder on seed data')
    .option('-n, --niche <niche>', 'Target niche (roofing, hvac, remodeling, landscaping, tree, pest)')
    .option('-r, --region <region>', 'Target region')
    .option('-l, --limit <number>', 'Limit number of businesses to crawl', '200')
    .option('-c, --concurrency <number>', 'Concurrent crawlers', '2')
    .option('--delay-min <number>', 'Minimum delay between requests (ms)', '3000')
    .option('--delay-max <number>', 'Maximum delay between requests (ms)', '5000')
    .option('--timeout <number>', 'Request timeout (ms)', '30000')
    .option('--no-robots', 'Ignore robots.txt')
    .option('--clear', 'Clear previous results before running')
    .parse();

const options = program.opts();

async function runSeeds() {
    console.log(chalk.blue('🚀 InstantQuote Lead Finder'));
    console.log(chalk.blue('================================\n'));

    const spinner = ora('Initializing...').start();

    try {
        const runner = new LeadRunner({
            concurrency: parseInt(options.concurrency),
            delay_min_ms: parseInt(options.delayMin),
            delay_max_ms: parseInt(options.delayMax),
            timeout_ms: parseInt(options.timeout),
            respect_robots: !options.noRobots,
            user_agent: 'InstantQuote Lead Finder Bot (+mailto:cody@instantquote.com)',
            cache_results: true
        });

        // Load seeds
        spinner.text = 'Loading seed data...';
        const seeds = await runner.loadSeeds({
            niche: options.niche,
            region: options.region,
            limit: parseInt(options.limit)
        });

        if (seeds.length === 0) {
            spinner.fail('No seed data found. Please run ingest-permits first.');
            console.log(chalk.yellow('\n💡 To get started:'));
            console.log(chalk.yellow('1. Place permit CSV files in ./data/seeds/raw/'));
            console.log(chalk.yellow('2. Run: npm run ingest-permits'));
            console.log(chalk.yellow('3. Run this script again'));
            process.exit(1);
        }

        spinner.succeed(`Loaded ${seeds.length} businesses to crawl`);

        // Show what we're targeting
        console.log(chalk.blue('\n🎯 Target Parameters:'));
        if (options.niche) console.log(`   Niche: ${options.niche}`);
        if (options.region) console.log(`   Region: ${options.region}`);
        console.log(`   Limit: ${options.limit}`);
        console.log(`   Concurrency: ${options.concurrency}`);
        console.log(`   Respect robots.txt: ${!options.noRobots}`);

        // Run crawler
        const crawlSpinner = ora(`Crawling ${seeds.length} businesses...`).start();
        const results = await runner.crawlSeeds(seeds);

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        crawlSpinner.succeed(`Crawled ${successful.length} businesses (${failed.length} failed)`);

        if (successful.length === 0) {
            console.log(chalk.red('❌ No businesses were successfully crawled'));
            await runner.close();
            process.exit(1);
        }

        // Process and rank results
        const businesses = successful.map(r => r.business!);
        const rankedBusinesses = rankBusinesses(businesses);

        // Export results
        const exportSpinner = ora('Exporting results...').start();
        const exporter = new LeadExporter();

        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const exportedFiles = await exporter.exportResults(rankedBusinesses, {
            format: 'both',
            output_dir: './data/outputs',
            filename_prefix: 'lead_finder_results',
            include_debug: false
        });

        // Generate HTML report
        const reportPath = `./data/outputs/lead_finder_report_${timestamp}.html`;
        await exporter.generateHtmlReport(rankedBusinesses, reportPath);
        exportedFiles.push(reportPath);

        exportSpinner.succeed(`Results exported to: ${exportedFiles.map(f => f.split('/').pop()).join(', ')}`);

        // Show summary
        console.log(chalk.green('\n🎯 CRAWL SUMMARY'));
        console.log(chalk.green('================'));
        console.log(`Total crawled: ${successful.length}`);
        console.log(`With email: ${businesses.filter(b => b.email_primary).length}`);
        console.log(`With phone: ${businesses.filter(b => b.phone).length}`);

        const scoreBands = {
            A: businesses.filter(b => b.score_band === 'A').length,
            B: businesses.filter(b => b.score_band === 'B').length,
            C: businesses.filter(b => b.score_band === 'C').length,
            D: businesses.filter(b => b.score_band === 'D').length
        };

        console.log(`\nScore Distribution:`);
        console.log(`  A-tier (80-100): ${scoreBands.A} ${chalk.red('← PRIORITY TARGETS')}`);
        console.log(`  B-tier (60-79):  ${scoreBands.B} ${chalk.yellow('← GOOD TARGETS')}`);
        console.log(`  C-tier (40-59):  ${scoreBands.C}`);
        console.log(`  D-tier (0-39):   ${scoreBands.D}`);

        const avgScore = Math.round(businesses.reduce((sum, b) => sum + b.friction_score, 0) / businesses.length);
        console.log(`\nAverage friction score: ${avgScore}/100`);

        // Show top priority targets
        const topTargets = rankedBusinesses
            .filter(b => b.score_band === 'A' && b.email_primary)
            .slice(0, 10);

        if (topTargets.length > 0) {
            console.log(chalk.red('\n🏆 TOP PRIORITY TARGETS (A-tier with email)'));
            console.log(chalk.red('=========================================='));
            topTargets.forEach((business, i) => {
                console.log(`${i + 1}. ${chalk.bold(business.business_name)} (${business.domain})`);
                console.log(`   📧 ${business.email_primary}`);
                console.log(`   📞 ${business.phone || 'No phone'}`);
                console.log(`   🎯 Score: ${business.friction_score}/100`);
                console.log(`   📝 Issues: ${business.notes.replace(/;/g, ', ')}`);
                console.log('');
            });

            console.log(chalk.red(`\n💡 NEXT STEPS:`));
            console.log(chalk.red(`1. Review the HTML report: ${reportPath.split('/').pop()}`));
            console.log(chalk.red(`2. Send sniper emails to the top ${Math.min(topTargets.length, 5)} targets`));
            console.log(chalk.red(`3. Use the sample email template from the spec`));
        } else {
            console.log(chalk.yellow('\n⚠️  No A-tier targets with email found'));
            console.log(chalk.yellow('Consider expanding your search criteria or checking more regions'));
        }

        // Show failure summary if any
        if (failed.length > 0) {
            console.log(chalk.yellow(`\n⚠️  FAILED TO CRAWL (${failed.length})`));
            const errorCounts = failed.reduce((acc, result) => {
                const error = result.error || 'Unknown error';
                acc[error] = (acc[error] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            Object.entries(errorCounts).forEach(([error, count]) => {
                console.log(`   ${error}: ${count}`);
            });
        }

        await runner.close();

    } catch (error) {
        spinner.fail(`Error: ${error}`);
        console.error(error);
        process.exit(1);
    }
}

if (require.main === module) {
    runSeeds().catch(console.error);
}
