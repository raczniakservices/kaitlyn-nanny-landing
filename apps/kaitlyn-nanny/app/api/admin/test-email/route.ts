import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: any, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache"
    }
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
    }),
    cache: "no-store"
  });

  const bodyText = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`Resend email failed (${res.status}): ${bodyText || res.statusText}`);
  }

  // Resend returns JSON on success; we don't strictly need it, but it's helpful for debugging.
  try {
    return JSON.parse(bodyText);
  } catch {
    return { ok: true, raw: bodyText };
  }
}

export async function GET() {
  const resendKey = String(process.env.RESEND_API_KEY || "").trim();
  const to = String(process.env.KAITLYN_INTAKE_TO || "").trim();
  const from = String(process.env.KAITLYN_INTAKE_FROM || "").trim() || "onboarding@resend.dev";

  if (!to) {
    return json(
      {
        ok: false,
        error: "Missing KAITLYN_INTAKE_TO",
        hasResendKey: Boolean(resendKey)
      },
      500
    );
  }

  if (!resendKey) {
    return json(
      {
        ok: false,
        error: "Missing RESEND_API_KEY",
        to,
        from
      },
      500
    );
  }

  const now = new Date().toISOString();
  const subject = `Test email (${now})`;
  const text =
    `This is a test email from kaitlyn-nanny-landing.\n` +
    `Time: ${now}\n` +
    `To: ${to}\n` +
    `From: ${from}\n`;

  try {
    const result = await sendResendEmail({ to: [to], subject, text, resendKey, from });
    return json({ ok: true, sent: true, to, from, result });
  } catch (err: any) {
    console.error("Admin test-email failed:", err);
    return json(
      {
        ok: false,
        error: String(err?.message || err),
        to,
        from,
        hasResendKey: true
      },
      502
    );
  }
}


