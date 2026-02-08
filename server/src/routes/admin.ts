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

    // Get users with completed onboarding
    const completedOnboarding = await User.countDocuments({ onboardingCompleted: true });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get all bride and groom users for counting weddings
    const brideGroom = await User.countDocuments({
      onboardingCompleted: true,
      role: { $in: ['bride', 'groom'] }
    });

    const stats = {
      totalUsers,
      completedOnboarding,
      pendingOnboarding: totalUsers - completedOnboarding,
      newUsersLast30Days,
      usersByRole,
      activeLogins: newUsersLast30Days, // Active logins = new users in last 30 days
      weddingsPlanned: Math.ceil(brideGroom / 2), // Approximate couples (brides + grooms) / 2
      venueSearches: Math.ceil(completedOnboarding * 2),
    };

    // Get recently registered users (last 30 days) sorted by creation date
    const recentUsers = await User.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
      .select('name email role createdAt onboardingCompleted')
      .limit(20)
      .sort({ createdAt: -1 });

    const loggedInUsers = recentUsers.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role || 'user',
      onboardingCompleted: user.onboardingCompleted || false,
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
