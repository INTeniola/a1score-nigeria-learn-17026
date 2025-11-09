import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, BookOpen } from 'lucide-react';

interface WeakConcept {
  subject: string;
  topic: string;
  mastery: number;
  last_studied: string;
}

interface WeakConceptsPanelProps {
  concepts: WeakConcept[];
  onPractice?: (concept: WeakConcept) => void;
}

export function WeakConceptsPanel({ concepts, onPractice }: WeakConceptsPanelProps) {
  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 70) return 'text-green-600';
    if (mastery >= 50) return 'text-yellow-600';
    if (mastery >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDaysSinceStudied = (lastStudied: string): number => {
    if (!lastStudied) return 999;
    const diff = Date.now() - new Date(lastStudied).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Focus Areas
        </CardTitle>
        <CardDescription>
          Topics that need more practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {concepts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Great job! No weak areas identified.</p>
          </div>
        ) : (
          concepts.map((concept, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{concept.topic}</h4>
                    <Badge variant="outline" className="text-xs">
                      {concept.subject}
                    </Badge>
                  </div>
                  {concept.last_studied && (
                    <p className="text-xs text-muted-foreground">
                      Last studied {getDaysSinceStudied(concept.last_studied)} days ago
                    </p>
                  )}
                </div>
                {onPractice && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPractice(concept)}
                    className="ml-2"
                  >
                    Practice
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className={`font-semibold ${getMasteryColor(concept.mastery)}`}>
                    {Math.round(concept.mastery)}%
                  </span>
                </div>
                <Progress 
                  value={concept.mastery} 
                  className="h-2"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
