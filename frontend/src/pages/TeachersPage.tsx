import React, { useEffect, useState } from 'react';
import { Teacher } from '../types';
import { Users, Star, BookOpen, Award, ArrowRight } from 'lucide-react';

interface TeachersPageProps {
  navigate: (path: string) => void;
}

export const TeachersPage: React.FC<TeachersPageProps> = ({ navigate }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/teachers');
        const data = await res.json();
        if (data.success && data.teachers) {
          setTeachers(data.teachers);
        }
      } catch (err) {
        console.error('Fetch teachers error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen py-12 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            Ustozlar Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Tajribali va Xalqaro Malakali O'qituvchilar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Har bir darslik zamonaviy pedagogik metodika va xalqaro imtihon (IELTS, CEFR, TOPIK, Goethe) talablariga mos ishlab chiqilgan.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{t.rating.toFixed(2)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">
                    {t.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                    {t.bio}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    O'rgatadigan tillari: {t.languages}
                  </span>
                  <button
                    onClick={() => navigate(`/courses?teacher_id=${t.id}`)}
                    className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-xl transition"
                    title="Ustoz kurslarini ko'rish"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
