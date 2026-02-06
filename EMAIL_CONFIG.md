# Email Configuration Guide

## Quick Setup (5 minutes)

### Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to **API Keys** in the dashboard
5. Click **Create API Key**
6. Copy your API key (starts with `re_`)

### Step 2: Add API Key to Server

Open `/server/.env` and add:

```env
RESEND_API_KEY=re_your_actual_key_here
```

### Step 3: Test It

1. Restart your server: `npm run dev`
2. Try the forgot password feature
3. Check your email!

## What's Configured

✅ **Welcome Email** - Sent when users sign up  
✅ **Password Reset Email** - Sent from forgot password flow  
✅ **Vivaha Branding** - Beautiful pink/orange gradient emails  
✅ **Professional Templates** - Responsive HTML emails

## Troubleshooting

**"Email not sent" warning?**
- Check your RESEND_API_KEY is set correctly
- Make sure you restarted the server after adding the key
- Check server logs for error details

**Need a test?**
```bash
cd server
node -e "console.log(process.env.RESEND_API_KEY ? '✅ API Key Found' : '❌ No API Key')"
```

## Email Addresses

- **From**: `Vivaha <hello@vivahaplan.com>`
- **Test Mode**: Uses Resend's test email delivery
- **Production**: Configure your own domain in Resend dashboard

## Testing Tips

1. Use your own email for testing
2. Check spam folder if not seeing emails
3. In test mode, emails go to the "To" address specified
4. Console logs show email sending status

---

Need help? Check the [Resend Docs](https://resend.com/docs) or reach out!
