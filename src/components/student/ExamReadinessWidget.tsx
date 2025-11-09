import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';

interface ExamReadiness {
  readiness_score: number;
  mastery_score: number;
  practice_count: number;
  study_hours: number;
  days_remaining: number;
  status: 'ready' | 'almost_ready' | 'needs_work' | 'not_ready';
  recommendation: string;
}

export function ExamReadinessWidget() {
  const { getExamReadiness } = useProgressAnalytics();
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [readiness, setReadiness] = useState<ExamReadiness | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!subject || !examDate) return;

    setLoading(true);
    try {
      const date = new Date(examDate);
      const result = await getExamReadiness(subject, date);
      setReadiness(result);
    } catch (error) {
      console.error('Error calculating readiness:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'almost_ready': return 'bg-yellow-500';
      case 'needs_work': return 'bg-orange-500';
      case 'not_ready': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready!';
      case 'almost_ready': return 'Almost Ready';
      case 'needs_work': return 'Needs Work';
      case 'not_ready': return 'Not Ready';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Exam Readiness
        </CardTitle>
        <CardDescription>
          Calculate your preparedness for upcoming exams
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
            />
          </div>
          <div className="space-y-2">
            <Label>Exam Date</Label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!subject || !examDate || loading}
          className="w-full"
        >
          Calculate Readiness
        </Button>

        {readiness && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Overall Readiness</h3>
                <p className="text-sm text-muted-foreground">
                  {readiness.days_remaining} days until exam
                </p>
              </div>
              <Badge className={getStatusColor(readiness.status)}>
                {getStatusLabel(readiness.status)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Readiness Score</span>
                <span className="font-semibold">{readiness.readiness_score}%</span>
              </div>
              <Progress value={readiness.readiness_score} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(readiness.mastery_score)}%
                </div>
                <div className="text-xs text-muted-foreground">Mastery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {readiness.practice_count}
                </div>
                <div className="text-xs text-muted-foreground">Practice Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(readiness.study_hours)}h
                </div>
                <div className="text-xs text-muted-foreground">Study Time</div>
              </div>
            </div>

            <div className="flex gap-2 p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Recommendation</p>
                <p className="text-muted-foreground">{readiness.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
