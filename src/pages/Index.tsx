import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import StudentFocusedHomePage from "@/components/home/StudentFocusedHomePage";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import DemoController from "@/components/demo/DemoController";
import PitchMetrics from "@/components/demo/PitchMetrics";
import DashboardRouter from "@/components/dashboard/DashboardRouter";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPitchMode, setIsPitchMode] = useState(false);

  // Check for pitch mode in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pitch') === 'true') {
      setIsPitchMode(true);
    }
  }, []);

  // Redirect authenticated users to dashboard if they're on /dashboard route
  useEffect(() => {
    if (user && location.pathname.startsWith('/dashboard')) {
      // User is authenticated and on dashboard route - let DashboardRouter handle it
      return;
    }
  }, [user, location]);

  const handleShowAuth = (userType?: 'student' | 'teacher' | 'parent' | 'admin') => {
    if (userType) {
      navigate('/auth', { state: { userType } });
    } else {
      navigate('/select-role');
    }
  };

  const handleDemoUserSwitch = (userType: 'student' | 'teacher' | 'admin' | 'parent', name: string, metadata?: any) => {
    // Demo functionality - not used in real auth mode
    console.log('Demo user switch:', userType, name, metadata);
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and on dashboard route, show dashboard
  if (user && location.pathname.startsWith('/dashboard')) {
    return <DashboardRouter />;
  }

  return (
    <div className="min-h-screen">
      {/* Pitch Mode Components */}
      {isPitchMode && (
        <>
          <PitchMetrics />
          <DemoController onUserSwitch={handleDemoUserSwitch} />
        </>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-6 py-2 md:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo Section */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
                alt="A1Score Logo" 
                className="h-8 md:h-12 lg:h-16 w-auto object-contain flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/')}
              />
            </div>
            
            {/* Desktop Navigation & Buttons */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <LanguageSwitcher />
              
              {isPitchMode && (
                <Button 
                  variant="outline"
                  onClick={() => setIsPitchMode(false)}
                  size="sm"
                >
                  Exit Pitch
                </Button>
              )}
              
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Dashboard
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => handleShowAuth()}
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Button */}
            <div className="md:hidden">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard')}
                  size="sm"
                  className="text-xs px-3 py-1.5"
                >
                  Dashboard
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => handleShowAuth()}
                  size="sm"
                  className="text-xs px-3 py-1.5"
                >
                  Start
                </Button>
              )}
            </div>
          </div>
          
          {/* Mobile Language Switcher - Below Header */}
          <div className="md:hidden mt-3 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <StudentFocusedHomePage onLogin={handleShowAuth} onShowAuth={handleShowAuth} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
                  alt="A1Score Logo" 
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <span className="text-xl md:text-2xl font-bold">A1Score</span>
              </div>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                AI-powered education platform designed specifically for Nigerian students and teachers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg md:text-xl">For Students</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base leading-relaxed">
                <li>AI Tutoring</li>
                <li>JAMB Practice</li>
                <li>WAEC Prep</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg md:text-xl">For Teachers</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base leading-relaxed">
                <li>Class Analytics</li>
                <li>Content Creation</li>
                <li>Student Management</li>
                <li>Earn with Validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg md:text-xl">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base leading-relaxed">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Community</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-8 text-center text-gray-400 text-xs md:text-sm leading-relaxed">
            <p>&copy; 2024 A1Score. All rights reserved. Built for Nigerian Education.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
