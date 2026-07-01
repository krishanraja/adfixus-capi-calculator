// CapCampaignTable — the $30K-per-campaign cap economics, grounded in the
// publisher's own book.
//
// The avg campaign spend and campaign count are DERIVED from the addressable
// book (deriveCampaignShape), so the "Your avg campaign" row reconciles to the
// same inputs as the headline. The rest are illustrative sizes that show how the
// $30K cap makes large campaigns hugely publisher-favourable — the Carsales
// $1M-campaign proof point.

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
}

const EXAMPLE_CAMPAIGNS = [
  { label: 'Small campaign', spend: 79_000 },
  { label: 'Medium campaign', spend: 150_000 },
  { label: 'Large campaign', spend: 300_000 },
  { label: 'Enterprise campaign', spend: 700_000 },
  { label: 'Top advertiser (Carsales example)', spend: 1_000_000 },
];

export const CapCampaignTable = ({ shape }: CapCampaignTableProps) => {
  const rows = useMemo(() => {
    const base = [...EXAMPLE_CAMPAIGNS];
    if (shape.avgCampaignSpend > 0) {
      base.unshift({ label: 'Your avg campaign (derived)', spend: shape.avgCampaignSpend });
    }
    return base.map((c) => ({ ...c, economics: calculateCampaignEconomics(c.spend) }));
  }, [shape.avgCampaignSpend]);

  const capThreshold = CAPI_ECONOMICS_CONSTANTS.CAP_THRESHOLD;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Per-campaign economics</h3>
            <p className="text-xs text-muted-foreground">
              How the $30K per-campaign cap makes large campaigns yours to keep. Your book is about{' '}
              {shape.campaignCount} campaigns at{' '}
              {formatCampaignCurrency(shape.avgCampaignSpend)} average.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Cap: $30K / campaign
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-[220px]">Campaign size</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Incremental (40%)</TableHead>
              <TableHead className="text-right">AdFixus fee</TableHead>
              <TableHead className="text-right">Net to you</TableHead>
              <TableHead className="text-right">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, i) => {
              const { economics } = c;
              const capped = economics.isCapped;
              return (
                <TableRow key={i} className={capped ? 'bg-primary/5' : ''}>
                  <TableCell className="text-sm font-medium">
                    <span className="flex items-center gap-2">
                      {c.label}
                      {capped && <Sparkles className="h-3 w-3 text-primary" />}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(c.spend)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(economics.incrementalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span className={capped ? 'font-medium text-primary' : ''}>
                      {formatCampaignCurrency(economics.cappedFee)}
                      {capped && <span className="ml-1 text-xs">(cap)</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-success">
                    {formatCampaignCurrency(economics.netToPublisher)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={capped ? 'default' : 'secondary'}
                      className={capped ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {formatROI(economics.roiMultiple)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="border-t border-primary/20 bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">The magic of the cap.</span> Above{' '}
            {formatCampaignCurrency(capThreshold)} of spend the fee stays fixed at $30K while
            incremental revenue keeps growing. On a $1M campaign you keep{' '}
            <strong className="text-success">$370K net</strong> for a $30K fee, a{' '}
            <strong className="text-success">13.3x ROI</strong> on your largest advertisers.
          </p>
        </div>
      </div>
    </Card>
  );
};
