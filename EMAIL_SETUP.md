# Email Setup Guide for VivahaPlan

## Overview
Automatic welcome emails are sent to users when they sign up. The system uses **Resend** for email delivery.

## Quick Setup

### Step 1: Create a Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address
4. Go to the API Keys section and copy your API key

### Step 2: Set Environment Variables
Add this to your `.env` file in the `/server` directory:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Deploy
Push your changes to trigger a backend redeploy on Render.

### Step 4: Test
1. Sign up for a new account on the frontend
2. Check the email inbox for the welcome email
3. If using Resend's test domain, emails go to the configured test email

## Email Templates

Templates are automatically sent on user actions:

### 1. Welcome Email
- **Trigger**: User registration
- **Template**: VivahaPlan welcome email with platform overview
- **Location**: [server/src/routes/auth.ts](server/src/routes/auth.ts#L20)

### 2. Feature Announcement (Future)
- Manual send to all users
- HTML template: [emails/bachelor-trip-feature.html](emails/bachelor-trip-feature.html)

### 3. Engagement Reminder (Future)
- Manual send to inactive users
- HTML template: [emails/engagement-reminder.html](emails/engagement-reminder.html)

## Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY is set in Render environment variables
- Check server logs on Render for email errors
- Try signing up again to trigger the email

**Test Domain Limitation**
Resend's free tier uses a test domain (`resend.dev`). Emails may go to spam or a configured test inbox.

**To use a custom domain:**
1. Add your domain to Resend DNS settings
2. Update the `from` field in auth.ts from `hello@vivahaplan.com` to your configured domain

## Email Content

All emails include:
- Modern HTML design matching VivahaPlan branding
- Personalization with user name
- Call-to-action buttons
- UTM tracking for analytics
- Social media links
- Responsive mobile design

## Future: Manual Email Broadcasts

To add manual email blast functionality:

1. Create an admin endpoint: `POST /api/email/broadcast`
2. Add email template selection
3. Add recipient filters (all users, by ceremony date, etc.)
4. Use Resend batch sending for efficiency

Example:
```typescript
router.post('/email/broadcast', authMiddleware, async (req, res) => {
  // Admin-only endpoint to send bulk emails
  const { template, recipientFilter } = req.body;
  // Fetch matching users and send via Resend
});
```

## Cost

- **Resend Free Tier**: 100 emails/day (great for starting)
- **Resend Paid**: $20/month for unlimited emails + proper domain setup

For a wedding planning app, 100/day is plenty during beta.
