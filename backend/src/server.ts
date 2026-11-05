import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';

import { initDatabase, executeRun, queryOne } from './db/index';
import { seedAICourse } from './db/seed_ai';
import bcrypt from 'bcryptjs';
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

// Gzip / Deflate compression for ultra-fast network transfer
app.use(compression());

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
  app.use(express.static(frontendDistPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));
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

// Start Server immediately on 0.0.0.0:${PORT} for instant Render health checks & port detection (<10ms)
const HOST = '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`===============================================`);
  console.log(`🚀 LISON Server running on http://${HOST}:${PORT}`);
  console.log(`⚡ Instant 0.0.0.0 port binding active (Cold-start bypass)`);
  console.log(`===============================================`);
});

// Non-blocking database initialization
initDatabase()
  .then(async () => {
    console.log(`📚 Relational Database connected & verified.`);
    // Ensure Super Admin accounts have password '1234' (or process.env.ADMIN_PASSWORD)
    try {
      const adminPass = process.env.ADMIN_PASSWORD || '1234';
      const hash = await bcrypt.hash(adminPass, 10);
      
      // Update existing super_admin password to '1234'
      await executeRun(
        `UPDATE users SET password_hash = ? WHERE role = 'super_admin' OR id = 'usr-admin-1'`,
        [hash]
      );

      // Also ensure sayfiddinovyusuf773@gmail.com exists and is super_admin with '1234'
      const adminEmail = (process.env.ADMIN_EMAIL || 'sayfiddinovyusuf773@gmail.com').toLowerCase().trim();
      const existingAdmin = await queryOne(`SELECT id FROM users WHERE email = ?`, [adminEmail]);
      if (existingAdmin) {
        await executeRun(
          `UPDATE users SET role = 'super_admin', password_hash = ? WHERE id = ?`,
          [hash, existingAdmin.id]
        );
      } else {
        await executeRun(
          `INSERT INTO users (id, email, password_hash, first_name, last_name, preferred_language, learning_level, role, xp_points, level)
           VALUES (?, ?, ?, 'Admin', 'Yusuf', 'uz', 'C2', 'super_admin', 10000, 50)`,
          ['usr-admin-sayfiddin', adminEmail, hash]
        );
      }
      console.log(`🔐 Admin security verified: password '1234' active for ${adminEmail} and admin@ziyo.uz`);
    } catch (err: any) {
      console.warn('Admin password initialization notice:', err.message);
    }

    // Ensure IT & Sun'iy Intellekt Course and core modules/lessons are always present
    try {
      await seedAICourse();
      console.log("🤖 IT & Sun'iy Intellekt (AI) course verified and active!");
    } catch (err: any) {
      console.warn('AI course check notice:', err.message);
    }
  })
  .catch((error) => {
    console.error('Database initialization notice:', error);
  });

// Automated 24/7 Keep-Alive: Pings external URL every 10 minutes to prevent Render from sleeping
const KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || 'https://lison.onrender.com';
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  try {
    https.get(`${KEEP_ALIVE_URL}/api/health`, (res) => {
      console.log(`[Auto-KeepAlive] Pinged ${KEEP_ALIVE_URL}/api/health — Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn('[Auto-KeepAlive] Ping warning:', err.message);
    });
  } catch (e: any) {
    console.warn('[Auto-KeepAlive] Unexpected error:', e.message);
  }
}, KEEP_ALIVE_INTERVAL);
