import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { LanguageGrid } from '../components/home/LanguageGrid';
import { PopularCourses } from '../components/home/PopularCourses';
import { LearningBenefits } from '../components/home/LearningBenefits';
import { AIDemonstration } from '../components/home/AIDemonstration';
import { InteractiveLearningSection } from '../components/home/InteractiveLearningSection';
import { TeacherShowcase } from '../components/home/TeacherShowcase';
import { StatsSection } from '../components/home/StatsSection';
import { AchievementsSection } from '../components/home/AchievementsSection';
import { FAQSection } from '../components/home/FAQSection';
import { MobileAppPromo } from '../components/home/MobileAppPromo';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  return (
    <div className="space-y-0">
      <HeroSection navigate={navigate} />
      <LanguageGrid navigate={navigate} />
      <PopularCourses navigate={navigate} />
      <LearningBenefits />
      <AIDemonstration navigate={navigate} />
      <InteractiveLearningSection navigate={navigate} />
      <TeacherShowcase navigate={navigate} />
      <StatsSection />
      <AchievementsSection navigate={navigate} />
      <FAQSection />
      <MobileAppPromo />
    </div>
  );
};
