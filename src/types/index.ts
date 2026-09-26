export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  emailVerified: string | Date | null;
  isPremium?: boolean;
  status?: 'active' | 'suspended';
  bio?: string;
  semester?: number;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration?: string;
  content?: string;
  videoUrl?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  duration?: string;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  semester: number;
  subject: string;
  instructor: string;
  instructorName?: string;
  thumbnail: string;
  modules: CourseModule[];
  enrolledCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  user: string | User;
  course: string | Course;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
}

export type ResourceType = 'PDF' | 'Notes' | 'Past Questions' | 'Assignments' | 'Slides' | 'Other';

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  semester: number;
  type: ResourceType;
  fileUrl: string | null;
  fileName: string;
  fileSize?: string | null;
  uploadedBy: string | User;
  uploaderName?: string;
  course?: string | Course;
  downloads: number;
  source?: 'admin' | 'student';
  isStudentContribution?: boolean;
  isPremiumContent?: boolean;
  isLocked?: boolean;
  visibility?: 'public' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: string | User;
  authorName?: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'admins' | 'course';
  course?: string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: string | Course;
  courseTitle?: string;
  teacher: string | User;
  teacherName?: string;
  deadline: string;
  attachments: { name: string; url: string }[];
  totalMarks?: number;
  submissionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalResources: number;
  totalEnrollments: number;
}

export interface TeacherStats {
  totalCourses: number;
  totalResources: number;
  totalStudents: number;
  recentCourses: Course[];
}

export type AdPlacement = 'homepage' | 'student_dashboard' | 'course_pages' | 'resource_vault' | 'all';
export type AdStatus = 'active' | 'inactive' | 'scheduled';
export type AdTargetAudience = 'all' | 'students' | 'teachers';

export interface Advertisement {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
  impressions: number;
  clicks: number;
  targetAudience: AdTargetAudience;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementStats {
  totalAds: number;
  activeAds: number;
  inactiveAds: number;
  scheduledAds: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
  placementDistribution: Record<string, number>;
}

export interface SubscriptionRequest {
  _id: string;
  userId: string | User;
  fullName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

