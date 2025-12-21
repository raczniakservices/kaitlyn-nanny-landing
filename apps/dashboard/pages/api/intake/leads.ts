import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Lead = Record<string, any>;

function readJsonl(filePath: string, limit: number): Lead[] {
    if (!fs.existsSync(filePath)) return [];
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const out: Lead[] = [];
    for (let i = lines.length - 1; i >= 0; i--) {
        try {
            out.push(JSON.parse(lines[i]));
        } catch { }
        if (out.length >= limit) break;
    }
    return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const outDir = path.resolve(process.cwd(), '../../data/outputs');
    const file = path.join(outDir, 'intake_leads.jsonl');
    const limit = Math.min(1000, Math.max(1, parseInt(String(req.query.limit || '250'), 10) || 250));

    const leads = readJsonl(file, limit);
    return res.status(200).json({ ok: true, leads });
}


