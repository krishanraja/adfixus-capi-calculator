import { useMemo, useState } from 'react';
import {
  calculateCapiBenefits,
  UnifiedCalculationEngine,
  type AssumptionOverrides,
  type RiskScenario,
  type UnifiedResults,
  type MonthlyProjection,
} from '@/core';

export type RevenueMode = 'portfolio' | 'traffic';

export interface SalesPlanInputs {
  // Revenue basis
  revenueMode: RevenueMode;
  portfolioRevenue: number; // annual $ (used when revenueMode === 'portfolio')
  monthlyPageviews: number; // used when revenueMode === 'traffic'
  displayCPM: number;
  videoCPM: number;

  // CAPI campaign economics
  avgCampaignSpend: number;
  yearlyCampaigns: number;
  useReadinessForCampaigns: boolean; // let business-readiness drive campaign volume
  capiLineItemShare: number; // 0.2 - 1.0
  serviceFee: number; // 0.05 - 0.20
  matchRateImproved: number; // 0.5 - 0.95

  // Business readiness
  salesReadiness: number; // 0.4 - 1.0
  trainingGaps: number; // 0.4 - 1.0
  advertiserBuyIn: number; // 0.4 - 1.0
  marketConditions: number; // 0.6 - 1.0

  // Risk scenario
  risk: RiskScenario;
}

export const BASELINE_MATCH_RATE = 0.3;

export const DEFAULT_INPUTS: SalesPlanInputs = {
  revenueMode: 'portfolio',
  portfolioRevenue: 60_000_000,
  monthlyPageviews: 100_000_000,
  displayCPM: 4.5,
  videoCPM: 12,

  avgCampaignSpend: 150_000,
  yearlyCampaigns: 24,
  useReadinessForCampaigns: false,
  capiLineItemShare: 0.6,
  serviceFee: 0.125,
  matchRateImproved: 0.75,

  salesReadiness: 0.75,
  trainingGaps: 0.75,
  advertiserBuyIn: 0.8,
  marketConditions: 0.85,

  risk: 'moderate',
};

// Convert an annual portfolio revenue figure into an equivalent monthly
// pageview volume, so a publisher can enter either. Uses the same CPM/ad-density
// defaults the core engine models against.
function revenueToMonthlyPageviews(
  annualRevenue: number,
  displayCPM: number,
  videoCPM: number,
): number {
  const monthlyRevenue = annualRevenue / 12;
  const displayShare = 0.8; // engine default display/video split
  const adsPerPage = 2.0; // engine default
  const blendedCPM = displayCPM * displayShare + videoCPM * (1 - displayShare);
  if (blendedCPM <= 0) return 0;
  const monthlyImpressions = (monthlyRevenue / blendedCPM) * 1000;
  return monthlyImpressions / adsPerPage;
}

export function buildOverrides(inputs: SalesPlanInputs): AssumptionOverrides {
  const overrides: AssumptionOverrides = {
    capiLineItemShare: inputs.capiLineItemShare,
    capiServiceFee: inputs.serviceFee,
    capiMatchRate: inputs.matchRateImproved,
    capiAvgCampaignSpend: inputs.avgCampaignSpend,
    readinessFactors: {
      salesReadiness: inputs.salesReadiness,
      trainingGaps: inputs.trainingGaps,
      advertiserBuyIn: inputs.advertiserBuyIn,
      marketConditions: inputs.marketConditions,
    },
  };

  // Only pin the yearly campaign count if the publisher is driving it manually.
  // Otherwise business-readiness sliders derive it inside the engine.
  if (!inputs.useReadinessForCampaigns) {
    overrides.capiYearlyCampaigns = inputs.yearlyCampaigns;
  }

  return overrides;
}

export interface SalesPlanResult {
  results: UnifiedResults;
  monthlyProjection: MonthlyProjection[];
}

export function computeSalesPlan(inputs: SalesPlanInputs): SalesPlanResult {
  const monthlyPageviews =
    inputs.revenueMode === 'portfolio'
      ? revenueToMonthlyPageviews(inputs.portfolioRevenue, inputs.displayCPM, inputs.videoCPM)
      : inputs.monthlyPageviews;

  const results = calculateCapiBenefits(
    {
      monthlyPageviews: Math.max(1, monthlyPageviews),
      displayCPM: inputs.displayCPM,
      videoCPM: inputs.videoCPM,
      capiLineItemShare: inputs.capiLineItemShare,
    },
    {
      deployment: 'single',
      risk: inputs.risk,
      overrides: buildOverrides(inputs),
    },
  );

  const monthlyProjection = UnifiedCalculationEngine.generateMonthlyProjection(results);

  return { results, monthlyProjection };
}

export function useSalesPlan() {
  const [inputs, setInputs] = useState<SalesPlanInputs>(DEFAULT_INPUTS);

  const plan = useMemo(() => computeSalesPlan(inputs), [inputs]);

  const update = <K extends keyof SalesPlanInputs>(key: K, value: SalesPlanInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setInputs(DEFAULT_INPUTS);

  return { inputs, setInputs, update, reset, plan };
}
