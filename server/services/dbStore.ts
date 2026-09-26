import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  CourseModel,
  EnrollmentModel,
  ResourceModel,
  AnnouncementModel,
  AssignmentModel,
  ProgressModel,
  TokenModel,
  AdvertisementModel,
  SubscriptionRequestModel,
  IUser,
  ICourse,
  IEnrollment,
  IResource,
  IAnnouncement,
  IAssignment,
  IToken,
  IAdvertisement,
  ISubscriptionRequest,
} from '../models/index.js';
import { connectDB } from '../db/connection.js';

// In-Memory Fallback Collections (ensures immediate 100% operation even before user supplies Atlas URI)
interface MemoryStore {
  users: any[];
  courses: any[];
  enrollments: any[];
  resources: any[];
  announcements: any[];
  assignments: any[];
  progress: any[];
  tokens: any[];
  advertisements: any[];
  subscriptionRequests: any[];
}

const memStore: MemoryStore = {
  users: [],
  courses: [],
  enrollments: [],
  resources: [],
  announcements: [],
  assignments: [],
  progress: [],
  tokens: [],
  advertisements: [],
  subscriptionRequests: [],
};

let isSeeded = false;

export async function seedInitialData() {
  if (isSeeded) return;

  const defaultFacultyId = '6601a0000000000000000000';

  const initialCourses = [
    {
      _id: '6602a0000000000000000001',
      title: 'C Programming & Problem Solving',
      slug: 'c-programming-and-problem-solving',
      description: 'Master core procedural programming, memory management, pointers, and algorithm design structured for BCA 1st Semester.',
      semester: 1,
      subject: 'Computer Programming (CACS102)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'mod-1',
          title: 'Unit 1: Fundamentals of C and Operators',
          description: 'Data types, control structures, branching and loops in ANSI C.',
          order: 1,
          duration: '3h 30m',
          lessons: [
            { id: 'les-1-1', title: 'Variables, Literals and Memory Layout', duration: '45m' },
            { id: 'les-1-2', title: 'Bitwise and Arithmetic Operators', duration: '50m' },
            { id: 'les-1-3', title: 'Nested Conditionals and Iteration', duration: '55m' },
          ],
        },
        {
          id: 'mod-2',
          title: 'Unit 2: Functions, Arrays and Pointers',
          description: 'Passing by reference, pointer arithmetic, dynamic memory allocation.',
          order: 2,
          duration: '4h 15m',
          lessons: [
            { id: 'les-2-1', title: '1D and Multi-dimensional Arrays', duration: '50m' },
            { id: 'les-2-2', title: 'Pointer Arithmetic & Dereferencing', duration: '60m' },
            { id: 'les-2-3', title: 'Dynamic Allocation with malloc, calloc, realloc', duration: '55m' },
          ],
        },
        {
          id: 'mod-3',
          title: 'Unit 3: Structures, Unions and File I/O',
          description: 'Structured records, binary files, file pointers and error handling.',
          order: 3,
          duration: '3h 45m',
          lessons: [
            { id: 'les-3-1', title: 'Custom Structures and Memory Alignment', duration: '55m' },
            { id: 'les-3-2', title: 'Sequential vs Random File Access in C', duration: '60m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    },
    {
      _id: '6602a0000000000000000002',
      title: 'Digital Logic Systems',
      slug: 'digital-logic-systems',
      description: 'Foundational circuit analysis, Boolean algebra, Karnaugh Maps, combinational and sequential logic design for BCA 1st Semester.',
      semester: 1,
      subject: 'Digital Logic (CACS105)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'dl-mod-1',
          title: 'Unit 1: Number Systems and Boolean Algebra',
          description: 'Binary, octal, hex codes, 1s and 2s complement representation.',
          order: 1,
          duration: '4h',
          lessons: [
            { id: 'dl-1-1', title: 'Radix Conversion and Floating Points', duration: '55m' },
            { id: 'dl-1-2', title: 'Postulates & Theorems of Boolean Algebra', duration: '50m' },
          ],
        },
        {
          id: 'dl-mod-2',
          title: 'Unit 2: Combinational Logic & K-Maps',
          description: '2 to 5 variable K-Maps, Encoders, Multiplexers, Adders.',
          order: 2,
          duration: '5h',
          lessons: [
            { id: 'dl-2-1', title: 'Sum of Products & Product of Sums Minimization', duration: '60m' },
            { id: 'dl-2-2', title: 'Half and Full Adders with Lookahead Carry', duration: '55m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-12'),
    },
    {
      _id: '6602a0000000000000000003',
      title: 'Data Structures and Algorithms (DSA)',
      slug: 'data-structures-and-algorithms',
      description: 'Comprehensive study of Linear and Non-linear structures: Linked Lists, Stacks, Queues, Trees, Heaps, Graphs, and Asymptotic Complexity.',
      semester: 3,
      subject: 'Data Structures & Algorithms (CACS201)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'dsa-mod-1',
          title: 'Unit 1: Stacks, Queues & Recursion',
          description: 'Array vs Linked implementations, Infix to Postfix conversions.',
          order: 1,
          duration: '4h 30m',
          lessons: [
            { id: 'dsa-1-1', title: 'Asymptotic Notations (Big-O, Omega, Theta)', duration: '45m' },
            { id: 'dsa-1-2', title: 'Stack Abstract Data Type and Polish Notation', duration: '55m' },
            { id: 'dsa-1-3', title: 'Circular Queues and Priority Queues', duration: '50m' },
          ],
        },
        {
          id: 'dsa-mod-2',
          title: 'Unit 2: Linked Lists and Binary Search Trees',
          description: 'Singly, Doubly, Circular Linked Lists, AVL rotations, BST operations.',
          order: 2,
          duration: '6h',
          lessons: [
            { id: 'dsa-2-1', title: 'Pointer-based Linked List Manipulation', duration: '60m' },
            { id: 'dsa-2-2', title: 'Binary Tree Traversals (Inorder, Preorder, Postorder)', duration: '55m' },
            { id: 'dsa-2-3', title: 'Height Balanced Trees and AVL balancing', duration: '65m' },
          ],
        },
        {
          id: 'dsa-mod-3',
          title: 'Unit 3: Graph Algorithms & Sorting',
          description: 'BFS, DFS, Dijkstra, Prim/Kruskal, MergeSort, QuickSort.',
          order: 3,
          duration: '5h 15m',
          lessons: [
            { id: 'dsa-3-1', title: 'Adjacency Matrix vs List Graph Representations', duration: '50m' },
            { id: 'dsa-3-2', title: 'Minimum Spanning Trees & Greedy Approaches', duration: '65m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
    },
    {
      _id: '6602a0000000000000000004',
      title: 'Database Management Systems (DBMS)',
      slug: 'database-management-systems',
      description: 'Relational algebra, ER Modeling, SQL queries, Normalization (1NF through BCNF), and ACID transaction management.',
      semester: 3,
      subject: 'Database Management System (CACS204)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'dbms-mod-1',
          title: 'Unit 1: ER Modeling and Relational Algebra',
          description: 'Entities, cardinalities, relational algebra operators.',
          order: 1,
          duration: '4h',
          lessons: [
            { id: 'db-1-1', title: 'Architecture of Three-Schema DBMS', duration: '50m' },
            { id: 'db-1-2', title: 'Entity-Relationship to Relational Mapping', duration: '60m' },
          ],
        },
        {
          id: 'dbms-mod-2',
          title: 'Unit 2: SQL and Relational Normalization',
          description: 'Complex Joins, Subqueries, Functional Dependencies and Normal Forms.',
          order: 2,
          duration: '5h',
          lessons: [
            { id: 'db-2-1', title: 'Advanced SQL Aggregations and Window Functions', duration: '60m' },
            { id: 'db-2-2', title: 'Decomposition and Boyce-Codd Normal Form', duration: '60m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-01-20'),
      updatedAt: new Date('2026-01-20'),
    },
    {
      _id: '6602a0000000000000000005',
      title: 'Web Technology & Modern Frameworks',
      slug: 'web-technology-and-modern-frameworks',
      description: 'HTML5 semantic standards, CSS grid/flexbox, modern ES6+ JavaScript, Node.js runtime, RESTful architectural design.',
      semester: 4,
      subject: 'Web Technology (CACS251)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'web-mod-1',
          title: 'Unit 1: Client-Side Foundations',
          description: 'DOM APIs, asynchronous JS, fetch, event listeners.',
          order: 1,
          duration: '4h',
          lessons: [
            { id: 'web-1-1', title: 'CSS Grid & Flexbox Architectural Layouts', duration: '55m' },
            { id: 'web-1-2', title: 'Promises, Async/Await and Event Loop', duration: '65m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-02-05'),
      updatedAt: new Date('2026-02-05'),
    },
    {
      _id: '6602a0000000000000000006',
      title: 'Artificial Intelligence & Neural Networks',
      slug: 'artificial-intelligence-and-neural-networks',
      description: 'State space search, A* heuristic, minimax, propositional logic, Bayes theorem, machine learning foundations for BCA 7th Semester.',
      semester: 7,
      subject: 'Artificial Intelligence (CACS403)',
      instructor: defaultFacultyId,
      instructorName: 'TU BCA Faculty',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
      modules: [
        {
          id: 'ai-mod-1',
          title: 'Unit 1: Search Strategies and Heuristics',
          description: 'Informed vs Uniformed Search, A* admissibility and consistency.',
          order: 1,
          duration: '4h',
          lessons: [
            { id: 'ai-1-1', title: 'Problem Formulation and State Graphs', duration: '50m' },
            { id: 'ai-1-2', title: 'Heuristic Evaluation and A* Proofs', duration: '60m' },
          ],
        },
      ],
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date('2026-02-10'),
      updatedAt: new Date('2026-02-10'),
    },
  ];

  const initialResources = [
    {
      _id: '6603a0000000000000000001',
      title: 'Complete C Programming Handcrafted Lecture Notes',
      description: 'Chapter-wise syllabus aligned notes with 50+ executable code demonstrations and output explanations.',
      subject: 'Computer Programming (CACS102)',
      semester: 1,
      type: 'Notes',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'BCA_Sem1_C_Programming_Handwritten_Notes.pdf',
      fileSize: '4.8 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000001',
      downloads: 0,
      createdAt: new Date('2026-01-22'),
      updatedAt: new Date('2026-01-22'),
    },
    {
      _id: '6603a0000000000000000002',
      title: 'TU BCA 2080 Board Exam Question Paper Solution',
      description: 'Official solved board examination paper with breakdown of marks and theoretical explanations.',
      subject: 'Computer Programming (CACS102)',
      semester: 1,
      type: 'Past Questions',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'BCA_2080_C_Programming_Board_Solution.pdf',
      fileSize: '2.1 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000001',
      downloads: 0,
      createdAt: new Date('2026-01-25'),
      updatedAt: new Date('2026-01-25'),
    },
    {
      _id: '6603a0000000000000000003',
      title: 'Data Structures and Algorithms Comprehensive Guide',
      description: 'Full syllabus textbook companion covering Trees, Graphs, Sorting algorithms with asymptotic proofs.',
      subject: 'Data Structures & Algorithms (CACS201)',
      semester: 3,
      type: 'PDF',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'BCA_Sem3_DSA_Complete_Guide.pdf',
      fileSize: '7.4 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000003',
      downloads: 0,
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-01'),
    },
    {
      _id: '6603a0000000000000000004',
      title: 'DBMS Normalization & Relational Algebra Cheat Sheet',
      description: 'Quick reference formulas for 1NF, 2NF, 3NF, BCNF decomposition and relational algebra operators.',
      subject: 'Database Management System (CACS204)',
      semester: 3,
      type: 'Slides',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'DBMS_Normalization_Formulas.pdf',
      fileSize: '1.5 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000004',
      downloads: 0,
      createdAt: new Date('2026-02-03'),
      updatedAt: new Date('2026-02-03'),
    },
    {
      _id: '6603a0000000000000000005',
      title: 'TU BCA 2079 & 2078 Past Question Collection',
      description: 'Past 5 years collected board exam questions for 3rd semester subjects with model questions.',
      subject: 'Data Structures & Algorithms (CACS201)',
      semester: 3,
      type: 'Past Questions',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'BCA_Sem3_Past_Questions_5Years.pdf',
      fileSize: '3.9 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000003',
      downloads: 0,
      createdAt: new Date('2026-02-04'),
      updatedAt: new Date('2026-02-04'),
    },
    {
      _id: '6603a0000000000000000006',
      title: 'Digital Logic Lab Manual & Multisim Experiments',
      description: 'Step-by-step verification of Logic Gates, Multiplexers, Counters, and Shift Registers.',
      subject: 'Digital Logic (CACS105)',
      semester: 1,
      type: 'Notes',
      fileUrl: 'https://raw.githubusercontent.com/mdn/learning-area/master/html/introduction-to-html/getting-started/index.html',
      fileName: 'Digital_Logic_Lab_Manual_TU_BCA.pdf',
      fileSize: '5.2 MB',
      uploadedBy: defaultFacultyId,
      uploaderName: 'TU BCA Academic Council',
      course: '6602a0000000000000000002',
      downloads: 0,
      createdAt: new Date('2026-02-08'),
      updatedAt: new Date('2026-02-08'),
    },
  ];

  const initialAnnouncements = [
    {
      _id: '6604a0000000000000000001',
      title: 'TU BCA Even Semester Board Examination Registration 2081',
      content: 'All BCA 2nd, 4th, 6th and 8th semester students must submit their board examination registration forms along with required fees before Ashoj 25.',
      author: defaultFacultyId,
      authorName: 'TU BCA Examination Board',
      targetAudience: 'all',
      priority: 'urgent',
      createdAt: new Date('2026-09-15'),
      updatedAt: new Date('2026-09-15'),
    },
    {
      _id: '6604a0000000000000000002',
      title: 'Mid-Term Assessment & Project Defense Schedule - 3rd Semester',
      content: 'Mid-term practical examinations and software project defense for DBMS and DSA will commence from Monday at 10:00 AM in Lab 3.',
      author: defaultFacultyId,
      authorName: 'TU BCA Academic Department',
      targetAudience: 'students',
      course: '6602a0000000000000000003',
      priority: 'important',
      createdAt: new Date('2026-09-18'),
      updatedAt: new Date('2026-09-18'),
    },
    {
      _id: '6604a0000000000000000003',
      title: 'Faculty Workshop: Cloud-Native Microservices Curriculum Update',
      content: 'Special academic meeting for all teachers regarding implementation of advanced cloud labs and AI syllabus integration.',
      author: defaultFacultyId,
      authorName: 'TU BCA Administration',
      targetAudience: 'teachers',
      priority: 'normal',
      createdAt: new Date('2026-09-10'),
      updatedAt: new Date('2026-09-10'),
    },
  ];

  const initialAssignments = [
    {
      _id: '6605a0000000000000000001',
      title: 'Assignment 1: AVL Tree Rotations & Complexity Analysis',
      description: 'Implement Single and Double rotations for AVL trees in C++. Provide time complexity analysis and test cases for balance factors -2 and +2.',
      course: '6602a0000000000000000003',
      courseTitle: 'Data Structures and Algorithms (DSA)',
      teacher: defaultFacultyId,
      teacherName: 'TU BCA Faculty',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      attachments: [{ name: 'Assignment_1_Specifications.pdf', url: '#' }],
      totalMarks: 25,
      submissionsCount: 0,
      createdAt: new Date('2026-09-16'),
      updatedAt: new Date('2026-09-16'),
    },
    {
      _id: '6605a0000000000000000002',
      title: 'Lab Exercise: Pointer Dynamic Memory Allocation in C',
      description: 'Create a dynamic inventory record system allocating memory for structs using realloc when capacity exceeds limits.',
      course: '6602a0000000000000000001',
      courseTitle: 'C Programming & Problem Solving',
      teacher: defaultFacultyId,
      teacherName: 'TU BCA Faculty',
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      attachments: [{ name: 'Lab_Sheet_4_C.pdf', url: '#' }],
      totalMarks: 20,
      submissionsCount: 0,
      createdAt: new Date('2026-09-17'),
      updatedAt: new Date('2026-09-17'),
    },
  ];

  // Populate memory store (zero demo users, zero demo enrollments)
  memStore.users = [];
  memStore.courses = initialCourses;
  memStore.resources = initialResources;
  memStore.announcements = initialAnnouncements;
  memStore.assignments = initialAssignments;
  memStore.enrollments = [];
  memStore.advertisements = [];

  // If MongoDB is connected, verify production setup
  const conn = await connectDB();
  if (conn && mongoose.connection.readyState === 1) {
    try {
      // Optional initial admin provisioning from secure environment variables
      const envAdminEmail = process.env.ADMIN_EMAIL || process.env.INITIAL_ADMIN_EMAIL;
      const envAdminPass = process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD;
      if (envAdminEmail && envAdminPass) {
        const existing = await UserModel.findOne({ email: envAdminEmail.toLowerCase().trim() });
        if (!existing) {
          const hashed = await bcrypt.hash(envAdminPass, 10);
          await UserModel.create({
            name: 'System Administrator',
            email: envAdminEmail.toLowerCase().trim(),
            password: hashed,
            role: 'admin',
            status: 'active',
            emailVerified: new Date(),
          });
        }
      }

      // Clean up any remaining legacy demo accounts
      await UserModel.deleteMany({
        email: { $in: ['student@hamrobca.edu.np', 'teacher@hamrobca.edu.np', 'admin@hamrobca.edu.np'] }
      });
      await EnrollmentModel.deleteMany({
        user: '6601a0000000000000000003'
      });

      const courseCount = await CourseModel.countDocuments();
      if (courseCount === 0) {
        await CourseModel.insertMany(initialCourses);
        await ResourceModel.insertMany(initialResources);
        await AnnouncementModel.insertMany(initialAnnouncements);
        await AssignmentModel.insertMany(initialAssignments);
      }
    } catch (e: any) {
      console.error('[MongoDB] Initialization on Atlas:', e.message);
    }
  }

  isSeeded = true;
}

// Unified Database Access Methods
export const db = {
  // USER OPERATIONS
  async findUserByEmail(email: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();
    }
    return memStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await UserModel.findById(id).lean();
    }
    return memStore.users.find((u) => u._id.toString() === id.toString()) || null;
  },

  async createUser(userData: Partial<IUser>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject();
    }
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...userData,
      status: userData.status || 'active',
      emailVerified: userData.emailVerified || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<IUser>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await UserModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memStore.users.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.users[idx] = { ...memStore.users[idx], ...updates, updatedAt: new Date() };
      return memStore.users[idx];
    }
    return null;
  },

  async deleteUser(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await UserModel.findByIdAndDelete(id);
    }
    const idx = memStore.users.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      return memStore.users.splice(idx, 1)[0];
    }
    return null;
  },

  async getUsers(filter: any = {}, page = 1, limit = 10) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        UserModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        UserModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }

    let filtered = memStore.users;
    if (filter.role) {
      filtered = filtered.filter((u) => u.role === filter.role);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit).map((u) => {
      const { password, ...safe } = u;
      return safe;
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  // SUBSCRIPTION REQUEST OPERATIONS
  async createSubscriptionRequest(requestData: Partial<ISubscriptionRequest>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const request = new SubscriptionRequestModel(requestData);
      await request.save();
      return request.toObject();
    }
    const newRequest = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.subscriptionRequests.push(newRequest);
    return newRequest;
  },

  async getSubscriptionRequestsByUser(userId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await SubscriptionRequestModel.find({ userId }).sort({ createdAt: -1 }).lean();
    }
    return memStore.subscriptionRequests
      .filter((r) => r.userId?.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async hasPendingSubscriptionRequest(userId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const count = await SubscriptionRequestModel.countDocuments({
        userId,
        status: 'pending',
      });
      return count > 0;
    }
    return memStore.subscriptionRequests.some(
      (r) => r.userId?.toString() === userId.toString() && r.status === 'pending'
    );
  },

  async getSubscriptionRequestById(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await SubscriptionRequestModel.findById(id).lean();
    }
    return memStore.subscriptionRequests.find((r) => r._id.toString() === id.toString()) || null;
  },

  async getAllSubscriptionRequests(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = query;
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        SubscriptionRequestModel.find(filter).populate('userId', 'name email role isPremium').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        SubscriptionRequestModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }
    let filtered = memStore.subscriptionRequests;
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) => r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(start, start + limit);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async updateSubscriptionRequest(id: string, updates: Partial<ISubscriptionRequest>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await SubscriptionRequestModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memStore.subscriptionRequests.findIndex((r) => r._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.subscriptionRequests[idx] = { ...memStore.subscriptionRequests[idx], ...updates, updatedAt: new Date() };
      return memStore.subscriptionRequests[idx];
    }
    return null;
  },

  // COURSE OPERATIONS
  async getCourses(query: { semester?: number; search?: string; instructor?: string; page?: number; limit?: number }) {
    const { semester, search, instructor, page = 1, limit = 12 } = query;
    const conn = await connectDB();
    const filter: any = {};
    if (semester) filter.semester = Number(semester);
    if (instructor) filter.instructor = instructor;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        CourseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        CourseModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }

    let filtered = memStore.courses;
    if (semester) filtered = filtered.filter((c) => c.semester === Number(semester));
    if (instructor) filtered = filtered.filter((c) => c.instructor.toString() === instructor.toString());
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((c) => c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getCourseById(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await CourseModel.findById(id).lean();
    }
    return memStore.courses.find((c) => c._id.toString() === id.toString() || c.slug === id) || null;
  },

  async createCourse(courseData: Partial<ICourse>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const course = new CourseModel(courseData);
      await course.save();
      return course.toObject();
    }
    const newCourse = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...courseData,
      enrolledCount: 0,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.courses.push(newCourse);
    return newCourse;
  },

  async updateCourse(id: string, updates: Partial<ICourse>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await CourseModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memStore.courses.findIndex((c) => c._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.courses[idx] = { ...memStore.courses[idx], ...updates, updatedAt: new Date() };
      return memStore.courses[idx];
    }
    return null;
  },

  async deleteCourse(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      await EnrollmentModel.deleteMany({ course: id });
      return await CourseModel.findByIdAndDelete(id);
    }
    const idx = memStore.courses.findIndex((c) => c._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.enrollments = memStore.enrollments.filter((e) => e.course.toString() !== id.toString());
      return memStore.courses.splice(idx, 1)[0];
    }
    return null;
  },

  // ENROLLMENT & PROGRESS OPERATIONS
  async findEnrollment(userId: string, courseId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await EnrollmentModel.findOne({ user: userId, course: courseId }).lean();
    }
    return memStore.enrollments.find((e) => e.user.toString() === userId.toString() && e.course.toString() === courseId.toString()) || null;
  },

  async createEnrollment(userId: string, courseId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const enrollment = new EnrollmentModel({
        user: userId,
        course: courseId,
        status: 'active',
        progress: 0,
        completedLessons: [],
        enrolledAt: new Date(),
      });
      await enrollment.save();
      await CourseModel.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
      return enrollment.toObject();
    }
    const newEnrollment = {
      _id: new mongoose.Types.ObjectId().toString(),
      user: userId,
      course: courseId,
      status: 'active',
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.enrollments.push(newEnrollment);
    const course = memStore.courses.find((c) => c._id.toString() === courseId.toString());
    if (course) course.enrolledCount = (course.enrolledCount || 0) + 1;
    return newEnrollment;
  },

  async updateEnrollmentProgress(userId: string, courseId: string, lessonId: string, completed: boolean) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const enrollment = await EnrollmentModel.findOne({ user: userId, course: courseId });
      if (!enrollment) return null;

      let lessons = enrollment.completedLessons || [];
      if (completed && !lessons.includes(lessonId)) {
        lessons.push(lessonId);
      } else if (!completed) {
        lessons = lessons.filter((l) => l !== lessonId);
      }
      enrollment.completedLessons = lessons;

      // calculate progress
      const course = await CourseModel.findById(courseId);
      let totalLessons = 0;
      course?.modules?.forEach((m: any) => {
        totalLessons += m.lessons?.length || 0;
      });
      const pct = totalLessons > 0 ? Math.round((lessons.length / totalLessons) * 100) : 100;
      enrollment.progress = Math.min(100, Math.max(0, pct));
      if (enrollment.progress === 100) enrollment.status = 'completed';
      await enrollment.save();
      return enrollment.toObject();
    }

    const enrollment = memStore.enrollments.find((e) => e.user.toString() === userId.toString() && e.course.toString() === courseId.toString());
    if (!enrollment) return null;

    let lessons = enrollment.completedLessons || [];
    if (completed && !lessons.includes(lessonId)) {
      lessons.push(lessonId);
    } else if (!completed) {
      lessons = lessons.filter((l: string) => l !== lessonId);
    }
    enrollment.completedLessons = lessons;
    const course = memStore.courses.find((c) => c._id.toString() === courseId.toString());
    let totalLessons = 0;
    course?.modules?.forEach((m: any) => {
      totalLessons += m.lessons?.length || 0;
    });
    const pct = totalLessons > 0 ? Math.round((lessons.length / totalLessons) * 100) : 100;
    enrollment.progress = Math.min(100, Math.max(0, pct));
    if (enrollment.progress === 100) enrollment.status = 'completed';
    enrollment.updatedAt = new Date();
    return enrollment;
  },

  async getUserEnrollments(userId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await EnrollmentModel.find({ user: userId }).populate('course').sort({ enrolledAt: -1 }).lean();
    }
    return memStore.enrollments
      .filter((e) => e.user.toString() === userId.toString())
      .map((e) => {
        const course = memStore.courses.find((c) => c._id.toString() === e.course.toString());
        return { ...e, course };
      });
  },

  async getCourseEnrollments(courseId: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await EnrollmentModel.find({ course: courseId }).populate('user', 'name email avatar semester').lean();
    }
    return memStore.enrollments
      .filter((e) => e.course.toString() === courseId.toString())
      .map((e) => {
        const user = memStore.users.find((u) => u._id.toString() === e.user.toString());
        return {
          ...e,
          user: user ? { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, semester: user.semester } : null,
        };
      });
  },

  // RESOURCE OPERATIONS
  async getResources(query: { type?: string; semester?: number; subject?: string; search?: string; course?: string; page?: number; limit?: number; visibility?: string; uploadedBy?: string; isStudentContribution?: boolean }) {
    const { type, semester, subject, search, course, page = 1, limit = 15, visibility, uploadedBy, isStudentContribution } = query;
    const conn = await connectDB();
    const filter: any = {};
    if (type && type !== 'all') filter.type = type;
    if (semester) filter.semester = Number(semester);
    if (subject && subject !== 'all') filter.subject = subject;
    if (course) filter.course = course;
    if (visibility) filter.visibility = visibility;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (isStudentContribution !== undefined) filter.isStudentContribution = isStudentContribution;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        ResourceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ResourceModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }

    let filtered = memStore.resources;
    if (type && type !== 'all') filtered = filtered.filter((r) => r.type === type);
    if (semester) filtered = filtered.filter((r) => r.semester === Number(semester));
    if (subject && subject !== 'all') filtered = filtered.filter((r) => r.subject === subject);
    if (course) filtered = filtered.filter((r) => r.course?.toString() === course.toString());
    if (visibility) filtered = filtered.filter((r) => r.visibility === visibility);
    if (uploadedBy) filtered = filtered.filter((r) => r.uploadedBy?.toString() === uploadedBy.toString());
    if (isStudentContribution !== undefined) filtered = filtered.filter((r) => r.isStudentContribution === isStudentContribution);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getResourceById(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await ResourceModel.findById(id).lean();
    }
    return memStore.resources.find((r) => r._id.toString() === id.toString()) || null;
  },

  async findResourceByFileUrl(fileUrl: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await ResourceModel.findOne({ fileUrl }).lean();
    }
    return memStore.resources.find((r) => r.fileUrl === fileUrl) || null;
  },

  async createResource(resData: Partial<IResource>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const res = new ResourceModel(resData);
      await res.save();
      return res.toObject();
    }
    const newRes = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...resData,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.resources.push(newRes);
    return newRes;
  },

  async updateResource(id: string, updates: Partial<IResource>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await ResourceModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memStore.resources.findIndex((r) => r._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.resources[idx] = { ...memStore.resources[idx], ...updates, updatedAt: new Date() };
      return memStore.resources[idx];
    }
    return null;
  },

  async deleteResource(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await ResourceModel.findByIdAndDelete(id);
    }
    const idx = memStore.resources.findIndex((r) => r._id.toString() === id.toString());
    if (idx !== -1) {
      return memStore.resources.splice(idx, 1)[0];
    }
    return null;
  },

  async incrementResourceDownloads(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await ResourceModel.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true }).lean();
    }
    const res = memStore.resources.find((r) => r._id.toString() === id.toString());
    if (res) {
      res.downloads = (res.downloads || 0) + 1;
      return res;
    }
    return null;
  },

  // STUDENT CONTRIBUTION OPERATIONS
  async getStudentContributions(userId: string) {
    return this.getResources({ uploadedBy: userId, isStudentContribution: true, page: 1, limit: 50 });
  },

  async getCommunityNotes(query: { type?: string; semester?: number; subject?: string; search?: string; page?: number; limit?: number }) {
    // Public community notes - only visible public student contributions
    return this.getResources({ ...query, isStudentContribution: true, visibility: 'public' });
  },

  // ADMIN MODERATION OPERATIONS
  async getAllStudentContributions(query: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = query;
    const filter: any = { isStudentContribution: true };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { uploaderName: { $regex: search, $options: 'i' } },
      ];
    }
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        ResourceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        ResourceModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }
    let filtered = memStore.resources.filter((r) => r.isStudentContribution);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || (r.uploaderName?.toLowerCase().includes(q)));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async moderateStudentContribution(id: string, action: 'hide' | 'unhide' | 'delete') {
    const conn = await connectDB();
    if (action === 'delete') {
      // Also try to delete the file from Cloudinary if applicable
      const resource = await this.getResourceById(id);
      if (resource?.fileUrl) {
        const { deleteUploadedAsset } = await import('../routes/upload.js');
        await deleteUploadedAsset(resource.fileUrl);
      }
      return this.deleteResource(id);
    }
    const visibility = action === 'hide' ? 'hidden' : 'public';
    return this.updateResource(id, { visibility });
  },

  // ANNOUNCEMENT OPERATIONS
  async getAnnouncements(role: string = 'all') {
    const conn = await connectDB();
    const audienceFilter = ['all'];
    if (role === 'student') audienceFilter.push('students');
    if (role === 'teacher') audienceFilter.push('teachers', 'students');
    if (role === 'admin') audienceFilter.push('admins', 'teachers', 'students');

    if (conn && mongoose.connection.readyState === 1) {
      return await AnnouncementModel.find({ targetAudience: { $in: audienceFilter } as any })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    }
    return memStore.announcements
      .filter((a) => audienceFilter.includes(a.targetAudience))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createAnnouncement(data: Partial<IAnnouncement>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const ann = new AnnouncementModel(data);
      await ann.save();
      return ann.toObject();
    }
    const newAnn = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      priority: data.priority || 'normal',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.announcements.unshift(newAnn);
    return newAnn;
  },

  async deleteAnnouncement(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await AnnouncementModel.findByIdAndDelete(id);
    }
    const idx = memStore.announcements.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      return memStore.announcements.splice(idx, 1)[0];
    }
    return null;
  },

  // ASSIGNMENT OPERATIONS
  async getAssignments(courseId?: string, teacherId?: string) {
    const conn = await connectDB();
    const filter: any = {};
    if (courseId) filter.course = courseId;
    if (teacherId) filter.teacher = teacherId;

    if (conn && mongoose.connection.readyState === 1) {
      return await AssignmentModel.find(filter).sort({ deadline: 1 }).lean();
    }
    let list = memStore.assignments;
    if (courseId) list = list.filter((a) => a.course.toString() === courseId.toString());
    if (teacherId) list = list.filter((a) => a.teacher.toString() === teacherId.toString());
    return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  async createAssignment(data: Partial<IAssignment>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const assign = new AssignmentModel(data);
      await assign.save();
      return assign.toObject();
    }
    const newAssign = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      submissionsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.assignments.push(newAssign);
    return newAssign;
  },

  async deleteAssignment(id: string) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      return await AssignmentModel.findByIdAndDelete(id);
    }
    const idx = memStore.assignments.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      return memStore.assignments.splice(idx, 1)[0];
    }
    return null;
  },

  // TOKEN OPERATIONS (Email Verification & Password Reset)
  async createToken(email: string, token: string, type: 'email_verification' | 'password_reset', expiresHours = 24) {
    const expiresAt = new Date(Date.now() + expiresHours * 3600 * 1000);
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      await TokenModel.deleteMany({ email: email.toLowerCase(), type });
      const t = new TokenModel({ email: email.toLowerCase(), token, type, expiresAt });
      await t.save();
      return t.toObject();
    }
    // memory store cleanup and push
    memStore.tokens = memStore.tokens.filter((t) => !(t.email.toLowerCase() === email.toLowerCase() && t.type === type));
    const tokenObj = {
      _id: new mongoose.Types.ObjectId().toString(),
      email: email.toLowerCase(),
      token,
      type,
      expiresAt,
      createdAt: new Date(),
    };
    memStore.tokens.push(tokenObj);
    return tokenObj;
  },

  async verifyAndConsumeToken(token: string, type: 'email_verification' | 'password_reset') {
    const conn = await connectDB();
    const now = new Date();
    if (conn && mongoose.connection.readyState === 1) {
      const record = await TokenModel.findOne({ token, type });
      if (!record) return null;
      if (new Date(record.expiresAt) < now) {
        await TokenModel.deleteOne({ _id: record._id });
        return null;
      }
      await TokenModel.deleteOne({ _id: record._id });
      return record.email;
    }

    const idx = memStore.tokens.findIndex((t) => t.token === token && t.type === type);
    if (idx === -1) return null;
    const record = memStore.tokens[idx];
    if (new Date(record.expiresAt) < now) {
      memStore.tokens.splice(idx, 1);
      return null;
    }
    memStore.tokens.splice(idx, 1);
    return record.email;
  },

  // PLATFORM METRICS FOR ADMIN/TEACHER DASHBOARDS
  async getAdminStats() {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const [totalUsers, totalStudents, totalTeachers, totalCourses, totalResources, totalEnrollments] =
        await Promise.all([
          UserModel.countDocuments(),
          UserModel.countDocuments({ role: 'student' }),
          UserModel.countDocuments({ role: 'teacher' }),
          CourseModel.countDocuments(),
          ResourceModel.countDocuments(),
          EnrollmentModel.countDocuments(),
        ]);
      return {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalCourses,
        totalResources,
        totalEnrollments,
      };
    }

    return {
      totalUsers: memStore.users.length,
      totalStudents: memStore.users.filter((u) => u.role === 'student').length,
      totalTeachers: memStore.users.filter((u) => u.role === 'teacher').length,
      totalCourses: memStore.courses.length,
      totalResources: memStore.resources.length,
      totalEnrollments: memStore.enrollments.length,
    };
  },

  async getTeacherStats(teacherId: string) {
    const courses = (await this.getCourses({ instructor: teacherId })).items;
    const courseIds = courses.map((c: any) => c._id.toString());
    const resources = (await this.getResources({ limit: 100 })).items.filter((r: any) => r.uploadedBy?.toString() === teacherId.toString());

    let studentCount = 0;
    for (const c of courses) {
      studentCount += c.enrolledCount || 0;
    }

    return {
      totalCourses: courses.length,
      totalResources: resources.length,
      totalStudents: studentCount,
      recentCourses: courses.slice(0, 5),
    };
  },

  // ADVERTISEMENT OPERATIONS
  async getAdvertisements(query: { placement?: string; status?: string; search?: string; page?: number; limit?: number }) {
    const { placement, status, search, page = 1, limit = 10 } = query;
    const conn = await connectDB();
    const filter: any = {};
    if (placement && placement !== 'all') filter.placement = placement;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { buttonText: { $regex: search, $options: 'i' } },
      ];
    }

    if (conn && mongoose.connection.readyState === 1) {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        AdvertisementModel.find(filter).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        AdvertisementModel.countDocuments(filter),
      ]);
      return { items, total, page, pages: Math.ceil(total / limit) };
    }

    let filtered = memStore.advertisements;
    if (placement && placement !== 'all') filtered = filtered.filter((a) => a.placement === placement || a.placement === 'all');
    if (status && status !== 'all') filtered = filtered.filter((a) => a.status === status);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.buttonText && a.buttonText.toLowerCase().includes(q))
      );
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered
      .sort((a, b) => (b.priority || 1) - (a.priority || 1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(start, start + limit);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  async getActiveAdvertisements(placement?: string, audience: string = 'all') {
    const conn = await connectDB();
    const now = new Date();

    if (conn && mongoose.connection.readyState === 1) {
      const query: any = {
        status: 'active',
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ],
      };

      if (placement && placement !== 'all') {
        query.placement = { $in: [placement, 'all'] };
      }

      if (audience && audience !== 'all') {
        query.targetAudience = { $in: [audience, 'all'] };
      }

      return await AdvertisementModel.find(query).sort({ priority: -1, createdAt: -1 }).lean();
    }

    return memStore.advertisements
      .filter((ad) => {
        if (ad.status !== 'active') return false;
        if (ad.startDate && new Date(ad.startDate) > now) return false;
        if (ad.endDate && new Date(ad.endDate) < now) return false;
        if (placement && placement !== 'all' && ad.placement !== 'all' && ad.placement !== placement) return false;
        if (audience && audience !== 'all' && ad.targetAudience !== 'all' && ad.targetAudience !== audience) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 1) - (a.priority || 1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAdvertisementById(id: string) {
    if (!id || typeof id !== 'string') return null;
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await AdvertisementModel.findById(id).lean();
    }
    return memStore.advertisements.find((a) => a._id.toString() === id.toString()) || null;
  },

  async createAdvertisement(data: Partial<IAdvertisement>) {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const ad = new AdvertisementModel(data);
      await ad.save();
      return ad.toObject();
    }
    const newAd = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      priority: data.priority || 1,
      impressions: 0,
      clicks: 0,
      status: data.status || 'active',
      placement: data.placement || 'all',
      targetAudience: data.targetAudience || 'all',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memStore.advertisements.unshift(newAd);
    return newAd;
  },

  async updateAdvertisement(id: string, updates: Partial<IAdvertisement>) {
    if (!id || typeof id !== 'string') return null;
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await AdvertisementModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
    }
    const idx = memStore.advertisements.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      memStore.advertisements[idx] = { ...memStore.advertisements[idx], ...updates, updatedAt: new Date() };
      return memStore.advertisements[idx];
    }
    return null;
  },

  async deleteAdvertisement(id: string) {
    if (!id || typeof id !== 'string') return null;
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      return await AdvertisementModel.findByIdAndDelete(id);
    }
    const idx = memStore.advertisements.findIndex((a) => a._id.toString() === id.toString());
    if (idx !== -1) {
      return memStore.advertisements.splice(idx, 1)[0];
    }
    return null;
  },

  async trackAdImpression(id: string) {
    if (!id || typeof id !== 'string') return null;
    const conn = await connectDB();
    const now = new Date();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const ad = await AdvertisementModel.findById(id);
      if (!ad) return null;
      if (ad.status !== 'active') return { inactive: true };
      if (ad.startDate && new Date(ad.startDate) > now) return { inactive: true };
      if (ad.endDate && new Date(ad.endDate) < now) return { inactive: true };

      ad.impressions = (ad.impressions || 0) + 1;
      await ad.save();
      return ad.toObject();
    }
    const ad = memStore.advertisements.find((a) => a._id.toString() === id.toString());
    if (ad) {
      if (ad.status !== 'active') return { inactive: true };
      if (ad.startDate && new Date(ad.startDate) > now) return { inactive: true };
      if (ad.endDate && new Date(ad.endDate) < now) return { inactive: true };
      ad.impressions = (ad.impressions || 0) + 1;
      return ad;
    }
    return null;
  },

  async trackAdClick(id: string) {
    if (!id || typeof id !== 'string') return null;
    const conn = await connectDB();
    const now = new Date();
    if (conn && mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const ad = await AdvertisementModel.findById(id);
      if (!ad) return null;
      if (ad.status !== 'active') return { inactive: true };
      if (ad.startDate && new Date(ad.startDate) > now) return { inactive: true };
      if (ad.endDate && new Date(ad.endDate) < now) return { inactive: true };

      ad.clicks = (ad.clicks || 0) + 1;
      await ad.save();
      return ad.toObject();
    }
    const ad = memStore.advertisements.find((a) => a._id.toString() === id.toString());
    if (ad) {
      if (ad.status !== 'active') return { inactive: true };
      if (ad.startDate && new Date(ad.startDate) > now) return { inactive: true };
      if (ad.endDate && new Date(ad.endDate) < now) return { inactive: true };
      ad.clicks = (ad.clicks || 0) + 1;
      return ad;
    }
    return null;
  },

  async getAdvertisementStats() {
    const conn = await connectDB();
    if (conn && mongoose.connection.readyState === 1) {
      const [totalAds, activeAds, inactiveAds, scheduledAds, allAds] = await Promise.all([
        AdvertisementModel.countDocuments(),
        AdvertisementModel.countDocuments({ status: 'active' }),
        AdvertisementModel.countDocuments({ status: 'inactive' }),
        AdvertisementModel.countDocuments({ status: 'scheduled' }),
        AdvertisementModel.find().select('impressions clicks placement').lean(),
      ]);

      let totalImpressions = 0;
      let totalClicks = 0;
      const placementDistribution: Record<string, number> = {
        homepage: 0,
        student_dashboard: 0,
        course_pages: 0,
        resource_vault: 0,
        all: 0,
      };

      for (const ad of allAds) {
        totalImpressions += ad.impressions || 0;
        totalClicks += ad.clicks || 0;
        if (ad.placement && placementDistribution[ad.placement] !== undefined) {
          placementDistribution[ad.placement]++;
        }
      }

      const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

      return {
        totalAds,
        activeAds,
        inactiveAds,
        scheduledAds,
        totalImpressions,
        totalClicks,
        ctr,
        placementDistribution,
      };
    }

    const totalAds = memStore.advertisements.length;
    const activeAds = memStore.advertisements.filter((a) => a.status === 'active').length;
    const inactiveAds = memStore.advertisements.filter((a) => a.status === 'inactive').length;
    const scheduledAds = memStore.advertisements.filter((a) => a.status === 'scheduled').length;
    let totalImpressions = 0;
    let totalClicks = 0;
    const placementDistribution: Record<string, number> = {
      homepage: 0,
      student_dashboard: 0,
      course_pages: 0,
      resource_vault: 0,
      all: 0,
    };

    for (const ad of memStore.advertisements) {
      totalImpressions += ad.impressions || 0;
      totalClicks += ad.clicks || 0;
      if (ad.placement && placementDistribution[ad.placement] !== undefined) {
        placementDistribution[ad.placement]++;
      }
    }

    const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    return {
      totalAds,
      activeAds,
      inactiveAds,
      scheduledAds,
      totalImpressions,
      totalClicks,
      ctr,
      placementDistribution,
    };
  },
};

