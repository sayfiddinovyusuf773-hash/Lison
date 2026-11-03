import React from 'react';
import { Award, Flame, Zap, BookOpen, Mic, GraduationCap, ArrowRight } from 'lucide-react';

interface AchievementsSectionProps {
  navigate: (path: string) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ navigate }) => {
  const achievements = [
    { title: 'Birinchi Qadam', xp: '+50 XP', icon: Award, color: 'from-blue-500 to-indigo-600', desc: 'Birinchi video darsni yakunlash' },
    { title: '7 Kunlik Olov', xp: '+150 XP', icon: Flame, color: 'from-amber-500 to-orange-600', desc: 'Hafta davomida uzluksiz o\'qish' },
    { title: 'Test Chempioni', xp: '+100 XP', icon: Zap, color: 'from-emerald-500 to-teal-600', desc: '90%+ natija bilan testni yechish' },
    { title: 'Lug\'at Boyligi', xp: '+100 XP', icon: BookOpen, color: 'from-purple-500 to-pink-600', desc: '100 ta yangi so\'zni o\'zlashtirish' },
    { title: 'Nutq Notig\'i', xp: '+150 XP', icon: Mic, color: 'from-cyan-500 to-blue-600', desc: '5 ta speaking mavzusini topshirish' },
    { title: 'Kurs Bitiruvchisi', xp: '+500 XP', icon: GraduationCap, color: 'from-rose-500 to-red-600', desc: 'Sertifikatga ega bo\'lish' }
  ];

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" />
            Gamifikatsiya va Rag'bat
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Har Bir Qadamingiz Uchun Mukofot
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Darslarni tamomlab XP jamg'aring, reytingda yuqorilang va o'rganishni o'yin kabi qiziqarli mashg'ulotga aylantiring.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((a, idx) => {
            const Icon = a.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-center flex flex-col items-center justify-between hover:shadow-lg transition group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${a.color} text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {a.title}
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  {a.desc}
                </p>
                <span className="mt-3 px-2 py-0.5 rounded-full bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">
                  {a.xp}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/leaderboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl border border-gray-200 dark:border-gray-700 transition"
          >
            <span>Platforma umumiy reytingini ko'rish</span>
            <ArrowRight className="w-4 h-4 text-primary-500" />
          </button>
        </div>
      </div>
    </section>
  );
};
