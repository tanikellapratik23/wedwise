import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Save onboarding data
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const onboardingData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingCompleted: true,
        onboardingData,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Onboarding completed',
      user: {
        id: user._id,
        onboardingCompleted: user.onboardingCompleted,
        onboardingData: user.onboardingData,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Get onboarding data
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('onboardingData onboardingCompleted');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.onboardingData || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch onboarding data' });
  }
});

// Update onboarding/settings data
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingData: updatedData,
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.onboardingData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
