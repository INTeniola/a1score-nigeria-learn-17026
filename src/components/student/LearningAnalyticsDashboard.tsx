import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Target, TrendingUp, Award, Flame, Clock } from 'lucide-react';

export function LearningAnalyticsDashboard() {
  const { sessions, conceptMastery, effectiveness, loading } = useLearningAnalytics();

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Learning Analytics</h2>
        <p className="text-muted-foreground">Track your progress and master concepts effectively</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.studyStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              {effectiveness.studyStreak > 0 ? 'Keep it up!' : 'Start your streak today!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.averageAccuracy.toFixed(1)}%</div>
            <Progress value={effectiveness.averageAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concepts Mastered</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.conceptsMastered}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {effectiveness.strongAreas.length} strong areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Learning activities completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.averageDuration.toFixed(0)} min</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per study session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas to Improve</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveness.weakAreas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need more practice
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="concepts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="concepts">Concept Mastery</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="concepts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Concept Mastery Levels</CardTitle>
              <CardDescription>Track your understanding of different topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {conceptMastery.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start learning to see your concept mastery!
                </p>
              ) : (
                conceptMastery.map((concept) => (
                  <div key={concept.concept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{concept.concept}</span>
                      <Badge
                        variant={
                          concept.masteryLevel >= 80
                            ? 'default'
                            : concept.masteryLevel >= 60
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {concept.masteryLevel}%
                      </Badge>
                    </div>
                    <Progress value={concept.masteryLevel} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Practiced {concept.practiceCount} times · Last: {new Date(concept.lastPracticed).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Sessions</CardTitle>
              <CardDescription>Your latest study activities</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sessions yet. Start learning to see your history!
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{session.session_type}</Badge>
                          <span className="font-medium">{session.subject}</span>
                          {session.topic && (
                            <span className="text-sm text-muted-foreground">· {session.topic}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.started_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {session.questions_answered > 0 && (
                          <>
                            <p className="font-bold">
                              {Math.round((session.correct_answers / session.questions_answered) * 100)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.correct_answers}/{session.questions_answered}
                            </p>
                          </>
                        )}
                        {session.duration_minutes && (
                          <p className="text-xs text-muted-foreground">{session.duration_minutes} min</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {effectiveness.strongAreas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-500" />
                    Strong Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {effectiveness.strongAreas.map((area) => (
                      <Badge key={area} variant="default">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Great job! You've mastered these concepts.
                  </p>
                </div>
              )}

              {effectiveness.weakAreas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Areas to Improve
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {effectiveness.weakAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Focus on these topics to improve your understanding.
                  </p>
                </div>
              )}

              {effectiveness.studyStreak >= 7 && (
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Amazing Streak!
                  </h3>
                  <p className="text-sm">
                    You've been studying for {effectiveness.studyStreak} days straight! Keep up the excellent work!
                  </p>
                </div>
              )}

              {effectiveness.averageAccuracy >= 90 && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    High Performance
                  </h3>
                  <p className="text-sm">
                    Your average accuracy is {effectiveness.averageAccuracy.toFixed(1)}%! You're doing exceptionally well!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
