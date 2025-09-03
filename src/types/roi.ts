export interface ROIInputs {
  annualRevenue: number;
  chromePercentage: number;
  displayShare: number;
  videoShare: number;
  performanceCampaignPercentage: number;
}

export interface ConversionImprovements {
  displayImprovement: number;
  videoImprovement: number;
  retargetingImprovement: number;
}

export interface ROIResults {
  currentRevenue: number;
  currentDisplayRevenue: number;
  currentVideoRevenue: number;
  currentRetargetingRevenue: number;
  projectedRevenue: number;
  projectedDisplayRevenue: number;
  projectedVideoRevenue: number;
  projectedRetargetingRevenue: number;
  incrementalRevenue: number;
  incrementalPercentage: number;
  conversionImprovements: ConversionImprovements;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export type StepType = 'hero' | 'calculator' | 'results';

export interface ValidationErrors {
  annualRevenue?: string;
  shares?: string;
  chrome?: string;
  performance?: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}