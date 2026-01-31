import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import BudgetCategory from '../models/BudgetCategory';

const router = Router();

// Get all budget categories
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const categories = await BudgetCategory.find({ userId: req.userId });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget categories' });
  }
});

// Create budget category
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const category = new BudgetCategory({
      userId: req.userId,
      ...req.body,
    });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget category' });
  }
});

// Update budget category
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const category = await BudgetCategory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Budget category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget category' });
  }
});

// Delete budget category
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const category = await BudgetCategory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!category) {
      return res.status(404).json({ error: 'Budget category not found' });
    }
    res.json({ success: true, message: 'Budget category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget category' });
  }
});

export default router;
