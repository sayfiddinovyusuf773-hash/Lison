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

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-9 h-9 border-3 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#5A627A] dark:text-[#9DA6BD] animate-pulse">
      LISON yuklanmoqda...
    </span>
  </div>
);

export const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const renderRoute = () => {
    // 1. Course Detail: /courses/:id
    if (currentPath.startsWith('/courses/') && currentPath.length > 9) {
      const courseId = currentPath.replace('/courses/', '');
      return <CourseDetailPage courseId={courseId} navigate={navigate} />;
    }

    // 2. Lesson Player: /lessons/:id
    if (currentPath.startsWith('/lessons/') && currentPath.length > 9) {
      const lessonId = currentPath.replace('/lessons/', '');
      return <LessonPlayerPage lessonId={lessonId} navigate={navigate} />;
    }

    // 3. Quiz Engine: /quizzes/:id
    if (currentPath.startsWith('/quizzes/') && currentPath.length > 9) {
      const quizId = currentPath.replace('/quizzes/', '');
      return <QuizEnginePage quizId={quizId} navigate={navigate} />;
    }

    // 4. Verify Certificate: /verify or /verify/:id
    if (currentPath.startsWith('/verify')) {
      const code = currentPath.startsWith('/verify/') ? currentPath.replace('/verify/', '') : undefined;
      return <VerifyCertificatePage initialCode={code} />;
    }

    // Standard static routes
    switch (currentPath) {
      case '/courses':
        return <CoursesPage navigate={navigate} />;
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
      case '/':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-[#171A2B] dark:text-[#F7F8FC] selection:bg-[#635BFF] selection:text-white transition-colors duration-200">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          {renderRoute()}
        </Suspense>
      </main>
      <Footer navigate={navigate} />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
