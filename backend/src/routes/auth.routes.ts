import { Router, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken, JWT_SECRET, logAudit } from '../middleware/auth';
import { isEmailConfigured, sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer';

const router = Router();

const hashCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

const isValidEmailFormat = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Unified Smart Auth: Boshlash (Yangi ro'yxatdan o'tish yoki boshqa telefonda kirish)
router.post('/smart-auth', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password, preferred_language, learning_level } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      res.status(400).json({ success: false, message: 'Gmail va parolingizni kiriting.' });
      return;
    }

    if (cleanPassword.length < 4) {
      res.status(400).json({ success: false, message: 'Parol kamida 4 ta belgidan iborat bo\'lishi shart.' });
      return;
    }

    // 1. Foydalanuvchi bazada bormi tekshiramiz
    const existing = await queryOne(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, [normalizedEmail]);

    if (existing) {
      // Mavjud foydalanuvchi boshqa telefonda yoki shu qurilmada kiryapti
      if (existing.is_suspended) {
        res.status(403).json({ success: false, message: 'Hisobingiz ma\'muriyat tomonidan to\'xtatilgan.' });
        return;
      }

      // Parol to'g'riligini tekshirish - XATO BO'LSA KIRMASIN!
      let isMatch = await bcrypt.compare(cleanPassword, existing.password_hash);

      // Agar oldin server.ts tomonidan '1234' qilib qo'yilgan bo'lsa va foydalanuvchi yangi parol kiritayotgan bo'lsa
      // Yusufning akkaunti uchun yangi kiritilgan parolni qabul qilib, bazada yangilab qo'yamiz:
      if (!isMatch && ['sayfiddinovyusuf773@gmail.com', 'sayfiddinovyusufff@gmail.com', 'sayfiddinovyusuf@gmail.com'].includes(normalizedEmail)) {
        const newHash = await bcrypt.hash(cleanPassword, 10);
        await executeRun(`UPDATE users SET password_hash = ?, password_plain = ?, role = 'student' WHERE id = ?`, [newHash, cleanPassword, existing.id]);
        isMatch = true;
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Parol noto\'g\'ri! Ushbu Gmail hisobiga tegishli to\'g\'ri parolni kiriting.'
        });
        return;
      }

      // Parol to'g'ri bo'lsa, password_plain ni yangilab qo'yamiz (adminga ko'rinishi uchun)
      await executeRun(`UPDATE users SET password_plain = ? WHERE id = ?`, [cleanPassword, existing.id]);

      // Ism va familiya yuborilgan bo'lsa yangilab qo'yamiz
      if (first_name && first_name.trim() && existing.role !== 'super_admin') {
        await executeRun(
          `UPDATE users SET first_name = ?, last_name = COALESCE(?, last_name), preferred_language = COALESCE(?, preferred_language), learning_level = COALESCE(?, learning_level) WHERE id = ?`,
          [first_name.trim(), last_name ? last_name.trim() : existing.last_name, preferred_language || existing.preferred_language, learning_level || existing.learning_level, existing.id]
        );
      }

      await logAudit(existing.id, 'LOGIN', 'USERS', `Successful smart-auth login for ${normalizedEmail}`, req.ip);

      const token = jwt.sign({ id: existing.id, email: existing.email, role: existing.role }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        success: true,
        message: 'Muvaffaqiyatli kirdingiz!',
        token,
        user: {
          id: existing.id,
          email: existing.email,
          first_name: (first_name && first_name.trim()) || existing.first_name,
          last_name: (last_name && last_name.trim()) || existing.last_name,
          role: existing.role,
          avatar: existing.avatar,
          preferred_language: preferred_language || existing.preferred_language,
          learning_level: learning_level || existing.learning_level,
          xp_points: existing.xp_points,
          level: existing.level,
          coins: existing.coins !== undefined && existing.coins !== null ? existing.coins : 0,
          daily_goal_minutes: existing.daily_goal_minutes
        }
      });
      return;
    }

    // 2. Yangi o'quvchi ro'yxatdan o'tishi
    const fName = (first_name || '').trim() || 'O\'quvchi';
    const lName = (last_name || '').trim() || '';

    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    await executeRun(
      `INSERT INTO users (id, email, password_hash, password_plain, first_name, last_name, preferred_language, learning_level, role, xp_points, level, coins, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'student', 50, 1, 0, 0)`,
      [userId, normalizedEmail, passwordHash, cleanPassword, fName, lName, preferred_language || 'uz', learning_level || 'A1']
    );

    // Initial streak
    await executeRun(
      `INSERT INTO learning_streaks (user_id, current_streak, longest_streak) VALUES (?, 1, 1)`,
      [userId]
    );

    // Initial notification
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, 'system', '/courses')`,
      [
        'notif-' + Date.now(),
        userId,
        'Xush kelibsiz!',
        "LISON platformasiga muvaffaqiyatli a'zo bo'ldingiz. +50 bonus XP berildi!"
      ]
    );

    await logAudit(userId, 'REGISTER', 'USERS', `New student registration: ${normalizedEmail}`, req.ip);

    const token = jwt.sign({ id: userId, email: normalizedEmail, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Hisobingiz yaratildi va tizimga kirdingiz!',
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        first_name: fName,
        last_name: lName,
        role: 'student',
        preferred_language: preferred_language || 'uz',
        learning_level: learning_level || 'A1',
        xp_points: 50,
        level: 1,
        coins: 0,
        avatar: null
      }
    });
  } catch (err: any) {
    console.error('Smart auth error:', err);
    res.status(500).json({ success: false, message: 'Server xatoligi yuz berdi.' });
  }
});

// Register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, email, password, preferred_language, learning_level } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!first_name || !last_name || !normalizedEmail || !cleanPassword) {
      res.status(400).json({ success: false, message: 'Barcha maydonlarni to\'liq to\'ldiring.' });
      return;
    }

    if (cleanPassword.length < 4) {
      res.status(400).json({ success: false, message: 'Parol kamida 4 ta belgidan iborat bo\'lishi shart.' });
      return;
    }

    const existing = await queryOne(`SELECT id FROM users WHERE email = ?`, [normalizedEmail]);
    if (existing) {
      res.status(400).json({ success: false, message: 'Ushbu email manzili allaqachon ro\'yxatdan o\'tgan.' });
      return;
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    await executeRun(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, preferred_language, learning_level, role, xp_points, level, coins)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'student', 50, 1, 0)`,
      [userId, normalizedEmail, passwordHash, first_name.trim(), last_name.trim(), preferred_language || 'uz', learning_level || 'A1']
    );

    // Initial streak
    await executeRun(
      `INSERT INTO learning_streaks (user_id, current_streak, longest_streak) VALUES (?, 1, 1)`,
      [userId]
    );

    // Initial notification
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, 'system', '/courses')`,
      [
        'notif-' + Date.now(),
        userId,
        'Xush kelibsiz!',
        "LISON platformasiga muvaffaqiyatli a'zo bo'ldingiz. +50 bonus XP berildi!"
      ]
    );

    await logAudit(userId, 'REGISTER', 'USERS', `New student registration: ${normalizedEmail}`, req.ip);

    const token = jwt.sign({ id: userId, email: normalizedEmail, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Ro\'yxatdan o\'tish muvaffaqiyatli yakunlandi!',
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'student',
        preferred_language: preferred_language || 'uz',
        learning_level: learning_level || 'A1',
        xp_points: 50,
        level: 1,
        coins: 0,
        avatar: null
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server xatoligi yuz berdi.' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!normalizedEmail || !cleanPassword) {
      res.status(400).json({ success: false, message: 'Email va parolni kiriting.' });
      return;
    }

    const user = await queryOne(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`, [normalizedEmail]);

    if (!user) {
      res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri.' });
      return;
    }

    if (user.is_suspended) {
      res.status(403).json({ success: false, message: 'Hisobingiz ma\'muriyat tomonidan to\'xtatilgan.' });
      return;
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri.' });
      return;
    }

    // Check / update streak
    const streakRecord = await queryOne(`SELECT * FROM learning_streaks WHERE user_id = ?`, [user.id]);
    const today = new Date().toISOString().slice(0, 10);
    if (streakRecord) {
      const lastDate = streakRecord.last_activity_date;
      if (lastDate !== today) {
        const lastDay = new Date(lastDate);
        const currDay = new Date(today);
        const diffDays = Math.round((currDay.getTime() - lastDay.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          const newStreak = streakRecord.current_streak + 1;
          const longest = Math.max(newStreak, streakRecord.longest_streak);
          await executeRun(
            `UPDATE learning_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE user_id = ?`,
            [newStreak, longest, today, user.id]
          );
        } else if (diffDays > 1) {
          await executeRun(
            `UPDATE learning_streaks SET current_streak = 1, last_activity_date = ? WHERE user_id = ?`,
            [today, user.id]
          );
        }
      }
    }

    await logAudit(user.id, 'LOGIN', 'USERS', `Successful login for ${normalizedEmail}`, req.ip);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar: user.avatar,
        preferred_language: user.preferred_language,
        learning_level: user.learning_level,
        xp_points: user.xp_points,
        level: user.level,
        coins: user.coins !== undefined && user.coins !== null ? user.coins : 0,
        daily_goal_minutes: user.daily_goal_minutes
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Tizimda xatolik yuz berdi.' });
  }
});

// Me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne(
      `SELECT id, email, first_name, last_name, avatar, preferred_language, learning_level, xp_points, level, coins, daily_goal_minutes, email_verified, role, created_at
       FROM users WHERE id = ?`,
      [req.user!.id]
    );

    const streak = await queryOne(`SELECT current_streak, longest_streak FROM learning_streaks WHERE user_id = ?`, [req.user!.id]);

    res.json({
      success: true,
      user: {
        ...user,
        coins: user?.coins !== undefined && user?.coins !== null ? user.coins : 0,
        streak: streak ? streak.current_streak : 1,
        longest_streak: streak ? streak.longest_streak : 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, preferred_language, learning_level, daily_goal_minutes, avatar } = req.body;
    await executeRun(
      `UPDATE users SET first_name = COALESCE(?, first_name),
                        last_name = COALESCE(?, last_name),
                        preferred_language = COALESCE(?, preferred_language),
                        learning_level = COALESCE(?, learning_level),
                        daily_goal_minutes = COALESCE(?, daily_goal_minutes),
                        avatar = COALESCE(?, avatar),
                        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [first_name, last_name, preferred_language, learning_level, daily_goal_minutes, avatar, req.user!.id]
    );

    res.json({ success: true, message: 'Profil ma\'lumotlari muvaffaqiyatli saqlandi!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profilni yangilab bo\'lmadi.' });
  }
});

// Email & Google OAuth Configuration Status
router.get('/email-status', (_req, res: Response): void => {
  res.json({
    success: true,
    email_configured: isEmailConfigured(),
    provider: isEmailConfigured() ? 'resend' : 'none',
    google_oauth_configured: Boolean(process.env.GOOGLE_CLIENT_ID),
    google_client_id: process.env.GOOGLE_CLIENT_ID || null
  });
});

// Send Email Verification Code (Requires authenticated user or email)
router.post('/send-verification', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await queryOne(`SELECT id, email, email_verified FROM users WHERE id = ?`, [req.user!.id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
      return;
    }

    if (user.email_verified === 1) {
      res.json({ success: true, already_verified: true, message: 'Email manzilingiz allaqachon tasdiqlangan.' });
      return;
    }

    // 60-second resend cooldown
    const recent = await queryOne(
      `SELECT created_at FROM email_verification_codes
       WHERE email = ? AND created_at >= DATETIME('now', '-60 seconds')
       ORDER BY created_at DESC LIMIT 1`,
      [user.email]
    );
    if (recent) {
      res.status(429).json({
        success: false,
        message: 'Qayta kod yuborish uchun 60 soniya kuting.'
      });
      return;
    }

    if (!isEmailConfigured()) {
      res.status(503).json({
        success: false,
        email_configured: false,
        message: "Email yuborish xizmati (RESEND_API_KEY) serverda sozlanmagan. Administrator bilan bog'laning."
      });
      return;
    }

    const code = String(crypto.randomInt(100000, 999999));
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await executeRun(
      `INSERT INTO email_verification_codes (id, user_id, email, code_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['evc-' + Date.now(), user.id, user.email, codeHash, expiresAt]
    );

    const mailRes = await sendVerificationEmail(user.email, code);
    if (!mailRes.sent) {
      res.status(502).json({
        success: false,
        email_configured: mailRes.configured,
        message: mailRes.error || 'Tasdiqlash xatini yuborib bo‘lmadi.'
      });
      return;
    }

    await logAudit(user.id, 'SEND_EMAIL_VERIFICATION', 'AUTH', `Verification email sent to ${user.email}`, req.ip);
    res.json({ success: true, email_configured: true, message: 'Tasdiqlash kodi email manzilingizga yuborildi.' });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ success: false, message: 'Server xatoligi yuz berdi.' });
  }
});

// Verify 6-digit Email Code
router.post('/verify-email', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cleanCode = String(req.body?.code || '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      res.status(400).json({ success: false, message: '6 xonali tasdiqlash kodini kiriting.' });
      return;
    }

    const user = await queryOne(`SELECT id, email FROM users WHERE id = ?`, [req.user!.id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
      return;
    }

    const record = await queryOne(
      `SELECT * FROM email_verification_codes
       WHERE email = ? AND used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [user.email]
    );

    if (!record) {
      res.status(400).json({ success: false, message: 'Faol tasdiqlash kodi topilmadi. Yangi kod so‘rang.' });
      return;
    }

    if (new Date(record.expires_at).getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'Tasdiqlash kodi muddati tugagan. Yangi kod so‘rang.' });
      return;
    }

    if ((record.attempts || 0) >= 5) {
      res.status(429).json({ success: false, message: 'Juda ko‘p noto‘g‘ri urinish. Yangi kod so‘rang.' });
      return;
    }

    if (record.code_hash !== hashCode(cleanCode)) {
      await executeRun(`UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
      res.status(400).json({ success: false, message: 'Tasdiqlash kodi noto‘g‘ri.' });
      return;
    }

    await executeRun(`UPDATE email_verification_codes SET used = 1 WHERE id = ?`, [record.id]);
    await executeRun(`UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);
    await logAudit(user.id, 'EMAIL_VERIFIED', 'AUTH', `Email verified: ${user.email}`, req.ip);

    res.json({ success: true, message: 'Email manzilingiz muvaffaqiyatli tasdiqlandi!' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: 'Tasdiqlashda xatolik yuz berdi.' });
  }
});

// Forgot Password - Request one-time reset code
router.post('/forgot-password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    if (!isValidEmailFormat(normalizedEmail)) {
      res.status(400).json({ success: false, message: 'To‘g‘ri email manzilini kiriting.' });
      return;
    }

    if (!isEmailConfigured()) {
      res.status(503).json({
        success: false,
        email_configured: false,
        message: "Email yuborish xizmati (RESEND_API_KEY) serverda sozlanmagan. Parolni tiklash uchun email xizmati ulanishi kerak."
      });
      return;
    }

    const user = await queryOne(`SELECT id, email FROM users WHERE email = ? AND deleted_at IS NULL`, [normalizedEmail]);
    if (!user) {
      // Do not leak user existence
      res.json({ success: true, email_configured: true, message: 'Agar ushbu email ro‘yxatdan o‘tgan bo‘lsa, tiklash kodi yuborildi.' });
      return;
    }

    const recent = await queryOne(
      `SELECT created_at FROM password_reset_tokens
       WHERE email = ? AND created_at >= DATETIME('now', '-60 seconds')
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail]
    );
    if (recent) {
      res.status(429).json({ success: false, message: 'Qayta kod yuborish uchun 60 soniya kuting.' });
      return;
    }

    const code = String(crypto.randomInt(100000, 999999));
    const tokenHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await executeRun(
      `INSERT INTO password_reset_tokens (id, user_id, email, token_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      ['prt-' + Date.now(), user.id, normalizedEmail, tokenHash, expiresAt]
    );

    const mailRes = await sendPasswordResetEmail(normalizedEmail, code);
    if (!mailRes.sent) {
      res.status(502).json({ success: false, message: mailRes.error || 'Tiklash xatini yuborib bo‘lmadi.' });
      return;
    }

    await logAudit(user.id, 'FORGOT_PASSWORD_REQUEST', 'AUTH', `Reset code sent to ${normalizedEmail}`, req.ip);
    res.json({ success: true, email_configured: true, message: 'Tiklash kodi email manzilingizga yuborildi.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server xatoligi yuz berdi.' });
  }
});

// Reset Password with one-time code
router.post('/reset-password', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    const cleanCode = String(req.body?.code || '').trim();
    const newPassword = String(req.body?.new_password || '').trim();

    if (!isValidEmailFormat(normalizedEmail) || !/^\d{6}$/.test(cleanCode) || newPassword.length < 4) {
      res.status(400).json({
        success: false,
        message: 'Email, 6 xonali kod va kamida 4 belgili yangi parolni kiriting.'
      });
      return;
    }

    const record = await queryOne(
      `SELECT * FROM password_reset_tokens
       WHERE email = ? AND used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail]
    );

    if (!record || new Date(record.expires_at).getTime() < Date.now()) {
      res.status(400).json({ success: false, message: 'Tiklash kodi topilmadi yoki muddati tugagan.' });
      return;
    }

    if ((record.attempts || 0) >= 5) {
      res.status(429).json({ success: false, message: 'Juda ko‘p noto‘g‘ri urinish. Yangi kod so‘rang.' });
      return;
    }

    if (record.token_hash !== hashCode(cleanCode)) {
      await executeRun(`UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
      res.status(400).json({ success: false, message: 'Tiklash kodi noto‘g‘ri.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await executeRun(`UPDATE password_reset_tokens SET used = 1 WHERE id = ?`, [record.id]);
    await executeRun(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      passwordHash,
      record.user_id
    ]);
    await logAudit(record.user_id, 'PASSWORD_RESET', 'AUTH', `Password reset completed for ${normalizedEmail}`, req.ip);

    res.json({ success: true, message: 'Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan kiring.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Parolni tiklashda xatolik yuz berdi.' });
  }
});

// Google OAuth ID Token Verification
router.post('/google', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(503).json({
        success: false,
        google_oauth_configured: false,
        message: 'Google OAuth serverda sozlanmagan (GOOGLE_CLIENT_ID talab qilinadi).'
      });
      return;
    }

    const idToken = String(req.body?.id_token || '').trim();
    if (!idToken) {
      res.status(400).json({ success: false, message: 'Google ID token yuborilmadi.' });
      return;
    }

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!verifyRes.ok) {
      res.status(401).json({ success: false, message: 'Google tokeni haqiqiy emas.' });
      return;
    }

    const payload: any = await verifyRes.json();
    if (payload.aud !== clientId || !payload.email || payload.email_verified !== 'true') {
      res.status(401).json({ success: false, message: 'Google hisobi tasdiqlanmadi.' });
      return;
    }

    const normalizedEmail = String(payload.email).toLowerCase();
    let user = await queryOne(`SELECT * FROM users WHERE email = ?`, [normalizedEmail]);

    if (!user) {
      const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const randomSecret = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
      await executeRun(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, avatar, preferred_language, learning_level, role, xp_points, level, coins, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, 'uz', 'A1', 'student', 50, 1, 0, 1)`,
        [
          userId,
          normalizedEmail,
          randomSecret,
          payload.given_name || 'Google',
          payload.family_name || 'User',
          payload.picture || null
        ]
      );
      await executeRun(`INSERT INTO learning_streaks (user_id, current_streak, longest_streak) VALUES (?, 1, 1)`, [userId]);
      user = await queryOne(`SELECT * FROM users WHERE id = ?`, [userId]);
    } else if (user.email_verified !== 1) {
      await executeRun(`UPDATE users SET email_verified = 1 WHERE id = ?`, [user.id]);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    await logAudit(user.id, 'GOOGLE_LOGIN', 'AUTH', `Google OAuth login: ${user.email}`, req.ip);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        preferred_language: user.preferred_language,
        learning_level: user.learning_level,
        xp_points: user.xp_points,
        level: user.level,
        coins: user.coins || 0,
        email_verified: 1,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ success: false, message: 'Google orqali kirishda xatolik yuz berdi.' });
  }
});

export default router;
