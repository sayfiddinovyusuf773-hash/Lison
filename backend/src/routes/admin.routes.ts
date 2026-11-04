import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryAll, queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken, requireRoles, logAudit } from '../middleware/auth';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(authenticateToken);
router.use(requireRoles(['admin', 'super_admin']));

// 1. Overview Statistics
router.get('/overview', async (_req, res: Response): Promise<void> => {
  try {
    const totalUsers = await queryOne(`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`);
    const activeUsers = await queryOne(`SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND is_suspended = 0 AND deleted_at IS NULL`);
    const totalCourses = await queryOne(`SELECT COUNT(*) as count FROM courses WHERE deleted_at IS NULL`);
    const totalLessons = await queryOne(`SELECT COUNT(*) as count FROM lessons`);
    const completedLessons = await queryOne(`SELECT COUNT(*) as count FROM lesson_progress WHERE is_completed = 1`);
    const quizAttempts = await queryOne(`SELECT COUNT(*) as count, AVG(score_percent) as avg_score FROM quiz_attempts`);
    const certificatesIssued = await queryOne(`SELECT COUNT(*) as count FROM certificates WHERE is_revoked = 0`);
    const aiMessages = await queryOne(`SELECT COUNT(*) as count FROM ai_messages`);
    const speakingPractices = await queryOne(`SELECT COUNT(*) as count FROM speaking_sessions`);
    const pendingEnrollments = await queryOne(`SELECT COUNT(*) as count FROM enrollment_requests WHERE status = 'pending'`);

    const recentUsers = await queryAll(
      `SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5`
    );

    const recentLogs = await queryAll(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 8`
    );

    res.json({
      success: true,
      stats: {
        total_users: totalUsers?.count || 0,
        active_users: activeUsers?.count || 0,
        total_courses: totalCourses?.count || 0,
        total_lessons: totalLessons?.count || 0,
        completed_lessons: completedLessons?.count || 0,
        quiz_attempts: quizAttempts?.count || 0,
        average_quiz_score: Math.round(quizAttempts?.avg_score || 0),
        certificates_issued: certificatesIssued?.count || 0,
        ai_interactions: aiMessages?.count || 0,
        speaking_sessions: speakingPractices?.count || 0,
        pending_enrollments: pendingEnrollments?.count || 0
      },
      recent_users: recentUsers,
      recent_logs: recentLogs
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ success: false, message: 'Statistikani yuklab bo\'lmadi.' });
  }
});

// 2. User Management
router.get('/users', async (req, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;
    let sql = `SELECT id, email, first_name, last_name, role, xp_points, level, is_active, is_suspended, created_at FROM users WHERE deleted_at IS NULL`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (role && role !== 'all') {
      sql += ` AND role = ?`;
      params.push(role);
    }

    if (status === 'suspended') {
      sql += ` AND is_suspended = 1`;
    } else if (status === 'active') {
      sql += ` AND is_suspended = 0 AND is_active = 1`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const users = await queryAll(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Foydalanuvchilarni yuklab bo\'lmadi.' });
  }
});

// Update User Role / Status
router.put('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const { role, is_suspended, is_active, first_name, last_name } = req.body;

    // Super admin role restriction
    if (role === 'super_admin' && req.user!.role !== 'super_admin') {
      res.status(403).json({ success: false, message: 'Faqat Bosh Administrator super_admin rolini bera oladi.' });
      return;
    }

    await executeRun(
      `UPDATE users
       SET role = COALESCE(?, role),
           is_suspended = COALESCE(?, is_suspended),
           is_active = COALESCE(?, is_active),
           first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [role, is_suspended, is_active, first_name, last_name, targetUserId]
    );

    await logAudit(
      req.user!.id,
      'UPDATE_USER',
      'USERS',
      `Modified user ${targetUserId}: role=${role}, suspended=${is_suspended}`,
      req.ip
    );

    res.json({ success: true, message: 'Foydalanuvchi ma\'lumotlari muvaffaqiyatli yangilandi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Foydalanuvchini yangilashda xatolik.' });
  }
});

// 3. Course Management (Create, Edit, Publish/Unpublish, Delete safely)
router.post('/courses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, language, level, description, cover_image, teacher_id, duration_hours, objectives } = req.body;

    if (!title || !language || !level || !description) {
      res.status(400).json({ success: false, message: 'Majburiy maydonlarni to\'ldiring.' });
      return;
    }

    const courseId = 'crs-' + Date.now();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 5);

    await executeRun(
      `INSERT INTO courses (id, title, slug, language, level, description, cover_image, teacher_id, duration_hours, objectives, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        courseId,
        title,
        slug,
        language,
        level,
        description,
        cover_image || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
        teacher_id || null,
        duration_hours || 10,
        JSON.stringify(objectives || [])
      ]
    );

    await logAudit(req.user!.id, 'CREATE_COURSE', 'COURSES', `Created course: ${title} (${courseId})`, req.ip);

    res.status(201).json({ success: true, message: 'Yangi kurs muvaffaqiyatli yaratildi!', course_id: courseId });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ success: false, message: 'Kurs yaratishda xatolik yuz berdi.' });
  }
});

router.put('/courses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { title, language, level, description, cover_image, teacher_id, is_published, is_featured, duration_hours } = req.body;

    await executeRun(
      `UPDATE courses
       SET title = COALESCE(?, title),
           language = COALESCE(?, language),
           level = COALESCE(?, level),
           description = COALESCE(?, description),
           cover_image = COALESCE(?, cover_image),
           teacher_id = COALESCE(?, teacher_id),
           is_published = COALESCE(?, is_published),
           is_featured = COALESCE(?, is_featured),
           duration_hours = COALESCE(?, duration_hours),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, language, level, description, cover_image, teacher_id, is_published, is_featured, duration_hours, courseId]
    );

    await logAudit(req.user!.id, 'UPDATE_COURSE', 'COURSES', `Updated course ${courseId}`, req.ip);

    res.json({ success: true, message: 'Kurs muvaffaqiyatli yangilandi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Kursni yangilab bo\'lmadi.' });
  }
});

router.delete('/courses/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    // Soft delete
    await executeRun(`UPDATE courses SET deleted_at = CURRENT_TIMESTAMP, is_published = 0 WHERE id = ?`, [courseId]);
    await logAudit(req.user!.id, 'DELETE_COURSE', 'COURSES', `Soft-deleted course ${courseId}`, req.ip);
    res.json({ success: true, message: 'Kurs muvaffaqiyatli o\'chirildi (arxivlandi).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Kursni o\'chirib bo\'lmadi.' });
  }
});

// Helper to format YouTube URLs to clean embed URLs
export const formatYouTubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // Already an embed url
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  // Standard: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Short link: https://youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  // Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Plain 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  return trimmed;
};

// 3.1 Course Lessons & Video Management (YouTube Integration)
router.get('/courses/:id/lessons', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const course = await queryOne(`SELECT id, title FROM courses WHERE id = ?`, [courseId]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    const modules = await queryAll(
      `SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC`,
      [courseId]
    );

    const lessons = await queryAll(
      `SELECT l.*, m.title as module_title
       FROM lessons l
       LEFT JOIN course_modules m ON l.module_id = m.id
       WHERE l.course_id = ?
       ORDER BY l.order_index ASC`,
      [courseId]
    );

    res.json({
      success: true,
      course,
      modules,
      lessons
    });
  } catch (err) {
    console.error('Fetch course lessons error:', err);
    res.status(500).json({ success: false, message: 'Darslarni yuklab bo\'lmadi.' });
  }
});

// Add new Lesson with YouTube Video
router.post('/courses/:id/lessons', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { module_id, title, video_url, duration_minutes, content_text } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Dars nomi kiritilishi shart.' });
      return;
    }

    const course = await queryOne(`SELECT id, title FROM courses WHERE id = ?`, [courseId]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    // Ensure a module exists
    let targetModuleId = module_id;
    if (!targetModuleId) {
      let firstMod = await queryOne(`SELECT id FROM course_modules WHERE course_id = ? LIMIT 1`, [courseId]);
      if (!firstMod) {
        targetModuleId = 'mod-' + Date.now();
        await executeRun(
          `INSERT INTO course_modules (id, course_id, title, description, order_index)
           VALUES (?, ?, '1-Modul: Asosiy Darslar', 'Kursning kirish va amaliy video darslari', 1)`,
          [targetModuleId, courseId]
        );
      } else {
        targetModuleId = firstMod.id;
      }
    }

    const lessonCount = await queryOne(
      `SELECT COUNT(*) as cnt FROM lessons WHERE course_id = ?`,
      [courseId]
    );
    const nextOrder = (lessonCount?.cnt || 0) + 1;
    const lessonId = 'lsn-' + Date.now();
    const formattedVideo = formatYouTubeEmbedUrl(video_url || '');
    const duration = Number(duration_minutes) || 15;

    await executeRun(
      `INSERT INTO lessons (id, module_id, course_id, title, order_index, video_url, duration_minutes, content_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lessonId,
        targetModuleId,
        courseId,
        title.trim(),
        nextOrder,
        formattedVideo,
        duration,
        content_text || ''
      ]
    );

    // Update course total_lessons count and duration_hours
    await executeRun(
      `UPDATE courses
       SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ?),
           duration_hours = ROUND((SELECT COALESCE(SUM(duration_minutes), 0) FROM lessons WHERE course_id = ?) / 60.0, 1)
       WHERE id = ?`,
      [courseId, courseId, courseId]
    );

    await logAudit(
      req.user!.id,
      'CREATE_LESSON',
      'LESSONS',
      `Added lesson "${title}" to course ${course.title} with YouTube video: ${formattedVideo}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Yangi video dars muvaffaqiyatli qo\'shildi!',
      lesson_id: lessonId,
      video_url: formattedVideo
    });
  } catch (err) {
    console.error('Add lesson error:', err);
    res.status(500).json({ success: false, message: 'Darsni qo\'shishda xatolik yuz berdi.' });
  }
});

// Update Lesson (Edit YouTube Video, title, duration, etc.)
router.put('/lessons/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.id;
    const { title, video_url, duration_minutes, content_text, module_id } = req.body;

    const existing = await queryOne(`SELECT * FROM lessons WHERE id = ?`, [lessonId]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Dars topilmadi.' });
      return;
    }

    const formattedVideo = video_url !== undefined ? formatYouTubeEmbedUrl(video_url) : existing.video_url;
    const duration = duration_minutes !== undefined ? Number(duration_minutes) : existing.duration_minutes;
    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newContent = content_text !== undefined ? content_text : existing.content_text;
    const newModuleId = module_id || existing.module_id;

    await executeRun(
      `UPDATE lessons
       SET title = ?,
           video_url = ?,
           duration_minutes = ?,
           content_text = ?,
           module_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newTitle, formattedVideo, duration, newContent, newModuleId, lessonId]
    );

    // Update course duration_hours
    await executeRun(
      `UPDATE courses
       SET duration_hours = ROUND((SELECT COALESCE(SUM(duration_minutes), 0) FROM lessons WHERE course_id = ?) / 60.0, 1)
       WHERE id = ?`,
      [existing.course_id, existing.course_id]
    );

    await logAudit(
      req.user!.id,
      'UPDATE_LESSON',
      'LESSONS',
      `Updated lesson ${lessonId}: "${newTitle}" (Video: ${formattedVideo})`,
      req.ip
    );

    res.json({
      success: true,
      message: 'Video dars ma\'lumotlari muvaffaqiyatli yangilandi!',
      video_url: formattedVideo
    });
  } catch (err) {
    console.error('Update lesson error:', err);
    res.status(500).json({ success: false, message: 'Darsni yangilashda xatolik yuz berdi.' });
  }
});

// Delete Lesson
router.delete('/lessons/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lessonId = req.params.id;
    const existing = await queryOne(`SELECT course_id, title FROM lessons WHERE id = ?`, [lessonId]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Dars topilmadi.' });
      return;
    }

    await executeRun(`DELETE FROM lessons WHERE id = ?`, [lessonId]);

    // Recalculate courses total_lessons and duration_hours
    await executeRun(
      `UPDATE courses
       SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = ?),
           duration_hours = ROUND((SELECT COALESCE(SUM(duration_minutes), 0) FROM lessons WHERE course_id = ?) / 60.0, 1)
       WHERE id = ?`,
      [existing.course_id, existing.course_id, existing.course_id]
    );

    await logAudit(
      req.user!.id,
      'DELETE_LESSON',
      'LESSONS',
      `Deleted lesson "${existing.title}" (${lessonId})`,
      req.ip
    );

    res.json({ success: true, message: 'Dars o\'chirildi.' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    res.status(500).json({ success: false, message: 'Darsni o\'chirib bo\'lmadi.' });
  }
});

// 4. Certificates Management & Revocation
router.get('/certificates', async (_req, res: Response): Promise<void> => {
  try {
    const certs = await queryAll(
      `SELECT c.*, u.email as student_email
       FROM certificates c
       LEFT JOIN users u ON c.user_id = u.id
       ORDER BY c.issue_date DESC LIMIT 100`
    );

    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sertifikatlarni yuklab bo\'lmadi.' });
  }
});

router.put('/certificates/:id/revoke', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const certId = req.params.id;
    const { reason } = req.body;

    await executeRun(
      `UPDATE certificates SET is_revoked = 1, revocation_reason = ? WHERE id = ?`,
      [reason || 'Ma\'muriyat tomonidan qoidabuzarlik sababli bekor qilindi', certId]
    );

    await logAudit(req.user!.id, 'REVOKE_CERTIFICATE', 'CERTIFICATES', `Revoked ${certId}: ${reason}`, req.ip);

    res.json({ success: true, message: 'Sertifikat bekor qilindi va auditga qayd etildi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sertifikatni bekor qilishda xatolik.' });
  }
});

// 5. System Settings
router.get('/settings', async (_req, res: Response): Promise<void> => {
  try {
    const settings = await queryAll(`SELECT * FROM system_settings`);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sozlamalarni yuklab bo\'lmadi.' });
  }
});

router.put('/settings', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { settings } = req.body; // array of { key, value }
    if (Array.isArray(settings)) {
      for (const s of settings) {
        await executeRun(
          `INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
          [s.key, s.value]
        );
      }
    }
    await logAudit(req.user!.id, 'UPDATE_SETTINGS', 'SYSTEM', 'Updated system settings', req.ip);
    res.json({ success: true, message: 'Tizim sozlamalari muvaffaqiyatli saqlandi!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sozlamalarni saqlashda xatolik.' });
  }
});

// 6. Course Pricing & Paid Toggle
router.put('/courses/:id/pricing', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const { is_paid, price, currency } = req.body;

    const course = await queryOne(`SELECT id, title FROM courses WHERE id = ?`, [courseId]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    const paidVal = is_paid ? 1 : 0;
    const priceVal = Number(price) || 0;
    const currVal = currency || 'UZS';

    await executeRun(
      `UPDATE courses SET is_paid = ?, price = ?, currency = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [paidVal, priceVal, currVal, courseId]
    );

    await logAudit(
      req.user!.id,
      'UPDATE_COURSE_PRICING',
      'COURSES',
      `Updated ${course.title} to ${paidVal ? 'PAID (' + priceVal + ' ' + currVal + ')' : 'FREE'}`,
      req.ip
    );

    res.json({
      success: true,
      message: `"${course.title}" kursi holati ${paidVal ? 'PULLIK (' + priceVal.toLocaleString() + ' ' + currVal + ')' : 'BEPUL'} ga o'zgartirildi!`
    });
  } catch (err) {
    console.error('Update pricing error:', err);
    res.status(500).json({ success: false, message: 'Kurs narxini yangilashda xatolik.' });
  }
});

// 7. Enrollment & Payment Requests Management
router.get('/enrollment-requests', async (_req, res: Response): Promise<void> => {
  try {
    const requests = await queryAll(
      `SELECT r.*, c.title as course_title, c.cover_image as course_cover, u.first_name, u.last_name, u.email as user_email_orig, u.avatar as user_avatar
       FROM enrollment_requests r
       JOIN courses c ON r.course_id = c.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC LIMIT 100`
    );

    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    console.error('Fetch enrollment requests error:', err);
    res.status(500).json({ success: false, message: 'To\'lov so\'rovlarini yuklab bo\'lmadi.' });
  }
});

// Approve Enrollment & Payment Request
router.post('/enrollment-requests/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reqId = req.params.id;
    const adminId = req.user!.id;

    const reqData = await queryOne(
      `SELECT r.*, c.title as course_title FROM enrollment_requests r JOIN courses c ON r.course_id = c.id WHERE r.id = ?`,
      [reqId]
    );

    if (!reqData) {
      res.status(404).json({ success: false, message: 'So\'rov topilmadi.' });
      return;
    }

    if (reqData.status === 'approved') {
      res.status(400).json({ success: false, message: 'Ushbu so\'rov allaqachon tasdiqlangan.' });
      return;
    }

    // 1. Mark request as approved
    await executeRun(
      `UPDATE enrollment_requests SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?`,
      [adminId, reqId]
    );

    // 2. Fetch first lesson for enrollment target
    const firstLesson = await queryOne(
      `SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC LIMIT 1`,
      [reqData.course_id]
    );

    // 3. Enroll student (or activate enrollment)
    const existingEnr = await queryOne(
      `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [reqData.user_id, reqData.course_id]
    );

    if (!existingEnr) {
      const enrId = 'enr-' + Date.now();
      await executeRun(
        `INSERT INTO enrollments (id, user_id, course_id, progress_percent, is_completed, last_accessed_lesson_id)
         VALUES (?, ?, ?, 0, 0, ?)`,
        [enrId, reqData.user_id, reqData.course_id, firstLesson ? firstLesson.id : null]
      );

      // Increment enrollment count
      await executeRun(
        `UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?`,
        [reqData.course_id]
      );
    }

    // 4. Send celebratory notification to student
    const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notifId,
        reqData.user_id,
        "Kursga to'lov tasdiqlandi!",
        `Tabriklaymiz! Sizning "${reqData.course_title}" kursi uchun yuborgan to'lov so'rovingiz administrator tomonidan tasdiqlandi. Darslarni hoziroq boshlashingiz mumkin!`,
        'course',
        `/courses/${reqData.course_id}`
      ]
    );

    // 5. Audit log
    await logAudit(
      adminId,
      'APPROVE_ENROLLMENT',
      'ENROLLMENT_REQUESTS',
      `Approved request ${reqId} for user ${reqData.user_name} on course ${reqData.course_title}`,
      req.ip
    );

    res.json({
      success: true,
      message: `"${reqData.course_title}" kursi uchun so'rov muvaffaqiyatli tasdiqlandi va talaba darsga qo'shildi!`
    });
  } catch (err) {
    console.error('Approve request error:', err);
    res.status(500).json({ success: false, message: 'So\'rovni tasdiqlashda xatolik yuz berdi.' });
  }
});

// Reject Enrollment Request
router.post('/enrollment-requests/:id/reject', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reqId = req.params.id;
    const adminId = req.user!.id;
    const { note } = req.body;

    const reqData = await queryOne(
      `SELECT r.*, c.title as course_title FROM enrollment_requests r JOIN courses c ON r.course_id = c.id WHERE r.id = ?`,
      [reqId]
    );

    if (!reqData) {
      res.status(404).json({ success: false, message: 'So\'rov topilmadi.' });
      return;
    }

    await executeRun(
      `UPDATE enrollment_requests SET status = 'rejected', admin_note = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?`,
      [note || 'Ma\'lumotlar mos kelmadi', adminId, reqId]
    );

    // Send notification to student
    const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notifId,
        reqData.user_id,
        "To'lov so'rovi rad etildi",
        `Afsuski, "${reqData.course_title}" kursi uchun so'rovingiz qabul qilinmadi: ${note || 'Iltimos, qayta murojaat qiling.'}`,
        'system',
        `/courses/${reqData.course_id}`
      ]
    );

    await logAudit(
      adminId,
      'REJECT_ENROLLMENT',
      'ENROLLMENT_REQUESTS',
      `Rejected request ${reqId} for ${reqData.user_name}: ${note}`,
      req.ip
    );

    res.json({ success: true, message: 'So\'rov rad etildi.' });
  } catch (err) {
    console.error('Reject request error:', err);
    res.status(500).json({ success: false, message: 'So\'rovni rad etishda xatolik.' });
  }
});

// 8. Student Submissions & Quiz Results (All courses)
router.get('/submissions', async (_req, res: Response): Promise<void> => {
  try {
    const attempts = await queryAll(
      `SELECT qa.id, qa.score_percent, qa.total_points, qa.earned_points, qa.passed, qa.time_spent_seconds, qa.attempted_at,
              u.id as user_id, u.first_name, u.last_name, u.email, u.avatar,
              q.title as quiz_title, q.passing_score,
              c.id as course_id, c.title as course_title,
              'quiz' as submission_type
       FROM quiz_attempts qa
       JOIN users u ON qa.user_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN courses c ON q.course_id = c.id
       ORDER BY qa.attempted_at DESC LIMIT 100`
    );

    const homeworks = await queryAll(
      `SELECT lp.id, lp.completed_at as attempted_at, lp.student_notes as homework_text,
              u.id as user_id, u.first_name, u.last_name, u.email, u.avatar,
              l.title as lesson_title,
              c.id as course_id, c.title as course_title,
              'homework' as submission_type,
              1 as passed,
              100 as score_percent
       FROM lesson_progress lp
       JOIN users u ON lp.user_id = u.id
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN courses c ON lp.course_id = c.id
       WHERE lp.student_notes IS NOT NULL AND lp.student_notes != ""
       ORDER BY lp.completed_at DESC LIMIT 50`
    );

    res.json({ success: true, count: attempts.length + homeworks.length, attempts, homeworks });
  } catch (err) {
    console.error('Fetch admin submissions error:', err);
    res.status(500).json({ success: false, message: 'Topshiriqlar ro\'yxatini yuklab bo\'lmadi.' });
  }
});

// 12. Admin Profile: Get and Update Credentials (Email, Password, Name)
router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const admin = await queryOne(
      `SELECT id, email, first_name, last_name, role, avatar, created_at FROM users WHERE id = ?`,
      [adminId]
    );
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin topilmadi.' });
      return;
    }
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Admin ma\'lumotlarini yuklab bo\'lmadi.' });
  }
});

router.put('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id;
    const { email, password, first_name, last_name } = req.body;

    const current = await queryOne(`SELECT id, email FROM users WHERE id = ?`, [adminId]);
    if (!current) {
      res.status(404).json({ success: false, message: 'Admin topilmadi.' });
      return;
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicate = await queryOne(`SELECT id FROM users WHERE email = ? AND id != ?`, [normalizedEmail, adminId]);
      if (duplicate) {
        res.status(400).json({ success: false, message: 'Bu email manzili boshqa foydalanuvchi tomonidan band qilingan.' });
        return;
      }
      await executeRun(`UPDATE users SET email = ? WHERE id = ?`, [normalizedEmail, adminId]);
    }

    if (password && password.trim().length >= 6) {
      const hash = await bcrypt.hash(password.trim(), 10);
      await executeRun(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, adminId]);
    }

    if (first_name) {
      await executeRun(`UPDATE users SET first_name = ? WHERE id = ?`, [first_name.trim(), adminId]);
    }

    if (last_name) {
      await executeRun(`UPDATE users SET last_name = ? WHERE id = ?`, [last_name.trim(), adminId]);
    }

    const updated = await queryOne(
      `SELECT id, email, first_name, last_name, role, avatar FROM users WHERE id = ?`,
      [adminId]
    );

    await logAudit(
      adminId || 'system',
      'ADMIN_CREDENTIALS_UPDATE',
      'users',
      JSON.stringify({ updated_email: updated.email })
    );

    res.json({
      success: true,
      message: 'Admin ma\'lumotlari (email/parol) muvaffaqiyatli yangilandi.',
      admin: updated
    });
  } catch (err) {
    console.error('Update admin profile error:', err);
    res.status(500).json({ success: false, message: 'Profilni yangilashda xatolik yuz berdi.' });
  }
});

export default router;
