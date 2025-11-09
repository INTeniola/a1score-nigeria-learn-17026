import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BookOpen, Trophy, Users, Target, Code, GraduationCap, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import HeroSection from "./sections/HeroSection";

import FeaturesSection from "./sections/FeaturesSection";
import SubjectsSection from "./sections/SubjectsSection";
import PricingSection from "./sections/PricingSection";
import GamificationSection from "./sections/GamificationSection";
import EthicsSection from "./sections/EthicsSection";
import MultilingualSection from "./sections/MultilingualSection";
import CommunitySection from "./sections/CommunitySection";
import SupportSection from "./sections/SupportSection";
import CTASection from "./sections/CTASection";

interface StudentFocusedHomePageProps {
  onLogin: (userType: 'student' | 'teacher' | 'parent' | 'admin', name: string) => void;
  onShowAuth: (userType: 'student' | 'teacher' | 'parent' | 'admin') => void;
}

const StudentFocusedHomePage = ({ onLogin, onShowAuth }: StudentFocusedHomePageProps) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const setSectionRef = (id: string, element: HTMLElement | null) => {
    sectionsRef.current[id] = element;
  };

  const learnerTypes = [
    {
      icon: BookOpen,
      title: "SS3 Students",
      description: "Ace JAMB, WAEC, and NECO with AI-powered tutoring tailored to the Nigerian curriculum",
      features: ["Past questions practice", "Exam strategies", "Subject mastery"]
    },
    {
      icon: GraduationCap,
      title: "Undergraduates (100-600 Level)",
      description: "Excel in your university courses with personalized study support and exam prep",
      features: ["Course materials", "Assignment help", "Exam preparation"]
    },
    {
      icon: Brain,
      title: "Postgraduate Students",
      description: "Research support, thesis writing, and advanced learning for Masters and PhD students",
      features: ["Research tools", "Literature review", "Thesis assistance"]
    },
    {
      icon: Code,
      title: "Coding & Tech Skills",
      description: "Master programming and tech skills with hands-on practice and project-based learning",
      features: ["Code debugging", "Project guidance", "Interview prep"]
    }
  ];

  const coreFeatures = [
    {
      icon: Brain,
      title: "24/7 AI Tutor",
      description: "Get instant help in any subject, anytime you need it"
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn points, badges, and compete on leaderboards"
    },
    {
      icon: Target,
      title: "Personalized Study Plans",
      description: "AI adapts to your learning style and pace"
    },
    {
      icon: Users,
      title: "Study Communities",
      description: "Connect with peers, form study groups, and learn together"
    }
  ];

  const otherAudiences = [
    {
      title: "For Teachers",
      description: "AI-powered tools for lesson planning, class management, and student monitoring",
      link: "/for-teachers",
      icon: BookOpen
    },
    {
      title: "For Parents",
      description: "Track your child's progress and stay involved in their learning journey",
      link: "/for-parents",
      icon: Users
    },
    {
      title: "For Institutions",
      description: "Enterprise solutions for schools, universities, and training centers",
      link: "/for-institutions",
      icon: GraduationCap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section ref={(el) => setSectionRef('hero', el)}>
        <HeroSection onShowAuth={onShowAuth} />
      </section>

      {/* Learner Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Built for Every Learning Stage</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're preparing for JAMB, pursuing a degree, or learning to code, 
            A1Score adapts to your unique learning needs
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learnerTypes.map((type, index) => (
            <Card key={index} className="border-2 hover:shadow-xl transition-all hover:scale-105">
              <CardHeader>
                <type.icon className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <CardDescription className="text-base">{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={(el) => setSectionRef('features', el)}>
        <FeaturesSection />
      </section>

      {/* Subjects Section */}
      <section ref={(el) => setSectionRef('subjects', el)}>
        <SubjectsSection />
      </section>

      {/* Gamification Section */}
      <section ref={(el) => setSectionRef('gamification', el)}>
        <GamificationSection />
      </section>

      {/* Ethics Section */}
      <section ref={(el) => setSectionRef('ethics', el)}>
        <EthicsSection />
      </section>

      {/* Multilingual Section */}
      <section ref={(el) => setSectionRef('multilingual', el)}>
        <MultilingualSection />
      </section>

      {/* Community Section */}
      <section ref={(el) => setSectionRef('community', el)}>
        <CommunitySection onShowAuth={onShowAuth} />
      </section>

      {/* Pricing Section */}
      <section ref={(el) => setSectionRef('pricing', el)}>
        <PricingSection onShowAuth={onShowAuth} />
      </section>

      {/* Other Audiences */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Are You a Teacher, Parent, or Institution?</h2>
          <p className="text-xl text-center mb-12 opacity-90">
            We have specialized solutions for you too
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {otherAudiences.map((audience, index) => (
              <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all">
                <CardHeader>
                  <audience.icon className="w-10 h-10 text-white mb-4" />
                  <CardTitle className="text-white">{audience.title}</CardTitle>
                  <CardDescription className="text-white/80 text-base">{audience.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate(audience.link)}
                  >
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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

export default StudentFocusedHomePage;
