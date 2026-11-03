import React, { useEffect, useState, useRef } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Volume2,
  BookOpen,
  Check,
  ChevronRight
} from 'lucide-react';

interface QuizEnginePageProps {
  quizId: string;
  navigate: (path: string) => void;
}

export const QuizEnginePage: React.FC<QuizEnginePageProps> = ({ quizId, navigate }) => {
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: any }>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 mins
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [showReview, setShowReview] = useState<boolean>(false);

  // Matching helper state
  const [selectedMatchOpt, setSelectedMatchOpt] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
        const res = await fetch(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.quiz) {
          setQuiz(data.quiz);
          setTimeLeftSeconds(data.quiz.time_limit_minutes * 60 || 600);
        }
      } catch (err) {
        console.error('Fetch quiz error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || !quiz) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, quiz, userAnswers]);

  const handleSelectAnswer = (questionId: string, answer: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMatchPair = (questionId: string, optId: string, targetPair: string) => {
    const currentMatches = userAnswers[questionId] || {};
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...currentMatches,
        [optId]: targetPair
      }
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const timeSpent = (quiz?.time_limit_minutes || 10) * 60 - timeLeftSeconds;

      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: userAnswers,
          time_spent_seconds: Math.max(0, timeSpent)
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setIsSubmitted(true);
        if (data.passed) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.55 }
          });
        }
      }
    } catch (err) {
      console.error('Submit quiz error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setResult(null);
    setShowReview(false);
    setTimeLeftSeconds((quiz?.time_limit_minutes || 10) * 60);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-20 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <h2 className="text-xl font-bold">Test topilmadi</h2>
        <button onClick={() => navigate('/courses')} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold">
          Kurslarga qaytish
        </button>
      </div>
    );
  }

  const currentQ: QuizQuestion | undefined = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  // Render question component based on question_type
  const renderQuestionInput = (q: QuizQuestion) => {
    const currentAns = userAnswers[q.id];

    switch (q.question_type) {
      case 'multiple_choice':
      case 'true_false':
      case 'translation':
      case 'listening':
      case 'reading':
        return (
          <div className="space-y-3">
            {q.audio_url && (
              <div className="p-3 bg-primary-50 dark:bg-primary-950/50 rounded-2xl flex items-center justify-between border border-primary-200 dark:border-primary-900 mb-4">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">Audioni tinglang:</span>
                <button
                  onClick={() => {
                    const audio = new Audio(q.audio_url);
                    audio.play();
                  }}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary-500"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Audioni Eshitish</span>
                </button>
              </div>
            )}

            {q.reading_passage && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                {q.reading_passage}
              </div>
            )}

            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const isSelected = currentAns === opt.id || currentAns === opt.text;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectAnswer(q.id, opt.id)}
                    className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/50 border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{opt.text}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'fill_blank':
      case 'sentence_order':
        return (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Javobingizni quyidagi maydonga yozing yoki taklif qilingan so'zlardan foydalaning:
            </p>
            <input
              type="text"
              value={currentAns || ''}
              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
              placeholder="Javobingizni yozing..."
              className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
            />
            {q.options && q.options.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectAnswer(q.id, opt.text)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'word_matching':
        const matches = currentAns || {};
        return (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Har bir so'z yonidagi mos ma'noni tanlang:
            </p>
            <div className="space-y-3">
              {q.options.map((opt) => (
                <div key={opt.id} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{opt.text}</span>
                  <select
                    value={matches[opt.id] || ''}
                    onChange={(e) => handleMatchPair(q.id, opt.id, e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white"
                  >
                    <option value="">Mosini tanlang</option>
                    {q.options.map((o) => (
                      <option key={o.id} value={o.match_pair || o.text}>
                        {o.match_pair || o.text}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-10 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
              Interaktiv Test Engine
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {quiz.title}
            </h1>
          </div>

          {!isSubmitted && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-extrabold">
              <Clock className="w-4 h-4 animate-spin text-amber-500" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Quiz Progress & Question Card */}
        {!isSubmitted ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Savol {currentQuestionIndex + 1} / {totalQuestions}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Bajarildi</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Savol turi: {currentQ?.question_type} • {currentQ?.points} ball
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {currentQ?.question_text}
              </h2>
            </div>

            {/* Question Inputs */}
            {currentQ && renderQuestionInput(currentQ)}

            {/* Navigation Bottom Controls */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Oldingi</span>
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-md transition flex items-center gap-1.5"
                >
                  <span>Keyingi savol</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{submitting ? 'Tekshirilmoqda...' : 'Testni Yakunlash'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results Card */
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-white">
              <Award className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {result?.passed ? 'Tabriklaymiz! Testdan O\'tdingiz!' : 'Afsuski, yetarli ball to\'planmadi'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {result?.passed
                  ? `Siz testni ${result?.score_percent}% natija bilan topshirdingiz (+${result?.xp_earned} XP qo'shildi)`
                  : `O'tish bali: ${result?.passing_score}%. Sizning natijangiz: ${result?.score_percent}%`}
              </p>
            </div>

            {/* Score pills */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Natija</p>
                <p className="text-lg font-black text-primary-600">{result?.score_percent}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Ball</p>
                <p className="text-lg font-black text-emerald-600">{result?.earned_points}/{result?.total_points}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Mukofot</p>
                <p className="text-lg font-black text-amber-500">+{result?.xp_earned} XP</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta urinish</span>
              </button>

              <button
                onClick={() => setShowReview(!showReview)}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showReview ? 'Javoblarni yashirish' : 'Javoblar tahlilini ko\'rish'}</span>
              </button>

              <button
                onClick={() => navigate(`/courses/${quiz.course_id}`)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                Kursga qaytish
              </button>
            </div>

            {/* Answers Review list */}
            {showReview && result?.reviews && (
              <div className="mt-8 text-left space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Savollar Tahlili:</h3>
                {result.reviews.map((r: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      r.is_correct
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                        {idx + 1}. {r.question_text}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        r.is_correct ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {r.is_correct ? `+${r.points} ball` : '0 ball'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1">
                      <p className="text-gray-500">
                        To'g'ri javob: <strong className="text-emerald-700 dark:text-emerald-300">{r.correct_answer}</strong>
                      </p>
                      {r.explanation && (
                        <p className="text-gray-600 dark:text-gray-400 italic pt-1 border-t border-gray-200/50 dark:border-gray-800">
                          💡 Izoh: {r.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
