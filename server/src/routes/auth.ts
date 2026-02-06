import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import axios from 'axios';
import { Resend } from 'resend';

const router = Router();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Send welcome email to new user
const sendWelcomeEmail = async (user: any) => {
  if (!resend) {
    console.warn('⚠️ Resend API not configured - welcome emails disabled');
    return;
  }

  try {
    const result = await resend.emails.send({
      from: 'Vivaha <hello@vivahaplan.com>',
      to: user.email,
      subject: 'Welcome to Vivaha – Start Planning Your Dream Wedding! 💕',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Vivaha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f5f0;">
    <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
        <tr>
            <td style="background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); padding: 40px 20px; text-align: center; color: white;">
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 0;">💕 Vivaha</p>
                <p style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Your Complete Wedding Planning Platform</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #FEF3F2; padding: 40px 20px; text-align: center; color: #EC4899; font-size: 48px;">
                👰💒🤵
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; color: #333;">
                <div style="font-size: 22px; font-weight: bold; color: #EC4899; margin-bottom: 20px;">Welcome, ${user.name}! 🎉</div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    We're thrilled you've joined Vivaha! Whether you're planning an intimate ceremony or a grand celebration, we're here to make your wedding journey seamless and joyful.
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    Here's what you can do right now:
                </p>

                <div style="background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #EC4899; font-weight: bold; margin-right: 12px; font-size: 18px;">📋</div>
                        <div><strong>Ceremony Planner</strong> – Organize rituals, timelines, and logistics in one place</div>
                    </div>
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #EC4899; font-weight: bold; margin-right: 12px; font-size: 18px;">👥</div>
                        <div><strong>Guest List Manager</strong> – Track invites, RSVPs, and dietary preferences</div>
                    </div>
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #EC4899; font-weight: bold; margin-right: 12px; font-size: 18px;">💰</div>
                        <div><strong>Budget Tracker</strong> – Monitor spending across vendors and categories</div>
                    </div>
                    <div style="font-size: 14px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #EC4899; font-weight: bold; margin-right: 12px; font-size: 18px;">🎉</div>
                        <div><strong>Bachelor/Bachelorette Planner</strong> – Plan trips, activities, and cost-sharing</div>
                    </div>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="https://vivahaplan.com/dashboard?utm_source=email&utm_campaign=welcome&utm_medium=cta" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Start Planning Now</a>
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your wedding planning journey starts here. Let's make it unforgettable! 💕
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f5f0; padding: 30px; text-align: center; font-size: 12px; color: #888;">
                <div style="margin-bottom: 15px;">
                    <a href="https://instagram.com/vivaha?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #EC4899; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">f</a>
                    <a href="https://instagram.com/vivaha?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #EC4899; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">📷</a>
                    <a href="https://twitter.com/vivaha?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #EC4899; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">𝕏</a>
                </div>
                
                <div style="margin: 10px 0;">
                    <a href="https://vivahaplan.com?utm_source=email&utm_campaign=welcome" style="color: #EC4899; text-decoration: none; margin: 0 10px;">Website</a>
                    <a href="https://vivahaplan.com/contact?utm_source=email&utm_campaign=welcome" style="color: #EC4899; text-decoration: none; margin: 0 10px;">Contact Us</a>
                    <a href="https://vivahaplan.com/privacy?utm_source=email&utm_campaign=welcome" style="color: #EC4899; text-decoration: none; margin: 0 10px;">Privacy</a>
                </div>

                <div style="margin: 10px 0;">
                    <strong>Vivaha Team</strong><br>
                    Making wedding planning joyful since 2024<br>
                    <a href="mailto:support@vivahaplan.com" style="color: #EC4899; text-decoration: none;">support@vivahaplan.com</a>
                </div>

                <div style="margin-top: 20px; font-size: 11px; color: #aaa;">
                    © ${new Date().getFullYear()} Vivaha. All rights reserved.<br>
                    You're receiving this because you signed up for Vivaha.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
      `,
    });

    if (result.error) {
      console.error('Failed to send welcome email:', result.error);
      return;
    }

    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - email failure shouldn't block registration
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { name, email });

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    console.log('User created successfully:', user._id);

    // Send welcome email in background (don't await)
    sendWelcomeEmail(user).catch(err => console.error('Email error:', err));

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Admin Credentials
const ADMIN_CREDENTIALS = {
  emails: ['pratiktanikella', 'pratiktanikella@gmail.com'],
  password: 'DqAmcCB4/',
};

// Check if email matches admin
const isAdminEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_CREDENTIALS.emails.some(adminEmail => 
    normalizedEmail === adminEmail || normalizedEmail === adminEmail.toLowerCase()
  );
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    console.log('Login attempt:', normalizedEmail);

    // Step 1: Check if admin credentials
    if (isAdminEmail(normalizedEmail) && password === ADMIN_CREDENTIALS.password) {
      console.log('✅ Admin login successful:', normalizedEmail);
      
      // Generate admin token
      const token = jwt.sign(
        { userId: 'admin', isAdmin: true, email: normalizedEmail },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: 'admin',
          name: 'Admin',
          email: normalizedEmail,
          isAdmin: true,
          onboardingCompleted: true,
        },
      });
    }

    // Step 2: Check regular users
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) {
      console.log('User not found:', normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Step 3: Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', normalizedEmail);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User login successful:', user._id);

    // Step 4: Generate user token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin || false },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    console.log('📋 Returning user data on login:', {
      id: user._id,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
      isAdmin: user.isAdmin || false,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Forgot password - send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '1h' }
    );

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    if (resend) {
      try {
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        
        const emailResult = await resend.emails.send({
          from: 'Vivaha <hello@vivahaplan.com>',
          to: user.email,
          subject: '🔐 Reset Your Vivaha Password',
          html: `
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
                    Hi ${user.name},
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    We received a request to reset your password. Click the button below to create a new password and get back to planning your special day.
                </p>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Reset My Password</a>
                </p>

                <div style="background-color: #FFF7ED; border-left: 4px solid #F97316; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <p style="font-size: 14px; color: #555; margin: 0;">
                        <strong>🕐 Quick note:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
                    </p>
                </div>

                <p style="font-size: 13px; color: #888; line-height: 1.6;">
                    Or copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #EC4899; word-break: break-all;">${resetUrl}</a>
                </p>

                <p style="font-size: 13px; color: #888; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                    <strong>Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged.
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f5f0; padding: 30px; text-align: center; font-size: 12px; color: #888;">
                <div style="margin: 10px 0;">
                    <strong>Vivaha Team</strong><br>
                    Making wedding planning joyful<br>
                    <a href="mailto:support@vivahaplan.com" style="color: #EC4899; text-decoration: none;">support@vivahaplan.com</a>
                </div>

                <div style="margin-top: 20px; font-size: 11px; color: #aaa;">
                    © ${new Date().getFullYear()} Vivaha. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`,
        });

        console.log('✅ Password reset email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send reset email:', emailError);
        // Continue anyway - don't fail the request if email fails
      }
    } else {
      console.warn('⚠️ Email not sent - Resend API key not configured');
    }

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password - validate token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
      );
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired reset link' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({ error: 'Invalid reset link' });
    }

    // Find user and verify token
    const user = await User.findById(decoded.userId);
    if (!user || user.resetToken !== token) {
      return res.status(401).json({ error: 'Invalid reset link' });
    }

    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return res.status(401).json({ error: 'Reset link has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
