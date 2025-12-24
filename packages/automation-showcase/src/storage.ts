import fs from 'fs/promises';
import path from 'path';
import { AutomationRun } from './types';
import { safeJson } from './utils';

export type AutomationIndexEntry = Pick<
    AutomationRun,
    'id' | 'workflowId' | 'title' | 'dryRun' | 'startedAt' | 'finishedAt' | 'status'
> & {
    runDir: string; // absolute
};

export type AutomationIndex = {
    updatedAt: string;
    entries: AutomationIndexEntry[];
};

export function resolveOutDir(outDir: string): string {
    // Allow both absolute paths and repo-relative paths.
    if (path.isAbsolute(outDir)) return outDir;
    return path.resolve(process.cwd(), outDir);
}

export async function ensureDir(p: string): Promise<void> {
    await fs.mkdir(p, { recursive: true });
}

export async function writeRun(runDir: string, run: AutomationRun): Promise<void> {
    await ensureDir(runDir);
    await fs.writeFile(path.join(runDir, 'run.json'), safeJson(run), 'utf8');
}

export async function writeArtifact(runDir: string, relPath: string, content: string): Promise<void> {
    const fullPath = path.join(runDir, relPath);
    await ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content, 'utf8');
}

export async function readIndex(outDir: string): Promise<AutomationIndex> {
    const indexPath = path.join(outDir, 'automation_runs_index.json');
    try {
        const raw = await fs.readFile(indexPath, 'utf8');
        const parsed = JSON.parse(raw) as AutomationIndex;
        return parsed;
    } catch {
        return { updatedAt: new Date().toISOString(), entries: [] };
    }
}

export async function writeIndex(outDir: string, index: AutomationIndex): Promise<void> {
    const indexPath = path.join(outDir, 'automation_runs_index.json');
    await ensureDir(outDir);
    await fs.writeFile(indexPath, safeJson(index), 'utf8');
}

export async function addToIndex(outDir: string, entry: AutomationIndexEntry): Promise<void> {
    const current = await readIndex(outDir);
    const entries = [entry, ...current.entries]
        // de-dupe by id
        .filter((e, i, arr) => arr.findIndex(x => x.id === e.id) === i)
        .slice(0, 50);
    await writeIndex(outDir, { updatedAt: new Date().toISOString(), entries });
}






