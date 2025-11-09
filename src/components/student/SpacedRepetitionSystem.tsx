import { useState } from 'react';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Brain, Plus, Trash2, RotateCcw, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function SpacedRepetitionSystem() {
  const { cards, dueCards, loading, createCard, reviewCard, deleteCard } = useSpacedRepetition();
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [newCard, setNewCard] = useState({
    subject: '',
    topic: '',
    question: '',
    answer: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const currentCard = dueCards[currentCardIndex];
  const progress = dueCards.length > 0 ? ((currentCardIndex / dueCards.length) * 100) : 0;

  const handleReview = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!currentCard) return;

    await reviewCard(currentCard.id, quality);
    setShowAnswer(false);
    
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCreateCard = async () => {
    if (!newCard.subject || !newCard.question || !newCard.answer) return;

    setIsCreating(true);
    await createCard(newCard.subject, newCard.topic, newCard.question, newCard.answer);
    setNewCard({ subject: '', topic: '', question: '', answer: '' });
    setIsCreating(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading study cards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Spaced Repetition System
          </h2>
          <p className="text-muted-foreground">Master concepts through optimized review intervals</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Card</DialogTitle>
              <DialogDescription>
                Add a new flashcard for spaced repetition learning
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newCard.subject}
                  onChange={(e) => setNewCard({ ...newCard, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  value={newCard.topic}
                  onChange={(e) => setNewCard({ ...newCard, topic: e.target.value })}
                  placeholder="e.g., Trigonometry"
                />
              </div>
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={newCard.question}
                  onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                  placeholder="What is the question?"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={newCard.answer}
                  onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                  placeholder="What is the answer?"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateCard} disabled={isCreating} className="w-full">
                Create Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{dueCards.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {cards.filter(c => c.repetitions >= 5).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="review" className="space-y-4">
        <TabsList>
          <TabsTrigger value="review">Review Session</TabsTrigger>
          <TabsTrigger value="all">All Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          {dueCards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">All caught up! 🎉</h3>
                <p className="text-muted-foreground">
                  No cards due for review right now. Check back later or create new cards.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {currentCardIndex + 1} / {dueCards.length}</span>
                  <Badge>{Math.round(progress)}%</Badge>
                </div>
                <Progress value={progress} />
              </div>

              <Card className="min-h-[400px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline">{currentCard.subject}</Badge>
                      {currentCard.topic && (
                        <Badge variant="secondary" className="ml-2">{currentCard.topic}</Badge>
                      )}
                    </div>
                    <Badge variant={currentCard.difficulty > 3 ? 'destructive' : 'default'}>
                      Difficulty: {currentCard.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Question:</h3>
                      <p className="text-lg">{currentCard.question}</p>
                    </div>

                    {showAnswer && (
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Answer:</h3>
                        <p className="text-lg">{currentCard.answer}</p>
                      </div>
                    )}
                  </div>

                  {!showAnswer ? (
                    <Button onClick={() => setShowAnswer(true)} className="w-full">
                      Show Answer
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-center text-muted-foreground">
                        How well did you remember?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="destructive" onClick={() => handleReview(0)}>
                          Didn't Remember
                        </Button>
                        <Button variant="outline" onClick={() => handleReview(2)}>
                          Hard
                        </Button>
                        <Button variant="secondary" onClick={() => handleReview(3)}>
                          Good
                        </Button>
                        <Button variant="default" onClick={() => handleReview(5)}>
                          Perfect!
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 text-xs text-muted-foreground border-t">
                    <p>Last reviewed: {currentCard.last_reviewed_at ? new Date(currentCard.last_reviewed_at).toLocaleDateString() : 'Never'}</p>
                    <p>Repetitions: {currentCard.repetitions}</p>
                    <p>Next review in: {currentCard.interval_days} days</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {cards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No study cards yet</h3>
                <p className="text-muted-foreground">
                  Create your first flashcard to start learning with spaced repetition!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        <Badge variant="outline">{card.subject}</Badge>
                        {card.topic && <Badge variant="secondary">{card.topic}</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{card.question}</p>
                    <p className="text-sm text-muted-foreground">{card.answer}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>Repetitions: {card.repetitions}</span>
                      <span>Interval: {card.interval_days} days</span>
                      <span>
                        Next review: {new Date(card.next_review_date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
