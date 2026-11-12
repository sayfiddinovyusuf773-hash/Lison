import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken, JWT_SECRET, logAudit } from '../middleware/auth';

const router = Router();

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
      const isMatch = await bcrypt.compare(cleanPassword, existing.password_hash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: 'Parol noto\'g\'ri! Ushbu Gmail hisobiga tegishli to\'g\'ri parolni kiriting.'
        });
        return;
      }

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
      `INSERT INTO users (id, email, password_hash, first_name, last_name, preferred_language, learning_level, role, xp_points, level, coins)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'student', 50, 1, 0)`,
      [userId, normalizedEmail, passwordHash, fName, lName, preferred_language || 'uz', learning_level || 'A1']
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
      `SELECT id, email, first_name, last_name, avatar, preferred_language, learning_level, xp_points, level, coins, daily_goal_minutes, role, created_at
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

export default router;
