// CapCampaignTable - the $30K-per-campaign cap economics, grounded in the
// publisher's own book.
//
// The hero row is the publisher's actual biggest advertiser (the flagship spend
// they entered), and their typical campaign is derived from the addressable book,
// so the table reconciles to the same inputs as the headline. The remaining rows
// are illustrative sizes that show how the $30K cap makes large campaigns hugely
// publisher-favourable - the Carsales $1M-campaign proof point.
//
// Laid out on a fixed CSS grid (not an auto table) so every column aligns
// exactly: labels left, money right and tabular, ROI badges in one tidy column.

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import {
  calculateCampaignEconomics,
  formatCampaignCurrency,
  formatROI,
} from '@/utils/campaignEconomicsCalculator';
import { CAPI_ECONOMICS_CONSTANTS } from '@/types/campaignEconomics';
import type { DerivedCampaignShape } from '@/lib/capiRoi';

interface CapCampaignTableProps {
  shape: DerivedCampaignShape;
  /** The publisher's actual biggest advertiser spend (the guided-flow anchor). */
  flagshipSpend: number;
}

interface Row {
  label: string;
  spend: number;
  /** Whether this row is one of the publisher's own (vs an illustrative size). */
  own?: boolean;
}

const ILLUSTRATIVE: Row[] = [
  { label: 'Small campaign', spend: 79_000 },
  { label: 'Mid-market campaign', spend: 150_000 },
  { label: 'Large campaign', spend: 300_000 },
  { label: 'Enterprise campaign', spend: 700_000 },
];

const GRID =
  'grid grid-cols-[minmax(150px,2fr)_repeat(4,minmax(0,1fr))_56px] items-center gap-x-2';

export const CapCampaignTable = ({ shape, flagshipSpend }: CapCampaignTableProps) => {
  const rows = useMemo<Array<Row & { economics: ReturnType<typeof calculateCampaignEconomics> }>>(() => {
    const own: Row[] = [{ label: 'Your top advertiser', spend: flagshipSpend, own: true }];
    if (shape.avgCampaignSpend > 0 && Math.abs(shape.avgCampaignSpend - flagshipSpend) > 20_000) {
      own.push({ label: 'Your typical campaign', spend: shape.avgCampaignSpend, own: true });
    }
    // Keep illustrative sizes that are meaningfully different from the flagship.
    const extras = ILLUSTRATIVE.filter((c) => Math.abs(c.spend - flagshipSpend) > 40_000);
    return [...own, ...extras].map((c) => ({ ...c, economics: calculateCampaignEconomics(c.spend) }));
  }, [shape.avgCampaignSpend, flagshipSpend]);

  const capThreshold = CAPI_ECONOMICS_CONSTANTS.CAP_THRESHOLD;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/30 p-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Per-campaign economics</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            How the $30K per-campaign cap makes large advertisers yours to keep. Book: about{' '}
            {shape.campaignCount} campaigns at {formatCampaignCurrency(shape.avgCampaignSpend)} average.
          </p>
        </div>
        <Badge variant="outline" className="flex-shrink-0 whitespace-nowrap text-xs">
          Cap: $30K / campaign
        </Badge>
      </div>

      <div className="p-2">
        {/* Header */}
        <div className={`${GRID} px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground`}>
          <span>Campaign</span>
          <span className="text-right">Spend</span>
          <span className="text-right">Incremental</span>
          <span className="text-right">Fee</span>
          <span className="text-right">Net to you</span>
          <span className="text-right">ROI</span>
        </div>

        {/* Rows */}
        <div className="space-y-0.5">
          {rows.map((c, i) => {
            const { economics } = c;
            const capped = economics.isCapped;
            return (
              <div
                key={i}
                className={`${GRID} rounded-lg px-2 py-2.5 text-sm ${
                  c.own ? 'bg-primary/[0.07]' : ''
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                  <span className="truncate">{c.label}</span>
                  {capped && <Sparkles className="h-3 w-3 flex-shrink-0 text-primary" />}
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {formatCampaignCurrency(c.spend)}
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {formatCampaignCurrency(economics.incrementalRevenue)}
                </span>
                <span className={`text-right tabular-nums ${capped ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                  {formatCampaignCurrency(economics.cappedFee)}
                  {capped && <span className="ml-1 text-[10px] text-primary/70">cap</span>}
                </span>
                <span className="text-right font-semibold tabular-nums text-success">
                  {formatCampaignCurrency(economics.netToPublisher)}
                </span>
                <span className="flex justify-end">
                  <Badge
                    variant={capped ? 'default' : 'secondary'}
                    className={`min-w-[46px] justify-center tabular-nums ${
                      capped ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    {formatROI(economics.roiMultiple)}
                  </Badge>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2.5 border-t border-primary/20 bg-primary/10 p-4">
        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-primary">The magic of the cap.</span> Above{' '}
          {formatCampaignCurrency(capThreshold)} of spend the fee stays fixed at $30K while incremental
          revenue keeps growing. On a $1M campaign you keep{' '}
          <span className="font-semibold text-success">$370K net</span> for a $30K fee, a{' '}
          <span className="font-semibold text-success">13.3x ROI</span> on your largest advertisers.
        </p>
      </div>
    </Card>
  );
};
