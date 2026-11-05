import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LisonLogo } from './brand/LisonLogo';
import { X, Mail, Lock, User as UserIcon, ShieldAlert, Shield } from 'lucide-react';

interface AuthModalProps {
  navigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ navigate }) => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('uz');
  const [learningLevel, setLearningLevel] = useState('A1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with context and always clear sensitive inputs
  React.useEffect(() => {
    setMode(authModalMode);
    setEmail('');
    setPassword('');
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login' || mode === 'admin') {
        const res = await login(email, password);
        if (res.success) {
          if (mode === 'admin') {
            if (res.user?.role === 'admin' || res.user?.role === 'super_admin') {
              if (navigate) navigate('/admin');
            } else {
              setError("Ushbu hisobda Administrator huquqi mavjud emas.");
            }
          } else {
            if (res.user?.role === 'admin' || res.user?.role === 'super_admin') {
              if (navigate) navigate('/admin');
            }
          }
        } else {
          setError(res.message || 'Email yoki parol xato.');
        }
      } else {
        const res = await register({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          preferred_language: preferredLanguage,
          learning_level: learningLevel
        });
        if (!res.success) {
          setError(res.message || 'Ro\'yxatdan o\'tishda xatolik.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto w-full h-full">
      <div className="relative w-full max-w-[94vw] sm:max-w-md mx-auto my-auto p-4 sm:p-6 md:p-7 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden box-border">
        {/* Glow decoration */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 transition-all ${
          mode === 'admin'
            ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
            : 'bg-gradient-to-r from-primary-500 via-emerald-400 to-amber-400'
        }`}></div>

        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-2">
            <LisonLogo size="md" showTagline={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
            {mode === 'admin' ? (
              <>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                <span>Admin Kirishi</span>
              </>
            ) : mode === 'login' ? (
              'LISON ga kirish'
            ) : (
              'LISON da ro\'yxatdan o\'tish'
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs sm:max-w-sm mx-auto">
            {mode === 'admin'
              ? 'Platformani boshqarish uchun shaxsiy admin hisobingizga kiring'
              : mode === 'login'
              ? 'O\'rganishni davom ettirish uchun hisobingizga kiring'
              : 'Bepul hisob oching va xalqaro tillarni o\'rganing'}
          </p>
        </div>

        {/* 3-Tab Switch: Kirish | Boshlash | Admin */}
        <div className="grid grid-cols-3 p-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setEmail(''); setPassword(''); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('nav.login') || 'Kirish'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setEmail(''); setPassword(''); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('nav.register') || 'Boshlash'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setEmail(''); setPassword(''); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/50">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ismingiz
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 sm:top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sardor"
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none box-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Familiyangiz
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Alimov"
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none box-border"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'admin' ? 'Admin Email manzil' : 'Gmail / Email manzil'}
            </label>
            <div className="relative">
              {mode === 'admin' ? (
                <Shield className="absolute left-3 top-3 sm:top-2.5 w-4 h-4 text-purple-500" />
              ) : (
                <Mail className="absolute left-3 top-3 sm:top-2.5 w-4 h-4 text-gray-400" />
              )}
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className={`w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl outline-none transition box-border ${
                  mode === 'admin'
                    ? 'border-purple-200 dark:border-purple-800 focus:ring-2 focus:ring-purple-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635BFF]'
                }`}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              {mode === 'admin'
                ? "Admin hisobingizga biriktirilgan maxfiy pochtangizni kiriting."
                : mode === 'login'
                ? "Har bir o'quvchi o'zining shaxsiy Gmail pochtasi va paroli bilan kiradi."
                : "O'quvchilar yangi hisob yaratish uchun o'z Gmail pochtasini kiritadilar."}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'admin' ? 'Admin Paroli' : 'Parol'}
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-3 sm:top-2.5 w-4 h-4 ${mode === 'admin' ? 'text-purple-500' : 'text-gray-400'}`} />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl outline-none transition box-border ${
                  mode === 'admin'
                    ? 'border-purple-200 dark:border-purple-800 focus:ring-2 focus:ring-purple-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635BFF]'
                }`}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Boshlang'ich daraja
                </label>
                <select
                  value={learningLevel}
                  onChange={(e) => setLearningLevel(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none box-border"
                >
                  <option value="A1">A1 - Boshlang'ich</option>
                  <option value="A2">A2 - Elementar</option>
                  <option value="B1">B1 - O'rta (Intermediate)</option>
                  <option value="B2">B2 - Yuqori o'rta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Interfeys tili
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none box-border"
                >
                  <option value="uz">O'zbek tili</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 text-white font-bold text-sm rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 shadow-primary-500/25'
            }`}
          >
            {loading ? (
              'Kutilmoqda...'
            ) : mode === 'admin' ? (
              <>
                <Shield className="w-4 h-4" />
                <span>Admin Panelga Kirish</span>
              </>
            ) : mode === 'login' ? (
              'Kirish'
            ) : (
              'Hisob Yaratish'
            )}
          </button>
        </form>

        {mode === 'admin' && (
          <div className="mt-4 p-3 bg-purple-50/80 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-900/60 text-center animate-fade-in">
            <p className="text-xs text-purple-800 dark:text-purple-300 font-medium">
              🛡️ Faqat LISON platformasi boshqaruvchisi uchun. Kirish bilan to‘g‘ridan-to‘g‘ri <strong>Admin Panel</strong> ochiladi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
