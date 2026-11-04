import React, { useEffect, useState } from 'react';
import { Course } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Star, Clock, BookOpen, ArrowRight, Bookmark, Play, CheckCircle } from 'lucide-react';

interface PopularCoursesProps {
  navigate: (path: string) => void;
}

export const PopularCourses: React.FC<PopularCoursesProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const cached = localStorage.getItem('lison_cached_popular_courses');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => courses.length === 0);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/courses?sort=popularity', {
          headers,
          signal: controller.signal
        });
        const data = await res.json();
        if (data.success && data.courses) {
          const top4 = data.courses.slice(0, 4);
          setCourses(top4);
          localStorage.setItem('lison_cached_popular_courses', JSON.stringify(top4));
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Failed to fetch popular courses:', err);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchCourses();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const handleCourseAction = (course: Course) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    navigate(`/courses/${course.id}`);
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
      default:
        return { badge: 'bg-[#8B7CFF]/10 text-[#8B7CFF]', flag: '🌐' };
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-[#0E1426] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold mb-2.5">
              <span>★</span> Ommabop Kurslar
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
              {t('courses.popular_title')}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#5A627A] dark:text-[#9DA6BD]">
              {t('courses.popular_subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#635BFF] dark:text-[#8B7CFF] hover:text-[#544BFF] transition cursor-pointer group"
          >
            <span>{t('courses.all_courses')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-[#F7F8FC] dark:bg-[#12182B] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => {
              const langTheme = getLanguageTheme(course.language);
              const isEnrolled = course.is_enrolled || (course.progress_percent && course.progress_percent > 0);

              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseAction(course)}
                  className="group flex flex-col bg-white dark:bg-[#12182B] rounded-2xl overflow-hidden border border-[#E6E8F0] dark:border-[#1F2840] hover:border-[#635BFF]/40 dark:hover:border-[#8B7CFF]/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* Course Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Language and Level Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg shadow-sm flex items-center gap-1 bg-white/95 dark:bg-gray-900/95 text-[#171A2B] dark:text-white backdrop-blur-md`}>
                        <span>{langTheme.flag}</span>
                        <span>{course.language}</span>
                      </span>
                      <span className="px-2 py-1 text-[10px] font-bold rounded-lg bg-[#635BFF] text-white shadow-sm">
                        {course.level}
                      </span>
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>

                    {/* Duration / Lessons on bottom of image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                      <span className="flex items-center gap-1 opacity-90">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.total_lessons} {t('courses.lessons')}
                      </span>
                      <span className="flex items-center gap-1 opacity-90">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_hours || 10} {t('courses.hours')}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#171A2B] dark:text-white group-hover:text-[#635BFF] dark:group-hover:text-[#8B7CFF] transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] mt-1.5 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[#E6E8F0] dark:border-[#1F2840]">
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

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseAction(course);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                          isEnrolled
                            ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] hover:bg-[#635BFF] hover:text-white'
                            : 'bg-[#F7F8FC] dark:bg-[#1A223B] text-[#171A2B] dark:text-white hover:bg-[#635BFF] hover:text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isEnrolled ? 'Davom ettirish' : 'Kursni boshlash'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
