import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Star,
  Clock,
  BookOpen,
  ArrowRight,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  X,
  Play
} from 'lucide-react';

interface CoursesPageProps {
  navigate: (path: string) => void;
  initialLang?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ navigate, initialLang }) => {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('lison_cached_all_courses');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => courses.length === 0);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('popularity');

  const languagesList = [
    { id: 'all', label: 'Barcha yo\'nalishlar', flag: '🌐' },
    { id: 'IT & AI', label: 'IT & Sun\'iy Intellekt', flag: '🤖' },
    { id: 'English', label: 'Ingliz tili', flag: '🇬🇧' },
    { id: 'Russian', label: 'Rus tili', flag: '🇷🇺' },
    { id: 'Korean', label: 'Koreys tili', flag: '🇰🇷' },
    { id: 'Arabic', label: 'Arab tili', flag: '🇸🇦' },
    { id: 'German', label: 'Nemis tili', flag: '🇩🇪' },
    { id: 'Uzbek', label: 'O\'zbek tili', flag: '🇺🇿' },
    { id: 'Turkish', label: 'Turk tili', flag: '🇹🇷' },
    { id: 'Japanese', label: 'Yapon tili', flag: '🇯🇵' },
    { id: 'Spanish', label: 'Ispan tili', flag: '🇪🇸' },
    { id: 'French', label: 'Fransuz tili', flag: '🇫🇷' },
    { id: 'Chinese', label: 'Xitoy tili', flag: '🇨🇳' }
  ];

  const levelsList = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const fetchCourses = async () => {
    if (courses.length === 0) setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let url = `/api/courses?sort=${selectedSort}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedLanguage !== 'all') url += `&language=${encodeURIComponent(selectedLanguage)}`;
      if (selectedLevel !== 'all') url += `&level=${encodeURIComponent(selectedLevel)}`;

      const res = await fetch(url, { headers, signal: controller.signal });
      const data = await res.json();
      if (data.success && data.courses) {
        setCourses(data.courses);
        if (selectedLanguage === 'all' && selectedLevel === 'all' && !search.trim()) {
          localStorage.setItem('lison_cached_all_courses', JSON.stringify(data.courses));
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Fetch courses error:', err);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedLanguage, selectedLevel, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnrollOrOpen = async (course: Course) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    navigate(`/courses/${course.id}`);
  };

  const handleWishlistToggle = async (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch(`/api/courses/${courseId}/wishlist`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, is_wishlist: data.is_wishlist } : c))
        );
      }
    } catch {
      // ignore
    }
  };

  const getLanguageTheme = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'english':
        return { badge: 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF]', flag: '🇬🇧' };
      case 'korean':
        return { badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', flag: '🇰🇷' };
      case 'arabic':
        return { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', flag: '🇸🇦' };
      case 'german':
        return { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', flag: '🇩🇪' };
      case 'russian':
        return { badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', flag: '🇷🇺' };
      case 'uzbek':
        return { badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', flag: '🇺🇿' };
      default:
        return { badge: 'bg-[#8B7CFF]/10 text-[#8B7CFF]', flag: '🌐' };
    }
  };

  return (
    <div className="min-h-screen py-10 bg-[#F7F8FC] dark:bg-[#0B1020] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            Kurslar Katalogi
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
            Xalqaro Tillarni O'rganish Kurslari
          </h1>
          <p className="text-sm sm:text-base text-[#5A627A] dark:text-[#9DA6BD] max-w-2xl font-normal">
            Barcha kurslar noldan boshlab bosqichma-bosqich o'rgatiladi, interaktiv darsliklar va sun'iy intellektli repetitor bilan ta'minlangan.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-[#12182B] rounded-2xl p-5 shadow-sm border border-[#E6E8F0] dark:border-[#1F2840] space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('courses.search_placeholder') || 'Kurs nomi yoki til bo\'yicha qidirish...'}
              className="w-full pl-11 pr-24 py-3 bg-[#F7F8FC] dark:bg-[#0E1426] border border-[#E6E8F0] dark:border-[#1F2840] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#635BFF] text-[#171A2B] dark:text-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); fetchCourses(); }}
                className="absolute right-12 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 px-3.5 py-1.5 bg-[#635BFF] hover:bg-[#544BFF] text-white text-xs font-bold rounded-lg transition"
            >
              Qidirish
            </button>
          </form>

          {/* Language horizontal pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {languagesList.map((lang) => {
              const active = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#635BFF] text-white shadow-sm'
                      : 'bg-[#F7F8FC] dark:bg-[#1A223B] text-[#5A627A] dark:text-[#9DA6BD] hover:text-[#171A2B] dark:hover:text-white border border-[#E6E8F0] dark:border-[#1F2840]'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>

          {/* Level & Sort Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E6E8F0] dark:border-[#1F2840]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5A627A] dark:text-[#9DA6BD]">Daraja:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {levelsList.map((lvl) => {
                  const active = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        active
                          ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] border border-[#635BFF]/30'
                          : 'text-[#5A627A] dark:text-[#9DA6BD] hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {lvl === 'all' ? 'Barchasi' : lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5A627A] dark:text-[#9DA6BD]">Saralash:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] text-xs font-semibold text-[#171A2B] dark:text-white border border-[#E6E8F0] dark:border-[#1F2840] outline-none focus:ring-2 focus:ring-[#635BFF]"
              >
                <option value="popularity">Ommabop</option>
                <option value="newest">Yangi qo'shilgan</option>
                <option value="rating">Reyting bo'yicha</option>
                <option value="difficulty_asc">Qiyinlik (A1-C2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-white dark:bg-[#12182B] animate-pulse border border-[#E6E8F0] dark:border-[#1F2840]" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#12182B] rounded-2xl border border-[#E6E8F0] dark:border-[#1F2840] p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-[#171A2B] dark:text-white">Hech qanday kurs topilmadi</h3>
            <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD]">Boshqa kalit so'z yoki til filtri orqali qidirib ko'ring.</p>
            <button
              onClick={() => { setSelectedLanguage('all'); setSelectedLevel('all'); setSearch(''); }}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#635BFF] rounded-xl hover:bg-[#544BFF] transition cursor-pointer"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const langTheme = getLanguageTheme(course.language);
              const isEnrolled = course.is_enrolled || (course.progress_percent && course.progress_percent > 0);

              return (
                <div
                  key={course.id}
                  onClick={() => handleEnrollOrOpen(course)}
                  className="group flex flex-col bg-white dark:bg-[#12182B] rounded-2xl overflow-hidden border border-[#E6E8F0] dark:border-[#1F2840] hover:border-[#635BFF]/40 dark:hover:border-[#8B7CFF]/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* Cover Image & Overlay */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Language & Level Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg shadow-sm flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 text-[#171A2B] dark:text-white backdrop-blur-md">
                        <span>{langTheme.flag}</span>
                        <span>{course.language}</span>
                      </span>
                      <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#635BFF] text-white shadow-sm">
                        {course.level}
                      </span>
                    </div>

                    {/* Bookmark Icon Button */}
                    <button
                      onClick={(e) => handleWishlistToggle(e, course.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          course.is_wishlist ? 'fill-amber-400 text-amber-400' : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Duration / Lessons on bottom of image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                      <span className="flex items-center gap-1 opacity-90">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.total_lessons} dars
                      </span>
                      <span className="flex items-center gap-1 opacity-90">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_hours || 10} soat
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[11px] text-[#5A627A] dark:text-[#9DA6BD]">
                          {course.enrollment_count || 0} o'quvchi
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#171A2B] dark:text-white group-hover:text-[#635BFF] dark:group-hover:text-[#8B7CFF] transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#E6E8F0] dark:border-[#1F2840]">
                      {/* Teacher details */}
                      {course.teacher_name && (
                        <div className="flex items-center gap-2">
                          <img
                            src={course.teacher_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.teacher_name)}&background=635BFF&color=fff`}
                            alt={course.teacher_name}
                            className="w-6 h-6 rounded-full object-cover border border-[#E6E8F0] dark:border-[#1F2840]"
                          />
                          <span className="text-xs font-medium text-[#5A627A] dark:text-[#9DA6BD] truncate">
                            {course.teacher_name}
                          </span>
                        </div>
                      )}

                      {/* Progress Bar if Enrolled */}
                      {isEnrolled && typeof course.progress_percent === 'number' && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-[#5A627A] dark:text-[#9DA6BD]">
                            <span>O'zlashtirish</span>
                            <span className="text-[#635BFF] dark:text-[#8B7CFF] font-bold">{course.progress_percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E6E8F0] dark:bg-[#1F2840] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#635BFF] to-[#8B7CFF] rounded-full transition-all duration-500"
                              style={{ width: `${course.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Pricing or Coin Pill if Paid and Not Enrolled */}
                      {!isEnrolled && course.is_paid === 1 && (
                        <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 rounded-xl">
                          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Ochish narxi:</span>
                          <span className="font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            🪙 {course.price_coins || 100} Coin
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnrollOrOpen(course);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                          isEnrolled
                            ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] hover:bg-[#635BFF] hover:text-white'
                            : course.is_paid
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black shadow-md shadow-amber-500/20'
                            : 'bg-[#F7F8FC] dark:bg-[#1A223B] text-[#171A2B] dark:text-white hover:bg-[#635BFF] hover:text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {isEnrolled ? 'Davom ettirish' : course.is_paid ? `🪙 ${course.price_coins || 100} Coin bilan ochish` : 'Kursni boshlash'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
