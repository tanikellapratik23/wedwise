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
      from: 'VivahaPlan <hello@vivahaplan.com>',
      to: user.email,
      subject: 'Welcome to VivahaPlan – Start Planning Your Dream Vivaha!',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to VivahaPlan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f5f0;">
    <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
        <tr>
            <td style="background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%); padding: 40px 20px; text-align: center; color: white;">
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 1px; margin: 0;">🌟 VivahaPlan</p>
                <p style="font-size: 14px; margin-top: 8px; opacity: 0.9;">Your Complete Wedding Planning Platform</p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f5e6d3; padding: 40px 20px; text-align: center; color: #8B4513; font-size: 48px;">
                👰💒🤵
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px; color: #333;">
                <div style="font-size: 22px; font-weight: bold; color: #8B4513; margin-bottom: 20px;">Welcome, ${user.name}! 🎉</div>
                
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    We're thrilled you've joined VivahaPlan! Whether you're planning an intimate ceremony or a grand celebration, we're here to make your wedding journey seamless and joyful.
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                    Here's what you can do right now:
                </p>

                <div style="background-color: #faf6f1; border-left: 4px solid #D4A574; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #8B4513; font-weight: bold; margin-right: 12px; font-size: 18px;">📋</div>
                        <div><strong>Ceremony Planner</strong> – Organize rituals, timelines, and logistics in one place</div>
                    </div>
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #8B4513; font-weight: bold; margin-right: 12px; font-size: 18px;">👥</div>
                        <div><strong>Guest List Manager</strong> – Track invites, RSVPs, and dietary preferences</div>
                    </div>
                    <div style="font-size: 14px; margin-bottom: 12px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #8B4513; font-weight: bold; margin-right: 12px; font-size: 18px;">💰</div>
                        <div><strong>Budget Tracker</strong> – Monitor spending across vendors and categories</div>
                    </div>
                    <div style="font-size: 14px; color: #555; display: flex; align-items: flex-start;">
                        <div style="color: #8B4513; font-weight: bold; margin-right: 12px; font-size: 18px;">🎉</div>
                        <div><strong>Bachelor/Bachelorette Planner</strong> – Plan trips, activities, and cost-sharing</div>
                    </div>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="https://vivahaplan.com/dashboard?utm_source=email&utm_campaign=welcome&utm_medium=cta" style="display: inline-block; background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Start Planning Now</a>
                </p>

                <p style="font-size: 15px; line-height: 1.6; color: #555;">
                    Your wedding planning journey starts here. Let's make it unforgettable! 💕
                </p>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f5f0; padding: 30px; text-align: center; font-size: 12px; color: #888;">
                <div style="margin-bottom: 15px;">
                    <a href="https://instagram.com/vivahaplan?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #D4A574; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">f</a>
                    <a href="https://instagram.com/vivahaplan?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #D4A574; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">📷</a>
                    <a href="https://twitter.com/vivahaplan?utm_source=email&utm_campaign=welcome" style="display: inline-block; width: 36px; height: 36px; background-color: #D4A574; border-radius: 50%; line-height: 36px; text-align: center; margin: 0 5px; color: white; text-decoration: none; font-size: 16px;">𝕏</a>
                </div>
                
                <div style="margin: 10px 0;">
                    <a href="https://vivahaplan.com?utm_source=email&utm_campaign=welcome" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Website</a>
                    <a href="https://vivahaplan.com/contact?utm_source=email&utm_campaign=welcome" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Contact Us</a>
                    <a href="https://vivahaplan.com/privacy?utm_source=email&utm_campaign=welcome" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Privacy</a>
                </div>

                <div style="margin: 10px 0;">
                    <strong>VivahaPlan Team</strong><br>
                    Making wedding planning joyful since 2024<br>
                    <a href="mailto:support@vivahaplan.com" style="color: #8B4513; text-decoration: none;">support@vivahaplan.com</a>
                </div>

                <div style="margin-top: 20px; font-size: 11px; color: #aaa;">
                    © 2024 VivahaPlan. All rights reserved.<br>
                    You're receiving this because you signed up for VivahaPlan.
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

export default router;
