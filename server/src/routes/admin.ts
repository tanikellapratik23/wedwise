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

    console.log('📊 Admin stats requested - fetching from database...');

    // Get total users count (excluding admin)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    console.log(`Total users in database: ${totalUsers}`);

    // Get users with completed onboarding (excluding admin)
    const completedOnboarding = await User.countDocuments({ 
      onboardingCompleted: true,
      role: { $ne: 'admin' }
    });
    console.log(`Users with completed onboarding: ${completedOnboarding}`);
    
    // Get users by role (excluding admin)
    const usersByRole = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log(`Users by role:`, usersByRole);
    
    // Users created in last 30 days (excluding admin)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: { $ne: 'admin' }
    });
    console.log(`New users in last 30 days: ${newUsersLast30Days}`);

    // Get all bride and groom users for counting weddings (excluding admin)
    const brideGroom = await User.countDocuments({
      onboardingCompleted: true,
      role: { $in: ['bride', 'groom'] }
    });
    console.log(`Bride/Groom users: ${brideGroom}`);

    const stats = {
      totalUsers,
      completedOnboarding,
      pendingOnboarding: totalUsers - completedOnboarding,
      newUsersLast30Days,
      usersByRole,
      activeLogins: newUsersLast30Days,
      weddingsPlanned: Math.ceil(brideGroom / 2),
      venueSearches: Math.ceil(completedOnboarding * 2),
    };

    console.log('✅ Admin stats successfully generated');
    res.json({
      stats,
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats', details: (error as Error).message });
  }
});

// Get paginated users list
router.get('/users', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can access this
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    console.log(`📋 Fetching users page ${page} with limit ${limit}...`);

    // Get total count excluding admin
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Get paginated users (excluding admin)
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('name email role createdAt onboardingCompleted weddingDate')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unnamed User',
      email: user.email,
      role: user.role || 'user',
      type: user.role === 'bride' ? 'Bride' : user.role === 'groom' ? 'Groom' : user.role === 'parent' ? 'Parent' : user.role === 'friend' ? 'Friend' : user.role === 'planner' ? 'Planner' : 'Other',
      onboardingCompleted: user.onboardingCompleted || false,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      weddingDate: user.onboardingData?.weddingDate ? new Date(user.onboardingData.weddingDate).toLocaleDateString() : 'Not set',
    }));

    const totalPages = Math.ceil(totalUsers / limit);

    console.log(`✅ Retrieved ${users.length} users for page ${page}`);
    res.json({
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: (error as Error).message });
  }
});

// Check if user is admin (debug endpoint)
router.get('/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Admin verify - userId:', req.userId, 'isAdmin:', req.isAdmin);
    res.json({
      userId: req.userId,
      isAdmin: req.isAdmin,
      message: req.isAdmin ? 'You are admin' : 'You are not admin'
    });
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.status(500).json({ error: 'Failed to verify' });
  }
});

export default router;
