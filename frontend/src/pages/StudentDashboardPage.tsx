import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Flame,
  Zap,
  BookOpen,
  Award,
  PlayCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Settings,
  Edit,
  LogOut,
  CheckCircle2,
  Share2,
  Download,
  Calendar,
  Sparkles,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  X,
  FileText,
  AlertCircle,
  Users
} from 'lucide-react';
import { formatYouTubeEmbedUrl, getYouTubeWatchUrl, fetchYouTubeMetadata } from '../utils/youtube';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { user, isLoading: authLoading, logout, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'super_admin';
  const [dashboardMode, setDashboardMode] = useState<'student' | 'teacher'>(() => {
    return user?.role === 'teacher' ? 'teacher' : 'student';
  });

  // Teacher Studio state
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);
  const [teacherSubmissions, setTeacherSubmissions] = useState<any[]>([]);
  const [teacherHomeworks, setTeacherHomeworks] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [teacherTab, setTeacherTab] = useState<'lessons' | 'submissions'>('lessons');

  // Video Lesson modal state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState<string>('');
  const [lessonDuration, setLessonDuration] = useState<number>(15);
  const [lessonContent, setLessonContent] = useState<string>('');
  const [savingLesson, setSavingLesson] = useState<boolean>(false);
  const [lessonMsg, setLessonMsg] = useState<string | null>(null);

  const fetchTeacherCourses = async () => {
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch('/api/teachers/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success && d.courses) {
        setTeacherCourses(d.courses);
        if (d.courses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(d.courses[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch teacher courses error:', err);
    }
  };

  const fetchCourseLessons = async (cId: string) => {
    if (!cId) return;
    setLoadingLessons(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/teachers/courses/${cId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success && d.lessons) {
        setCourseLessons(d.lessons);
      }
    } catch (err) {
      console.error('Fetch course lessons error:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch('/api/teachers/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setTeacherSubmissions(d.attempts || []);
        setTeacherHomeworks(d.homeworks || []);
      }
    } catch (err) {
      console.error('Fetch teacher submissions error:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isTeacherOrAdmin) {
      fetchTeacherCourses();
      fetchSubmissions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseLessons(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleOpenAddLesson = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonVideoUrl('');
    setLessonDuration(15);
    setLessonContent('');
    setLessonMsg(null);
    setIsLessonModalOpen(true);
  };

  const [fetchingYoutubeMeta, setFetchingYoutubeMeta] = useState<boolean>(false);

  const handleVideoUrlChange = async (url: string) => {
    setLessonVideoUrl(url);
    if (url.trim().length > 10) {
      setFetchingYoutubeMeta(true);
      try {
        const meta = await fetchYouTubeMetadata(url);
        if (meta?.title && (!lessonTitle.trim() || lessonTitle.startsWith('1-Dars') || lessonTitle === 'Yangi Dars')) {
          setLessonTitle(meta.title);
        }
      } catch {}
      setFetchingYoutubeMeta(false);
    }
  };

  const handleOpenEditLesson = (les: any) => {
    setEditingLessonId(les.id);
    setLessonTitle(les.title);
    setLessonVideoUrl(les.video_url || '');
    setLessonDuration(les.duration_minutes || 15);
    setLessonContent(les.content_text || '');
    setLessonMsg(null);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setSavingLesson(true);
    setLessonMsg(null);

    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      let res;
      if (editingLessonId) {
        res = await fetch(`/api/teachers/lessons/${editingLessonId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            video_url: lessonVideoUrl.trim(),
            duration_minutes: lessonDuration,
            content_text: lessonContent
          })
        });
      } else {
        res = await fetch(`/api/teachers/courses/${selectedCourseId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            video_url: lessonVideoUrl.trim(),
            duration_minutes: lessonDuration,
            content_text: lessonContent
          })
        });
      }

      const d = await res.json();
      if (d.success) {
        setLessonMsg('Video dars muvaffaqiyatli saqlandi!');
        fetchCourseLessons(selectedCourseId);
        setTimeout(() => {
          setIsLessonModalOpen(false);
          setLessonMsg(null);
        }, 1200);
      } else {
        setLessonMsg(d.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      setLessonMsg(err.message || 'Server xatoligi');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Haqiqatan ham ushbu darsni o'chirmoqchimisiz?")) return;
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/teachers/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        fetchCourseLessons(selectedCourseId);
      }
    } catch (err) {
      console.error('Delete lesson error:', err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal('register', '/dashboard');
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
        const res = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resData = await res.json();
        if (resData.success) {
          setData(resData);
        }
      } catch (err) {
        console.error('Fetch dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-9 h-9 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Shaxsiy kabinetga kirish talab qilinadi</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kurslaringiz va natijalaringizni ko&apos;rish uchun hisobingizga kiring.
          </p>
          <button
            onClick={() => openAuthModal('register', '/dashboard')}
            className="px-6 py-3 bg-[#635BFF] hover:bg-[#5249F5] text-white rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            Boshlash / Hisobga kirish
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-40 rounded-3xl bg-gray-200 dark:bg-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Role Mode Switcher for Teachers & Admins */}
        {isTeacherOrAdmin && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-2.5 bg-white dark:bg-[#12182B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDashboardMode('student')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  dashboardMode === 'student'
                    ? 'bg-[#635BFF] text-white shadow-md shadow-indigo-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>O'quvchi Kabineti</span>
              </button>
              <button
                onClick={() => setDashboardMode('teacher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  dashboardMode === 'teacher'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Ustoz Studiyasi: Video Darslar & Topshiriqlar</span>
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-50 dark:bg-[#1A223B] rounded-xl font-medium">
              Rol: <strong className="text-gray-900 dark:text-white capitalize">{user.role}</strong>
            </div>
          </div>
        )}

        {/* TEACHER STUDIO VIEW */}
        {dashboardMode === 'teacher' && isTeacherOrAdmin ? (
          <div className="space-y-8">
            {/* Teacher Studio Header */}
            <div className="rounded-3xl bg-gradient-to-r from-[#0B1020] via-indigo-950 to-[#0B1020] p-8 text-white border border-indigo-900/40 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LISON O'qituvchi va Video Studiyasi</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Kurs Videolari va Topshiriqlar Boshqaruvi
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
                    Darslaringizga YouTube orqali video qo'shing, o'quvchilar topshirgan test va amaliy vazifalar natijalarini real vaqtda kuzating.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAddLesson}
                    disabled={!selectedCourseId}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Yangi Video Dars Qo'shish</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs: Video Lessons & Submissions */}
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setTeacherTab('lessons')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'lessons'
                      ? 'bg-white text-[#0B1020]'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Darslar & Video Havolalar ({courseLessons.length})</span>
                </button>
                <button
                  onClick={() => { setTeacherTab('submissions'); fetchSubmissions(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    teacherTab === 'submissions'
                      ? 'bg-white text-[#0B1020]'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>O'quvchilar Topshirgan Natijalar ({teacherSubmissions.length + teacherHomeworks.length})</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Lessons & Video Management */}
            {teacherTab === 'lessons' && (
              <div className="space-y-6">
                {/* Course Selector Bar */}
                <div className="bg-white dark:bg-[#12182B] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Kursni tanlang:</span>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                    >
                      {teacherCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.language} - {c.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleOpenAddLesson}
                    className="px-4 py-2 rounded-xl bg-[#635BFF] hover:bg-[#544BFF] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ushbu kursga video dars qo'shish</span>
                  </button>
                </div>

                {/* Lessons List */}
                <div className="bg-white dark:bg-[#12182B] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#635BFF]" />
                      Mavjud Darslar Ro'yxati
                    </h3>
                    <span className="text-xs font-semibold text-gray-500">
                      Jami: {courseLessons.length} ta dars
                    </span>
                  </div>

                  {loadingLessons ? (
                    <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                      Darslar yuklanmoqda...
                    </div>
                  ) : courseLessons.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <Video className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Ushbu kursda hali darslar yo'q
                      </p>
                      <button
                        onClick={handleOpenAddLesson}
                        className="px-4 py-2 bg-[#635BFF] text-white rounded-xl text-xs font-bold hover:bg-[#544BFF]"
                      >
                        Birinchi video darsni qo'shish
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courseLessons.map((les) => (
                        <div
                          key={les.id}
                          className="p-4 rounded-2xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between space-y-3 group hover:border-[#635BFF]/30 transition"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF]">
                                {les.order_index}-Dars
                              </span>
                              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {les.duration_minutes || 15} daqiqa
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                              {les.title}
                            </h4>

                            {les.video_url ? (
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/90">
                                <iframe
                                  src={formatYouTubeEmbedUrl(les.video_url)}
                                  title={les.title}
                                  className="w-full h-full pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <span className="px-3 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold">
                                    YouTube Video
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-400 text-center">
                                Video havola kiritilmagan
                              </div>
                            )}

                            {les.content_text && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {les.content_text}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                            {les.video_url && (
                              <a
                                href={getYouTubeWatchUrl(les.video_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>YouTubega kirish</span>
                              </a>
                            )}
                            <button
                              onClick={() => navigate(`/lessons/${les.id}`)}
                              className="px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Ko'rish</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditLesson(les)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#635BFF] hover:bg-[#635BFF]/10 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Tahrirlash</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(les.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>O'chirish</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Submissions & Performance Audit */}
            {teacherTab === 'submissions' && (
              <div className="bg-white dark:bg-[#12182B] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" />
                      O'quvchilar Topshirgan Test & Vazifalar Natijalari
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Har bir o'quvchining Gmail pochtasi, to'plagan bali va sarflagan vaqti
                    </p>
                  </div>
                  <button
                    onClick={fetchSubmissions}
                    className="px-3 py-1.5 text-xs font-bold text-[#635BFF] bg-[#635BFF]/10 rounded-xl hover:bg-[#635BFF]/20 transition cursor-pointer"
                  >
                    Yangilash
                  </button>
                </div>

                {loadingSubmissions ? (
                  <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                    Natijalar yuklanmoqda...
                  </div>
                ) : teacherSubmissions.length === 0 && teacherHomeworks.length === 0 ? (
                  <div className="py-16 text-center space-y-2 text-gray-500">
                    <Award className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-sm font-bold">Hozircha topshirilgan vazifalar mavjud emas</p>
                    <p className="text-xs">O'quvchilar test yoki amaliy topshiriq topshirganda bu yerda real vaqtda ko'rinadi.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold uppercase text-gray-400">
                          <th className="py-3 px-3">O'quvchi</th>
                          <th className="py-3 px-3">Kurs & Topshiriq</th>
                          <th className="py-3 px-3">Natija (Ball)</th>
                          <th className="py-3 px-3">Sarflangan Vaqt</th>
                          <th className="py-3 px-3">Holat</th>
                          <th className="py-3 px-3">Sana</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                        {teacherSubmissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A223B]/50 transition">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[#635BFF] font-bold flex items-center justify-center text-xs shrink-0">
                                  {sub.first_name?.[0] || 'O'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {sub.first_name} {sub.last_name}
                                  </p>
                                  <p className="text-[11px] text-gray-500 font-mono">
                                    {sub.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {sub.quiz_title}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {sub.course_title}
                              </p>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-black text-sm ${sub.passed ? 'text-emerald-600' : 'text-amber-500'}`}>
                                  {sub.score_percent}%
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({sub.earned_points}/{sub.total_points} ball)
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-gray-600 dark:text-gray-400">
                              {sub.time_spent_seconds || 0} soniya
                            </td>
                            <td className="py-3.5 px-3">
                              {sub.passed ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                                  Muvaffaqiyatli O'tdi
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-extrabold border border-amber-200 dark:border-amber-800">
                                  Qayta topshirish kerak
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                              {new Date(sub.attempted_at).toLocaleString('uz-UZ')}
                            </td>
                          </tr>
                        ))}

                        {/* Practical homework submissions */}
                        {teacherHomeworks.map((hw) => (
                          <tr key={hw.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A223B]/50 transition bg-indigo-50/20 dark:bg-indigo-950/10">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 font-bold flex items-center justify-center text-xs shrink-0">
                                  {hw.first_name?.[0] || 'O'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {hw.first_name} {hw.last_name}
                                  </p>
                                  <p className="text-[11px] text-gray-500 font-mono">
                                    {hw.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {hw.lesson_title} (Amaliy Vazifa)
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {hw.course_title}
                              </p>
                              {hw.homework_text && (
                                <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-300 bg-white dark:bg-[#12182B] p-2 rounded border border-gray-100 dark:border-gray-800 max-w-sm whitespace-pre-wrap">
                                  "{hw.homework_text}"
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-black text-sm text-emerald-600">
                                100%
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-gray-400 text-[11px]">
                              Topshirilgan
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                                Vazifa Qabul Qilindi
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-gray-400 text-[11px] whitespace-nowrap">
                              {new Date(hw.attempted_at).toLocaleString('uz-UZ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD STUDENT VIEW */
          <>
            {/* Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-900 via-indigo-900 to-primary-950 p-8 sm:p-10 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=6366f1&color=fff`}
                alt={user.first_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-white/20 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Xush kelibsiz, {user.first_name}! 👋
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mt-1">
                  Bugungi bilim maqsadingiz: {user.daily_goal_minutes || 20} daqiqa dars o'rganish
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs font-semibold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Daraja: {user.learning_level || 'A1'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-gray-200">
                    Level {user.level || 1} O'quvchi
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center min-w-[90px]">
                <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-bounce" />
                <p className="text-xl font-black">{data?.streak || 1}</p>
                <p className="text-[10px] text-gray-300 font-medium">Kunlik Streak</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center min-w-[90px]">
                <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xl font-black">{user.xp_points}</p>
                <p className="text-[10px] text-gray-300 font-medium">Jami XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning Active Card */}
        {data?.continue_learning && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <img
                src={data.continue_learning.cover_image}
                alt={data.continue_learning.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                  Davom Ettirish
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {data.continue_learning.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {data.continue_learning.active_lesson_title || 'Navbatdagi dars tayyor'}
                </p>

                {/* Progress bar */}
                <div className="w-48 sm:w-64 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500"
                    style={{ width: `${data.continue_learning.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const targetLesson = data.continue_learning.active_lesson_id || data.continue_learning.last_accessed_lesson_id;
                if (targetLesson) navigate(`/lessons/${targetLesson}`);
                else navigate(`/courses/${data.continue_learning.course_id}`);
              }}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Darsni Davom Ettirish ({data.continue_learning.progress_percent}%)</span>
            </button>
          </div>
        )}

        {/* Dashboard Sections: Courses & Achievements & Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: My Courses */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary-500" />
                  Mening A'zo Bo'lgan Kurslarim
                </h3>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  Yangi kurs qo'shish
                </button>
              </div>

              <div className="space-y-4">
                {data?.enrolled_courses && data.enrolled_courses.length > 0 ? (
                  data.enrolled_courses.map((c: any) => (
                    <div
                      key={c.enrollment_id}
                      onClick={() => navigate(`/courses/${c.course_id}`)}
                      className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-400 flex items-center justify-between gap-4 cursor-pointer transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={c.cover_image}
                          alt={c.title}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {c.title}
                          </h4>
                          <span className="text-[11px] text-gray-400">
                            {c.language} • {c.level} • {c.progress_percent}% yakunlandi
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="text-center py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Hozircha birorta kursga a&apos;zo bo&apos;lmagansiz. Quyidagi tavsiya etilgan kurslardan boshlang:
                      </p>
                      <button
                        onClick={() => navigate('/courses')}
                        className="px-4 py-2 bg-[#635BFF] hover:bg-[#5249F5] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Barcha kurslarni ko&apos;rish
                      </button>
                    </div>
                    {data?.recommended_courses && data.recommended_courses.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.recommended_courses.map((rc: any) => (
                          <div
                            key={rc.id}
                            onClick={() => navigate(`/courses/${rc.id}`)}
                            className="p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#635BFF] flex items-center gap-3 cursor-pointer transition bg-white dark:bg-gray-900"
                          >
                            <img
                              src={rc.cover_image}
                              alt={rc.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {rc.title}
                              </h4>
                              <span className="text-[11px] text-gray-400">
                                {rc.language} • {rc.level}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#635BFF] shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Earned Certificates */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Mening Rasmiy Sertifikatlarim
              </h3>

              {data?.certificates && data.certificates.length > 0 ? (
                <div className="space-y-3">
                  {data.certificates.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-transparent border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                          Sertifikat ID: {cert.id}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {cert.course_title}
                        </h4>
                        <p className="text-[11px] text-gray-500">Berilgan sana: {cert.issue_date?.slice(0, 10)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/verify/${cert.id}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                        >
                          Ko'rish & Tekshirish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Kursni 100% tugatib, yakuniy testni topshirganingizdan so'ng sertifikat beriladi.
                </p>
              )}
            </div>
          </div>

          {/* Right: Achievements & Weekly Goals */}
          <div className="lg:col-span-4 space-y-6">
            {/* Badges and Gamification */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Yutuqlar Kolleksiyasi
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {data?.achievements?.map((ach: any) => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border text-center transition ${
                      ach.is_unlocked
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/60 opacity-50 grayscale'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-2 text-xs font-bold shadow-sm">
                      ⚡
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{ach.title_uz}</p>
                    <span className="text-[10px] text-amber-600 font-bold">+{ach.xp_reward} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Performance Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                Test Ko'rsatkichlari
              </h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">O'rtacha Ball</p>
                  <p className="text-lg font-black text-emerald-600">
                    {data?.quiz_performance?.average_score || 0}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Urinishlar</p>
                  <p className="text-lg font-black text-primary-600">
                    {data?.quiz_performance?.total_attempts || 0} ta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

      {/* Teacher Video Lesson Add / Edit Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl p-6 bg-white dark:bg-[#12182B] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingLessonId ? 'Video Darsni Tahrirlash' : 'Yangi Video Dars Qo\'shish'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    YouTube video havolasi orqali dars joylashtiring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {lessonMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {lessonMsg}
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Dars Sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Masalan: 1-Dars: Alifbo va Talaffuz Qoidalari"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    YouTube Video Havolasi (URL)
                  </label>
                  {lessonVideoUrl.trim() && (
                    <a
                      href={getYouTubeWatchUrl(lessonVideoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
                    >
                      <span>YouTubeda ochish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={lessonVideoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... yoki https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                {fetchingYoutubeMeta && (
                  <p className="mt-1 text-[11px] text-[#635BFF] animate-pulse font-medium">
                    🔍 YouTube video ma'lumotlari avtomatik yuklanmoqda...
                  </p>
                )}

                {lessonVideoUrl.trim() && (
                  <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-xs font-bold text-red-800 dark:text-red-200">
                        YouTube video aniqlandi
                      </span>
                    </div>
                    <a
                      href={getYouTubeWatchUrl(lessonVideoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      <span>YouTubega Kirish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <p className="mt-1 text-[11px] text-gray-400">
                  Har qanday YouTube havolasi (to'liq havola, qisqa youtu.be, shorts yoki embed) avtomatik tarzda to'g'ri ko'rinishga keltiriladi.
                </p>
              </div>

              {/* Real-time YouTube Player Preview */}
              {lessonVideoUrl.trim() && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400">
                      Video Ko'rinishi (Jonli Sinov):
                    </label>
                    <a
                      href={getYouTubeWatchUrl(lessonVideoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <span>YouTubeda to'liq tomosha qilish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-700 group">
                    <iframe
                      src={formatYouTubeEmbedUrl(lessonVideoUrl)}
                      title="YouTube Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <a
                      href={getYouTubeWatchUrl(lessonVideoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm transition"
                    >
                      <span>YouTubeda ko'rish</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Davomiyligi (Daqiqada)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Dars Konspekti / Qo'shimcha Izoh
                </label>
                <textarea
                  rows={3}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Darsning asosiy qoidalari, lug'at yoki talabalar uchun muhim eslatmalar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#635BFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {savingLesson ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
