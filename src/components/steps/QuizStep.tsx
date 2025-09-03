import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

interface QuizStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const quizQuestions = [
  {
    id: 1,
    question: "What percentage of your campaigns use conversion tracking?",
    options: [
      { id: 'a', text: "Less than 25%", score: 1 },
      { id: 'b', text: "25-50%", score: 2 },
      { id: 'c', text: "50-75%", score: 3 },
      { id: 'd', text: "More than 75%", score: 4 }
    ]
  },
  {
    id: 2,
    question: "How often do you experience data loss due to privacy restrictions?",
    options: [
      { id: 'a', text: "Never noticed", score: 1 },
      { id: 'b', text: "Occasionally", score: 2 },
      { id: 'c', text: "Frequently", score: 3 },
      { id: 'd', text: "It's a major issue", score: 4 }
    ]
  },
  {
    id: 3,
    question: "What's your primary advertising focus?",
    options: [
      { id: 'a', text: "Brand awareness", score: 2 },
      { id: 'b', text: "Lead generation", score: 4 },
      { id: 'c', text: "E-commerce sales", score: 4 },
      { id: 'd', text: "App installs", score: 3 }
    ]
  }
];

export function QuizStep({ onNext, onPrevious }: QuizStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const hasAnswer = answers[quizQuestions[currentQuestion].id];

  const handleAnswer = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [quizQuestions[currentQuestion].id]: optionId
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onNext();
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onPrevious();
    }
  };

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl text-brand-primary">Identity Health Check</CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} of {quizQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-brand-primary mb-6">
                {question.question}
              </h3>
              
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-secondary bg-brand-secondary/5' 
                          : 'border-border hover:border-brand-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-brand-secondary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!hasAnswer}
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white flex items-center gap-2"
              >
                {isLastQuestion ? 'Continue to Calculator' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}