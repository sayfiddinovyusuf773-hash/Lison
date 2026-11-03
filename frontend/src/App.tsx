import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { QuizEnginePage } from './pages/QuizEnginePage';
import { AITeacherPage } from './pages/AITeacherPage';
import { SpeakingStudioPage } from './pages/SpeakingStudioPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TeachersPage } from './pages/TeachersPage';
import { AboutPage } from './pages/AboutPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

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
        {renderRoute()}
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
