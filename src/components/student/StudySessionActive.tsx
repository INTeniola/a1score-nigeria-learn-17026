import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Pause, Play, Plus, Brain, BookOpen, FileQuestion, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionConfig } from './StudySessionStarter';

interface StudySessionActiveProps {
  config: SessionConfig;
  onEndSession: (stats: SessionStats) => void;
  onQuickAction?: (action: 'quiz' | 'flashcard' | 'summary') => void;
}

export interface SessionStats {
  duration: number;
  questionsAsked: number;
  conceptsCovered: string[];
  quizzesCompleted: number;
  flashcardsCreated: number;
}

export function StudySessionActive({ config, onEndSession, onQuickAction }: StudySessionActiveProps) {
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    duration: 0,
    questionsAsked: 0,
    conceptsCovered: [],
    quizzesCompleted: 0,
    flashcardsCreated: 0
  });

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
      
      setStats(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const handleEndSession = () => {
    onEndSession(stats);
  };

  const handleExtend = () => {
    setTimeLeft(prev => prev + (15 * 60)); // Add 15 minutes
  };

  const handleQuickAction = (action: 'quiz' | 'flashcard' | 'summary') => {
    if (action === 'quiz') {
      setStats(prev => ({ ...prev, quizzesCompleted: prev.quizzesCompleted + 1 }));
    } else if (action === 'flashcard') {
      setStats(prev => ({ ...prev, flashcardsCreated: prev.flashcardsCreated + 1 }));
    }
    onQuickAction?.(action);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100;

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-4"
            >
              <div className="text-7xl font-bold tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(stats.duration / 60)} minutes studied</span>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleExtend}
              >
                <Plus className="w-4 h-4 mr-2" />
                +15 min
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndSession}
              >
                <StopCircle className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.questionsAsked}</div>
            <div className="text-sm text-muted-foreground">Questions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.quizzesCompleted}</div>
            <div className="text-sm text-muted-foreground">Quizzes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.flashcardsCreated}</div>
            <div className="text-sm text-muted-foreground">Flashcards</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleQuickAction('quiz')}
          >
            <FileQuestion className="w-4 h-4 mr-2" />
            Generate Quiz
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleQuickAction('flashcard')}
          >
            <Brain className="w-4 h-4 mr-2" />
            Create Flashcards
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleQuickAction('summary')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Summarize Section
          </Button>
        </CardContent>
      </Card>

      {/* Focus Mode Indicator */}
      {config.focusMode && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Focus Mode Active</Badge>
                  <span className="text-sm text-muted-foreground">
                    Navigation minimized to reduce distractions
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}