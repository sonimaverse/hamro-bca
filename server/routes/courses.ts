import { Router, Request, Response } from 'express';
import { db } from '../services/dbStore.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { courseSchema } from '../validation/index.js';

export const coursesRouter = Router();

// GET all courses with filter and pagination
coursesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { semester, search, instructor, page, limit } = req.query;
    const result = await db.getCourses({
      semester: semester ? Number(semester) : undefined,
      search: search ? String(search) : undefined,
      instructor: instructor ? String(instructor) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
});

// GET student's enrolled courses
coursesRouter.get('/enrolled/my', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return;
    const enrollments = await db.getUserEnrollments(req.user.id);
    res.json(enrollments);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve enrolled courses' });
  }
});

// GET single course by id or slug
coursesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check enrollment if user token provided
    let enrollment = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const { JWT_SECRET } = await import('../middleware/auth.js');
        const decoded: any = jwt.default.verify(token, JWT_SECRET);
        enrollment = await db.findEnrollment(decoded.id, course._id.toString());
      } catch (e) {
        // non-fatal
      }
    }

    res.json({ course, enrollment });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// CREATE course (Teacher or Admin)
coursesRouter.post('/', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const parse = courseSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const { title, description, semester, subject, thumbnail, modules } = parse.data;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const newCourse = await db.createCourse({
      title,
      slug,
      description,
      semester,
      subject,
      instructor: req.user!.id,
      instructorName: req.user!.name,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      modules: modules.map((m, idx) => ({
        id: m.id || `mod-${idx + 1}`,
        title: m.title,
        description: m.description || '',
        order: m.order || idx + 1,
        duration: m.duration || '2h',
        lessons: (m.lessons || []).map((l, lIdx) => ({
          id: l.id || `les-${idx + 1}-${lIdx + 1}`,
          title: l.title,
          duration: l.duration || '45m',
          content: l.content || '',
          videoUrl: l.videoUrl || '',
        })),
      })),
    });

    res.status(201).json(newCourse);
  } catch (err: any) {
    console.error('Course creation error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// UPDATE course (Teacher owner or Admin)
coursesRouter.put('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Role verification: only course creator or admin can update
    if (req.user!.role !== 'admin' && course.instructor.toString() !== req.user!.id) {
      res.status(403).json({ error: 'You are not authorized to edit this course.' });
      return;
    }

    const parse = courseSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(422).json({ error: 'Validation error', details: parse.error.format() });
      return;
    }

    const updated = await db.updateCourse(course._id.toString(), parse.data as any);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE course (Teacher owner or Admin)
coursesRouter.delete('/:id', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (req.user!.role !== 'admin' && course.instructor.toString() !== req.user!.id) {
      res.status(403).json({ error: 'You are not authorized to delete this course.' });
      return;
    }

    await db.deleteCourse(course._id.toString());
    res.json({ message: 'Course deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ENROLL IN COURSE (Student)
coursesRouter.post('/:id/enroll', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const existing = await db.findEnrollment(req.user!.id, course._id.toString());
    if (existing) {
      res.status(409).json({ error: 'You are already enrolled in this course.' });
      return;
    }

    const enrollment = await db.createEnrollment(req.user!.id, course._id.toString());
    res.status(201).json({ message: 'Enrolled successfully!', enrollment });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// UPDATE PROGRESS (Check off lesson)
coursesRouter.post('/:id/progress', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId, completed = true } = req.body;
    if (!lessonId) {
      res.status(400).json({ error: 'lessonId is required' });
      return;
    }

    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const updated = await db.updateEnrollmentProgress(req.user!.id, course._id.toString(), lessonId, completed);
    if (!updated) {
      res.status(404).json({ error: 'Enrollment record not found. Please enroll first.' });
      return;
    }

    res.json({ message: 'Progress updated', enrollment: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// VIEW ENROLLED STUDENTS (For Course)
coursesRouter.get('/:id/students', authenticateToken, requireRoles(['teacher', 'admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await db.getCourseById(req.params.id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    if (req.user!.role !== 'admin' && course.instructor.toString() !== req.user!.id) {
      res.status(403).json({ error: 'Unauthorized to view student enrollments for this course.' });
      return;
    }

    const students = await db.getCourseEnrollments(course._id.toString());
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve enrolled students' });
  }
});
