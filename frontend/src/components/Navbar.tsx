import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Notification } from '../types';
import { LisonLogo } from './brand/LisonLogo';
import {
  Sparkles,
  Globe,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  LogOut,
  LogIn,
  LayoutDashboard,
  Settings,
  ChevronDown,
  CheckCheck,
  User as UserIcon,
  BarChart3,
  Shield
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Fetch notifications if user is logged in
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {
      // ignore
    }
  };

  // Exact 4 primary navigation items per specifications (Ibrat Academy style)
  const navItems = [
    { label: t('nav.home') || 'Asosiy', path: '/' },
    { label: t('nav.courses') || 'Kurslar', path: '/courses' },
    { label: t('nav.ai_teacher') || 'AI Ustoz', path: '/ai-teacher' },
    { label: t('nav.stats') || 'Statistika', path: '/stats' }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isCurrentActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    if (path === '/stats') return currentPath === '/stats' || currentPath === '/statistics' || currentPath === '/leaderboard';
    return currentPath.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-b border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Left: Brand Logo & Tagline */}
          <div
            onClick={() => handleNavClick('/')}
            className="cursor-pointer group flex items-center"
          >
            <LisonLogo size="md" showTagline={true} />
          </div>

          {/* Center: Exactly 4 Clean Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const active = isCurrentActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`relative py-1 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                    active
                      ? 'text-[#635BFF] dark:text-[#8B7CFF]'
                      : 'text-[#5A627A] dark:text-[#9DA6BD] hover:text-[#171A2B] dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-[#635BFF] dark:bg-[#8B7CFF] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Language Selector, Theme Toggle & Kirish / Profil */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher: UZ / EN / RU */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-[#171A2B] dark:text-[#F7F8FC] bg-[#F7F8FC] dark:bg-[#12182B] hover:bg-gray-100 dark:hover:bg-[#1A223B] rounded-lg border border-[#E6E8F0] dark:border-[#1F2840] transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#635BFF]" />
                <span className="tracking-wide uppercase font-bold text-[11px] sm:text-xs">{language}</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#12182B] rounded-xl shadow-lg border border-[#E6E8F0] dark:border-[#1F2840] py-1 z-50 animate-fade-in">
                  <button
                    onClick={() => { setLanguage('uz'); setIsLangDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      language === 'uz'
                        ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold'
                        : 'text-[#171A2B] dark:text-[#9DA6BD] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>O'zbek (UZ)</span>
                  </button>
                  <button
                    onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      language === 'en'
                        ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold'
                        : 'text-[#171A2B] dark:text-[#9DA6BD] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>English (EN)</span>
                  </button>
                  <button
                    onClick={() => { setLanguage('ru'); setIsLangDropdownOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium cursor-pointer ${
                      language === 'ru'
                        ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold'
                        : 'text-[#171A2B] dark:text-[#9DA6BD] hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>Русский (RU)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-[#F7F8FC] dark:bg-[#12182B] hover:bg-gray-100 dark:hover:bg-[#1A223B] rounded-lg border border-[#E6E8F0] dark:border-[#1F2840] transition cursor-pointer shrink-0"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#635BFF]" />}
            </button>

            {/* Notifications Dropdown (when user is authenticated) */}
            {user && (
              <div className="relative hidden xs:block" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 transition"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 z-50">
                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-primary-500" />
                        Bildirishnomalar
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Barchasi o'qildi
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center py-6 text-gray-400">Bildirishnomalar yo'q</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.link_url) handleNavClick(n.link_url);
                              setIsNotifOpen(false);
                            }}
                            className={`py-2 px-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer transition ${
                              n.is_read === 0 ? 'bg-primary-50/30 dark:bg-primary-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{n.title}</p>
                              {n.is_read === 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 mt-1" />}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Direct Admin Panel shortcut button if user is admin */}
            {user && (user.role === 'admin' || user.role === 'super_admin') && (
              <button
                onClick={() => handleNavClick('/admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-sm shadow-purple-500/25 transition active:scale-95 cursor-pointer shrink-0"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* User Coin Balance Badge */}
            {user && (
              <div
                title="Sizning tangalaringiz (Darslarni o'qib tangalarni ko'paytiring va yangi tillarni oching!)"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 rounded-lg sm:rounded-xl text-amber-700 dark:text-amber-300 font-extrabold text-[11px] sm:text-xs shadow-sm shrink-0"
              >
                <span className="text-xs sm:text-sm animate-pulse">🪙</span>
                <span>{user.coins !== undefined && user.coins !== null ? user.coins : 0}</span>
                <span className="hidden md:inline text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Coin</span>
              </div>
            )}

            {/* Guest Actions: Faqat Boshlash va Admin (Kirish yo'qotildi) */}
            {!user && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2] hover:opacity-95 active:scale-95 rounded-xl shadow-md shadow-indigo-500/25 transition-all duration-150 cursor-pointer"
                  title="Boshlash"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Boshlash</span>
                </button>
                <button
                  onClick={() => openAuthModal('admin')}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/60 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Admin sifatida kirish"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* If Logged in: User Avatar & Dropdown */}
            {user && (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1 pl-1 pr-1.5 sm:pl-1.5 sm:pr-2.5 py-1 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-100 dark:border-gray-800 transition cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + ' ' + user.last_name)}&background=6366f1&color=fff`}
                    alt={user.first_name}
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg object-cover"
                  />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 hidden sm:inline">
                    {user.first_name}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-fade-in">
                    <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <span>🪙 {user.coins !== undefined && user.coins !== null ? user.coins : 0} tanga</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { handleNavClick('/dashboard'); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary-500" />
                      <span>{t('nav.dashboard') || 'Profil'}</span>
                    </button>

                    {(user.role === 'admin' || user.role === 'super_admin') && (
                      <button
                        onClick={() => { handleNavClick('/admin'); setIsUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{t('nav.admin') || 'Admin Panel'}</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />

                    <button
                      onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout') || 'Chiqish'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Clean, minimal, 4 items) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 dark:border-gray-800 bg-white/98 dark:bg-gray-950/98 px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-2xl">
          {/* Mobile Direct Action Buttons: Faqat Boshlash va Admin (Kirish yo'qotildi) */}
          {!user && (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('register');
                }}
                className="py-2.5 px-3 text-center text-xs font-extrabold text-white bg-gradient-to-r from-[#635BFF] via-[#7B73FF] to-[#00D4B2] rounded-xl shadow-md shadow-[#635BFF]/25 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Boshlash</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal('admin');
                }}
                className="py-2.5 px-3 text-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const active = isCurrentActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                  active
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/40 dark:text-primary-400 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />}
              </button>
            );
          })}

          {user && (
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 my-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Hisobingizdagi tangalar:</span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                🪙 {user.coins !== undefined && user.coins !== null ? user.coins : 0} Coin
              </span>
            </div>
          )}

          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleNavClick('/admin');
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">Boshqaruv</span>
              </button>
            </div>
          )}

          {user && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Hisobdan chiqish</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
