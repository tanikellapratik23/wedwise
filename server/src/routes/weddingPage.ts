import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get wedding page data
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('weddingPageData onboardingData name role');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge onboarding data with wedding page data
    const pageData = {
      ...user.weddingPageData,
      // Set default couple name if user is bride/groom
      coupleName1: user.weddingPageData?.coupleName1 || (user.role === 'bride' || user.role === 'groom' ? user.name : undefined),
      weddingDate: user.weddingPageData?.weddingDate || user.onboardingData?.weddingDate,
      weddingTime: user.weddingPageData?.weddingTime || user.onboardingData?.weddingTime,
      weddingCity: user.weddingPageData?.weddingCity || user.onboardingData?.weddingCity,
      weddingState: user.weddingPageData?.weddingState || user.onboardingData?.weddingState,
      guestCount: user.weddingPageData?.guestCount || user.onboardingData?.guestCount,
    };

    res.json(pageData);
  } catch (error) {
    console.error('Get wedding page error:', error);
    res.status(500).json({ error: 'Failed to fetch wedding page data' });
  }
});

// Save wedding page data
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const pageData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { weddingPageData: pageData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Wedding page data saved successfully',
      data: user.weddingPageData,
    });
  } catch (error) {
    console.error('Save wedding page error:', error);
    res.status(500).json({ error: 'Failed to save wedding page data' });
  }
});

export default router;
