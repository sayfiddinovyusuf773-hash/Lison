import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// HomePage is loaded eagerly for instant first-paint
import { HomePage } from './pages/HomePage';

// Route-based code-splitting for high-speed performance & low initial bundle size
const CoursesPage = lazy(() => import('./pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })));
const LessonPlayerPage = lazy(() => import('./pages/LessonPlayerPage').then(m => ({ default: m.LessonPlayerPage })));
const QuizEnginePage = lazy(() => import('./pages/QuizEnginePage').then(m => ({ default: m.QuizEnginePage })));
const AITeacherPage = lazy(() => import('./pages/AITeacherPage').then(m => ({ default: m.AITeacherPage })));
const SpeakingStudioPage = lazy(() => import('./pages/SpeakingStudioPage').then(m => ({ default: m.SpeakingStudioPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
const TeachersPage = lazy(() => import('./pages/TeachersPage').then(m => ({ default: m.TeachersPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage').then(m => ({ default: m.VerifyCertificatePage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const SecureAdminAccessPage = lazy(() => import('./pages/SecureAdminAccessPage').then(m => ({ default: m.SecureAdminAccessPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-9 h-9 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#5A627A] dark:text-[#9DA6BD] animate-pulse">
      LISON yuklanmoqda...
    </span>
  </div>
);

const NotFoundPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
    <div className="text-6xl font-black text-[#635BFF] mb-3">404</div>
    <h1 className="text-2xl sm:text-3xl font-black text-[#171A2B] dark:text-[#F7F8FC] mb-2">
      Sahifa topilmadi
    </h1>
    <p className="text-sm text-[#5A627A] dark:text-[#9DA6BD] max-w-md mb-6">
      Siz qidirayotgan manzil mavjud emas yoki o&apos;chirilgan. Bosh sahifaga yoki kurslar katalogiga qayting.
    </p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5249F5] text-white font-bold text-sm transition cursor-pointer"
      >
        Bosh sahifaga qaytish
      </button>
      <button
        onClick={() => navigate('/courses')}
        className="px-5 py-2.5 rounded-xl border border-[#E6E9F2] dark:border-[#222B45] bg-white dark:bg-[#11182D] text-[#171A2B] dark:text-[#F7F8FC] font-bold text-sm hover:border-[#635BFF] transition cursor-pointer"
      >
        Kurslarni ko&apos;rish
      </button>
    </div>
  </div>
);

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(
    () => (window.location.pathname || '/') + (window.location.search || '')
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rawPathname = currentPath.split('?')[0] || '/';
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, '') : rawPathname;
  const searchQuery = currentPath.includes('?') ? currentPath.slice(currentPath.indexOf('?')) : '';

  // Route matching logic
  const renderRoute = () => {
    // 1. Course Detail: /courses/:id
    if (pathname.startsWith('/courses/') && pathname.length > 9) {
      const courseId = pathname.replace('/courses/', '');
      return <CourseDetailPage courseId={courseId} navigate={navigate} />;
    }

    // 2. Lesson Player: /lessons/:id
    if (pathname.startsWith('/lessons/') && pathname.length > 9) {
      const lessonId = pathname.replace('/lessons/', '');
      return <LessonPlayerPage lessonId={lessonId} navigate={navigate} />;
    }

    // 3. Quiz Engine: /quizzes/:id
    if (pathname.startsWith('/quizzes/') && pathname.length > 9) {
      const quizId = pathname.replace('/quizzes/', '');
      return <QuizEnginePage quizId={quizId} navigate={navigate} />;
    }

    // 4. Verify Certificate: /verify or /verify/:id
    if (pathname === '/verify' || pathname.startsWith('/verify/')) {
      const code = pathname.startsWith('/verify/') ? pathname.replace('/verify/', '') : undefined;
      return <VerifyCertificatePage initialCode={code} />;
    }

    // Standard static routes
    switch (pathname) {
      case '/courses':
        return <CoursesPage navigate={navigate} searchQuery={searchQuery} />;
      case '/ai-teacher':
        return <AITeacherPage />;
      case '/speaking':
        return <SpeakingStudioPage />;
      case '/dashboard':
        return <StudentDashboardPage navigate={navigate} />;
      case '/leaderboard':
      case '/stats':
      case '/statistics':
        return <LeaderboardPage />;
      case '/teachers':
        return <TeachersPage navigate={navigate} />;
      case '/about':
        return <AboutPage />;
      case '/admin':
        return <AdminDashboardPage navigate={navigate} />;
      case '/secure-admin-access':
      case '/admin-login':
        return <SecureAdminAccessPage navigate={navigate} />;
      case '/':
        return <HomePage navigate={navigate} />;
      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#171A2B] dark:text-[#F7F8FC] selection:bg-[#635BFF] selection:text-white transition-colors duration-200">
      <Navbar currentPath={pathname} navigate={navigate} />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {renderRoute()}
        </Suspense>
      </main>
      <Footer navigate={navigate} />
      <AuthModal navigate={navigate} />
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F7F8FC] dark:bg-[#0B1020] text-[#171A2B] dark:text-[#F7F8FC]">
          <h1 className="text-2xl font-black mb-2">Kutilmagan xatolik yuz berdi</h1>
          <p className="text-sm text-[#5A627A] dark:text-[#9DA6BD] mb-5">
            Sahifani qayta yuklang yoki bosh sahifaga qayting.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="px-5 py-2.5 rounded-xl bg-[#635BFF] text-white font-bold text-sm cursor-pointer"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
