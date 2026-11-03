import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Bot, Layers, Award, CheckCircle, Zap } from 'lucide-react';

export const LearningBenefits: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Sparkles,
      title: t('benefits.b1_title'),
      description: t('benefits.b1_desc'),
      tag: 'Barchaga Teng Imkoniyat',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Bot,
      title: t('benefits.b2_title'),
      description: t('benefits.b2_desc'),
      tag: 'Real-vaqt Tahlili',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Layers,
      title: t('benefits.b3_title'),
      description: t('benefits.b3_desc'),
      tag: '8 Xil Mashq Turlari',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: Award,
      title: t('benefits.b4_title'),
      description: t('benefits.b4_desc'),
      tag: 'Haqiqiylik Himoyasi',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#0E1426] border-t border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5" />
            Afzalliklarimiz
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
            {t('benefits.title')}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5A627A] dark:text-[#9DA6BD]">
            {t('benefits.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="relative p-7 bg-[#F7F8FC] dark:bg-[#12182B] rounded-2xl border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${b.color} text-white flex items-center justify-center shadow-md mb-5 group-hover:scale-105 transition duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF] dark:text-[#8B7CFF] bg-[#635BFF]/10 px-2 py-0.5 rounded-md">
                    {b.tag}
                  </span>
                  <h3 className="text-base font-bold text-[#171A2B] dark:text-white mt-2.5">
                    {b.title}
                  </h3>
                  <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] mt-2 leading-relaxed font-normal">
                    {b.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Kafolatlangan sifat</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
