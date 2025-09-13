import { useROICalculator } from '@/hooks/useROICalculator';
import { useContactForm } from '@/hooks/useContactForm';
import { Navigation } from '@/components/Navigation';
import { HeroStep } from '@/components/steps/HeroStep';

import { CalculatorStep } from '@/components/steps/CalculatorStep';
import { ResultsStep } from '@/components/steps/ResultsStep';
import { ContactDialog } from '@/components/roi/ContactDialog';
import { buildAdfixusProposalPdf } from '@/utils/pdfmakeGenerator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const ROICalculator = () => {
  const { toast } = useToast();
  const {
    currentStep,
    annualRevenue,
    chromePercentage,
    displayShare,
    videoShare,
    performanceCampaignPercentage,
    results,
    errors,
    setAnnualRevenue,
    setChromePercentage,
    setPerformanceCampaignPercentage,
    handleDisplayShareChange,
    handleVideoShareChange,
    validateInputs,
    calculateROIResults,
    getROIInputs,
    nextStep,
    previousStep,
    resetToHero,
  } = useROICalculator();

  const {
    showContactDialog,
    setShowContactDialog,
    contactForm,
    updateContactForm,
    isSubmitting,
    isFormValid,
    submitContactForm,
  } = useContactForm();

  const handleCalculateClick = () => {
    if (validateInputs()) {
      calculateROIResults();
    }
  };

  const handleContactSubmit = async () => {
    const inputs = getROIInputs();
    if (results) {
      await submitContactForm(inputs, results);
    }
  };

  const handleGeneratePDF = async () => {
    if (!results) return;
    
    try {
      const roiInputs = getROIInputs();
      await buildAdfixusProposalPdf(roiInputs, results);
      toast({
        title: "PDF Generated",
        description: "Your AdFixus CAPI proposal has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'hero':
        return <HeroStep onNext={nextStep} />;
      case 'calculator':
        return (
          <CalculatorStep
            annualRevenue={annualRevenue}
            onAnnualRevenueChange={setAnnualRevenue}
            chromePercentage={chromePercentage}
            onChromePercentageChange={setChromePercentage}
            displayShare={displayShare}
            onDisplayShareChange={handleDisplayShareChange}
            videoShare={videoShare}
            onVideoShareChange={handleVideoShareChange}
            performanceCampaignPercentage={performanceCampaignPercentage}
            onPerformanceCampaignPercentageChange={setPerformanceCampaignPercentage}
            errors={errors}
            onCalculateClick={handleCalculateClick}
            onPrevious={previousStep}
          />
        );
      case 'results':
        return results ? (
          <ResultsStep
            results={results}
            performanceCampaignPercentage={performanceCampaignPercentage[0]}
            onGeneratePDF={handleGeneratePDF}
            onPrevious={previousStep}
          />
        ) : null;
      default:
        return <HeroStep onNext={nextStep} />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        <Navigation currentStep={currentStep} onReset={resetToHero} />
        
        {renderCurrentStep()}

        <ContactDialog
          showContactDialog={showContactDialog}
          onOpenChange={setShowContactDialog}
          contactForm={contactForm}
          onUpdateContactForm={updateContactForm}
          onSubmit={handleContactSubmit}
          isSubmitting={isSubmitting}
          isFormValid={isFormValid()}
        />
      </div>
    </TooltipProvider>
  );
};

export default ROICalculator;