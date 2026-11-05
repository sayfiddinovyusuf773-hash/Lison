import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatYouTubeEmbedUrl, getYouTubeWatchUrl, fetchYouTubeMetadata } from '../utils/youtube';
import {
  Users,
  BookOpen,
  Award,
  Bot,
  Settings,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  TrendingUp,
  Sliders,
  History,
  CreditCard,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Check,
  X,
  Lock,
  Unlock,
  AlertCircle,
  Video,
  Play,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'users' | 'courses' | 'certificates' | 'ai' | 'settings'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Enrollment Requests tab state
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [requestsFilter, setRequestsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Courses tab state
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // Certificates tab state
  const [certificatesList, setCertificatesList] = useState<any[]>([]);

  // System settings state
  const [settingsList, setSettingsList] = useState<any[]>([]);

  // New course modal state
  const [isNewCourseOpen, setIsNewCourseOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLang, setNewLang] = useState('English');
  const [newLevel, setNewLevel] = useState('A1');
  const [newDesc, setNewDesc] = useState('');
  const [newPriceCoins, setNewPriceCoins] = useState<number>(100);

  // Pricing Modal state
  const [pricingCourse, setPricingCourse] = useState<any | null>(null);
  const [pricingIsPaid, setPricingIsPaid] = useState<boolean>(false);
  const [pricingAmount, setPricingAmount] = useState<number>(250000);
  const [pricingCoins, setPricingCoins] = useState<number>(100);
  const [savingPricing, setSavingPricing] = useState(false);

  // Course Lessons & YouTube Video Management state
  const [lessonCourse, setLessonCourse] = useState<any | null>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Lesson Form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState<number>(15);
  const [lessonContent, setLessonContent] = useState('');
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  const getAuthToken = () => localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');

  // Fetch overview stats
  const fetchOverview = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Admin fetch overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch enrollment & payment requests
  const fetchRequests = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/enrollment-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequestsList(data.requests);
      }
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      let url = '/api/admin/users';
      if (userSearch.trim()) url += `?search=${encodeURIComponent(userSearch.trim())}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch {
      // ignore
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoursesList(data.courses);
      }
    } catch {
      // ignore
    }
  };

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCertificatesList(data.certificates);
      }
    } catch {
      // ignore
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSettingsList(data.settings);
      }
    } catch {
      // ignore
    }
  };

  // Fetch course lessons for YouTube Video manager
  const fetchCourseLessons = async (courseId: string) => {
    setLoadingLessons(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourseLessons(data.lessons || []);
        setCourseModules(data.modules || []);
        if (data.modules && data.modules.length > 0 && !lessonModuleId) {
          setLessonModuleId(data.modules[0].id);
        }
      }
    } catch (err) {
      console.error('Fetch course lessons error:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const openLessonManager = (course: any) => {
    setLessonCourse(course);
    setEditingLessonId(null);
    resetLessonForm();
    fetchCourseLessons(course.id);
  };

  const resetLessonForm = () => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonVideoUrl('');
    setLessonDuration(15);
    setLessonContent('');
  };

  const startEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonVideoUrl(lesson.video_url || '');
    setLessonDuration(lesson.duration_minutes || 15);
    setLessonContent(lesson.content_text || '');
    setLessonModuleId(lesson.module_id || '');
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonCourse || !lessonTitle.trim()) return;

    setSavingLesson(true);
    try {
      const token = getAuthToken();
      if (editingLessonId) {
        // Edit existing lesson
        const res = await fetch(`/api/admin/lessons/${editingLessonId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            video_url: lessonVideoUrl.trim(),
            duration_minutes: lessonDuration,
            content_text: lessonContent,
            module_id: lessonModuleId
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchCourseLessons(lessonCourse.id);
          fetchCourses();
          resetLessonForm();
        } else {
          alert(data.message || 'Xatolik yuz berdi.');
        }
      } else {
        // Add new lesson
        const res = await fetch(`/api/admin/courses/${lessonCourse.id}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            video_url: lessonVideoUrl.trim(),
            duration_minutes: lessonDuration,
            content_text: lessonContent,
            module_id: lessonModuleId
          })
        });
        const data = await res.json();
        if (data.success) {
          fetchCourseLessons(lessonCourse.id);
          fetchCourses();
          resetLessonForm();
        } else {
          alert(data.message || 'Xatolik yuz berdi.');
        }
      }
    } catch (err) {
      console.error('Save lesson error:', err);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Haqiqatan ham ushbu darsni o'chirmoqchimisiz?")) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (lessonCourse) fetchCourseLessons(lessonCourse.id);
        fetchCourses();
        if (editingLessonId === lessonId) resetLessonForm();
      }
    } catch (err) {
      console.error('Delete lesson error:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'certificates') fetchCertificates();
    if (activeTab === 'settings' || activeTab === 'ai') fetchSettings();
  }, [activeTab]);

  // Handle Approve Request
  const handleApproveRequest = async (requestId: string) => {
    setProcessingReqId(requestId);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/enrollment-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
        );
        fetchOverview();
      } else {
        alert(data.message || 'Tasdiqlashda xatolik yuz berdi.');
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setProcessingReqId(null);
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (requestId: string) => {
    const note = prompt('Rad etish sababini kiriting (ixtiyoriy):');
    if (note === null) return;

    setProcessingReqId(requestId);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/enrollment-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (data.success) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', admin_note: note } : r))
        );
        fetchOverview();
      } else {
        alert(data.message || 'Rad etishda xatolik.');
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setProcessingReqId(null);
    }
  };

  // Handle Course Pricing Save
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingCourse) return;

    setSavingPricing(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/courses/${pricingCourse.id}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          is_paid: pricingIsPaid ? 1 : 0,
          price: pricingAmount,
          currency: 'UZS',
          price_coins: pricingCoins
        })
      });
      const data = await res.json();
      if (data.success) {
        setCoursesList((prev) =>
          prev.map((c) =>
            c.id === pricingCourse.id
              ? { ...c, is_paid: pricingIsPaid ? 1 : 0, price: pricingAmount, price_coins: pricingCoins }
              : c
          )
        );
        setPricingCourse(null);
      } else {
        alert(data.message || 'Narxni saqlashda xatolik.');
      }
    } catch (err) {
      console.error('Pricing error:', err);
    } finally {
      setSavingPricing(false);
    }
  };

  const handleGenerateAutoQuiz = async (lessonId: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/lessons/${lessonId}/auto-quiz`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || "0-darajali savollar muvaffaqiyatli yuklandi!");
      } else {
        alert(data.message || "Savollarni yuklashda xatolik.");
      }
    } catch {
      alert("Server bilan aloqada xatolik.");
    }
  };

  const handleToggleUserSuspension = async (targetUser: any) => {
    try {
      const token = getAuthToken();
      const nextStatus = targetUser.is_suspended === 1 ? 0 : 1;
      await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_suspended: nextStatus })
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = getAuthToken();
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          language: newLang,
          level: newLevel,
          description: newDesc,
          price_coins: newPriceCoins,
          cover_image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600'
        })
      });
      setIsNewCourseOpen(false);
      setNewTitle('');
      setNewDesc('');
      fetchCourses();
    } catch {
      // ignore
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Haqiqatan ham ushbu kursni arxivlab (o'chirmoqchimisiz)?")) return;
    try {
      const token = getAuthToken();
      await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCourses();
    } catch {
      // ignore
    }
  };

  const handleRevokeCertificate = async (certId: string) => {
    const reason = prompt('Sertifikatni bekor qilish sababini kiriting:');
    if (!reason) return;
    try {
      const token = getAuthToken();
      await fetch(`/api/admin/certificates/${certId}/revoke`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      fetchCertificates();
    } catch {
      // ignore
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#080C16]">
        <div className="text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Ruxsat Berilmagan</h2>
          <p className="text-xs text-gray-500">Ushbu sahifa faqat platforma ma'murlari uchun mo'ljallangan.</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const pendingRequestsCount = stats?.stats?.pending_enrollments || requestsList.filter((r) => r.status === 'pending').length || 0;

  const filteredRequests = requestsList.filter((r) => {
    if (requestsFilter === 'all') return true;
    return r.status === requestsFilter;
  });

  const previewEmbedUrl = formatYouTubeEmbedUrl(lessonVideoUrl);

  return (
    <div className="min-h-screen py-10 bg-[#F7F8FC] dark:bg-[#080C16] text-[#171A2B] dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  LISON Ma'muriyat Paneli
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                YouTube video darslar, to'lov so'rovlari, kurslar va AI boshqaruvi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition"
            >
              Mening Shaxsiy Kabinetim
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          {[
            { id: 'overview', label: 'Umumiy Tahlil', icon: TrendingUp },
            { id: 'requests', label: "To'lov & Kurs So'rovlari", icon: CreditCard, badge: pendingRequestsCount },
            { id: 'courses', label: 'Kurslar & Video Darslar (YouTube)', icon: BookOpen },
            { id: 'users', label: 'Foydalanuvchilar', icon: Users },
            { id: 'certificates', label: 'Sertifikatlar', icon: Award },
            { id: 'ai', label: 'AI & Sozlamalar', icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white dark:bg-[#0B1020] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Kutilayotgan To'lov So'rovlari</span>
                <p className="text-2xl font-black text-amber-500">{pendingRequestsCount}</p>
                <p className="text-[11px] text-gray-500 font-semibold">Administrator tasdig'ini kutmoqda</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Jami Foydalanuvchilar</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.stats?.total_users || 0}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">{stats?.stats?.active_users || 0} nafar faol</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Jami Kurslar</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.stats?.total_courses || 0}</p>
                <p className="text-[11px] text-indigo-600 font-semibold">{stats?.stats?.total_lessons || 0} ta video dars</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400">Berilgan Sertifikatlar</span>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stats?.stats?.certificates_issued || 0}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">100% serverda tasdiqlangan</p>
              </div>
            </div>

            {/* Quick Action Banner if pending requests */}
            {pendingRequestsCount > 0 && (
              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      {pendingRequestsCount} ta yangi to'lov/kurs so'rovi kutilmoqda!
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      O'quvchilar kursga to'lov so'rovi yuborgan. Tasdiqlash uchun bosing.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  So'rovlarni Ko'rish
                </button>
              </div>
            )}

            {/* Recent Audit Logs */}
            <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Xavfsizlik va Audit Qaydlari (Audit Logs)
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {stats?.recent_logs?.map((log: any) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase mr-2">
                        [{log.action}]
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">{log.details}</span>
                    </div>
                    <span className="text-gray-400 text-[10px] shrink-0">{log.created_at}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Enrollment & Payment Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  To'lov va Kursga Yozilish So'rovlari
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Pullik kurslarga yozilgan o'quvchilar va ularning to'lov tasdiqlari
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestsFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      requestsFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' && 'Barchasi'}
                    {st === 'pending' && `Kutilmoqda (${requestsList.filter((r) => r.status === 'pending').length})`}
                    {st === 'approved' && 'Tasdiqlangan'}
                    {st === 'rejected' && 'Rad etilgan'}
                  </button>
                ))}
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold">Hech qanday so'rov topilmadi</p>
                <p className="text-xs text-gray-500 mt-1">O'quvchilar pullik kursga yozilishganda shu yerda ko'rinadi.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/40 flex flex-wrap items-center justify-between gap-4 transition hover:border-indigo-200 dark:hover:border-indigo-900/60"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={req.course_cover || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200'}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {req.course_title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}>
                            {req.status === 'pending' && 'Kutilmoqda'}
                            {req.status === 'approved' && 'Tasdiqlandi'}
                            {req.status === 'rejected' && 'Rad etildi'}
                          </span>
                        </div>

                        {/* User info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {req.user_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {req.user_email}
                          </span>
                          <a
                            href={`tel:${req.phone}`}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {req.phone}
                          </a>
                        </div>

                        {/* Payment metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {req.amount?.toLocaleString()} {req.currency}
                          </span>
                          <span>• To'lov usuli: <strong>{req.payment_method}</strong></span>
                          <span>• {req.created_at?.slice(0, 16)}</span>
                          {req.admin_note && (
                            <span className="italic text-gray-500">
                              (Izoh: {req.admin_note})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            disabled={processingReqId === req.id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>{processingReqId === req.id ? 'Tasdiqlanmoqda...' : 'Tasdiqlash (Kursni Ochish)'}</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            disabled={processingReqId === req.id}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Rad etish</span>
                          </button>
                        </>
                      ) : req.status === 'approved' ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Kurs ochilgan
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Rad etilgan
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Courses Management & Video (YouTube) */}
        {activeTab === 'courses' && (
          <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Kurslar va YouTube Video Darslar Boshqaruvi</h3>
                <p className="text-xs text-gray-400">Darslarni YouTube orqali qo'shish, videolarni o'zgartirish va narxlarni sozlash</p>
              </div>
              <button
                onClick={() => setIsNewCourseOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi Kurs Qo'shish</span>
              </button>
            </div>

            {/* New Course Form Modal */}
            {isNewCourseOpen && (
              <form onSubmit={handleCreateCourse} className="p-5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Yangi Kurs Ma'lumotlari
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Kurs nomi (masalan: Boshlang'ich Ingliz Tili)..."
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border text-xs"
                  />
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border text-xs font-semibold"
                  >
                    <option value="English">🇬🇧 Ingliz tili (English)</option>
                    <option value="Russian">🇷🇺 Rus tili (Russian)</option>
                    <option value="Korean">🇰🇷 Koreys tili (Korean)</option>
                    <option value="Arabic">🇸🇦 Arab tili (Arabic)</option>
                    <option value="Turkish">🇹🇷 Turk tili (Turkish)</option>
                    <option value="German">🇩🇪 Nemis tili (German)</option>
                    <option value="French">🇫🇷 Fransuz tili (French)</option>
                    <option value="Spanish">🇪🇸 Ispan tili (Spanish)</option>
                    <option value="Japanese">🇯🇵 Yapon tili (Japanese)</option>
                    <option value="Chinese">🇨🇳 Xitoy tili (Chinese)</option>
                  </select>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border text-xs font-semibold"
                  >
                    <option value="A1">A1 - Boshlang'ich (0-daraja)</option>
                    <option value="A2">A2 - Elementar</option>
                    <option value="B1">B1 - O'rta</option>
                    <option value="B2">B2 - Yuqori o'rta</option>
                    <option value="C1">C1 - Ilg'or</option>
                  </select>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl">
                    <span className="text-sm">🪙</span>
                    <input
                      type="number"
                      min={10}
                      step={10}
                      value={newPriceCoins}
                      onChange={(e) => setNewPriceCoins(Number(e.target.value))}
                      placeholder="Coin narxi"
                      className="w-full bg-transparent text-xs font-bold outline-none"
                      title="Tangalar (Coin) orqali ochish narxi"
                    />
                    <span className="text-[10px] text-gray-400 font-bold">Coin</span>
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Kurs tavsifi..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-gray-900 border text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCourseOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {coursesList.map((c) => (
                <div key={c.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={c.cover_image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {c.title}
                        </h4>
                        {c.is_paid === 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Pullik: {(c.price || 0).toLocaleString()} UZS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            100% Bepul
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {c.language} • {c.level} • {c.total_lessons || 0} ta video dars • {c.duration_hours || 0} soat
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* YouTube Video & Lessons Management button */}
                    <button
                      onClick={() => openLessonManager(c)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Darslar & Video ({c.total_lessons || 0})</span>
                    </button>

                    {/* Pricing button */}
                    <button
                      onClick={() => {
                        setPricingCourse(c);
                        setPricingIsPaid(c.is_paid === 1);
                        setPricingAmount(c.price || 250000);
                        setPricingCoins(c.price_coins || 100);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Narx</span>
                    </button>

                    <button
                      onClick={() => navigate(`/courses/${c.id}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                      title="Ko'rish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition"
                      title="Arxivlash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Foydalanuvchilar Ro'yxati</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Ism yoki email..."
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none"
                />
                <button
                  onClick={fetchUsers}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Qidirish
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Foydalanuvchi</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">XP Ball</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                        {u.first_name} {u.last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{u.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-900 dark:text-white border-none outline-none"
                        >
                          <option value="student">student</option>
                          <option value="teacher">teacher</option>
                          <option value="admin">admin</option>
                          <option value="super_admin">super_admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{u.xp_points} XP</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_suspended === 1
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {u.is_suspended === 1 ? "To'xtatilgan" : 'Faol'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleUserSuspension(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            u.is_suspended === 1
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {u.is_suspended === 1 ? 'Faollashtirish' : "To'xtatish"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Certificates */}
        {activeTab === 'certificates' && (
          <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Berilgan Sertifikatlar Ro'yxati</h3>
            <div className="divide-y divide-gray-100 dark:border-gray-800 text-xs">
              {certificatesList.map((cert) => (
                <div key={cert.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                      {cert.id}
                    </span>
                    <strong className="text-gray-900 dark:text-white">{cert.student_name}</strong>
                    <p className="text-gray-500 mt-0.5">{cert.course_title} • {cert.issue_date?.slice(0, 10)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.is_revoked === 1 ? (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                        Bekor qilingan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevokeCertificate(cert.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                      >
                        Bekor qilish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: AI & System Settings */}
        {activeTab === 'ai' && (
          <div className="bg-white dark:bg-[#0B1020] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-500" />
                AI Model va Tizim Sozlamalari
              </h3>
              <p className="text-xs text-gray-500 mt-1">Sun'iy intellekt kvotalari va platforma xususiyatlari</p>
            </div>

            <div className="space-y-3">
              {settingsList.map((s) => (
                <div key={s.key} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{s.key}</p>
                    <p className="text-gray-400 text-[11px]">{s.description}</p>
                  </div>
                  <span className="font-mono font-bold px-3 py-1 rounded-xl bg-white dark:bg-gray-900 border text-indigo-600">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Course Pricing Modal */}
      {pricingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setPricingCourse(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Kurs Narxi va Holatini Sozlash
            </h3>
            <p className="text-xs text-gray-500 mb-5">{pricingCourse.title}</p>

            <form onSubmit={handleSavePricing} className="space-y-4">
              {/* Free vs Paid Toggle */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {pricingIsPaid ? "Pullik Kurs" : "Bepul Kurs"}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {pricingIsPaid
                      ? "O'quvchi to'lov so'rovi yuboradi va siz tasdiqlaysiz"
                      : "Har qanday foydalanuvchi to'g'ridan-to'g'ri boshlay oladi"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPricingIsPaid(!pricingIsPaid)}
                  className={`w-12 h-7 rounded-full p-1 transition duration-300 ease-in-out ${
                    pricingIsPaid ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ease-in-out ${
                      pricingIsPaid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {pricingIsPaid && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kurs Narxi (UZS)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={10000}
                      value={pricingAmount}
                      onChange={(e) => setPricingAmount(Number(e.target.value))}
                      placeholder="250000"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tangalar Narxi (🪙 Coin orqali ochish)
                </label>
                <div className="relative">
                  <span className="text-sm absolute left-3 top-2.5">🪙</span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10}
                    value={pricingCoins}
                    onChange={(e) => setPricingCoins(Number(e.target.value))}
                    placeholder="100"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  O'quvchilar darslarni o'qib to'plagan tangalari evaziga ushbu kursni ochishi mumkin (Masalan: 100 tanga).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPricingCourse(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={savingPricing}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {savingPricing ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Lessons & YouTube Video Manager Modal */}
      {lessonCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1020] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{lessonCourse.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                      YouTube Video Boshqaruvi
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Jami {courseLessons.length} ta dars • YouTube orqali video qo'shish va almashtirish
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLessonCourse(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Split into Lessons list (left) and Add/Edit Form (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 overflow-y-auto flex-1 pr-1">
              {/* Left Column: Existing Lessons */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Mavjud Darslar ({courseLessons.length})
                  </h4>
                  <button
                    onClick={resetLessonForm}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Yangi Dars Qo'shish
                  </button>
                </div>

                {loadingLessons ? (
                  <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                    Darslar yuklanmoqda...
                  </div>
                ) : courseLessons.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400 text-xs">
                    Bu kursda hali darslar yo'q. O'ng tarafdagi forma orqali YouTube darslik qo'shing!
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {courseLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className={`p-3.5 rounded-2xl border transition ${
                          editingLessonId === lesson.id
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40'
                            : 'border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                {lesson.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 mt-1">
                                <span>{lesson.duration_minutes || 15} daqiqa</span>
                                <a
                                  href={`/lessons/${lesson.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-bold"
                                >
                                  <Play className="w-2.5 h-2.5" />
                                  Darsni ko'rish
                                </a>
                                {lesson.video_url && (
                                  <a
                                    href={lesson.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    YouTube
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleGenerateAutoQuiz(lesson.id)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition"
                              title="Ushbu darsga 0-darajali savollarni biriktirish"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                            </button>
                            <button
                              onClick={() => startEditLesson(lesson)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Add / Edit Lesson with YouTube Embed */}
              <div className="lg:col-span-6 bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200 dark:border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span>{editingLessonId ? "Darsni Tahrirlash" : "Yangi Video Dars Qo'shish"}</span>
                  </h4>
                  {editingLessonId && (
                    <button
                      type="button"
                      onClick={resetLessonForm}
                      className="text-[11px] text-gray-500 hover:underline"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveLesson} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Dars Sarlavhasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Masalan: 1-Dars: Nemis Alifbosi va Tovushlar"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* YouTube Video URL input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        YouTube Video Havolasi (Link) <span className="text-red-500">*</span>
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
                    <input
                      type="text"
                      required
                      value={lessonVideoUrl}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setLessonVideoUrl(val);
                        if (val.trim().length > 10) {
                          try {
                            const meta = await fetchYouTubeMetadata(val);
                            if (meta?.title && (!lessonTitle.trim() || lessonTitle.startsWith('1-Dars') || lessonTitle.startsWith('Yangi'))) {
                              setLessonTitle(meta.title);
                            }
                          } catch {}
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=... yoki https://youtu.be/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />

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

                    <p className="text-[11px] text-gray-400 mt-1">
                      Istalgan YouTube formati avtomatik ravishda to'g'ri pleyer formatiga aylantiriladi.
                    </p>
                  </div>

                  {/* Interactive YouTube Preview */}
                  {previewEmbedUrl && (
                    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                        <span>Canli YouTube Video Ko'rinishi (Preview)</span>
                        <a
                          href={getYouTubeWatchUrl(lessonVideoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 font-bold flex items-center gap-1 hover:underline"
                        >
                          <span>YouTubeda to'liq ko'rish</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={previewEmbedUrl}
                          title="YouTube video preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Davomiyligi (daqiqa)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={lessonDuration}
                        onChange={(e) => setLessonDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none"
                      />
                    </div>

                    {courseModules.length > 0 && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Modul
                        </label>
                        <select
                          value={lessonModuleId}
                          onChange={(e) => setLessonModuleId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold outline-none"
                        >
                          {courseModules.map((m) => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Dars Tavsifi / Konspekti
                    </label>
                    <textarea
                      rows={2}
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      placeholder="Darsda o'rganiladigan asosiy tushunchalar..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingLesson}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {savingLesson
                        ? "Saqlanmoqda..."
                        : editingLessonId
                        ? "Videoni Yangilash"
                        : "Videoni Qo'shish va Saqlash"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
