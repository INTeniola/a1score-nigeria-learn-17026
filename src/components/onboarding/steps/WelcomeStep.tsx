import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const WelcomeStep = ({ onNext, onSkip }: WelcomeStepProps) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-4 pb-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>
        <CardTitle className="text-3xl font-bold">
          Welcome to A1Score! 🎓
        </CardTitle>
        <CardDescription className="text-base">
          Let's personalize your learning experience in just a few quick steps.
          This will take less than 2 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium">Tell us what you're learning</p>
              <p className="text-sm text-muted-foreground">
                So we can personalize your experience
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium">Quick learning style check</p>
              <p className="text-sm text-muted-foreground">
                3 simple questions to optimize your study approach
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium">Get started with value</p>
              <p className="text-sm text-muted-foreground">
                Upload a document or ask your first question
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            I'll do this later
          </Button>
          <Button onClick={onNext} size="lg" className="gap-2">
            Let's Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
