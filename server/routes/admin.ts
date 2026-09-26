import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { z } from 'zod';

export const adminRouter = Router();

// Platform Stats
adminRouter.get('/stats', authenticateToken, requireRoles(['admin']), async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute admin statistics' });
  }
});

// List Users with pagination, role, search
adminRouter.get('/users', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const filter: any = {};
    if (role && role !== 'all') filter.role = role;
    if (search) filter.search = String(search);

    const result = await db.getUsers(filter, Number(page), Number(limit));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve user accounts' });
  }
});

// Create New User (Admin only - to create Teacher / Faculty or Admin accounts)
adminRouter.post('/users', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const createUserSchema = z.object({
      name: z.string().min(2, 'Full name must be at least 2 characters'),
      email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
      password: z.string().min(8, 'Password must be at least 8 characters long'),
      role: z.enum(['student', 'teacher', 'admin']),
      semester: z.number().int().min(1).max(8).optional().default(1),
      phone: z.string().optional(),
    });

    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation failed', details: parse.error.format() });
      return;
    }

    const { name, email, password, role, semester, phone } = parse.data;

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      name,
      email,
      password: hashedPassword,
      role,
      semester,
      phone,
      status: 'active',
      emailVerified: new Date(),
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ message: `${role.toUpperCase()} account created successfully`, user: safeUser });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// Change User Role (Admin only)
adminRouter.patch('/users/:id/role', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Allowed: student, teacher, admin.' });
      return;
    }

    const user = await db.findUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Safety: prevent demoting oneself or the root admin
    const rootAdminEmail = process.env.ADMIN_EMAIL || 'admin@hamrobca.edu.np';
    if ((user.email === rootAdminEmail || user._id.toString() === req.user!.id) && role !== 'admin') {
      res.status(400).json({ error: 'Cannot demote the active administrator.' });
      return;
    }

    const updated = await db.updateUser(user._id.toString(), { role });
    res.json({ message: `Role updated to ${role} successfully`, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Toggle Account Status (active / suspended)
adminRouter.patch('/users/:id/status', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Status must be active or suspended' });
      return;
    }

    const user = await db.findUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user._id.toString() === req.user!.id) {
      res.status(400).json({ error: 'You cannot suspend your own admin account.' });
      return;
    }

    const updated = await db.updateUser(user._id.toString(), { status });
    res.json({ message: `Account status set to ${status}`, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete User
adminRouter.delete('/users/:id', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await db.findUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user._id.toString() === req.user!.id) {
      res.status(400).json({ error: 'You cannot delete your own admin account.' });
      return;
    }

    await db.deleteUser(user._id.toString());
    res.json({ message: 'User account removed permanently' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
