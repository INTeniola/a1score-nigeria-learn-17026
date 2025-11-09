import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calculator, FlaskConical, Globe, LogOut, Trophy, TrendingUp, GraduationCap, Microscope, FileText, Bot, Brain, Clock, Shield, Play, Target, BarChart3, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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

  const getDemoProfile = () => {
    return studentProfiles.find(p => p.name === user.name) || studentProfiles[0];
  };

  const demoProfile = getDemoProfile();

  const getContentByLevel = (level?: string) => {
    if (level === 'undergraduate') {
      return {
        subjects: [
          { name: 'Calculus', icon: Calculator, progress: 78, color: 'bg-blue-500' },
          { name: 'Data Structures', icon: BookOpen, progress: 65, color: 'bg-purple-500' },
          { name: 'Chemistry', icon: FlaskConical, progress: 72, color: 'bg-green-500' },
          { name: 'Academic Writing', icon: Globe, progress: 84, color: 'bg-orange-500' },
        ],
        achievements: [
          { title: 'Research Pioneer', description: 'Completed first research project', icon: GraduationCap },
          { title: 'Code Master', description: 'Solved 50 programming challenges', icon: Calculator },
          { title: 'Consistent Scholar', description: '30 days learning streak', icon: TrendingUp },
        ],
        welcomeMessage: 'Ready to excel in your undergraduate studies?',
        stats: { streak: 30, points: '12,450', leagueRank: '#47', leagueName: 'Gold League' }
      };
    } else if (level === 'postgraduate-taught' || level === 'postgraduate-research') {
      return {
        subjects: [
          { name: 'Advanced Research Methods', icon: Microscope, progress: 85, color: 'bg-red-500' },
          { name: 'Statistical Analysis', icon: Calculator, progress: 78, color: 'bg-blue-500' },
          { name: 'Literature Review', icon: BookOpen, progress: 90, color: 'bg-green-500' },
          { name: 'Thesis Writing', icon: Globe, progress: 67, color: 'bg-purple-500' },
        ],
        achievements: [
          { title: 'Research Expert', description: 'Published first paper', icon: Microscope },
          { title: 'Data Analyst', description: 'Mastered SPSS & R', icon: Calculator },
          { title: 'Academic Writer', description: 'Thesis chapter completed', icon: GraduationCap },
        ],
        welcomeMessage: level === 'postgraduate-research' 
          ? 'Advancing your research journey!' 
          : 'Excelling in your postgraduate studies!',
        stats: { streak: 45, points: '24,750', leagueRank: '#12', leagueName: 'Diamond League' }
      };
    } else {
      // Secondary school content (JSS/SS levels)
      const baseContent = {
        subjects: [
          { name: 'Mathematics', icon: Calculator, progress: 78, color: 'bg-blue-500' },
          { name: 'Physics', icon: FlaskConical, progress: 65, color: 'bg-purple-500' },
          { name: 'Chemistry', icon: FlaskConical, progress: 72, color: 'bg-green-500' },
          { name: 'English', icon: Globe, progress: 84, color: 'bg-orange-500' },
        ],
        achievements: [
          { title: 'Quiz Master', description: 'Completed 10 quizzes', icon: Trophy },
          { title: 'Math Genius', description: 'Scored 90% in Algebra', icon: Calculator },
          { title: 'Consistent Learner', description: `${demoProfile.studyStreak} days streak`, icon: TrendingUp },
        ],
        welcomeMessage: 'Ready to continue your learning journey?',
        stats: { 
          streak: demoProfile.studyStreak, 
          points: `${demoProfile.totalPoints}`, 
          leagueRank: '#245',
          leagueName: 'Bronze League'
        }
      };

      return baseContent;
    }
  };

  const content = getContentByLevel(user.level);

  const getLevelBadge = (level?: string) => {
    if (level === 'undergraduate') return <Badge className="bg-blue-100 text-blue-800">Undergraduate</Badge>;
    if (level === 'postgraduate-taught') return <Badge className="bg-purple-100 text-purple-800">PG Taught</Badge>;
    if (level === 'postgraduate-research') return <Badge className="bg-red-100 text-red-800">PG Research</Badge>;
    if (level?.startsWith('ss')) return <Badge className="bg-green-100 text-green-800">Senior Secondary</Badge>;
    if (level?.startsWith('jss')) return <Badge className="bg-orange-100 text-orange-800">Junior Secondary</Badge>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30">
        <div className="px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 ml-12 sm:ml-16">
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-6 sm:h-8 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">A1Score</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm text-gray-600">Welcome back, {user.name}!</p>
                {getLevelBadge(user.level)}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} size="sm" className="text-xs sm:text-sm">
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} userLevel={user.level} />

      {/* Main Content */}
      <div className="pt-16 sm:pt-20 px-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome Banner - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h2>
                      <p className="text-blue-100">{content.welcomeMessage}</p>
                    </div>
                    <div className="hidden md:flex gap-8 text-center">
                      <div>
                        <div className="text-3xl font-bold">{content.stats.streak}</div>
                        <div className="text-sm text-blue-100">Day Streak</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{content.stats.leagueRank}</div>
                        <div className="text-sm text-blue-100">{content.stats.leagueName}</div>
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
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Start Learning</h3>
                <p className="text-sm text-gray-600">Choose how you want to study today</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('animated-tutorials')}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-blue-500 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Play className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Tutorials</div>
                    <div className="text-xs text-gray-500 mt-1">Visual learning</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setActiveTab('tutor')}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-green-500 transition-all"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="h-7 w-7 text-green-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">AI Tutor</div>
                    <div className="text-xs text-gray-500 mt-1">Get instant help</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setActiveTab('quiz')}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-purple-500 transition-all"
                >
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Practice Quiz</div>
                    <div className="text-xs text-gray-500 mt-1">Test your knowledge</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => setActiveTab('subjects')}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:border-orange-500 transition-all"
                >
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-orange-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Browse Subjects</div>
                    <div className="text-xs text-gray-500 mt-1">Explore topics</div>
                  </div>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                💡 Use the menu (top-left) to access Study Timer, Progress Tracker, and more tools
              </p>
            </motion.div>

            {/* Subject Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-600">Track your learning across subjects</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {content.subjects.map((subject, index) => (
                  <Card 
                    key={subject.name} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setActiveTab('subjects')}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-base">{subject.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {subject.progress}%
                        </Badge>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-gray-600">
                        {subject.progress >= 80 ? '🔥 Excellent' : subject.progress >= 60 ? '💪 Good Progress' : '📈 Keep Going'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {content.achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="p-2 bg-yellow-400 rounded-full flex-shrink-0">
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm">{achievement.title}</div>
                            <div className="text-xs text-gray-600 truncate">{achievement.description}</div>
                          </div>
                        </div>
                      );
                    })}
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

          <TabsContent value="learning-paths">
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

          <TabsContent value="progress-tracker">
            <ProgressTrackerDashboard />
          </TabsContent>

          <TabsContent value="study-goals">
            <StudyGoals />
          </TabsContent>

          <TabsContent value="study-timer">
            <StudyTimer />
          </TabsContent>

          <TabsContent value="pdf-helper" className="space-y-6">
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

          <TabsContent value="homework-scanner">
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
