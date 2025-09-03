import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Home, Calculator, FileText } from 'lucide-react';
import type { StepType } from '@/types/roi';

interface NavigationProps {
  currentStep: StepType;
  onReset: () => void;
}

const steps = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'calculator', label: 'Revenue Calculator', icon: Calculator },
  { id: 'results', label: 'Results', icon: BarChart3 }
];

export function Navigation({ currentStep, onReset }: NavigationProps) {
  return (
    <nav className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png" 
              alt="AdFixus Logo" 
              className="h-8 w-auto"
            />
          </div>

          {/* Progress Steps (Desktop Only) */}
          <div className="hidden md:flex items-center space-x-6">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    isActive 
                      ? 'bg-primary/20 text-primary font-medium'
                      : isCompleted 
                        ? 'text-accent'
                        : 'text-muted-foreground'
                  }`}>
                    <step.icon className="w-4 h-4" />
                    <span>{step.label}</span>
                  </div>
                  
                  {/* Progress line */}
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-accent' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Reset Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        </div>
      </div>
    </nav>
  );
}