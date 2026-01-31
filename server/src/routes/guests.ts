import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Guest from '../models/Guest';

const router = Router();

// Get all guests
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guests = await Guest.find({ userId: req.userId });
    res.json({ success: true, data: guests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// Create guest
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guest = new Guest({
      userId: req.userId,
      ...req.body,
    });
    await guest.save();
    res.status(201).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create guest' });
  }
});

// Update guest
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guest = await Guest.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

// Delete guest
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const guest = await Guest.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ success: true, message: 'Guest deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

export default router;
