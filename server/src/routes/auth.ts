import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import axios from 'axios';

const router = Router();

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Send welcome email to new user
const sendWelcomeEmail = async (user: any) => {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return;
  }

  try {
    const templateHtml = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Segoe UI', sans-serif; background-color: #faf7f2; margin: 0; padding: 20px;">
          <table style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 40px 20px; text-align: center; background-color: white; border-bottom: 1px solid #ede9e0;">
                <h1 style="font-family: 'Garamond', serif; color: #8b3a3a; margin: 0; font-size: 28px;">Vivaha</h1>
                <p style="color: #999; margin: 8px 0 0 0; font-size: 12px;">Multicultural Wedding Planning</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px;">
                <h2 style="font-family: 'Garamond', serif; color: #2d2d2d; margin: 0 0 16px 0;">Welcome, ${user.name}!</h2>
                <p style="color: #666; margin: 0 0 24px 0; line-height: 1.6;">
                  We're honored to help you plan a wedding that celebrates your unique traditions and brings your families together.
                </p>
                
                <div style="background-color: #f5f2ed; padding: 16px; border-radius: 6px; margin: 24px 0;">
                  <p style="color: #2d2d2d; margin: 0 0 12px 0; font-weight: 600;">Vivaha helps you:</p>
                  <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li style="margin: 8px 0;">Plan multi-day celebrations with all ceremonies and events</li>
                    <li style="margin: 8px 0;">Coordinate cultural and inter-religious rituals seamlessly</li>
                    <li style="margin: 8px 0;">Include family members while keeping decisions organized</li>
                    <li style="margin: 8px 0;">Find local vendors who understand your vision</li>
                  </ul>
                </div>

                <p style="color: #666; margin: 24px 0 16px 0; font-weight: 600;">Get Started in 3 Steps:</p>
                <div style="background-color: white; border: 1px solid #ede9e0; border-radius: 6px; overflow: hidden;">
                  <div style="padding: 14px; border-bottom: 1px solid #ede9e0;">
                    <span style="background-color: #8b3a3a; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">1</span>
                    <strong style="color: #2d2d2d; margin-left: 8px;">Add Wedding Dates</strong>
                  </div>
                  <div style="padding: 14px; border-bottom: 1px solid #ede9e0;">
                    <span style="background-color: #8b3a3a; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">2</span>
                    <strong style="color: #2d2d2d; margin-left: 8px;">Select Ceremonies</strong>
                  </div>
                  <div style="padding: 14px;">
                    <span style="background-color: #8b3a3a; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600;">3</span>
                    <strong style="color: #2d2d2d; margin-left: 8px;">Set Your Location</strong>
                  </div>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${process.env.APP_URL || 'https://app.vivaha.co'}/dashboard/onboarding" style="background-color: #8b3a3a; color: white; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; display: inline-block;">
                    Complete Wedding Profile
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; background-color: #f5f2ed; text-align: center; border-top: 1px solid #ede9e0;">
                <p style="color: #999; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Vivaha. Planning with purpose.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'Vivaha <onboarding@resend.dev>',
        to: user.email,
        subject: 'Welcome to Vivaha - Start Planning Your Wedding',
        html: templateHtml,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Welcome email sent to:', user.email);
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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', user._id);

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '30d',
    });

    res.json({
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

export default router;
