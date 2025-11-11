// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trophy, RotateCcw, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

const QuizInterface = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  const subjects = {
    mathematics: {
      name: 'Mathematics',
      topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics']
    },
    physics: {
      name: 'Physics',
      topics: ['Mechanics', 'Electricity', 'Waves', 'Thermodynamics', 'Modern Physics']
    },
    chemistry: {
      name: 'Chemistry',
      topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry']
    },
    english: {
      name: 'English',
      topics: ['Grammar', 'Literature', 'Essay Writing', 'Comprehension', 'Vocabulary']
    }
  };

  const sampleQuestions: { [key: string]: Question[] } = {
    'mathematics-algebra': [
      {
        id: 1,
        question: "If 3x - 7 = 14, what is the value of x?",
        options: ["5", "7", "21", "9"],
        correct: 1,
        explanation: "3x - 7 = 14. Add 7 to both sides: 3x = 21. Divide by 3: x = 7",
        subject: "Mathematics"
      },
      {
        id: 2,
        question: "What is the value of x² - 4x + 4 when x = 3?",
        options: ["1", "4", "9", "13"],
        correct: 0,
        explanation: "Substitute x = 3: (3)² - 4(3) + 4 = 9 - 12 + 4 = 1",
        subject: "Mathematics"
      },
      {
        id: 3,
        question: "Factorize: x² + 5x + 6",
        options: ["(x + 2)(x + 3)", "(x + 1)(x + 6)", "(x - 2)(x - 3)", "(x + 4)(x + 1)"],
        correct: 0,
        explanation: "Find two numbers that multiply to 6 and add to 5: 2 and 3. So x² + 5x + 6 = (x + 2)(x + 3)",
        subject: "Mathematics"
      }
    ],
    'physics-mechanics': [
      {
        id: 1,
        question: "A ball is thrown upward with an initial velocity of 20 m/s. What is its velocity after 2 seconds? (g = 10 m/s²)",
        options: ["0 m/s", "10 m/s", "20 m/s", "40 m/s"],
        correct: 0,
        explanation: "Using v = u - gt: v = 20 - (10)(2) = 20 - 20 = 0 m/s",
        subject: "Physics"
      },
      {
        id: 2,
        question: "What is the unit of momentum?",
        options: ["kg⋅m/s", "N⋅s", "Both A and B", "kg⋅m/s²"],
        correct: 2,
        explanation: "Momentum p = mv has units kg⋅m/s. Since impulse = change in momentum, N⋅s is also correct.",
        subject: "Physics"
      }
    ],
    'chemistry-organic': [
      {
        id: 1,
        question: "What is the molecular formula of methane?",
        options: ["CH₄", "C₂H₆", "CH₃OH", "C₂H₄"],
        correct: 0,
        explanation: "Methane is the simplest alkane with one carbon atom bonded to four hydrogen atoms: CH₄",
        subject: "Chemistry"
      }
    ],
    'english-grammar': [
      {
        id: 1,
        question: "Choose the correct sentence:",
        options: [
          "Each of the students have submitted their work",
          "Each of the students has submitted their work",
          "Each of the students have submitted his work",
          "Each of the students has submitted his or her work"
        ],
        correct: 3,
        explanation: "'Each' is singular, so it takes 'has'. For gender-neutral reference, use 'his or her' or restructure the sentence.",
        subject: "English"
      }
    ]
  };

  const generateQuiz = async () => {
    if (!selectedSubject || !selectedTopic) return;
    
    try {
      // Use the secure function to get quiz questions without answers
      const { data: questions, error } = await supabase.rpc('get_quiz_questions_for_session', {
        p_subject: selectedSubject,
        p_topic: selectedTopic,
        p_difficulty: 'beginner',
        p_limit: 5
      });

      if (error) {
        console.error('Quiz generation error:', error);
        // Fallback to sample questions
        const key = `${selectedSubject}-${selectedTopic.toLowerCase().replace(' ', '')}`;
        const fallbackQuestions = sampleQuestions[key] || sampleQuestions['mathematics-algebra'];
        setCurrentQuiz(fallbackQuestions);
        setCurrentQuestionIndex(0);
        setAnswers(new Array(fallbackQuestions.length).fill(null));
      } else {
        // Transform the secure questions to match the existing interface
        const transformedQuestions = questions.map((q: any, index: number) => ({
          id: index + 1,
          question: q.question_text,
          options: q.options,
          correct: 0, // We don't show correct answers until after completion
          explanation: '', // Will be fetched after completion
          subject: q.subject
        }));
        
        setCurrentQuiz(transformedQuestions);
        setCurrentQuestionIndex(0);
        setAnswers(new Array(transformedQuestions.length).fill(null));
      }
      
      setSelectedAnswer(null);
      setShowResult(false);
      setQuizComplete(false);
      setScore(0);
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback to sample questions
      const key = `${selectedSubject}-${selectedTopic.toLowerCase().replace(' ', '')}`;
      const fallbackQuestions = sampleQuestions[key] || sampleQuestions['mathematics-algebra'];
      setCurrentQuiz(fallbackQuestions);
      setCurrentQuestionIndex(0);
      setAnswers(new Array(fallbackQuestions.length).fill(null));
      setSelectedAnswer(null);
      setShowResult(false);
      setQuizComplete(false);
      setScore(0);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentQuiz.length - 1) {
      // Move to next question without showing results
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete - save attempt and get results
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (finalAnswers: (number | null)[]) => {
    try {
      // Save quiz attempt to database and get the attempt ID
      const { data: attemptData, error: saveError } = await supabase.functions.invoke('save-quiz-attempt', {
        body: {
          subject: selectedSubject,
          topic: selectedTopic,
          examType: 'general',
          questions: currentQuiz,
          userAnswers: finalAnswers,
          timeToTakeMinutes: 5,
          correctAnswers: 0, // Will be calculated on server
          totalQuestions: currentQuiz.length
        }
      });

      if (saveError) throw saveError;

      // Get the quiz results with correct answers and explanations
      const { data: results, error: resultsError } = await supabase.rpc('get_quiz_results_with_answers', {
        p_quiz_attempt_id: attemptData.attemptId
      });

      if (resultsError) throw resultsError;

      // Calculate score from secure results
      const correctCount = results.filter((r: any) => r.is_correct).length;
      setScore(correctCount);
      setQuizResults(results);
      setQuizAttemptId(attemptData.attemptId);
      setQuizComplete(true);

    } catch (error) {
      console.error('Error completing quiz:', error);
      // Fallback score calculation using sample data
      const fallbackScore = finalAnswers.reduce((score, answer, index) => {
        return score + (answer === currentQuiz[index].correct ? 1 : 0);
      }, 0);
      setScore(fallbackScore);
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz([]);
    setSelectedSubject('');
    setSelectedTopic('');
    setQuizComplete(false);
    setQuizAttemptId(null);
    setQuizResults([]);
    setScore(0);
  };

  if (quizComplete) {
    const percentage = Math.round((score / currentQuiz.length) * 100);
    return (
      <div className="max-w-2xl mx-auto container-padding">
        <Card>
          <CardHeader className="text-center p-4 md:p-6">
            <div className="mx-auto mb-3 md:mb-4 p-3 md:p-4 bg-yellow-100 rounded-full w-fit">
              <Trophy className="h-10 w-10 md:h-12 md:w-12 text-yellow-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl leading-relaxed">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 md:space-y-6">
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-3 md:p-4 bg-red-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-red-600">{currentQuiz.length - score}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-green-600">{percentage}%</div>
                <div className="text-xs md:text-sm text-muted-foreground">Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={percentage} className="h-2 md:h-3" />
              <p className="text-base md:text-lg leading-relaxed">
                {percentage >= 80 ? "Excellent work! 🎉" :
                 percentage >= 60 ? "Good job! Keep practicing! 👍" :
                 "Keep studying! You'll improve! 💪"}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button onClick={generateQuiz} variant="outline" className="w-full md:w-auto min-h-11">
                Try Again
              </Button>
              <Button onClick={resetQuiz} className="w-full md:w-auto min-h-11">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentQuiz.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 container-padding">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl lg:text-2xl leading-relaxed">Practice Quiz Generator</CardTitle>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Select a subject and topic to generate personalized practice questions.</p>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div>
              <label className="text-sm md:text-base font-medium mb-2 block leading-relaxed">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent className="bg-card z-50">
                  {Object.entries(subjects).map(([key, subject]) => (
                    <SelectItem key={key} value={key} className="min-h-11 md:min-h-10">{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSubject && (
              <div>
                <label className="text-sm md:text-base font-medium mb-2 block leading-relaxed">Topic</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="h-11 md:h-10">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-card z-50">
                    {subjects[selectedSubject as keyof typeof subjects].topics.map((topic) => (
                      <SelectItem key={topic} value={topic} className="min-h-11 md:min-h-10">{topic}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={generateQuiz} 
              disabled={!selectedSubject || !selectedTopic}
              className="w-full min-h-12 text-sm md:text-base"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quiz (5 Questions)
            </Button>
          </CardContent>
        </Card>

        {/* Quick Start Options */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg lg:text-xl leading-relaxed">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 min-h-14 text-left active:scale-95"
                onClick={() => {
                  setSelectedSubject('mathematics');
                  setSelectedTopic('Algebra');
                  setTimeout(generateQuiz, 100);
                }}
              >
                <div className="text-left">
                  <div className="font-medium text-sm md:text-base leading-relaxed">Mathematics - Algebra</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">Perfect for JAMB prep</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4 min-h-14 text-left active:scale-95"
                onClick={() => {
                  setSelectedSubject('physics');
                  setSelectedTopic('Mechanics');
                  setTimeout(generateQuiz, 100);
                }}
              >
                <div className="text-left">
                  <div className="font-medium text-sm md:text-base leading-relaxed">Physics - Mechanics</div>
                  <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">Motion and forces</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

  return (
    <div className="max-w-2xl mx-auto container-padding">
      <Card>
        <CardHeader className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
            <div>
              <CardTitle className="text-base md:text-lg lg:text-xl leading-relaxed">Question {currentQuestionIndex + 1} of {currentQuiz.length}</CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs md:text-sm">{currentQuestion.subject}</Badge>
            </div>
            <div className="text-left md:text-right">
              <div className="text-xs md:text-sm text-muted-foreground">Progress</div>
              <div className="text-base md:text-lg font-bold">{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="mt-3 md:mt-4 h-2 md:h-2.5" />
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="text-base md:text-lg font-medium leading-relaxed">{currentQuestion.question}</div>
          
          <div className="space-y-2 md:space-y-3">
            {currentQuestion.options.map((option, index) => {
              let buttonVariant: "outline" | "default" | "destructive" = "outline";
              let buttonClass = "";
              
              if (selectedAnswer === index) {
                buttonClass = "border-primary bg-primary/10 border-2";
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`w-full justify-start h-auto p-4 text-left min-h-14 md:min-h-12 active:scale-95 ${buttonClass}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-7 h-7 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1 text-sm md:text-base leading-relaxed">{option}</div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-4 pt-2">
            <div className="text-xs md:text-sm text-muted-foreground leading-relaxed md:self-center">
              {selectedAnswer !== null ? 'Answer selected' : 'Select an answer to continue'}
            </div>
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full md:w-auto min-h-11"
            >
              {currentQuestionIndex < currentQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizInterface;
