import React, { useEffect, useState, useRef } from 'react';
import { Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Bookmark,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  FileText,
  BookOpen,
  Sparkles,
  Download,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Edit3,
  Send,
  X,
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { formatYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';

interface LessonPlayerPageProps {
  lessonId: string;
  navigate: (path: string) => void;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({ lessonId, navigate }) => {
  const { user, updateCoins } = useAuth();
  const { t } = useLanguage();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'vocabulary' | 'grammar' | 'transcript' | 'notes'>('content');

  // Video controls
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [savingNotes, setSavingNotes] = useState<boolean>(false);

  // Homework submission modal state
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState<boolean>(false);
  const [homeworkText, setHomeworkText] = useState<string>('');
  const [homeworkSubmitting, setHomeworkSubmitting] = useState<boolean>(false);
  const [homeworkError, setHomeworkError] = useState<string | null>(null);
  const [homeworkSuccess, setHomeworkSuccess] = useState<string | null>(null);

  // Interactive In-Lesson Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: any }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizNotice, setQuizNotice] = useState<string | null>(null);
  const [quizChecking, setQuizChecking] = useState<boolean>(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
        const res = await fetch(`/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.lesson) {
          setLesson(data.lesson);
          setIsBookmarked(data.lesson.progress?.is_bookmarked === 1);
          setNotes(data.lesson.progress?.student_notes || '');
          setIsCompleted(data.lesson.progress?.is_completed === 1);
        }
      } catch (err) {
        console.error('Fetch lesson error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // Periodic automatic progress sync (e.g. saves notes and progress)
  const saveProgress = async (newBookmarkState?: boolean, updatedNotes?: string) => {
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          playback_time_seconds: 300,
          is_bookmarked: newBookmarkState !== undefined ? (newBookmarkState ? 1 : 0) : isBookmarked ? 1 : 0,
          student_notes: updatedNotes !== undefined ? updatedNotes : notes
        })
      });
    } catch (err) {
      console.error('Progress sync failed:', err);
    }
  };

  const handleBookmarkToggle = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    saveProgress(nextState);
  };

  const handleNotesSave = async () => {
    setSavingNotes(true);
    await saveProgress(undefined, notes);
    setSavingNotes(false);
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkText.trim()) {
      setHomeworkError('Iltimos, vazifa matnini yoki topshiriq javobini kiriting.');
      return;
    }
    setHomeworkSubmitting(true);
    setHomeworkError(null);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/lessons/${lessonId}/submit-homework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          homework_text: homeworkText,
          time_spent_seconds: 300
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        setHomeworkSuccess(data.message || 'Vazifangiz ustozingizga muvaffaqiyatli yuborildi!');
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setIsHomeworkModalOpen(false);
          setHomeworkSuccess(null);
        }, 2200);
      } else {
        setHomeworkError(data.message || 'Xatolik yuz berdi.');
      }
    } catch (err: any) {
      setHomeworkError(err.message || 'Topshiriqni yuborib bo\'lmadi.');
    } finally {
      setHomeworkSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        if (typeof data.coins === 'number') {
          updateCoins(data.coins);
        }
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIdOrText: any) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdOrText
    }));
    setQuizError(null);
    setQuizNotice(null);
  };

  const handleSubmitQuiz = async () => {
    if (!lesson || !lesson.quiz || !lesson.quiz.questions || lesson.quiz.questions.length === 0) {
      await handleMarkComplete();
      return;
    }

    const questions = lesson.quiz.questions;
    // Check if user answered all questions
    const unanswered = questions.filter((q) => selectedAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      setQuizError(`Iltimos, barcha savollarga javob bering! (${questions.length - unanswered.length}/${questions.length} ta yechildi)`);
      return;
    }

    setQuizChecking(true);
    setQuizError(null);

    // Verify answers locally
    let allCorrect = true;
    for (const q of questions) {
      const selected = selectedAnswers[q.id];
      const correctOpt = q.options?.find((o: any) => o.is_correct === 1 || o.is_correct === true);
      if (correctOpt) {
        if (selected !== correctOpt.id && selected !== correctOpt.text) {
          allCorrect = false;
        }
      }
    }

    setQuizSubmitted(true);

    if (!allCorrect) {
      setQuizPassed(false);
      setQuizError("❌ Ba'zi savollarga noto'g'ri javob berildi! Qaytadan urinib ko'ring. Barcha savollarni 100% to'g'ri topmaguningizcha keyingi dars ochilmaydi.");
      setQuizChecking(false);
      return;
    }

    // All correct! Pass quiz & complete lesson
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        setQuizPassed(true);
        if (typeof data.coins === 'number') {
          updateCoins(data.coins);
        }
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setQuizError(data.message || "Xatolik yuz berdi.");
      }
    } catch (err: any) {
      setQuizError("Server bilan aloqada xatolik yuz berdi.");
    } finally {
      setQuizChecking(false);
    }
  };

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-xl font-bold">Dars topilmadi</h2>
        <button onClick={() => navigate('/courses')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold">
          Kurslarga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/courses/${lesson.course_id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lesson.course_title || 'Kurs Mundarijasi'}</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-xs">
              {lesson.title}
            </span>
          </div>

          {/* Action buttons: Bookmark + Quiz / Submit to Teacher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleBookmarkToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? 'Saqlangan' : 'Saqlash'}</span>
            </button>

            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Topshirilgan & Qabul qilingan</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {lesson.quiz && (
                  <button
                    onClick={() => navigate(`/quizzes/${lesson.quiz!.id}`)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Dars Testini Topshirish ({lesson.quiz.passing_score}% o'tish) ➔</span>
                  </button>
                )}
                <button
                  onClick={() => setIsHomeworkModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-[#635BFF] to-[#8B7CFF] hover:from-[#544BFF] hover:to-[#7A6BFF] text-white shadow-md shadow-indigo-500/20 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Vazifani Ustozga Topshirish</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Player Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="relative aspect-video w-full bg-black">
            {lesson.video_url ? (
              <iframe
                src={formatYouTubeEmbedUrl(lesson.video_url)}
                title={lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Video dars tez orada yuklanadi
              </div>
            )}
          </div>

          {/* Player controls toolbar */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary-500" />
                {lesson.duration_minutes} daqiqa
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>Tezlik:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2 py-0.5 rounded-md ${
                      playbackSpeed === s
                        ? 'bg-primary-600 text-white font-bold'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {lesson.video_url && (
                <>
                  <span>•</span>
                  <a
                    href={getYouTubeWatchUrl(lesson.video_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-600/25 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>YouTubeda Ko'rish</span>
                  </a>
                </>
              )}
            </div>

            {/* Next / Previous Navigation */}
            <div className="flex items-center gap-2">
              {lesson.prev_lesson && (
                <button
                  onClick={() => navigate(`/lessons/${lesson.prev_lesson!.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Oldingi dars</span>
                </button>
              )}

              {lesson.quiz && (
                <button
                  onClick={() => navigate(`/quizzes/${lesson.quiz!.id}`)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-1.5 shadow-md hover:from-emerald-500 hover:to-teal-500"
                >
                  <Award className="w-4 h-4" />
                  <span>Dars Testi (Take Quiz)</span>
                </button>
              )}

              {lesson.next_lesson && (
                <button
                  onClick={() => {
                    if (!isCompleted) {
                      document.getElementById('lesson-quiz-section')?.scrollIntoView({ behavior: 'smooth' });
                      setQuizNotice("🔒 Keyingi darsga o'tish uchun quyidagi savollarga to'g'ri javob berishingiz shart!");
                      return;
                    }
                    navigate(`/lessons/${lesson.next_lesson!.id}`);
                  }}
                  className={`px-4 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md cursor-pointer'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-80'
                  }`}
                  title={!isCompleted ? "Keyingi dars qulflangan: savollarni to'g'ri toping!" : "Keyingi darsga o'tish"}
                >
                  {!isCompleted && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                  <span>Keyingi dars</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive In-Lesson Quiz (Savol-Javob va Darsni Ochish) */}
        {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
          <div id="lesson-quiz-section" className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 scroll-mt-20">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Award className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Dars Savol-Javoblari</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-800">
                        +10 🪙 Coin
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Keyingi darsga o'tish uchun quyidagi savollarga to'g'ri javob bering.
                    </p>
                  </div>
                </div>
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Muvaffaqiyatli topshirildi (+10 Coin)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keyingi dars qulflangan</span>
                </div>
              )}
            </div>

            {quizNotice && (
              <div className="flex items-center gap-2.5 p-3.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{quizNotice}</span>
              </div>
            )}

            {quizError && (
              <div className="flex items-center gap-2.5 p-3.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 rounded-2xl border border-red-200 dark:border-red-900/60">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{quizError}</span>
              </div>
            )}

            {isCompleted && (
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      Dars muvaffaqiyatli tamomlandi!
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Barcha savollarga to'g'ri javob berdingiz, hisobingizga +10 🪙 Coin qo'shildi va keyingi dars ochildi.
                    </p>
                  </div>
                </div>
                {lesson.next_lesson && (
                  <button
                    onClick={() => navigate(`/lessons/${lesson.next_lesson!.id}`)}
                    className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Keyingi dars</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Questions Form */}
            <div className="space-y-6">
              {lesson.quiz.questions.map((q, qIndex) => {
                const userSelected = selectedAnswers[q.id];
                return (
                  <div key={q.id} className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black shrink-0">
                          {qIndex + 1}
                        </span>
                        <span>{q.question_text}</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-gray-400 shrink-0">
                        {q.points || 10} ball
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options?.map((opt: any, optIdx: number) => {
                        const optKey = opt.id || opt.text;
                        const isSelected = userSelected === optKey || userSelected === opt.text;
                        const isCorrect = opt.is_correct === 1 || opt.is_correct === true;

                        let optionStyle = 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400';
                        if (isSelected && !quizSubmitted) {
                          optionStyle = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-500 shadow-sm font-bold';
                        } else if (quizSubmitted) {
                          if (isCorrect) {
                            optionStyle = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-500 font-bold shadow-sm';
                          } else if (isSelected && !isCorrect) {
                            optionStyle = 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-500 font-semibold';
                          }
                        }

                        return (
                          <button
                            key={opt.id || optIdx}
                            type="button"
                            onClick={() => handleAnswerSelect(q.id, optKey)}
                            disabled={isCompleted}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer ${optionStyle}`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt.text}</span>
                            </span>
                            {quizSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            {quizSubmitted && isSelected && !isCorrect && (
                              <X className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                        💡 <strong>Izoh:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Button */}
            {!isCompleted && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Barcha savollarni to'g'ri toping va darsni muvaffaqiyatli tamomlang.
                </p>
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={quizChecking}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {quizChecking ? 'Tekshirilmoqda...' : 'Javoblarni Tekshirish va Darsni Yakunlash (+10 🪙 Coin)'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabbed Learning Content */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          {/* Tabs navigation */}
          <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            {[
              { id: 'content', label: 'Dars Matni', icon: FileText },
              { id: 'vocabulary', label: `Lug'at (${lesson.vocabulary?.length || 0})`, icon: BookOpen },
              { id: 'grammar', label: 'Grammatika Qoidalari', icon: Layers },
              { id: 'transcript', label: 'Transkript & Subtitr', icon: Sparkles },
              { id: 'notes', label: 'Mening Eslatmalarim', icon: Edit3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Text Explanation */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {lesson.content_text || 'Ushbu darsning matnli izohi mavjud emas.'}
              </p>

              {lesson.materials_url && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">Qo'shimcha Darslik Materiali</h4>
                    <p className="text-[11px] text-gray-500">PDF konspekt va mashqlar to'plami</p>
                  </div>
                  <button
                    onClick={() => alert("Dars materiali yuklanmoqda...")}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Yuklab Olish</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Vocabulary Table */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Darsda O'rganilgan Yangi So'zlar
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Talaffuzni eshitish uchun dinamik belgisini bosing
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">So'z</th>
                      <th className="py-3 px-4">Talaffuz</th>
                      <th className="py-3 px-4">Tarjima</th>
                      <th className="py-3 px-4">Misol</th>
                      <th className="py-3 px-4 text-center">Ovoz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {lesson.vocabulary && lesson.vocabulary.length > 0 ? (
                      lesson.vocabulary.map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="py-3.5 px-4 font-bold text-primary-600 dark:text-primary-400 text-sm">
                            {v.word}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-500">{v.pronunciation}</td>
                          <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{v.translation}</td>
                          <td className="py-3.5 px-4 italic text-gray-500 dark:text-gray-400">"{v.example}"</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => playPronunciation(v.word)}
                              className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-lg transition"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">
                          Ushbu dars uchun lug'at biriktirilmagan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Grammar Rules */}
          {activeTab === 'grammar' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Darsning Grammatik Qoidalari
              </h3>

              {lesson.grammar && lesson.grammar.length > 0 ? (
                lesson.grammar.map((g, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-3">
                    <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {i + 1}. {g.rule}
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {g.explanation}
                    </p>
                    {g.examples && (
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold uppercase text-gray-400">Misollar:</span>
                        {g.examples.map((ex, exIdx) => (
                          <p key={exIdx} className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            • {ex}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">Grammatika qoidalari mavjud emas.</p>
              )}
            </div>
          )}

          {/* Tab 4: Transcript */}
          {activeTab === 'transcript' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dars Transkripti</h3>
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {lesson.transcript || 'Transkript mavjud emas.'}
              </div>
            </div>
          )}

          {/* Tab 5: Student Personal Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shaxsiy Dars Eslatmalari</h3>
                  <p className="text-xs text-gray-500">Ushbu dars bo'yicha tushunchalaringizni yozib boring</p>
                </div>
                <button
                  onClick={handleNotesSave}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  {savingNotes ? 'Saqlanmoqda...' : 'Eslatmani Saqlash'}
                </button>
              </div>

              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Darsdagi muhim qoidalar, o'zingizga eslatmalar..."
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Homework / Task Submission Modal */}
      {isHomeworkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-[#12182B] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Ustozga Dars Topshirig'ini Yuborish
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {lesson.course_title} • {lesson.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHomeworkModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {homeworkSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Topshiriq qabul qilindi!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {homeworkSuccess} Ustozingizga to'liq bildirishnoma yuborildi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleHomeworkSubmit} className="space-y-4">
                {homeworkError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{homeworkError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Dars vazifasi yechimi yoki amaliy konspekt:
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={homeworkText}
                    onChange={(e) => setHomeworkText(e.target.value)}
                    placeholder="Ushbu darsda o'rganganlaringiz, topshiriq javoblari, tarjimalar yoki mashq yechimlarini batafsil yozing..."
                    className="w-full p-3.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Topshirganingizdan so'ng ushbu ma'lumot kurs o'qituvchisi va administrator kabinetiga zudlik bilan yuboriladi.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsHomeworkModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={homeworkSubmitting}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#635BFF] to-[#8B7CFF] hover:from-[#544BFF] hover:to-[#7A6BFF] shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{homeworkSubmitting ? 'Yuborilmoqda...' : 'Ustozga Topshirish'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
