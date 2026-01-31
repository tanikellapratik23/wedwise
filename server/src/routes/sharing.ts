import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import crypto from 'crypto';

const router = Router();

// Generate shareable link
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { accessLevel } = req.body; // 'view' or 'edit'

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex');
    const shareLink = `${process.env.CLIENT_URL || 'http://localhost:5174'}/shared/${shareToken}`;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          sharedLinks: {
            token: shareToken,
            accessLevel: accessLevel || 'view',
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
          },
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      shareLink,
      shareToken,
      accessLevel: accessLevel || 'view',
    });
  } catch (error) {
    console.error('Share link generation error:', error);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

// Get all shared links for user
router.get('/links', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('sharedLinks');

    res.json({
      success: true,
      links: user?.sharedLinks || [],
    });
  } catch (error) {
    console.error('Get shared links error:', error);
    res.status(500).json({ error: 'Failed to fetch shared links' });
  }
});

// Revoke a shared link
router.delete('/:token', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { token } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { sharedLinks: { token } },
    });

    res.json({
      success: true,
      message: 'Share link revoked',
    });
  } catch (error) {
    console.error('Revoke link error:', error);
    res.status(500).json({ error: 'Failed to revoke link' });
  }
});

// Access shared dashboard (no auth required)
router.get('/access/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      'sharedLinks.token': token,
    }).select('onboardingData sharedLinks');

    if (!user) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }

    const sharedLink = user.sharedLinks?.find((link: any) => link.token === token);

    if (!sharedLink) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    // Check if expired
    if (sharedLink.expiresAt && new Date(sharedLink.expiresAt) < new Date()) {
      return res.status(403).json({ error: 'Share link has expired' });
    }

    res.json({
      success: true,
      accessLevel: sharedLink.accessLevel,
      userData: user.onboardingData,
      coupleName: user.onboardingData?.role || 'Couple',
    });
  } catch (error) {
    console.error('Access shared link error:', error);
    res.status(500).json({ error: 'Failed to access shared dashboard' });
  }
});

export default router;
