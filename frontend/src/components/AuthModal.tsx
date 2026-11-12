import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LisonLogo } from './brand/LisonLogo';
import { X, Mail, Lock, User as UserIcon, ShieldAlert, Shield, Eye, EyeOff, Sparkles, BookOpen, Layers } from 'lucide-react';

interface AuthModalProps {
  navigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ navigate }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    smartAuth,
    login,
    redirectAfterLogin,
    setRedirectAfterLogin
  } = useAuth();

  const [mode, setMode] = useState<'register' | 'admin'>('register');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [learningLevel, setLearningLevel] = useState('A1');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode with context: only 'admin' or 'register' (Kirish yo'qotildi!)
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode === 'admin' ? 'admin' : 'register');
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Iltimos, Gmail va parolingizni kiriting.");
      return;
    }

    if (cleanPassword.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'admin') {
        // Admin Kirishi
        const res = await login(cleanEmail, cleanPassword);
        if (res.success) {
          if (res.user?.role === 'admin' || res.user?.role === 'super_admin') {
            const target = redirectAfterLogin || '/admin';
            setRedirectAfterLogin(null);
            if (navigate) navigate(target);
          } else {
            setError("Ushbu hisobda Administrator huquqi mavjud emas.");
          }
        } else {
          setError(res.message || "Admin email yoki parol noto'g'ri.");
        }
      } else {
        // O'quvchilar uchun Boshlash (Yangi yoki boshqa telefonda kirish)
        const res = await smartAuth({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: cleanEmail,
          password: cleanPassword,
          learning_level: learningLevel,
          preferred_language: preferredLanguage
        });

        if (res.success) {
          if (res.user?.role === 'admin' || res.user?.role === 'super_admin') {
            const target = redirectAfterLogin || '/admin';
            setRedirectAfterLogin(null);
            if (navigate) navigate(target);
          } else if (redirectAfterLogin) {
            const target = redirectAfterLogin;
            setRedirectAfterLogin(null);
            if (navigate) navigate(target);
          }
        } else {
          // Xato bo'lsa kirmasin!
          setError(res.message || "Ma'lumotlar yoki parol noto'g'ri. Qaytadan tekshiring.");
        }
      }
    } catch (err: any) {
      setError("Server bilan ulanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto w-full h-full animate-fade-in">
      <div className="relative w-full max-w-[94vw] sm:max-w-md mx-auto my-auto p-5 sm:p-7 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden box-border">
        {/* Glow decoration */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 transition-all ${
          mode === 'admin'
            ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
            : 'bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2]'
        }`}></div>

        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-2">
            <LisonLogo size="md" showTagline={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
            {mode === 'admin' ? (
              <>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                <span>Admin Kirishi</span>
              </>
            ) : (
              <>
                <span>LISON ga Boshlash</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {mode === 'admin'
              ? 'Platformani boshqarish uchun shaxsiy admin hisobingizga kiring'
              : "Ism, familiya, Gmail va parolingiz bilan kiring. Boshqa telefonda ham shu ma'lumotlar bilan hisobingiz ochiladi."}
          </p>
        </div>

        {/* 2-Tab Switch: Faqat Boshlash va Admin (Kirish butunlay yo'qotildi!) */}
        <div className="grid grid-cols-2 p-1 mb-5 bg-gray-100 dark:bg-gray-800 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-[#635BFF] to-[#00D4B2] text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Boshlash</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30'
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 mb-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* O'quvchilar Boshlash rejimida: Ism va Familiya */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Ismingiz <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sardor"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Familiyangiz
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Alimov"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                />
              </div>
            </div>
          )}

          {/* Gmail / Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'admin' ? 'Admin Gmail / Email' : 'Gmail / Email pochtangiz'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {mode === 'admin' ? (
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-purple-500" />
              ) : (
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              )}
              <input
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl outline-none transition box-border ${
                  mode === 'admin'
                    ? 'border-purple-200 dark:border-purple-800 focus:ring-2 focus:ring-purple-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635BFF]'
                }`}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">
              {mode === 'admin'
                ? "Admin hisobingizga biriktirilgan maxfiy Gmail pochtangizni kiriting."
                : "Boshqa telefonda kirayotganda ham shu pochtangizni yozasiz."}
            </p>
          </div>

          {/* Parol with Eye Toggle */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'admin' ? 'Admin Paroli' : 'Parolingiz'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-2.5 w-4 h-4 ${mode === 'admin' ? 'text-purple-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'admin' ? 'current-password' : 'current-password'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border rounded-xl outline-none transition box-border ${
                  mode === 'admin'
                    ? 'border-purple-200 dark:border-purple-800 focus:ring-2 focus:ring-purple-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#635BFF]'
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* O'quvchilar Boshlash rejimida: Daraja va Til */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#635BFF]" />
                  <span>Darajangiz</span>
                </label>
                <select
                  value={learningLevel}
                  onChange={(e) => setLearningLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                >
                  <option value="A1">A1 - Boshlang'ich</option>
                  <option value="A2">A2 - Elementar</option>
                  <option value="B1">B1 - O'rta daraja</option>
                  <option value="B2">B2 - Yuqori o'rta</option>
                  <option value="C1">C1 - Mukammal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Qaysi til?</span>
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                >
                  <option value="en">🇬🇧 Ingliz tili</option>
                  <option value="it_ai">🤖 IT & AI</option>
                  <option value="ko">🇰🇷 Koreys tili</option>
                  <option value="de">🇩🇪 Nemis tili</option>
                  <option value="ru">🇷🇺 Rus tili</option>
                  <option value="ar">🇸🇦 Arab tili</option>
                  <option value="uz">🇺🇿 O'zbek tili</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 px-4 text-white font-extrabold text-sm rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'admin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
                : 'bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2] hover:opacity-95 shadow-indigo-500/25'
            }`}
          >
            {loading ? (
              <span>Tekshirilmoqda...</span>
            ) : mode === 'admin' ? (
              <>
                <Shield className="w-4 h-4" />
                <span>Admin Panelga Kirish</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Boshlash</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-gray-400 mt-4">
          Xavfsiz va tezkor kirish. Barcha natijalaringiz bulutda saqlanadi.
        </p>
      </div>
    </div>
  );
};
