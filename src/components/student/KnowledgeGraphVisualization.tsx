import { useLearningGraph } from '@/hooks/useLearningGraph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Target, 
  TrendingUp, 
  BookOpen, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function KnowledgeGraphVisualization() {
  const {
    concepts,
    masteryData,
    analytics,
    loading,
    getMasteryForConcept,
    areAllPrerequisitesMet
  } = useLearningGraph();

  if (loading) {
    return <div className="text-center py-12">Loading knowledge graph...</div>;
  }

  const getDifficultyColor = (rating: number) => {
    if (rating <= 3) return 'bg-green-500';
    if (rating <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            Knowledge Graph
          </h2>
          <p className="text-muted-foreground">Visual learning path with prerequisite tracking</p>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Velocity</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.learningVelocity.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">concepts/week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concepts Mastered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conceptsMastered}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.conceptsInProgress} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageSuccessRate.toFixed(1)}%</div>
              <Progress value={analytics.averageSuccessRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.totalStudyTime)}</div>
              <p className="text-xs text-muted-foreground">minutes total</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="concepts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="concepts">All Concepts</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="weak">Weak Areas</TabsTrigger>
          <TabsTrigger value="mastered">Mastered</TabsTrigger>
        </TabsList>

        <TabsContent value="concepts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Concept Map</CardTitle>
              <CardDescription>All available concepts organized by difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              {concepts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No concepts available yet. Check back soon!
                </p>
              ) : (
                <div className="space-y-4">
                  {concepts.map((concept) => {
                    const mastery = getMasteryForConcept(concept.concept_id);
                    const prerequisitesMet = areAllPrerequisitesMet(concept.concept_id);

                    return (
                      <div
                        key={concept.id}
                        className={`p-4 border rounded-lg ${
                          !prerequisitesMet ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{concept.concept_name}</h3>
                              <Badge variant="outline">{concept.subject}</Badge>
                              {mastery && (
                                <Badge
                                  variant={mastery.mastery_level >= 70 ? 'default' : 'secondary'}
                                >
                                  {Math.round(mastery.mastery_level)}% mastered
                                </Badge>
                              )}
                            </div>
                            {concept.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {concept.description}
                              </p>
                            )}
                          </div>
                          {concept.difficulty_rating && (
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${getDifficultyColor(
                                  concept.difficulty_rating
                                )}`}
                              />
                              <span className="text-sm text-muted-foreground">
                                Level {concept.difficulty_rating}
                              </span>
                            </div>
                          )}
                        </div>

                        {mastery && (
                          <Progress value={mastery.mastery_level} className="mb-2" />
                        )}

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {concept.estimated_learning_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {concept.estimated_learning_time} min
                            </span>
                          )}
                          {concept.prerequisite_concepts &&
                            concept.prerequisite_concepts.length > 0 && (
                              <span className="flex items-center gap-1">
                                {prerequisitesMet ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-orange-500" />
                                )}
                                {concept.prerequisite_concepts.length} prerequisites
                              </span>
                            )}
                          {concept.tags && (
                            <div className="flex gap-1">
                              {concept.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {concept.learning_objectives && concept.learning_objectives.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-1">Learning Objectives:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {concept.learning_objectives.slice(0, 3).map((obj, idx) => (
                                <li key={idx}>• {obj}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Concepts you're ready to learn based on your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!analytics || analytics.recommendedConcepts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Complete some concepts to get personalized recommendations!
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.recommendedConcepts.map((recommended) => {
                    const concept = concepts.find(
                      (c) => c.concept_id === recommended.concept_id
                    );
                    if (!concept) return null;

                    return (
                      <div
                        key={recommended.concept_id}
                        className="p-4 border rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{recommended.concept_name}</h3>
                          <Badge variant={recommended.prerequisites_met ? 'default' : 'secondary'}>
                            {recommended.prerequisites_met ? 'Ready' : 'Prerequisites needed'}
                          </Badge>
                        </div>
                        {concept.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {concept.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={`w-2 h-2 rounded-full ${getDifficultyColor(
                              recommended.difficulty_rating
                            )}`}
                          />
                          Difficulty: {recommended.difficulty_rating}/10
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Areas Needing Practice
              </CardTitle>
              <CardDescription>Focus on these concepts to improve</CardDescription>
            </CardHeader>
            <CardContent>
              {!analytics || analytics.weakAreas.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Great job! No weak areas detected.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.weakAreas.map((area, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{area.concept_name}</h3>
                          <p className="text-sm text-muted-foreground">{area.subject}</p>
                        </div>
                        <span className={`text-2xl font-bold ${getMasteryColor(area.mastery_level)}`}>
                          {Math.round(area.mastery_level)}%
                        </span>
                      </div>
                      <Progress value={area.mastery_level} className="mb-2" />
                      {area.needs_review && (
                        <Badge variant="destructive" className="text-xs">
                          Review overdue
                        </Badge>
                      )}
                      {area.last_reviewed && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last reviewed: {new Date(area.last_reviewed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mastered" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Mastered Concepts
              </CardTitle>
              <CardDescription>Concepts you've successfully learned</CardDescription>
            </CardHeader>
            <CardContent>
              {masteryData.filter((m) => m.mastery_level >= 70).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start learning to master concepts!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {masteryData
                    .filter((m) => m.mastery_level >= 70)
                    .map((mastery) => (
                      <div key={mastery.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{mastery.concept_name}</h3>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="space-y-2">
                          <Progress value={mastery.mastery_level} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{Math.round(mastery.mastery_level)}% mastered</span>
                            <span>
                              {mastery.successful_interactions}/{mastery.total_interactions} correct
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
