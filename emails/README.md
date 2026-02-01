# Vivaha Email Templates

Production-ready MJML email templates for the Vivaha wedding planning platform. All emails follow brand guidelines for multicultural, inter-religious weddings.

## Email Templates

### 1. Welcome & Wedding Setup (`welcome-setup.mjml`)
**Trigger:** User signs up  
**Goal:** Get user to complete wedding profile

**Key Features:**
- Elegant welcome message
- Value proposition explaining Vivaha benefits
- 3-step setup checklist with progress indicators
- CTA: "Complete Wedding Profile"

**Template Variables:**
- `{{first_name}}`
- `{{dashboard_url}}`
- `{{current_year}}`

---

### 2. Ceremony Plan Ready (`ceremony-ready.mjml`)
**Trigger:** User completes onboarding questionnaire  
**Goal:** Review and finalize ceremony plan

**Key Features:**
- Summary card with location, days, and selected ceremonies
- Family approval status indicator
- Explanation of why ceremony locking matters
- Status badges (Finalized/Pending)
- CTA: "Review Ceremony Plan"

**Template Variables:**
- `{{first_name}}`
- `{{city}}`
- `{{ceremony_days}}`
- `{{primary_ceremonies}}`
- `{{ceremony_count}}`
- `{{pending_approvals}}`
- `{{dashboard_url}}`

---

### 3. Decisions Need Attention (`decisions-pending.mjml`)
**Trigger:** Weekly OR when blocked items exist  
**Goal:** Prevent planning stalls without excessive notifications

**Key Features:**
- List of open items with status indicators
- Color-coded urgency levels (pending/incomplete)
- Quick stats dashboard
- Summary of approvals, vendors, budget issues
- CTA: "Review Open Decisions"

**Template Variables:**
- `{{first_name}}`
- `{{pending_items_count}}`
- `{{pending_items}}` (array with: `title`, `description`, `status`, `due_date`)
- `{{pending_approvals_count}}`
- `{{missing_vendors_count}}`
- `{{budget_conflicts_count}}`
- `{{dashboard_url}}`

---

### 4. Vendor Matches in Your City (`vendor-matches.mjml`)
**Trigger:** Location + ceremonies finalized  
**Goal:** Provide value and enable monetization

**Key Features:**
- City prominently displayed
- Categorized vendor cards (Venues, Catering, Entertainment)
- Cultural compatibility indicators
- Booking urgency alerts
- Pro tips for vendor selection
- CTA: "View All Vendors"

**Template Variables:**
- `{{city}}`
- `{{primary_culture}}`
- `{{venues}}` (array with: `name`, `capacity`, `culturally_trained`, `booking_status`)
- `{{catering}}` (array with: `name`, `cuisines`, `specialty`, `dietary_accommodations`)
- `{{entertainment}}` (array with: `name`, `specialties`, `experience`)
- `{{dashboard_url}}`

---

### 5. Wedding Week Overview (`wedding-week-overview.mjml`)
**Trigger:** 7 days before first event  
**Goal:** Reduce stress and build trust

**Key Features:**
- Daily timeline breakdown by date
- Event-level detail with time and location
- Confirmation status for each event
- Family sharing reminder
- Pre-event checklist
- Calming, supportive closing message
- CTA: "View Full Schedule"

**Template Variables:**
- `{{first_name}}`
- `{{wedding_days}}` (array with: `date`, `day_name`, `events`)
- `{{wedding_days[].events}}` (array with: `name`, `time`, `duration`, `location`, `confirmed`)
- `{{dashboard_url}}`

---

## Design System

### Colors
- **Background:** `#faf7f2` (Cream/Ivory)
- **Primary Accent:** `#8b3a3a` (Deep Maroon)
- **Secondary Accent:** `#d4a574` (Gold)
- **Text Primary:** `#2d2d2d` (Dark Gray)
- **Text Secondary:** `#666` (Medium Gray)
- **Text Tertiary:** `#999` (Light Gray)
- **Status Positive:** `#2e7d32` (Green)
- **Status Warning:** `#8b6914` (Gold)
- **Status Alert:** `#c9302c` (Red)

### Typography
- **Headers:** Garamond or Georgia (serif)
- **Body:** Segoe UI, Tahoma, Geneva (sans-serif)
- **Sizes:** 24px (main), 14-16px (body), 12-13px (secondary)

### Layout
- Card-based design with consistent padding
- Left border accents for hierarchy
- Mobile-first responsive
- Max-width: optimized for mobile-to-desktop viewing
- Consistent footer with copyright

---

## Compilation

These MJML templates need to be compiled to HTML for delivery via email service providers.

### Using mjml CLI:
```bash
npm install -g mjml

# Compile single template
mjml welcome-setup.mjml -o welcome-setup.html

# Compile all
for file in *.mjml; do mjml "$file" -o "${file%.mjml}.html"; done
```

### Using mjml Node package:
```bash
npm install mjml

# In your Node.js code
const mjml2html = require('mjml');
const fs = require('fs');

const mjmlCode = fs.readFileSync('welcome-setup.mjml', 'utf8');
const { html, errors } = mjml2html(mjmlCode);
```

---

## Integration with Email Service Providers

### SendGrid
1. Compile MJML to HTML
2. Upload as Dynamic Template
3. Use template ID in API calls
4. Pass variables as template data

### Resend
```javascript
const { Resend } = require('resend');
const resend = new Resend(API_KEY);

await resend.emails.send({
  from: 'Vivaha <hello@vivaha.co>',
  to: user.email,
  template: 'welcome-setup',
  props: {
    first_name: user.name,
    dashboard_url: 'https://app.vivaha.co'
  }
});
```

### Postmark
1. Create template in Postmark dashboard
2. Paste compiled HTML
3. Define variables in template
4. Send using API or SMTP

---

## Best Practices

✅ **Do:**
- Test emails on mobile (40%+ of opens)
- Validate placeholder variables before sending
- Include unsubscribe links in footer
- Monitor open and click rates
- Use segment-specific templates

❌ **Don't:**
- Use generic email addresses
- Include emojis (use subtle design instead)
- Use urgent language ("act now", "don't miss")
- Send without a clear CTA
- Send too frequently

---

## Version History

- **v1.0** (Feb 2026) - Initial 5-template suite
  - Welcome & Setup
  - Ceremony Plan Ready
  - Decisions Pending
  - Vendor Matches
  - Wedding Week Overview

---

## Support

For questions or modifications to templates, refer to the Copilot Instructions or reach out to the development team.
