import crypto from 'crypto';

export function isoNow(): string {
    return new Date().toISOString();
}

export function shortId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function safeJson<T>(value: T): string {
    return JSON.stringify(value, null, 2);
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}






