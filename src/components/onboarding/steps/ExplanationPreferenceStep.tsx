import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowRight, Eye, Code, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplanationPreferenceStepProps {
  onNext: (preference: 'visual' | 'technical' | 'simple') => void;
  onSkip: () => void;
}

export const ExplanationPreferenceStep = ({
  onNext,
  onSkip,
}: ExplanationPreferenceStepProps) => {
  const [selected, setSelected] = useState<'visual' | 'technical' | 'simple' | null>(null);

  const preferences = [
    {
      value: 'visual' as const,
      icon: Eye,
      title: 'Visual & Graphical',
      description: 'Prefer diagrams, charts, and visual explanations',
      example: 'Show me with pictures and graphs',
    },
    {
      value: 'technical' as const,
      icon: Code,
      title: 'Technical & Detailed',
      description: 'In-depth explanations with precise terminology',
      example: 'Give me all the technical details',
    },
    {
      value: 'simple' as const,
      icon: Smile,
      title: 'Simple & Clear',
      description: 'Easy-to-understand explanations, no jargon',
      example: "Explain it like I'm 5",
    },
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          How do you like explanations?
        </CardTitle>
        <CardDescription>
          Choose your preferred style - you can always change this later
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="grid gap-4">
          {preferences.map((pref) => {
            const Icon = pref.icon;
            return (
              <button
                key={pref.value}
                onClick={() => setSelected(pref.value)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                  'hover:border-primary hover:shadow-md',
                  selected === pref.value
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border'
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      selected === pref.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{pref.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pref.description}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      "{pref.example}"
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button
            onClick={() => selected && onNext(selected)}
            disabled={!selected}
            className="gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
