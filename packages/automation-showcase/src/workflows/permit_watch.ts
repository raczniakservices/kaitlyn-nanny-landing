import { AutomationArtifact, AutomationStep } from '../types';
import { isoNow, shortId, sleep, safeJson } from '../utils';

type Params = {
    dryRun: boolean;
    inputs?: Record<string, unknown>;
};

export async function runPermitWatcher(params: Params): Promise<{
    title: string;
    steps: AutomationStep[];
    artifacts: { artifact: AutomationArtifact; content: string }[];
    stats: Record<string, number>;
}> {
    const { dryRun } = params;

    const steps: AutomationStep[] = [];
    const artifacts: { artifact: AutomationArtifact; content: string }[] = [];

    // Step 1: Fetch permits (mock)
    const start1 = isoNow();
    await sleep(160);
    const permits = Array.from({ length: 12 }).map((_, idx) => ({
        permitId: `MD-HAR-${String(12000 + idx)}`,
        issuedDate: new Date(Date.now() - idx * 3600_000).toISOString(),
        county: 'Harford County, MD',
        type: idx % 3 === 0 ? 'Roof Replacement' : idx % 3 === 1 ? 'HVAC Install' : 'Siding',
        contractor: idx % 2 === 0 ? 'Summit Roofing Co' : 'Blue Ridge HVAC LLC',
        address: `${100 + idx} Main St, Bel Air, MD`
    }));
    steps.push({
        id: shortId('step'),
        name: 'Fetch new permits',
        startedAt: start1,
        finishedAt: isoNow(),
        status: 'success',
        summary: `Fetched ${permits.length} permits (mock feed)`,
        data: { count: permits.length, county: 'Harford County, MD' }
    });

    artifacts.push({
        artifact: {
            name: 'permits_fetched.json',
            type: 'json',
            relPath: 'artifacts/permits_fetched.json',
            summary: 'Fetched permit items (demo)'
        },
        content: safeJson({ permits })
    });

    // Step 2: Score for high-intent + new contractors
    const start2 = isoNow();
    await sleep(170);
    const candidates = permits
        .map(p => ({
            ...p,
            intentScore: p.type.includes('Roof') ? 93 : p.type.includes('HVAC') ? 88 : 75,
            why: p.type.includes('Roof')
                ? 'Roof job = high ticket, fast decision window'
                : p.type.includes('HVAC')
                    ? 'HVAC install = urgent replacement cycle'
                    : 'Siding = medium ticket, longer cycle'
        }))
        .filter(p => p.intentScore >= 85);
    steps.push({
        id: shortId('step'),
        name: 'Filter + score high-intent permits',
        startedAt: start2,
        finishedAt: isoNow(),
        status: 'success',
        summary: `Selected ${candidates.length} high-intent candidates`,
        data: { selected: candidates.length }
    });

    // Step 3: Create leads (dry-run)
    const start3 = isoNow();
    await sleep(140);
    const leadCreates = candidates.map(c => ({
        op: 'create_lead_from_permit',
        dryRun,
        permitId: c.permitId,
        contractor: c.contractor,
        niche: c.type.includes('Roof') ? 'roofing' : c.type.includes('HVAC') ? 'hvac' : 'remodeling',
        region: c.county,
        intentScore: c.intentScore
    }));
    steps.push({
        id: shortId('step'),
        name: 'Create leads from permits',
        startedAt: start3,
        finishedAt: isoNow(),
        status: dryRun ? 'skipped' : 'success',
        summary: dryRun ? `Dry-run: would create ${leadCreates.length} leads` : `Created ${leadCreates.length} leads`,
        data: { count: leadCreates.length }
    });

    artifacts.push({
        artifact: {
            name: 'lead_creates.json',
            type: 'json',
            relPath: 'artifacts/lead_creates.json',
            summary: 'Lead creation payloads (demo)'
        },
        content: safeJson({ leadCreates })
    });

    // Step 4: Slack digest preview
    const start4 = isoNow();
    await sleep(120);
    const slackMessage = {
        channel: '#lead-watcher',
        dryRun,
        text: `Daily Permit Watcher: ${candidates.length} high-intent contractors detected in Harford County, MD`,
        blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: `*Daily Permit Watcher*\n*${candidates.length}* high-intent hits` } },
            ...candidates.slice(0, 5).map(c => ({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `• *${c.contractor}* — ${c.type} — intent ${c.intentScore}/100\n_${c.address}_ (${c.permitId})`
                }
            }))
        ]
    };
    steps.push({
        id: shortId('step'),
        name: 'Notify Slack digest',
        startedAt: start4,
        finishedAt: isoNow(),
        status: dryRun ? 'skipped' : 'success',
        summary: dryRun ? 'Dry-run: generated Slack digest preview' : 'Sent Slack digest',
        data: { channel: '#lead-watcher', count: candidates.length }
    });

    artifacts.push({
        artifact: {
            name: 'slack_digest_preview.json',
            type: 'json',
            relPath: 'artifacts/slack_digest_preview.json',
            summary: 'Slack payload preview (demo)'
        },
        content: safeJson(slackMessage)
    });

    return {
        title: 'Daily Permit Watcher → High Intent Digest',
        steps,
        artifacts,
        stats: {
            permits_fetched: permits.length,
            candidates_selected: candidates.length
        }
    };
}







