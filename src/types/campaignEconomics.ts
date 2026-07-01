// Campaign-Level CAPI Economics Types
// Shows the magic of the $30K campaign cap for large campaigns.
// Ported from the Vox engine into the CAPI sales-plan simulator.

export interface CampaignEconomics {
  campaignSpend: number;
  incrementalRevenue: number;      // spend × conversionMultiplier (40%)
  rawFee: number;                  // incrementalRevenue × 12.5%
  cappedFee: number;               // min(rawFee, $30K)
  netToPublisher: number;          // incrementalRevenue - cappedFee
  roiMultiple: number;             // incrementalRevenue / cappedFee
  isCapped: boolean;               // rawFee > $30K
  capSavings: number;              // rawFee - cappedFee (what publisher saves due to cap)
}

export interface CampaignTier {
  label: string;
  minSpend: number;
  maxSpend: number;
  avgSpend: number;
  count: number;
  economics: CampaignEconomics;
  totalIncremental: number;
  totalFees: number;
  totalNet: number;
}

export interface CampaignPortfolioAnalysis {
  // Summary metrics
  totalCampaigns: number;
  avgCampaignSpend: number;
  totalCampaignSpend: number;

  // Aggregate economics
  totalIncremental: number;
  totalFees: number;
  totalCapSavings: number;
  totalNetToPublisher: number;
  portfolioROI: number;

  // Campaign distribution by tier
  tiers: CampaignTier[];

  // Key insight: campaigns above cap threshold
  campaignsAboveCap: number;
  capThreshold: number;           // spend where the $30K cap kicks in
  aboveCapIncremental: number;
  aboveCapSavings: number;

  // Monthly/Annual projections
  monthlyIncremental: number;
  annualIncremental: number;
  monthlyFees: number;
  annualFees: number;
  monthlyNet: number;
  annualNet: number;

  // Example campaigns for storytelling
  exampleCampaigns: CampaignEconomics[];
}

// Constants for CAPI campaign economics
export const CAPI_ECONOMICS_CONSTANTS = {
  // Revenue share rate (publisher's revenue-share economics)
  REVENUE_SHARE_RATE: 0.125,          // 12.5%

  // Campaign-level cap (the magic!)
  CAMPAIGN_CAP: 30000,                 // $30K per campaign

  // Conversion improvement (validated by CarSales)
  CONVERSION_IMPROVEMENT: 0.40,        // 40% improvement

  // Cap kicks in when: spend × CONVERSION_IMPROVEMENT × REVENUE_SHARE_RATE > CAMPAIGN_CAP
  //   spend × 0.40 × 0.125 > $30K → spend > $600K
  CAP_THRESHOLD: 600000,               // Spend where $30K cap kicks in

  // Realistic campaign distribution for modeling
  DEFAULT_DISTRIBUTION: {
    small: 0.50,    // 50% of campaigns are small (<$100K)
    medium: 0.35,   // 35% are medium ($100K-$300K)
    large: 0.15,    // 15% are large ($300K+)
  },
};

// CarSales proof point (validated case study)
export const CARSALES_PROOF_POINT = {
  quote:
    'Having the AdFixus ID allowed us to build products that won back ~$1.8M in NEW revenue we were not seeing before. Our largest partner increased spend from $300K to $1M in a single booking.',
  author: 'Stephen Kyefulumya',
  title: 'GM Media Product & Technology',
  company: 'Carsales',
  stats: {
    totalCampaigns: 100,
    newRevenueWon: 1800000,
    largestCampaign: {
      before: 300000,
      after: 1000000,
      growth: '233%',
    },
    // At $1M campaign: incremental = $400K, fee = min($400K × 12.5%, $30K) = $30K (capped)
    // Net to publisher = $370K, ROI = 13.3x
    largestCampaignEconomics: {
      spend: 1000000,
      incremental: 400000,
      fee: 30000,
      netToPublisher: 370000,
      roi: 13.3,
    },
  },
};
