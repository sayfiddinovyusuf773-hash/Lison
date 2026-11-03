import { Router, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Get quiz questions (without revealing is_correct to avoid cheating)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = req.params.id;

    const quiz = await queryOne(
      `SELECT q.*, c.title as course_title
       FROM quizzes q
       JOIN courses c ON q.course_id = c.id
       WHERE q.id = ?`,
      [quizId]
    );

    if (!quiz) {
      res.status(404).json({ success: false, message: 'Test topilmadi.' });
      return;
    }

    const questions = await queryAll(
      `SELECT id, quiz_id, question_type, question_text, audio_url, reading_passage, points, order_index
       FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC`,
      [quizId]
    );

    const questionIds = questions.map((q: any) => `'${q.id}'`).join(',');
    let options: any[] = [];
    if (questionIds.length > 0) {
      options = await queryAll(
        `SELECT id, question_id, option_text, match_pair, order_index
         FROM quiz_options WHERE question_id IN (${questionIds}) ORDER BY order_index ASC`
      );
    }

    const questionsWithOptions = questions.map((q: any) => {
      const qOpts = options.filter((o: any) => o.question_id === q.id);
      return {
        ...q,
        options: qOpts.map((o: any) => ({
          id: o.id,
          text: o.option_text,
          match_pair: o.match_pair
        }))
      };
    });

    res.json({
      success: true,
      quiz: {
        ...quiz,
        questions: questionsWithOptions
      }
    });
  } catch (err) {
    console.error('Fetch quiz error:', err);
    res.status(500).json({ success: false, message: 'Testni yuklab bo\'lmadi.' });
  }
});

// Submit quiz answers & calculate score on backend
router.post('/:id/submit', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizId = req.params.id;
    const userId = req.user!.id;
    const { answers, time_spent_seconds } = req.body; // { [question_id]: answer_value }

    const quiz = await queryOne(`SELECT * FROM quizzes WHERE id = ?`, [quizId]);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Test topilmadi.' });
      return;
    }

    const questions = await queryAll(
      `SELECT id, question_type, question_text, points, explanation FROM quiz_questions WHERE quiz_id = ?`,
      [quizId]
    );

    const questionIds = questions.map((q: any) => `'${q.id}'`).join(',');
    const allOptions = questionIds ? await queryAll(
      `SELECT id, question_id, option_text, is_correct, match_pair FROM quiz_options WHERE question_id IN (${questionIds})`
    ) : [];

    let totalPoints = 0;
    let earnedPoints = 0;
    const answerReviews: any[] = [];

    const attemptId = 'att-' + Date.now();

    for (const q of questions) {
      totalPoints += q.points;
      const userAns = answers ? answers[q.id] : null;
      let isCorrect = false;

      const qOpts = allOptions.filter((o: any) => o.question_id === q.id);

      if (q.question_type === 'multiple_choice' || q.question_type === 'true_false' || q.question_type === 'listening' || q.question_type === 'reading' || q.question_type === 'translation') {
        const correctOpt = qOpts.find((o: any) => o.is_correct === 1);
        if (correctOpt && (userAns === correctOpt.id || userAns === correctOpt.option_text)) {
          isCorrect = true;
        }
      } else if (q.question_type === 'fill_blank') {
        const correctOpt = qOpts.find((o: any) => o.is_correct === 1);
        if (correctOpt && userAns && correctOpt.option_text.trim().toLowerCase() === String(userAns).trim().toLowerCase()) {
          isCorrect = true;
        }
      } else if (q.question_type === 'sentence_order') {
        const correctOpt = qOpts.find((o: any) => o.is_correct === 1);
        if (correctOpt && userAns && correctOpt.option_text.trim().toLowerCase() === String(userAns).trim().toLowerCase()) {
          isCorrect = true;
        }
      } else if (q.question_type === 'word_matching') {
        // userAns is expected to be object { optId: matchPair } or array
        isCorrect = true;
        for (const o of qOpts) {
          if (userAns && userAns[o.id] !== o.match_pair) {
            isCorrect = false;
            break;
          }
        }
      }

      const qEarned = isCorrect ? q.points : 0;
      earnedPoints += qEarned;

      answerReviews.push({
        question_id: q.id,
        question_text: q.question_text,
        user_answer: userAns,
        is_correct: isCorrect,
        points: q.points,
        earned_points: qEarned,
        explanation: q.explanation,
        correct_answer: qOpts.filter((o: any) => o.is_correct === 1).map((o: any) => o.option_text).join(', ')
      });
    }

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= quiz.passing_score ? 1 : 0;

    // 1. Insert parent quiz_attempts record FIRST
    await executeRun(
      `INSERT INTO quiz_attempts (id, quiz_id, user_id, score_percent, total_points, earned_points, passed, time_spent_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [attemptId, quizId, userId, scorePercent, totalPoints, earnedPoints, passed, time_spent_seconds || 0]
    );

    // 2. Insert child quiz_answers records
    for (const r of answerReviews) {
      await executeRun(
        `INSERT INTO quiz_answers (id, attempt_id, question_id, user_answer, is_correct, earned_points)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['qa-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6), attemptId, r.question_id, JSON.stringify(r.user_answer), r.is_correct ? 1 : 0, r.earned_points]
      );
    }

    let xpEarned = 0;
    if (passed) {
      xpEarned = 50;
      await executeRun(`UPDATE users SET xp_points = xp_points + ? WHERE id = ?`, [xpEarned, userId]);

      // Check QUIZ_CHAMP if score >= 90%
      if (scorePercent >= 90) {
        const hasChamp = await queryOne(`SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = 'ach-3'`, [userId]);
        if (!hasChamp) {
          await executeRun(
            `INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, 'ach-3')`,
            ['ua-' + Date.now(), userId]
          );
          await executeRun(`UPDATE users SET xp_points = xp_points + 100 WHERE id = ?`, [userId]);
          xpEarned += 100;
        }
      }

      // Mark associated lesson as completed in lesson_progress
      const targetLessonId = quiz.lesson_id;
      if (targetLessonId) {
        const existingProgress = await queryOne(
          `SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?`,
          [userId, targetLessonId]
        );
        if (existingProgress) {
          await executeRun(
            `UPDATE lesson_progress SET is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [existingProgress.id]
          );
        } else {
          await executeRun(
            `INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, is_completed, completed_at)
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
            ['lp-' + Date.now(), userId, targetLessonId, quiz.course_id]
          );
        }

        // Recalculate enrollment progress
        const allCourseLessons = await queryAll(`SELECT id FROM lessons WHERE course_id = ?`, [quiz.course_id]);
        const completedLessons = await queryAll(
          `SELECT id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1`,
          [userId, quiz.course_id]
        );
        const progressPercent = allCourseLessons.length > 0
          ? Math.round((completedLessons.length / allCourseLessons.length) * 100)
          : 0;
        const isCourseFinished = progressPercent >= 100 ? 1 : 0;

        await executeRun(
          `UPDATE enrollments SET progress_percent = ?, is_completed = ?, completed_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE completed_at END
           WHERE user_id = ? AND course_id = ?`,
          [progressPercent, isCourseFinished, isCourseFinished, userId, quiz.course_id]
        );
      }
    }

    // Fetch student information
    const student = await queryOne(`SELECT first_name, last_name, email FROM users WHERE id = ?`, [userId]);
    const studentName = student ? `${student.first_name} ${student.last_name}` : 'O\'quvchi';
    const studentEmail = student?.email || '';

    // Fetch course & teacher information
    const courseInfo = await queryOne(
      `SELECT c.title as course_title, t.user_id as teacher_user_id, t.name as teacher_name
       FROM courses c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id = ?`,
      [quiz.course_id]
    );

    const courseTitle = courseInfo?.course_title || 'Kurs';
    const teacherUserId = courseInfo?.teacher_user_id;

    // Detailed notification message for the teacher
    const statusText = passed ? "✅ Muvaffaqiyatli topshirdi (O'tdi)" : "⚠️ O'tish balini to'play olmadi (Qayta topshirish kerak)";
    const notifMessage = `${studentName} (${studentEmail}) "${courseTitle}" kursining "${quiz.title}" testini topshirdi.\nNatija: ${scorePercent}% (${earnedPoints}/${totalPoints} ball).\nSarflangan vaqt: ${time_spent_seconds || 0} soniya.\nHolat: ${statusText}.`;

    // 1. Send notification to the Course Teacher
    if (teacherUserId) {
      await executeRun(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, 'quiz', ?)`,
        [
          'notif-tch-' + Date.now(),
          teacherUserId,
          '📋 Dars topshirig\'i topshirildi!',
          notifMessage,
          `/dashboard?tab=submissions`
        ]
      );
    }

    // 2. Also send notification to all Admins so they are fully updated
    const admins = await queryAll(`SELECT id FROM users WHERE role IN ('admin', 'super_admin') AND id != ?`, [teacherUserId || '']);
    for (const adm of admins) {
      await executeRun(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, 'quiz', ?)`,
        [
          'notif-adm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          adm.id,
          `📋 [Admin] O'quvchi dars topshirdi: ${studentName}`,
          notifMessage,
          `/admin?tab=submissions`
        ]
      );
    }

    // 3. Send feedback notification to the Student
    await executeRun(
      `INSERT INTO notifications (id, user_id, title, message, type, link_url)
       VALUES (?, ?, ?, ?, 'quiz', ?)`,
      [
        'notif-stu-' + Date.now(),
        userId,
        passed ? '🎉 Dars testi qabul qilindi!' : '📝 Test natijasi',
        passed
          ? `Siz "${quiz.title}" testidan ${scorePercent}% to'pladingiz va dars muvaffaqiyatli yakunlandi! Natijangiz ustozingizga yuborildi.`
          : `Siz "${quiz.title}" testidan ${scorePercent}% to'pladingiz. O'tish bali: ${quiz.passing_score}%. Iltimos, darsni qayta ko'rib topshiring.`,
        `/lessons/${quiz.lesson_id || ''}`
      ]
    );

    res.json({
      success: true,
      attempt_id: attemptId,
      score_percent: scorePercent,
      passing_score: quiz.passing_score,
      passed: passed === 1,
      total_points: totalPoints,
      earned_points: earnedPoints,
      xp_earned: xpEarned,
      reviews: answerReviews
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.status(500).json({ success: false, message: 'Test javoblarini tekshirishda xatolik yuz berdi.' });
  }
});

export default router;
