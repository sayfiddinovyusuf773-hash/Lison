import React from 'react';
import { Users, BookOpen, Award, Globe, Flame } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Faol O\'rganuvchilar', value: '52,000+', icon: Users, color: 'text-[#635BFF]' },
    { label: 'Interaktiv Darslar', value: '150+', icon: BookOpen, color: 'text-emerald-400' },
    { label: 'Jahon Tillari', value: '12 xil', icon: Globe, color: 'text-[#8B7CFF]' },
    { label: 'Berilgan Sertifikatlar', value: '8,900+', icon: Award, color: 'text-amber-400' }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#0B1020] via-[#13192B] to-[#0B1020] text-white border-y border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-2">
                  <Icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
