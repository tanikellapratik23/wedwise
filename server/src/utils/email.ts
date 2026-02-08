import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Constants for email configuration
const EMAIL_FROM = 'Vivaha <noreply@vivahaplan.com>';
const FALLBACK_FROM = 'Vivaha <onboarding@resend.dev>'; // Fallback for testing

/**
 * Send email using Resend
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @returns Promise with send result
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Validate API key
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured in environment');
    throw new Error('Email service not configured');
  }

  if (!resend) {
    console.error('❌ Resend instance not initialized');
    throw new Error('Email service error');
  }

  try {
    console.log(`📧 Sending email to ${to}`);
    
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error(`❌ Email service error: ${result.error.message}`);
      throw result.error;
    }

    console.log(`✅ Email sent successfully`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param email - User email
 * @param userName - User name for personalization
 * @param resetUrl - Password reset URL with token
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetUrl: string
) {
  const html = generateResetPasswordEmailHTML(userName, resetUrl);
  
  return sendEmail({
    to: email,
    subject: '🔐 Reset Your Vivaha Password',
    html,
  });
}

/**
 * Generate reset password email HTML
 */
function generateResetPasswordEmailHTML(userName: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f5f0;">
    <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
        <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); padding: 40px 20px; text-align: center; color: white;">
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 0;">💕 Vivaha</p>
                <p style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Your Wedding Planning Companion</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #FEF3F2; padding: 40px 20px; text-align: center; font-size: 48px;">
                🔐
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; color: #333;">
                <div style="font-size: 22px; font-weight: bold; color: #EC4899; margin-bottom: 20px;">Reset Your Password</div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    Hi ${userName},
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0;">Reset My Password</a>
                </p>

                <div style="background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <p style="font-size: 14px; color: #555; margin: 0;">
                        <strong>🕐 Quick note:</strong> This link expires in <strong>1 hour</strong>.
                    </p>
                </div>

                <p style="font-size: 13px; color: #888; line-height: 1.6;">
                    Or copy and paste this link in your browser:<br>
                    <a href="${resetUrl}" style="color: #EC4899; word-break: break-all;">${resetUrl}</a>
                </p>

                <p style="font-size: 13px; color: #888; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <strong>Didn't request this?</strong> Ignore this email and your password will remain unchanged.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f5f0; padding: 30px; text-align: center; font-size: 12px; color: #888;">
                <div style="margin: 10px 0;">
                    <strong>Vivaha Team</strong><br>
                    <a href="https://vivahaplan.com" style="color: #EC4899; text-decoration: none;">vivahaplan.com</a>
                </div>
                <div style="margin-top: 15px; font-size: 11px;">
                    © ${new Date().getFullYear()} Vivaha. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`;
}

export { Resend };
