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
                className="h-8 md:h-12 lg:h-16 w-auto max-w-full object-contain flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate('/')}
                loading="eager"
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
      <footer className="bg-gray-900 text-white py-8 px-4 md:py-12 md:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                <img 
                  src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
                  alt="A1Score Logo" 
                  className="h-8 w-auto object-contain brightness-0 invert max-w-full"
                  loading="lazy"
                />
                <span className="text-xl md:text-2xl font-bold">A1Score</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                AI-powered education platform designed specifically for Nigerian students and teachers.
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">For Students</h4>
              <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => user ? navigate('/dashboard') : handleShowAuth('student')}>AI Tutoring</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => user ? navigate('/dashboard') : handleShowAuth('student')}>JAMB Practice</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => user ? navigate('/dashboard') : handleShowAuth('student')}>WAEC Prep</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => user ? navigate('/dashboard') : handleShowAuth('student')}>Progress Tracking</li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">For Teachers</h4>
              <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/for-teachers')}>Class Analytics</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/for-teachers')}>Content Creation</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/for-teachers')}>Student Management</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/for-teachers')}>Earn with Validation</li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => window.open('https://docs.lovable.dev', '_blank')}>Help Center</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => window.location.href = 'mailto:support@a1score.com'}>Contact Us</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => user ? navigate('/dashboard') : handleShowAuth('student')}>Community</li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/privacy-policy')}>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-xs leading-relaxed">
            <p>&copy; 2024 A1Score. All rights reserved. Built for Nigerian Education.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
