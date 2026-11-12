import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LisonLogo } from './brand/LisonLogo';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldAlert,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  Calendar,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface AuthModalProps {
  navigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ navigate }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    register,
    redirectAfterLogin,
    setRedirectAfterLogin
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<string>('');
  
  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Forgot password flow
  const [forgotStep, setForgotStep] = useState<'none' | 'request' | 'reset'>('none');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Status messages
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Synchronize modal open state and mode
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);
      setInfoMessage(null);
      setForgotStep('none');
      setPassword('');
      setConfirmPassword('');
    }
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. KIRISH (LOGIN) — faqat Gmail va Parol
    if (mode === 'login' || mode === 'admin') {
      if (!cleanEmail || !cleanPassword) {
        setError('Gmail va parolingizni kiriting.');
        return;
      }

      setLoading(true);
      try {
        const res = await login(cleanEmail, cleanPassword);
        if (res.success && res.user) {
          const isAdmin = res.user.role === 'admin' || res.user.role === 'super_admin';
          if (mode === 'admin' && !isAdmin) {
            setError('Ushbu hisobda Administrator huquqi mavjud emas.');
            setLoading(false);
            return;
          }

          // Role-based routing: Admin -> /admin, Student -> redirect target or /dashboard
          const destination = isAdmin
            ? '/admin'
            : redirectAfterLogin || '/dashboard';

          setRedirectAfterLogin(null);
          closeAuthModal();
          if (navigate) {
            navigate(destination);
          }
        } else {
          setError(res.message || 'Gmail yoki parol noto‘g‘ri.');
        }
      } catch {
        setError('Server bilan ulanishda xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. RO'YXATDAN O'TISH (REGISTRATION) — 6 ta maydon
    if (mode === 'register') {
      const cleanFirstName = firstName.trim();
      const cleanLastName = lastName.trim();
      const cleanConfirmPassword = confirmPassword.trim();
      const ageNum = parseInt(age, 10);

      if (!cleanFirstName) {
        setError('Ismingizni kiriting.');
        return;
      }

      if (!cleanLastName) {
        setError('Familiyangizni kiriting.');
        return;
      }

      if (isNaN(ageNum) || ageNum < 5 || ageNum > 120) {
        setError('Yosh 5 dan 120 gacha bo‘lgan oraliqda bo‘lishi shart.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        setError('To‘g‘ri Gmail yoki email pochtangizni kiriting.');
        return;
      }

      if (!cleanPassword || cleanPassword.length < 4) {
        setError('Parol kamida 4 ta belgidan iborat bo‘lishi kerak.');
        return;
      }

      if (cleanPassword !== cleanConfirmPassword) {
        setError('Kiritilgan parollar bir-biriga mos kelmadi. Qaytadan tekshiring.');
        return;
      }

      if (!acceptedTerms) {
        setError('Davom etish uchun foydalanuvchi shartlariga rozilik bildiring.');
        return;
      }

      setLoading(true);
      try {
        const res = await register({
          first_name: cleanFirstName,
          last_name: cleanLastName,
          age: ageNum,
          email: cleanEmail,
          password: cleanPassword,
          confirm_password: cleanConfirmPassword
        });

        if (res.success && res.user) {
          setRedirectAfterLogin(null);
          closeAuthModal();
          // Muvaffaqiyatli ro'yxatdan o'tgach Student Dashboard ga yo'naltirish
          if (navigate) {
            navigate('/dashboard');
          }
        } else {
          setError(res.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.');
        }
      } catch {
        setError('Server bilan ulanishda xatolik yuz berdi.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto w-full h-full animate-fade-in">
      <div className="relative w-full max-w-[94vw] sm:max-w-md mx-auto my-auto p-5 sm:p-7 bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden box-border">
        {/* Top Glow bar */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 transition-all ${
            mode === 'admin'
              ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500'
              : 'bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2]'
          }`}
        />

        {/* Close Button */}
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
            ) : mode === 'register' ? (
              <>
                <span>Ro‘yxatdan o‘tish</span>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-[#635BFF]" />
                <span>LISON ga Kirish</span>
              </>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            {mode === 'admin'
              ? 'Platformani boshqarish uchun maxsus administrator hisobingizga kiring.'
              : mode === 'register'
              ? 'Shaxsiy hisob yaratib, yangi tillarni o‘rganishni hoziroq boshlang.'
              : 'Shaxsiy kabinetingizga kirish uchun Gmail va parolingizni kiriting.'}
          </p>
        </div>

        {/* Public 2-Tab Switch: KIRISH va RO'YXATDAN O'TISH (Admin paneli butunlay yashiringan!) */}
        {mode !== 'admin' ? (
          <div className="grid grid-cols-2 p-1 mb-5 bg-gray-100 dark:bg-gray-800/80 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-gray-900 text-[#635BFF] dark:text-[#8B7CFF] shadow-sm font-extrabold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kirish</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#635BFF] to-[#00D4B2] text-white shadow-md font-extrabold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ro‘yxatdan o‘tish</span>
            </button>
          </div>
        ) : (
          <div className="mb-4 p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Shield className="w-4 h-4" />
              <span>Xavfsiz Admin Rejimi</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="text-[11px] font-bold text-[#635BFF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Oddiy kirish</span>
            </button>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 mb-4 text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900/60 animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Info notification banner */}
        {infoMessage && (
          <div className="p-3 mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Forgot Password Subflow */}
        {forgotStep !== 'none' ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Parolni tiklash</h3>
              <button
                type="button"
                onClick={() => {
                  setForgotStep('none');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs font-bold text-[#635BFF] hover:underline cursor-pointer"
              >
                Orqaga
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Gmail / Email manzilingiz
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
              />
            </div>
            {forgotStep === 'reset' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    6 xonali tasdiqlash kodi
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Yangi parol
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Kamida 4 belgi"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                  />
                </div>
              </>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setInfoMessage(null);
                setLoading(true);
                try {
                  if (forgotStep === 'request') {
                    const res = await fetch('/api/auth/forgot-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: email.trim().toLowerCase() })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setForgotStep('reset');
                      setInfoMessage('Tasdiqlash kodi emailingizga yuborildi (yoki serverda qayd etildi).');
                    } else {
                      setError(data.message || 'Kod yuborib bo‘lmadi.');
                    }
                  } else {
                    const res = await fetch('/api/auth/reset-password', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        code: resetCode.trim(),
                        new_password: newPassword.trim()
                      })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setForgotStep('none');
                      setInfoMessage('Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan kiring.');
                    } else {
                      setError(data.message || 'Parolni tiklab bo‘lmadi.');
                    }
                  }
                } catch {
                  setError('Server xatoligi yuz berdi.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-[#635BFF] text-white font-bold text-xs rounded-xl hover:bg-[#5249F5] transition cursor-pointer"
            >
              {loading ? 'Yuborilmoqda...' : forgotStep === 'request' ? 'Tiklash kodini yuborish' : 'Yangi parolni saqlash'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. REGISTRATION MODE ONLY FIELDS: Ism, Familiya, Yosh */}
            {mode === 'register' && (
              <>
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
                        placeholder="Ali"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Familiyangiz <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Valiyev"
                      className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                    />
                  </div>
                </div>

                {/* Yosh (Age) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Yoshingiz <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={5}
                      max={120}
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Masalan: 18"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 2. COMMON FIELDS: Gmail */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {mode === 'admin' ? 'Admin Gmail' : 'Gmail pochtangiz'} <span className="text-red-500">*</span>
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
            </div>

            {/* 3. COMMON FIELDS: Parol */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                {mode === 'admin' ? 'Admin Paroli' : 'Parol'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-2.5 w-4 h-4 ${
                    mode === 'admin' ? 'text-purple-500' : 'text-gray-400'
                  }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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
                  title={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. REGISTRATION MODE ONLY: Parolni tasdiqlash */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Parolni tasdiqlash <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#635BFF] outline-none box-border"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    title={showConfirmPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Mode-specific actions */}
            {mode === 'login' && (
              <div className="flex items-center justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('request');
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-xs font-bold text-[#635BFF] hover:underline cursor-pointer"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
            )}

            {mode === 'register' && (
              <div className="pt-0.5">
                <label className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-gray-300 text-[#635BFF] focus:ring-[#635BFF]"
                  />
                  <span>Foydalanuvchi shartlariga roziman</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 text-white font-extrabold text-sm rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25'
                  : mode === 'register'
                  ? 'bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2] hover:opacity-95 shadow-indigo-500/25'
                  : 'bg-[#635BFF] hover:bg-[#5249F5] shadow-indigo-500/25'
              }`}
            >
              {loading ? (
                <span>Tekshirilmoqda...</span>
              ) : mode === 'admin' ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Admin Panelga Kirish</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ro‘yxatdan o‘tish</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Kirish</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-gray-400 mt-4">
          Xavfsiz va shifrlangan kirish. Barcha ma‘lumotlaringiz himoyalangan.
        </p>
      </div>
    </div>
  );
};
