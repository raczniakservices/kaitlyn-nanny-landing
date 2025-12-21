import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { readIndex } from '../../../../../packages/automation-showcase/src';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    const outDir = path.resolve(process.cwd(), '../../data/outputs/automation_showcase');
    const index = await readIndex(outDir);
    return res.status(200).json({ ok: true, index });
}


