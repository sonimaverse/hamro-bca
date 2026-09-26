import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { connectDB, getDBStatus } from './server/db/connection.js';
import { seedInitialData } from './server/services/dbStore.js';

import { authRouter } from './server/routes/auth.js';
import { coursesRouter } from './server/routes/courses.js';
import { resourcesRouter } from './server/routes/resources.js';
import { announcementsRouter } from './server/routes/announcements.js';
import { assignmentsRouter } from './server/routes/assignments.js';
import { adminRouter } from './server/routes/admin.js';
import { usersRouter } from './server/routes/users.js';
import { uploadRouter } from './server/routes/upload.js';
import { advertisementsRouter } from './server/routes/advertisements.js';
import { subscriptionsRouter } from './server/routes/subscriptions.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect MongoDB Atlas if configured, and seed baseline BCA production data
  try {
    await connectDB();
  } catch (err) {
    console.warn('[MongoDB] Init connection check:', err);
  }

  await seedInitialData();

  // Health and System Diagnostics
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Hamro BCA API',
      database: getDBStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/advertisements', advertisementsRouter);
app.use('/api/subscriptions', subscriptionsRouter);

  // Vite middleware for development & Static hosting for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Hamro BCA] Server operational at http://0.0.0.0:${PORT}`
    );
  });
}

startServer();