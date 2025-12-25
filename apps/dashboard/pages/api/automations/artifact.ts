import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';
import { readIndex } from '../../../../../packages/automation-showcase/src';

function safeRelPath(p: string): string | null {
    const cleaned = p.replaceAll('\\', '/').replaceAll('\u0000', '').trim();
    if (!cleaned) return null;
    if (cleaned.includes('..')) return null;
    if (!cleaned.startsWith('artifacts/')) return null;
    return cleaned;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const runId = typeof req.query.runId === 'string' ? req.query.runId : '';
    const relPath = typeof req.query.path === 'string' ? safeRelPath(req.query.path) : null;
    if (!runId || !relPath) return res.status(400).send('Invalid params');

    const outDir = path.resolve(process.cwd(), '../../data/outputs/automation_showcase');
    const index = await readIndex(outDir);
    const entry = index.entries.find(e => e.id === runId);
    if (!entry) return res.status(404).send('Run not found');

    const fullPath = path.join(entry.runDir, relPath);
    const content = await fs.readFile(fullPath);

    if (relPath.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
    else if (relPath.endsWith('.json')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
    else res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    return res.status(200).send(content);
}







