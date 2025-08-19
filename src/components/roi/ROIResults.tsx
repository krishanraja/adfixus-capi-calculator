import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { ROICharts } from './ROICharts';
import type { ROIResults as ROIResultsType } from '@/types/roi';

interface ROIResultsProps {
  results: ROIResultsType;
  performanceCampaignPercentage: number;
  onGeneratePDF: () => void;
}

export function ROIResults({ results, performanceCampaignPercentage, onGeneratePDF }: ROIResultsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-brand-primary">
            <TrendingUp className="h-6 w-6" />
            Your CAPI Revenue Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-brand-surface">
              <p className="text-sm text-gray-600">Incremental Annual Revenue</p>
              <p className="text-2xl font-bold text-brand-primary">
                {formatCurrency(results.incrementalRevenue)}
              </p>
              <p className="text-sm font-medium text-brand-secondary">
                +{formatNumber(results.incrementalPercentage)}%
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-brand-surface">
              <p className="text-sm text-gray-600">Projected Total Revenue</p>
              <p className="text-2xl font-bold text-brand-primary">
                {formatCurrency(results.projectedRevenue)}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-brand-surface">
              <p className="text-sm text-gray-600">Performance Campaigns</p>
              <p className="text-2xl font-bold text-brand-primary">
                {performanceCampaignPercentage}%
              </p>
              <p className="text-sm text-gray-500">eligible for CAPI</p>
            </div>
            
            <div className="p-4 rounded-lg bg-brand-surface">
              <p className="text-sm text-gray-600">Revenue Uplift</p>
              <p className="text-2xl font-bold text-brand-secondary">
                {formatNumber(results.incrementalPercentage)}%
              </p>
              <p className="text-sm text-gray-500">improvement</p>
            </div>
          </div>

          <ROICharts results={results} />

          {/* Channel Improvements */}
          <div className="pt-8">
            <h3 className="text-lg font-semibold mb-4 text-brand-primary">
              Revenue Improvements by Channel
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-brand-surface">
                <p className="text-sm text-gray-600 mb-1">Display</p>
                <p className="font-semibold text-brand-secondary">
                  {formatCurrency(results.conversionImprovements.displayImprovement)}
                </p>
                <p className="text-xs text-gray-500">3x conversion rate</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-brand-surface-red">
                <p className="text-sm text-gray-600 mb-1">Web Video</p>
                <p className="font-semibold text-brand-accent">
                  {formatCurrency(results.conversionImprovements.videoImprovement)}
                </p>
                <p className="text-xs text-gray-500">+30% data quality</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-brand-surface-purple">
                <p className="text-sm text-gray-600 mb-1">Retargeting</p>
                <p className="font-semibold text-brand-purple">
                  {formatCurrency(results.conversionImprovements.retargetingImprovement)}
                </p>
                <p className="text-xs text-gray-500">2x CTR improvement</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onGeneratePDF}
            className="w-full text-white font-semibold py-3 mt-8 bg-brand-accent hover:bg-brand-accent/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Impact Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}