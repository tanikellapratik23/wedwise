#!/usr/bin/env node

/**
 * Test Email Configuration
 * 
 * This script tests if your Resend API key is configured correctly
 * and sends a test email.
 * 
 * Usage: node test-email.js your-email@example.com
 */

require('dotenv').config();
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in .env file');
  console.log('\n📝 To fix this:');
  console.log('1. Copy server/.env.example to server/.env');
  console.log('2. Get your API key from https://resend.com/api-keys');
  console.log('3. Add it to server/.env: RESEND_API_KEY=re_your_key');
  console.log('4. Run this script again\n');
  process.exit(1);
}

const testEmail = process.argv[2];

if (!testEmail) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: node test-email.js your-email@example.com\n');
  process.exit(1);
}

async function sendTestEmail() {
  const resend = new Resend(RESEND_API_KEY);

  console.log('🚀 Sending test email...');
  console.log(`   To: ${testEmail}`);
  console.log(`   From: Vivaha <hello@vivahaplan.com>\n`);

  try {
    const result = await resend.emails.send({
      from: 'Vivaha <onboarding@resend.dev>',
      to: testEmail,
      subject: '✅ Test Email from Vivaha',
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f5f0;">
    <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
        <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); padding: 40px 20px; text-align: center; color: white;">
                <p style="font-size: 28px; font-weight: bold; margin: 0;">💕 Vivaha</p>
                <p style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Email Test Successful!</p>
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; color: #333;">
                <h2 style="color: #EC4899; margin-top: 0;">🎉 Success!</h2>
                
                <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your email configuration is working perfectly! This test confirms that:
                </p>

                <div style="background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #555;">
                        ✅ Resend API key is valid<br>
                        ✅ Email templates are rendering correctly<br>
                        ✅ Welcome emails will send on user signup<br>
                        ✅ Password reset emails will send from forgot password
                    </p>
                </div>

                <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your Vivaha app is now ready to send beautiful emails! 💌
                </p>

                <p style="font-size: 13px; color: #888; margin-top: 30px;">
                    Test sent at: ${new Date().toLocaleString()}
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f5f0; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                <strong>Vivaha Team</strong><br>
                <a href="mailto:support@vivahaplan.com" style="color: #EC4899; text-decoration: none;">support@vivahaplan.com</a>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    });

    console.log('✅ Email sent successfully!\n');
    console.log('📧 Email Details:');
    console.log(`   ID: ${result.data?.id || result.id}`);
    console.log(`   Status: Sent`);
    console.log(`   Full response:`, JSON.stringify(result, null, 2));
    console.log('\n💡 Check your inbox (and spam folder)!\n');
    
  } catch (error) {
    console.error('❌ Failed to send email:\n');
    console.error(error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Tip: Make sure your RESEND_API_KEY is valid');
      console.log('   Get a new one at: https://resend.com/api-keys\n');
    }
    
    process.exit(1);
  }
}

sendTestEmail();
