import { Router, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/index';
import { AuthRequest, optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

// Get all courses (with search, language, level, sorting)
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, language, level, teacher_id, sort } = req.query;

    let sql = `
      SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar, t.title as teacher_title
      FROM courses c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.deleted_at IS NULL AND c.is_published = 1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.language LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (language && language !== 'all') {
      sql += ` AND LOWER(c.language) = LOWER(?)`;
      params.push(language);
    }

    if (level && level !== 'all') {
      sql += ` AND c.level = ?`;
      params.push(level);
    }

    if (teacher_id) {
      sql += ` AND c.teacher_id = ?`;
      params.push(teacher_id);
    }

    // Sorting
    if (sort === 'newest') {
      sql += ` ORDER BY c.created_at DESC`;
    } else if (sort === 'rating') {
      sql += ` ORDER BY c.rating DESC`;
    } else if (sort === 'difficulty_asc') {
      sql += ` ORDER BY c.level ASC`;
    } else {
      sql += ` ORDER BY c.enrollment_count DESC, c.created_at DESC`;
    }

    const courses = await queryAll(sql, params);

    // If logged in, attach enrollment info
    if (req.user) {
      const enrollments = await queryAll(
        `SELECT course_id, progress_percent, is_completed, is_wishlist FROM enrollments WHERE user_id = ?`,
        [req.user.id]
      );
      const enrMap = new Map(enrollments.map((e: any) => [e.course_id, e]));

      courses.forEach((c: any) => {
        const enr = enrMap.get(c.id);
        c.is_enrolled = !!enr;
        c.progress_percent = enr ? enr.progress_percent : 0;
        c.is_completed = enr ? !!enr.is_completed : false;
        c.is_wishlist = enr ? !!enr.is_wishlist : false;
        c.price_coins = c.price_coins || 100;
      });
    } else {
      courses.forEach((c: any) => {
        c.price_coins = c.price_coins || 100;
      });
    }

    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ success: false, message: 'Kurslarni yuklab bo\'lmadi.' });
  }
});

// Get single course details with curriculum
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const course = await queryOne(
      `SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar, t.title as teacher_title, t.bio as teacher_bio
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE (c.id = ? OR c.slug = ?) AND c.deleted_at IS NULL`,
      [courseId, courseId]
    );

    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    try {
      course.objectives = JSON.parse(course.objectives || '[]');
    } catch {
      course.objectives = [];
    }

    // Fetch modules and lessons
    const modules = await queryAll(
      `SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC`,
      [course.id]
    );

    const lessons = await queryAll(
      `SELECT id, module_id, course_id, title, order_index, duration_minutes, video_url
       FROM lessons WHERE course_id = ? ORDER BY order_index ASC`,
      [course.id]
    );

    // Map user progress if authenticated
    let userProgressMap = new Map();
    let enrollment: any = null;
    let pendingRequest: any = null;
    if (req.user) {
      enrollment = await queryOne(
        `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
        [req.user.id, course.id]
      );

      const progressRows = await queryAll(
        `SELECT lesson_id, is_completed FROM lesson_progress WHERE user_id = ? AND course_id = ?`,
        [req.user.id, course.id]
      );
      userProgressMap = new Map(progressRows.map((p: any) => [p.lesson_id, p.is_completed]));

      pendingRequest = await queryOne(
        `SELECT id, status, payment_method, phone, created_at FROM enrollment_requests WHERE user_id = ? AND course_id = ? ORDER BY created_at DESC LIMIT 1`,
        [req.user.id, course.id]
      );
    }

    const curriculum = modules.map((m: any) => {
      const moduleLessons = lessons
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => ({
          ...l,
          is_completed: userProgressMap.get(l.id) === 1
        }));
      return {
        ...m,
        lessons: moduleLessons
      };
    });

    course.curriculum = curriculum;
    course.is_enrolled = !!enrollment;
    course.progress_percent = enrollment ? enrollment.progress_percent : 0;

    // Ensure last_accessed_lesson_id points to a valid existing lesson
    const validLessonIds = lessons.map((l: any) => l.id);
    let resolvedLastAccessed = enrollment ? enrollment.last_accessed_lesson_id : null;
    if (resolvedLastAccessed && !validLessonIds.includes(resolvedLastAccessed)) {
      resolvedLastAccessed = validLessonIds.length > 0 ? validLessonIds[0] : null;
      if (enrollment && resolvedLastAccessed) {
        executeRun(`UPDATE enrollments SET last_accessed_lesson_id = ? WHERE id = ?`, [resolvedLastAccessed, enrollment.id]).catch(() => {});
      }
    }
    course.last_accessed_lesson_id = resolvedLastAccessed;
    course.is_wishlist = enrollment ? !!enrollment.is_wishlist : false;
    course.pending_request = pendingRequest || null;

    res.json({ success: true, course });
  } catch (err) {
    console.error('Fetch course detail error:', err);
    res.status(500).json({ success: false, message: 'Kurs ma\'lumotlarini yuklab bo\'lmadi.' });
  }
});

// Enroll in course
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user!.id;

    const course = await queryOne(`SELECT id, title, total_lessons, is_paid, price FROM courses WHERE id = ?`, [courseId]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    // Check if course is paid and user is not yet approved
    if (course.is_paid === 1) {
      const existingEnr = await queryOne(
        `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? AND is_wishlist = 0`,
        [userId, courseId]
      );
      if (!existingEnr) {
        res.status(402).json({
          success: false,
          is_paid: true,
          price: course.price,
          message: 'Ushbu kurs pullik. Kursga a\'zo bo\'lish uchun administratorga to\'lov so\'rovini yuboring.'
        });
        return;
      }
    }

    const firstLesson = await queryOne(
      `SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC LIMIT 1`,
      [courseId]
    );

    const existing = await queryOne(
      `SELECT id, is_wishlist FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (!existing) {
      const enrId = 'enr-' + Date.now();
      await executeRun(
        `INSERT INTO enrollments (id, user_id, course_id, progress_percent, is_completed, is_wishlist, last_accessed_lesson_id)
         VALUES (?, ?, ?, 0, 0, 0, ?)`,
        [enrId, userId, courseId, firstLesson ? firstLesson.id : null]
      );

      // Increment enrollment count
      await executeRun(`UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?`, [courseId]);

      // Notification
      await executeRun(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, 'course', ?)`,
        [
          'notif-' + Date.now(),
          userId,
          "Kursga a'zo bo'ldingiz!",
          `"${course.title}" kursiga muvaffaqiyatli a'zo bo'ldingiz. O'rganishni boshlang!`,
          `/courses/${courseId}`
        ]
      );
    } else if (existing.is_wishlist === 1) {
      await executeRun(
        `UPDATE enrollments SET is_wishlist = 0, enrolled_at = CURRENT_TIMESTAMP, last_accessed_lesson_id = COALESCE(last_accessed_lesson_id, ?) WHERE id = ?`,
        [firstLesson ? firstLesson.id : null, existing.id]
      );
      await executeRun(`UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?`, [courseId]);
    }

    res.json({
      success: true,
      message: 'Kursga muvaffaqiyatli a\'zo bo\'ldingiz!',
      first_lesson_id: firstLesson ? firstLesson.id : null
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ success: false, message: 'A\'zo bo\'lishda xatolik yuz berdi.' });
  }
});

// Unenroll from course ("Kursdan chiqish")
router.delete('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user!.id;

    const existing = await queryOne(
      `SELECT id, is_wishlist FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (!existing) {
      res.status(404).json({ success: false, message: 'Siz ushbu kursga a\'zo emassiz.' });
      return;
    }

    await executeRun(`DELETE FROM enrollments WHERE id = ?`, [existing.id]);

    if (!existing.is_wishlist) {
      await executeRun(
        `UPDATE courses SET enrollment_count = CASE WHEN enrollment_count > 0 THEN enrollment_count - 1 ELSE 0 END WHERE id = ?`,
        [courseId]
      );
    }

    res.json({ success: true, message: 'Kursdan muvaffaqiyatli chiqdingiz.' });
  } catch (err) {
    console.error('Unenroll error:', err);
    res.status(500).json({ success: false, message: 'Kursdan chiqishda xatolik yuz berdi.' });
  }
});

// Unlock Course with Coins (Tangalar evaziga til kursini ochish)
router.post('/:id/unlock-with-coins', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user!.id;

    const course = await queryOne(
      `SELECT id, title, price_coins, is_paid FROM courses WHERE id = ? AND deleted_at IS NULL`,
      [courseId]
    );

    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    const existingEnr = await queryOne(
      `SELECT id, is_wishlist FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (existingEnr && !existingEnr.is_wishlist) {
      res.json({
        success: true,
        already_enrolled: true,
        message: 'Siz bu kursga allaqachon a\'zo bo\'lgansiz.'
      });
      return;
    }

    const user = await queryOne(`SELECT coins FROM users WHERE id = ?`, [userId]);
    const currentCoins = user?.coins !== undefined && user?.coins !== null ? user.coins : 0;
    const requiredCoins = course.price_coins || 100;

    if (currentCoins < requiredCoins) {
      res.status(400).json({
        success: false,
        message: `Tangalaringiz yetarli emas. Sizda ${currentCoins} 🪙 bor, ushbu kursni ochish uchun ${requiredCoins} 🪙 kerak. Darslardagi testlarni yechib tanga yig'ishingiz mumkin!`
      });
      return;
    }

    // Deduct coins
    const newCoins = currentCoins - requiredCoins;
    await executeRun(`UPDATE users SET coins = ? WHERE id = ?`, [newCoins, userId]);

    // Create or upgrade wishlist enrollment
    const firstLesson = await queryOne(
      `SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC LIMIT 1`,
      [courseId]
    );
    if (existingEnr) {
      await executeRun(
        `UPDATE enrollments SET is_wishlist = 0, enrolled_at = CURRENT_TIMESTAMP, last_accessed_lesson_id = COALESCE(last_accessed_lesson_id, ?) WHERE id = ?`,
        [firstLesson ? firstLesson.id : null, existingEnr.id]
      );
    } else {
      const enrId = 'enr-' + Date.now();
      await executeRun(
        `INSERT INTO enrollments (id, user_id, course_id, progress_percent, is_completed, is_wishlist, last_accessed_lesson_id)
         VALUES (?, ?, ?, 0, 0, 0, ?)`,
        [enrId, userId, courseId, firstLesson ? firstLesson.id : null]
      );
    }

    await executeRun(`UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?`, [courseId]);

    // Send notification
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, 'Kurs tangalar evaziga ochildi! 🪙', ?, 'course', ?)`,
      [
        'notif-' + Date.now(),
        userId,
        `Tabriklaymiz! "${course.title}" kursi ${requiredCoins} tanga evaziga ochildi. Yangi tilni o'rganishni boshlang!`,
        `/courses/${courseId}`
      ]
    );

    res.json({
      success: true,
      coins: newCoins,
      message: `Tabriklaymiz! "${course.title}" kursi ${requiredCoins} tanga evaziga ochildi!`,
      first_lesson_id: firstLesson ? firstLesson.id : null
    });
  } catch (err) {
    console.error('Unlock with coins error:', err);
    res.status(500).json({ success: false, message: 'Kursni ochishda xatolik yuz berdi.' });
  }
});

// Submit Paid Course Enrollment / Payment Request (Admin is immediately notified)
router.post('/:id/enrollment-request', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user!.id;
    const { phone, payment_method, note } = req.body;

    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Telefon raqamini kiritish majburiy.' });
      return;
    }

    const course = await queryOne(
      `SELECT id, title, is_paid, price, currency FROM courses WHERE id = ?`,
      [courseId]
    );

    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    // Check if user is already enrolled
    const existingEnr = await queryOne(
      `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (existingEnr) {
      res.json({
        success: true,
        already_enrolled: true,
        message: 'Siz ushbu kursga allaqachon a\'zo bo\'lgansiz.'
      });
      return;
    }

    const currentUser = await queryOne(
      `SELECT id, first_name, last_name, email FROM users WHERE id = ?`,
      [userId]
    );

    const fullName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Foydalanuvchi';
    const email = currentUser?.email || '';
    const selectedMethod = payment_method || 'Click';
    const amount = course.price || 0;
    const currency = course.currency || 'UZS';
    const requestId = 'req-' + Date.now();

    // Insert into enrollment_requests
    await executeRun(
      `INSERT INTO enrollment_requests (id, user_id, course_id, user_name, user_email, phone, payment_method, amount, currency, status, admin_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [requestId, userId, courseId, fullName, email, phone.trim(), selectedMethod, amount, currency, note || null]
    );

    // Notify ALL Admins & Super Admins immediately!
    const admins = await queryAll(`SELECT id FROM users WHERE role IN ('admin', 'super_admin')`);
    for (const admin of admins) {
      const notifId = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const notifMsg = `${fullName} (${phone}) "${course.title}" kursi uchun to'lov so'rovi yubordi. Narxi: ${amount.toLocaleString()} ${currency} (${selectedMethod}).`;
      
      await executeRun(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [notifId, admin.id, "Yangi to'lov & kurs so'rovi!", notifMsg, 'payment_request', '/admin']
      );
    }

    // Insert into audit logs
    const auditId = 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    await executeRun(
      `INSERT INTO audit_logs (id, user_id, action, resource, details)
       VALUES (?, ?, 'ENROLLMENT_REQUEST', 'courses', ?)`,
      [auditId, userId, JSON.stringify({ courseId, courseTitle: course.title, amount, phone, payment_method: selectedMethod })]
    );

    res.json({
      success: true,
      request_id: requestId,
      message: 'So\'rovingiz administratorga muvaffaqiyatli yuborildi! Administrator to\'lovni tasdiqlagach, kursingiz avtomatik ochiladi.'
    });
  } catch (err) {
    console.error('Enrollment request error:', err);
    res.status(500).json({ success: false, message: 'So\'rov yuborishda xatolik yuz berdi.' });
  }
});

// Toggle wishlist
router.post('/:id/wishlist', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const userId = req.user!.id;

    const enr = await queryOne(
      `SELECT id, is_wishlist FROM enrollments WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    if (enr) {
      const nextState = enr.is_wishlist ? 0 : 1;
      await executeRun(`UPDATE enrollments SET is_wishlist = ? WHERE id = ?`, [nextState, enr.id]);
      res.json({ success: true, is_wishlist: nextState === 1 });
    } else {
      const enrId = 'enr-' + Date.now();
      await executeRun(
        `INSERT INTO enrollments (id, user_id, course_id, is_wishlist, progress_percent) VALUES (?, ?, ?, 1, 0)`,
        [enrId, userId, courseId]
      );
      res.json({ success: true, is_wishlist: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Saqlashda xatolik.' });
  }
});

export default router;
