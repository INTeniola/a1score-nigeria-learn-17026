import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';
import { ConceptMasteryRadar } from './ConceptMasteryRadar';
import { StudyTimeTrendsChart } from './StudyTimeTrendsChart';
import { QuizPerformanceChart } from './QuizPerformanceChart';
import { StudyStreakCalendar } from './StudyStreakCalendar';
import { GoalManager } from './GoalManager';
import { LearningInsightsPanel } from './LearningInsightsPanel';
import { ExamReadinessWidget } from './ExamReadinessWidget';
import { WeakConceptsPanel } from './WeakConceptsPanel';
import { 
  BarChart3, 
  Download, 
  RefreshCw,
  Clock,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

export function ProgressTrackerDashboard() {
  const {
    loading,
    conceptMastery,
    studyTimeTrends,
    quizPerformance,
    insights,
    weakConcepts,
    studyStreak,
    totalStudyHours,
    generateTimeOfDayInsight,
    markInsightAsRead,
    refreshAnalytics
  } = useProgressAnalytics();

  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    toast.info('PDF export coming soon!');
    // TODO: Implement PDF export
    setTimeout(() => setExportingPDF(false), 1000);
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      // Prepare CSV data
      const csvData = [
        ['Study Sessions Data'],
        ['Date', 'Hours', 'Sessions'],
        ...studyTimeTrends.map(t => [t.date, t.hours.toString(), t.sessions.toString()]),
        [''],
        ['Quiz Performance Data'],
        ['Date', 'Score', 'Subject'],
        ...quizPerformance.map(q => [q.date, q.score.toString(), q.subject]),
        [''],
        ['Concept Mastery Data'],
        ['Subject', 'Mastery (%)'],
        ...conceptMastery.map(c => [c.subject, Math.round(c.mastery).toString()])
      ];

      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExportingCSV(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6" />
                Progress Tracker
              </CardTitle>
              <CardDescription>
                Comprehensive insights into your learning journey
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exportingCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exportingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Study Streak</span>
              </div>
              <p className="text-2xl font-bold">{studyStreak} days</p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Hours</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(totalStudyHours)}h</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Subjects Tracked</span>
              </div>
              <p className="text-2xl font-bold">{conceptMastery.length}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600">NEW</Badge>
                <span className="text-sm font-medium">Insights</span>
              </div>
              <p className="text-2xl font-bold">{insights.filter(i => !i.is_read).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="exam-prep">Exam Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <ConceptMasteryRadar data={conceptMastery} />
            <StudyTimeTrendsChart data={studyTimeTrends} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <QuizPerformanceChart data={quizPerformance} />
            <StudyStreakCalendar currentStreak={studyStreak} />
          </div>

          <WeakConceptsPanel concepts={weakConcepts} />
        </TabsContent>

        <TabsContent value="goals">
          <GoalManager />
        </TabsContent>

        <TabsContent value="insights">
          <LearningInsightsPanel
            insights={insights}
            onMarkAsRead={markInsightAsRead}
            onGenerateNew={generateTimeOfDayInsight}
          />
        </TabsContent>

        <TabsContent value="exam-prep">
          <ExamReadinessWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}
