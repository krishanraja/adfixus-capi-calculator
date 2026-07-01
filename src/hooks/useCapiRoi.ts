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
  DEFAULT_INPUTS,
  DEFAULT_ASSUMPTIONS,
  VERTICALS,
  type CapiRoiInputs,
  type CapiRoiAssumptions,
  type CapiRoiResult,
  type Vertical,
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
  setRevenue: (v: number) => void;
  setVertical: (v: Vertical) => void;
  setPerformanceShare: (v: number) => void;
  setAssumption: <K extends keyof CapiRoiAssumptions>(key: K, value: number) => void;
  reset: () => void;
}

export function useCapiRoi(): CapiRoiState {
  const [inputs, setInputs] = useState<CapiRoiInputs>(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState<CapiRoiAssumptions>(DEFAULT_ASSUMPTIONS);

  const result = useMemo(() => calculateCapiRoi(inputs, assumptions), [inputs, assumptions]);
  const commercial = useMemo(() => priceCapiRoi(result), [result]);
  const ramp = useMemo(() => threeYearRamp(result), [result]);
  const cumulativeThreeYear = useMemo(() => threeYearCumulative(result), [result]);

  const setRevenue = (v: number) => setInputs((p) => ({ ...p, annualAdRevenue: v }));

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
  };

  return {
    inputs,
    assumptions,
    result,
    commercial,
    ramp,
    cumulativeThreeYear,
    setRevenue,
    setVertical,
    setPerformanceShare,
    setAssumption,
    reset,
  };
}
