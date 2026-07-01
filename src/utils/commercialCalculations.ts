// Commercial Model Calculations
// Calculates incentive alignment and 36-month projections for CAPI revenue only.
// CRITICAL: Revenue share applies ONLY to CAPI incremental revenue, not the full deal.

import {
  CommercialModel,
  CommercialModelType,
  ScenarioComparison,
  MonthlyCommercialData,
  WaterfallStep,
  COMMERCIAL_MODELS,
  INCENTIVE_ALIGNMENT,
} from '@/types/commercialModel';
import type { UnifiedResults } from '@/core';

// 36-month ramp-up curve (realistic adoption for CAPI campaigns)
const RAMP_UP_CURVE = [
  // Year 1: POC → Scale
  0.15, 0.25, 0.35, // Q1: POC phase
  0.50, 0.65, 0.75, // Q2: Early scale
  0.82, 0.88, 0.92, // Q3: Full scale
  0.95, 0.97, 1.00, // Q4: Maturity
  // Year 2: Steady state + optimization
  1.00, 1.02, 1.04, 1.06, 1.08, 1.10,
  1.10, 1.12, 1.14, 1.15, 1.15, 1.15,
  // Year 3: Mature + compound effects
  1.15, 1.18, 1.20, 1.22, 1.24, 1.25,
  1.25, 1.26, 1.27, 1.28, 1.29, 1.30,
];

/**
 * Get CAPI-only monthly incremental revenue.
 * Revenue share applies ONLY to CAPI, not ID Infrastructure or Media Performance.
 */
export const getCapiMonthlyIncremental = (results: UnifiedResults): number => {
  return results.capiCapabilities?.conversionTrackingRevenue || 0;
};

export interface DealBreakdownResult {
  year1: {
    idInfrastructure: number;
    capi: number;
    mediaPerformance: number;
    total: number;
  };
  threeYear: {
    idInfrastructure: number;
    capi: number;
    mediaPerformance: number;
    total: number;
  };
  display: {
    idInfrastructure: number;
    capi: number;
    mediaPerformance: number;
    total: number;
    label: string;
  };
  monthly: {
    idInfrastructure: number;
    capi: number;
    mediaPerformance: number;
    total: number;
  };
  isValid: boolean;
  validationErrors: string[];
}

export const getDealBreakdown = (
  results: UnifiedResults,
  timeframe: '1-year' | '3-year' = '3-year',
): DealBreakdownResult => {
  const validationErrors: string[] = [];

  const idInfraMonthly = results.idInfrastructure?.monthlyUplift || 0;
  const capiMonthly = results.capiCapabilities?.monthlyUplift || 0;
  const mediaMonthly = results.mediaPerformance?.monthlyUplift || 0;

  const calculatedMonthlyTotal = idInfraMonthly + capiMonthly + mediaMonthly;
  const statedMonthlyTotal = results.totals.totalMonthlyUplift;

  if (Math.abs(calculatedMonthlyTotal - statedMonthlyTotal) > 0.01) {
    validationErrors.push(
      `Monthly sum mismatch: ${calculatedMonthlyTotal.toFixed(2)} ≠ ${statedMonthlyTotal.toFixed(2)}`,
    );
  }

  const year1 = {
    idInfrastructure: idInfraMonthly * 12,
    capi: capiMonthly * 12,
    mediaPerformance: mediaMonthly * 12,
    total: calculatedMonthlyTotal * 12,
  };

  let id36 = 0;
  let capi36 = 0;
  let media36 = 0;
  for (let month = 0; month < 36; month++) {
    const ramp = RAMP_UP_CURVE[month] || 1.30;
    id36 += idInfraMonthly * ramp;
    capi36 += capiMonthly * ramp;
    media36 += mediaMonthly * ramp;
  }

  const threeYear = {
    idInfrastructure: id36,
    capi: capi36,
    mediaPerformance: media36,
    total: id36 + capi36 + media36,
  };

  const display =
    timeframe === '1-year'
      ? { ...year1, label: '12 months' }
      : { ...threeYear, label: '36 months' };

  return {
    year1,
    threeYear,
    display,
    monthly: {
      idInfrastructure: idInfraMonthly,
      capi: capiMonthly,
      mediaPerformance: mediaMonthly,
      total: calculatedMonthlyTotal,
    },
    isValid: validationErrors.length === 0,
    validationErrors,
  };
};

/**
 * Calculate the partner's share for a given month's CAPI incremental revenue.
 */
export const calculateAdfixusShare = (
  modelType: CommercialModelType,
  monthlyCapiIncremental: number,
  cumulativeYearFees: number,
  modelParams: CommercialModel['params'],
): { fee: number; postCapBenefit: number } => {
  switch (modelType) {
    case 'revenue-share': {
      const shareRate = modelParams.sharePercentage || 0.125;
      const fee = monthlyCapiIncremental * shareRate;
      return { fee, postCapBenefit: 0 };
    }

    case 'flat-fee': {
      const annualFee = modelParams.annualFlatFee || 1000000;
      return { fee: annualFee / 12, postCapBenefit: 0 };
    }

    case 'annual-cap': {
      const annualCap = modelParams.annualCap || 1200000;
      const shareRate = modelParams.baseSharePercentage || 0.125;

      const rawFee = monthlyCapiIncremental * shareRate;
      const remainingCap = Math.max(0, annualCap - cumulativeYearFees);

      if (remainingCap <= 0) {
        return { fee: 0, postCapBenefit: monthlyCapiIncremental };
      }

      const actualFee = Math.min(rawFee, remainingCap);
      const postCapBenefit =
        actualFee < rawFee ? monthlyCapiIncremental - actualFee / shareRate : 0;

      return { fee: actualFee, postCapBenefit };
    }

    default:
      return { fee: 0, postCapBenefit: 0 };
  }
};

/**
 * Generate 36-month projection for a CAPI commercial model.
 */
export const generateMonthlyProjection = (
  model: CommercialModel,
  baseMonthlyCapiIncremental: number,
  baseMonthlyRevenue: number,
): MonthlyCommercialData[] => {
  const projection: MonthlyCommercialData[] = [];
  let cumulativeIncremental = 0;
  let cumulativePublisherGain = 0;
  let cumulativeAdfixusShare = 0;
  let cumulativePostCapBenefit = 0;

  let yearFees = 0;
  let currentYear = 0;

  for (let month = 1; month <= 36; month++) {
    const rampUp = RAMP_UP_CURVE[month - 1] || 1.30;
    const thisYear = Math.floor((month - 1) / 12);

    if (thisYear !== currentYear) {
      yearFees = 0;
      currentYear = thisYear;
    }

    const monthlyIncremental = baseMonthlyCapiIncremental * rampUp;
    cumulativeIncremental += monthlyIncremental;

    const { fee: adfixusShare, postCapBenefit } = calculateAdfixusShare(
      model.type,
      monthlyIncremental,
      yearFees,
      model.params,
    );

    yearFees += adfixusShare;
    cumulativeAdfixusShare += adfixusShare;
    cumulativePostCapBenefit += postCapBenefit;

    const publisherGain = monthlyIncremental - adfixusShare;
    cumulativePublisherGain += publisherGain;

    projection.push({
      month,
      monthLabel: `M${month}`,
      baseRevenue: baseMonthlyRevenue,
      incrementalRevenue: monthlyIncremental,
      cumulativeIncremental,
      publisherNetGain: publisherGain,
      cumulativePublisherGain,
      adfixusShare,
      cumulativeAdfixusShare,
      postCapBenefit,
      cumulativePostCapBenefit,
    });
  }

  return projection;
};

export const generateScenarioComparison = (
  model: CommercialModel,
  results: UnifiedResults,
): ScenarioComparison => {
  const baseMonthlyCapiIncremental = getCapiMonthlyIncremental(results);
  const baseMonthlyRevenue = results.totals.currentMonthlyRevenue;

  const projection = generateMonthlyProjection(
    model,
    baseMonthlyCapiIncremental,
    baseMonthlyRevenue,
  );
  const final = projection[projection.length - 1];

  const netPublisherGainPercentage =
    final.cumulativeIncremental > 0
      ? (final.cumulativePublisherGain / final.cumulativeIncremental) * 100
      : 0;

  const roiMultiple =
    final.cumulativeAdfixusShare > 0
      ? final.cumulativePublisherGain / final.cumulativeAdfixusShare
      : 0;

  return {
    model,
    baseRevenue: baseMonthlyRevenue * 36,
    incrementalRevenue: final.cumulativeIncremental,
    publisherNetGain: final.cumulativePublisherGain,
    adfixusShare: final.cumulativeAdfixusShare,
    incentiveAlignment: INCENTIVE_ALIGNMENT[model.type],
    postCapBenefit: final.cumulativePostCapBenefit,
    monthlyProjection: projection,
    netPublisherGainPercentage,
    roiMultiple,
  };
};

export const generateAllScenarios = (results: UnifiedResults): ScenarioComparison[] => {
  return COMMERCIAL_MODELS.map((model) => generateScenarioComparison(model, results));
};

export const generateWaterfall = (scenario: ScenarioComparison): WaterfallStep[] => {
  const steps: WaterfallStep[] = [
    {
      label: 'CAPI Incremental',
      value: scenario.incrementalRevenue,
      type: 'total',
      color: 'hsl(var(--primary))',
    },
    {
      label: 'Publisher Keeps',
      value: scenario.publisherNetGain,
      type: 'positive',
      color: 'hsl(142 71% 45%)',
    },
    {
      label: 'Share of Upside',
      value: scenario.adfixusShare,
      type: 'neutral',
      color: 'hsl(var(--muted-foreground))',
    },
  ];

  if (scenario.postCapBenefit > 0) {
    steps.push({
      label: 'Post-Cap (100% publisher)',
      value: scenario.postCapBenefit,
      type: 'highlight',
      color: 'hsl(142 71% 55%)',
    });
  }

  return steps;
};

export const getProofPoint = () => ({
  quote:
    'Having the AdFixus ID allowed us to build products that won back ~$1.8M in NEW revenue we were not seeing before. Our largest partner increased spend from $300K to $1M in a single booking.',
  author: 'Stephen Kyefulumya',
  title: 'GM Media Product & Technology',
  company: 'Carsales',
});

export const formatCommercialCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};
