import path from 'path';
import { AutomationRun, AutomationWorkflowId, RunAutomationParams, RunAutomationResult, WorkflowDefinition } from './types';
import { isoNow, shortId } from './utils';
import { addToIndex, resolveOutDir, writeArtifact, writeRun } from './storage';
import { runLeadWelcomeSequence } from './workflows/lead_welcome';
import { runPermitWatcher } from './workflows/permit_watch';
import { runFrictionAudit } from './workflows/friction_audit';

export const WORKFLOWS: WorkflowDefinition[] = [
    {
        id: 'lead_welcome',
        title: 'Lead Intake → Enrichment → Notifications',
        tagline: 'Looks like a real CRM/notification pipeline, but stays demo-safe.'
    },
    {
        id: 'permit_watch',
        title: 'Daily Permit Watcher → Slack Digest',
        tagline: 'Fake “new permits” feed → scoring → digest message preview.'
    },
    {
        id: 'friction_audit',
        title: 'Website Friction Audit → Client Report',
        tagline: 'Mock crawl signals → friction score → polished HTML report.'
    }
];

function workflowTitle(id: AutomationWorkflowId): string {
    return WORKFLOWS.find(w => w.id === id)?.title ?? id;
}

export async function runAutomation(params: RunAutomationParams): Promise<RunAutomationResult> {
    const outDir = resolveOutDir(params.outDir);
    const dryRun = params.dryRun ?? true;

    const runId = shortId('run');
    const startedAt = isoNow();

    const runDir = path.join(
        outDir,
        'automation_runs',
        `${startedAt.replaceAll(':', '').replaceAll('.', '')}_${params.workflowId}_${runId}`
    );

    let run: AutomationRun = {
        id: runId,
        workflowId: params.workflowId,
        title: workflowTitle(params.workflowId),
        dryRun,
        startedAt,
        finishedAt: startedAt,
        status: 'success',
        steps: [],
        artifacts: [],
        stats: {}
    };

    try {
        if (params.workflowId === 'lead_welcome') {
            const res = await runLeadWelcomeSequence({ dryRun, inputs: params.inputs });
            run = { ...run, title: res.title, steps: res.steps, artifacts: res.artifacts.map(a => a.artifact), stats: res.stats };
            for (const a of res.artifacts) await writeArtifact(runDir, a.artifact.relPath, a.content);
        } else if (params.workflowId === 'permit_watch') {
            const res = await runPermitWatcher({ dryRun, inputs: params.inputs });
            run = { ...run, title: res.title, steps: res.steps, artifacts: res.artifacts.map(a => a.artifact), stats: res.stats };
            for (const a of res.artifacts) await writeArtifact(runDir, a.artifact.relPath, a.content);
        } else if (params.workflowId === 'friction_audit') {
            const res = await runFrictionAudit({ dryRun, inputs: params.inputs });
            run = { ...run, title: res.title, steps: res.steps, artifacts: res.artifacts.map(a => a.artifact), stats: res.stats };
            for (const a of res.artifacts) await writeArtifact(runDir, a.artifact.relPath, a.content);
        } else {
            throw new Error(`Unknown workflowId: ${params.workflowId}`);
        }

        run.finishedAt = isoNow();
        run.status = 'success';
    } catch (err) {
        run.finishedAt = isoNow();
        run.status = 'failed';
        run.steps.push({
            id: shortId('step'),
            name: 'Unhandled error',
            startedAt: run.finishedAt,
            finishedAt: run.finishedAt,
            status: 'failed',
            summary: String(err),
            data: { error: String(err) }
        });
    }

    await writeRun(runDir, run);
    await addToIndex(outDir, {
        id: run.id,
        workflowId: run.workflowId,
        title: run.title,
        dryRun: run.dryRun,
        startedAt: run.startedAt,
        finishedAt: run.finishedAt,
        status: run.status,
        runDir
    });

    return { run, runDir };
}







