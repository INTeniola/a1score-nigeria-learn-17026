import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Brain, ArrowRight } from 'lucide-react';
import { LEARNING_STYLE_QUESTIONS } from '@/types/onboarding';

interface LearningStyleStepProps {
  onNext: (style: 'visual' | 'auditory' | 'kinesthetic' | 'reading') => void;
  onSkip: () => void;
}

export const LearningStyleStep = ({ onNext, onSkip }: LearningStyleStepProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [LEARNING_STYLE_QUESTIONS[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < LEARNING_STYLE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate learning style based on answers
      const styleCounts: Record<string, number> = {};
      Object.values(newAnswers).forEach((answer) => {
        const question = LEARNING_STYLE_QUESTIONS.find((q) =>
          q.options.some((opt) => opt.value === answer)
        );
        const option = question?.options.find((opt) => opt.value === answer);
        if (option) {
          styleCounts[option.style] = (styleCounts[option.style] || 0) + 1;
        }
      });

      const dominantStyle = Object.entries(styleCounts).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0] as 'visual' | 'auditory' | 'kinesthetic' | 'reading';

      onNext(dominantStyle);
    }
  };

  const question = LEARNING_STYLE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / LEARNING_STYLE_QUESTIONS.length) * 100;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Quick Learning Style Check
        </CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {LEARNING_STYLE_QUESTIONS.length}
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{question.question}</h3>
          <RadioGroup onValueChange={handleAnswer} value={answers[question.id]}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" onClick={onSkip}>
            Skip Assessment
          </Button>
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
