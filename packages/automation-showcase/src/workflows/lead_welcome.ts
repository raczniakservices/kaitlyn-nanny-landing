import { AutomationArtifact, AutomationStep } from '../types';
import { isoNow, shortId, sleep, safeJson } from '../utils';

type Params = {
    dryRun: boolean;
    inputs?: Record<string, unknown>;
};

export async function runLeadWelcomeSequence(params: Params): Promise<{
    title: string;
    steps: AutomationStep[];
    artifacts: { artifact: AutomationArtifact; content: string }[];
    stats: Record<string, number>;
}> {
    const { dryRun } = params;

    const steps: AutomationStep[] = [];
    const artifacts: { artifact: AutomationArtifact; content: string }[] = [];

    // Step 1: "Inbound lead" intake (fake payload)
    const leadId = shortId('lead');
    const businessId = shortId('biz');
    const start1 = isoNow();
    await sleep(120);
    const leadPayload = {
        leadId,
        businessId,
        source: 'instantquote_widget',
        receivedAt: isoNow(),
        contact: {
            name: 'Jordan Taylor',
            email: 'jordan.taylor@example.com',
            phone: '+1-410-555-0199'
        },
        job: {
            service: 'roofing',
            urgency: 'this_week',
            notes: 'Small leak near chimney. Need estimate ASAP.',
            photos: ['photo_1.jpg', 'photo_2.jpg']
        }
    };
    steps.push({
        id: shortId('step'),
        name: 'Ingest inbound lead',
        startedAt: start1,
        finishedAt: isoNow(),
        status: 'success',
        summary: `Accepted inbound lead ${leadId} (source: InstantQuote widget)`,
        data: { leadId, businessId, source: leadPayload.source }
    });

    artifacts.push({
        artifact: {
            name: 'lead_payload.json',
            type: 'json',
            relPath: 'artifacts/lead_payload.json',
            summary: 'Fake inbound lead payload (for demo)'
        },
        content: safeJson(leadPayload)
    });

    // Step 2: Enrichment (mock)
    const start2 = isoNow();
    await sleep(180);
    const enrichment = {
        emailDeliverability: 'likely_deliverable',
        geo: { city: 'Bel Air', region: 'Harford County, MD' },
        homeownerIntentScore: 92,
        duplicateCheck: 'no_duplicate_found'
    };
    steps.push({
        id: shortId('step'),
        name: 'Enrich lead (email/geo/dup-check)',
        startedAt: start2,
        finishedAt: isoNow(),
        status: 'success',
        summary: 'Enriched lead with geo + deliverability + duplicate check',
        data: enrichment
    });

    // Step 3: Route + create CRM record (dry-run)
    const start3 = isoNow();
    await sleep(140);
    const crmPayload = {
        op: 'upsert_lead',
        dryRun,
        lead: {
            id: leadId,
            name: leadPayload.contact.name,
            email: leadPayload.contact.email,
            phone: leadPayload.contact.phone,
            service: leadPayload.job.service,
            urgency: leadPayload.job.urgency,
            intentScore: enrichment.homeownerIntentScore,
            tags: ['instantquote', 'hot_lead', 'photos_attached']
        },
        routing: {
            team: 'Inside Sales',
            owner: 'AE-1',
            slaMinutes: 10
        }
    };
    steps.push({
        id: shortId('step'),
        name: 'Route + create CRM lead',
        startedAt: start3,
        finishedAt: isoNow(),
        status: dryRun ? 'skipped' : 'success',
        summary: dryRun ? 'Dry-run: would upsert CRM lead + assign owner' : 'Upserted CRM lead + assigned owner',
        data: { slaMinutes: 10, owner: 'AE-1' }
    });
    artifacts.push({
        artifact: {
            name: 'crm_payload.json',
            type: 'json',
            relPath: 'artifacts/crm_payload.json',
            summary: 'The payload we would send to CRM (demo)'
        },
        content: safeJson(crmPayload)
    });

    // Step 4: Notifications (email + SMS) previews
    const start4 = isoNow();
    await sleep(160);
    const emailHtml = `<!doctype html>
<html>
  <body style="font-family:system-ui,Segoe UI,Arial,sans-serif; line-height:1.4">
    <h2>New InstantQuote lead: ${leadPayload.job.service.toUpperCase()} (${leadPayload.job.urgency.replaceAll('_', ' ')})</h2>
    <p><b>${leadPayload.contact.name}</b> requested an estimate.</p>
    <ul>
      <li><b>Email:</b> ${leadPayload.contact.email}</li>
      <li><b>Phone:</b> ${leadPayload.contact.phone}</li>
      <li><b>Intent score:</b> ${enrichment.homeownerIntentScore}/100</li>
      <li><b>Notes:</b> ${leadPayload.job.notes}</li>
    </ul>
    <p style="padding:12px; background:#f6f7f9; border-radius:8px">
      Next best action: <b>call within 10 minutes</b> to lock the job.
    </p>
  </body>
</html>`;

    const smsText = `InstantQuote lead (${leadPayload.job.service}): ${leadPayload.contact.name} ${leadPayload.contact.phone} — ${leadPayload.job.notes} (intent ${enrichment.homeownerIntentScore}/100)`;

    steps.push({
        id: shortId('step'),
        name: 'Notify (email + SMS)',
        startedAt: start4,
        finishedAt: isoNow(),
        status: dryRun ? 'skipped' : 'success',
        summary: dryRun ? 'Dry-run: generated email + SMS previews' : 'Sent email + SMS notifications',
        data: { channels: ['email', 'sms'] }
    });

    artifacts.push({
        artifact: {
            name: 'email_preview.html',
            type: 'html',
            relPath: 'artifacts/email_preview.html',
            summary: 'HTML email preview (demo)'
        },
        content: emailHtml
    });
    artifacts.push({
        artifact: {
            name: 'sms_preview.txt',
            type: 'text',
            relPath: 'artifacts/sms_preview.txt',
            summary: 'SMS body preview (demo)'
        },
        content: smsText
    });

    // Step 5: Follow-up scheduling
    const start5 = isoNow();
    await sleep(120);
    const followups = [
        { atMinutes: 10, action: 'Call lead' },
        { atMinutes: 60, action: 'Send 2nd text (if no contact)' },
        { atMinutes: 24 * 60, action: 'Re-engage email w/ availability' }
    ];
    steps.push({
        id: shortId('step'),
        name: 'Schedule follow-ups',
        startedAt: start5,
        finishedAt: isoNow(),
        status: dryRun ? 'skipped' : 'success',
        summary: dryRun ? 'Dry-run: would schedule follow-up tasks' : 'Scheduled follow-up tasks',
        data: { count: followups.length }
    });
    artifacts.push({
        artifact: {
            name: 'followups.json',
            type: 'json',
            relPath: 'artifacts/followups.json',
            summary: 'Follow-up plan (demo)'
        },
        content: safeJson({ leadId, followups })
    });

    return {
        title: 'InstantQuote Lead Intake → Enrichment → Notifications',
        steps,
        artifacts,
        stats: {
            notifications_prepared: 2,
            followups_planned: followups.length,
            intent_score: enrichment.homeownerIntentScore
        }
    };
}







