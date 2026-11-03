import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  Award,
  CheckCircle,
  Star,
  Bot,
  Volume2,
  Mic,
  Flame,
  Globe2,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface HeroSectionProps {
  navigate: (path: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      openAuthModal('register');
    }
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-28 bg-[#F7F8FC] dark:bg-[#0B1020] transition-colors duration-300">
      {/* Cinematic Ambient Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-br from-[#635BFF]/15 via-[#8B7CFF]/10 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-[#8B7CFF]/15 via-[#635BFF]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Small Label Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#12182B] shadow-sm border border-[#E6E8F0] dark:border-[#1F2840]">
              <span className="flex h-2 w-2 rounded-full bg-[#635BFF] animate-ping" />
              <span className="text-[11px] font-black tracking-widest uppercase text-[#635BFF] dark:text-[#8B7CFF]">
                AI-POWERED LANGUAGE LEARNING
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#171A2B] dark:text-[#F7F8FC] leading-[1.12]">
              Yangi til. <br />
              <span className="brand-gradient-text">
                Yangi imkoniyatlar.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#5A627A] dark:text-[#9DA6BD] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              LISON bilan dunyo tillarini o‘rganing. AI yordamida bilimlaringizni rivojlantiring va kelajagingizni kengaytiring.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#635BFF] via-[#756BFF] to-[#8B7CFF] hover:from-[#544BFF] hover:to-[#7A6BFF] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-[#635BFF]/25 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/courses')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-[#12182B] hover:bg-gray-50 dark:hover:bg-[#1A223B] text-[#171A2B] dark:text-[#F7F8FC] font-bold text-sm sm:text-base rounded-xl border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-[#635BFF] dark:text-[#8B7CFF]" />
                <span>Kurslarni ko‘rish</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-4 border-t border-[#E6E8F0] dark:border-[#1F2840] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5A627A] dark:text-[#9DA6BD]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-[#171A2B] dark:text-[#E2E8F0]">100% Ochiq va Bepul</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-[#171A2B] dark:text-[#E2E8F0]">Davlat Standartidagi Sertifikat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-[#171A2B] dark:text-[#E2E8F0]">24/7 AI Ustoz</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D-Inspired Language Learning Composition */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Floating Language Symbol Badges */}
              <div className="absolute -top-4 left-6 z-20 px-3 py-1.5 rounded-full bg-white dark:bg-[#12182B] shadow-md border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2 animate-float text-xs font-bold text-[#171A2B] dark:text-[#F7F8FC]">
                <span className="text-base">🇬🇧</span>
                <span>EN • Fluent</span>
              </div>

              <div className="absolute -top-2 right-4 z-20 px-3 py-1.5 rounded-full bg-white dark:bg-[#12182B] shadow-md border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2 animate-float-reverse text-xs font-bold text-[#171A2B] dark:text-[#F7F8FC]">
                <span className="text-base">🇰🇷</span>
                <span>한글 • A1</span>
              </div>

              <div className="absolute top-1/2 -left-6 z-20 px-3 py-1.5 rounded-full bg-white dark:bg-[#12182B] shadow-md border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-1.5 animate-float text-xs font-bold text-[#171A2B] dark:text-[#F7F8FC]">
                <span className="text-base">🇸🇦</span>
                <span>العربية</span>
              </div>

              {/* Main Card: Interactive AI Tutor & Course Progress */}
              <div className="relative z-10 rounded-3xl overflow-hidden bg-white dark:bg-[#12182B] p-6 shadow-2xl shadow-indigo-950/10 dark:shadow-black/40 border border-[#E6E8F0] dark:border-[#1F2840] space-y-5">
                {/* Header of Visual */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0] dark:border-[#1F2840]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B7CFF] text-white flex items-center justify-center shadow-md shadow-[#635BFF]/30">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#171A2B] dark:text-white flex items-center gap-1.5">
                        LISON AI Ustoz
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </h4>
                      <p className="text-[10px] text-[#5A627A] dark:text-[#9DA6BD]">Jonli Nutq & Grammatika Tahlili</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Faol
                  </span>
                </div>

                {/* Simulated Live AI Audio Wave Interaction */}
                <div className="p-3.5 rounded-2xl bg-[#F7F8FC] dark:bg-[#0B1020] border border-[#E6E8F0]/70 dark:border-[#1F2840]/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#171A2B] dark:text-[#F7F8FC]">
                    <span className="flex items-center gap-1.5 text-[#635BFF] dark:text-[#8B7CFF]">
                      <Mic className="w-3.5 h-3.5" />
                      Ovozli Mashq (Speaking)
                    </span>
                    <span className="text-[10px] text-emerald-500 font-extrabold">98% Aniqlik</span>
                  </div>

                  {/* Dynamic Sound Wave Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-7">
                    <span className="w-1 rounded-full bg-[#635BFF] wave-bar-1" />
                    <span className="w-1 rounded-full bg-[#8B7CFF] wave-bar-2" />
                    <span className="w-1 rounded-full bg-[#635BFF] wave-bar-3" />
                    <span className="w-1 rounded-full bg-[#8B7CFF] wave-bar-4" />
                    <span className="w-1 rounded-full bg-[#635BFF] wave-bar-5" />
                    <span className="w-1 rounded-full bg-[#8B7CFF] wave-bar-2" />
                    <span className="w-1 rounded-full bg-[#635BFF] wave-bar-1" />
                  </div>

                  <p className="text-[11px] text-[#5A627A] dark:text-[#9DA6BD] italic text-center">
                    "I am practicing English fluency with LISON AI tutor every day."
                  </p>
                </div>

                {/* Course Card Preview: General English B2 */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#151D33] border border-[#E6E8F0] dark:border-[#1F2840]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200"
                    alt="Course Preview"
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF]">
                        Ingliz tili (B2)
                      </span>
                      <span className="text-[10px] font-bold text-[#635BFF] dark:text-[#8B7CFF]">85%</span>
                    </div>
                    <p className="text-xs font-bold text-[#171A2B] dark:text-white truncate mt-0.5">
                      Speaking & Professional Communication
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-gradient-to-r from-[#635BFF] to-[#8B7CFF] rounded-full w-[85%]" />
                    </div>
                  </div>
                </div>

                {/* Student Trust Avatars + Rating */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <img className="w-7 h-7 rounded-full border-2 border-white dark:border-[#12182B]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Student" />
                      <img className="w-7 h-7 rounded-full border-2 border-white dark:border-[#12182B]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Student" />
                      <img className="w-7 h-7 rounded-full border-2 border-white dark:border-[#12182B]" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" alt="Student" />
                      <div className="w-7 h-7 rounded-full bg-[#635BFF] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-[#12182B]">
                        +50k
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#5A627A] dark:text-[#9DA6BD]">O'quvchi</span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-amber-500 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.98 (4.2k baho)</span>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Pill: QR Certificate */}
              <div className="absolute -bottom-4 -left-4 z-20 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#12182B] shadow-xl border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2.5 animate-float-reverse">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#171A2B] dark:text-white">QR Sertifikat</p>
                  <p className="text-[9px] text-[#5A627A] dark:text-[#9DA6BD]">Rasmiy tekshiriluvchi</p>
                </div>
              </div>

              {/* Floating Bottom-Right Pill: Daily Streak */}
              <div className="absolute -bottom-5 -right-3 z-20 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#12182B] shadow-xl border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2.5 animate-float">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#171A2B] dark:text-white">7 Kunlik Streak!</p>
                  <p className="text-[9px] text-emerald-500 font-semibold">+150 Bonus XP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
