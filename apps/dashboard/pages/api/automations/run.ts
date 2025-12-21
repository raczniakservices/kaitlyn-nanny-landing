import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { runAutomation, WORKFLOWS } from '../../../../../packages/automation-showcase/src';
import type { AutomationWorkflowId } from '../../../../../packages/automation-showcase/src';

function asWorkflowId(v: unknown): AutomationWorkflowId | null {
    if (typeof v !== 'string') return null;
    const id = v.trim() as AutomationWorkflowId;
    return WORKFLOWS.some(w => w.id === id) ? id : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const workflowId = asWorkflowId(req.query.workflowId ?? req.body?.workflowId);
    if (!workflowId) return res.status(400).json({ error: 'Invalid workflowId' });

    const dryRun =
        typeof req.query.dryRun === 'string'
            ? req.query.dryRun !== '0' && req.query.dryRun.toLowerCase() !== 'false'
            : typeof req.body?.dryRun === 'boolean'
                ? req.body.dryRun
                : true;

    const inputs: Record<string, unknown> = {};
    if (workflowId === 'friction_audit') {
        const url =
            typeof req.body?.url === 'string'
                ? req.body.url
                : typeof req.query.url === 'string'
                    ? req.query.url
                    : typeof req.body?.domain === 'string'
                        ? req.body.domain
                        : typeof req.query.domain === 'string'
                            ? req.query.domain
                            : '';
        if (url) inputs.url = url;
    }

    const outDir = path.resolve(process.cwd(), '../../data/outputs/automation_showcase');
    const result = await runAutomation({ workflowId, dryRun, outDir, inputs });

    return res.status(200).json({
        ok: true,
        run: result.run,
        runDir: result.runDir
    });
}


