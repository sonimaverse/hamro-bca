import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { z } from 'zod';

export const subscriptionsRouter = Router();

const requestSubscriptionSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('A valid email address is required').toLowerCase().trim(),
});

subscriptionsRouter.post('/request', authenticateToken, requireRoles(['student']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = requestSubscriptionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { fullName, email } = parse.data;

    const user = await db.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== 'student') {
      res.status(403).json({ error: 'Only student accounts can request a premium subscription.' });
      return;
    }

    const hasPending = await db.hasPendingSubscriptionRequest(req.user!.id);
    if (hasPending) {
      res.status(409).json({ error: 'You already have a pending subscription request. Please wait for admin review.' });
      return;
    }

    const request = await db.createSubscriptionRequest({
      userId: req.user!.id,
      fullName,
      email,
      status: 'pending',
      adminNote: '',
    });

    res.status(201).json({ message: 'Subscription request submitted successfully.', request });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit subscription request.' });
  }
});

subscriptionsRouter.get('/my-request', authenticateToken, requireRoles(['student']), async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await db.getSubscriptionRequestsByUser(req.user!.id);
    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve subscription request.' });
  }
});

subscriptionsRouter.get('/admin/requests', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await db.getAllSubscriptionRequests({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve subscription requests.' });
  }
});

subscriptionsRouter.patch('/admin/requests/:id/review', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be: approved, rejected, or pending.' });
      return;
    }

    const request = await db.getSubscriptionRequestById(req.params.id);
    if (!request) {
      res.status(404).json({ error: 'Subscription request not found.' });
      return;
    }

    const previousStatus = request.status;

    const updated = await db.updateSubscriptionRequest(request._id.toString(), {
      status,
      adminNote: adminNote || '',
    });

    if (status === 'approved') {
      await db.updateUser(request.userId.toString(), { isPremium: true });
    } else if (previousStatus === 'approved' && (status === 'rejected' || status === 'pending')) {
      await db.updateUser(request.userId.toString(), { isPremium: false });
    }

    res.json({ message: `Subscription request ${status} successfully.`, request: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to review subscription request.' });
  }
});
