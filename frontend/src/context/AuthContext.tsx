import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  smartAuth: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateCoins: (coins: number) => void;
  openAuthModal: (mode?: 'login' | 'register' | 'admin', redirectTo?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'admin';
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin'>('register');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  const openAuthModal = (mode: 'login' | 'register' | 'admin' = 'register', redirectTo?: string) => {
    setAuthModalMode(mode === 'admin' ? 'admin' : 'register');
    if (redirectTo) {
      setRedirectAfterLogin(redirectTo);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('lison_token');
        localStorage.removeItem('ziyo_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('lison_token');
      localStorage.removeItem('ziyo_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('lison_token', data.token);
        localStorage.setItem('ziyo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Kirishda xatolik.' };
    } catch (err: any) {
      return { success: false, message: 'Server bilan ulanishda xatolik.' };
    }
  };

  const register = async (formData: any): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const cleanData = {
        ...formData,
        email: (formData.email || '').trim().toLowerCase(),
        password: (formData.password || '').trim()
      };
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('lison_token', data.token);
        localStorage.setItem('ziyo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Ro\'yxatdan o\'tishda xatolik.' };
    } catch (err: any) {
      return { success: false, message: 'Server bilan ulanishda xatolik.' };
    }
  };

  const smartAuth = async (formData: any): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const cleanData = {
        ...formData,
        first_name: (formData.first_name || '').trim(),
        last_name: (formData.last_name || '').trim(),
        email: (formData.email || '').trim().toLowerCase(),
        password: (formData.password || '').trim()
      };
      const res = await fetch('/api/auth/smart-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('lison_token', data.token);
        localStorage.setItem('ziyo_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Kirishda xatolik yuz berdi.' };
    } catch (err: any) {
      return { success: false, message: 'Server bilan ulanishda xatolik.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('lison_token');
    localStorage.removeItem('ziyo_token');
    setToken(null);
    setUser(null);
  };

  const updateCoins = (newCoins: number) => {
    setUser((prev) => (prev ? { ...prev, coins: newCoins } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        smartAuth,
        logout,
        refreshUser,
        updateCoins,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        redirectAfterLogin,
        setRedirectAfterLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
