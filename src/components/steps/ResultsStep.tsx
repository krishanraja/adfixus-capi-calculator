import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ROIResults } from '@/components/roi/ROIResults';
import type { ROIResults as ROIResultsType } from '@/types/roi';

interface ResultsStepProps {
  results: ROIResultsType;
  performanceCampaignPercentage: number;
  onGeneratePDF: () => void;
  onPrevious: () => void;
}

export function ResultsStep({ 
  results, 
  performanceCampaignPercentage, 
  onGeneratePDF, 
  onPrevious 
}: ResultsStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">
            Your Revenue Impact Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Here's how AdFixus CAPI can transform your advertising performance and boost your revenue.
          </p>
        </div>

        {/* Results */}
        <ROIResults
          results={results}
          performanceCampaignPercentage={performanceCampaignPercentage}
          onGeneratePDF={onGeneratePDF}
        />

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 border">
            <h3 className="text-2xl font-bold text-brand-primary mb-4">
              Ready to Unlock This Revenue Potential?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Book a strategy session with our team to discuss your specific implementation plan 
              and timeline for achieving these results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white font-semibold px-8"
              >
                <a 
                  href={import.meta.env.VITE_MEETING_BOOKING_URL || "https://outlook.office.com/book/SalesTeambooking@adfixus.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Book Strategy Session
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Adjust Calculator
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}