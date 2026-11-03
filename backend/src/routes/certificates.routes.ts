import { Router, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get student's earned certificates
router.get('/my', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const certs = await queryAll(
      `SELECT c.*, cr.cover_image, cr.level
       FROM certificates c
       JOIN courses cr ON c.course_id = cr.id
       WHERE c.user_id = ?
       ORDER BY c.issue_date DESC`,
      [userId]
    );

    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sertifikatlarni yuklab bo\'lmadi.' });
  }
});

// Public verification endpoint
router.get('/verify/:id', async (req, res: Response): Promise<void> => {
  try {
    const certId = req.params.id.trim();

    const certificate = await queryOne(
      `SELECT c.*, cr.description as course_description, cr.language as course_language, cr.level as course_level
       FROM certificates c
       JOIN courses cr ON c.course_id = cr.id
       WHERE UPPER(c.id) = UPPER(?)`,
      [certId]
    );

    if (!certificate) {
      res.status(404).json({
        success: false,
        is_valid: false,
        message: 'Bunday ID raqamli sertifikat tizimda topilmadi yoki soxta.'
      });
      return;
    }

    if (certificate.is_revoked) {
      res.json({
        success: true,
        is_valid: false,
        is_revoked: true,
        message: 'Ushbu sertifikat ma\'muriyat tomonidan bekor qilingan.',
        revocation_reason: certificate.revocation_reason,
        certificate
      });
      return;
    }

    res.json({
      success: true,
      is_valid: true,
      message: 'Sertifikat haqiqiy va davlat ta\'lim standartlariga muvofiq tasdiqlangan.',
      certificate
    });
  } catch (err) {
    console.error('Verify certificate error:', err);
    res.status(500).json({ success: false, message: 'Sertifikatni tekshirishda xatolik yuz berdi.' });
  }
});

// Server-side generate certificate upon verified completion
router.post('/generate', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { course_id } = req.body;

    if (!course_id) {
      res.status(400).json({ success: false, message: 'Kurs ID ko\'rsatilmadi.' });
      return;
    }

    const course = await queryOne(`SELECT id, title FROM courses WHERE id = ?`, [course_id]);
    if (!course) {
      res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
      return;
    }

    // Server-side check: Did student actually complete all lessons?
    const allLessons = await queryAll(`SELECT id FROM lessons WHERE course_id = ?`, [course_id]);
    const completedLessons = await queryAll(
      `SELECT id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1`,
      [userId, course_id]
    );

    if (allLessons.length === 0 || completedLessons.length < allLessons.length) {
      res.status(400).json({
        success: false,
        message: `Siz kursning barcha darslarini to'liq yakunlamagansiz (${completedLessons.length}/${allLessons.length} dars).`
      });
      return;
    }

    // Check if certificate already exists
    const existingCert = await queryOne(
      `SELECT * FROM certificates WHERE user_id = ? AND course_id = ?`,
      [userId, course_id]
    );

    if (existingCert) {
      res.json({
        success: true,
        message: 'Sertifikatingiz allaqachon mavjud!',
        certificate: existingCert
      });
      return;
    }

    const user = await queryOne(`SELECT first_name, last_name FROM users WHERE id = ?`, [userId]);
    const studentName = `${user.first_name} ${user.last_name}`;

    // Generate unique verifiable certificate ID: LISON-YYYY-RANDOM
    const certCode = `LISON-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const verificationUrl = `https://lison.uz/verify/${certCode}`;

    await executeRun(
      `INSERT INTO certificates (id, user_id, course_id, student_name, course_title, verification_url, issued_by)
       VALUES (?, ?, ?, ?, ?, ?, 'LISON & Oliy Ta''lim Innovatsiyalari Markazi')`,
      [certCode, userId, course_id, studentName, course.title, verificationUrl]
    );

    // Notification
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, 'Tabriklaymiz! Sertifikat tayyor', ?, 'certificate', ?)`,
      [
        'notif-' + Date.now(),
        userId,
        `"${course.title}" kursini tamomlaganingiz uchun rasmiy sertifikat berildi!`,
        `/certificates`
      ]
    );

    const createdCert = await queryOne(`SELECT * FROM certificates WHERE id = ?`, [certCode]);

    res.status(201).json({
      success: true,
      message: 'Tabriklaymiz! Rasmiy sertifikatingiz muvaffaqiyatli yaratildi.',
      certificate: createdCert
    });
  } catch (err) {
    console.error('Generate certificate error:', err);
    res.status(500).json({ success: false, message: 'Sertifikat yaratishda xatolik yuz berdi.' });
  }
});

export default router;
