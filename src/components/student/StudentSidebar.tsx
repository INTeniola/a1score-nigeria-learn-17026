
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, X, TrendingUp, Brain, BookOpen, MessageCircle, Trophy, Globe, Users, FileText, Search, BarChart3, PenTool, Timer, Target, Calculator, Camera, Shield, Play } from "lucide-react";
import { type AcademicLevel, hasFeatureAccess, getLevelFromString } from "@/types/academicLevel";

interface StudentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userLevel?: string;
}

const StudentSidebar = ({ activeTab, onTabChange, userLevel }: StudentSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const academicLevel = getLevelFromString(userLevel);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Define tab configuration with level requirements
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, feature: 'dashboard' as const },
    { id: 'animated-tutorials', label: 'Interactive Tutorials', icon: Play, feature: 'dashboard' as const },
    { id: 'learning-paths', label: 'Smart Paths', icon: Target, feature: 'dashboard' as const },
    { id: 'tutor', label: 'AI Tutor', icon: Brain, feature: 'aiTutor' as const },
    { id: 'quiz', label: 'Practice Quiz', icon: MessageCircle, feature: 'quizzes' as const },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, feature: 'subjects' as const },
    { id: 'pdf-helper', label: 'PDF Helper', icon: FileText, feature: 'pdfHelper' as const },
    { id: 'homework-scanner', label: 'Homework Scanner', icon: Camera, feature: 'homeworkScanner' as const },
    { id: 'study-timer', label: 'Study Timer', icon: Timer, feature: 'studyTimer' as const },
    { id: 'progress-tracker', label: 'Progress Tracker', icon: BarChart3, feature: 'dashboard' as const },
    { id: 'study-goals', label: 'Study Goals', icon: Target, feature: 'studyGoals' as const },
    { id: 'formula-reference', label: 'Formulas', icon: Calculator, feature: 'formulaReference' as const },
    { id: 'literature-review', label: 'Literature Review', icon: Search, feature: 'literatureReview' as const },
    { id: 'reference-manager', label: 'References', icon: BookOpen, feature: 'referenceManager' as const },
    { id: 'thesis-assistant', label: 'Thesis Assistant', icon: PenTool, feature: 'thesisWriting' as const },
    { id: 'data-analysis', label: 'Data Analysis', icon: BarChart3, feature: 'dataAnalysis' as const },
    { id: 'community', label: 'A1Connect', icon: Users, feature: 'studentCommunity' as const },
    { id: 'gamification', label: 'Achievements', icon: Trophy, feature: 'adaptiveLearning' as const },
    { id: 'ethics', label: 'Ethics Dashboard', icon: Shield, feature: 'dashboard' as const },
    { id: 'settings', label: 'Settings', icon: Globe, feature: 'dashboard' as const },
  ];

  // Filter tabs based on user level
  const availableTabs = tabs.filter(tab => hasFeatureAccess(academicLevel, tab.feature));

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
      >
        {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 sm:w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6 sm:mb-8 pt-16 sm:pt-20">
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-6 sm:h-8 w-auto object-contain"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Student Portal</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Tabs value={activeTab} onValueChange={onTabChange} orientation="vertical" className="w-full">
              <TabsList className={`grid w-full h-auto bg-transparent gap-1 grid-rows-${availableTabs.length}`}>
                {availableTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id}
                      className="justify-start w-full data-[state=active]:bg-green-100 data-[state=active]:text-green-700 text-sm py-3"
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-xs sm:text-sm text-gray-500">
              <p className="mb-1">📚 Personalized Learning</p>
              <p>Built for Nigerian Students</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
