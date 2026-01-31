import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Placeholder for seating routes
router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, data: [], message: 'Seating feature coming soon' });
});

export default router;
