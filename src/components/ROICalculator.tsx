import { TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useROICalculator } from '@/hooks/useROICalculator';
import { useContactForm } from '@/hooks/useContactForm';
import { ROIInputForm } from './roi/ROIInputForm';
import { ROIResults } from './roi/ROIResults';
import { ContactDialog } from './roi/ContactDialog';
import { generatePDF } from '@/utils/pdfGenerator';

const ROICalculator = () => {
  const { toast } = useToast();
  const {
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
    if (!validateInputs()) return;
    setShowContactDialog(true);
  };

  const handleContactSubmit = async () => {
    const inputs = getROIInputs();
    const calculatedResults = calculateROIResults();
    await submitContactForm(inputs, calculatedResults);
  };

  const handleGeneratePDF = () => {
    if (!results) return;
    
    const inputs = getROIInputs();
    generatePDF(inputs, results);
    
    toast({
      title: "PDF Generated!",
      description: "Your CAPI impact analysis has been downloaded.",
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png" 
                  alt="AdFixus" 
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            {/* Large Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png" 
                alt="AdFixus" 
                className="h-32 mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-brand-primary">
              The industry's only deterministic<br />
              Open Web Conversion API
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how enabling CAPI for can transform your business with improved conversion rates, better targeting and deterministic outcomes measurement.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="space-y-8">
            <ROIInputForm
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
            />

            {results && (
              <ROIResults
                results={results}
                performanceCampaignPercentage={performanceCampaignPercentage[0]}
                onGeneratePDF={handleGeneratePDF}
              />
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-brand-primary">
                  Ready to create an industry-leading ad product?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Book a 15-minute working session with our team to discuss your CAPI implementation strategy.
                </p>
                <Button className="text-white font-semibold px-8 py-3 bg-brand-secondary hover:bg-brand-secondary/90">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a 15-min Working Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

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