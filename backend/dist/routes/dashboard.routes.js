"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Student Dashboard Summary
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // User profile with XP and Level
        const user = await (0, index_1.queryOne)(`SELECT id, first_name, last_name, email, avatar, preferred_language, learning_level, xp_points, level, daily_goal_minutes, created_at
       FROM users WHERE id = ?`, [userId]);
        // Streaks
        const streak = await (0, index_1.queryOne)(`SELECT current_streak, longest_streak, last_activity_date FROM learning_streaks WHERE user_id = ?`, [userId]);
        // Enrolled courses with active lesson info
        const enrolledCourses = await (0, index_1.queryAll)(`SELECT e.id as enrollment_id, e.progress_percent, e.is_completed, e.enrolled_at, e.last_accessed_lesson_id,
              c.id as course_id, c.title, c.slug, c.cover_image, c.language, c.level, c.total_lessons, c.duration_hours,
              t.name as teacher_name, t.avatar as teacher_avatar,
              l.title as active_lesson_title, l.id as active_lesson_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN lessons l ON (e.last_accessed_lesson_id = l.id)
       WHERE e.user_id = ? AND e.is_wishlist = 0
       ORDER BY e.enrolled_at DESC`, [userId]);
        // Continue learning card (first active unfinished course)
        const continueLearning = enrolledCourses.find((c) => !c.is_completed) || enrolledCourses[0] || null;
        // Achievements unlocked
        const allAchievements = await (0, index_1.queryAll)(`SELECT * FROM achievements ORDER BY xp_reward ASC`);
        const unlockedAchievements = await (0, index_1.queryAll)(`SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = ?`, [userId]);
        const unlockedMap = new Map(unlockedAchievements.map((u) => [u.achievement_id, u.unlocked_at]));
        const achievementsList = allAchievements.map((a) => ({
            ...a,
            is_unlocked: unlockedMap.has(a.id),
            unlocked_at: unlockedMap.get(a.id) || null
        }));
        // Certificates
        const certificates = await (0, index_1.queryAll)(`SELECT id, course_title, issue_date, verification_url, is_revoked FROM certificates WHERE user_id = ?`, [userId]);
        // Quiz Performance
        const quizStats = await (0, index_1.queryOne)(`SELECT COUNT(*) as total_attempts,
              AVG(score_percent) as average_score,
              SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_quizzes
       FROM quiz_attempts WHERE user_id = ?`, [userId]);
        // Real weekly activity aggregated from lesson_progress, quiz_attempts, and speaking_sessions
        const dayLabels = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
        const activityMap = new Map();
        const lessonRows = await (0, index_1.queryAll)(`SELECT DATE(updated_at) as d, COUNT(*) as cnt
       FROM lesson_progress
       WHERE user_id = ? AND updated_at >= DATE('now', '-6 days')
       GROUP BY DATE(updated_at)`, [userId]);
        for (const r of lessonRows) {
            if (r.d)
                activityMap.set(r.d, (activityMap.get(r.d) || 0) + Number(r.cnt || 0) * 15);
        }
        const quizRows = await (0, index_1.queryAll)(`SELECT DATE(attempted_at) as d, COUNT(*) as cnt
       FROM quiz_attempts
       WHERE user_id = ? AND attempted_at >= DATE('now', '-6 days')
       GROUP BY DATE(attempted_at)`, [userId]);
        for (const r of quizRows) {
            if (r.d)
                activityMap.set(r.d, (activityMap.get(r.d) || 0) + Number(r.cnt || 0) * 10);
        }
        const speakingRows = await (0, index_1.queryAll)(`SELECT DATE(created_at) as d, COUNT(*) as cnt
       FROM speaking_sessions
       WHERE user_id = ? AND created_at >= DATE('now', '-6 days')
       GROUP BY DATE(created_at)`, [userId]);
        for (const r of speakingRows) {
            if (r.d)
                activityMap.set(r.d, (activityMap.get(r.d) || 0) + Number(r.cnt || 0) * 8);
        }
        const weeklyActivity = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setUTCDate(d.getUTCDate() - i);
            const isoDate = d.toISOString().slice(0, 10);
            const minutes = activityMap.get(isoDate) || 0;
            weeklyActivity.push({
                day: dayLabels[d.getUTCDay()],
                date: isoDate,
                minutes,
                active: minutes > 0
            });
        }
        // Recommended courses (courses the student is not yet enrolled in)
        const enrolledIds = enrolledCourses.map((c) => `'${c.course_id}'`).join(',') || "''";
        const recommendedCourses = await (0, index_1.queryAll)(`SELECT c.*, t.name as teacher_name, t.avatar as teacher_avatar
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id NOT IN (${enrolledIds}) AND c.is_published = 1 AND c.deleted_at IS NULL
       ORDER BY c.enrollment_count DESC
       LIMIT 3`);
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
    }
    catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ success: false, message: 'Dashboard ma\'lumotlarini yuklab bo\'lmadi.' });
    }
});
// Public Leaderboard with XP rankings and platform stats
router.get('/leaderboard', async (_req, res) => {
    try {
        const totalStudents = await (0, index_1.queryOne)(`SELECT COUNT(*) as count FROM users WHERE role = 'student' AND deleted_at IS NULL`);
        const totalCourses = await (0, index_1.queryOne)(`SELECT COUNT(*) as count FROM courses WHERE is_published = 1 AND deleted_at IS NULL`);
        const completedLessons = await (0, index_1.queryOne)(`SELECT COUNT(*) as count FROM lesson_progress WHERE is_completed = 1`);
        const totalCertificates = await (0, index_1.queryOne)(`SELECT COUNT(*) as count FROM certificates WHERE is_revoked = 0`);
        const topUsers = await (0, index_1.queryAll)(`SELECT id, first_name, last_name, avatar, xp_points, level, preferred_language
       FROM users
       WHERE role = 'student' AND is_suspended = 0 AND is_active = 1
       ORDER BY xp_points DESC
       LIMIT 25`);
        // Rank numbers
        const ranked = topUsers.map((u, idx) => ({
            rank: idx + 1,
            ...u,
            // Hide full email or private info for privacy
            display_name: `${u.first_name} ${u.last_name ? u.last_name[0] + '.' : ''}`
        }));
        res.json({
            success: true,
            stats: {
                total_students: totalStudents?.count || 0,
                total_courses: totalCourses?.count || 0,
                completed_lessons: completedLessons?.count || 0,
                total_certificates: totalCertificates?.count || 0
            },
            leaderboard: ranked
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Reytingni yuklab bo\'lmadi.' });
    }
});
exports.default = router;
