#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { LeadRunner } from './runner';
import { LeadDatabase } from './database';
import { LeadExporter } from './exporters';
import { NICHES, REGIONS } from '@instantquote/core';
import { runAutomation, WORKFLOWS, type AutomationWorkflowId } from '@instantquote/automation-showcase';

const program = new Command();

program
    .name('lead-finder')
    .description('InstantQuote Lead Finder - Find and rank local service businesses')
    .version('1.0.0');

program
    .command('run')
    .description('Run lead finder on seed data')
    .option('-n, --niche <niche>', `Target niche (${NICHES.join(', ')})`)
    .option('-r, --region <region>', 'Target region')
    .option('-l, --limit <number>', 'Limit number of businesses to crawl', '200')
    .option('-c, --concurrency <number>', 'Concurrent crawlers', '2')
    .option('--delay-min <number>', 'Minimum delay between requests (ms)', '3000')
    .option('--delay-max <number>', 'Maximum delay between requests (ms)', '5000')
    .option('--timeout <number>', 'Request timeout (ms)', '30000')
    .option('--no-robots', 'Ignore robots.txt')
    .option('--clear', 'Clear previous results before running')
    .option('--export-format <format>', 'Export format (csv, jsonl, both)', 'both')
    .option('--output-dir <dir>', 'Output directory', './data/outputs')
    .action(async (options) => {
        const spinner = ora('Initializing Lead Finder...').start();

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

            const db = new LeadDatabase();

            if (options.clear) {
                spinner.text = 'Clearing previous results...';
                db.clearResults();
                console.log(chalk.yellow('🗑️  Cleared previous results'));
            }

            spinner.text = 'Loading seed data...';
            const seeds = await runner.loadSeeds({
                niche: options.niche,
                region: options.region,
                limit: parseInt(options.limit)
            });

            if (seeds.length === 0) {
                spinner.fail('No seed data found. Please run ingest-permits first.');
                process.exit(1);
            }

            spinner.succeed(`Loaded ${seeds.length} businesses to crawl`);

            // Run crawler
            const crawlSpinner = ora(`Crawling ${seeds.length} businesses...`).start();
            const results = await runner.crawlSeeds(seeds);

            const successful = results.filter(r => r.success);
            const failed = results.filter(r => !r.success);

            crawlSpinner.succeed(`Crawled ${successful.length} businesses (${failed.length} failed)`);

            // Save to database
            const saveSpinner = ora('Saving results to database...').start();
            db.saveResults(results);
            saveSpinner.succeed('Results saved to database');

            // Export results
            const exportSpinner = ora('Exporting results...').start();
            const businesses = successful.map(r => r.business!);
            const exporter = new LeadExporter();

            const exportedFiles = await exporter.exportResults(businesses, {
                format: options.exportFormat as 'csv' | 'jsonl' | 'both',
                output_dir: options.outputDir,
                filename_prefix: 'lead_finder_results',
                include_debug: false
            });

            // Generate HTML report
            const reportPath = `${options.outputDir}/lead_finder_report_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.html`;
            await exporter.generateHtmlReport(businesses, reportPath);
            exportedFiles.push(reportPath);

            exportSpinner.succeed(`Results exported to: ${exportedFiles.join(', ')}`);

            // Show summary
            console.log(chalk.green('\n🎯 Summary:'));
            console.log(`Total crawled: ${successful.length}`);
            console.log(`With email: ${businesses.filter(b => b.email_primary).length}`);
            console.log(`A-tier (Priority): ${businesses.filter(b => b.score_band === 'A').length}`);
            console.log(`B-tier (Good): ${businesses.filter(b => b.score_band === 'B').length}`);
            console.log(`Average friction score: ${Math.round(businesses.reduce((sum, b) => sum + b.friction_score, 0) / businesses.length)}`);

            const topTargets = businesses
                .filter(b => b.score_band === 'A' && b.email_primary)
                .slice(0, 5);

            if (topTargets.length > 0) {
                console.log(chalk.green('\n🏆 Top 5 Priority Targets:'));
                topTargets.forEach((business, i) => {
                    console.log(`${i + 1}. ${business.business_name} (${business.domain}) - Score: ${business.friction_score}`);
                    console.log(`   Email: ${business.email_primary}`);
                    console.log(`   Notes: ${business.notes}`);
                });
            }

            db.close();
            await runner.close();

        } catch (error) {
            spinner.fail(`Error: ${error}`);
            process.exit(1);
        }
    });

program
    .command('stats')
    .description('Show statistics from database')
    .action(async () => {
        const db = new LeadDatabase();
        const stats = db.getStats();

        console.log(chalk.blue('📊 Lead Finder Statistics\n'));
        console.log(`Total businesses: ${stats.total}`);
        console.log(`With email: ${stats.withEmail}`);
        console.log(`With phone: ${stats.withPhone}`);

        console.log(chalk.yellow('\nBy Niche:'));
        Object.entries(stats.byNiche).forEach(([niche, count]) => {
            console.log(`  ${niche}: ${count}`);
        });

        console.log(chalk.yellow('\nBy Score Band:'));
        Object.entries(stats.byScoreBand).forEach(([band, count]) => {
            console.log(`  ${band}-tier: ${count}`);
        });

        db.close();
    });

program
    .command('export')
    .description('Export results from database')
    .option('-n, --niche <niche>', 'Filter by niche')
    .option('-r, --region <region>', 'Filter by region')
    .option('-s, --min-score <score>', 'Minimum friction score', '0')
    .option('-b, --score-band <band>', 'Filter by score band (A, B, C, D)')
    .option('--email-only', 'Only businesses with email')
    .option('-l, --limit <number>', 'Limit results')
    .option('--format <format>', 'Export format (csv, jsonl, both)', 'csv')
    .option('--output-dir <dir>', 'Output directory', './data/outputs')
    .action(async (options) => {
        const db = new LeadDatabase();

        const businesses = db.getBusinesses({
            niche: options.niche,
            region: options.region,
            minScore: options.minScore ? parseInt(options.minScore) : undefined,
            scoreBand: options.scoreBand,
            hasEmail: options.emailOnly,
            limit: options.limit ? parseInt(options.limit) : undefined
        });

        if (businesses.length === 0) {
            console.log(chalk.yellow('No businesses found matching criteria'));
            db.close();
            return;
        }

        const exporter = new LeadExporter();
        const files = await exporter.exportResults(businesses, {
            format: options.format as 'csv' | 'jsonl' | 'both',
            output_dir: options.outputDir,
            filename_prefix: 'filtered_results',
            include_debug: false
        });

        console.log(chalk.green(`Exported ${businesses.length} businesses to: ${files.join(', ')}`));
        db.close();
    });

program
    .command('clear')
    .description('Clear all results from database')
    .action(async () => {
        const db = new LeadDatabase();
        db.clearResults();
        console.log(chalk.yellow('🗑️  Cleared all results from database'));
        db.close();
    });

const automations = program
    .command('automations')
    .description('Automation showcase workflows (demo-safe, dry-run by default)');

automations
    .command('list')
    .description('List available showcase workflows')
    .action(() => {
        console.log(chalk.blue('🤖 Showcase workflows:\n'));
        WORKFLOWS.forEach(w => {
            console.log(`${chalk.green(w.id)} — ${w.title}`);
            console.log(`   ${chalk.gray(w.tagline)}\n`);
        });
    });

automations
    .command('run')
    .description('Run a single showcase workflow and write artifacts to data/outputs')
    .requiredOption('-w, --workflow <id>', 'Workflow id (lead_welcome | permit_watch | friction_audit)')
    .option('--dry-run', 'Generate previews only (no real sends/writes). Default: true', true)
    .option('--out-dir <dir>', 'Output directory (default: ./data/outputs/automation_showcase)', './data/outputs/automation_showcase')
    .option('--domain <domain>', 'Target domain (for friction_audit)', '')
    .action(async (options) => {
        const wf = options.workflow as AutomationWorkflowId;
        const spinner = ora(`Running showcase workflow: ${wf}...`).start();
        try {
            const inputs: Record<string, unknown> = {};
            if (options.domain) inputs.domain = options.domain;

            const res = await runAutomation({
                workflowId: wf,
                dryRun: Boolean(options.dryRun),
                outDir: options.outDir,
                inputs
            });

            spinner.succeed(`Done: ${res.run.status} — wrote run to ${res.runDir}`);
            console.log(chalk.green(`\nRun: ${res.run.title}`));
            console.log(`Status: ${res.run.status} • Dry-run: ${res.run.dryRun ? 'yes' : 'no'}`);
            console.log(`Artifacts: ${res.run.artifacts.length}`);
            res.run.artifacts.slice(0, 10).forEach(a => console.log(`  - ${a.name} (${a.type}) → ${a.relPath}`));
        } catch (err) {
            spinner.fail(`Error: ${err}`);
            process.exit(1);
        }
    });

automations
    .command('demo')
    .description('Run all showcase workflows (great for screenshots)')
    .option('--out-dir <dir>', 'Output directory (default: ./data/outputs/automation_showcase)', './data/outputs/automation_showcase')
    .action(async (options) => {
        console.log(chalk.blue('🎬 Running full automation showcase demo...\n'));
        for (const wf of WORKFLOWS) {
            const spinner = ora(`Running: ${wf.id}`).start();
            try {
                const res = await runAutomation({
                    workflowId: wf.id,
                    dryRun: true,
                    outDir: options.outDir,
                    inputs: wf.id === 'friction_audit' ? { domain: 'summitroofing.example' } : {}
                });
                spinner.succeed(`Wrote: ${res.runDir}`);
            } catch (err) {
                spinner.fail(`Failed: ${String(err)}`);
            }
        }
        console.log(chalk.green('\n✅ Showcase demo complete.'));
        console.log(chalk.gray('Tip: open ./data/outputs/automation_showcase/automation_runs_index.json'));
    });

program.parse();
