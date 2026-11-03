import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LanguageGridProps {
  navigate: (path: string) => void;
}

export const LanguageGrid: React.FC<LanguageGridProps> = ({ navigate }) => {
  const { t } = useLanguage();

  const languages = [
    { name: 'English', native: 'Ingliz tili', flag: '🇬🇧', learners: '24,500+', courses: '12 ta kurs', color: 'from-blue-500/20 to-indigo-500/20' },
    { name: 'Russian', native: 'Rus tili', flag: '🇷🇺', learners: '22,100+', courses: '10 ta kurs', color: 'from-red-500/20 to-blue-500/20' },
    { name: 'Korean', native: 'Koreys tili', flag: '🇰🇷', learners: '19,800+', courses: '8 ta kurs', color: 'from-pink-500/20 to-rose-500/20' },
    { name: 'Arabic', native: 'Arab tili', flag: '🇸🇦', learners: '14,300+', courses: '7 ta kurs', color: 'from-emerald-500/20 to-teal-500/20' },
    { name: 'Turkish', native: 'Turk tili', flag: '🇹🇷', learners: '13,900+', courses: '6 ta kurs', color: 'from-red-500/20 to-orange-500/20' },
    { name: 'German', native: 'Nemis tili', flag: '🇩🇪', learners: '11,200+', courses: '6 ta kurs', color: 'from-amber-500/20 to-yellow-500/20' },
    { name: 'Uzbek', native: 'O\'zbek tili', flag: '🇺🇿', learners: '6,800+', courses: '4 ta kurs', color: 'from-cyan-500/20 to-blue-500/20' },
    { name: 'Japanese', native: 'Yapon tili', flag: '🇯🇵', learners: '9,400+', courses: '5 ta kurs', color: 'from-red-500/20 to-rose-500/20' },
    { name: 'Spanish', native: 'Ispan tili', flag: '🇪🇸', learners: '7,600+', courses: '4 ta kurs', color: 'from-yellow-500/20 to-red-500/20' },
    { name: 'French', native: 'Fransuz tili', flag: '🇫🇷', learners: '6,200+', courses: '4 ta kurs', color: 'from-blue-500/20 to-indigo-500/20' },
    { name: 'Chinese', native: 'Xitoy tili', flag: '🇨🇳', learners: '8,100+', courses: '5 ta kurs', color: 'from-red-500/20 to-amber-500/20' }
  ];

  return (
    <section className="py-20 bg-[#F7F8FC] dark:bg-[#0B1020] border-y border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            10 dan ortiq jahon tillari
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
            {t('lang.section_title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5A627A] dark:text-[#9DA6BD]">
            {t('lang.section_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.name}
              onClick={() => navigate(`/courses?lang=${lang.name}`)}
              className="group relative p-5 bg-white dark:bg-[#12182B] rounded-2xl border border-[#E6E8F0] dark:border-[#1F2840] hover:border-[#635BFF]/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{lang.flag}</div>
              <h3 className="text-sm font-bold text-[#171A2B] dark:text-white group-hover:text-[#635BFF] dark:group-hover:text-[#8B7CFF] transition">
                {lang.native}
              </h3>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] mt-0.5">{lang.name}</p>
              <div className="mt-4 pt-3 border-t border-[#E6E8F0] dark:border-[#1F2840] flex items-center justify-between text-[11px] font-medium text-[#5A627A] dark:text-[#9DA6BD]">
                <span>{lang.learners}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#635BFF] group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
