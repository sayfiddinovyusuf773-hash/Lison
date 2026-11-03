import React, { useEffect, useState } from 'react';
import { Teacher } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Star, Users, Award, ArrowRight } from 'lucide-react';

interface TeacherShowcaseProps {
  navigate: (path: string) => void;
}

export const TeacherShowcase: React.FC<TeacherShowcaseProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('/api/teachers');
        const data = await res.json();
        if (data.success && data.teachers) {
          setTeachers(data.teachers);
        }
      } catch (err) {
        console.error('Failed to load teachers:', err);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-[#0E1426] border-t border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              Xalqaro Mutaxassislar
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
              Bizning Ustozlar
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-[#5A627A] dark:text-[#9DA6BD]">
              Oksford, Seul, Berlin va Moskva universitetlarida malaka oshirgan tajribali ustozlar
            </p>
          </div>
          <button
            onClick={() => navigate('/teachers')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#635BFF] dark:text-[#8B7CFF] hover:text-[#544BFF] transition cursor-pointer"
          >
            <span>Barcha ustozlarni ko'rish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teachers.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/teachers/${t.id}`)}
              className="group bg-white dark:bg-gray-800/80 rounded-3xl p-6 border border-gray-100 dark:border-gray-700/60 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative mb-5 rounded-2xl overflow-hidden h-60">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{t.rating.toFixed(2)}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                  {t.name}
                </h3>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">
                  {t.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed">
                  {t.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-primary-500" />
                  {t.total_students.toLocaleString()} o'quvchi
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {t.languages}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
