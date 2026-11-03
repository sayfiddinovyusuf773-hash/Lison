"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../db/index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Helper to convert any YouTube URL to official embed format
function formatYouTubeEmbed(url) {
    if (!url)
        return '';
    const trimmed = url.trim();
    if (trimmed.includes('/embed/'))
        return trimmed;
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return trimmed;
}
// 1. Get all public teachers
router.get('/', async (_req, res) => {
    try {
        const teachers = await (0, index_1.queryAll)(`SELECT t.*,
              (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id AND is_published = 1 AND deleted_at IS NULL) as courses_count
       FROM teachers t
       ORDER BY t.rating DESC`);
        res.json({ success: true, teachers });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'O\'qituvchilarni yuklab bo\'lmadi.' });
    }
});
// 2. Teacher: Get my assigned courses (for teachers & admins)
router.get('/my-courses', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let courses = [];
        if (userRole === 'admin' || userRole === 'super_admin') {
            courses = await (0, index_1.queryAll)(`SELECT c.*, t.name as teacher_name
         FROM courses c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         WHERE c.deleted_at IS NULL
         ORDER BY c.created_at DESC`);
        }
        else {
            // Find teacher profile for user
            const teacher = await (0, index_1.queryOne)(`SELECT id FROM teachers WHERE user_id = ?`, [userId]);
            const teacherId = teacher?.id || '';
            courses = await (0, index_1.queryAll)(`SELECT c.*, t.name as teacher_name
         FROM courses c
         LEFT JOIN teachers t ON c.teacher_id = t.id
         WHERE (c.teacher_id = ? OR c.teacher_id = ?) AND c.deleted_at IS NULL
         ORDER BY c.created_at DESC`, [teacherId, userId]);
        }
        res.json({ success: true, count: courses.length, courses });
    }
    catch (err) {
        console.error('Fetch my-courses error:', err);
        res.status(500).json({ success: false, message: 'Kurslarni yuklab bo\'lmadi.' });
    }
});
// 3. Teacher: Get lessons for a course (with modules)
router.get('/courses/:id/lessons', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const courseId = req.params.id;
        const lessons = await (0, index_1.queryAll)(`SELECT l.*, m.title as module_title
       FROM lessons l
       LEFT JOIN course_modules m ON l.module_id = m.id
       WHERE l.course_id = ?
       ORDER BY l.order_index ASC`, [courseId]);
        const modules = await (0, index_1.queryAll)(`SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index ASC`, [courseId]);
        res.json({ success: true, count: lessons.length, lessons, modules });
    }
    catch (err) {
        console.error('Fetch course lessons error:', err);
        res.status(500).json({ success: false, message: 'Darslarni yuklab bo\'lmadi.' });
    }
});
// 4. Teacher: Add a new video lesson to a course
router.post('/courses/:id/lessons', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;
        const { title, video_url, duration_minutes, content_text, module_id, vocabulary, grammar } = req.body;
        if (!title || !title.trim()) {
            res.status(400).json({ success: false, message: 'Dars sarlavhasini kiriting.' });
            return;
        }
        // Verify course exists
        const course = await (0, index_1.queryOne)(`SELECT id, title FROM courses WHERE id = ?`, [courseId]);
        if (!course) {
            res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
            return;
        }
        // Ensure module exists or create default module
        let targetModuleId = module_id;
        if (!targetModuleId) {
            const firstMod = await (0, index_1.queryOne)(`SELECT id FROM course_modules WHERE course_id = ? ORDER BY order_index ASC LIMIT 1`, [courseId]);
            if (firstMod) {
                targetModuleId = firstMod.id;
            }
            else {
                targetModuleId = 'mod-' + Date.now();
                await (0, index_1.executeRun)(`INSERT INTO course_modules (id, course_id, title, order_index) VALUES (?, ?, '1-Modul: Asosiy Darslar', 1)`, [targetModuleId, courseId]);
            }
        }
        // Determine order_index
        const maxOrder = await (0, index_1.queryOne)(`SELECT MAX(order_index) as max_idx FROM lessons WHERE course_id = ?`, [courseId]);
        const nextOrder = (maxOrder?.max_idx || 0) + 1;
        const lessonId = 'lsn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        const embedVideoUrl = formatYouTubeEmbed(video_url);
        await (0, index_1.executeRun)(`INSERT INTO lessons (id, module_id, course_id, title, order_index, video_url, duration_minutes, content_text, vocabulary_json, grammar_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            lessonId,
            targetModuleId,
            courseId,
            title.trim(),
            nextOrder,
            embedVideoUrl,
            duration_minutes ? parseInt(duration_minutes, 10) : 15,
            content_text || '',
            vocabulary ? JSON.stringify(vocabulary) : '[]',
            grammar ? JSON.stringify(grammar) : '[]'
        ]);
        // Update course total_lessons and duration_hours
        const countRow = await (0, index_1.queryOne)(`SELECT COUNT(*) as count, SUM(duration_minutes) as total_min FROM lessons WHERE course_id = ?`, [courseId]);
        const totalLessons = countRow?.count || 1;
        const durationHours = Math.round(((countRow?.total_min || 15) / 60) * 10) / 10;
        await (0, index_1.executeRun)(`UPDATE courses SET total_lessons = ?, duration_hours = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [totalLessons, durationHours, courseId]);
        await (0, auth_1.logAudit)(userId, 'CREATE_LESSON', 'LESSONS', `Added lesson "${title}" to course ${course.title} (Video: ${embedVideoUrl})`, req.ip);
        res.status(201).json({
            success: true,
            message: 'Video dars muvaffaqiyatli qo\'shildi!',
            lesson: {
                id: lessonId,
                module_id: targetModuleId,
                course_id: courseId,
                title: title.trim(),
                video_url: embedVideoUrl,
                duration_minutes: duration_minutes ? parseInt(duration_minutes, 10) : 15,
                content_text
            }
        });
    }
    catch (err) {
        console.error('Create lesson error:', err);
        res.status(500).json({ success: false, message: 'Darsni qo\'shishda xatolik yuz berdi.' });
    }
});
// 5. Teacher: Update an existing lesson
router.put('/lessons/:id', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const { title, video_url, duration_minutes, content_text, order_index } = req.body;
        const existing = await (0, index_1.queryOne)(`SELECT * FROM lessons WHERE id = ?`, [lessonId]);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        const embedVideoUrl = video_url !== undefined ? formatYouTubeEmbed(video_url) : existing.video_url;
        await (0, index_1.executeRun)(`UPDATE lessons
       SET title = COALESCE(?, title),
           video_url = ?,
           duration_minutes = COALESCE(?, duration_minutes),
           content_text = COALESCE(?, content_text),
           order_index = COALESCE(?, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            title ? title.trim() : null,
            embedVideoUrl,
            duration_minutes ? parseInt(duration_minutes, 10) : null,
            content_text !== undefined ? content_text : null,
            order_index !== undefined ? parseInt(order_index, 10) : null,
            lessonId
        ]);
        // Update course duration
        const countRow = await (0, index_1.queryOne)(`SELECT COUNT(*) as count, SUM(duration_minutes) as total_min FROM lessons WHERE course_id = ?`, [existing.course_id]);
        const totalLessons = countRow?.count || 1;
        const durationHours = Math.round(((countRow?.total_min || 15) / 60) * 10) / 10;
        await (0, index_1.executeRun)(`UPDATE courses SET total_lessons = ?, duration_hours = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [totalLessons, durationHours, existing.course_id]);
        await (0, auth_1.logAudit)(userId, 'UPDATE_LESSON', 'LESSONS', `Updated lesson ${lessonId}`, req.ip);
        res.json({ success: true, message: 'Dars ma\'lumotlari muvaffaqiyatli yangilandi!' });
    }
    catch (err) {
        console.error('Update lesson error:', err);
        res.status(500).json({ success: false, message: 'Darsni yangilashda xatolik yuz berdi.' });
    }
});
// 6. Teacher: Delete a lesson
router.delete('/lessons/:id', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const lessonId = req.params.id;
        const userId = req.user.id;
        const lesson = await (0, index_1.queryOne)(`SELECT course_id, title FROM lessons WHERE id = ?`, [lessonId]);
        if (!lesson) {
            res.status(404).json({ success: false, message: 'Dars topilmadi.' });
            return;
        }
        await (0, index_1.executeRun)(`DELETE FROM lessons WHERE id = ?`, [lessonId]);
        // Recalculate course stats
        const countRow = await (0, index_1.queryOne)(`SELECT COUNT(*) as count, SUM(duration_minutes) as total_min FROM lessons WHERE course_id = ?`, [lesson.course_id]);
        const totalLessons = countRow?.count || 0;
        const durationHours = Math.round(((countRow?.total_min || 0) / 60) * 10) / 10;
        await (0, index_1.executeRun)(`UPDATE courses SET total_lessons = ?, duration_hours = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [totalLessons, durationHours, lesson.course_id]);
        await (0, auth_1.logAudit)(userId, 'DELETE_LESSON', 'LESSONS', `Deleted lesson "${lesson.title}" from course ${lesson.course_id}`, req.ip);
        res.json({ success: true, message: 'Dars muvaffaqiyatli o\'chirildi.' });
    }
    catch (err) {
        console.error('Delete lesson error:', err);
        res.status(500).json({ success: false, message: 'Darsni o\'chirishda xatolik yuz berdi.' });
    }
});
// 7. Teacher: Get all student submissions & test performance for their courses
router.get('/submissions', auth_1.authenticateToken, (0, auth_1.requireRoles)(['teacher', 'admin', 'super_admin']), async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let filterClause = '';
        const params = [];
        if (userRole !== 'admin' && userRole !== 'super_admin') {
            const teacher = await (0, index_1.queryOne)(`SELECT id FROM teachers WHERE user_id = ?`, [userId]);
            const teacherId = teacher?.id || '';
            filterClause = `WHERE (c.teacher_id = ? OR c.teacher_id = ?)`;
            params.push(teacherId, userId);
        }
        // 1. Quiz / Test attempts
        const attempts = await (0, index_1.queryAll)(`SELECT qa.id, qa.score_percent, qa.total_points, qa.earned_points, qa.passed, qa.time_spent_seconds, qa.attempted_at,
              u.id as user_id, u.first_name, u.last_name, u.email, u.avatar,
              q.title as quiz_title, q.passing_score,
              c.id as course_id, c.title as course_title,
              'quiz' as submission_type
       FROM quiz_attempts qa
       JOIN users u ON qa.user_id = u.id
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN courses c ON q.course_id = c.id
       ${filterClause}
       ORDER BY qa.attempted_at DESC LIMIT 100`, params);
        // 2. Practical homework submissions from lesson_progress
        const homeworks = await (0, index_1.queryAll)(`SELECT lp.id, lp.completed_at as attempted_at, lp.student_notes as homework_text,
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
       ${filterClause ? filterClause.replace('WHERE', 'WHERE lp.student_notes IS NOT NULL AND lp.student_notes != "" AND') : 'WHERE lp.student_notes IS NOT NULL AND lp.student_notes != ""'}
       ORDER BY lp.completed_at DESC LIMIT 50`, params);
        res.json({
            success: true,
            count: attempts.length + homeworks.length,
            attempts,
            homeworks
        });
    }
    catch (err) {
        console.error('Fetch submissions error:', err);
        res.status(500).json({ success: false, message: 'Topshiriqlar ro\'yxatini yuklab bo\'lmadi.' });
    }
});
// 8. Public single teacher details with their courses
router.get('/:id', async (req, res) => {
    try {
        const teacherId = req.params.id;
        const teacher = await (0, index_1.queryOne)(`SELECT * FROM teachers WHERE id = ?`, [teacherId]);
        if (!teacher) {
            res.status(404).json({ success: false, message: 'O\'qituvchi topilmadi.' });
            return;
        }
        const courses = await (0, index_1.queryAll)(`SELECT id, title, slug, language, level, cover_image, enrollment_count, rating, duration_hours, total_lessons
       FROM courses WHERE teacher_id = ? AND is_published = 1 AND deleted_at IS NULL`, [teacherId]);
        res.json({ success: true, teacher: { ...teacher, courses } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'O\'qituvchi ma\'lumotlarini yuklab bo\'lmadi.' });
    }
});
exports.default = router;
