import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Brain, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SessionStats } from './StudySessionActive';
import { SessionConfig } from './StudySessionStarter';

interface StudySessionSummaryProps {
  config: SessionConfig;
  stats: SessionStats;
  achievements?: string[];
  onNewSession: () => void;
  onViewHistory: () => void;
}

export function StudySessionSummary({ 
  config, 
  stats, 
  achievements = [],
  onNewSession,
  onViewHistory 
}: StudySessionSummaryProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const defaultAchievements = achievements.length > 0 ? achievements : [
    stats.duration >= config.duration * 60 ? 'Session Completed!' : null,
    stats.questionsAsked >= 5 ? 'Curious Learner' : null,
    stats.quizzesCompleted >= 2 ? 'Quiz Master' : null,
    stats.flashcardsCreated >= 3 ? 'Flashcard Creator' : null,
  ].filter(Boolean) as string[];

  const getRecommendation = () => {
    if (stats.quizzesCompleted === 0) {
      return 'Try taking a quiz to test your knowledge';
    }
    if (stats.flashcardsCreated === 0) {
      return 'Create flashcards to reinforce learning with spaced repetition';
    }
    return 'Great session! Keep up the consistent study schedule';
  };

  return (
    <div className="space-y-6">
      {/* Congratulations Header */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <Card className="text-center border-primary">
          <CardContent className="p-8">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Great Session!</h2>
            <p className="text-muted-foreground">
              You studied for {formatDuration(stats.duration)}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Session Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Session Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatDuration(stats.duration)}</div>
              <div className="text-xs text-muted-foreground">Time Studied</div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Brain className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.questionsAsked}</div>
              <div className="text-xs text-muted-foreground">Questions Asked</div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
              <div className="text-xs text-muted-foreground">Quizzes Done</div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stats.flashcardsCreated}</div>
              <div className="text-xs text-muted-foreground">Cards Created</div>
            </div>
          </div>

          {config.subject && config.topic && (
            <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Focused on:</span>
              <Badge variant="outline">{config.subject}</Badge>
              <span className="text-sm">•</span>
              <span className="text-sm font-medium">{config.topic}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {defaultAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {defaultAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                  >
                    <Badge variant="secondary" className="py-2 px-4">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Next Session Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{getRecommendation()}</p>
          <div className="flex gap-3">
            <Button onClick={onNewSession} size="lg" className="flex-1">
              <Brain className="w-4 h-4 mr-2" />
              Start New Session
            </Button>
            <Button onClick={onViewHistory} variant="outline" size="lg">
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}