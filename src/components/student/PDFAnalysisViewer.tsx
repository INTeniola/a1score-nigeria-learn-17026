import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, BookOpen, Target, Lightbulb, MessageSquare, CheckCircle2 } from 'lucide-react';

interface PDFAnalysisViewerProps {
  analysis: {
    id: string;
    fileName: string;
    breakdown: {
      summary: string;
      keyPoints: string[];
      studyGuide: string[];
      questions: string[];
      concepts: string[];
    };
    createdAt: string;
  };
  onOpenAIChat?: () => void;
}

const PDFAnalysisViewer: React.FC<PDFAnalysisViewerProps> = ({ analysis, onOpenAIChat }) => {
  return (
    <div className="space-y-6">
      {/* Document Searchable Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="text-sm text-green-800">
            ✅ This document is now searchable in AI Chat! Enable "Search My Documents" to ask questions about it.
          </span>
          {onOpenAIChat && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-shrink-0 border-green-300 hover:bg-green-100"
              onClick={onOpenAIChat}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Open AI Chat
            </Button>
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {analysis.fileName}
            </CardTitle>
            <Badge variant="secondary">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{analysis.breakdown.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.breakdown.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Concepts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.breakdown.concepts.map((concept, index) => (
              <Badge key={index} variant="outline">
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            {analysis.breakdown.studyGuide.map((item, index) => (
              <li key={index} className="text-sm">
                {item}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.breakdown.questions.map((question, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Q{index + 1}: {question}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFAnalysisViewer;