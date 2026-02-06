import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get user's navigation preferences
router.get('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('navigationPreferences');

    res.json({
      success: true,
      preferences: user?.navigationPreferences || { order: [], hidden: [] },
    });
  } catch (error) {
    console.error('Get navigation preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch navigation preferences' });
  }
});

// Save user's navigation preferences
router.post('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { order, hidden } = req.body;

    if (!Array.isArray(order) || !Array.isArray(hidden)) {
      return res.status(400).json({ error: 'Invalid preferences format' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        navigationPreferences: {
          order,
          hidden,
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      preferences: user?.navigationPreferences,
    });
  } catch (error) {
    console.error('Save navigation preferences error:', error);
    res.status(500).json({ error: 'Failed to save navigation preferences' });
  }
});

export default router;
