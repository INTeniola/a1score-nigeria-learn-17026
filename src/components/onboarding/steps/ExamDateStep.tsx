import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ExamDateStepProps {
  initialDate?: string;
  onNext: (date: string | null) => void;
  onSkip: () => void;
}

export const ExamDateStep = ({ initialDate, onNext, onSkip }: ExamDateStepProps) => {
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined
  );

  const handleContinue = () => {
    onNext(date ? format(date, 'yyyy-MM-dd') : null);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <CalendarIcon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          When's your exam?
        </CardTitle>
        <CardDescription>
          Optional: Help us plan your study schedule effectively
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </div>

        {date && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Your exam is on</p>
            <p className="text-lg font-semibold">
              {format(date, 'MMMM dd, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button variant="ghost" onClick={onSkip}>
            I don't have an exam yet
          </Button>
          <Button onClick={handleContinue} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
