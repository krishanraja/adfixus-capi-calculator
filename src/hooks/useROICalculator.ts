import { useState } from 'react';
import type { ROIInputs, ROIResults, ContactForm, ValidationErrors, StepType } from '@/types/roi';
import { calculateROI } from '@/lib/roiCalculations';
import { ROI_CONSTANTS } from '@/constants/roiConstants';
import { getNumericValue } from '@/utils/formatting';

export function useROICalculator() {
  const [currentStep, setCurrentStep] = useState<StepType>('hero');
  const [annualRevenue, setAnnualRevenue] = useState<string>('5,000,000');
  const [chromePercentage, setChromePercentage] = useState<number[]>([50]);
  const [displayShare, setDisplayShare] = useState<number[]>([60]);
  const [videoShare, setVideoShare] = useState<number[]>([25]);
  const [retargetingShare] = useState<number[]>([15]);
  const [performanceCampaignPercentage, setPerformanceCampaignPercentage] = useState<number[]>([50]);
  const [results, setResults] = useState<ROIResults | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const getROIInputs = (): ROIInputs => ({
    annualRevenue: getNumericValue(annualRevenue),
    chromePercentage: chromePercentage[0],
    displayShare: displayShare[0],
    videoShare: videoShare[0],
    performanceCampaignPercentage: performanceCampaignPercentage[0],
  });

  const validateInputs = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const numericRevenue = getNumericValue(annualRevenue);
    if (!annualRevenue || numericRevenue <= 0) {
      newErrors.annualRevenue = 'Please enter a valid annual revenue amount';
    }
    
    if (numericRevenue < ROI_CONSTANTS.MIN_REVENUE) {
      newErrors.annualRevenue = 'Revenue must be at least $100,000';
    }
    
    if (Math.abs(displayShare[0] + videoShare[0] - 100) > 0.1) {
      newErrors.shares = 'Display and Video shares must add up to 100%';
    }
    
    if (chromePercentage[0] < 0 || chromePercentage[0] > 100) {
      newErrors.chrome = 'Chrome percentage must be between 0% and 100%';
    }
    
    if (performanceCampaignPercentage[0] < 0 || performanceCampaignPercentage[0] > 100) {
      newErrors.performance = 'Performance campaign percentage must be between 0% and 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateROIResults = (): ROIResults => {
    const inputs = getROIInputs();
    const calculatedResults = calculateROI(inputs);
    setResults(calculatedResults);
    setCurrentStep('results');
    return calculatedResults;
  };

  const handleDisplayShareChange = (value: number[]) => {
    setDisplayShare(value);
    const remaining = 100 - value[0];
    setVideoShare([Math.max(0, remaining)]);
  };

  const handleVideoShareChange = (value: number[]) => {
    setVideoShare(value);
    const remaining = 100 - value[0];
    setDisplayShare([Math.max(0, remaining)]);
  };

  const nextStep = () => {
    const steps: StepType[] = ['hero', 'calculator', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const steps: StepType[] = ['hero', 'calculator', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const resetToHero = () => {
    setCurrentStep('hero');
    setResults(null);
    setErrors({});
  };

  return {
    // State
    currentStep,
    annualRevenue,
    chromePercentage,
    displayShare,
    videoShare,
    retargetingShare,
    performanceCampaignPercentage,
    results,
    errors,
    
    // Actions
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
  };
}