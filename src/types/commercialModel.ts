// Commercial Model Types for publisher-level scenario comparison.
// Language: "share of upside" not "cost", "alignment model" not "pricing".
// These describe the PUBLISHER's revenue-share economics for CAPI line items —
// how the incremental CAPI revenue is split — not a fixed AdFixus rate card.

export type CommercialModelType = 'revenue-share' | 'annual-cap' | 'flat-fee';

export interface CommercialModel {
  type: CommercialModelType;
  label: string;
  shortLabel: string;
  description: string;
  isRecommended: boolean;
  tagline: string;

  // Model-specific parameters
  params: {
    // Revenue Share (12.5% uncapped)
    sharePercentage?: number;

    // Annual Cap
    annualCap?: number;
    annualFloor?: number;
    baseSharePercentage?: number;

    // Flat Fee
    annualFlatFee?: number;
  };
}

// Incentive alignment replaces "value suppression"
export interface IncentiveAlignment {
  alignmentScore: number; // 0-100
  partnershipLevel: 'Full Partnership' | 'Limited Partnership' | 'Vendor Relationship';
  investmentLevel: 'Maximum' | 'Reduced' | 'Minimum';
  description: string;
}

export interface ScenarioComparison {
  model: CommercialModel;

  // Revenue isolation
  baseRevenue: number;           // Existing revenue (untouched)
  incrementalRevenue: number;    // CAPI-created (36-month cumulative)

  // Financial outcomes
  publisherNetGain: number;
  adfixusShare: number;

  // Incentive alignment (replaces value suppression)
  incentiveAlignment: IncentiveAlignment;

  // For visualization: what happens after cap is hit (annual-cap model)
  postCapBenefit: number;

  // Monthly breakdown for chart (36 months)
  monthlyProjection: MonthlyCommercialData[];

  // Summary metrics
  netPublisherGainPercentage: number;
  roiMultiple: number;
}

export interface MonthlyCommercialData {
  month: number;
  monthLabel: string;

  // Revenue layers
  baseRevenue: number;
  incrementalRevenue: number;
  cumulativeIncremental: number;

  // Financial outcomes
  publisherNetGain: number;
  cumulativePublisherGain: number;
  adfixusShare: number;
  cumulativeAdfixusShare: number;

  // Post-cap benefit (for annual-cap model)
  postCapBenefit: number;
  cumulativePostCapBenefit: number;
}

// The three commercial scenarios
export const COMMERCIAL_MODELS: CommercialModel[] = [
  {
    type: 'revenue-share',
    label: 'Revenue Share (Uncapped)',
    shortLabel: 'Rev Share',
    description: '12.5% on all CAPI line items. Both parties incentivised to grow.',
    isRecommended: true,
    tagline: 'Aligned incentives. Mutual growth.',
    params: {
      sharePercentage: 0.125, // 12.5% uncapped
    },
  },
  {
    type: 'annual-cap',
    label: 'Annual Cap',
    shortLabel: 'Annual Cap',
    description: '12.5% with a Year-1 cap. Unlimited upside for the publisher after the cap.',
    isRecommended: false,
    tagline: 'Capped risk. Partner incentive capped too.',
    params: {
      annualCap: 1200000,
      annualFloor: 300000,
      baseSharePercentage: 0.125,
    },
  },
  {
    type: 'flat-fee',
    label: 'Flat Annual Fee',
    shortLabel: 'Flat Fee',
    description: 'Fixed annual scope, no growth promises. Fixed cost regardless of success.',
    isRecommended: false,
    tagline: 'Fixed cost. No growth alignment.',
    params: {
      annualFlatFee: 1000000,
    },
  },
];

// Incentive alignment data
export const INCENTIVE_ALIGNMENT: Record<CommercialModelType, IncentiveAlignment> = {
  'revenue-share': {
    alignmentScore: 100,
    partnershipLevel: 'Full Partnership',
    investmentLevel: 'Maximum',
    description:
      'The partner invests in your success because their growth is tied to yours. Sales support, training, advertiser outreach, and ongoing optimisation are all aligned to grow CAPI adoption.',
  },
  'annual-cap': {
    alignmentScore: 60,
    partnershipLevel: 'Limited Partnership',
    investmentLevel: 'Reduced',
    description:
      'Partner incentive drops toward zero once the annual cap is reached each year, which can reduce ongoing support in the back half of the year.',
  },
  'flat-fee': {
    alignmentScore: 20,
    partnershipLevel: 'Vendor Relationship',
    investmentLevel: 'Minimum',
    description:
      'No shared incentive to grow CAPI adoption — a fixed fee is paid regardless of the revenue produced. Typically a minimum viable service level.',
  },
};

// Waterfall step for visualization
export interface WaterfallStep {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'neutral' | 'total' | 'highlight';
  color: string;
}
