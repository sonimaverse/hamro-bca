import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters').max(60, 'Name too long'),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    semester: z.number().int().min(1).max(8).optional().default(1),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must include uppercase')
      .regex(/[a-z]/, 'Must include lowercase')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  semester: z.number().int().min(1).max(8),
  subject: z.string().min(2, 'Subject name is required'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  modules: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(2),
        description: z.string().optional().default(''),
        order: z.number().optional().default(1),
        duration: z.string().optional(),
        lessons: z
          .array(
            z.object({
              id: z.string(),
              title: z.string().min(2),
              duration: z.string().optional(),
              content: z.string().optional(),
              videoUrl: z.string().optional(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .optional()
    .default([]),
});

export const resourceSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().default(''),
  subject: z.string().min(2, 'Subject is required'),
  semester: z.number().int().min(1).max(8),
  type: z.enum(['PDF', 'Notes', 'Past Questions', 'Assignments', 'Slides', 'Other']),
  fileUrl: z.string().min(1, 'File URL or upload is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.string().optional().default('1.5 MB'),
  course: z.string().optional().nullable(),
  isPremiumContent: z.boolean().optional().default(false),
});

export const studentResourceSchema = z.object({
  title: z.string().min(3, 'Title is required').max(120, 'Title too long'),
  description: z.string().optional().default(''),
  subject: z.string().min(2, 'Subject is required').max(100, 'Subject too long'),
  semester: z.number().int().min(1).max(8),
  type: z.enum(['PDF', 'Notes', 'Past Questions', 'Assignments', 'Slides', 'Other']),
  fileUrl: z.string().min(1, 'File URL or upload is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.string().optional().default('1.5 MB'),
});

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  targetAudience: z.enum(['all', 'students', 'teachers', 'admins', 'course']).default('all'),
  priority: z.enum(['normal', 'important', 'urgent']).default('normal'),
  course: z.string().optional().nullable(),
});

export const assignmentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(5, 'Description is required'),
  course: z.string().min(1, 'Course is required'),
  courseTitle: z.string().optional(),
  deadline: z.string().or(z.date()),
  totalMarks: z.number().min(1).optional().default(20),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional().default([]),
});

const safeUrlValidator = (url: string) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  // Disallow dangerous pseudoprotocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  // Disallow protocol-relative URLs (//example.com)
  if (trimmed.startsWith('//')) return false;
  // Allow safe root-relative path
  if (trimmed.startsWith('/')) return true;
  // Allow standard http/https
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const safeText = (min: number, max: number, fieldName: string) =>
  z
    .string()
    .trim()
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} cannot exceed ${max} characters`)
    .refine((val) => !/<[a-z][\s\S]*>/i.test(val), {
      message: `${fieldName} cannot contain HTML or script tags`,
    });

export const advertisementSchema = z.object({
  title: safeText(3, 120, 'Title'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .refine((val) => !val || !/<[a-z][\s\S]*>/i.test(val), {
      message: 'Description cannot contain HTML or script tags',
    })
    .optional()
    .default(''),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image URL is required')
    .refine(safeUrlValidator, {
      message: 'Invalid or unsafe image URL. Must be http://, https://, or relative path.',
    }),
  buttonText: safeText(1, 40, 'Button text').default('Learn More'),
  buttonUrl: z
    .string()
    .trim()
    .min(1, 'Destination link is required')
    .refine(safeUrlValidator, {
      message: 'Invalid or unsafe destination link. Only http://, https://, or relative paths (/...) are permitted.',
    }),
  placement: z
    .enum(['homepage', 'student_dashboard', 'course_pages', 'resource_vault', 'all'])
    .default('all'),
  status: z.enum(['active', 'inactive', 'scheduled']).default('active'),
  startDate: z.string().or(z.date()).nullable().optional(),
  endDate: z.string().or(z.date()).nullable().optional(),
  priority: z.coerce.number().int().min(1).max(100).default(1),
  targetAudience: z.enum(['all', 'students', 'teachers']).default('all'),
});

