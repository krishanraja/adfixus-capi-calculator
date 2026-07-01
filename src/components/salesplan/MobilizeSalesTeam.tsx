import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Target, TrendingUp, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import type { UnifiedResults } from '@/core';
import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface MobilizeSalesTeamProps {
  results: UnifiedResults;
}

const QUARTERS = [
  { name: 'POC (Q1)', months: [0, 1, 2], focus: 'Prove the match-rate lift on 1-2 flagship advertisers.' },
  { name: 'Q2', months: [3, 4, 5], focus: 'Convert POC wins into repeatable outcome-based packages.' },
  { name: 'Q3', months: [6, 7, 8], focus: 'Scale to mid-market advertisers; templatise the pitch.' },
  { name: 'Q4', months: [9, 10, 11], focus: 'Land enterprise campaigns where the $30K cap shines.' },
];

export const MobilizeSalesTeam = ({ results }: MobilizeSalesTeamProps) => {
  const capi = results.capiCapabilities;
  if (!capi) return null;

  const config = capi.capiConfiguration;
  const dist = config.monthlyDistribution;
  const annualCapiUplift = capi.annualUplift;
  const matchRateLift = capi.matchRateImprovement;

  const talkingPoints = [
    `Durable identity lifts match rate from ${capi.details.baselineMatchRate.toFixed(0)}% to ${capi.details.improvedMatchRate.toFixed(0)}% — a ${matchRateLift.toFixed(0)}% improvement advertisers can measure.`,
    `CAPI drives ~${capi.details.conversionImprovement.toFixed(0)}% better conversion tracking, so advertisers see more of the outcomes they already paid for.`,
    `The $30K per-campaign cap means large advertisers keep almost all incremental revenue — a 13x ROI story for your top accounts.`,
    `Revenue share only applies to net-new CAPI revenue; your base book of business is untouched.`,
  ];

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Mobilise your sales team
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A concrete plan to turn this opportunity into booked campaigns.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Headline metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Target className="h-3.5 w-3.5" /> Campaigns / year
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">{config.yearlyCampaigns}</div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5" /> Annual CAPI uplift
            </div>
            <div className="text-2xl font-bold text-primary mt-1">
              {formatCommercialCurrency(annualCapiUplift)}
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <CheckCircle2 className="h-3.5 w-3.5" /> Match-rate lift
            </div>
            <div className="text-2xl font-bold text-success mt-1">+{matchRateLift.toFixed(0)}%</div>
          </div>
        </div>

        {/* Quarter targets */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Quarterly targets</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {QUARTERS.map((q) => {
              const campaigns = q.months.reduce((sum, m) => sum + (dist[m] || 0), 0);
              const incremental = campaigns * config.avgCampaignSpend * 0.4; // 40% conversion improvement
              return (
                <div key={q.name} className="rounded-lg border border-border p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{q.name}</span>
                    <span className="text-xs text-primary font-semibold">
                      {campaigns.toFixed(1)} campaigns
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{q.focus}</p>
                  <p className="text-xs text-success font-medium">
                    ~{formatCommercialCurrency(incremental)} incremental
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Talking points */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4 text-primary" /> Talking points for sellers
          </h4>
          <ul className="space-y-2">
            {talkingPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
