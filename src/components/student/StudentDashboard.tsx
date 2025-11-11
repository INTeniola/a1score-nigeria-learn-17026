import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, FlaskConical, Globe, LogOut, Trophy, TrendingUp, Bot, Brain, Clock, Play, Target, BarChart3, Sparkles, Microscope, FileText } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useSubjectProgress } from "@/hooks/useSubjectProgress";
import { motion } from "framer-motion";
import { DashboardCardSkeleton } from "@/components/ui/loading-skeleton";
import AITutorChat from "./AITutorChat";
import QuizInterface from "./QuizInterface";
import SubjectHub from "./SubjectHub";
import AnimatedTutorialSystem from "./AnimatedTutorialSystem";
import LearningPathHub from "./LearningPathHub";
import StudentCommunity from "./StudentCommunity";
import GamificationSystem from "../gamification/GamificationSystem";
import LanguageSelector from "../language/LanguageSelector";
import MonetizationDemo from "../monetization/MonetizationDemo";
import StudentSidebar from "./StudentSidebar";
import FormulaReference from "./FormulaReference";
import { ProgressTrackerDashboard } from "./ProgressTrackerDashboard";
import StudyGoals from "./StudyGoals";
import StudyTimer from "./StudyTimer";
import PDFUploader from "./PDFUploader";
import PDFAnalysisViewer from "./PDFAnalysisViewer";
import LiteratureReviewAssistant from "./LiteratureReviewAssistant";
import ReferenceManager from "./ReferenceManager";
import ThesisWritingAssistant from "./ThesisWritingAssistant";
import DataAnalysisHub from "./DataAnalysisHub";
import HomeworkScanner from "./HomeworkScanner";
import EthicsDashboard from "@/components/ethics/EthicsDashboard";
import { studentProfiles } from "@/data/sampleData";
import { type AcademicLevel, hasFeatureAccess, getLevelFromString, LEVEL_DISPLAY_NAMES } from "@/types/academicLevel";

interface StudentDashboardProps {
  user: { type: 'student' | 'teacher'; name: string; level?: string };
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const location = useLocation();
  const academicLevel = getLevelFromString(user.level);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'pro'>('free');
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  // Fetch user preferences and real data
  const { preferences, loading: preferencesLoading } = useUserPreferences();
  const { subjects: userSubjects, loading: subjectsLoading } = useSubjectProgress(preferences?.learningSubjects);

  // Handle routing to study tools
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('formula-reference')) {
      setActiveTab('formula-reference');
    } else if (path.includes('progress-tracker')) {
      setActiveTab('progress-tracker');
    } else if (path.includes('study-goals')) {
      setActiveTab('study-goals');
    } else if (path.includes('study-timer')) {
      setActiveTab('study-timer');
    } else if (path === '/') {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  // Fetch real user data
  const [userStats, setUserStats] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // Get quiz attempts
        const { data: quizzes } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', authUser.id);

        // Get learning streak
        const { data: streak } = await supabase
          .from('learning_streaks')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        // Get learning points
        const { data: points } = await supabase
          .from('learning_points')
          .select('points')
          .eq('user_id', authUser.id);

        const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;
        const avgScore = quizzes && quizzes.length > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
          : 0;

        // Calculate league
        const leagueName = totalPoints < 500 ? 'Bronze League' :
                          totalPoints < 1500 ? 'Silver League' :
                          totalPoints < 3000 ? 'Gold League' : 'Diamond League';

        setUserStats({
          streak: streak?.current_streak || 0,
          points: totalPoints.toLocaleString(),
          leagueRank: '#--',
          leagueName,
          avgScore
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, []);

  // Get welcome message based on preferences
  const getWelcomeMessage = () => {
    if (preferences?.examDate && preferences.daysUntilExam && preferences.daysUntilExam > 0) {
      return `${preferences.daysUntilExam} days until your exam - let's prepare!`;
    }
    if (preferences?.learningSubjects && preferences.learningSubjects.length > 0) {
      return `Ready to master ${preferences.learningSubjects.join(', ')}?`;
    }
    return 'Ready to continue your learning journey?';
  };

  // Map subjects to icons
  const getSubjectIcon = (subject: string) => {
    const lower = subject.toLowerCase();
    if (lower.includes('math') || lower.includes('algebra') || lower.includes('calculus')) return Calculator;
    if (lower.includes('physics') || lower.includes('chemistry') || lower.includes('biology')) return FlaskConical;
    if (lower.includes('english') || lower.includes('literature')) return Globe;
    return BookOpen;
  };

  const getSubjectColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];
    return colors[index % colors.length];
  };

  const getLevelBadge = (level?: string) => {
    if (level === 'undergraduate') return <Badge className="bg-blue-100 text-blue-800">Undergraduate</Badge>;
    if (level === 'postgraduate-taught') return <Badge className="bg-purple-100 text-purple-800">PG Taught</Badge>;
    if (level === 'postgraduate-research') return <Badge className="bg-red-100 text-red-800">PG Research</Badge>;
    if (level?.startsWith('ss')) return <Badge className="bg-green-100 text-green-800">Senior Secondary</Badge>;
    if (level?.startsWith('jss')) return <Badge className="bg-orange-100 text-orange-800">Junior Secondary</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b fixed top-0 left-0 right-0 z-30">
        <div className="px-4 md:px-6 lg:px-8 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-6 md:h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground">A1Score</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs md:text-sm text-muted-foreground">Welcome, {user.name}!</p>
                {getLevelBadge(user.level)}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm" className="text-xs md:text-sm px-2 md:px-4">
            <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} userLevel={user.level} />

      {/* Main Content */}
      <div className="pt-14 md:pt-20 px-4 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-8 md:space-y-12 max-w-7xl mx-auto">
            {/* Welcome Banner - Personalized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-4 md:p-6 lg:p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 md:space-y-2">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed">Welcome back, {user.name}! 👋</h2>
                      <p className="text-sm md:text-base leading-relaxed text-blue-100">{getWelcomeMessage()}</p>
                    </div>
                    <div className="hidden md:flex gap-8 text-center">
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">{userStats?.streak || 0}</div>
                        <div className="text-xs md:text-sm text-blue-100">Day Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl md:text-3xl font-bold">{userStats?.leagueRank || '#--'}</div>
                        <div className="text-xs md:text-sm text-blue-100">{userStats?.leagueName || 'Bronze League'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Core Learning Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground leading-relaxed">Start Learning</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Choose how you want to study today</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Button 
                onClick={() => setActiveTab('animated-tutorials')}
                variant="outline"
                className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 md:gap-3 hover:shadow-lg hover:border-blue-500 transition-all hover-gpu"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Play className="h-5 w-5 md:h-7 md:w-7 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-sm md:text-base font-semibold">Tutorials</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Visual learning</div>
                </div>
              </Button>

              <Button 
                onClick={() => setActiveTab('tutor')}
                variant="outline"
                className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 md:gap-3 hover:shadow-lg hover:border-green-500 transition-all hover-gpu"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 md:h-7 md:w-7 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-sm md:text-base font-semibold">AI Tutor</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Get instant help</div>
                </div>
              </Button>

              <Button 
                onClick={() => setActiveTab('quiz')}
                variant="outline"
                className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 md:gap-3 hover:shadow-lg hover:border-purple-500 transition-all hover-gpu"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 md:h-7 md:w-7 text-purple-600" />
                </div>
                <div className="text-center">
                  <div className="text-sm md:text-base font-semibold">Practice Quiz</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Test your knowledge</div>
                </div>
              </Button>

              <Button 
                onClick={() => setActiveTab('subjects')}
                variant="outline"
                className="h-24 md:h-32 flex flex-col items-center justify-center gap-2 md:gap-3 hover:shadow-lg hover:border-orange-500 transition-all hover-gpu"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 md:h-7 md:w-7 text-orange-600" />
                </div>
                <div className="text-center">
                  <div className="text-sm md:text-base font-semibold">Browse Subjects</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Explore topics</div>
                </div>
              </Button>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4 text-center">
                💡 Use the menu to access more tools
              </p>
            </motion.div>

            {/* Subject Progress - Real Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground leading-relaxed">Your Subjects</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {userSubjects.length === 0 
                    ? "Start studying to track your progress" 
                    : "Based on your actual study activity"}
                </p>
              </div>

              {subjectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <DashboardCardSkeleton key={i} />
                  ))}
                </div>
              ) : userSubjects.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2 leading-relaxed">
                        {preferences?.learningSubjects && preferences.learningSubjects.length > 0
                          ? `Let's start with ${preferences.learningSubjects.join(', ')}`
                          : 'No Subjects Yet'}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                        {preferences?.learningSubjects && preferences.learningSubjects.length > 0
                          ? 'Take your first quiz or start a study session to begin tracking progress!'
                          : 'Complete onboarding or start studying to see your subjects here'}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => setActiveTab('quiz')}>
                          <Brain className="h-4 w-4 mr-2" />
                          Take a Quiz
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab('study-timer')}>
                          <Clock className="h-4 w-4 mr-2" />
                          Start Studying
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {userSubjects.slice(0, 4).map((subject, index) => {
                    const Icon = getSubjectIcon(subject.subject);
                    const color = getSubjectColor(index);
                    const progressPercent = subject.hasActivity 
                      ? Math.min(100, Math.round((subject.totalQuizzes * 10) + (subject.totalStudyHours * 2)))
                      : 0;
                    
                    return (
                      <Card 
                        key={subject.subject} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setActiveTab('subjects')}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-sm md:text-base flex items-center gap-2">
                              <div className={`p-1 md:p-1.5 ${color} rounded`}>
                                <Icon className="h-3 w-3 md:h-3.5 md:w-3.5 text-white" />
                              </div>
                              <span className="truncate">{subject.subject}</span>
                            </CardTitle>
                            <Badge variant={subject.hasActivity ? "secondary" : "outline"} className="text-[10px] md:text-xs">
                              {progressPercent}%
                            </Badge>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </CardHeader>
                        <CardContent className="pt-0">
                          {subject.hasActivity ? (
                            <>
                              <div className="text-xs text-gray-600 mb-2">
                                {subject.averageScore >= 80 ? '🔥 Excellent' : subject.averageScore >= 60 ? '💪 Good Progress' : '📈 Keep Going'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subject.totalStudyHours}h studied • {subject.totalQuizzes} quizzes
                              </div>
                            </>
                          ) : (
                            <div className="text-xs text-gray-500">
                              ✨ Ready to start? Click to begin!
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {userSubjects.length > 4 && (
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={() => setActiveTab('subjects')}>
                    View All {userSubjects.length} Subjects
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Quick Actions - Personalized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => setActiveTab('subjects')}
                    >
                      <Target className="h-5 w-5 text-blue-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Browse Subjects</div>
                        <div className="text-xs text-gray-500">Explore topics</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => setActiveTab('progress-tracker')}
                    >
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Track Progress</div>
                        <div className="text-xs text-gray-500">View analytics</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => setActiveTab('gamification')}
                    >
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Achievements</div>
                        <div className="text-xs text-gray-500">View rewards</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Postgraduate Advanced Features */}
            {(academicLevel === 'Postgraduate-Taught' || academicLevel === 'Postgraduate-Research') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Research Tools</h3>
                  <p className="text-sm text-gray-600">Advanced features for postgraduate students</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setActiveTab('literature-review')}
                    variant="outline"
                    className="h-28 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                  >
                    <Microscope className="h-6 w-6 text-indigo-600" />
                    <span className="font-medium text-sm">Literature Review</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('thesis-assistant')}
                    variant="outline"
                    className="h-28 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                  >
                    <FileText className="h-6 w-6 text-pink-600" />
                    <span className="font-medium text-sm">Thesis Assistant</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('data-analysis')}
                    variant="outline"
                    className="h-28 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                  >
                    <BarChart3 className="h-6 w-6 text-teal-600" />
                    <span className="font-medium text-sm">Data Analysis</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('reference-manager')}
                    variant="outline"
                    className="h-28 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                  >
                    <BookOpen className="h-6 w-6 text-amber-600" />
                    <span className="font-medium text-sm">References</span>
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="animated-tutorials">
            <AnimatedTutorialSystem />
          </TabsContent>

          <TabsContent value="learning-paths" className="space-y-4">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <LearningPathHub />
          </TabsContent>

          <TabsContent value="tutor">
            <AITutorChat />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectHub />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizInterface />
          </TabsContent>

          <TabsContent value="gamification">
            <GamificationSystem 
              studentId={user.name} 
              onBadgeEarned={(badge) => console.log(`Badge earned: ${badge}`)}
            />
          </TabsContent>

          <TabsContent value="community">
            <StudentCommunity />
          </TabsContent>

          <TabsContent value="formula-reference">
            <FormulaReference />
          </TabsContent>

          <TabsContent value="progress-tracker" className="space-y-4">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <ProgressTrackerDashboard />
          </TabsContent>

          <TabsContent value="study-goals" className="space-y-4">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <StudyGoals />
          </TabsContent>

          <TabsContent value="study-timer" className="space-y-4">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <StudyTimer />
          </TabsContent>

          <TabsContent value="pdf-helper" className="space-y-6">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            {!currentAnalysis ? (
              <PDFUploader onAnalysisComplete={setCurrentAnalysis} />
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={() => setCurrentAnalysis(null)}
                  variant="outline"
                  className="mb-4"
                >
                  ← Upload New PDF
                </Button>
                <PDFAnalysisViewer analysis={currentAnalysis} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="literature-review">
            <LiteratureReviewAssistant />
          </TabsContent>

          <TabsContent value="reference-manager">
            <ReferenceManager />
          </TabsContent>

          <TabsContent value="thesis-assistant">
            <ThesisWritingAssistant />
          </TabsContent>

          <TabsContent value="data-analysis">
            <DataAnalysisHub />
          </TabsContent>

          <TabsContent value="homework-scanner" className="space-y-4">
            <Button 
              onClick={() => setActiveTab('dashboard')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <HomeworkScanner onSolutionGenerated={(solution) => console.log('Solution:', solution)} />
          </TabsContent>

          <TabsContent value="ethics" className="space-y-6">
            <EthicsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
            <MonetizationDemo 
              userType="student"
              currentPlan={currentPlan}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
