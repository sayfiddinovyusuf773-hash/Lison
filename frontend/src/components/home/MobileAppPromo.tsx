import React from 'react';
import { Smartphone, Download, CheckCircle, Apple } from 'lucide-react';

export const MobileAppPromo: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#0E1426] border-t border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-[#0B1020] via-[#17203A] to-[#251A4A] p-8 sm:p-12 lg:p-16 text-white shadow-2xl border border-[#635BFF]/30">
          {/* Radial blur */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
                <Smartphone className="w-4 h-4" />
                Istalgan Joyda, Istalgan Vaqtda
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                LISON Mobil Ilovasi
              </h2>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-xl">
                Darslarni yo'lda, metroda yoki dam olish paytida oflayn yuklab olib o'rganing. Kunlik eslatmalar va AI suhbat doimo cho'ntagingizda.
              </p>

              <div className="space-y-2 pt-2 text-xs sm:text-sm text-gray-300">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Videolarni oflayn ko'rish uchun yuklab olish
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Ovozli darslar va interaktiv kartochkalar
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Kunlik maqsad va olov (streak) eslatmalari
                </p>
              </div>

              {/* App store buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => alert("LISON mobil ilovasi Google Play Marketda yaqin kunlarda taqdim etiladi!")}
                  className="px-5 py-3 rounded-2xl bg-white text-gray-900 font-bold text-xs flex items-center gap-3 hover:bg-gray-100 transition shadow-lg"
                >
                  <Download className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-500 uppercase font-semibold leading-none">Yuklab oling</p>
                    <p className="text-xs font-extrabold leading-tight">Google Play</p>
                  </div>
                </button>

                <button
                  onClick={() => alert("LISON mobil ilovasi App Store da yaqin kunlarda taqdim etiladi!")}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-3 border border-white/20 transition shadow-lg"
                >
                  <Apple className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-[9px] text-gray-300 uppercase font-semibold leading-none">Yuklab oling</p>
                    <p className="text-xs font-extrabold leading-tight">App Store</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-96 rounded-[2.5rem] bg-gray-950 p-3 shadow-2xl border-4 border-gray-800">
                <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-900 relative">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"
                    alt="Mobile App"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent p-5 flex flex-col justify-end">
                    <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] font-bold w-max mb-1">
                      LISON App
                    </span>
                    <p className="text-xs font-bold text-white">Ingliz tili A1 darsi</p>
                    <p className="text-[10px] text-emerald-400">Streak: 7 kun 🔥</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
