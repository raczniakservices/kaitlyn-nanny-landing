## Kaitlyn Nanny Landing Page

Premium, calm landing page + intake form for **Kaitlyn Noel Raczniak**.

### Run locally

```bash
cd apps/kaitlyn-nanny
npm install
npm run dev
```

### Submissions (MVP)

- If `DATABASE_URL` is set (recommended), submissions are stored in Postgres (table: `kaitlyn_intakes`).
- If `DATABASE_URL` is **not** set, submissions fall back to a JSON file:
  - **development**: `apps/kaitlyn-nanny/data/kaitlyn-intakes.json` (if that folder exists), otherwise `<repo>/data/kaitlyn-intakes.json`
  - **production**: the server’s temp directory (ephemeral)

Optional override:

- `KAITLYN_DATA_DIR`: force the folder where the fallback JSON file is stored (useful with a Render disk mount).

### Optional: email notifications (recommended)

If you set these env vars, each submission will email Kaitlyn using the Resend API:

- `RESEND_API_KEY`
- `KAITLYN_INTAKE_TO` (destination email)
- `KAITLYN_INTAKE_FROM` (verified sender, e.g. `Kaitlyn Intake <intake@yourdomain.com>`)
- `KAITLYN_SEND_CONFIRMATION_EMAIL` (optional, default `true`; set to `false` to only email Kaitlyn)

No secrets are hardcoded.

### Resend + Render setup (quick)

- Create a Resend account and add an API key.
- In Render service **`kaitlyn-nanny-landing`**, set env vars:
  - `RESEND_API_KEY`
  - `KAITLYN_INTAKE_TO` = Kaitlyn’s email
  - `KAITLYN_INTAKE_FROM` = a verified sender (domain recommended)

### Optional: Calendly embed + API (recommended)

You can show a premium “Check open weekends” popup and (optionally) connect the Calendly API.

- **Calendly popup (client-side)**:
  - Set `NEXT_PUBLIC_CALENDLY_URL` to your Calendly scheduling link (e.g. your event type link).
  - When set, the landing page shows a button that opens a modal with Calendly embedded.

- **Calendly API (server-side)**:
  - Set `CALENDLY_API_TOKEN` (Calendly Personal Access Token).
  - Then you can verify connectivity at `GET /api/calendly/ping`.

Example env vars:

```bash
NEXT_PUBLIC_CALENDLY_URL="https://calendly.com/your-slug/your-event"
CALENDLY_API_TOKEN="***"
```

### Render deploy notes

This repo includes a Render service entry in `render.yaml`:

- **Build command**: `npm install --no-audit --no-fund && npm run build`
- **Start command**: `npm run start`


