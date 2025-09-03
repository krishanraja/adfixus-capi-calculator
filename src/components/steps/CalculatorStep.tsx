import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ROIInputForm } from '@/components/roi/ROIInputForm';
import type { ValidationErrors } from '@/types/roi';

interface CalculatorStepProps {
  annualRevenue: string;
  onAnnualRevenueChange: (value: string) => void;
  chromePercentage: number[];
  onChromePercentageChange: (value: number[]) => void;
  displayShare: number[];
  onDisplayShareChange: (value: number[]) => void;
  videoShare: number[];
  onVideoShareChange: (value: number[]) => void;
  performanceCampaignPercentage: number[];
  onPerformanceCampaignPercentageChange: (value: number[]) => void;
  errors: ValidationErrors;
  onCalculateClick: () => void;
  onPrevious: () => void;
}

export function CalculatorStep({
  annualRevenue,
  onAnnualRevenueChange,
  chromePercentage,
  onChromePercentageChange,
  displayShare,
  onDisplayShareChange,
  videoShare,
  onVideoShareChange,
  performanceCampaignPercentage,
  onPerformanceCampaignPercentageChange,
  errors,
  onCalculateClick,
  onPrevious
}: CalculatorStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">
            Revenue Impact Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your current advertising metrics to see your potential revenue increase with AdFixus CAPI.
          </p>
        </div>

        {/* ROI Input Form */}
        <ROIInputForm
          annualRevenue={annualRevenue}
          onAnnualRevenueChange={onAnnualRevenueChange}
          chromePercentage={chromePercentage}
          onChromePercentageChange={onChromePercentageChange}
          displayShare={displayShare}
          onDisplayShareChange={onDisplayShareChange}
          videoShare={videoShare}
          onVideoShareChange={onVideoShareChange}
          performanceCampaignPercentage={performanceCampaignPercentage}
          onPerformanceCampaignPercentageChange={onPerformanceCampaignPercentageChange}
          errors={errors}
          onCalculateClick={onCalculateClick}
        />

        {/* Previous Button */}
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}