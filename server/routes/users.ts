import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { z } from 'zod';

export const usersRouter = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(300).optional(),
  semester: z.number().int().min(1).max(8).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().optional(),
});

const ALLOWED_PROFILE_FIELDS = ['name', 'bio', 'semester', 'phone', 'avatar'] as const;

// Update current user profile
usersRouter.patch('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = updateProfileSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation failed', details: parse.error.format() });
      return;
    }

    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (parse.data[field] !== undefined) {
        updates[field] = parse.data[field];
      }
    }

    const updated = await db.updateUser(req.user!.id, updates);
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password, isPremium, role, status, emailVerified, ...safe } = updated;
    res.json({ message: 'Profile updated successfully', user: safe });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update password
usersRouter.patch('/password', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long.' });
      return;
    }

    const user = await db.findUserById(req.user!.id);
    if (!user || !user.password) {
      res.status(404).json({ error: 'User account not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ error: 'Current password does not match.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(req.user!.id, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Teacher metrics endpoint
usersRouter.get('/teacher/stats', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await db.getTeacherStats(req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get teacher metrics' });
  }
});
