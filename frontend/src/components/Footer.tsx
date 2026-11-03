import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BRAND } from '../config/brand';
import { LisonLogo } from './brand/LisonLogo';
import { ShieldCheck, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-[#0B1020] border-t border-[#E6E8F0] dark:border-[#1F2840] pt-12 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 1. LISON Brand */}
          <div className="lg:col-span-2 space-y-3">
            <div className="cursor-pointer group inline-block" onClick={() => navigate('/')}>
              <LisonLogo size="md" showTagline={false} />
            </div>
            <p className="text-xs font-semibold text-[#635BFF] dark:text-[#8B7CFF]">
              "{BRAND.tagline}"
            </p>
            <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] max-w-sm leading-relaxed">
              O'zbekiston yoshlari va jahon tillarini o'rganuvchilar uchun zamonaviy, xavfsiz va sun'iy intellektga asoslangan milliy ta'lim platformasi.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#5A627A] dark:text-[#9DA6BD] pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#635BFF]" /> Toshkent sh., O'zbekiston
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#635BFF]" /> {BRAND.supportEmail}
              </span>
            </div>
          </div>

          {/* 2. Platforma */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A2B] dark:text-white">
              Platforma
            </h4>
            <ul className="space-y-2 text-xs text-[#5A627A] dark:text-[#9DA6BD]">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  {t('nav.home') || 'Asosiy'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  {t('nav.courses') || 'Kurslar'}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ai-teacher')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer flex items-center gap-1.5">
                  <span>{t('nav.ai_teacher') || 'AI Ustoz'}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF]">AI</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/speaking')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  Nutq Studiyasi
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/stats')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  Statistika & Reyting
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Kurslar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A2B] dark:text-white">
              Kurslar
            </h4>
            <ul className="space-y-2 text-xs text-[#5A627A] dark:text-[#9DA6BD]">
              <li>
                <button onClick={() => navigate('/courses?lang=English')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇬🇧 Ingliz tili (A1-C1)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?lang=Korean')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇰🇷 Koreys tili (Hangul)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?lang=Russian')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇷🇺 Rus tili
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?lang=Arabic')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇸🇦 Arab tili
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?lang=German')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇩🇪 Nemis tili
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/courses?lang=Uzbek')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  🇺🇿 O'zbek tili
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Yordam, Sertifikat & Huquqiy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A2B] dark:text-white">
              Yordam & Sertifikat
            </h4>
            <ul className="space-y-2 text-xs text-[#5A627A] dark:text-[#9DA6BD]">
              <li>
                <button
                  onClick={() => navigate('/verify')}
                  className="hover:text-[#635BFF] dark:hover:text-white transition flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sertifikat Tekshirish
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  Bizning Missiya
                </button>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("LISON Maxfiylik Siyosati: Foydalanuvchi shaxsiy ma'lumotlari xavfsiz himoyalangan va uchinchi shaxslarga berilmaydi."); }} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); alert("LISON Foydalanish Qoidalari: Platformadagi barcha ta'lim materiallari bepul shaxsiy o'rganish uchun mo'ljallangan."); }} className="hover:text-[#635BFF] dark:hover:text-white transition cursor-pointer">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Copyright Bottom Line */}
        <div className="pt-6 border-t border-[#E6E8F0] dark:border-[#1F2840] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A627A] dark:text-[#9DA6BD] gap-3">
          <p>© {new Date().getFullYear()} {BRAND.name}. Barcha huquqlar himoyalangan.</p>
          <p className="text-[11px]">
            O'zbekiston yoshlari uchun yaratildi • Kelajak tillari platformasi
          </p>
        </div>
      </div>
    </footer>
  );
};
