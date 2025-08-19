// Industry baseline conversion rates and assumptions
export const ROI_CONSTANTS = {
  // Baseline conversion rates
  BASELINE_DISPLAY_CR: 2.58, // 2.58%
  BASELINE_VIDEO_CR: 4.17, // 4.17%
  
  // CAPI improvement multipliers
  DISPLAY_CAPI_CR_MULTIPLIER: 3, // Display CAPI triples conversion rates
  WEB_VIDEO_CAPI_CR_MULTIPLIER: 1.3, // Web video CAPI has modest 30% improvement (branding focus)
  CAPI_CTR_MULTIPLIER: 2, // CAPI doubles CTR for retargeting
  
  // Market constraints
  CPM_INCREASE: 0.35, // 35% CPM increase
  CHROME_BENEFIT_REDUCTION: 0.7, // Chrome benefits are reduced by 70%
  PUBLISHER_UPSELL_SUCCESS_RATE: 0.375, // Only 37.5% of eligible campaigns get successfully upsold to CAPI
  
  // Business validation limits
  MIN_REVENUE: 100000, // Minimum $100K revenue
  RETARGETING_SHARE: 0.15, // Fixed 15% retargeting share
} as const;