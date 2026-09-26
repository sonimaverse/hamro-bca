import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { assignmentSchema } from '../validation/index.js';

export const assignmentsRouter = Router();

// GET assignments
assignmentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { courseId, teacherId } = req.query;
    const assignments = await db.getAssignments(courseId as string, teacherId as string);
    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve assignments' });
  }
});

// POST assignment (Teacher or Admin)
assignmentsRouter.post('/', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = assignmentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { title, description, course, courseTitle, deadline, totalMarks, attachments } = parse.data;

    let cTitle = courseTitle;
    if (!cTitle) {
      const c = await db.getCourseById(course);
      cTitle = c?.title || 'BCA Course';
    }

    const assignment = await db.createAssignment({
      title,
      description,
      course,
      courseTitle: cTitle,
      teacher: req.user!.id,
      teacherName: req.user!.name,
      deadline: new Date(deadline),
      totalMarks: totalMarks || 20,
      attachments: attachments || [],
    });

    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// DELETE assignment (Teacher or Admin)
assignmentsRouter.delete('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    await db.deleteAssignment(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});
