
import { useState, useRef } from "react";
import HomeSidebar from "../layout/HomeSidebar";
import HeroSection from "./sections/HeroSection";

import FeaturesSection from "./sections/FeaturesSection";
import SubjectsSection from "./sections/SubjectsSection";
import DashboardsSection from "./sections/DashboardsSection";
import PricingSection from "./sections/PricingSection";
import GamificationSection from "./sections/GamificationSection";
import EthicsSection from "./sections/EthicsSection";
import MultilingualSection from "./sections/MultilingualSection";
import InstitutionalSection from "./sections/InstitutionalSection";
import ParentalSection from "./sections/ParentalSection";
import CommunitySection from "./sections/CommunitySection";
import SupportSection from "./sections/SupportSection";
import CTASection from "./sections/CTASection";

interface EnhancedHomePageProps {
  onLogin: (userType: 'student' | 'teacher' | 'parent' | 'admin', name: string) => void;
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const EnhancedHomePage = ({ onLogin, onShowAuth }: EnhancedHomePageProps) => {
  const [activeSection, setActiveSection] = useState('hero');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionsRef.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const setSectionRef = (id: string, element: HTMLElement | null) => {
    sectionsRef.current[id] = element;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <HomeSidebar onNavigate={handleNavigate} activeSection={activeSection} />
      
      {/* Hero Section */}
      <section ref={(el) => setSectionRef('hero', el)}>
        <HeroSection onShowAuth={onShowAuth} />
      </section>

      {/* Features Section */}
      <section ref={(el) => setSectionRef('features', el)}>
        <FeaturesSection />
      </section>

      {/* Subjects Section */}
      <section ref={(el) => setSectionRef('subjects', el)}>
        <SubjectsSection />
      </section>

      {/* Dashboards Section */}
      <section ref={(el) => setSectionRef('dashboards', el)}>
        <DashboardsSection />
      </section>

      {/* Pricing Section */}
      <section ref={(el) => setSectionRef('pricing', el)}>
        <PricingSection onShowAuth={onShowAuth} />
      </section>

      {/* Gamification Section */}
      <section ref={(el) => setSectionRef('gamification', el)}>
        <GamificationSection />
      </section>

      {/* AI Ethics Section */}
      <section ref={(el) => setSectionRef('ethics', el)}>
        <EthicsSection />
      </section>

      {/* Multilingual Section */}
      <section ref={(el) => setSectionRef('multilingual', el)}>
        <MultilingualSection />
      </section>

      {/* Institutional Section */}
      <section ref={(el) => setSectionRef('institutional', el)}>
        <InstitutionalSection />
      </section>

      {/* Parental Section */}
      <section ref={(el) => setSectionRef('parental', el)}>
        <ParentalSection />
      </section>

      {/* Community Section */}
      <section ref={(el) => setSectionRef('community', el)}>
        <CommunitySection onShowAuth={onShowAuth} />
      </section>

      {/* Support Section */}
      <section ref={(el) => setSectionRef('support', el)}>
        <SupportSection />
      </section>

      {/* CTA Section */}
      <CTASection onShowAuth={onShowAuth} />
    </div>
  );
};

export default EnhancedHomePage;
