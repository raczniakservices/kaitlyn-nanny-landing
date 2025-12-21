import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

type ContactMethod = 'facebook' | 'text' | 'email' | 'phone';

type IntakePayload = {
    businessName: string;
    website?: string;
    gbpUrl?: string;
    serviceType: string;
    serviceTypeOther?: string;
    serviceArea: string;
    goals: string[];
    urgency: string;
    currentlyRunningAds: string;
    adPlatforms: string[];
    monthlyAdSpend: string;
    leadTracking: string;
    leadResponseSpeed: string;
    crm: string;
    crmOther?: string;
    averageJobValue: string;
    weeklyCapacity: string;
    financing: string;
    differentiator: string;
    biggestProblem: string;
    contactMethod: ContactMethod;
    facebookUrl?: string;
    facebookName?: string;
    phone?: string;
    email?: string;
    bestTimeToReach?: string;
    optionalUpgrades: string[];
    notes?: string;
    consent: boolean;
    company?: string; // honeypot
};

function asString(v: unknown): string {
    return typeof v === 'string' ? v : '';
}

function isTruthyString(v: unknown): boolean {
    return typeof v === 'string' && v.trim().length > 0;
}

function safeList(v: unknown): string[] {
    if (!Array.isArray(v)) return [];
    return v.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean);
}

function genId(): string {
    return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

    const body = (req.body || {}) as IntakePayload;

    // Honeypot spam check
    if (isTruthyString(body.company)) return res.status(200).json({ ok: true }); // pretend success

    const businessName = asString(body.businessName).trim();
    const serviceType = asString(body.serviceType).trim();
    const serviceArea = asString(body.serviceArea).trim();
    const goals = safeList(body.goals);
    const urgency = asString(body.urgency).trim();
    const contactMethod = asString(body.contactMethod).trim() as ContactMethod;
    const consent = Boolean(body.consent);

    if (!businessName) return res.status(400).json({ ok: false, error: 'Business name required' });
    if (!serviceType) return res.status(400).json({ ok: false, error: 'Service type required' });
    if (serviceType === 'Other (type it)' && !isTruthyString(body.serviceTypeOther)) {
        return res.status(400).json({ ok: false, error: 'Service type (other) required' });
    }
    if (!serviceArea) return res.status(400).json({ ok: false, error: 'Service area required' });
    if (!goals.length) return res.status(400).json({ ok: false, error: 'At least one goal required' });
    if (!urgency) return res.status(400).json({ ok: false, error: 'Urgency required' });
    if (!consent) return res.status(400).json({ ok: false, error: 'Consent required' });

    if (contactMethod === 'facebook') {
        if (!isTruthyString(body.facebookUrl) && !isTruthyString(body.facebookName)) {
            return res.status(400).json({ ok: false, error: 'Facebook URL or name required' });
        }
    }
    if (contactMethod === 'text' || contactMethod === 'phone') {
        if (!isTruthyString(body.phone)) return res.status(400).json({ ok: false, error: 'Phone required' });
    }
    if (contactMethod === 'email') {
        if (!isTruthyString(body.email)) return res.status(400).json({ ok: false, error: 'Email required' });
    }

    const record = {
        id: genId(),
        createdAt: new Date().toISOString(),
        source: 'dashboard_intake',
        businessName,
        website: asString(body.website).trim(),
        gbpUrl: asString(body.gbpUrl).trim(),
        serviceType,
        serviceTypeOther: asString(body.serviceTypeOther).trim(),
        serviceArea,
        goals,
        urgency,
        currentlyRunningAds: asString(body.currentlyRunningAds).trim(),
        adPlatforms: safeList(body.adPlatforms),
        monthlyAdSpend: asString(body.monthlyAdSpend).trim(),
        leadTracking: asString(body.leadTracking).trim(),
        leadResponseSpeed: asString(body.leadResponseSpeed).trim(),
        crm: asString(body.crm).trim(),
        crmOther: asString(body.crmOther).trim(),
        averageJobValue: asString(body.averageJobValue).trim(),
        weeklyCapacity: asString(body.weeklyCapacity).trim(),
        financing: asString(body.financing).trim(),
        differentiator: asString(body.differentiator).trim(),
        biggestProblem: asString(body.biggestProblem).trim(),
        contactMethod,
        facebookUrl: asString(body.facebookUrl).trim(),
        facebookName: asString(body.facebookName).trim(),
        phone: asString(body.phone).trim(),
        email: asString(body.email).trim(),
        bestTimeToReach: asString(body.bestTimeToReach).trim(),
        optionalUpgrades: safeList(body.optionalUpgrades),
        notes: asString(body.notes).trim(),
        consent,
        meta: {
            ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString(),
            userAgent: (req.headers['user-agent'] || '').toString()
        }
    };

    const outDir = path.resolve(process.cwd(), '../../data/outputs');
    const file = path.join(outDir, 'intake_leads.jsonl');
    await fs.mkdir(outDir, { recursive: true });
    await fs.appendFile(file, JSON.stringify(record) + '\n', 'utf8');

    return res.status(200).json({ ok: true, id: record.id });
}


