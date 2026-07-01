import { Card } from '@/components/ui/card';
import { TrendingUp, Target, Percent, DollarSign } from 'lucide-react';
import type { UnifiedResults } from '@/core';
import { formatCommercialCurrency, getCapiMonthlyIncremental } from '@/utils/commercialCalculations';

interface PlanSummaryProps {
  results: UnifiedResults;
}

export const PlanSummary = ({ results }: PlanSummaryProps) => {
  const capi = results.capiCapabilities;
  const capiMonthlyIncremental = getCapiMonthlyIncremental(results);
  const annualCapiIncremental = capiMonthlyIncremental * 12;

  // Net publisher benefit = incremental minus the service fee share (12.5%).
  const netAnnualBenefit = annualCapiIncremental * (1 - (results.pricing.capiServiceFeeRate ?? 0.125));
  const roiMultiple =
    capi && capi.campaignServiceFees > 0
      ? capi.conversionTrackingRevenue / capi.campaignServiceFees
      : 0;

  const kpis = [
    {
      icon: DollarSign,
      label: 'Net publisher benefit / yr',
      value: formatCommercialCurrency(netAnnualBenefit),
      accent: 'text-primary',
    },
    {
      icon: TrendingUp,
      label: 'CAPI incremental / yr',
      value: formatCommercialCurrency(annualCapiIncremental),
      accent: 'text-success',
    },
    {
      icon: Percent,
      label: 'Match-rate uplift',
      value: capi ? `+${capi.matchRateImprovement.toFixed(0)}%` : '—',
      accent: 'text-foreground',
    },
    {
      icon: Target,
      label: 'ROI multiple',
      value: roiMultiple > 0 ? `${roiMultiple.toFixed(1)}x` : '—',
      accent: 'text-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3 animate-fade-in">
        <p className="text-sm text-muted-foreground uppercase tracking-widest">
          What closing the bridge is worth
        </p>
        <h2 className="text-5xl md:text-7xl font-bold gradient-text">
          {formatCommercialCurrency(netAnnualBenefit)}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Net incremental publisher revenue per year once the restored conversion signal reaches
          your advertisers — after revenue share.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glass-card p-4 text-center scanner-card">
            <kpi.icon className={`h-5 w-5 mx-auto mb-2 ${kpi.accent}`} />
            <div className={`text-2xl font-bold ${kpi.accent}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{kpi.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
