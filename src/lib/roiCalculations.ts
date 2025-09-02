import { ROI_CONSTANTS } from '@/constants/roiConstants';
import type { ROIInputs, ROIResults } from '@/types/roi';

export function calculateROI(inputs: ROIInputs): ROIResults {
  const {
    annualRevenue,
    chromePercentage,
    displayShare,
    videoShare,
    performanceCampaignPercentage
  } = inputs;

  // Convert percentages to decimals
  const chromePercent = chromePercentage / 100;
  const displayPercent = displayShare / 100;
  const videoPercent = videoShare / 100;
  const performancePercent = performanceCampaignPercentage / 100;

  // Current revenue breakdown
  const currentDisplayRevenue = annualRevenue * displayPercent;
  const currentVideoRevenue = annualRevenue * videoPercent;
  const currentRetargetingRevenue = annualRevenue * ROI_CONSTANTS.RETARGETING_SHARE;

  // Performance campaigns only (eligible for CAPI)
  const performanceDisplayRevenue = currentDisplayRevenue * performancePercent;
  const performanceVideoRevenue = currentVideoRevenue * performancePercent;
  const performanceRetargetingRevenue = currentRetargetingRevenue * performancePercent;

  // Calculate base improvements from CAPI
  const baseDisplayImprovement = performanceDisplayRevenue * (ROI_CONSTANTS.DISPLAY_CAPI_CR_MULTIPLIER - 1);
  const baseVideoImprovement = performanceVideoRevenue * (ROI_CONSTANTS.WEB_VIDEO_CAPI_CR_MULTIPLIER - 1);
  const baseRetargetingImprovement = performanceRetargetingRevenue * (ROI_CONSTANTS.CAPI_CTR_MULTIPLIER - 1);

  // Apply Chrome reduction factor
  const chromeReductionFactor = chromePercent * ROI_CONSTANTS.CHROME_BENEFIT_REDUCTION;
  const effectiveDisplayImprovement = baseDisplayImprovement * (1 - chromeReductionFactor);
  const effectiveVideoImprovement = baseVideoImprovement * (1 - chromeReductionFactor);
  const effectiveRetargetingImprovement = baseRetargetingImprovement * (1 - chromeReductionFactor);

  // Apply market constraints (CPM penalty and publisher upsell success rate)
  const cpmPenaltyFactor = 1 / (1 + (ROI_CONSTANTS.CPM_INCREASE * 0.7));
  const publisherConstraintFactor = ROI_CONSTANTS.PUBLISHER_UPSELL_SUCCESS_RATE;

  const netDisplayImprovement = effectiveDisplayImprovement * cpmPenaltyFactor * publisherConstraintFactor;
  const netVideoImprovement = effectiveVideoImprovement * cpmPenaltyFactor * publisherConstraintFactor;
  const netRetargetingImprovement = effectiveRetargetingImprovement * cpmPenaltyFactor * publisherConstraintFactor;

  // Calculate final projections
  const projectedDisplayRevenue = currentDisplayRevenue + netDisplayImprovement;
  const projectedVideoRevenue = currentVideoRevenue + netVideoImprovement;
  const projectedRetargetingRevenue = currentRetargetingRevenue + netRetargetingImprovement;

  const currentTotalRevenue = currentDisplayRevenue + currentVideoRevenue + currentRetargetingRevenue;
  const projectedRevenue = projectedDisplayRevenue + projectedVideoRevenue + projectedRetargetingRevenue;
  const incrementalRevenue = projectedRevenue - currentTotalRevenue;
  const incrementalPercentage = (incrementalRevenue / currentTotalRevenue) * 100;

  const results: ROIResults = {
    currentRevenue: currentTotalRevenue,
    currentDisplayRevenue,
    currentVideoRevenue,
    currentRetargetingRevenue,
    projectedRevenue,
    projectedDisplayRevenue,
    projectedVideoRevenue,
    projectedRetargetingRevenue,
    incrementalRevenue,
    incrementalPercentage,
    conversionImprovements: {
      displayImprovement: netDisplayImprovement,
      videoImprovement: netVideoImprovement,
      retargetingImprovement: netRetargetingImprovement,
    }
  };

  return results;
}