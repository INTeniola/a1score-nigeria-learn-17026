import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

export function SpacedRepetitionReview() {
  const { dueCards, reviewCard, loading } = useSpacedRepetition();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    startTime: Date.now()
  });

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading cards...</div>;
  }

  if (dueCards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No cards due for review right now.</p>
        </CardContent>
      </Card>
    );
  }

  const currentCard = dueCards[currentIndex];
  const progress = ((currentIndex + 1) / dueCards.length) * 100;

  const handleReview = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    await reviewCard(currentCard.id, quality);
    
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      startTime: prev.startTime
    }));

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session complete
      const timeSpent = Math.round((Date.now() - sessionStats.startTime) / 1000 / 60);
      console.log('Session complete:', { ...sessionStats, timeSpent });
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 0) return 'bg-green-500';
    if (difficulty <= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {dueCards.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              {sessionStats.correct}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.round((Date.now() - sessionStats.startTime) / 1000 / 60)}m
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Display */}
      <div className="relative h-[400px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ rotateY: 0, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: isFlipped ? 180 : 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card className="h-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <CardContent className="p-8 h-full flex flex-col justify-center items-center text-center">
                <motion.div
                  style={{ backfaceVisibility: 'hidden' }}
                  className={isFlipped ? 'hidden' : 'block'}
                >
                  <Badge variant="outline" className="mb-4">
                    {currentCard.subject} • {currentCard.topic}
                  </Badge>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-4 ${getDifficultyColor(currentCard.difficulty)}`} />
                  <h3 className="text-2xl font-semibold mb-4">
                    {currentCard.question}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-8">
                    Click to reveal answer
                  </p>
                </motion.div>

                <motion.div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className={!isFlipped ? 'hidden' : 'block w-full'}
                >
                  <Badge variant="outline" className="mb-4">Answer</Badge>
                  <p className="text-lg mb-6">{currentCard.answer}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Reviews: {currentCard.repetitions}</p>
                    <p>Next: {currentCard.interval_days}d interval</p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Self-Grading Buttons */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Button
            onClick={() => handleReview(0)}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-semibold">Again</span>
            <span className="text-xs text-muted-foreground">&lt;1m</span>
          </Button>
          
          <Button
            onClick={() => handleReview(2)}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <span className="font-semibold">Hard</span>
            <span className="text-xs text-muted-foreground">1d</span>
          </Button>

          <Button
            onClick={() => handleReview(3)}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <span className="font-semibold">Good</span>
            <span className="text-xs text-muted-foreground">6d</span>
          </Button>

          <Button
            onClick={() => handleReview(5)}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Easy</span>
            <span className="text-xs text-muted-foreground">{Math.round(currentCard.interval_days * currentCard.ease_factor)}d</span>
          </Button>
        </motion.div>
      )}

      {!isFlipped && (
        <Button
          onClick={() => setIsFlipped(true)}
          className="w-full"
          size="lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Show Answer
        </Button>
      )}
    </div>
  );
}