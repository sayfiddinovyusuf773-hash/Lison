import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  BookOpen,
  Clock,
  Star,
  Users,
  CheckCircle,
  PlayCircle,
  Award,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Lock,
  CreditCard,
  Phone,
  Send,
  X,
  AlertCircle,
  Check
} from 'lucide-react';

interface CourseDetailPageProps {
  courseId: string;
  navigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, navigate }) => {
  const { user, openAuthModal, updateCoins } = useAuth();
  const { t } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [unlockingCoins, setUnlockingCoins] = useState(false);

  // Payment Request Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [phone, setPhone] = useState('+998 ');
  const [paymentMethod, setPaymentMethod] = useState<'Click' | 'Payme' | 'Uzum' | 'Karta'>('Click');
  const [note, setNote] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/courses/${courseId}`, { headers });
      const data = await res.json();
      if (data.success && data.course) {
        setCourse(data.course);
      }
    } catch (err) {
      console.error('Fetch course detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [courseId, user]);

  const handleEnrollOrContinue = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!course) return;

    // 1. If already enrolled, navigate straight to the lesson
    if (course.is_enrolled) {
      const targetLessonId = course.last_accessed_lesson_id || course.curriculum?.[0]?.lessons?.[0]?.id;
      if (targetLessonId) {
        navigate(`/lessons/${targetLessonId}`);
      } else {
        alert("Ushbu kurs uchun darslar tez kunda yuklanadi.");
      }
      return;
    }

    // 2. If course is PAID (pullik kurs)
    if (course.is_paid === 1) {
      if (course.pending_request?.status === 'pending') {
        setRequestSuccessMsg("Sizning ushbu kurs bo'yicha to'lov so'rovingiz administratorga yetkazilgan va ko'rib chiqilmoqda. Tez orada tasdiqlanadi!");
        return;
      }
      // Open Payment Request Modal
      setIsPaymentModalOpen(true);
      return;
    }

    // 3. Free Course Enrollment
    setEnrolling(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const firstLessonId = data.first_lesson_id || course.curriculum?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
          navigate(`/lessons/${firstLessonId}`);
        } else {
          setCourse((prev) => (prev ? { ...prev, is_enrolled: true } : null));
        }
      } else if (data.is_paid) {
        // Course is marked paid on backend
        setIsPaymentModalOpen(true);
      } else {
        alert(data.message || "A'zo bo'lishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error('Enroll error:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleLessonItemClick = (lessonId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (course?.is_enrolled) {
      navigate(`/lessons/${lessonId}`);
      return;
    }

    if (course?.is_paid === 1) {
      setIsPaymentModalOpen(true);
      return;
    }

    // Free course: auto-enroll then open
    handleEnrollOrContinue();
  };

  const handleSubmitPaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9) {
      alert("Iltimos, to'liq telefon raqamingizni kiriting (+998 90 123 45 67)");
      return;
    }

    setSubmittingRequest(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/courses/${courseId}/enrollment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phone.trim(),
          payment_method: paymentMethod,
          note: note.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsPaymentModalOpen(false);
        setRequestSuccessMsg("So'rovingiz administratorga muvaffaqiyatli yuborildi! Administrator to'lovni tasdiqlashi bilan sizga bildirishnoma boradi va kursingiz ochiladi.");
        setCourse((prev) => prev ? {
          ...prev,
          pending_request: {
            id: data.request_id || 'req-temp',
            status: 'pending',
            payment_method: paymentMethod,
            phone: phone.trim(),
            created_at: new Date().toISOString()
          }
        } : null);
      } else {
        alert(data.message || "So'rov yuborishda xatolik.");
      }
    } catch (err) {
      console.error('Submit payment request error:', err);
      alert("Server bilan aloqada xatolik yuz berdi.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleUnlockWithCoins = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const requiredCoins = course?.price_coins || 100;
    const currentCoins = user.coins !== undefined && user.coins !== null ? user.coins : 0;

    if (currentCoins < requiredCoins) {
      alert(`Sizda tangalar yetarli emas.\nSizdagi tangalar: ${currentCoins} 🪙\nKursni ochish uchun: ${requiredCoins} 🪙 kerak.\n\nDarslarni o'qib, savollarga to'g'ri javob berib tangalar to'plang!`);
      return;
    }

    if (!confirm(`"${course?.title}" kursini ${requiredCoins} ta Coin 🪙 evaziga ochishni tasdiqlaysizmi?`)) {
      return;
    }

    setUnlockingCoins(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/courses/${courseId}/unlock-with-coins`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (typeof data.coins === 'number') {
          updateCoins(data.coins);
        }
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setCourse((prev) => (prev ? { ...prev, is_enrolled: true } : null));
        alert(data.message || 'Kurs tangalar evaziga ochildi!');
        const firstLessonId = data.first_lesson_id || course?.curriculum?.[0]?.lessons?.[0]?.id;
        if (firstLessonId) {
          navigate(`/lessons/${firstLessonId}`);
        }
      } else {
        alert(data.message || 'Kursni ochishda xatolik yuz berdi.');
      }
    } catch (err) {
      console.error('Unlock error:', err);
      alert('Server bilan bog\'lanishda xatolik.');
    } finally {
      setUnlockingCoins(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <h2 className="text-xl font-bold">Kurs topilmadi</h2>
        <button onClick={() => navigate('/courses')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Barcha kurslarga qaytish
        </button>
      </div>
    );
  }

  const isPaid = course.is_paid === 1;
  const isPending = course.pending_request?.status === 'pending';

  return (
    <div className="min-h-screen py-10 bg-[#F7F8FC] dark:bg-[#080C16] text-[#171A2B] dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Status notification banner if requested */}
        {requestSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {requestSuccessMsg}
              </div>
            </div>
            <button onClick={() => setRequestSuccessMsg(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800/80 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Info */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  {course.language}
                </span>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                  {course.level} Daraja
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 ml-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
                {isPaid ? (
                  <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Pullik Kurs ({course.price ? `${course.price.toLocaleString()} UZS` : 'Pullik'})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                    100% Bepul
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {course.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <span className="flex items-center gap-1.5 font-semibold">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  {course.total_lessons || course.curriculum?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 12} ta video dars
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  {course.duration_hours || 17} soat umumiy davomiylik
                </span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {(course.enrollment_count || 11200).toLocaleString()} nafar o'quvchi
                </span>
              </div>

              {/* CTA Action Button */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                {course.is_enrolled ? (
                  <button
                    onClick={handleEnrollOrContinue}
                    disabled={enrolling}
                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Darsni Davom Ettirish ({course.progress_percent || 0}%)</span>
                  </button>
                ) : isPaid ? (
                  <>
                    <button
                      onClick={handleUnlockWithCoins}
                      disabled={unlockingCoins}
                      className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <span className="text-lg">🪙</span>
                      <span>
                        {unlockingCoins ? 'Ochilmoqda...' : `${course.price_coins || 100} Coin bilan ochish`}
                      </span>
                    </button>

                    {isPending ? (
                      <div className="px-6 py-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-xs rounded-2xl flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span>To'lov so'rovi kutilmoqda</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnrollOrContinue}
                        disabled={enrolling}
                        className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-md flex items-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>To'lov so'rovi ({course.price ? `${course.price.toLocaleString()} UZS` : 'Pullik'})</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleEnrollOrContinue}
                    disabled={enrolling}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{enrolling ? 'Yozilmoqda...' : 'Kursni Bepul Boshlash'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail preview with Interactive Play Button */}
            <div className="lg:col-span-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 group">
                <img
                  src={course.cover_image}
                  alt={course.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition flex items-center justify-center">
                  <button
                    onClick={handleEnrollOrContinue}
                    title="Darsni ko'rish / boshlash"
                    className="w-16 h-16 rounded-full bg-white/95 text-indigo-600 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition transform duration-200"
                  >
                    <PlayCircle className="w-10 h-10 fill-indigo-600 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs: Objectives & Teacher & Curriculum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Syllabus Curriculum */}
          <div className="lg:col-span-8 space-y-6">
            {/* Objectives */}
            {course.objectives && course.objectives.length > 0 && (
              <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800/80 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-500" />
                  Kurs Davomida Nimani O'rganasiz?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modules and Lessons list */}
            <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800/80 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Kurs O'quv Rejasi (Syllabus)
              </h3>

              <div className="space-y-6">
                {course.curriculum && course.curriculum.length > 0 ? (
                  course.curriculum.map((module) => (
                    <div key={module.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                      <div className="bg-gray-50/80 dark:bg-gray-800/40 p-4 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {module.description}
                          </p>
                        )}
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => handleLessonItemClick(lesson.id)}
                            className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                                lesson.is_completed
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 group-hover:scale-110 transition'
                              }`}>
                                {lesson.is_completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <PlayCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                  {lesson.title}
                                </p>
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {lesson.duration_minutes} daqiqa • Video dars & Lug'at
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isPaid && !course.is_enrolled && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Pullik
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-6 text-center">Tez kunda yangi darslar yuklanadi.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Teacher Card & Certification guarantee */}
          <div className="lg:col-span-4 space-y-6">
            {/* Teacher profile */}
            {course.teacher_name && (
              <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Kurs Muallifi
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={course.teacher_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                    alt={course.teacher_name}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {course.teacher_name}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{course.teacher_title}</p>
                  </div>
                </div>
                {course.teacher_bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800">
                    {course.teacher_bio}
                  </p>
                )}
              </div>
            )}

            {/* Certificate guarantee */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-indigo-500/10 to-transparent rounded-3xl p-6 border border-emerald-500/20 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Rasmiy Tasdiqlangan Sertifikat
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Kursning barcha modullarini tugatganingizdan so'ng, yakuniy imtihon topshiriladi va QR-kodli haqiqiy sertifikat taqdim etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Payment Request Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Kursga Yozilish & To'lov So'rovi
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {course.title}
                </p>
              </div>
            </div>

            {/* Course Price Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Kurs Narxi
                </span>
                <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300">
                  {course.price ? `${course.price.toLocaleString()} UZS` : "250,000 UZS"}
                </p>
              </div>
              <span className="px-3 py-1 bg-white dark:bg-indigo-900/60 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-200">
                To'liq kirish
              </span>
            </div>

            <form onSubmit={handleSubmitPaymentRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Foydalanuvchi
                </label>
                <input
                  type="text"
                  disabled
                  value={`${user?.first_name || ''} ${user?.last_name || ''} (${user?.email || ''})`}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium cursor-not-allowed border border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Bog'lanish uchun Telefon Raqamingiz <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Qulay To'lov Usulini Tanlang
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['Click', 'Payme', 'Uzum', 'Karta'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{method === 'Karta' ? 'Bank Kartasi / Naqd' : method}</span>
                      {paymentMethod === method && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Qo'shimcha Izoh (Ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="To'lov bo'yicha chek yoki qo'shimcha ma'lumot..."
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  So'rov yuborilgach, platforma administratoriga xabar boradi. Administrator to'lovni tasdiqlashi bilan darslar avtomatik ochiladi.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>{submittingRequest ? 'Yuborilmoqda...' : 'Administratorga So\'rov Yuborish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
