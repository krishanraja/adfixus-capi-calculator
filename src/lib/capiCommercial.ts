// capiCommercial.ts — pricing the headline against AdFixus's commercial models.
//
// The headline (from capiRoi.ts) is a single number: totalIncremental annual
// incremental ad revenue. This module takes THAT SAME number and prices it three
// ways so a publisher can see what they pay AdFixus vs what they keep net:
//
//   1. Revenue share — 12.5% of CAPI incremental, with a $30K/campaign/month cap
//      that makes large campaigns hugely publisher-favourable.
//   2. Annual cap — 12.5% until a Year-1 cap, then 100% to the publisher.
//   3. Flat fee — a fixed annual fee regardless of performance.
//
// The $30K-per-campaign cap economics reuse the ported Vox calculator
// (campaignEconomicsCalculator + campaignEconomics constants). The campaign
// shape (avg spend, count) is DERIVED from the addressable book in capiRoi.ts,
// so the cap table reconciles to the same inputs as the headline.
//
// Reconciliation guarantee: `incremental` in every deal here === the headline
// totalIncremental (× ramp). The drawer decomposes/prices that number; it never
// invents a second one.

import { CAPI_ECONOMICS_CONSTANTS } from '@/types/campaignEconomics';
import {
  calculateCampaignEconomics,
  type CampaignEconomics,
} from '@/utils/campaignEconomicsCalculator';
import type { CapiRoiResult, DerivedCampaignShape } from '@/lib/capiRoi';
import { deriveCampaignShape } from '@/lib/capiRoi';

const { REVENUE_SHARE_RATE, CAMPAIGN_CAP } = CAPI_ECONOMICS_CONSTANTS;

export type DealType = 'revenue-share' | 'annual-cap' | 'flat-fee';

export interface DealModel {
  type: DealType;
  label: string;
  tagline: string;
  isRecommended: boolean;
  /** What the publisher pays AdFixus in Year 1, $. */
  adfixusFee: number;
  /** What the publisher keeps net in Year 1, $. */
  publisherNet: number;
  /** Net kept as a share of the incremental (0..1). */
  netShare: number;
  /** One-line description of how the fee is computed. */
  basis: string;
}

/** Deal-model parameters, all adjustable if needed later. */
export const DEAL_PARAMS = {
  revenueShareRate: REVENUE_SHARE_RATE, // 12.5%
  perCampaignCap: CAMPAIGN_CAP, // $30K / campaign / month
  annualCap: 1_200_000, // Year-1 cap for the annual-cap model
  flatAnnualFee: 1_000_000, // flat-fee model
};

/**
 * Price the revenue-share deal WITH the $30K/campaign/month cap.
 *
 * We spread the incremental across the derived campaign shape. Each campaign's
 * fee is 12.5% of its incremental, capped at $30K/month → $360K/year. Summing
 * capped fees across the portfolio is what makes the effective take-rate fall
 * well below 12.5% once large campaigns are involved — the "magic of the cap".
 */
function priceRevenueShare(
  incremental: number,
  shape: DerivedCampaignShape,
): { fee: number; perCampaign: CampaignEconomics } {
  // Incremental per campaign (headline incremental spread over the derived count).
  const perCampaignIncremental =
    shape.campaignCount > 0 ? incremental / shape.campaignCount : incremental;

  // Fee per campaign = 12.5% of its incremental, capped at $30K/month × 12.
  const annualCapPerCampaign = DEAL_PARAMS.perCampaignCap * 12;
  const rawPerCampaignFee = perCampaignIncremental * DEAL_PARAMS.revenueShareRate;
  const cappedPerCampaignFee = Math.min(rawPerCampaignFee, annualCapPerCampaign);
  const fee = cappedPerCampaignFee * shape.campaignCount;

  // A representative per-campaign economics row for storytelling (uses the
  // ported Vox calculator on the derived avg campaign SPEND, not incremental).
  const perCampaign = calculateCampaignEconomics(shape.avgCampaignSpend);

  return { fee, perCampaign };
}

/**
 * Take the headline `totalIncremental` and return the three priced deals plus
 * the derived campaign shape. Every deal's `incremental` is the same number.
 */
export interface CapiCommercialResult {
  incremental: number;
  shape: DerivedCampaignShape;
  deals: DealModel[];
  /** The representative per-campaign economics (for the cap table headline). */
  perCampaign: CampaignEconomics;
}

export function priceCapiRoi(
  result: CapiRoiResult,
  incremental: number = result.totalIncremental,
): CapiCommercialResult {
  const shape = deriveCampaignShape(result);

  // 1. Revenue share with the $30K cap.
  const { fee: revShareFee, perCampaign } = priceRevenueShare(incremental, shape);

  // 2. Annual cap — 12.5% until the cap, then 100% to publisher.
  const rawAnnualFee = incremental * DEAL_PARAMS.revenueShareRate;
  const annualCapFee = Math.min(rawAnnualFee, DEAL_PARAMS.annualCap);

  // 3. Flat fee.
  const flatFee = Math.min(DEAL_PARAMS.flatAnnualFee, incremental); // never pay more than you make

  const deals: DealModel[] = [
    {
      type: 'revenue-share',
      label: 'Revenue share (capped)',
      tagline: 'Aligned incentives. Mutual growth.',
      isRecommended: true,
      adfixusFee: revShareFee,
      publisherNet: incremental - revShareFee,
      netShare: incremental > 0 ? (incremental - revShareFee) / incremental : 0,
      basis: `12.5% of CAPI incremental, capped at $30K per campaign per month`,
    },
    {
      type: 'annual-cap',
      label: 'Annual cap',
      tagline: 'Capped fee. 100% to you above the cap.',
      isRecommended: false,
      adfixusFee: annualCapFee,
      publisherNet: incremental - annualCapFee,
      netShare: incremental > 0 ? (incremental - annualCapFee) / incremental : 0,
      basis: `12.5% up to a ${fmtK(DEAL_PARAMS.annualCap)} annual cap, then 100% to you`,
    },
    {
      type: 'flat-fee',
      label: 'Flat annual fee',
      tagline: 'Fixed cost. No growth alignment.',
      isRecommended: false,
      adfixusFee: flatFee,
      publisherNet: incremental - flatFee,
      netShare: incremental > 0 ? (incremental - flatFee) / incremental : 0,
      basis: `Fixed ${fmtK(DEAL_PARAMS.flatAnnualFee)} per year regardless of performance`,
    },
  ];

  return { incremental, shape, deals, perCampaign };
}

function fmtK(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}
