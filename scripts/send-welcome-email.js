#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable not set');
  console.error('');
  console.error('To get your API key:');
  console.error('1. Go to https://resend.com');
  console.error('2. Sign up (free tier available)');
  console.error('3. Get your API key from the dashboard');
  console.error('4. Run: export RESEND_API_KEY=your_key_here');
  console.error('5. Then run this script again');
  process.exit(1);
}

async function sendEmail() {
  const resend = new Resend(RESEND_API_KEY);

  // Load the compiled HTML template
  const templatePath = path.join(__dirname, 'emails', 'welcome-setup.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace template variables
  htmlContent = htmlContent
    .replace(/{{first_name}}/g, 'Pratik')
    .replace(/{{dashboard_url}}/g, 'https://app.vivaha.co')
    .replace(/{{current_year}}/g, new Date().getFullYear());

  try {
    console.log('📧 Sending email via Resend...');
    const response = await resend.emails.send({
      from: 'Vivaha <onboarding@resend.dev>',
      to: 'pratiktanikella@gmail.com',
      subject: 'Welcome to Vivaha - Start Planning Your Wedding',
      html: htmlContent,
    });

    if (response.error) {
      console.error('❌ Error:', response.error.message);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('');
    console.log('Details:');
    console.log(`  To: pratiktanikella@gmail.com`);
    console.log(`  From: Vivaha <onboarding@vivaha.co>`);
    console.log(`  Template: Welcome & Wedding Setup`);
    console.log(`  Email ID: ${response.data?.id}`);
    console.log('');
    console.log('The email should arrive in your inbox within seconds.');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

sendEmail();
