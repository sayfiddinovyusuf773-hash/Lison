"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get single lesson details with navigation and user progress
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const lesson = await (0, index_1.queryOne)(`SELECT l.*, c.title as course_title, c.slug as course_slug
       FROM lessons l
       JOIN courses c ON l.course_id = c.id
       WHERE l.id = ?`, [lessonId]);
        if (!lesson) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        try {
            lesson.vocabulary = JSON.parse(lesson.vocabulary_json || '[]');
        }
        catch {
            lesson.vocabulary = [];
        }
        try {
            lesson.grammar = JSON.parse(lesson.grammar_json || '[]');
        }
        catch {
            lesson.grammar = [];
        }
        // Previous and Next lessons
        const siblings = await (0, index_1.queryAll)(`SELECT id, title, order_index FROM lessons WHERE course_id = ? ORDER BY order_index ASC`, [lesson.course_id]);
        const currentIndex = siblings.findIndex((s) => s.id === lesson.id);
        const prevLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;
        const nextLesson = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
        // Check if there is an associated quiz
        const quiz = await (0, index_1.queryOne)(`SELECT id, title, passing_score, time_limit_minutes FROM quizzes WHERE lesson_id = ? OR course_id = ? LIMIT 1`, [lesson.id, lesson.course_id]);
        // Get user progress
        let progress = await (0, index_1.queryOne)(`SELECT is_completed, playback_time_seconds, is_bookmarked, student_notes
       FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`, [userId, lesson.id]);
        if (!progress) {
            progress = {
                is_completed: 0,
                playback_time_seconds: 0,
                is_bookmarked: 0,
                student_notes: ''
            };
        }
        // Update last_accessed_lesson_id in enrollment
        await (0, index_1.executeRun)(`UPDATE enrollments SET last_accessed_lesson_id = ? WHERE user_id = ? AND course_id = ?`, [lesson.id, userId, lesson.course_id]);
        res.json({
            success: true,
            lesson: {
                ...lesson,
                prev_lesson: prevLesson,
                next_lesson: nextLesson,
                quiz: quiz || null,
                progress
            }
        });
    }
    catch (err) {
        console.error('Fetch lesson error:', err);
        res.status(500).json({ success: false, message: 'Dars ma\'lumotlarini yuklab bo\'lmadi.' });
    }
});
// Update progress (playback time, bookmark, notes)
router.post('/:id/progress', auth_1.authenticateToken, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const { playback_time_seconds, is_bookmarked, student_notes } = req.body;
        const lesson = await (0, index_1.queryOne)(`SELECT course_id FROM lessons WHERE id = ?`, [lessonId]);
        if (!lesson) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        const existing = await (0, index_1.queryOne)(`SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`, [userId, lessonId]);
        if (existing) {
            await (0, index_1.executeRun)(`UPDATE lesson_progress
         SET playback_time_seconds = COALESCE(?, playback_time_seconds),
             is_bookmarked = COALESCE(?, is_bookmarked),
             student_notes = COALESCE(?, student_notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`, [playback_time_seconds, is_bookmarked, student_notes, existing.id]);
        }
        else {
            const pId = 'lp-' + Date.now();
            await (0, index_1.executeRun)(`INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, playback_time_seconds, is_bookmarked, student_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [pId, userId, lessonId, lesson.course_id, playback_time_seconds || 0, is_bookmarked || 0, student_notes || '']);
        }
        res.json({ success: true, message: 'Progress muvaffaqiyatli saqlandi.' });
    }
    catch (err) {
        console.error('Save progress error:', err);
        res.status(500).json({ success: false, message: 'Progressni saqlab bo\'lmadi.' });
    }
});
// Submit homework / practical task for lesson and notify teacher
router.post('/:id/submit-homework', auth_1.authenticateToken, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const { homework_text, time_spent_seconds } = req.body;
        if (!homework_text || !homework_text.trim()) {
            res.status(400).json({ success: false, message: 'Iltimos, vazifa javobi yoki dars konspektini kiriting.' });
            return;
        }
        const lesson = await (0, index_1.queryOne)(`SELECT course_id, title FROM lessons WHERE id = ?`, [lessonId]);
        if (!lesson) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        const existing = await (0, index_1.queryOne)(`SELECT id, is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`, [userId, lessonId]);
        let newlyCompleted = false;
        if (existing) {
            if (!existing.is_completed)
                newlyCompleted = true;
            await (0, index_1.executeRun)(`UPDATE lesson_progress SET is_completed = 1, student_notes = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [homework_text.trim(), existing.id]);
        }
        else {
            newlyCompleted = true;
            const pId = 'lp-' + Date.now();
            await (0, index_1.executeRun)(`INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, is_completed, student_notes, completed_at)
         VALUES (?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)`, [pId, userId, lessonId, lesson.course_id, homework_text.trim()]);
        }
        if (newlyCompleted) {
            await (0, index_1.executeRun)(`UPDATE users SET xp_points = xp_points + 30 WHERE id = ?`, [userId]);
            const allLessons = await (0, index_1.queryAll)(`SELECT id FROM lessons WHERE course_id = ?`, [lesson.course_id]);
            const completedLessons = await (0, index_1.queryAll)(`SELECT id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1`, [userId, lesson.course_id]);
            const percent = Math.min(100, Math.round((completedLessons.length / Math.max(1, allLessons.length)) * 100));
            const isCourseCompleted = percent === 100 ? 1 : 0;
            await (0, index_1.executeRun)(`UPDATE enrollments SET progress_percent = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE user_id = ? AND course_id = ?`, [percent, isCourseCompleted, isCourseCompleted, userId, lesson.course_id]);
        }
        // Student info
        const student = await (0, index_1.queryOne)(`SELECT first_name, last_name, email FROM users WHERE id = ?`, [userId]);
        const studentName = student ? `${student.first_name} ${student.last_name}` : 'O\'quvchi';
        const studentEmail = student?.email || '';
        // Course and teacher info
        const courseInfo = await (0, index_1.queryOne)(`SELECT c.title as course_title, t.user_id as teacher_user_id
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id = ?`, [lesson.course_id]);
        const courseTitle = courseInfo?.course_title || 'Kurs';
        const teacherUserId = courseInfo?.teacher_user_id;
        const notifMsg = `${studentName} (${studentEmail}) "${courseTitle}" kursining "${lesson.title}" dars topshirig'ini topshirdi.\nVazifa matni: "${homework_text.trim().slice(0, 180)}..."\nSarflangan vaqt: ${time_spent_seconds || 0} soniya. Holat: Tekshiruvga yuborildi.`;
        // Notify Teacher
        if (teacherUserId) {
            await (0, index_1.executeRun)(`INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, 'course', ?)`, [
                'notif-tch-' + Date.now(),
                teacherUserId,
                '📋 Yangi dars topshirig\'i topshirildi!',
                notifMsg,
                `/dashboard?tab=submissions`
            ]);
        }
        // Notify Admins
        const admins = await (0, index_1.queryAll)(`SELECT id FROM users WHERE role IN ('admin', 'super_admin') AND id != ?`, [teacherUserId || '']);
        for (const adm of admins) {
            await (0, index_1.executeRun)(`INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, 'course', ?)`, [
                'notif-adm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                adm.id,
                `📋 [Admin] O'quvchi vazifa topshirdi: ${studentName}`,
                notifMsg,
                `/admin?tab=submissions`
            ]);
        }
        res.json({
            success: true,
            message: 'Vazifangiz ustozingizga muvaffaqiyatli yuborildi va dars yakunlandi!',
            xp_earned: 30
        });
    }
    catch (err) {
        console.error('Homework submission error:', err);
        res.status(500).json({ success: false, message: 'Vazifani yuborishda xatolik yuz berdi.' });
    }
});
// Mark lesson as completed (protected - requires passing quiz if quiz exists)
router.post('/:id/complete', auth_1.authenticateToken, async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const lesson = await (0, index_1.queryOne)(`SELECT course_id, title FROM lessons WHERE id = ?`, [lessonId]);
        if (!lesson) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        // If lesson has a quiz, do not allow arbitrary completion without passing the quiz
        const quiz = await (0, index_1.queryOne)(`SELECT id, title, passing_score FROM quizzes WHERE lesson_id = ?`, [lessonId]);
        if (quiz) {
            const passedAttempt = await (0, index_1.queryOne)(`SELECT id, score_percent FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? AND passed = 1`, [quiz.id, userId]);
            if (!passedAttempt) {
                res.status(400).json({
                    success: false,
                    requires_quiz: true,
                    quiz_id: quiz.id,
                    message: `Ushbu darsni tamomlash uchun "${quiz.title}" testini kamida ${quiz.passing_score}% natija bilan topshirishingiz shart. Natijangiz ustozingizga yuboriladi.`
                });
                return;
            }
        }
        const existing = await (0, index_1.queryOne)(`SELECT id, is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`, [userId, lessonId]);
        let newlyCompleted = false;
        if (existing) {
            if (!existing.is_completed) {
                newlyCompleted = true;
                await (0, index_1.executeRun)(`UPDATE lesson_progress SET is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [existing.id]);
            }
        }
        else {
            newlyCompleted = true;
            const pId = 'lp-' + Date.now();
            await (0, index_1.executeRun)(`INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, is_completed, completed_at)
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`, [pId, userId, lessonId, lesson.course_id]);
        }
        if (newlyCompleted) {
            // Award XP (+30 XP)
            await (0, index_1.executeRun)(`UPDATE users SET xp_points = xp_points + 30 WHERE id = ?`, [userId]);
            // Calculate total progress percentage for course
            const allLessons = await (0, index_1.queryAll)(`SELECT id FROM lessons WHERE course_id = ?`, [lesson.course_id]);
            const completedLessons = await (0, index_1.queryAll)(`SELECT id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1`, [userId, lesson.course_id]);
            const percent = Math.min(100, Math.round((completedLessons.length / Math.max(1, allLessons.length)) * 100));
            const isCourseCompleted = percent === 100 ? 1 : 0;
            await (0, index_1.executeRun)(`UPDATE enrollments SET progress_percent = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE user_id = ? AND course_id = ?`, [percent, isCourseCompleted, isCourseCompleted, userId, lesson.course_id]);
            // Check "FIRST_LESSON" achievement
            const hasFirstLesson = await (0, index_1.queryOne)(`SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = 'ach-1'`, [userId]);
            if (!hasFirstLesson) {
                await (0, index_1.executeRun)(`INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, 'ach-1')`, ['ua-' + Date.now(), userId]);
                await (0, index_1.executeRun)(`UPDATE users SET xp_points = xp_points + 50 WHERE id = ?`, [userId]);
            }
            // If course is completed, unlock COURSE_COMPLETED achievement
            if (isCourseCompleted) {
                const hasCourseComp = await (0, index_1.queryOne)(`SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = 'ach-6'`, [userId]);
                if (!hasCourseComp) {
                    await (0, index_1.executeRun)(`INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, 'ach-6')`, ['ua-' + Date.now(), userId]);
                    await (0, index_1.executeRun)(`UPDATE users SET xp_points = xp_points + 500 WHERE id = ?`, [userId]);
                }
            }
            res.json({
                success: true,
                message: 'Dars muvaffaqiyatli tamomlandi! +30 XP qo\'shildi.',
                xp_earned: 30,
                progress_percent: percent,
                is_course_completed: isCourseCompleted === 1
            });
            return;
        }
        res.json({ success: true, message: 'Dars avval tamomlangan.' });
    }
    catch (err) {
        console.error('Complete lesson error:', err);
        res.status(500).json({ success: false, message: 'Darsni yakunlashda xatolik.' });
    }
});
exports.default = router;
