import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type ContactMethod = 'facebook' | 'text' | 'email' | 'phone';

const SERVICE_TYPES = [
    'Roofing',
    'HVAC (Heating & Air)',
    'Plumbing',
    'Electrical',
    'Garage Door Repair',
    'Appliance Repair',
    'Handyman / General Contractor',
    'Remodeling / Renovation',
    'Kitchen & Bath Remodel',
    'Flooring',
    'Painting',
    'Drywall',
    'Carpentry',
    'Windows & Doors',
    'Siding',
    'Gutters',
    'Masonry / Concrete',
    'Paving / Asphalt',
    'Decks / Fences',
    'Tree Service',
    'Landscaping',
    'Lawn Care',
    'Irrigation / Sprinklers',
    'Pest Control',
    'Pool Service',
    'Pressure Washing',
    'Junk Removal',
    'Cleaning (Residential)',
    'Cleaning (Commercial / Janitorial)',
    'Carpet Cleaning',
    'Restoration (Water/Fire/Mold)',
    'Moving Company',
    'Locksmith',
    'Auto Detailing',
    'Towing',
    'Photography (Local services)',
    'Other (type it)'
] as const;

const OPTIONAL_UPGRADES = [
    { id: 'gbp', label: 'Google Business Profile setup/optimization' },
    { id: 'google_ads', label: 'Google Ads setup + management' },
    { id: 'tracking', label: 'Tracking (call tracking + conversions)' },
    { id: 'landing_page', label: 'Landing page (optional, if your site does not convert)' },
    { id: 'not_sure', label: 'Not sure - recommend the best path' }
] as const;

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
    // anti-spam
    company?: string; // honeypot
};

function isUrlLike(s: string): boolean {
    const v = (s || '').trim();
    if (!v) return true;
    try {
        new URL(v.startsWith('http') ? v : `https://${v}`);
        return true;
    } catch {
        return false;
    }
}

export default function IntakePage() {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string>('');

    const [form, setForm] = useState<IntakePayload>({
        businessName: '',
        website: '',
        gbpUrl: '',
        serviceType: 'Roofing',
        serviceTypeOther: '',
        serviceArea: 'Baltimore Metro (City + County)',
        goals: ['More calls'],
        urgency: 'ASAP (this week)',
        currentlyRunningAds: 'No',
        adPlatforms: [],
        monthlyAdSpend: '$0–$300',
        leadTracking: 'We don’t know',
        leadResponseSpeed: 'Same day',
        crm: 'No / Not sure',
        crmOther: '',
        averageJobValue: '$750–$2,500',
        weeklyCapacity: '4–10',
        financing: 'No',
        differentiator: '',
        biggestProblem: '',
        contactMethod: 'facebook',
        facebookUrl: '',
        facebookName: '',
        phone: '',
        email: '',
        bestTimeToReach: 'Weekdays 9am–5pm',
        optionalUpgrades: ['not_sure'],
        notes: '',
        consent: false,
        company: ''
    });

    const progress = useMemo(() => Math.round((step / 4) * 100), [step]);

    function update<K extends keyof IntakePayload>(key: K, value: IntakePayload[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function toggleInList(key: keyof IntakePayload, value: string) {
        setForm(prev => {
            const list = (prev[key] as any as string[]) || [];
            const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
            return { ...prev, [key]: next } as IntakePayload;
        });
    }

    function validateStep(currentStep: number): string {
        if (form.company && form.company.trim()) return 'Spam check failed.';

        if (currentStep === 1) {
            if (!form.businessName.trim()) return 'Business name is required.';
            if (!form.serviceType.trim()) return 'Service type is required.';
            if (form.serviceType === 'Other (type it)' && !form.serviceTypeOther?.trim()) return 'Please type your service.';
            if (form.website && !isUrlLike(form.website)) return 'Website URL looks invalid.';
            if (form.gbpUrl && !isUrlLike(form.gbpUrl)) return 'Google Business Profile URL looks invalid.';
            return '';
        }

        if (currentStep === 2) {
            if (!form.serviceArea.trim()) return 'Service area is required.';
            if (!form.goals.length) return 'Select at least one goal.';
            if (!form.urgency.trim()) return 'Urgency is required.';
            return '';
        }

        if (currentStep === 3) {
            if (form.contactMethod === 'facebook') {
                if (!form.facebookUrl?.trim() && !form.facebookName?.trim()) return 'Provide your Facebook Page URL or Facebook name.';
            }
            if (form.contactMethod === 'text' || form.contactMethod === 'phone') {
                if (!form.phone?.trim()) return 'Phone number is required for text/phone.';
            }
            if (form.contactMethod === 'email') {
                if (!form.email?.trim()) return 'Email is required for email contact.';
            }
            if (!form.consent) return 'Please check the consent box so we can reach out.';
            return '';
        }

        if (currentStep === 4) {
            // Optional step; but enforce at least one upgrade selection
            if (!form.optionalUpgrades.length) return 'Select at least one option (or “Not sure”).';
            return '';
        }

        return '';
    }

    async function next() {
        const msg = validateStep(step);
        if (msg) {
            setError(msg);
            return;
        }
        setError('');
        setStep(s => Math.min(4, s + 1));
    }

    function back() {
        setError('');
        setStep(s => Math.max(1, s - 1));
    }

    async function submit() {
        const msg = validateStep(1) || validateStep(2) || validateStep(3) || validateStep(4);
        if (msg) {
            setError(msg);
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/intake/submit', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(form)
            });
            const json = (await res.json().catch(() => ({}))) as any;
            if (!res.ok || !json.ok) throw new Error(json.error || 'Submission failed');
            setDone(true);
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setSubmitting(false);
        }
    }

    if (done) {
        return (
            <div className="min-h-screen bg-ink-950 text-white">
                <div className="absolute inset-0 bg-hero-radial" />
                <div className="absolute inset-0 opacity-[0.18] [background-size:28px_28px] bg-grid-fade" />
                <div className="relative mx-auto max-w-3xl px-6 py-14">
                    <div className="flex items-center justify-between gap-4">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                <Image src="/brand/profile-avatar.png" alt="Raczniak Automations" fill priority />
                            </div>
                            <div>
                                <div className="text-sm font-extrabold">Raczniak Automations</div>
                                <div className="text-xs font-bold text-white/60">Free audit intake</div>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4 text-xs font-extrabold text-white/60">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <Link href="/automations" className="hover:text-white">Demos</Link>
                        </div>
                    </div>

                    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-soft backdrop-blur">
                        <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">SUBMITTED</div>
                        <div className="mt-2 text-2xl font-extrabold tracking-tight">You’re in.</div>
                        <div className="mt-3 text-sm leading-relaxed text-white/70">
                            We’ll review your answers and send a tailored plan. If you chose Facebook, we’ll message your page first.
                        </div>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center rounded-2xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400"
                            >
                                Back to home
                            </Link>
                            <Link
                                href="/leads"
                                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-extrabold text-white hover:bg-white/10"
                            >
                                Leads inbox (internal)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Free Growth Audit Intake - Raczniak Automations</title>
                <meta name="description" content="Answer a few questions and we’ll send a tailored plan to get more booked jobs (GBP, ads, landing page, tracking, automations)." />
            </Head>

            <div className="min-h-screen bg-ink-950 text-white">
                <div className="absolute inset-0 bg-hero-radial" />
                <div className="absolute inset-0 opacity-[0.18] [background-size:28px_28px] bg-grid-fade" />

                <div className="relative mx-auto max-w-6xl px-6 py-10">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                <Image src="/brand/profile-avatar.png" alt="Raczniak Automations" fill priority />
                            </div>
                            <div>
                                <div className="text-sm font-extrabold tracking-tight">Raczniak Automations</div>
                                <div className="text-xs font-bold text-white/60">Free audit intake</div>
                            </div>
                        </Link>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-extrabold text-white/60">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <Link href="/automations" className="hover:text-white">Demos</Link>
                            <Link href="/leads" className="hover:text-white">Leads (internal)</Link>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start">
                        <div>
                            <div className="text-xs font-extrabold tracking-[0.22em] text-brand-200/80">BALTIMORE SERVICE BUSINESS GROWTH</div>
                            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                                Get a tailored plan to increase booked jobs (with optional upgrades)
                            </h1>
                            <p className="mt-4 text-sm leading-relaxed text-white/70">
                                Answer a few questions so we can recommend the fastest path to more leads.
                                <span className="font-extrabold text-white"> Facebook-first outreach</span> is the default option.
                            </p>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-soft backdrop-blur">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-extrabold">Step {step} of 4</div>
                                    <div className="text-xs font-extrabold text-white/70">{progress}%</div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                                    <div className="h-full bg-brand-400" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
                                {error ? (
                                    <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-100">
                                        {error}
                                    </div>
                                ) : null}

                                {step === 1 ? (
                                    <>
                                        <h2 className="text-base font-extrabold">Your business</h2>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Business name *">
                                                <input className={inputClass} value={form.businessName} onChange={(e) => update('businessName', e.currentTarget.value)} placeholder="e.g., Summit Roofing" />
                                            </Field>
                                            <Field label="Service type *">
                                                <select className={inputClass} value={form.serviceType} onChange={(e) => update('serviceType', e.currentTarget.value)}>
                                                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        {form.serviceType === 'Other (type it)' ? (
                                            <Field label="Type your service *">
                                                <input className={inputClass} value={form.serviceTypeOther} onChange={(e) => update('serviceTypeOther', e.currentTarget.value)} placeholder="What do you do?" />
                                            </Field>
                                        ) : null}

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Website (optional)">
                                                <input className={inputClass} value={form.website} onChange={(e) => update('website', e.currentTarget.value)} placeholder="https://yourwebsite.com" />
                                            </Field>
                                            <Field label="Google Business Profile link (optional)">
                                                <input className={inputClass} value={form.gbpUrl} onChange={(e) => update('gbpUrl', e.currentTarget.value)} placeholder="Paste your GBP link (if you have one)" />
                                            </Field>
                                        </div>

                                        {/* Honeypot */}
                                        <div style={{ display: 'none' }}>
                                            <label>Company</label>
                                            <input value={form.company} onChange={(e) => update('company', e.currentTarget.value)} />
                                        </div>
                                    </>
                                ) : null}

                                {step === 2 ? (
                                    <>
                                        <h2 className="text-base font-extrabold">Goals + setup</h2>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Service area *">
                                                <select className={inputClass} value={form.serviceArea} onChange={(e) => update('serviceArea', e.currentTarget.value)}>
                                                    {[
                                                        'Baltimore Metro (City + County)',
                                                        'Baltimore City',
                                                        'Baltimore County',
                                                        'Anne Arundel County',
                                                        'Howard County',
                                                        'Harford County',
                                                        'Multiple counties',
                                                        'Other (type it)'
                                                    ].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Urgency *">
                                                <select className={inputClass} value={form.urgency} onChange={(e) => update('urgency', e.currentTarget.value)}>
                                                    {['ASAP (this week)', '2–4 weeks', '1–3 months', 'Just planning'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                        </div>

                                        <Field label="What are you trying to achieve? (pick all that apply) *">
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {[
                                                    'More calls',
                                                    'More quote requests',
                                                    'More booked appointments',
                                                    'Higher-ticket jobs only',
                                                    'Fill schedule next 2 weeks',
                                                    'Expand to new areas',
                                                ].map(v => (
                                                    <Chip key={v} active={form.goals.includes(v)} onClick={() => toggleInList('goals', v)} label={v} />
                                                ))}
                                            </div>
                                        </Field>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Currently running ads?">
                                                <select className={inputClass} value={form.currentlyRunningAds} onChange={(e) => update('currentlyRunningAds', e.currentTarget.value)}>
                                                    {['No', 'Yes', 'Not sure'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Monthly ad spend (estimate)">
                                                <select className={inputClass} value={form.monthlyAdSpend} onChange={(e) => update('monthlyAdSpend', e.currentTarget.value)}>
                                                    {['$0–$300', '$300–$1k', '$1k–$3k', '$3k–$10k', '$10k+'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                        </div>

                                        <Field label="If yes, where? (optional)">
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {['Google Search', 'Google LSA', 'Facebook/Instagram', 'Yelp', 'Other'].map(v => (
                                                    <Chip key={v} active={form.adPlatforms.includes(v)} onClick={() => toggleInList('adPlatforms', v)} label={v} />
                                                ))}
                                            </div>
                                        </Field>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Do you track leads today?">
                                                <select className={inputClass} value={form.leadTracking} onChange={(e) => update('leadTracking', e.currentTarget.value)}>
                                                    {['Not really', 'Calls only', 'Forms only', 'Calls + forms', 'We don’t know'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="How fast do you respond to leads?">
                                                <select className={inputClass} value={form.leadResponseSpeed} onChange={(e) => update('leadResponseSpeed', e.currentTarget.value)}>
                                                    {['We answer immediately', 'Call back within 1 hour', 'Same day', 'Next day+'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                    </>
                                ) : null}

                                {step === 3 ? (
                                    <>
                                        <h2 className="text-base font-extrabold">Capacity + contact (Facebook-first)</h2>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Average job value">
                                                <select className={inputClass} value={form.averageJobValue} onChange={(e) => update('averageJobValue', e.currentTarget.value)}>
                                                    {['<$250', '$250–$750', '$750–$2,500', '$2,500–$10k', '$10k+'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="New jobs you can handle per week">
                                                <select className={inputClass} value={form.weeklyCapacity} onChange={(e) => update('weeklyCapacity', e.currentTarget.value)}>
                                                    {['1–3', '4–10', '10–25', '25+'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                        </div>

                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <Field label="Do you offer financing / payment plans?">
                                                <select className={inputClass} value={form.financing} onChange={(e) => update('financing', e.currentTarget.value)}>
                                                    {['No', 'Yes', 'Not sure'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="CRM (optional)">
                                                <select className={inputClass} value={form.crm} onChange={(e) => update('crm', e.currentTarget.value)}>
                                                    {['No / Not sure', 'Jobber', 'ServiceTitan', 'Housecall Pro', 'HubSpot', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        {form.crm === 'Other' ? (
                                            <Field label="CRM name (optional)">
                                                <input className={inputClass} value={form.crmOther} onChange={(e) => update('crmOther', e.currentTarget.value)} placeholder="Type your CRM" />
                                            </Field>
                                        ) : null}

                                        <Field label="What makes you better than competitors? (optional)">
                                            <input className={inputClass} value={form.differentiator} onChange={(e) => update('differentiator', e.currentTarget.value)} placeholder="e.g., same-day service, warranty, best reviews, 24/7" />
                                        </Field>

                                        <Field label="Biggest problem right now (optional)">
                                            <input className={inputClass} value={form.biggestProblem} onChange={(e) => update('biggestProblem', e.currentTarget.value)} placeholder="e.g., not enough calls, price shoppers, slow season, low close rate" />
                                        </Field>

                                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                                            <div className="text-sm font-extrabold">Best way to contact you *</div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Pill active={form.contactMethod === 'facebook'} onClick={() => update('contactMethod', 'facebook')} label="Facebook message" />
                                                <Pill active={form.contactMethod === 'text'} onClick={() => update('contactMethod', 'text')} label="Text" />
                                                <Pill active={form.contactMethod === 'email'} onClick={() => update('contactMethod', 'email')} label="Email" />
                                                <Pill active={form.contactMethod === 'phone'} onClick={() => update('contactMethod', 'phone')} label="Phone call" />
                                            </div>

                                            <div className="mt-4">
                                                {form.contactMethod === 'facebook' ? (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <Field label="Facebook Page URL (preferred)">
                                                            <input className={inputClass} value={form.facebookUrl} onChange={(e) => update('facebookUrl', e.currentTarget.value)} placeholder="https://facebook.com/yourpage" />
                                                        </Field>
                                                        <Field label="Facebook name (backup)">
                                                            <input className={inputClass} value={form.facebookName} onChange={(e) => update('facebookName', e.currentTarget.value)} placeholder="Exact page name" />
                                                        </Field>
                                                    </div>
                                                ) : null}
                                                {form.contactMethod === 'text' || form.contactMethod === 'phone' ? (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <Field label="Phone *">
                                                            <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.currentTarget.value)} placeholder="Your best number" />
                                                        </Field>
                                                        <Field label="Best time to reach you">
                                                            <input className={inputClass} value={form.bestTimeToReach} onChange={(e) => update('bestTimeToReach', e.currentTarget.value)} placeholder="e.g., weekdays after 5pm" />
                                                        </Field>
                                                    </div>
                                                ) : null}
                                                {form.contactMethod === 'email' ? (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <Field label="Email *">
                                                            <input className={inputClass} value={form.email} onChange={(e) => update('email', e.currentTarget.value)} placeholder="you@company.com" />
                                                        </Field>
                                                        <Field label="Best time to reach you">
                                                            <input className={inputClass} value={form.bestTimeToReach} onChange={(e) => update('bestTimeToReach', e.currentTarget.value)} placeholder="e.g., weekdays after 5pm" />
                                                        </Field>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <label className="mt-4 flex gap-3 text-sm text-white/70">
                                                <input className="mt-1 h-4 w-4 accent-brand-500" type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.currentTarget.checked)} />
                                                <div className="leading-relaxed">
                                                    I agree you can contact me about this request (Facebook/message/text/call/email).
                                                </div>
                                            </label>
                                        </div>
                                    </>
                                ) : null}

                                {step === 4 ? (
                                    <>
                                        <h2 className="text-base font-extrabold">Optional upgrades (choose what you want)</h2>
                                        <div className="mt-2 text-sm text-white/70">
                                            These are optional. You can pick one, or choose “Not sure” and we’ll recommend the best path.
                                        </div>
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            {OPTIONAL_UPGRADES.map(o => (
                                                <label key={o.id} className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 h-4 w-4 accent-brand-500"
                                                        checked={form.optionalUpgrades.includes(o.id)}
                                                        onChange={() => toggleInList('optionalUpgrades', o.id)}
                                                    />
                                                    <span className="font-extrabold">{o.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <Field label="Anything else we should know? (optional)">
                                                <textarea className={`${inputClass} h-28`} value={form.notes} onChange={(e) => update('notes', e.currentTarget.value)} placeholder="Links, competitors, goals, constraints, etc." />
                                            </Field>
                                        </div>
                                    </>
                                ) : null}

                                <div className="mt-6 flex items-center justify-between gap-3">
                                    <button
                                        onClick={back}
                                        disabled={step === 1 || submitting}
                                        className="inline-flex min-w-[140px] items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 disabled:opacity-40"
                                    >
                                        Back
                                    </button>
                                    {step < 4 ? (
                                        <button
                                            onClick={next}
                                            disabled={submitting}
                                            className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400 disabled:opacity-40"
                                        >
                                            Continue →
                                        </button>
                                    ) : (
                                        <button
                                            onClick={submit}
                                            disabled={submitting}
                                            className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-sm font-extrabold text-black shadow-glow hover:bg-brand-400 disabled:opacity-40"
                                        >
                                            {submitting ? 'Submitting…' : 'Submit'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
                                <div className="text-base font-extrabold">What happens after you submit</div>
                                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
                                    <li>We review your answers + quick-scan your online presence.</li>
                                    <li>You get a tailored plan + fastest wins.</li>
                                <li>Upgrades are optional - pick what you want.</li>
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur">
                                <div className="text-base font-extrabold">What we’re best at</div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <MiniCard title="Lead capture" body="High-converting forms + call flows that qualify leads." />
                                    <MiniCard title="Tracking" body="GTM/GA/Ads conversions so you know what’s working." />
                                    <MiniCard title="Ads" body="Search + Facebook built for booked jobs (not vanity metrics)." />
                                    <MiniCard title="Automation" body="Missed-call text-back + follow-ups so leads don’t leak." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({ label, children }: { label: string; children: any }) {
    return (
        <div className="mt-4">
            <div className="mb-2 text-xs font-extrabold tracking-wide text-white/60">{label}</div>
            {children}
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full border px-3 py-2 text-xs font-extrabold',
                active ? 'border-brand-400 bg-brand-500/15 text-white' : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
            ].join(' ')}
        >
            {label}
        </button>
    );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full border px-4 py-2 text-xs font-extrabold',
                active ? 'border-white/30 bg-white text-black' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
            ].join(' ')}
        >
            {label}
        </button>
    );
}

function MiniCard({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-extrabold text-white">{title}</div>
            <div className="mt-2 text-sm leading-relaxed text-white/70">{body}</div>
        </div>
    );
}

const inputClass =
    'w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30';


