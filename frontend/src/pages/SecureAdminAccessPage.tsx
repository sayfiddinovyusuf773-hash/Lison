import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, ArrowRight, LogOut, CheckCircle } from 'lucide-react';

interface SecureAdminAccessPageProps {
  navigate: (path: string) => void;
}

export const SecureAdminAccessPage: React.FC<SecureAdminAccessPageProps> = ({ navigate }) => {
  const { user, openAuthModal, logout } = useAuth();

  useEffect(() => {
    // Agar foydalanuvchi allaqachon admin bo'lsa to'g'ridan-to'g'ri /admin ga o'tkazish
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-3xl p-6 sm:p-8 border border-purple-100 dark:border-purple-900/50 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
          <Shield className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Maxfiy Ma'muriyat Portali</span>
          </div>
          <h1 className="text-2xl font-black text-[#171A2B] dark:text-white">
            LISON Admin Boshqaruvi
          </h1>
          <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] max-w-xs mx-auto leading-relaxed">
            Platformaning barcha kurslari, foydalanuvchilari va tizim sozlamalarini boshqarish uchun maxsus kirish hududi.
          </p>
        </div>

        {user && user.role === 'student' ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-left space-y-3">
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
              Siz hozirda <span className="font-bold">{user.email}</span> o‘quvchi hisobi bilan kirgansiz. Admin paneliga kirish uchun administrator hisobingizdan tizimga kiring.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  await logout();
                  openAuthModal('admin', '/admin');
                }}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Hisobdan chiqib, Admin sifatida kirish</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-2 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                O‘quvchi kabinetiga qaytish
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => openAuthModal('admin', '/admin')}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Admin Hisobiga Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-[11px] text-gray-400">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit SSL Shifrlash & Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
};
