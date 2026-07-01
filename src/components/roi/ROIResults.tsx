import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { ROICharts } from './ROICharts';
import type { ROIResults as ROIResultsType } from '@/types/roi';

interface ROIResultsProps {
  results: ROIResultsType;
  performanceCampaignPercentage: number;
  onOpenContactDialog: () => void;
}

export function ROIResults({ results, performanceCampaignPercentage, onOpenContactDialog }: ROIResultsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <TrendingUp className="h-6 w-6" />
            Your CAPI Revenue Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Incremental Annual Revenue</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(results.incrementalRevenue)}
              </p>
              <p className="text-sm font-medium text-primary">
                +{formatNumber(results.incrementalPercentage)}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Projected Total Revenue</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(results.projectedRevenue)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Performance Campaigns</p>
              <p className="text-2xl font-bold text-primary">
                {performanceCampaignPercentage}%
              </p>
              <p className="text-sm text-muted-foreground">eligible for CAPI</p>
            </div>

            <div className="p-4 rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Revenue Uplift</p>
              <p className="text-2xl font-bold text-primary">
                {formatNumber(results.incrementalPercentage)}%
              </p>
              <p className="text-sm text-muted-foreground">improvement</p>
            </div>
          </div>

          <ROICharts results={results} />

          {/* Channel Improvements */}
          <div className="pt-8">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Revenue Improvements by Channel
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-card">
                <p className="text-sm text-muted-foreground mb-1">Display</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(results.conversionImprovements.displayImprovement)}
                </p>
                <p className="text-xs text-muted-foreground">3x conversion rate</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <p className="text-sm text-muted-foreground mb-1">Web Video</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(results.conversionImprovements.videoImprovement)}
                </p>
                <p className="text-xs text-muted-foreground">+30% data quality</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Retargeting</p>
                <p className="font-semibold text-primary">
                  {formatCurrency(results.conversionImprovements.retargetingImprovement)}
                </p>
                <p className="text-xs text-muted-foreground">2x CTR improvement</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onOpenContactDialog}
            className="w-full text-primary-foreground font-semibold py-3 mt-8 bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Impact Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
