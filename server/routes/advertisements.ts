import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { advertisementSchema } from '../validation/index.js';
import { deleteUploadedAsset } from './upload.js';

export const advertisementsRouter = Router();

// 1. PUBLIC: Fetch eligible active advertisements for a placement & target audience
advertisementsRouter.get('/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const { placement, audience } = req.query;
    const ads = await db.getActiveAdvertisements(
      placement ? String(placement) : undefined,
      audience ? String(audience) : 'all'
    );
    res.json(ads);
  } catch (err: any) {
    console.error('Error fetching active advertisements:', err);
    res.status(500).json({ error: 'Failed to retrieve active advertisements' });
  }
});

// 2. PUBLIC: Track impression (view count)
advertisementsRouter.post('/:id/impression', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length > 50) {
      res.status(400).json({ error: 'Invalid advertisement ID format' });
      return;
    }
    const updated = await db.trackAdImpression(id);
    if (!updated) {
      res.status(404).json({ error: 'Advertisement not found' });
      return;
    }
    if ('inactive' in updated && updated.inactive) {
      res.status(400).json({ error: 'Advertisement is not currently active or has expired' });
      return;
    }
    res.json({ success: true, id, impressions: updated.impressions });
  } catch (err: any) {
    console.error('Error tracking ad impression:', err);
    res.status(500).json({ error: 'Failed to record impression' });
  }
});

// 3. PUBLIC: Track click
advertisementsRouter.post('/:id/click', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || id.length > 50) {
      res.status(400).json({ error: 'Invalid advertisement ID format' });
      return;
    }
    const updated = await db.trackAdClick(id);
    if (!updated) {
      res.status(404).json({ error: 'Advertisement not found' });
      return;
    }
    if ('inactive' in updated && updated.inactive) {
      res.status(400).json({ error: 'Advertisement is not currently active or has expired' });
      return;
    }
    res.json({ success: true, id, clicks: updated.clicks, buttonUrl: updated.buttonUrl });
  } catch (err: any) {
    console.error('Error tracking ad click:', err);
    res.status(500).json({ error: 'Failed to record click' });
  }
});

// 4. ADMIN: Overall performance metrics & statistics
advertisementsRouter.get(
  '/stats',
  authenticateToken,
  requireRoles(['admin']),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await db.getAdvertisementStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Error computing advertisement stats:', err);
      res.status(500).json({ error: 'Failed to retrieve advertisement statistics' });
    }
  }
);

// 5. ADMIN: List all advertisements with pagination & filters
advertisementsRouter.get(
  '/',
  authenticateToken,
  requireRoles(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { placement, status, search, page = 1, limit = 10 } = req.query;
      const result = await db.getAdvertisements({
        placement: placement ? String(placement) : undefined,
        status: status ? String(status) : undefined,
        search: search ? String(search) : undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(result);
    } catch (err: any) {
      console.error('Error listing advertisements:', err);
      res.status(500).json({ error: 'Failed to retrieve advertisements' });
    }
  }
);

// 6. PUBLIC or ADMIN: Get single advertisement by ID
advertisementsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await db.getAdvertisementById(req.params.id);
    if (!ad) {
      res.status(404).json({ error: 'Advertisement not found' });
      return;
    }
    res.json(ad);
  } catch (err: any) {
    console.error('Error fetching advertisement:', err);
    res.status(500).json({ error: 'Failed to retrieve advertisement details' });
  }
});

// 7. ADMIN: Create new advertisement
advertisementsRouter.post(
  '/',
  authenticateToken,
  requireRoles(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = advertisementSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const data = parseResult.data;
      const newAd = await db.createAdvertisement({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: req.user!.id,
        createdByName: req.user!.name,
      });

      res.status(201).json({
        success: true,
        message: 'Advertisement campaign created successfully',
        advertisement: newAd,
      });
    } catch (err: any) {
      console.error('Error creating advertisement:', err);
      res.status(500).json({ error: err.message || 'Failed to create advertisement' });
    }
  }
);

// 8. ADMIN: Update existing advertisement
advertisementsRouter.put(
  '/:id',
  authenticateToken,
  requireRoles(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const parseResult = advertisementSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const existing = await db.getAdvertisementById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Advertisement not found' });
        return;
      }

      const data = parseResult.data;

      // If image is being replaced with a new one, clean up previous Cloudinary asset
      if (existing.imageUrl && data.imageUrl && existing.imageUrl !== data.imageUrl) {
        await deleteUploadedAsset(existing.imageUrl);
      }

      const updated = await db.updateAdvertisement(req.params.id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      });

      res.json({
        success: true,
        message: 'Advertisement updated successfully',
        advertisement: updated,
      });
    } catch (err: any) {
      console.error('Error updating advertisement:', err);
      res.status(500).json({ error: err.message || 'Failed to update advertisement' });
    }
  }
);

// 9. ADMIN: Quick status toggle (active, inactive, scheduled)
advertisementsRouter.patch(
  '/:id/status',
  authenticateToken,
  requireRoles(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      if (!['active', 'inactive', 'scheduled'].includes(status)) {
        res.status(400).json({ error: 'Status must be active, inactive, or scheduled' });
        return;
      }

      const existing = await db.getAdvertisementById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Advertisement not found' });
        return;
      }

      const updated = await db.updateAdvertisement(req.params.id, { status });
      res.json({
        success: true,
        message: `Advertisement status changed to ${status}`,
        advertisement: updated,
      });
    } catch (err: any) {
      console.error('Error toggling advertisement status:', err);
      res.status(500).json({ error: 'Failed to update advertisement status' });
    }
  }
);

// 10. ADMIN: Delete advertisement
advertisementsRouter.delete(
  '/:id',
  authenticateToken,
  requireRoles(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const existing = await db.getAdvertisementById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Advertisement not found' });
        return;
      }

      // Cleanup image if stored on Cloudinary
      if (existing.imageUrl) {
        await deleteUploadedAsset(existing.imageUrl);
      }

      await db.deleteAdvertisement(req.params.id);
      res.json({ success: true, message: 'Advertisement removed successfully' });
    } catch (err: any) {
      console.error('Error deleting advertisement:', err);
      res.status(500).json({ error: 'Failed to delete advertisement' });
    }
  }
);
