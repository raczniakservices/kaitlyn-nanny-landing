## Calendly setup (local)

The site already supports:
- A **Calendly popup modal** (button opens embed in-page)
- A server health check: `GET /api/calendly/ping`

### 1) Create `apps/kaitlyn-nanny/.env.local`

In Windows File Explorer:
- Go to `apps/kaitlyn-nanny`
- Create a new file named `.env.local`

Paste:

```bash
NEXT_PUBLIC_CALENDLY_URL="https://calendly.com/codyraczniak923/30min"
CALENDLY_API_TOKEN="YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN"
```

> Important: never commit real API tokens to git. If a token was ever committed, rotate it in Calendly immediately and use `.env.local` (local) / Render environment variables (production).

### 2) Restart dev server

Stop the running dev server and start again:

```bash
cd apps/kaitlyn-nanny
npm run dev
```

### 3) Verify token works

Open:
- `http://localhost:3001/api/calendly/ping`

You should see `{ "ok": true, "user": { ... } }`


