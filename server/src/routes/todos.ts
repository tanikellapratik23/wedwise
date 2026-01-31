import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Todo from '../models/Todo';

const router = Router();

// Get all todos
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId });
    res.json({ success: true, data: todos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create todo
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const todo = new Todo({
      userId: req.userId,
      ...req.body,
    });
    await todo.save();
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true, message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
