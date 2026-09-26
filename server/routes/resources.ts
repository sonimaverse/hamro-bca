import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles, optionalAuth } from '../middleware/auth.js';
import { resourceSchema, studentResourceSchema } from '../validation/index.js';

export const resourcesRouter = Router();

const PREMIUM_REQUIRED_MESSAGE = 'Premium subscription required';

/**
 * Premium content is unlocked only for an active premium subscription.
 * Administrators retain platform governance access, and the original uploader
 * keeps access to the exact file they published.
 */
function hasPremiumAccess(req: Request, resource: any): boolean {
  if (req.user?.isPremium === true) return true;
  if (req.user?.role === 'admin') return true;
  if (resource?.uploadedBy && req.user && resource.uploadedBy.toString() === req.user.id) return true;
  return false;
}

/**
 * Non-premium visitors may still discover that a premium resource exists,
 * but must never receive anything that can be used to fetch the file.
 */
function redactPremiumFields(resource: any) {
  if (!resource) return resource;
  return {
    ...resource,
    fileUrl: null,
    fileSize: null,
    isLocked: true,
  };
}

function gateResource<T extends { isPremiumContent?: boolean }>(resource: T, entitled: boolean): T | Record<string, unknown> {
  if (!resource?.isPremiumContent) return resource;
  return entitled ? resource : redactPremiumFields(resource);
}

// GET resources (public listing - premium entries are redacted for non-premium viewers)
resourcesRouter.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { type, semester, subject, search, course, page, limit } = req.query;
    const result = await db.getResources({
      type: type ? String(type) : undefined,
      semester: semester ? Number(semester) : undefined,
      subject: subject ? String(subject) : undefined,
      search: search ? String(search) : undefined,
      course: course ? String(course) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
      visibility: 'public', // Only show public resources
    });

    const items = (result.items || []).map((item: any) => gateResource(item, hasPremiumAccess(req, item)));
    res.json({ ...result, items });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
});

// GET community notes (student contributions only, public)
resourcesRouter.get('/community', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { type, semester, subject, search, page, limit } = req.query;
    const result = await db.getCommunityNotes({
      type: type ? String(type) : undefined,
      semester: semester ? Number(semester) : undefined,
      subject: subject ? String(subject) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 15,
    });

    const items = (result.items || []).map((item: any) => gateResource(item, hasPremiumAccess(req, item)));
    res.json({ ...result, items });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve community notes' });
  }
});

// GET my contributions (student only)
resourcesRouter.get('/my-contributions', authenticateToken, requireRoles(['student']), async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const result = await db.getStudentContributions(req.user!.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve your contributions' });
  }
});

// GET single resource
resourcesRouter.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    // Check visibility for non-admin users
    if (resource.visibility === 'hidden' && req.user?.role !== 'admin') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Premium content is never served to non-premium callers.
    if (resource.isPremiumContent && !hasPremiumAccess(req, resource)) {
      res.status(403).json({ message: PREMIUM_REQUIRED_MESSAGE });
      return;
    }

    res.json(resource);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// POST create resource (Teacher or Admin - official resources)
resourcesRouter.post('/', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = resourceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { title, description, subject, semester, type, fileUrl, fileName, fileSize, course, isPremiumContent } = parse.data;

    const newRes = await db.createResource({
      title,
      description: description || '',
      subject,
      semester,
      type,
      fileUrl,
      fileName,
      fileSize: fileSize || '1.5 MB',
      uploadedBy: req.user!.id,
      uploaderName: req.user!.name,
      course: course || undefined,
      source: 'admin',
      isStudentContribution: false,
      isPremiumContent: isPremiumContent === true,
      visibility: 'public',
    });

    res.status(201).json(newRes);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to upload resource' });
  }
});

// POST create student contribution (Student only - community notes)
resourcesRouter.post('/contribute', authenticateToken, requireRoles(['student']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = studentResourceSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { title, description, subject, semester, type, fileUrl, fileName, fileSize } = parse.data;

    const newRes = await db.createResource({
      title,
      description: description || '',
      subject,
      semester,
      type,
      fileUrl,
      fileName,
      fileSize: fileSize || '1.5 MB',
      uploadedBy: req.user!.id,
      uploaderName: req.user!.name,
      source: 'student',
      isStudentContribution: true,
      isPremiumContent: false, // Student contributions are never premium content
      visibility: 'public', // Immediately public - no approval needed
    });

    res.status(201).json(newRes);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit contribution' });
  }
});

// PUT update resource (Owner or Admin)
resourcesRouter.put('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    if (req.user!.role !== 'admin' && resource.uploadedBy.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to modify this resource.' });
      return;
    }

    const parse = resourceSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const updated = await db.updateResource(resource._id.toString(), parse.data as any);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// PUT update student's own contribution
resourcesRouter.put('/my-contributions/:id', authenticateToken, requireRoles(['student']), async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Only allow student to modify their own contributions
    if (resource.uploadedBy.toString() !== req.user!.id || !resource.isStudentContribution) {
      res.status(403).json({ error: 'Not authorized to modify this contribution.' });
      return;
    }

    const parse = studentResourceSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const updated = await db.updateResource(resource._id.toString(), parse.data as any);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update contribution' });
  }
});

// DELETE resource (Owner or Admin)
resourcesRouter.delete('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    if (req.user!.role !== 'admin' && resource.uploadedBy.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Not authorized to delete this resource.' });
      return;
    }

    await db.deleteResource(resource._id.toString());
    res.json({ message: 'Resource deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// DELETE student's own contribution
resourcesRouter.delete('/my-contributions/:id', authenticateToken, requireRoles(['student']), async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Only allow student to delete their own contributions
    if (resource.uploadedBy.toString() !== req.user!.id || !resource.isStudentContribution) {
      res.status(403).json({ error: 'Not authorized to delete this contribution.' });
      return;
    }

    await db.deleteResource(resource._id.toString());
    res.json({ message: 'Contribution deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete contribution' });
  }
});

// ADMIN: Get all student contributions for moderation
resourcesRouter.get('/admin/student-contributions', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = req.query;
    const result = await db.getAllStudentContributions({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search: search ? String(search) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve student contributions' });
  }
});

// ADMIN: Moderate student contribution (hide/unhide/delete)
resourcesRouter.patch('/admin/student-contributions/:id/moderate', authenticateToken, requireRoles(['admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { action } = req.body;
    if (!['hide', 'unhide', 'delete'].includes(action)) {
      res.status(400).json({ error: 'Invalid action. Must be: hide, unhide, or delete' });
      return;
    }

    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    if (!resource.isStudentContribution) {
      res.status(400).json({ error: 'This resource is not a student contribution' });
      return;
    }

    const updated = await db.moderateStudentContribution(resource._id.toString(), action);
    res.json({ message: `Student contribution ${action}d successfully`, resource: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to moderate contribution' });
  }
});

// Track download
resourcesRouter.post('/:id/download', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await db.getResourceById(req.params.id);
    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    if (resource.visibility === 'hidden' && req.user?.role !== 'admin') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Block the download counter and the file URL for premium content.
    if (resource.isPremiumContent && !hasPremiumAccess(req, resource)) {
      res.status(403).json({ message: PREMIUM_REQUIRED_MESSAGE });
      return;
    }

    const updated = await db.incrementResourceDownloads(req.params.id);
    if (!updated) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
    res.json({ success: true, downloadUrl: updated.fileUrl, downloads: updated.downloads });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to increment download count' });
  }
});
