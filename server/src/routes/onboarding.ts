import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Save onboarding data
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const onboardingData = req.body;

    console.log('📝 Saving onboarding for user:', userId);

    // Ensure all fields are preserved
    const updateData = {
      onboardingCompleted: true,
      onboardingData: {
        ...onboardingData,
        wantsBachelorParty: onboardingData.wantsBachelorParty || false,
      },
    };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Onboarding saved! User now has onboardingCompleted:', user.onboardingCompleted);

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
    console.error('Onboarding save error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Get onboarding data
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    console.log('📖 Fetching onboarding data for user:', userId);
    
    const user = await User.findById(userId).select('onboardingData onboardingCompleted');

    if (!user) {
      console.warn('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Fetched onboarding data:', user.onboardingData);
    res.json(user.onboardingData || {});
  } catch (error) {
    console.error('❌ Error fetching onboarding data:', error);
    res.status(500).json({ error: 'Failed to fetch onboarding data' });
  }
});

// Update onboarding/settings data
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const updatedData = req.body;

    console.log('📝 Updating onboarding data for user:', userId);
    console.log('📊 Updated data:', updatedData);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingData: updatedData,
        onboardingCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      console.warn('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Onboarding data updated successfully');
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.onboardingData,
    });
  } catch (error) {
    console.error('❌ Error updating onboarding data:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
