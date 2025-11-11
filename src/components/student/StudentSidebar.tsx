
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, feature: 'dashboard' as const },
    { id: 'tutor', label: 'AI Tutor', icon: Brain, feature: 'aiTutor' as const },
    { id: 'quiz', label: 'Practice Quiz', icon: MessageCircle, feature: 'quizzes' as const },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, feature: 'subjects' as const },
    { id: 'animated-tutorials', label: 'Tutorials', icon: Play, feature: 'dashboard' as const },
    { id: 'learning-paths', label: 'Learning Paths', icon: TrendingUp, feature: 'dashboard' as const },
    { id: 'pdf-helper', label: 'PDF Helper', icon: FileText, feature: 'pdfHelper' as const },
    { id: 'homework-scanner', label: 'Homework Scanner', icon: Camera, feature: 'homeworkScanner' as const },
    { id: 'study-timer', label: 'Study Timer', icon: Timer, feature: 'studyTimer' as const },
    { id: 'progress-tracker', label: 'Progress Tracker', icon: BarChart3, feature: 'dashboard' as const },
    { id: 'study-goals', label: 'Study Goals', icon: Target, feature: 'studyGoals' as const },
    { id: 'formula-reference', label: 'Formulas', icon: Calculator, feature: 'formulaReference' as const },
    { id: 'community', label: 'A1Connect', icon: Users, feature: 'studentCommunity' as const },
    { id: 'gamification', label: 'Achievements', icon: Trophy, feature: 'adaptiveLearning' as const },
    { id: 'ethics', label: 'Ethics Dashboard', icon: Shield, feature: 'dashboard' as const },
    { id: 'literature-review', label: 'Literature Review', icon: Search, feature: 'literatureReview' as const },
    { id: 'reference-manager', label: 'References', icon: PenTool, feature: 'referenceManager' as const },
    { id: 'thesis-assistant', label: 'Thesis Assistant', icon: Globe, feature: 'thesisWriting' as const },
    { id: 'data-analysis', label: 'Data Analysis', icon: BarChart3, feature: 'dataAnalysis' as const },
  ];

  // Filter tabs based on user level
  const availableTabs = tabs.filter(tab => hasFeatureAccess(academicLevel, tab.feature));
  
  // Primary tabs for mobile bottom nav (most commonly used)
  const primaryTabs = availableTabs.filter(tab => 
    ['dashboard', 'tutor', 'quiz', 'subjects'].includes(tab.id)
  );

  return (
    <>
      {/* Desktop Sidebar Toggle Button */}
      <Button
        onClick={toggleSidebar}
        className="hidden md:block fixed top-4 left-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110"
        size="icon"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Overlay */}
      {isOpen && (
        <div 
          className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`
        hidden md:block fixed top-0 left-0 h-full w-64 bg-card border-r shadow-xl z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8 pt-20">
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-8 w-auto object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-card-foreground">Student Portal</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {availableTabs.map(tab => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all min-h-12 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center text-xs text-muted-foreground leading-relaxed">
              <p className="mb-1">📚 Personalized Learning</p>
              <p>Built for Nigerian Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-40 h-16">
        <div className="flex items-center justify-around h-full px-1">
          {primaryTabs.map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-12 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <IconComponent className="h-6 w-6" />
                <span className="text-[10px] font-medium mt-0.5 truncate max-w-[60px]">{tab.label}</span>
                {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />}
              </button>
            );
          })}
          <button
            onClick={toggleSidebar}
            className="flex flex-col items-center justify-center flex-1 h-full min-h-12 rounded-lg text-muted-foreground hover:bg-accent transition-all"
          >
            <Menu className="h-6 w-6" />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu Drawer */}
      {isOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
          <div className="md:hidden fixed inset-x-0 bottom-0 bg-card rounded-t-3xl shadow-2xl z-50 max-h-[75vh] overflow-y-auto pb-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-card-foreground leading-relaxed">All Features</h3>
                <Button
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {availableTabs.map(tab => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all min-h-20 ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-2 border-primary' 
                          : 'text-muted-foreground hover:bg-accent border-2 border-transparent'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mb-1.5" />
                      <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StudentSidebar;
