import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get admin stats
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can access this
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get users with completed onboarding (roughly "active")
    const activeUsers = await User.countDocuments({ onboardingCompleted: true });

    // Mock stats - in production these would come from actual data
    const stats = {
      totalUsers,
      activeLogins: Math.ceil(activeUsers * 0.3), // ~30% of active users currently online
      weddingsPlanned: Math.ceil(activeUsers * 0.7), // ~70% have started planning
      venueSearches: Math.ceil(activeUsers * 2), // Average 2 searches per user this month
    };

    // Get recently logged in users (mock data for demo)
    const recentUsers = await User.find()
      .select('name email createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    const loggedInUsers = recentUsers.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown',
      email: user.email,
      lastActive: user.createdAt?.toISOString() || new Date().toISOString(),
    }));

    res.json({
      stats,
      loggedInUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

export default router;
