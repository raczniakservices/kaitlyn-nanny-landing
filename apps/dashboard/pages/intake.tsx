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
    { id: 'meta_ads', label: 'Facebook/Instagram ads' },
    { id: 'landing_page', label: 'Landing page build (high-converting)' },
    { id: 'tracking', label: 'Tracking (GTM/GA/Conversions/Call tracking)' },
    { id: 'automations', label: 'Automations (missed-call text-back, follow-up, reviews)' },
    { id: 'website_fixes', label: 'Website fixes (speed/mobile/CTA/form simplification)' },
    { id: 'not_sure', label: 'Not sure — recommend the best path' }
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
            <div style={pageWrap}>
                <div style={card}>
                    <div style={{ fontWeight: 900, fontSize: 22 }}>Submitted — you’re in.</div>
                    <div style={{ color: '#6b7280', marginTop: 8, lineHeight: 1.5 }}>
                        We’ll review your answers and send a tailored plan. If you chose Facebook, we’ll message your page first.
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <a href="/" style={{ color: '#2563eb', fontWeight: 800 }}>← Back to dashboard</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageWrap}>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 800, letterSpacing: 0.3 }}>BALTIMORE SERVICE BUSINESS GROWTH</div>
                        <h1 style={{ margin: '6px 0 0', fontSize: 34, lineHeight: 1.05 }}>
                            Get a tailored growth plan + optional upgrades (ads, landing page, tracking, automation)
                        </h1>
                        <div style={{ color: '#374151', marginTop: 10, lineHeight: 1.45 }}>
                            Answer a few questions. This lets us recommend the fastest path to more booked jobs.
                            <span style={{ fontWeight: 800 }}> Facebook-first outreach</span> by default.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <a href="/" style={{ color: '#2563eb', fontWeight: 800 }}>← Dashboard</a>
                        <a href="/leads" style={{ color: '#111827', fontWeight: 800 }}>Leads inbox</a>
                    </div>
                </div>

                <div style={{ marginTop: 18, background: '#eef2ff', borderRadius: 14, border: '1px solid #c7d2fe', padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>Step {step} of 4</div>
                        <div style={{ color: '#4b5563', fontWeight: 800 }}>{progress}%</div>
                    </div>
                    <div style={{ height: 10, background: '#e5e7eb', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb' }} />
                    </div>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 14, alignItems: 'start' }}>
                    <div style={card}>
                        {error ? <div style={errorBox}>{error}</div> : null}

                        {step === 1 ? (
                            <>
                                <h2 style={h2}>Your business</h2>
                                <div style={grid2}>
                                    <Field label="Business name *">
                                        <input style={input} value={form.businessName} onChange={(e) => update('businessName', e.currentTarget.value)} placeholder="e.g., Summit Roofing" />
                                    </Field>
                                    <Field label="Service type *">
                                        <select style={input} value={form.serviceType} onChange={(e) => update('serviceType', e.currentTarget.value)}>
                                            {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                {form.serviceType === 'Other (type it)' ? (
                                    <Field label="Type your service *">
                                        <input style={input} value={form.serviceTypeOther} onChange={(e) => update('serviceTypeOther', e.currentTarget.value)} placeholder="What do you do?" />
                                    </Field>
                                ) : null}

                                <div style={grid2}>
                                    <Field label="Website (optional)">
                                        <input style={input} value={form.website} onChange={(e) => update('website', e.currentTarget.value)} placeholder="https://yourwebsite.com" />
                                    </Field>
                                    <Field label="Google Business Profile link (optional)">
                                        <input style={input} value={form.gbpUrl} onChange={(e) => update('gbpUrl', e.currentTarget.value)} placeholder="Paste your GBP link (if you have one)" />
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
                                <h2 style={h2}>Goals + setup</h2>
                                <div style={grid2}>
                                    <Field label="Service area *">
                                        <select style={input} value={form.serviceArea} onChange={(e) => update('serviceArea', e.currentTarget.value)}>
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
                                        <select style={input} value={form.urgency} onChange={(e) => update('urgency', e.currentTarget.value)}>
                                            {['ASAP (this week)', '2–4 weeks', '1–3 months', 'Just planning'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                <Field label="What are you trying to achieve? (pick all that apply) *">
                                    <div style={chipsWrap}>
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

                                <div style={grid2}>
                                    <Field label="Currently running ads?">
                                        <select style={input} value={form.currentlyRunningAds} onChange={(e) => update('currentlyRunningAds', e.currentTarget.value)}>
                                            {['No', 'Yes', 'Not sure'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Monthly ad spend (estimate)">
                                        <select style={input} value={form.monthlyAdSpend} onChange={(e) => update('monthlyAdSpend', e.currentTarget.value)}>
                                            {['$0–$300', '$300–$1k', '$1k–$3k', '$3k–$10k', '$10k+'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                <Field label="If yes, where? (optional)">
                                    <div style={chipsWrap}>
                                        {['Google Search', 'Google LSA', 'Facebook/Instagram', 'Yelp', 'Other'].map(v => (
                                            <Chip key={v} active={form.adPlatforms.includes(v)} onClick={() => toggleInList('adPlatforms', v)} label={v} />
                                        ))}
                                    </div>
                                </Field>

                                <div style={grid2}>
                                    <Field label="Do you track leads today?">
                                        <select style={input} value={form.leadTracking} onChange={(e) => update('leadTracking', e.currentTarget.value)}>
                                            {['Not really', 'Calls only', 'Forms only', 'Calls + forms', 'We don’t know'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="How fast do you respond to leads?">
                                        <select style={input} value={form.leadResponseSpeed} onChange={(e) => update('leadResponseSpeed', e.currentTarget.value)}>
                                            {['We answer immediately', 'Call back within 1 hour', 'Same day', 'Next day+'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </>
                        ) : null}

                        {step === 3 ? (
                            <>
                                <h2 style={h2}>Capacity + contact (Facebook-first)</h2>
                                <div style={grid2}>
                                    <Field label="Average job value">
                                        <select style={input} value={form.averageJobValue} onChange={(e) => update('averageJobValue', e.currentTarget.value)}>
                                            {['<$250', '$250–$750', '$750–$2,500', '$2,500–$10k', '$10k+'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="New jobs you can handle per week">
                                        <select style={input} value={form.weeklyCapacity} onChange={(e) => update('weeklyCapacity', e.currentTarget.value)}>
                                            {['1–3', '4–10', '10–25', '25+'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                <div style={grid2}>
                                    <Field label="Do you offer financing / payment plans?">
                                        <select style={input} value={form.financing} onChange={(e) => update('financing', e.currentTarget.value)}>
                                            {['No', 'Yes', 'Not sure'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="CRM (optional)">
                                        <select style={input} value={form.crm} onChange={(e) => update('crm', e.currentTarget.value)}>
                                            {['No / Not sure', 'Jobber', 'ServiceTitan', 'Housecall Pro', 'HubSpot', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                {form.crm === 'Other' ? (
                                    <Field label="CRM name (optional)">
                                        <input style={input} value={form.crmOther} onChange={(e) => update('crmOther', e.currentTarget.value)} placeholder="Type your CRM" />
                                    </Field>
                                ) : null}

                                <Field label="What makes you better than competitors? (optional)">
                                    <input style={input} value={form.differentiator} onChange={(e) => update('differentiator', e.currentTarget.value)} placeholder="e.g., same-day service, warranty, best reviews, 24/7" />
                                </Field>

                                <Field label="Biggest problem right now (optional)">
                                    <input style={input} value={form.biggestProblem} onChange={(e) => update('biggestProblem', e.currentTarget.value)} placeholder="e.g., not enough calls, price shoppers, slow season, low close rate" />
                                </Field>

                                <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid #e5e7eb', background: '#fafafa' }}>
                                    <div style={{ fontWeight: 900 }}>Best way to contact you *</div>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                        <Pill active={form.contactMethod === 'facebook'} onClick={() => update('contactMethod', 'facebook')} label="Facebook message" />
                                        <Pill active={form.contactMethod === 'text'} onClick={() => update('contactMethod', 'text')} label="Text" />
                                        <Pill active={form.contactMethod === 'email'} onClick={() => update('contactMethod', 'email')} label="Email" />
                                        <Pill active={form.contactMethod === 'phone'} onClick={() => update('contactMethod', 'phone')} label="Phone call" />
                                    </div>

                                    <div style={{ marginTop: 12 }}>
                                        {form.contactMethod === 'facebook' ? (
                                            <div style={grid2}>
                                                <Field label="Facebook Page URL (preferred)">
                                                    <input style={input} value={form.facebookUrl} onChange={(e) => update('facebookUrl', e.currentTarget.value)} placeholder="https://facebook.com/yourpage" />
                                                </Field>
                                                <Field label="Facebook name (backup)">
                                                    <input style={input} value={form.facebookName} onChange={(e) => update('facebookName', e.currentTarget.value)} placeholder="Exact page name" />
                                                </Field>
                                            </div>
                                        ) : null}
                                        {form.contactMethod === 'text' || form.contactMethod === 'phone' ? (
                                            <div style={grid2}>
                                                <Field label="Phone *">
                                                    <input style={input} value={form.phone} onChange={(e) => update('phone', e.currentTarget.value)} placeholder="Your best number" />
                                                </Field>
                                                <Field label="Best time to reach you">
                                                    <input style={input} value={form.bestTimeToReach} onChange={(e) => update('bestTimeToReach', e.currentTarget.value)} placeholder="e.g., weekdays after 5pm" />
                                                </Field>
                                            </div>
                                        ) : null}
                                        {form.contactMethod === 'email' ? (
                                            <div style={grid2}>
                                                <Field label="Email *">
                                                    <input style={input} value={form.email} onChange={(e) => update('email', e.currentTarget.value)} placeholder="you@company.com" />
                                                </Field>
                                                <Field label="Best time to reach you">
                                                    <input style={input} value={form.bestTimeToReach} onChange={(e) => update('bestTimeToReach', e.currentTarget.value)} placeholder="e.g., weekdays after 5pm" />
                                                </Field>
                                            </div>
                                        ) : null}
                                    </div>

                                    <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 10 }}>
                                        <input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.currentTarget.checked)} />
                                        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.35 }}>
                                            I agree you can contact me about this request (Facebook/message/text/call/email).
                                        </div>
                                    </label>
                                </div>
                            </>
                        ) : null}

                        {step === 4 ? (
                            <>
                                <h2 style={h2}>Optional upgrades (choose what you want)</h2>
                                <div style={{ color: '#4b5563', marginBottom: 10 }}>
                                    These are optional. You can pick one, or choose “Not sure” and we’ll recommend the best path.
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {OPTIONAL_UPGRADES.map(o => (
                                        <label key={o.id} style={checkRow}>
                                            <input
                                                type="checkbox"
                                                checked={form.optionalUpgrades.includes(o.id)}
                                                onChange={() => toggleInList('optionalUpgrades', o.id)}
                                            />
                                            <span style={{ fontWeight: 800 }}>{o.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <Field label="Anything else we should know? (optional)">
                                        <textarea style={{ ...input, height: 110 }} value={form.notes} onChange={(e) => update('notes', e.currentTarget.value)} placeholder="Links, competitors, goals, constraints, etc." />
                                    </Field>
                                </div>
                            </>
                        ) : null}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 10 }}>
                            <button onClick={back} disabled={step === 1 || submitting} style={{ ...btn, background: '#111827' }}>
                                Back
                            </button>
                            {step < 4 ? (
                                <button onClick={next} disabled={submitting} style={btn}>
                                    Continue →
                                </button>
                            ) : (
                                <button onClick={submit} disabled={submitting} style={btn}>
                                    {submitting ? 'Submitting…' : 'Submit'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={card}>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>What happens after you submit</div>
                            <ul style={{ margin: '10px 0 0 18px', color: '#374151', lineHeight: 1.5 }}>
                                <li>We review your answers + quick-scan your online presence.</li>
                                <li>You get a tailored plan + fastest wins.</li>
                                <li>Upgrades are optional — pick what you want.</li>
                            </ul>
                        </div>

                        <div style={card}>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>What we’re best at</div>
                            <div style={miniGrid}>
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
    );
}

function Field({ label, children }: { label: string; children: any }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 900, marginBottom: 6 }}>{label}</div>
            {children}
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} style={{
            padding: '8px 10px',
            borderRadius: 999,
            border: `1px solid ${active ? '#2563eb' : '#e5e7eb'}`,
            background: active ? '#eff6ff' : 'white',
            color: '#111827',
            fontWeight: 800,
            cursor: 'pointer'
        }}>
            {label}
        </button>
    );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} style={{
            padding: '8px 12px',
            borderRadius: 999,
            border: `1px solid ${active ? '#111827' : '#e5e7eb'}`,
            background: active ? '#111827' : 'white',
            color: active ? 'white' : '#111827',
            fontWeight: 900,
            cursor: 'pointer'
        }}>
            {label}
        </button>
    );
}

function MiniCard({ title, body }: { title: string; body: string }) {
    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fafafa' }}>
            <div style={{ fontWeight: 900 }}>{title}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6, lineHeight: 1.35 }}>{body}</div>
        </div>
    );
}

const pageWrap: React.CSSProperties = {
    minHeight: '100vh',
    padding: 22,
    fontFamily: 'system-ui, Arial, sans-serif',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
};

const card: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: 16,
    background: 'white'
};

const input: React.CSSProperties = {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 12,
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: 14
};

const btn: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid #111827',
    background: '#2563eb',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
    minWidth: 140
};

const h2: React.CSSProperties = { margin: '0 0 12px', fontSize: 18 };

const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
};

const chipsWrap: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8
};

const checkRow: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    background: '#fafafa'
};

const miniGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 10
};

const errorBox: React.CSSProperties = {
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#991b1b',
    borderRadius: 12,
    padding: 10,
    fontWeight: 800,
    marginBottom: 12
};


