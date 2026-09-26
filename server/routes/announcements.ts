import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { announcementSchema } from '../validation/index.js';

export const announcementsRouter = Router();

// GET announcements
announcementsRouter.get('/', async (req: Request, res: Response) => {
  try {
    let role = 'all';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const { JWT_SECRET } = await import('../middleware/auth.js');
        const decoded: any = jwt.default.verify(token, JWT_SECRET);
        role = decoded.role || 'all';
      } catch (e) {}
    }
    const announcements = await db.getAnnouncements(role);
    res.json(announcements);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// POST announcement (Teacher or Admin)
announcementsRouter.post('/', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = announcementSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { title, content, targetAudience, priority, course } = parse.data;
    const ann = await db.createAnnouncement({
      title,
      content,
      targetAudience,
      priority,
      author: req.user!.id,
      authorName: req.user!.name,
      course: course || undefined,
    });

    res.status(201).json(ann);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// DELETE announcement
announcementsRouter.delete('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    await db.deleteAnnouncement(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});
