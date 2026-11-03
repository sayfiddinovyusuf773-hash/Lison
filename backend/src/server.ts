import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { initDatabase } from './db/index';
import authRoutes from './routes/auth.routes';
import coursesRoutes from './routes/courses.routes';
import lessonsRoutes from './routes/lessons.routes';
import quizzesRoutes from './routes/quizzes.routes';
import aiRoutes from './routes/ai.routes';
import speakingRoutes from './routes/speaking.routes';
import dashboardRoutes from './routes/dashboard.routes';
import certificatesRoutes from './routes/certificates.routes';
import notificationsRoutes from './routes/notifications.routes';
import teachersRoutes from './routes/teachers.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'LISON API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/admin', adminRoutes);

// Static frontend serving in production
const possibleFrontendDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist')
];

let frontendDistPath: string | null = null;
for (const p of possibleFrontendDistPaths) {
  if (fs.existsSync(p)) {
    frontendDistPath = p;
    break;
  }
}

if (frontendDistPath) {
  console.log(`Serving frontend static build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  // Catch-all fallback for client-side React routing (compatible with Express 5)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendDistPath!, 'index.html'));
      return;
    }
    next();
  });
}

// Safe Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ichki server xatoligi yuz berdi.'
  });
});

// Start Server
const startServer = async () => {
  try {
    await initDatabase();
    const HOST = process.env.HOST || '0.0.0.0';
    app.listen(Number(PORT), () => {
      console.log(`===============================================`);
      console.log(`🚀 LISON Server running on port ${PORT}`);
      console.log(`📚 Relational Database connected & verified.`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
