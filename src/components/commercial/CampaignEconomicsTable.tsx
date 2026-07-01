// Campaign Economics Table — per-campaign ROI with the $30K cap visualisation.
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

interface CampaignEconomicsTableProps {
  avgCampaignSpend?: number;
}

// Example campaign sizes to demonstrate the cap benefit.
const EXAMPLE_CAMPAIGNS = [
  { label: 'Small Campaign', spend: 79000 },
  { label: 'Medium Campaign', spend: 150000 },
  { label: 'Large Campaign', spend: 300000 },
  { label: 'Enterprise Campaign', spend: 700000 },
  { label: 'Top Advertiser (CarSales example)', spend: 1000000 },
];

export const CampaignEconomicsTable = ({ avgCampaignSpend }: CampaignEconomicsTableProps) => {
  const campaignData = useMemo(() => {
    const rows = [...EXAMPLE_CAMPAIGNS];
    // Inject the publisher's own average campaign as a row so it feels personalised.
    if (avgCampaignSpend && avgCampaignSpend > 0) {
      rows.unshift({ label: 'Your Avg Campaign', spend: Math.round(avgCampaignSpend) });
    }
    return rows.map((campaign) => ({
      ...campaign,
      economics: calculateCampaignEconomics(campaign.spend),
    }));
  }, [avgCampaignSpend]);

  const capThreshold = CAPI_ECONOMICS_CONSTANTS.CAP_THRESHOLD;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Per-Campaign Economics</h3>
            <p className="text-xs text-muted-foreground">
              How the $30K campaign cap creates exponential ROI at scale
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Cap: $30K/campaign
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-[200px]">Campaign Size</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Incremental (40%)</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Net to Publisher</TableHead>
              <TableHead className="text-right">ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignData.map((campaign, index) => {
              const { economics } = campaign;
              const isAboveCap = economics.isCapped;
              return (
                <TableRow key={index} className={isAboveCap ? 'bg-primary/5' : ''}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {campaign.label}
                      {isAboveCap && <Sparkles className="h-3 w-3 text-primary" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(campaign.spend)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCampaignCurrency(economics.incrementalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    <span className={isAboveCap ? 'text-primary font-medium' : ''}>
                      {formatCampaignCurrency(economics.cappedFee)}
                      {isAboveCap && <span className="text-xs ml-1">(CAP)</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold text-success">
                    {formatCampaignCurrency(economics.netToPublisher)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={isAboveCap ? 'default' : 'secondary'}
                      className={isAboveCap ? 'bg-primary text-primary-foreground' : ''}
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

      <div className="p-4 bg-primary/10 border-t border-primary/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary">The Magic of the Cap</p>
            <p className="text-xs text-muted-foreground mt-1">
              For campaigns above {formatCampaignCurrency(capThreshold)}, the fee stays fixed at $30K
              while incremental revenue keeps growing. At a $1M campaign, the publisher keeps{' '}
              <strong className="text-success">$370K net</strong> with only a $30K fee — a{' '}
              <strong className="text-success">13.3x ROI</strong>.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
