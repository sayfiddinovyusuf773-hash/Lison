import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'LISON platformasidagi darslar haqiqatan ham bepulmi?',
      a: 'Ha, LISON ta\'lim platformasidagi barcha asosiy video darslar, mashg\'ulotlar, AI yordamchi va testlar barcha o\'zbek yoshlari hamda o\'rganuvchilar uchun 100% ochiq va bepul taqdim etiladi.'
    },
    {
      q: 'Kursni tamomlagach qanday sertifikat beriladi?',
      a: 'Kursning barcha modullarini muvaffaqiyatli yakunlab, yakuniy mustahkamlash testini belgilangan foizda (masalan, 75%+) topshirganingizdan so\'ng, unikal seriya raqami va QR-kodi bo\'lgan rasmiy elektron sertifikat avtomatik yaratiladi.'
    },
    {
      q: 'AI Ustoz (Sun\'iy Intellekt) qanday yordam beradi?',
      a: 'AI Ustoz 24/7 rejimida siz yuborgan jumlalardagi grammatik xatolarni topib tushuntiradi, talaffuzingizni baholaydi, yangi so\'zlarni eslab qolishga ko\'maklashadi va tanlangan tilda jonli muloqot qiladi.'
    },
    {
      q: 'Platforma telefon yoki planshetda qulay ishlaydimi?',
      a: 'Albatta! LISON veb-platformasi to\'liq moslashuvchan (responsive) qilib ishlab chiqilgan bo\'lib, har qanday smartfon, planshet yoki kompyuter ekranida qulay va tezkor ishlaydi.'
    },
    {
      q: 'Agar darsni yarimda to\'xtatib chiqib ketsam, natijam saqlanadimi?',
      a: 'Ha, har bir dars bo\'yicha videoning to\'xtagan soniyasi, yozib olgan shaxsiy eslatmalaringiz va yechilgan test natijalari avtomatik tarzda serverga saqlab boriladi. Qaytib kelganingizda darsni aynan to\'xtagan joyidan davom ettirasiz.'
    }
  ];

  return (
    <section className="py-24 bg-gray-50/50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Ko'p So'raladigan Savollar
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Savollaringizga Javoblar
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Platformadan foydalanish, darslar va sertifikatlar bo'yicha eng muhim ma'lumotlar
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-primary-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
