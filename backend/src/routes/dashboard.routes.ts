import { Router, Response } from 'express';
import { queryAll, queryOne } from '../db/index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Student Dashboard Summary
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // User profile with XP and Level
    const user = await queryOne(
      `SELECT id, first_name, last_name, email, avatar, preferred_language, learning_level, xp_points, level, daily_goal_minutes, created_at
       FROM users WHERE id = ?`,
      [userId]
    );

    // Streaks
    const streak = await queryOne(
      `SELECT current_streak, longest_streak, last_activity_date FROM learning_streaks WHERE user_id = ?`,
      [userId]
    );

    // Enrolled courses with active lesson info
    const enrolledCourses = await queryAll(
      `SELECT e.id as enrollment_id, e.progress_percent, e.is_completed, e.enrolled_at, e.last_accessed_lesson_id,
              c.id as course_id, c.title, c.slug, c.cover_image, c.language, c.level, c.total_lessons, c.duration_hours,
              t.name as teacher_name, t.avatar as teacher_avatar,
              l.title as active_lesson_title, l.id as active_lesson_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN lessons l ON (e.last_accessed_lesson_id = l.id)
       WHERE e.user_id = ? AND e.is_wishlist = 0
       ORDER BY e.enrolled_at DESC`,
      [userId]
    );

    // Continue learning card (first active unfinished course)
    const continueLearning = enrolledCourses.find((c: any) => !c.is_completed) || enrolledCourses[0] || null;

    // Achievements unlocked
    const allAchievements = await queryAll(`SELECT * FROM achievements ORDER BY xp_reward ASC`);
    const unlockedAchievements = await queryAll(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?`,
      [userId]
    );
    const unlockedMap = new Map(unlockedAchievements.map((u: any) => [u.achievement_id, u.unlocked_at]));

    const achievementsList = allAchievements.map((a: any) => ({
      ...a,
      is_unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null
    }));

    // Certificates
    const certificates = await queryAll(
      `SELECT id, course_title, issue_date, verification_url, is_revoked FROM certificates WHERE user_id = ?`,
      [userId]
    );

    // Quiz Performance
    const quizStats = await queryOne(
      `SELECT COUNT(*) as total_attempts,
              AVG(score_percent) as average_score,
              SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_quizzes
       FROM quiz_attempts WHERE user_id = ?`,
      [userId]
    );

    // Weekly activity mock/aggregated
    const weeklyActivity = [
      { day: 'Dush', minutes: 25, active: true },
      { day: 'Sesh', minutes: 35, active: true },
      { day: 'Chor', minutes: 20, active: true },
      { day: 'Pay', minutes: 40, active: true },
      { day: 'Juma', minutes: 30, active: true },
      { day: 'Shan', minutes: 15, active: false },
      { day: 'Yak', minutes: 0, active: false }
    ];

    // Recommended courses (courses the student is not yet enrolled in)
    const enrolledIds = enrolledCourses.map((c: any) => `'${c.course_id}'`).join(',') || "''";
    const recommendedCourses = await queryAll(
      `SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id NOT IN (${enrolledIds}) AND c.is_published = 1 AND c.deleted_at IS NULL
       ORDER BY c.enrollment_count DESC
       LIMIT 3`
    );

    res.json({
      success: true,
      user,
      streak: streak ? streak.current_streak : 1,
      longest_streak: streak ? streak.longest_streak : 1,
      continue_learning: continueLearning,
      enrolled_courses: enrolledCourses,
      achievements: achievementsList,
      certificates,
      quiz_performance: {
        total_attempts: quizStats?.total_attempts || 0,
        average_score: Math.round(quizStats?.average_score || 0),
        passed_quizzes: quizStats?.passed_quizzes || 0
      },
      weekly_activity: weeklyActivity,
      recommended_courses: recommendedCourses
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Dashboard ma\'lumotlarini yuklab bo\'lmadi.' });
  }
});

// Public Leaderboard with XP rankings
router.get('/leaderboard', async (_req, res: Response): Promise<void> => {
  try {
    const topUsers = await queryAll(
      `SELECT id, first_name, last_name, avatar, xp_points, level, preferred_language
       FROM users
       WHERE role = 'student' AND is_suspended = 0 AND is_active = 1
       ORDER BY xp_points DESC
       LIMIT 25`
    );

    // Rank numbers
    const ranked = topUsers.map((u: any, idx: number) => ({
      rank: idx + 1,
      ...u,
      // Hide full email or private info for privacy
      display_name: `${u.first_name} ${u.last_name ? u.last_name[0] + '.' : ''}`
    }));

    res.json({ success: true, leaderboard: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Reytingni yuklab bo\'lmadi.' });
  }
});

export default router;
