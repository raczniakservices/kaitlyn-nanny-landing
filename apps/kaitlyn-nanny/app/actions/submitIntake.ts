"use server";

import { saveKaitlynIntake, saveKaitlynIntakeFallback } from "../../lib/db";

type IntakeState =
  | { ok: true; id: string; storage: "postgres" | "file" }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function getString(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getStrings(formData: FormData, key: string) {
  const v = formData.getAll(key);
  return v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
}

function isWeekendISO(iso: string) {
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  if (!y || !m || !d) return false;
  const day = new Date(y, m - 1, d).getDay(); // local time
  return day === 5 || day === 6 || day === 0; // Fri/Sat/Sun
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

function isoDayOfWeek(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  return new Date(y, m - 1, d).getDay();
}

function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map((x) => Number(x));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return NaN;
  return hh * 60 + mm;
}

function normalizeEndMinutes(m: number) {
  return m === 0 ? 24 * 60 : m;
}

function validate(formData: FormData) {
  const fieldErrors: Record<string, string> = {};

  const familyType = getString(formData, "familyType");
  const referralSource = getString(formData, "referralSource");
  const referralDetails = getString(formData, "referralDetails");
  const metKaitlyn = getString(formData, "metKaitlyn");
  const wantsInterview = getString(formData, "wantsInterview");
  const returningChanges = getString(formData, "returningChanges");

  const parentName = getString(formData, "parentName");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const contactMethod = getString(formData, "contactMethod");
  const city = getString(formData, "city");
  const zip = getString(formData, "zip");
  const careType = getString(formData, "careType");
  const startTime = getString(formData, "startTime");
  const endTime = getString(formData, "endTime");
  const occasionalNotes = getString(formData, "occasionalNotes");
  const recurringNotes = getString(formData, "recurringNotes");
  const requestOutsideHours = getString(formData, "requestOutsideHours");
  const outsideHoursNotes = getString(formData, "outsideHoursNotes");
  const numChildren = getString(formData, "numChildren");
  const ages = getString(formData, "ages");
  const hasAllergiesOrNeeds = getString(formData, "hasAllergiesOrNeeds");
  const allergiesNotes = getString(formData, "allergiesNotes");
  const servicesNeeded = getString(formData, "servicesNeeded");

  if (!["New", "Returning"].includes(familyType)) {
    fieldErrors.familyType = "Please select new or returning family.";
  }

  if (familyType === "New") {
    const allowedReferral = ["Word of mouth", "Facebook/Instagram", "Google", "Other"];
    if (!allowedReferral.includes(referralSource)) {
      fieldErrors.referralSource = "Please select how you heard about Kaitlyn.";
    }
    if (!["Yes", "No"].includes(metKaitlyn)) {
      fieldErrors.metKaitlyn = "Please let us know if you've met Kaitlyn before.";
    }
    if (metKaitlyn === "No" && !["Yes - Zoom", "Yes - In person", "No"].includes(wantsInterview)) {
      fieldErrors.wantsInterview = "Please select an interview preference.";
    }
    if (["Word of mouth", "Other"].includes(referralSource) && !referralDetails) {
      fieldErrors.referralDetails = "Please add a quick detail.";
    }
  }

  if (familyType === "Returning") {
    if (returningChanges.length < 3) {
      fieldErrors.returningChanges = "Quick note: anything new since last time?";
    }
    // optional attribution for returning; validate only if provided
    if (referralSource) {
      const allowedReferralReturning = [
        "Word of mouth",
        "Facebook/Instagram",
        "Google",
        "Returning family",
        "Other"
      ];
      if (!allowedReferralReturning.includes(referralSource)) {
        fieldErrors.referralSource = "Please select one.";
      }
      if (["Word of mouth", "Other"].includes(referralSource) && !referralDetails) {
        fieldErrors.referralDetails = "Please add a quick detail.";
      }
    }
  }

  if (!parentName) fieldErrors.parentName = "Please enter your name.";
  if (!email || !email.includes("@")) fieldErrors.email = "Please enter a valid email.";
  if (!phone) fieldErrors.phone = "Please enter a phone number.";
  if (!["Text", "Call", "Email"].includes(contactMethod))
    fieldErrors.contactMethod = "Please choose how you'd like to be contacted.";
  if (!city) fieldErrors.city = "Please enter your city.";
  if (!zip) fieldErrors.zip = "Please enter your zip code.";

  if (!["One-time", "Occasional", "Recurring weekends", "Not sure"].includes(careType))
    fieldErrors.careType = "Please choose the type of care.";

  // Conditional date validation
  const minISO = isoTodayLocal();
  const maxISO = addMonthsISO(minISO, 6);

  if (careType === "One-time") {
    const oneTimeDate = getString(formData, "oneTimeDate");
    if (!oneTimeDate) fieldErrors.oneTimeDate = "Please select a date.";
    if (oneTimeDate && !isWeekendISO(oneTimeDate)) fieldErrors.oneTimeDate = "Please choose Friday, Saturday, or Sunday.";
    if (oneTimeDate && (oneTimeDate < minISO || oneTimeDate > maxISO))
      fieldErrors.oneTimeDate = "Please choose a date within the next 6 months.";
  }
  if (careType === "Occasional") {
    if (!occasionalNotes) fieldErrors.occasionalNotes = "Please tell us what dates/times you’re hoping for (Fri/Sat/Sun).";
  }
  if (careType === "Recurring weekends") {
    if (!recurringNotes) fieldErrors.recurringNotes = "Please describe your recurring schedule (days/times/frequency).";
  }

  // Only require exact time selection for One-time bookings.
  if (careType === "One-time") {
    if (!startTime) fieldErrors.startTime = "Please choose a start time.";
    if (!endTime) fieldErrors.endTime = "Please choose an end time.";
  }

  // Time window enforcement (Fri start == 19:00, Sun end <= 22:00)
  const startM = timeToMinutes(startTime);
  const endMRaw = timeToMinutes(endTime);
  const endM = normalizeEndMinutes(endMRaw);
  const anyFriday = careType === "One-time" && isoDayOfWeek(getString(formData, "oneTimeDate")) === 5;
  const anySunday = careType === "One-time" && isoDayOfWeek(getString(formData, "oneTimeDate")) === 0;

  const wantsException = requestOutsideHours === "on" || requestOutsideHours === "true";
  if (careType === "One-time" && !Number.isNaN(startM) && !Number.isNaN(endMRaw) && endM <= startM) {
    fieldErrors.endTime = "End time must be after start time.";
  }

  if (anyFriday && !Number.isNaN(startM) && startM < 19 * 60 && !wantsException) {
    fieldErrors.startTime = "For Fridays, start time must be 7:00pm or later.";
  }
  if (anySunday && !Number.isNaN(endMRaw) && endM > 22 * 60 && !wantsException) {
    fieldErrors.endTime = "For Sundays, end time must be 10:00pm or earlier.";
  }
  if (wantsException && outsideHoursNotes.length < 3) {
    fieldErrors.outsideHoursNotes = "Please add a quick note about the exception you’re requesting.";
  }

  if (!numChildren || Number.isNaN(Number(numChildren)) || Number(numChildren) <= 0)
    fieldErrors.numChildren = "Please enter the number of children.";
  
  // Parse and validate ages (forgiving: "3,6" or "3, 6" or "3 and 6")
  if (!ages) {
    fieldErrors.ages = "Please enter ages (e.g. 3, 6).";
  } else {
    const ageArray = ages.split(/[,\s]+|and/).map(a => a.trim()).filter(Boolean);
    for (const age of ageArray) {
      const num = Number(age);
      if (Number.isNaN(num) || num < 0 || num > 17) {
        fieldErrors.ages = "Please enter valid ages (0-17). Use commas to separate multiple ages.";
        break;
      }
    }
  }

  if (!["Yes", "No"].includes(hasAllergiesOrNeeds))
    fieldErrors.hasAllergiesOrNeeds = "Please specify yes or no.";
  if (hasAllergiesOrNeeds === "Yes" && !allergiesNotes)
    fieldErrors.allergiesNotes = "Please provide details about allergies or needs.";

  return { ok: Object.keys(fieldErrors).length === 0, fieldErrors };
}

async function maybeSendEmails(payload: Record<string, unknown>) {
  // Support two email methods:
  // 1. Gmail SMTP (easiest - just needs Gmail app password)
  // 2. Resend API (requires API key and domain setup)
  
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const resendKey = process.env.RESEND_API_KEY;
  
  const to = process.env.KAITLYN_INTAKE_TO;
  // For Resend, you can use their default sender without DNS/domain setup.
  const resendFromDefault = "onboarding@resend.dev";
  const from =
    process.env.KAITLYN_INTAKE_FROM ||
    (resendKey ? resendFromDefault : "") ||
    gmailUser ||
    "noreply@localhost";

  if (!to) {
    console.warn("KAITLYN_INTAKE_TO not set - skipping email notification");
    return;
  }

  // Choose email method
  const useGmail = !!(gmailUser && gmailAppPassword);
  const useResend = !!resendKey;
  
  if (!useGmail && !useResend) {
    console.warn("No email service configured (set GMAIL_USER + GMAIL_APP_PASSWORD or RESEND_API_KEY)");
    return;
  }

  const subject = `Care request: ${String(payload.parentName || "Intake")} ${payload.familyType === "Returning" ? "(RETURNING)" : "(NEW)"}`;
  
  const sections: string[] = [];

  sections.push("=== FAMILY TYPE ===");
  sections.push(`${payload.familyType ?? ""}`);
  if (payload.familyType === "New") {
    sections.push(`Referral source: ${payload.referralSource ?? ""}`);
    if (payload.referralDetails) sections.push(`Referral details: ${payload.referralDetails}`);
    sections.push(`Met Kaitlyn before: ${payload.metKaitlyn ?? ""}`);
    if (payload.wantsInterview) {
      sections.push(`Interview preference: ${payload.wantsInterview ?? ""}`);
    }
  } else if (payload.familyType === "Returning") {
    if (payload.returningChanges) sections.push(`What's changed: ${payload.returningChanges}`);
    if (payload.referralSource) sections.push(`Referral source (original): ${payload.referralSource}`);
    if (payload.referralDetails) sections.push(`Referral details: ${payload.referralDetails}`);
  }

  sections.push("\n=== CONTACT ===");
  sections.push(`Name: ${payload.parentName ?? ""}`);
  sections.push(`Email: ${payload.email ?? ""}`);
  sections.push(`Phone: ${payload.phone ?? ""}`);
  sections.push(`Preferred contact: ${payload.contactMethod ?? ""}`);
  sections.push(`City: ${payload.city ?? ""}`);
  sections.push(`Zip: ${payload.zip ?? ""}`);

  sections.push("\n=== SCHEDULE ===");
  sections.push(`Care type: ${payload.careType ?? ""}`);

  if (payload.careType === "One-time") {
    sections.push(`Date: ${payload.oneTimeDate ?? ""}`);
    sections.push(`Time: ${payload.startTime ?? ""}–${payload.endTime ?? ""}`);
  } else if (payload.careType === "Occasional") {
    sections.push(`Requested dates/times: ${payload.occasionalNotes ?? ""}`);
  } else if (payload.careType === "Recurring weekends") {
    sections.push(`Recurring schedule: ${payload.recurringNotes ?? ""}`);
  } else if (payload.careType === "Not sure" && payload.notSureDateNotes) {
    sections.push(`Notes: ${payload.notSureDateNotes}`);
  }
  if (payload.requestOutsideHours === "on" || payload.requestOutsideHours === "true") {
    sections.push(`Outside-hours request: YES`);
    if (payload.outsideHoursNotes) sections.push(`Outside-hours notes: ${payload.outsideHoursNotes}`);
  }

  sections.push("\n=== CHILDREN ===");
  sections.push(`Number: ${payload.numChildren ?? ""}`);
  sections.push(`Ages: ${payload.ages ?? ""}`);
  sections.push(`Allergies/medical/special needs: ${payload.hasAllergiesOrNeeds ?? ""}`);
  if (payload.hasAllergiesOrNeeds === "Yes") {
    sections.push(`Details: ${payload.allergiesNotes ?? ""}`);
  }

  if (payload.servicesNeeded) {
    sections.push("\n=== SERVICES NEEDED ===");
    sections.push(`${payload.servicesNeeded}`);
  }

  sections.push("\n=== NOTES ===");
  sections.push(`${payload.notes ?? "(none)"}`);

  const text = sections.join("\n");

  // Send notification email
  if (useGmail) {
    await sendGmailEmail({ to: [to], subject, text, gmailUser: gmailUser!, gmailAppPassword: gmailAppPassword! });
  } else if (useResend) {
    await sendResendEmail({ to: [to], subject, text, resendKey: resendKey!, from });
  }

  // Optional: send confirmation to the requester (default on)
  const requesterEmail = String(payload.email || "").trim();
  const sendConfirmation = (process.env.KAITLYN_SEND_CONFIRMATION_EMAIL || "true").toLowerCase() !== "false";
  if (sendConfirmation && requesterEmail.includes("@")) {
    const confirmSubject = "We received your care request";
    const confirmText =
      `Thanks — we received your request and Kaitlyn will follow up within 24 hours.\n\n` +
      `Copy of what you submitted:\n\n${text}`;
    
    if (useGmail) {
      await sendGmailEmail({
        to: [requesterEmail],
        subject: confirmSubject,
        text: confirmText,
        gmailUser: gmailUser!,
        gmailAppPassword: gmailAppPassword!
      });
    } else if (useResend) {
      await sendResendEmail({ to: [requesterEmail], subject: confirmSubject, text: confirmText, resendKey: resendKey!, from });
    }
  }
}

async function sendGmailEmail(args: { to: string[]; subject: string; text: string; gmailUser: string; gmailAppPassword: string }) {
  const nodemailer = await import("nodemailer");
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: args.gmailUser,
      pass: args.gmailAppPassword
    }
  });

  await transporter.sendMail({
    from: args.gmailUser,
    to: args.to.join(", "),
    subject: args.subject,
    text: args.text
  });
}

async function sendResendEmail(args: { to: string[]; subject: string; text: string; resendKey: string; from: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.resendKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      subject: args.subject,
      text: args.text
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend email failed (${res.status}): ${body || res.statusText}`);
  }
}

export async function submitIntake(
  _prevState: IntakeState,
  formData: FormData
): Promise<IntakeState> {
  // Step 1: server-side validation
  const v = validate(formData);
  if (!v.ok) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: v.fieldErrors };
  }

  // Step 2: normalize payload
  const careType = getString(formData, "careType");

  const payload = {
    familyType: getString(formData, "familyType"),
    referralSource: getString(formData, "referralSource"),
    referralDetails: getString(formData, "referralDetails"),
    metKaitlyn: getString(formData, "metKaitlyn"),
    wantsInterview: getString(formData, "wantsInterview"),
    returningChanges: getString(formData, "returningChanges"),
    
    parentName: getString(formData, "parentName"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    contactMethod: getString(formData, "contactMethod"),
    city: getString(formData, "city"),
    zip: getString(formData, "zip"),

    careType,
    
    // Conditional date fields
    ...(careType === "One-time" && {
      oneTimeDate: getString(formData, "oneTimeDate"),
    }),
    ...(careType === "Occasional" && {
      occasionalNotes: getString(formData, "occasionalNotes"),
    }),
    ...(careType === "Recurring weekends" && {
      recurringNotes: getString(formData, "recurringNotes"),
    }),
    ...(careType === "Not sure" && {
      notSureDateNotes: getString(formData, "notSureDateNotes"),
    }),
    
    ...(careType === "One-time" && {
      startTime: getString(formData, "startTime"),
      endTime: getString(formData, "endTime"),
    }),

    requestOutsideHours: getString(formData, "requestOutsideHours"),
    outsideHoursNotes: getString(formData, "outsideHoursNotes"),
    
    numChildren: getString(formData, "numChildren"),
    ages: getString(formData, "ages"),
    hasAllergiesOrNeeds: getString(formData, "hasAllergiesOrNeeds"),
    allergiesNotes: getString(formData, "allergiesNotes"),

    servicesNeeded: getString(formData, "servicesNeeded"),
    
    notes: getString(formData, "notes")
  };

  // Step 3: store submission
  let dbId: string | null = null;
  try {
    dbId = await saveKaitlynIntake(payload as any);
  } catch (err) {
    // Critical to diagnose in production: if DB inserts fail, we silently fall back to file storage.
    console.error("Kaitlyn intake DB save failed (falling back to file storage):", err);
  }
  const usedFallback = !dbId;
  const id = dbId || (await saveKaitlynIntakeFallback(payload));
  if (usedFallback && process.env.NODE_ENV === "production") {
    console.warn(
      "Kaitlyn intake stored using FILE fallback in production. This usually means DATABASE_URL is missing or Postgres insert failed."
    );
  }

  // Step 4: send email
  try {
    await maybeSendEmails(payload);
  } catch (err) {
    console.error("Intake email send failed:", err);
  }

  return { ok: true, id, storage: usedFallback ? "file" : "postgres" };
}
