import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { UnifiedResults } from '@/core';
import type { SalesPlanInputs } from '@/hooks/useSalesPlan';
import { generateAllScenarios, getCapiMonthlyIncremental } from '@/utils/commercialCalculations';
import { calculateCampaignEconomics } from '@/utils/campaignEconomicsCalculator';

// AdFixus dark-cyan brand palette for the PDF.
const BRAND = {
  cyan: '#12B7E8',
  dark: '#000000',
  panel: '#0A0A0A',
  panelAlt: '#141414',
  white: '#FFFFFF',
  mutedText: '#B3B3B3',
  border: '#2E2E2E',
  green: '#10B981',
  amber: '#F59E0B',
};

const fmt = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

// Set up pdfMake fonts.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyFonts = pdfFonts as any;
  if (anyFonts?.pdfMake?.vfs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfMake as any).vfs = anyFonts.pdfMake.vfs;
  } else if (anyFonts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdfMake as any).vfs = anyFonts;
  }
} catch {
  /* continue without custom fonts */
}

async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return 'data:image/png;base64,';
  }
}

export async function buildSalesPlanPdf(
  inputs: SalesPlanInputs,
  results: UnifiedResults,
): Promise<void> {
  const logoDataUrl = await urlToBase64('/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png');
  const bookingUrl =
    import.meta.env.VITE_MEETING_BOOKING_URL ||
    'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

  const capi = results.capiCapabilities;
  const config = capi?.capiConfiguration;
  const capiMonthlyIncremental = getCapiMonthlyIncremental(results);
  const annualIncremental = capiMonthlyIncremental * 12;
  const serviceFeeRate = results.pricing.capiServiceFeeRate ?? 0.125;
  const netAnnualBenefit = annualIncremental * (1 - serviceFeeRate);

  const scenarios = generateAllScenarios(results);
  const recommended = scenarios.find((s) => s.model.isRecommended) || scenarios[0];

  const dist = config?.monthlyDistribution ?? [];
  const quarters = [
    { name: 'POC (Q1)', months: [0, 1, 2] },
    { name: 'Q2', months: [3, 4, 5] },
    { name: 'Q3', months: [6, 7, 8] },
    { name: 'Q4', months: [9, 10, 11] },
  ].map((q) => {
    const campaigns = q.months.reduce((s, m) => s + (dist[m] || 0), 0);
    return {
      name: q.name,
      campaigns,
      spend: campaigns * (config?.avgCampaignSpend ?? 0),
      incremental: campaigns * (config?.avgCampaignSpend ?? 0) * 0.4,
    };
  });

  const campaignExamples = [79000, 150000, 300000, 700000, 1000000].map((spend) => ({
    spend,
    ...calculateCampaignEconomics(spend),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 60],
    background: (_page: number, pageSize: { width: number; height: number }) => ({
      canvas: [{ type: 'rect', x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: BRAND.dark }],
    }),
    info: {
      title: 'AdFixus CAPI Sales Plan',
      subject: 'Publisher CAPI sales-plan simulation',
      creator: 'AdFixus',
    },
    header: () => ({
      columns: [
        { image: logoDataUrl, fit: [120, 32], margin: [40, 22, 0, 0] },
        { text: 'CAPI Sales Plan', style: 'headerTitle', alignment: 'right', margin: [0, 26, 40, 0] },
      ],
    }),
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: 'Publisher CAPI sales-plan simulation', style: 'foot', margin: [40, 0, 0, 0] },
        { text: `${currentPage} of ${pageCount}`, style: 'foot', alignment: 'right', margin: [0, 0, 40, 0] },
      ],
      margin: [0, 10],
    }),
    styles: {
      h1: { fontSize: 18, bold: true, color: BRAND.cyan, margin: [0, 0, 0, 12] },
      h2: { fontSize: 13, bold: true, color: BRAND.cyan, margin: [0, 14, 0, 6] },
      body: { fontSize: 10, color: BRAND.white, lineHeight: 1.3, margin: [0, 0, 0, 6] },
      hero: { fontSize: 30, bold: true, color: BRAND.cyan, alignment: 'center' },
      heroLabel: { fontSize: 9, color: BRAND.mutedText, alignment: 'center' },
      kpiLabel: { fontSize: 8, color: BRAND.mutedText, alignment: 'center' },
      kpiValue: { fontSize: 14, bold: true, color: BRAND.white, alignment: 'center' },
      foot: { fontSize: 8, color: BRAND.mutedText },
      tableHeader: { bold: true, fillColor: BRAND.panelAlt, color: BRAND.white, fontSize: 9 },
      tableBody: { fontSize: 9, color: BRAND.white },
      headerTitle: { fontSize: 14, bold: true, color: BRAND.cyan },
    },
    defaultStyle: { fontSize: 10, color: BRAND.white },

    content: [
      // Page 1 — Executive summary
      {
        stack: [
          { text: 'CAPI Sales Plan', style: 'h1' },
          { text: 'Net publisher benefit per year (after revenue share)', style: 'heroLabel', margin: [0, 8, 0, 2] },
          { text: fmt(netAnnualBenefit), style: 'hero', margin: [0, 0, 0, 16] },

          {
            columns: [
              kpiCard('CAPI incremental / yr', fmt(annualIncremental), BRAND.green),
              kpiCard('Match-rate uplift', capi ? `+${capi.matchRateImprovement.toFixed(0)}%` : '—', BRAND.cyan),
              kpiCard('Campaigns / yr', `${config?.yearlyCampaigns ?? 0}`, BRAND.white),
              kpiCard('Recommended ROI', `${recommended.roiMultiple.toFixed(1)}x`, BRAND.green),
            ],
            columnGap: 8,
          },

          { text: 'The opportunity', style: 'h2' },
          {
            text:
              `With a durable ID and CAPI, your match rate improves from ${capi?.details.baselineMatchRate.toFixed(0)}% to ${capi?.details.improvedMatchRate.toFixed(0)}%, ` +
              `unlocking ~${fmt(annualIncremental)} in incremental CAPI revenue per year across ${config?.yearlyCampaigns ?? 0} campaigns ` +
              `(avg spend ${fmt(config?.avgCampaignSpend ?? 0)}). The revenue-share model applies only to this net-new revenue — your base book is untouched.`,
            style: 'body',
          },

          { text: 'How to mobilise your sales team', style: 'h2' },
          {
            ul: [
              'Q1 (POC): prove the match-rate lift on 1-2 flagship advertisers.',
              'Q2: convert POC wins into repeatable outcome-based packages.',
              'Q3: scale to mid-market advertisers with a templated pitch.',
              'Q4: land enterprise campaigns where the $30K per-campaign cap delivers 13x ROI.',
            ],
            style: 'body',
          },
        ],
      },

      // Page 2 — Quarterly ramp + campaign economics
      { text: '', pageBreak: 'before' },
      {
        stack: [
          { text: 'Quarterly campaign ramp', style: 'h1' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                [
                  { text: 'Phase', style: 'tableHeader' },
                  { text: 'Campaigns', style: 'tableHeader' },
                  { text: 'Spend', style: 'tableHeader' },
                  { text: 'Incremental', style: 'tableHeader' },
                ],
                ...quarters.map((q) => [
                  { text: q.name, style: 'tableBody' },
                  { text: q.campaigns.toFixed(1), style: 'tableBody' },
                  { text: fmt(q.spend), style: 'tableBody' },
                  { text: fmt(q.incremental), style: 'tableBody', color: BRAND.green },
                ]),
              ],
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? BRAND.panel : BRAND.panelAlt),
            },
            margin: [0, 0, 0, 14],
          },

          { text: 'Per-campaign economics — the $30K cap', style: 'h2' },
          {
            table: {
              headerRows: 1,
              widths: ['20%', '20%', '20%', '20%', '20%'],
              body: [
                [
                  { text: 'Spend', style: 'tableHeader' },
                  { text: 'Incremental', style: 'tableHeader' },
                  { text: 'Fee', style: 'tableHeader' },
                  { text: 'Net', style: 'tableHeader' },
                  { text: 'ROI', style: 'tableHeader' },
                ],
                ...campaignExamples.map((c) => [
                  { text: fmt(c.spend), style: 'tableBody' },
                  { text: fmt(c.incrementalRevenue), style: 'tableBody' },
                  { text: `${fmt(c.cappedFee)}${c.isCapped ? ' (cap)' : ''}`, style: 'tableBody', color: c.isCapped ? BRAND.cyan : BRAND.white },
                  { text: fmt(c.netToPublisher), style: 'tableBody', color: BRAND.green },
                  { text: `${c.roiMultiple.toFixed(1)}x`, style: 'tableBody' },
                ]),
              ],
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? BRAND.panel : BRAND.panelAlt),
            },
            margin: [0, 0, 0, 14],
          },

          { text: 'Commercial model comparison', style: 'h2' },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', '*', '*'],
              body: [
                [
                  { text: 'Model', style: 'tableHeader' },
                  { text: 'Publisher keeps (36mo)', style: 'tableHeader' },
                  { text: '% of incremental', style: 'tableHeader' },
                  { text: 'ROI', style: 'tableHeader' },
                ],
                ...scenarios.map((s) => [
                  { text: s.model.label + (s.model.isRecommended ? ' *' : ''), style: 'tableBody', color: s.model.isRecommended ? BRAND.green : BRAND.white },
                  { text: fmt(s.publisherNetGain), style: 'tableBody' },
                  { text: `${s.netPublisherGainPercentage.toFixed(0)}%`, style: 'tableBody' },
                  { text: `${s.roiMultiple.toFixed(1)}x`, style: 'tableBody' },
                ]),
              ],
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? BRAND.panel : BRAND.panelAlt),
            },
            margin: [0, 0, 0, 14],
          },

          { text: 'Next step', style: 'h2' },
          { text: 'Book a working session with the AdFixus team to build your rollout plan.', style: 'body' },
          {
            text: 'Book a meeting',
            style: 'body',
            link: bookingUrl,
            color: BRAND.cyan,
            decoration: 'underline',
            bold: true,
          },
        ],
      },
    ],
  };

  pdfMake.createPdf(docDefinition).download('AdFixus-CAPI-Sales-Plan.pdf');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function kpiCard(label: string, value: string, color: string): any {
  return {
    width: '*',
    table: {
      widths: ['*'],
      body: [
        [{ text: label, style: 'kpiLabel' }],
        [{ text: value, style: 'kpiValue', color }],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => BRAND.border,
      vLineColor: () => BRAND.border,
    },
  };
}
