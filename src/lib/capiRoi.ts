// capiRoi.ts - the publisher CAPI ROI model.
//
// This is the credible, publisher-grounded replacement for the old "match rate"
// calculator. A publisher never knows their match rate, campaign count, or
// addressability. They know one concrete, non-sensitive number: what their single
// biggest advertiser spends with them a year. From that anchor plus a book-scale
// choice we ESTIMATE their open-web ad revenue (deriveRevenueFromBook); vertical and
// the direct-sold / performance share have sensible defaults and are refined in the
// drawer. Everything technical is DERIVED here, and revenue itself is never demanded.
//
// The model answers one question: if you stood up your OWN Conversions API on an
// AdFixus identity backbone, how much incremental annual ad revenue would it be
// worth? It decomposes that into three non-overlapping levers, each of which
// traces to a named, adjustable assumption grounded in the Chegg/Carsales deck.
//
// Every number returned here traces to an input or a documented rate below. The
// headline reveal and the commercial DepthDrawer both consume THIS total, so the
// surface never shows a second, unrelated number.

export type Vertical = 'auto' | 'education' | 'retail' | 'finance' | 'travel' | 'other';

/**
 * How big the publisher's advertiser book is, relative to its single biggest
 * advertiser. This is the ONLY scaling input the guided flow asks for - it never
 * asks a publisher to type their P&L revenue. Instead we anchor on a concrete,
 * non-sensitive number a sales leader always knows (what their biggest advertiser
 * spends with them) and multiply by a book factor to estimate the book.
 *
 * The factor is "how many advertisers of that flagship's economic weight would
 * add up to your whole book" - i.e. the flagship is 1/factor of the book. All
 * three are deliberately round, defensible, and adjustable.
 */
export type BookScale = 'handful' | 'dozens' | 'hundreds';

export interface BookScaleProfile {
  id: BookScale;
  label: string;
  /** One-line description shown under the label. */
  sublabel: string;
  /** Book estimate = flagshipSpend x factor. */
  factor: number;
}

export const BOOK_SCALES: Record<BookScale, BookScaleProfile> = {
  handful: {
    id: 'handful',
    label: 'A handful',
    sublabel: 'a few marquee advertisers',
    factor: 5,
  },
  dozens: {
    id: 'dozens',
    label: 'Dozens',
    sublabel: 'a solid mid-market book',
    factor: 12,
  },
  hundreds: {
    id: 'hundreds',
    label: 'Hundreds',
    sublabel: 'a deep, long-tail book',
    factor: 30,
  },
};

export const DEFAULT_FLAGSHIP_SPEND = 1_000_000;
export const DEFAULT_BOOK_SCALE: BookScale = 'dozens';

/**
 * Estimate annual open-web ad revenue from the advertiser anchor. This is the
 * derivation that lets the tool NEVER ask for revenue directly: the flagship
 * advertiser's spend x the book factor. The publisher can still override the
 * estimate directly in the explore view.
 */
export function deriveRevenueFromBook(flagshipSpend: number, scale: BookScale): number {
  const factor = BOOK_SCALES[scale].factor;
  return Math.round(Math.max(0, flagshipSpend) * factor);
}

/** The publisher-knowable inputs - the only things asked on the surface. */
export interface CapiRoiInputs {
  /**
   * The single biggest advertiser's annual spend with the publisher, $. Concrete
   * and non-sensitive (it is the advertiser's number, not the publisher's P&L),
   * and it drives the per-campaign cap story. The guided-flow anchor.
   */
  flagshipSpend: number;
  /** How big the advertiser book is relative to the flagship (scales the book). */
  bookScale: BookScale;
  /**
   * Annual open-web ad revenue, $. Estimated from flagshipSpend x book factor;
   * never required. Overridable in the explore view.
   */
  annualAdRevenue: number;
  /** Vertical - sets defaults and conversion framing. */
  vertical: Vertical;
  /**
   * Share of ad sales that is direct-sold / performance (the CAPI-addressable
   * portion). Defaulted by vertical (~0.40-0.50); adjustable in the drawer.
   */
  performanceShare: number;
}

/**
 * The adjustable assumptions behind the three levers. Every one is exposed as a
 * slider in the DepthDrawer so the model is fully inspectable. Defaults are
 * grounded in the AdFixus deck benchmarks (documented per field).
 */
export interface CapiRoiAssumptions {
  /**
   * Lever A - win-back rate. Share of the addressable book recovered/grown by
   * running your own CAPI to win outcome budgets back from the walled gardens.
   * Default 0.22 - Carsales + AdFixus opened a CAPI track worth ~$60M, +22%.
   */
  winBackRate: number;
  /**
   * Lever B - enriched share. Share of TOTAL ad revenue delivered on
   * CAPI-enriched / lookalike inventory that can carry a CPM premium.
   * Default 0.35.
   */
  enrichedShare: number;
  /**
   * Lever B - CPM uplift on that enriched inventory. Default 0.15 - the deck's
   * "+15% CPM on CAPI-enriched / lookalike inventory".
   */
  cpmUplift: number;
  /**
   * Lever C - retention value. Repeat / renewed spend from advertisers who stay
   * because measurement finally works. Default 0.08, derived conservatively
   * from the deck's "+40% campaign retention" applied to the addressable book.
   */
  retentionValue: number;
}

/** Deck-grounded default assumptions. Adjustable in the DepthDrawer. */
export const DEFAULT_ASSUMPTIONS: CapiRoiAssumptions = {
  winBackRate: 0.22, // Carsales CAPI track +22%
  enrichedShare: 0.35, // share of inventory that is CAPI-enriched / lookalike
  cpmUplift: 0.15, // deck: +15% CPM on enriched inventory
  retentionValue: 0.08, // from +40% retention → repeat/renewed spend
};

/**
 * How ambitious the upside assumptions are, expressed as a single plain-language
 * dial for a non-technical publisher (a revenue leader / C-suite). Each stance
 * sets all three levers' rates together, so nobody has to reason about
 * "enriched inventory share" or "retention value" - they pick how bold the
 * estimate should be, and the three-lever breakdown shows the result. Balanced is
 * the base case (identical to DEFAULT_ASSUMPTIONS).
 */
export type EstimateStance = 'cautious' | 'balanced' | 'bold';

export interface EstimateStanceProfile {
  id: EstimateStance;
  label: string;
  /** One short line describing the stance. */
  sublabel: string;
  assumptions: CapiRoiAssumptions;
}

export const ESTIMATE_STANCES: Record<EstimateStance, EstimateStanceProfile> = {
  cautious: {
    id: 'cautious',
    label: 'Cautious',
    sublabel: 'lean assumptions',
    assumptions: { winBackRate: 0.12, enrichedShare: 0.25, cpmUplift: 0.1, retentionValue: 0.05 },
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced',
    sublabel: 'our base case',
    assumptions: DEFAULT_ASSUMPTIONS,
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    sublabel: 'full upside',
    assumptions: { winBackRate: 0.32, enrichedShare: 0.45, cpmUplift: 0.2, retentionValue: 0.12 },
  },
};

export const DEFAULT_STANCE: EstimateStance = 'balanced';

/**
 * Per-vertical defaults. `performanceShare` seeds input #3; `label` and
 * `conversionNoun` set the conversion framing on the surface. These are the
 * only vertical-specific knobs - the levers themselves are vertical-agnostic so
 * the model stays legible.
 */
export interface VerticalProfile {
  id: Vertical;
  label: string;
  /** Default direct-sold / performance share of ad sales. */
  performanceShare: number;
  /** The outcome an advertiser sends back through CAPI, for copy. */
  conversionNoun: string;
}

export const VERTICALS: Record<Vertical, VerticalProfile> = {
  auto: {
    id: 'auto',
    label: 'Auto',
    performanceShare: 0.5,
    conversionNoun: 'test-drive bookings and enquiries',
  },
  education: {
    id: 'education',
    label: 'Education',
    performanceShare: 0.45,
    conversionNoun: 'sign-ups and enrolments',
  },
  retail: {
    id: 'retail',
    label: 'Retail',
    performanceShare: 0.5,
    conversionNoun: 'purchases and add-to-carts',
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    performanceShare: 0.45,
    conversionNoun: 'applications and approvals',
  },
  travel: {
    id: 'travel',
    label: 'Travel',
    performanceShare: 0.45,
    conversionNoun: 'bookings and reservations',
  },
  other: {
    id: 'other',
    label: 'Other',
    performanceShare: 0.4,
    conversionNoun: 'conversions',
  },
};

/**
 * The default entry point - a publisher whose biggest advertiser spends ~$1M
 * (the Carsales flagship), a mid-market "dozens" book (~$12M estimated revenue),
 * framed in auto. Everything is adjustable; nothing here is asked as revenue.
 */
export const DEFAULT_INPUTS: CapiRoiInputs = {
  flagshipSpend: DEFAULT_FLAGSHIP_SPEND,
  bookScale: DEFAULT_BOOK_SCALE,
  annualAdRevenue: deriveRevenueFromBook(DEFAULT_FLAGSHIP_SPEND, DEFAULT_BOOK_SCALE),
  vertical: 'auto',
  performanceShare: VERTICALS.auto.performanceShare,
};

/** One lever's contribution, with the trace of how it was derived. */
export interface Lever {
  key: 'winBack' | 'cpm' | 'retention';
  label: string;
  /** A 1-2 word label for compact strips (e.g. the reveal). */
  shortLabel: string;
  value: number;
  /** One-line, human-readable derivation (for the drawer / provenance). */
  basis: string;
  /** The assumption rate that drives this lever. */
  rate: number;
}

export interface CapiRoiResult {
  // Inputs echoed back
  annualAdRevenue: number;
  vertical: Vertical;
  performanceShare: number;

  // Derived internally - never asked
  /** The CAPI-addressable book = annualAdRevenue × performanceShare. */
  addressable: number;

  // The three non-overlapping levers
  levers: {
    winBack: Lever; // Lever A
    cpm: Lever; // Lever B
    retention: Lever; // Lever C
  };

  /** The headline: A + B + C. */
  totalIncremental: number;

  /** totalIncremental as a share of total ad revenue (for context). */
  incrementalAsShareOfRevenue: number;

  /** All rates used, echoed for transparency. */
  assumptions: CapiRoiAssumptions;
}

/**
 * The model. Every value traces to an input or a named assumption.
 *
 * Levers are deliberately non-overlapping:
 *  A "Win back & grow outcome budgets" - new/recovered outcome spend on the
 *    direct-sold book (addressable), measured against the win-back rate. This is
 *    budget the walled gardens took because you could not measure outcomes.
 *  B "Higher CPM on CAPI-enriched inventory" - a price premium on the slice of
 *    ALL inventory that is enriched with CAPI signal / lookalikes. This prices
 *    inventory, not budget, so it does not double-count A.
 *  C "Advertiser retention" - repeat / renewed spend from advertisers who stay
 *    because measurement works. This is durability of the addressable book over
 *    time, distinct from the one-off win-back in A.
 */
export function calculateCapiRoi(
  inputs: CapiRoiInputs,
  assumptions: CapiRoiAssumptions = DEFAULT_ASSUMPTIONS,
): CapiRoiResult {
  const annualAdRevenue = Math.max(0, inputs.annualAdRevenue);
  const performanceShare = clamp01(inputs.performanceShare);
  const { winBackRate, enrichedShare, cpmUplift, retentionValue } = assumptions;

  // Derived internally - the CAPI-addressable book.
  const addressable = annualAdRevenue * performanceShare;

  // Lever A - win back & grow outcome budgets.
  const winBackValue = addressable * winBackRate;

  // Lever B - higher CPM on CAPI-enriched inventory (prices inventory, not budget).
  const enrichedInventory = annualAdRevenue * enrichedShare;
  const cpmValue = enrichedInventory * cpmUplift;

  // Lever C - advertiser retention (durability of the addressable book).
  const retentionValueDollars = addressable * retentionValue;

  const totalIncremental = winBackValue + cpmValue + retentionValueDollars;

  const levers: CapiRoiResult['levers'] = {
    winBack: {
      key: 'winBack',
      label: 'Win back & grow outcome budgets',
      shortLabel: 'Budgets won back',
      value: winBackValue,
      basis: `${fmtPct(performanceShare)} addressable book × ${fmtPct(winBackRate)} win-back (Carsales CAPI track +22%)`,
      rate: winBackRate,
    },
    cpm: {
      key: 'cpm',
      label: 'Higher CPM on CAPI-enriched inventory',
      shortLabel: 'Higher CPM',
      value: cpmValue,
      basis: `${fmtPct(enrichedShare)} of revenue enriched × ${fmtPct(cpmUplift)} CPM uplift (deck: +15%)`,
      rate: cpmUplift,
    },
    retention: {
      key: 'retention',
      label: 'Advertiser retention',
      shortLabel: 'Advertisers who stay',
      value: retentionValueDollars,
      basis: `${fmtPct(performanceShare)} addressable book × ${fmtPct(retentionValue)} retained/renewed spend (from +40% retention)`,
      rate: retentionValue,
    },
  };

  return {
    annualAdRevenue,
    vertical: inputs.vertical,
    performanceShare,
    addressable,
    levers,
    totalIncremental,
    incrementalAsShareOfRevenue: annualAdRevenue > 0 ? totalIncremental / annualAdRevenue : 0,
    assumptions,
  };
}

/**
 * Derive an illustrative avg campaign spend and campaign count from the
 * addressable book, so the $30K-cap economics table in the drawer is grounded in
 * the SAME inputs rather than free-floating. We assume a mid-market average
 * campaign size and back out the count from the addressable spend it represents.
 *
 * This is intentionally illustrative: it exists only to feed the per-campaign
 * cap table with a realistic distribution, and it reconciles to `addressable`.
 */
export interface DerivedCampaignShape {
  avgCampaignSpend: number;
  campaignCount: number;
  /** The addressable spend these campaigns represent (== addressable). */
  addressableSpend: number;
}

export function deriveCampaignShape(result: CapiRoiResult): DerivedCampaignShape {
  const addressable = result.addressable;
  // A realistic mid-market average campaign spend scales gently with the size of
  // the book: small publishers run smaller campaigns, large ones run larger.
  // Bounded to a sensible $80K-$400K band so the cap table stays legible.
  const avgCampaignSpend = clamp(addressable * 0.006, 80_000, 400_000);
  const campaignCount = avgCampaignSpend > 0 ? Math.max(1, Math.round(addressable / avgCampaignSpend)) : 0;
  return {
    avgCampaignSpend: Math.round(avgCampaignSpend),
    campaignCount,
    addressableSpend: addressable,
  };
}

/**
 * A simple 3-year ramp of the headline total. CAPI adoption ramps: partial in
 * year 1 as the first advertisers come online, near-full in year 2, compounding
 * slightly in year 3 as more of the book moves to outcome-based buying.
 */
export const RAMP_YEARS = [0.55, 1.0, 1.2] as const;

export interface RampPoint {
  year: number;
  factor: number;
  incremental: number;
}

export function threeYearRamp(result: CapiRoiResult): RampPoint[] {
  return RAMP_YEARS.map((factor, i) => ({
    year: i + 1,
    factor,
    incremental: result.totalIncremental * factor,
  }));
}

/** Cumulative 3-year incremental at the ramp above. */
export function threeYearCumulative(result: CapiRoiResult): number {
  return threeYearRamp(result).reduce((sum, p) => sum + p.incremental, 0);
}

// ---- helpers -------------------------------------------------------------

function clamp01(n: number): number {
  return clamp(n, 0, 1);
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/** Compact currency, shared with the surface. */
export function formatCapiCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}
