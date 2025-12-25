# Gmail SMTP Setup (Easiest Option - 2 minutes!)

## Step 1: Get a Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google", enable **2-Step Verification** if not already on
4. After 2FA is enabled, go back to **Security** → scroll to "2-Step Verification"
5. Scroll down and click **App passwords**
6. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → type "Kaitlyn Nanny Site"
7. Click **Generate**
8. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

## Step 2: Add to Render Environment Variables

In Render → kaitlyn-nanny-landing → Environment:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
KAITLYN_INTAKE_TO=kaitlyn@example.com
```

**That's it!** No DNS records, no domain verification, works immediately.

---

## Alternative: Resend (if you want custom domain emails)

If you want emails to come FROM `intake@yourdomain.com` instead of Gmail:

```
RESEND_API_KEY=re_xxxxx
KAITLYN_INTAKE_FROM=Kaitlyn Intake <intake@yourdomain.com>
KAITLYN_INTAKE_TO=kaitlyn@example.com
```

But this requires DNS setup which is why you said it was tedious.

---

## Testing

After adding the environment variables, submit a test intake form and check:
1. Kaitlyn receives email at `KAITLYN_INTAKE_TO`
2. Submitter receives confirmation email
3. Check Render logs if emails don't arrive

## Confirmation Emails

By default, submitters get a confirmation email. To disable:
```
KAITLYN_SEND_CONFIRMATION_EMAIL=false
```

