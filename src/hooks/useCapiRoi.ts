// useCapiRoi - the single source of truth for the CAPI ROI surface.
//
// Holds the three publisher-knowable inputs (annual ad revenue, vertical,
// performance share), the adjustable lever assumptions (exposed in the drawer),
// and derives BOTH the headline (calculateCapiRoi) and the commercial pricing
// (priceCapiRoi) from them. Headline and drawer therefore always reconcile.

import { useMemo, useState } from 'react';
import {
  calculateCapiRoi,
  threeYearRamp,
  threeYearCumulative,
  deriveRevenueFromBook,
  DEFAULT_INPUTS,
  DEFAULT_ASSUMPTIONS,
  VERTICALS,
  type CapiRoiInputs,
  type CapiRoiAssumptions,
  type CapiRoiResult,
  type Vertical,
  type BookScale,
  type RampPoint,
} from '@/lib/capiRoi';
import { priceCapiRoi, type CapiCommercialResult } from '@/lib/capiCommercial';

export interface CapiRoiState {
  inputs: CapiRoiInputs;
  assumptions: CapiRoiAssumptions;
  result: CapiRoiResult;
  commercial: CapiCommercialResult;
  ramp: RampPoint[];
  cumulativeThreeYear: number;
  /** True once the publisher has overridden the estimated revenue directly. */
  revenueIsCustom: boolean;
  setFlagshipSpend: (v: number) => void;
  setBookScale: (v: BookScale) => void;
  setRevenue: (v: number) => void;
  setVertical: (v: Vertical) => void;
  setPerformanceShare: (v: number) => void;
  setAssumption: <K extends keyof CapiRoiAssumptions>(key: K, value: number) => void;
  reset: () => void;
}

export function useCapiRoi(): CapiRoiState {
  const [inputs, setInputs] = useState<CapiRoiInputs>(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState<CapiRoiAssumptions>(DEFAULT_ASSUMPTIONS);
  // Until the publisher edits revenue directly, we keep it derived from the
  // advertiser anchor (flagship x book factor) so we never have to ask for it.
  const [revenueIsCustom, setRevenueIsCustom] = useState(false);

  const result = useMemo(() => calculateCapiRoi(inputs, assumptions), [inputs, assumptions]);
  const commercial = useMemo(() => priceCapiRoi(result), [result]);
  const ramp = useMemo(() => threeYearRamp(result), [result]);
  const cumulativeThreeYear = useMemo(() => threeYearCumulative(result), [result]);

  // The advertiser anchor. Changing it re-estimates revenue unless the publisher
  // has taken manual control of the revenue figure in the explore view.
  const setFlagshipSpend = (v: number) =>
    setInputs((p) => ({
      ...p,
      flagshipSpend: v,
      annualAdRevenue: revenueIsCustom ? p.annualAdRevenue : deriveRevenueFromBook(v, p.bookScale),
    }));

  const setBookScale = (v: BookScale) =>
    setInputs((p) => ({
      ...p,
      bookScale: v,
      annualAdRevenue: revenueIsCustom
        ? p.annualAdRevenue
        : deriveRevenueFromBook(p.flagshipSpend, v),
    }));

  // Direct revenue override (explore view). From here on, the estimate is the
  // publisher's own number and the anchor no longer overwrites it.
  const setRevenue = (v: number) => {
    setRevenueIsCustom(true);
    setInputs((p) => ({ ...p, annualAdRevenue: v }));
  };

  // Changing vertical also resets performanceShare to that vertical's default,
  // so the framing and the addressable book stay consistent.
  const setVertical = (v: Vertical) =>
    setInputs((p) => ({ ...p, vertical: v, performanceShare: VERTICALS[v].performanceShare }));

  const setPerformanceShare = (v: number) => setInputs((p) => ({ ...p, performanceShare: v }));

  const setAssumption = <K extends keyof CapiRoiAssumptions>(key: K, value: number) =>
    setAssumptions((p) => ({ ...p, [key]: value }));

  const reset = () => {
    setInputs(DEFAULT_INPUTS);
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setRevenueIsCustom(false);
  };

  return {
    inputs,
    assumptions,
    result,
    commercial,
    ramp,
    cumulativeThreeYear,
    revenueIsCustom,
    setFlagshipSpend,
    setBookScale,
    setRevenue,
    setVertical,
    setPerformanceShare,
    setAssumption,
    reset,
  };
}
