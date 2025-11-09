import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Brain, TrendingUp, Calendar, Target } from 'lucide-react';

interface TopicMastery {
  topic: string;
  subject: string;
  cardsCount: number;
  averageMastery: number;
  dueCount: number;
}

export function SpacedRepetitionAnalytics() {
  const { cards, dueCards, loading } = useSpacedRepetition();
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (cards.length > 0) {
      calculateTopicMastery();
      calculateStreak();
    }
  }, [cards]);

  const calculateTopicMastery = () => {
    const topicsMap = new Map<string, TopicMastery>();

    cards.forEach(card => {
      const key = `${card.subject}-${card.topic}`;
      if (!topicsMap.has(key)) {
        topicsMap.set(key, {
          topic: card.topic,
          subject: card.subject,
          cardsCount: 0,
          averageMastery: 0,
          dueCount: 0
        });
      }

      const topic = topicsMap.get(key)!;
      topic.cardsCount++;
      
      // Calculate mastery based on interval and ease factor
      const cardMastery = Math.min(100, (card.interval_days * card.ease_factor * 10));
      topic.averageMastery += cardMastery;

      if (dueCards.some(dc => dc.id === card.id)) {
        topic.dueCount++;
      }
    });

    const masteryArray = Array.from(topicsMap.values()).map(topic => ({
      ...topic,
      averageMastery: Math.round(topic.averageMastery / topic.cardsCount)
    }));

    setTopicMastery(masteryArray);
  };

  const calculateStreak = () => {
    const today = new Date().toDateString();
    const reviewedToday = cards.some(card => 
      card.last_reviewed_at && new Date(card.last_reviewed_at).toDateString() === today
    );

    // Simple streak calculation - in production, track this in database
    setStreak(reviewedToday ? 1 : 0);
  };

  const dueToday = dueCards.length;
  const dueThisWeek = cards.filter(card => {
    const nextReview = new Date(card.next_review_date);
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return nextReview <= weekFromNow;
  }).length;

  const masteredCards = cards.filter(card => card.interval_days > 21).length;
  const totalCards = cards.length;

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-500';
    if (mastery >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-3xl font-bold">{dueToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-3xl font-bold">{dueThisWeek}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-3xl font-bold">{masteredCards}/{totalCards}</p>
              </div>
              <Target className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-3xl font-bold">{streak} day{streak !== 1 ? 's' : ''}</p>
              </div>
              <Brain className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Mastery Levels by Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topicMastery.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No cards yet. Create some flashcards to get started!
            </p>
          ) : (
            topicMastery.map((topic, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{topic.subject}</Badge>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {topic.dueCount > 0 && (
                      <Badge variant="secondary">{topic.dueCount} due</Badge>
                    )}
                    <span className={`font-semibold ${getMasteryColor(topic.averageMastery)}`}>
                      {topic.averageMastery}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={topic.averageMastery} className="flex-1" />
                  <span className="text-xs text-muted-foreground min-w-[60px]">
                    {topic.cardsCount} cards
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Exam Readiness Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Predicted Exam Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overall Readiness</span>
              <span className={`text-2xl font-bold ${getMasteryColor(Math.round((masteredCards / totalCards) * 100))}`}>
                {totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={totalCards > 0 ? (masteredCards / totalCards) * 100 : 0} 
              className="h-4"
            />
            <p className="text-sm text-muted-foreground">
              {dueToday > 0 
                ? `Complete ${dueToday} reviews today to improve your readiness.`
                : 'Great job! Keep up the consistent review schedule.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}