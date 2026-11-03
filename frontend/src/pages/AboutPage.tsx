import React from 'react';
import { Sparkles, Heart, ShieldCheck, Globe, GraduationCap, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen py-16 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Bizning Missiya
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            LISON — Har Bir Til Yangi Imkoniyat
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Har bir o'zbek yoshi uchun dunyo eshiklarini ochuvchi, xalqaro tillarni bepul, qulay va sun'iy intellekt texnologiyalari bilan o'rgatuvchi zamonaviy platforma.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ta'lim — Jamiyat Najoti va Ilm Chirog'i
          </h2>
          <p>
            LISON ta'lim konsepsiyasi O'zbekiston yoshlariga jahonning eng ilg'or tillarini (ingliz, rus, nemis, arab, koreys, turk, yapon, ispan va boshqalar) xalqaro ta'lim standartlariga asosan bepul yetkazish maqsadida yaratilgan.
          </p>
          <p>
            Biz darsliklarni shunchaki passiv video sifatida emas, balki real vaqtda talabaning ovozini tahlil qiluvchi (Speaking Studio), xatolarini muloyimlik bilan tushuntiruvchi (LISON AI Teacher), 8 xil interaktiv mashqlar va serverda tasdiqlanuvchi rasmiy QR-kodli sertifikatlar bilan boyitdik.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Teng Imkoniyat</h4>
                <p className="text-xs text-gray-500 mt-0.5">Viloyat va qishloqlardagi yoshlar uchun poytaxt va xorijdagi eng kuchli ustozlar darslari.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">AI Texnologiyalari</h4>
                <p className="text-xs text-gray-500 mt-0.5">Dual-engine sun'iy intellekt grammatika va nutq talaffuzini soniyalarda baholaydi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Reliability */}
        <div className="bg-gradient-to-tr from-primary-900 via-indigo-900 to-gray-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h3 className="text-xl font-bold">Xavfsizlik va Ma'lumotlar Maxfiyligi</h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Platforma barcha kiberxavfsizlik talablariga muvofiq, foydalanuvchilar parollari kriptografik (bcrypt) xeshlanishi, sessiyalar JWT tokenlar orqali himoyalanganligi hamda test natijalari soxtalashtirilishining oldi olingan mustahkam server arxitekturasi asosida qurilgan.
          </p>
        </div>
      </div>
    </div>
  );
};
