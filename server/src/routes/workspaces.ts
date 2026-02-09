import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import WeddingWorkspace from '../models/WeddingWorkspace';
import User from '../models/User';

const router = express.Router();

// Get all workspaces for current user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Get all workspaces for this user, excluding archived ones by default
    const workspaces = await WeddingWorkspace.find({
      user_id: userId,
      'settings.archived': { $ne: true },
    })
      .sort({ lastActivity: -1 })
      .select('name weddingDate weddingType status lastActivity user_role progressMetrics settings');

    res.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Get archived workspaces
router.get('/archived', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const archivedWorkspaces = await WeddingWorkspace.find({
      user_id: userId,
      'settings.archived': true,
    })
      .sort({ 'settings.archiveDate': -1 })
      .select('name weddingDate weddingType settings user_role');

    res.json({ workspaces: archivedWorkspaces });
  } catch (error) {
    console.error('Error fetching archived workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch archived workspaces' });
  }
});

// Get single workspace by ID
router.get('/:workspaceId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check permission
    if (workspace.user_id.toString() !== userId && !workspace.teamMembers.find(m => m.userId.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ workspace });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Create new wedding workspace
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, weddingDate, weddingType, notes, userRole } = req.body;

    if (!name || !weddingDate) {
      return res.status(400).json({ error: 'Name and wedding date are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const workspace = new WeddingWorkspace({
      user_id: userId,
      user_role: userRole || user.role || 'bride',
      name,
      weddingDate: new Date(weddingDate),
      weddingType: weddingType || 'secular',
      notes,
      teamMembers: [
        {
          userId: userId,
          role: user.role === 'planner' ? 'planner' : 'couple',
          email: user.email,
        },
      ],
      lastActivity: new Date(),
    });

    await workspace.save();

    res.status(201).json({ workspace });
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Update workspace
router.put('/:workspaceId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;
    const { name, weddingDate, notes, status } = req.body;

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check permission
    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can update this workspace' });
    }

    if (name) workspace.name = name;
    if (weddingDate) workspace.weddingDate = new Date(weddingDate);
    if (notes !== undefined) workspace.notes = notes;
    if (status) workspace.status = status;

    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({ workspace });
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
});

// Rename workspace
router.patch('/:workspaceId/rename', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can rename this workspace' });
    }

    workspace.name = name;
    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({ workspace });
  } catch (error) {
    console.error('Error renaming workspace:', error);
    res.status(500).json({ error: 'Failed to rename workspace' });
  }
});

// Archive workspace
router.patch('/:workspaceId/archive', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can archive this workspace' });
    }

    workspace.settings = workspace.settings || {};
    workspace.settings.archived = true;
    workspace.settings.archiveDate = new Date();
    workspace.status = 'archived';
    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({ workspace });
  } catch (error) {
    console.error('Error archiving workspace:', error);
    res.status(500).json({ error: 'Failed to archive workspace' });
  }
});

// Restore archived workspace
router.patch('/:workspaceId/restore', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can restore this workspace' });
    }

    workspace.settings = workspace.settings || {};
    workspace.settings.archived = false;
    workspace.settings.archiveDate = undefined;
    workspace.status = 'planning';
    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({ workspace });
  } catch (error) {
    console.error('Error restoring workspace:', error);
    res.status(500).json({ error: 'Failed to restore workspace' });
  }
});

// Duplicate workspace
router.post('/:workspaceId/duplicate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;
    const { newName } = req.body;

    const originalWorkspace = await WeddingWorkspace.findById(workspaceId);

    if (!originalWorkspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (originalWorkspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the planner can duplicate this workspace' });
    }

    const duplicatedWorkspace = new WeddingWorkspace({
      user_id: userId,
      user_role: originalWorkspace.user_role,
      name: newName || `${originalWorkspace.name} (Copy)`,
      weddingDate: originalWorkspace.weddingDate,
      weddingType: originalWorkspace.weddingType,
      notes: originalWorkspace.notes,
      status: 'planning',
      teamMembers: [
        {
          userId: userId,
          role: 'couple',
          email: (await User.findById(userId))?.email || '',
        },
      ],
      lastActivity: new Date(),
    });

    await duplicatedWorkspace.save();

    res.status(201).json({ workspace: duplicatedWorkspace });
  } catch (error) {
    console.error('Error duplicating workspace:', error);
    res.status(500).json({ error: 'Failed to duplicate workspace' });
  }
});

// Delete workspace (hard delete - with confirmation)
router.delete('/:workspaceId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can delete this workspace' });
    }

    await WeddingWorkspace.deleteOne({ _id: workspaceId });

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
});

// Rename workspace
router.patch('/:workspaceId/rename', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { workspaceId } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim().length === 0) {
      return res.status(400).json({ error: 'New name is required' });
    }

    const workspace = await WeddingWorkspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (workspace.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the owner can rename this workspace' });
    }

    workspace.name = newName.trim();
    await workspace.save();

    res.json({ workspace, message: 'Workspace renamed successfully' });
  } catch (error) {
    console.error('Error renaming workspace:', error);
    res.status(500).json({ error: 'Failed to rename workspace' });
  }
});

export default router;
