import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionRequest extends Document {
  userId: mongoose.Types.ObjectId | IUser | string;
  fullName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionRequestSchema = new Schema<ISubscriptionRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

SubscriptionRequestSchema.index({ userId: 1, status: 1 });

// User Interface & Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  emailVerified: Date | null;
  isPremium?: boolean;
  status: 'active' | 'suspended';
  bio?: string;
  semester?: number;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student', index: true },
    avatar: { type: String, default: '' },
    emailVerified: { type: Date, default: null },
    isPremium: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    bio: { type: String, default: '' },
    semester: { type: Number, min: 1, max: 8, default: 1 },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

// Course Interface & Schema
export interface IModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration?: string;
  lessons: {
    id: string;
    title: string;
    duration?: string;
    content?: string;
    videoUrl?: string;
  }[];
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  semester: number;
  subject: string;
  instructor: mongoose.Types.ObjectId | IUser | string;
  instructorName?: string;
  thumbnail: string;
  modules: IModule[];
  resourcesCount?: number;
  enrolledCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8, index: true },
    subject: { type: String, required: true, trim: true, index: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instructorName: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    modules: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        order: { type: Number, default: 1 },
        duration: { type: String, default: '' },
        lessons: [
          {
            id: { type: String, required: true },
            title: { type: String, required: true },
            duration: { type: String, default: '' },
            content: { type: String, default: '' },
            videoUrl: { type: String, default: '' },
          },
        ],
      },
    ],
    enrolledCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Enrollment Interface & Schema
export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId | IUser | string;
  course: mongoose.Types.ObjectId | ICourse | string;
  status: 'active' | 'completed' | 'dropped';
  progress: number; // 0 - 100
  completedLessons: string[];
  enrolledAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: String }],
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Resource Interface & Schema
export interface IResource extends Document {
  title: string;
  description: string;
  subject: string;
  semester: number;
  type: 'PDF' | 'Notes' | 'Past Questions' | 'Assignments' | 'Slides' | 'Other';
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadedBy: mongoose.Types.ObjectId | IUser | string;
  uploaderName?: string;
  course?: mongoose.Types.ObjectId | ICourse | string;
  downloads: number;
  source: 'admin' | 'student';
  isStudentContribution: boolean;
  isPremiumContent: boolean;
  visibility: 'public' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true, trim: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 8, index: true },
    type: {
      type: String,
      enum: ['PDF', 'Notes', 'Past Questions', 'Assignments', 'Slides', 'Other'],
      required: true,
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '1.2 MB' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uploaderName: { type: String, default: '' },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    downloads: { type: Number, default: 0 },
    source: { type: String, enum: ['admin', 'student'], default: 'admin', index: true },
    isStudentContribution: { type: Boolean, default: false, index: true },
    isPremiumContent: { type: Boolean, default: false, index: true },
    visibility: { type: String, enum: ['public', 'hidden'], default: 'public', index: true },
  },
  { timestamps: true }
);

// Announcement Interface & Schema
export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser | string;
  authorName?: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'admins' | 'course';
  course?: mongoose.Types.ObjectId | ICourse | string;
  priority: 'normal' | 'important' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: '' },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'admins', 'course'],
      default: 'all',
      index: true,
    },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
  },
  { timestamps: true }
);

// Assignment Interface & Schema
export interface IAssignment extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId | ICourse | string;
  courseTitle?: string;
  teacher: mongoose.Types.ObjectId | IUser | string;
  teacherName?: string;
  deadline: Date;
  attachments: { name: string; url: string }[];
  totalMarks?: number;
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    courseTitle: { type: String, default: '' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teacherName: { type: String, default: '' },
    deadline: { type: Date, required: true },
    attachments: [{ name: { type: String }, url: { type: String } }],
    totalMarks: { type: Number, default: 20 },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Progress Interface & Schema
export interface IProgress extends Document {
  user: mongoose.Types.ObjectId | IUser | string;
  course: mongoose.Types.ObjectId | ICourse | string;
  lessonId: string;
  completed: boolean;
  completedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true },
    completed: { type: Boolean, default: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
ProgressSchema.index({ user: 1, course: 1, lessonId: 1 }, { unique: true });

// Token Interface & Schema (Email Verification & Password Reset)
export interface IToken extends Document {
  email: string;
  token: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['email_verification', 'password_reset'], required: true },
    expiresAt: { type: Date, required: true, index: { expires: '1d' } },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const CourseModel: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const EnrollmentModel: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
export const ResourceModel: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export const AssignmentModel: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const ProgressModel: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);
export const TokenModel: Model<IToken> =
  mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);

export const SubscriptionRequestModel: Model<ISubscriptionRequest> =
  mongoose.models.SubscriptionRequest || mongoose.model<ISubscriptionRequest>('SubscriptionRequest', SubscriptionRequestSchema);

// Advertisement Interface & Schema
export interface IAdvertisement extends Document {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  placement: 'homepage' | 'student_dashboard' | 'course_pages' | 'resource_vault' | 'all';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: Date | null;
  endDate: Date | null;
  priority: number;
  impressions: number;
  clicks: number;
  targetAudience: 'all' | 'students' | 'teachers';
  createdBy?: mongoose.Types.ObjectId | IUser | string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, required: true, trim: true },
    buttonText: { type: String, default: 'Learn More', trim: true },
    buttonUrl: { type: String, required: true, trim: true },
    placement: {
      type: String,
      enum: ['homepage', 'student_dashboard', 'course_pages', 'resource_vault', 'all'],
      default: 'all',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled'],
      default: 'active',
      index: true,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    priority: { type: Number, default: 1, min: 1, max: 100, index: true },
    impressions: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers'],
      default: 'all',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String, default: 'Administrator' },
  },
  { timestamps: true }
);

export const AdvertisementModel: Model<IAdvertisement> =
  mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);

