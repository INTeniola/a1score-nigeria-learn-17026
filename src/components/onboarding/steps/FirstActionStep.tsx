import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, MessageCircle, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FirstActionStepProps {
  onComplete: () => void;
}

export const FirstActionStep = ({ onComplete }: FirstActionStepProps) => {
  const navigate = useNavigate();

  const handleUploadDocument = () => {
    onComplete();
    navigate('/dashboard/student?tab=document-upload');
  };

  const handleAskQuestion = () => {
    onComplete();
    navigate('/dashboard/student?tab=ai-tutor');
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center space-y-2 pb-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold">
          You're all set! Let's get started 🎉
        </CardTitle>
        <CardDescription>
          Get personalized help within 3 minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="grid gap-4">
          <button
            onClick={handleUploadDocument}
            className="flex items-start gap-4 p-6 rounded-lg border-2 border-border hover:border-primary hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <FileUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">
                Upload Your First Document
              </h4>
              <p className="text-sm text-muted-foreground">
                Get instant summaries, flashcards, and study guides from your
                notes or textbooks
              </p>
            </div>
          </button>

          <button
            onClick={handleAskQuestion}
            className="flex items-start gap-4 p-6 rounded-lg border-2 border-border hover:border-primary hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">
                Ask Your First Question
              </h4>
              <p className="text-sm text-muted-foreground">
                Get step-by-step explanations from our AI tutor on any topic
                you're studying
              </p>
            </div>
          </button>
        </div>

        <div className="text-center pt-4">
          <Button variant="ghost" onClick={onComplete}>
            I'll explore on my own
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
