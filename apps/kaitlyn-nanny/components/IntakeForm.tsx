"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitIntake } from "../app/actions/submitIntake";

type FormValues = {
    familyType: "New" | "Returning" | "";

    referralSource:
    | "Celebree"
    | "Word of mouth"
    | "Facebook/Instagram"
    | "Google"
    | "Returning family"
    | "Other"
    | "";
    referralDetails: string;

    metKaitlyn: "Yes" | "No" | "";
    wantsInterview: "Yes - Zoom" | "Yes - In person" | "No" | "";
    returningChanges: string;

    parentName: string;
    email: string;
    phone: string;
    contactMethod: "Text" | "Call" | "Email" | "";
    city: string;
    zip: string;

    careType: "One-time" | "Occasional" | "Recurring weekends" | "Not sure" | "";

    // One-time fields
    oneTimeDate: string;

    // Occasional fields
    occasionalNotes: string;

    // Recurring fields
    recurringNotes: string;

    // Not sure fields
    notSureDateNotes: string;

    startTime: string;
    endTime: string;

    requestOutsideHours: boolean;
    outsideHoursNotes: string;

    numChildren: string;
    ages: string;
    hasAllergiesOrNeeds: "Yes" | "No" | "";
    allergiesNotes: string;

    budgetRange: "$27-$30/hr" | "$30-$35/hr" | "$35+/hr" | "Not sure" | "";

    notes: string;
};

const initial: FormValues = {
    familyType: "",
    referralSource: "",
    referralDetails: "",
    metKaitlyn: "",
    wantsInterview: "",
    returningChanges: "",

    parentName: "",
    email: "",
    phone: "",
    contactMethod: "",
    city: "",
    zip: "",

    careType: "",

    oneTimeDate: "",

    occasionalNotes: "",

    recurringNotes: "",

    notSureDateNotes: "",

    startTime: "",
    endTime: "",

    requestOutsideHours: false,
    outsideHoursNotes: "",

    numChildren: "",
    ages: "",
    hasAllergiesOrNeeds: "",
    allergiesNotes: "",

    budgetRange: "",

    notes: ""
};

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="text-xs font-semibold tracking-wide text-[hsl(var(--text))]">
            {children}
            {required && <span className="ml-1 text-[hsl(var(--text))]">*</span>}
        </label>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="mt-1 text-xs text-[hsl(var(--muted))]">{children}</p>;
}

function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;
    return <p className="mt-1 text-xs font-medium text-red-600">{msg}</p>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const { className, ...rest } = props;
    return (
        <input
            {...rest}
            className={[
                "mt-1 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 py-2.5 text-sm",
                "text-[hsl(var(--text))] placeholder:text-[hsl(var(--muted))]/70",
                "shadow-sm outline-none transition-all duration-300",
                "focus:border-[hsl(var(--accent-deep))] focus:ring-4 focus:ring-[hsl(var(--accent))]/40 focus:shadow-lg focus:bg-white",
                "hover:border-[hsl(var(--accent-hover))] hover:bg-white",
                "disabled:bg-gray-50 disabled:text-gray-400",
                "[color-scheme:light]",
                className
            ]
                .filter(Boolean)
                .join(" ")}
            style={{ backgroundColor: 'white', colorScheme: 'light' }}
        />
    );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
    const { className, ...rest } = props;
    return (
        <select
            {...rest}
            className={[
                "mt-1 w-full appearance-none rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 py-2.5 pr-10 text-sm",
                "text-[hsl(var(--text))]",
                "shadow-sm outline-none transition-all duration-300",
                "focus:border-[hsl(var(--accent-deep))] focus:ring-4 focus:ring-[hsl(var(--accent))]/40 focus:shadow-lg focus:bg-white",
                "hover:border-[hsl(var(--accent-hover))] hover:bg-white cursor-pointer",
                "[color-scheme:light]",
                className
            ]
                .filter(Boolean)
                .join(" ")}
            style={{ backgroundColor: 'white', colorScheme: 'light' }}
        />
    );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    const { className, ...rest } = props;
    return (
        <textarea
            {...rest}
            className={[
                "mt-1 w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 py-2.5 text-sm",
                "text-[hsl(var(--text))] placeholder:text-[hsl(var(--muted))]/70",
                "shadow-sm outline-none transition-all duration-300",
                "focus:border-[hsl(var(--accent-deep))] focus:ring-4 focus:ring-[hsl(var(--accent))]/40 focus:shadow-lg focus:bg-white",
                "hover:border-[hsl(var(--accent-hover))] hover:bg-white",
                "[color-scheme:light]",
                className
            ]
                .filter(Boolean)
                .join(" ")}
            style={{ backgroundColor: 'white', colorScheme: 'light' }}
        />
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[hsl(var(--accent-deep))] via-[hsl(var(--accent))] to-[hsl(var(--accent-deep))] bg-size-200 bg-pos-0 px-8 py-4 text-base font-bold tracking-wide text-white shadow-2xl transition-all duration-500 hover:bg-pos-100 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
            {pending ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending…
                </>
            ) : "Request Care"}
        </button>
    );
}

type ClientErrors = Partial<Record<string, string>>;

function isWeekendISO(iso: string) {
    if (!iso) return false;
    const [y, m, d] = iso.split("-").map((x) => Number(x));
    if (!y || !m || !d) return false;
    const day = new Date(y, m - 1, d).getDay(); // local time
    return day === 5 || day === 6 || day === 0; // Fri(5), Sat(6), Sun(0)
}

function isoTodayLocal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function addMonthsISO(fromISO: string, months: number) {
    const [y, m, d] = fromISO.split("-").map((x) => Number(x));
    const date = new Date(y, (m - 1) + months, d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

function isISOInRange(iso: string, minISO: string, maxISO: string) {
    return iso >= minISO && iso <= maxISO;
}

function isoDayOfWeek(iso: string) {
    const [y, m, d] = iso.split("-").map((x) => Number(x));
    return new Date(y, m - 1, d).getDay();
}

function dateFromISO(iso: string) {
    const [y, m, d] = iso.split("-").map((x) => Number(x));
    return new Date(y, m - 1, d);
}

function formatISOForSelect(iso: string) {
    const dt = dateFromISO(iso);
    try {
        return new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(dt);
    } catch {
        return iso;
    }
}

function allowedDatesInRange(minISO: string, maxISO: string) {
    // Generate Fri/Sat/Sun dates within [minISO, maxISO] inclusive.
    const start = dateFromISO(minISO);
    const end = dateFromISO(maxISO);
    const dates: string[] = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cur <= end) {
        const day = cur.getDay();
        if (day === 5 || day === 6 || day === 0) {
            const y = cur.getFullYear();
            const m = String(cur.getMonth() + 1).padStart(2, "0");
            const d = String(cur.getDate()).padStart(2, "0");
            dates.push(`${y}-${m}-${d}`);
        }
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

function timeToMinutes(t: string) {
    const [hh, mm] = t.split(":").map((x) => Number(x));
    if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
    return hh * 60 + mm;
}

function minutesToHHMM(m: number) {
    // Use 00:00 for midnight/end-of-day.
    const mm = ((m % 60) + 60) % 60;
    const hh = Math.floor(((m / 60) % 24 + 24) % 24);
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function minutesToLabel(m: number) {
    // Display-friendly labels, including 12:00 AM for midnight.
    const hh24 = Math.floor(((m / 60) % 24 + 24) % 24);
    const mm = ((m % 60) + 60) % 60;
    const ampm = hh24 >= 12 ? "PM" : "AM";
    const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
    return `${hh12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function normalizeEndMinutes(m: number) {
    // Treat 00:00 as end-of-day (24:00) for comparisons.
    return m === 0 ? 24 * 60 : m;
}

function hourlyOptions(minM: number, maxM: number) {
    // Inclusive, hourly (no :30).
    const out: number[] = [];
    for (let t = minM; t <= maxM; t += 60) out.push(t);
    return out;
}

function validateAll(v: FormValues): ClientErrors {
    const e: ClientErrors = {};

    if (!v.familyType) e.familyType = "Please select one.";

    if (v.familyType === "New") {
        if (!v.referralSource) e.referralSource = "Please select one.";
        if (!v.metKaitlyn) e.metKaitlyn = "Please select one.";
        if (v.metKaitlyn === "No" && !v.wantsInterview) e.wantsInterview = "Please select one.";
    }
    if (v.familyType === "Returning") {
        // We still track attribution, but don't block returning families if they skip it.
        if (!v.returningChanges.trim()) e.returningChanges = "Quick note: anything new since last time?";
        if (v.referralSource === "Other" && !v.referralDetails.trim()) e.referralDetails = "Please add a quick detail.";
    }

    if (v.referralSource === "Word of mouth" && !v.referralDetails.trim()) {
        e.referralDetails = "Optional but helpful: who referred you?";
    }
    if (v.referralSource === "Other" && !v.referralDetails.trim()) {
        e.referralDetails = "Please add a quick detail.";
    }

    if (!v.parentName.trim()) e.parentName = "Please enter your name.";
    if (!v.email.trim() || !v.email.includes("@")) e.email = "Please enter a valid email.";
    if (!v.phone.trim()) e.phone = "Please enter a phone number.";
    if (!v.contactMethod) e.contactMethod = "Please choose a contact method.";
    if (!v.city.trim()) e.city = "Please enter your city.";
    if (!v.zip.trim()) e.zip = "Please enter your zip code.";

    if (!v.careType) e.careType = "Please choose one option.";

    // Conditional date validation based on care type
    if (v.careType === "One-time" && !v.oneTimeDate) {
        e.oneTimeDate = "Please select a date.";
    }
    if (v.careType === "One-time" && v.oneTimeDate && !isWeekendISO(v.oneTimeDate)) {
        e.oneTimeDate = "Please choose Friday, Saturday, or Sunday.";
    }
    if (v.careType === "Occasional" && !v.occasionalNotes.trim()) {
        e.occasionalNotes = "Please tell us what dates/times you’re hoping for (Fri/Sat/Sun).";
    }
    if (v.careType === "Recurring weekends" && !v.recurringNotes.trim()) {
        e.recurringNotes = "Please describe your recurring schedule (days/times/frequency).";
    }

    // Only require exact time selection for One-time bookings.
    if (v.careType === "One-time") {
        if (!v.startTime) e.startTime = "Please choose a start time.";
        if (!v.endTime) e.endTime = "Please choose an end time.";
    }

    // Kaitlyn availability windows:
    // - Friday: start >= 7:00pm
    // - Saturday: 5:00am - 12:00am
    // - Sunday: end <= 10:00pm (start can be as early as 5:00am)
    const startM = timeToMinutes(v.startTime);
    const endMRaw = timeToMinutes(v.endTime);
    const endM = normalizeEndMinutes(endMRaw);

    // Require end after start (allow midnight as 24:00).
    if (v.careType === "One-time" && !Number.isNaN(startM) && !Number.isNaN(endMRaw) && endM <= startM) {
        e.endTime = "End time must be after start time.";
    }

    if (v.careType === "One-time" && !Number.isNaN(startM) && startM < 19 * 60) {
        const friApplies =
            (v.careType === "One-time" && v.oneTimeDate && isoDayOfWeek(v.oneTimeDate) === 5);
        if (friApplies && !v.requestOutsideHours) e.startTime = "For Fridays, start time must be 7:00pm or later.";
    }
    if (v.careType === "One-time" && !Number.isNaN(endMRaw) && endM > 22 * 60) {
        const sunApplies =
            (v.careType === "One-time" && v.oneTimeDate && isoDayOfWeek(v.oneTimeDate) === 0);
        if (sunApplies && !v.requestOutsideHours) e.endTime = "For Sundays, end time must be 10:00pm or earlier.";
    }

    // If they want an exception, require a quick note
    const violatesStandardHours =
        v.careType === "One-time" &&
        ((startM < 19 * 60 && v.oneTimeDate && isoDayOfWeek(v.oneTimeDate) === 5) ||
            (!Number.isNaN(endMRaw) && endM > 22 * 60 && v.oneTimeDate && isoDayOfWeek(v.oneTimeDate) === 0));

    if (v.requestOutsideHours) {
        if (!v.outsideHoursNotes.trim()) {
            e.outsideHoursNotes = "Please add a quick note about the exception you’re requesting.";
        }
    } else if (violatesStandardHours) {
        // show a more helpful message if they pick outside-hours but haven't opted in
        e.requestOutsideHours = "If you need outside-hours care, check the box and add a note.";
    }

    if (!v.numChildren || Number.isNaN(Number(v.numChildren)) || Number(v.numChildren) <= 0) {
        e.numChildren = "Please enter the number of children.";
    }
    if (!v.ages.trim()) e.ages = "Please enter ages (e.g. 3, 6).";

    if (!v.hasAllergiesOrNeeds) e.hasAllergiesOrNeeds = "Please select yes or no.";
    if (v.hasAllergiesOrNeeds === "Yes" && !v.allergiesNotes.trim()) {
        e.allergiesNotes = "Please provide details.";
    }

    if (!v.budgetRange) e.budgetRange = "Please select a budget range.";

    return e;
}

function SectionCard({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-7 shadow-sm hover:shadow-lg hover:border-[hsl(var(--accent))]/40 transition-all duration-500 animate-slide-up relative overflow-hidden group">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent))]/6 via-transparent to-[hsl(var(--lavender))]/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--accent-deep))] relative z-10">{title}</p>
            <div className="mt-6 relative z-10">{children}</div>
        </div>
    );
}

export function IntakeForm() {
    const [values, setValues] = useState<FormValues>(initial);
    const [clientErrors, setClientErrors] = useState<ClientErrors>({});

    const [state, action] = useFormState(submitIntake as any, { ok: false, error: "" });

    const serverFieldErrors = useMemo(() => {
        if (state && typeof state === "object" && (state as any).fieldErrors) {
            return (state as any).fieldErrors as Record<string, string>;
        }
        return {};
    }, [state]);

    const isSuccess = Boolean(state && typeof state === "object" && (state as any).ok === true);
    const minDate = useMemo(() => isoTodayLocal(), []);
    const maxDate = useMemo(() => addMonthsISO(isoTodayLocal(), 6), []);
    const allowedDateOptions = useMemo(() => allowedDatesInRange(minDate, maxDate), [minDate, maxDate]);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        const errs = validateAll(values);
        setClientErrors(errs);
        if (Object.keys(errs).length > 0) e.preventDefault();
    }

    function setWeekendDateField<K extends keyof FormValues>(key: K, iso: string) {
        const value = String(iso);
        if (value && !isISOInRange(value, minDate, maxDate)) {
            setValues((v) => ({ ...v, [key]: "" } as FormValues));
            setClientErrors((prev) => ({ ...prev, [key]: "Please choose a date within the next 6 months." }));
            return;
        }
        if (value && !isWeekendISO(value)) {
            setValues((v) => ({ ...v, [key]: "" } as FormValues));
            setClientErrors((prev) => ({ ...prev, [key]: "Please choose Friday, Saturday, or Sunday." }));
            return;
        }
        setValues((v) => ({ ...v, [key]: value } as FormValues));
        setClientErrors((prev) => {
            const next = { ...prev } as any;
            delete next[key as any];
            return next;
        });
    }

    function setFamilyType(next: "New" | "Returning") {
        setClientErrors({});
        if (next === "New") {
            setValues((v) => ({
                ...v,
                familyType: "New",
                referralSource: "",
                referralDetails: "",
                metKaitlyn: "",
                wantsInterview: "",
                returningChanges: ""
            }));
            return;
        }
        setValues((v) => ({
            ...v,
            familyType: "Returning",
            // Returning implies you’ve met before; no interview needed.
            metKaitlyn: "Yes",
            wantsInterview: "No",
            referralSource: v.referralSource || "Returning family",
            referralDetails: v.referralDetails || "",
            returningChanges: v.returningChanges || ""
        }));
    }

    if (isSuccess) {
        return (
            <div className="rounded-2xl border-2 border-[hsl(var(--accent))] bg-gradient-to-br from-white/98 via-[hsl(var(--accent))]/12 to-[hsl(var(--lavender))]/10 p-8 shadow-2xl text-center animate-fade-in">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--accent-deep))] to-[hsl(var(--accent))] shadow-xl animate-gentle-float">
                    <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-xl font-bold text-[hsl(var(--text))]">Request Received</p>
                <p className="mt-3 text-base leading-relaxed text-[hsl(var(--text))]">
                    Thank you for your inquiry. You'll receive a confirmation email shortly, and Kaitlyn will respond within 24 hours.
                </p>
            </div>
        );
    }

    const isReturning = values.familyType === "Returning";
    const isNew = values.familyType === "New";
    const showInterviewQuestion = isNew && values.metKaitlyn === "No";
    const showFriTimeConstraint = values.careType === "One-time" && values.oneTimeDate && isoDayOfWeek(values.oneTimeDate) === 5;
    const showSunTimeConstraint = values.careType === "One-time" && values.oneTimeDate && isoDayOfWeek(values.oneTimeDate) === 0;

    // Hour-only options based on selected days:
    // - Fri: start >= 19:00
    // - Sat: start >= 05:00
    // - End: up to 24:00 (00:00) unless Sun applies, then up to 22:00
    const startMinM = showFriTimeConstraint ? 19 * 60 : 5 * 60;
    const endMaxM = showSunTimeConstraint ? 22 * 60 : 24 * 60;
    const startOptionsM = useMemo(() => hourlyOptions(startMinM, 23 * 60), [startMinM]);
    const startM = !values.startTime ? NaN : timeToMinutes(values.startTime);
    const minEndM = Number.isNaN(startM) ? startMinM + 60 : startM + 60;
    const endOptionsM = useMemo(() => {
        const max = endMaxM;
        const from = Math.min(minEndM, max);
        // Build end options hourly. If max is 24:00, represent it as 24*60 here (display 12:00 AM).
        return hourlyOptions(from, max);
    }, [minEndM, endMaxM]);

    return (
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/80 p-10 shadow-[0_24px_70px_rgba(0,0,0,0.16)] animate-fade-in relative overflow-hidden backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent))]/10 via-transparent to-[hsl(var(--lavender))]/10"></div>
            <div className="relative z-10">
                {(state as any)?.ok === false && (state as any)?.error ? (
                    <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                        {(state as any).error}
                    </div>
                ) : null}

                <form action={action} onSubmit={onSubmit} className="space-y-5">

                    {/* Family Type Selector */}
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/70 p-5 backdrop-blur-sm">
                        <FieldLabel required>Are you a new or returning family?</FieldLabel>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-300 ${values.familyType === "New"
                                ? "choice-selected border-[hsl(var(--accent))] bg-gradient-to-br from-[hsl(var(--accent))]/18 via-white to-[hsl(var(--lavender))]/12 shadow-xl scale-[1.02] ring-2 ring-[hsl(var(--accent))]/30"
                                : "border-[hsl(var(--border))] bg-white/95 hover:border-[hsl(var(--accent))]/60 hover:shadow-lg hover:scale-[1.01]"
                                }`}>
                                <input
                                    type="radio"
                                    name="familyType"
                                    value="New"
                                    checked={values.familyType === "New"}
                                    onChange={() => setFamilyType("New")}
                                    className="h-4 w-4"
                                />
                                <div>
                                    <p className="text-sm font-semibold">New family</p>
                                    <p className="text-xs text-[hsl(var(--muted))]">First-time request (we'll confirm details)</p>
                                </div>
                            </label>

                            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-300 ${values.familyType === "Returning"
                                ? "choice-selected border-[hsl(var(--accent))] bg-gradient-to-br from-[hsl(var(--accent))]/18 via-white to-[hsl(var(--lavender))]/12 shadow-xl scale-[1.02] ring-2 ring-[hsl(var(--accent))]/30"
                                : "border-[hsl(var(--border))] bg-white/95 hover:border-[hsl(var(--accent))]/60 hover:shadow-lg hover:scale-[1.01]"
                                }`}>
                                <input
                                    type="radio"
                                    name="familyType"
                                    value="Returning"
                                    checked={values.familyType === "Returning"}
                                    onChange={() => setFamilyType("Returning")}
                                    className="h-4 w-4"
                                />
                                <div>
                                    <p className="text-sm font-semibold">Returning family</p>
                                    <p className="text-xs text-[hsl(var(--muted))]">Faster booking (just share what changed)</p>
                                </div>
                            </label>
                        </div>
                        <FieldError msg={clientErrors.familyType} />
                    </div>

                    {/* New vs Returning details */}
                    {isNew && (
                        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/65 p-4 backdrop-blur-sm">
                            <FieldLabel required>How did you hear about Kaitlyn?</FieldLabel>
                            <Select
                                name="referralSource"
                                value={values.referralSource}
                                onChange={(e) =>
                                    setValues((v) => ({
                                        ...v,
                                        referralSource: e.target.value as any,
                                        referralDetails: ""
                                    }))
                                }
                                className="mt-2"
                            >
                                <option value="">Select…</option>
                                <option value="Celebree">Celebree</option>
                                <option value="Word of mouth">Word of mouth</option>
                                <option value="Facebook/Instagram">Facebook / Instagram</option>
                                <option value="Google">Google</option>
                                <option value="Other">Other</option>
                            </Select>
                            <FieldError msg={clientErrors.referralSource} />

                            {(values.referralSource === "Word of mouth" || values.referralSource === "Other") && (
                                <div className="mt-3">
                                    <FieldLabel>{values.referralSource === "Word of mouth" ? "Who referred you?" : "Where did you hear about her?"}</FieldLabel>
                                    <TextInput
                                        name="referralDetails"
                                        value={values.referralDetails}
                                        onChange={(e) => setValues((v) => ({ ...v, referralDetails: e.target.value }))}
                                        placeholder={values.referralSource === "Word of mouth" ? "Name (optional)" : "Quick detail"}
                                    />
                                    <FieldError msg={clientErrors.referralDetails} />
                                </div>
                            )}

                            <div className="mt-4">
                                <FieldLabel required>Have you met Kaitlyn before?</FieldLabel>
                                <div className="mt-2 flex gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="metKaitlyn"
                                            value="Yes"
                                            checked={values.metKaitlyn === "Yes"}
                                            onChange={(e) => setValues((v) => ({ ...v, metKaitlyn: e.target.value as any, wantsInterview: "" }))}
                                        />
                                        Yes
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="metKaitlyn"
                                            value="No"
                                            checked={values.metKaitlyn === "No"}
                                            onChange={(e) => setValues((v) => ({ ...v, metKaitlyn: e.target.value as any }))}
                                        />
                                        No
                                    </label>
                                </div>
                                <FieldError msg={clientErrors.metKaitlyn} />
                            </div>
                        </div>
                    )}

                    {isReturning && (
                        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/65 p-4 backdrop-blur-sm">
                            <FieldLabel>Welcome back</FieldLabel>
                            <Hint>To keep things fast, just tell us what’s new since your last booking.</Hint>
                            <Textarea
                                name="returningChanges"
                                rows={3}
                                value={values.returningChanges}
                                onChange={(e) => setValues((v) => ({ ...v, returningChanges: e.target.value }))}
                                placeholder="Example: new address, updated bedtime routine, new allergy info, different children attending…"
                            />
                            <FieldError msg={clientErrors.returningChanges} />

                            <div className="mt-4">
                                <FieldLabel>How did you originally hear about Kaitlyn?</FieldLabel>
                                <Select
                                    name="referralSource"
                                    value={values.referralSource}
                                    onChange={(e) => setValues((v) => ({ ...v, referralSource: e.target.value as any, referralDetails: "" }))}
                                    className="mt-2"
                                >
                                    <option value="">Select… (optional)</option>
                                    <option value="Returning family">Returning family</option>
                                    <option value="Celebree">Celebree</option>
                                    <option value="Word of mouth">Word of mouth</option>
                                    <option value="Facebook/Instagram">Facebook / Instagram</option>
                                    <option value="Google">Google</option>
                                    <option value="Other">Other</option>
                                </Select>
                                {(values.referralSource === "Word of mouth" || values.referralSource === "Other") && (
                                    <div className="mt-3">
                                        <FieldLabel>{values.referralSource === "Word of mouth" ? "Who referred you?" : "Where did you hear about her?"}</FieldLabel>
                                        <TextInput
                                            name="referralDetails"
                                            value={values.referralDetails}
                                            onChange={(e) => setValues((v) => ({ ...v, referralDetails: e.target.value }))}
                                            placeholder={values.referralSource === "Word of mouth" ? "Name (optional)" : "Quick detail"}
                                        />
                                        <FieldError msg={clientErrors.referralDetails} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Interview Preference (New families who don't know her from Celebree) */}
                    {showInterviewQuestion && (
                        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/65 p-4 backdrop-blur-sm">
                            <FieldLabel>Would you like a quick interview before the first session?</FieldLabel>
                            <Hint>Optional 10-15 minute call to meet and discuss your needs</Hint>
                            <Select
                                name="wantsInterview"
                                value={values.wantsInterview}
                                onChange={(e) => setValues((v) => ({ ...v, wantsInterview: e.target.value as any }))}
                                className="mt-2"
                            >
                                <option value="">Select…</option>
                                <option value="Yes - Zoom">Yes, Zoom call</option>
                                <option value="Yes - In person">Yes, in person</option>
                                <option value="No">No, we can meet at the first session</option>
                            </Select>
                            <FieldError msg={clientErrors.wantsInterview} />
                        </div>
                    )}

                    {/* Contact Info */}
                    <SectionCard title="Contact">
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required>Your name</FieldLabel>
                                <TextInput
                                    name="parentName"
                                    value={values.parentName}
                                    onChange={(e) => setValues((v) => ({ ...v, parentName: e.target.value }))}
                                    autoComplete="name"
                                />
                                <FieldError msg={clientErrors.parentName || serverFieldErrors.parentName} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FieldLabel required>Email</FieldLabel>
                                    <TextInput
                                        name="email"
                                        type="email"
                                        value={values.email}
                                        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                                        autoComplete="email"
                                    />
                                    <FieldError msg={clientErrors.email || serverFieldErrors.email} />
                                </div>
                                <div>
                                    <FieldLabel required>Phone</FieldLabel>
                                    <TextInput
                                        name="phone"
                                        value={values.phone}
                                        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                                        autoComplete="tel"
                                    />
                                    <FieldError msg={clientErrors.phone || serverFieldErrors.phone} />
                                </div>
                            </div>

                            <div>
                                <FieldLabel required>Best way to contact you</FieldLabel>
                                <Select
                                    name="contactMethod"
                                    value={values.contactMethod}
                                    onChange={(e) => setValues((v) => ({ ...v, contactMethod: e.target.value as any }))}
                                >
                                    <option value="">Select…</option>
                                    <option value="Text">Text</option>
                                    <option value="Call">Call</option>
                                    <option value="Email">Email</option>
                                </Select>
                                <FieldError msg={clientErrors.contactMethod || serverFieldErrors.contactMethod} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FieldLabel required>City</FieldLabel>
                                    <TextInput
                                        name="city"
                                        placeholder="Bel Air, Fallston, etc."
                                        value={values.city}
                                        onChange={(e) => setValues((v) => ({ ...v, city: e.target.value }))}
                                    />
                                    <FieldError msg={clientErrors.city || serverFieldErrors.city} />
                                </div>
                                <div>
                                    <FieldLabel required>Zip code</FieldLabel>
                                    <TextInput
                                        name="zip"
                                        value={values.zip}
                                        onChange={(e) => setValues((v) => ({ ...v, zip: e.target.value }))}
                                    />
                                    <FieldError msg={clientErrors.zip || serverFieldErrors.zip} />
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Schedule */}
                    <SectionCard title="Schedule">
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required>What kind of care do you need?</FieldLabel>
                                <Select
                                    name="careType"
                                    value={values.careType}
                                    onChange={(e) => {
                                        const next = e.target.value as any;
                                        setValues((v) => ({ ...v, careType: next }));
                                        setClientErrors((prev) => {
                                            const p: any = { ...prev };
                                            delete p.careType;
                                            return p;
                                        });
                                    }}
                                >
                                    <option value="">Select…</option>
                                    <option value="One-time">One-time babysitting</option>
                                    <option value="Occasional">Occasional / as-needed</option>
                                    <option value="Recurring weekends">Recurring weekends</option>
                                    <option value="Not sure">Not sure yet</option>
                                </Select>
                                <Hint>Availability: Fri (start after 7pm), Sat (anytime), Sun (end by 10pm). Weekdays opening soon.</Hint>
                                <FieldError msg={clientErrors.careType} />
                            </div>

                            {/* ONE-TIME: Single date picker */}
                            {values.careType === "One-time" && (
                                <div>
                                    <FieldLabel required>Date</FieldLabel>
                                    <Select
                                        name="oneTimeDate"
                                        value={values.oneTimeDate}
                                        onChange={(e) => setWeekendDateField("oneTimeDate", e.target.value)}
                                    >
                                        <option value="">Select…</option>
                                        {allowedDateOptions.map((iso) => (
                                            <option key={iso} value={iso}>
                                                {formatISOForSelect(iso)}
                                            </option>
                                        ))}
                                    </Select>
                                    <Hint>Available dates are Friday/Saturday/Sunday only (next 6 months).</Hint>
                                    <FieldError msg={clientErrors.oneTimeDate} />
                                </div>
                            )}

                            {/* OCCASIONAL: schedule notes */}
                            {values.careType === "Occasional" && (
                                <div>
                                    <FieldLabel required>Requested dates & times</FieldLabel>
                                    <Hint>
                                        Tell us what you’re hoping for (Fri/Sat/Sun). Example: “Sat Jan 10, 6–10pm (or Sun Jan 11, 2–6pm).”
                                    </Hint>
                                    <Textarea
                                        name="occasionalNotes"
                                        rows={3}
                                        value={values.occasionalNotes}
                                        onChange={(e) => setValues((v) => ({ ...v, occasionalNotes: e.target.value }))}
                                        placeholder="Share your preferred day(s), date(s), and time window…"
                                    />
                                    <FieldError msg={clientErrors.occasionalNotes} />
                                </div>
                            )}

                            {/* RECURRING WEEKENDS: schedule notes */}
                            {values.careType === "Recurring weekends" && (
                                <div>
                                    <FieldLabel required>Recurring schedule details</FieldLabel>
                                    <Hint>
                                        Tell us your ideal recurring plan (days/times/frequency). Example: “Every other Saturday 6–10pm starting in January.”
                                    </Hint>
                                    <Textarea
                                        name="recurringNotes"
                                        rows={3}
                                        value={values.recurringNotes}
                                        onChange={(e) => setValues((v) => ({ ...v, recurringNotes: e.target.value }))}
                                        placeholder="Share your recurring schedule…"
                                    />
                                    <FieldError msg={clientErrors.recurringNotes} />
                                </div>
                            )}

                            {/* NOT SURE: Just a text box */}
                            {values.careType === "Not sure" && (
                                <div>
                                    <FieldLabel>Tell us what you're thinking</FieldLabel>
                                    <Textarea
                                        name="notSureDateNotes"
                                        rows={3}
                                        value={values.notSureDateNotes}
                                        onChange={(e) => setValues((v) => ({ ...v, notSureDateNotes: e.target.value }))}
                                        placeholder="Example: I need occasional weekend help, maybe 1-2 Saturdays per month starting in February"
                                    />
                                </div>
                            )}

                            {values.careType === "One-time" ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <FieldLabel required>Start time</FieldLabel>
                                        {showFriTimeConstraint && <Hint>Friday start times begin at 7:00pm.</Hint>}
                                        <Select
                                            name="startTime"
                                            value={values.startTime}
                                            onChange={(e) => {
                                                const next = e.target.value;
                                                setValues((v) => {
                                                    const nextStartM = timeToMinutes(next);
                                                    const curEndMRaw = timeToMinutes(v.endTime);
                                                    const curEndM = normalizeEndMinutes(curEndMRaw);
                                                    const shouldClearEnd =
                                                        !v.endTime ||
                                                        Number.isNaN(nextStartM) ||
                                                        Number.isNaN(curEndMRaw) ||
                                                        curEndM <= nextStartM;
                                                    return {
                                                        ...v,
                                                        startTime: next,
                                                        endTime: shouldClearEnd ? "" : v.endTime
                                                    };
                                                });
                                            }}
                                        >
                                            <option value="">Select…</option>
                                            {startOptionsM.map((m) => {
                                                const val = minutesToHHMM(m);
                                                return (
                                                    <option key={val} value={val}>
                                                        {minutesToLabel(m)}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                        <FieldError msg={clientErrors.startTime} />
                                        <Hint>Hourly only. Kaitlyn will confirm availability.</Hint>
                                    </div>
                                    <div>
                                        <FieldLabel required>End time</FieldLabel>
                                        {showSunTimeConstraint && <Hint>Sunday requests must end by 10:00pm.</Hint>}
                                        <Select
                                            name="endTime"
                                            value={values.endTime}
                                            onChange={(e) => setValues((v) => ({ ...v, endTime: e.target.value }))}
                                        >
                                            <option value="">Select…</option>
                                            {endOptionsM.map((m) => {
                                                const val = m === 24 * 60 ? "00:00" : minutesToHHMM(m);
                                                return (
                                                    <option key={val} value={val}>
                                                        {m === 24 * 60 ? "12:00 AM" : minutesToLabel(m)}
                                                    </option>
                                                );
                                            })}
                                        </Select>
                                        <FieldError msg={clientErrors.endTime} />
                                        <Hint>Hourly only. Kaitlyn will confirm availability.</Hint>
                                    </div>
                                </div>
                            ) : null}

                            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/70 p-4">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        name="requestOutsideHours"
                                        checked={values.requestOutsideHours}
                                        onChange={(e) =>
                                            setValues((v) => ({
                                                ...v,
                                                requestOutsideHours: e.target.checked,
                                                outsideHoursNotes: e.target.checked ? v.outsideHoursNotes : ""
                                            }))
                                        }
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-[hsl(var(--text))]">Request outside standard hours</p>
                                        <p className="mt-1 text-xs text-[hsl(var(--muted))]">
                                            Standard availability is Fri (start after 7pm) → Sun (end by 10pm). If you need something outside
                                            that window, we can review it case-by-case.
                                        </p>
                                    </div>
                                </label>
                                <FieldError msg={clientErrors.requestOutsideHours} />

                                {values.requestOutsideHours ? (
                                    <div className="mt-3">
                                        <FieldLabel required>What are you hoping for?</FieldLabel>
                                        <Textarea
                                            name="outsideHoursNotes"
                                            rows={3}
                                            value={values.outsideHoursNotes}
                                            onChange={(e) => setValues((v) => ({ ...v, outsideHoursNotes: e.target.value }))}
                                            placeholder="Example: Friday 5:30pm start due to work schedule; Sunday until 11pm for special event"
                                        />
                                        <FieldError msg={clientErrors.outsideHoursNotes} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </SectionCard>

                    {/* Kids */}
                    <SectionCard title="Children">
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <FieldLabel required>Number of children</FieldLabel>
                                    <TextInput
                                        name="numChildren"
                                        inputMode="numeric"
                                        placeholder="Example: 2"
                                        value={values.numChildren}
                                        onChange={(e) => setValues((v) => ({ ...v, numChildren: e.target.value }))}
                                    />
                                    <FieldError msg={clientErrors.numChildren} />
                                </div>
                                <div>
                                    <FieldLabel required>Ages</FieldLabel>
                                    <TextInput
                                        name="ages"
                                        placeholder="Example: 3, 6"
                                        value={values.ages}
                                        onChange={(e) => setValues((v) => ({ ...v, ages: e.target.value }))}
                                    />
                                    <Hint>List ages separated by commas</Hint>
                                    <FieldError msg={clientErrors.ages} />
                                </div>
                            </div>

                            <div>
                                <FieldLabel required>Any allergies, medical needs, or special accommodations?</FieldLabel>
                                <div className="mt-2 flex gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="hasAllergiesOrNeeds"
                                            value="No"
                                            checked={values.hasAllergiesOrNeeds === "No"}
                                            onChange={(e) => setValues((v) => ({ ...v, hasAllergiesOrNeeds: e.target.value as any }))}
                                        />
                                        No
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="hasAllergiesOrNeeds"
                                            value="Yes"
                                            checked={values.hasAllergiesOrNeeds === "Yes"}
                                            onChange={(e) => setValues((v) => ({ ...v, hasAllergiesOrNeeds: e.target.value as any }))}
                                        />
                                        Yes
                                    </label>
                                </div>
                                <FieldError msg={clientErrors.hasAllergiesOrNeeds} />
                            </div>

                            {values.hasAllergiesOrNeeds === "Yes" && (
                                <div>
                                    <FieldLabel>Please describe briefly</FieldLabel>
                                    <Textarea
                                        name="allergiesNotes"
                                        rows={3}
                                        value={values.allergiesNotes}
                                        onChange={(e) => setValues((v) => ({ ...v, allergiesNotes: e.target.value }))}
                                        placeholder="Example: peanut allergy (EpiPen in kitchen), sensory processing needs"
                                    />
                                    <Hint>We'll discuss details before the first session</Hint>
                                    <FieldError msg={clientErrors.allergiesNotes} />
                                </div>
                            )}
                        </div>
                    </SectionCard>

                    {/* Budget */}
                    <SectionCard title="Budget">
                        <div className="space-y-4">
                            <div>
                                <FieldLabel required>Budget range (per hour)</FieldLabel>
                                <Select
                                    name="budgetRange"
                                    value={values.budgetRange}
                                    onChange={(e) => setValues((v) => ({ ...v, budgetRange: e.target.value as any }))}
                                >
                                    <option value="">Select…</option>
                                    <option value="$27-$30/hr">$27-$30/hr</option>
                                    <option value="$30-$35/hr">$30-$35/hr</option>
                                    <option value="$35+/hr">$35+/hr</option>
                                    <option value="Not sure">Not sure, want your rate</option>
                                </Select>
                                <Hint>Kaitlyn's minimum is $27/hr</Hint>
                                <FieldError msg={clientErrors.budgetRange} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Additional Notes */}
                    <SectionCard title="Anything else?">
                        <div>
                            <FieldLabel>Notes or questions</FieldLabel>
                            <Textarea
                                name="notes"
                                rows={4}
                                placeholder="Anything else that helps us prepare (pets, special requests, questions, etc.)"
                                value={values.notes}
                                onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                            />
                        </div>
                    </SectionCard>

                    <SubmitButton />

                    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))]/15 to-[hsl(var(--lavender))]/12 p-5 text-center border-2 border-[hsl(var(--accent))]/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--text))]">Privacy Promise</p>
                        <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--text))]">Your information goes directly to Kaitlyn. No spam, ever.</p>
                    </div>
                </form>
            </div>

        </div>
    );
}
