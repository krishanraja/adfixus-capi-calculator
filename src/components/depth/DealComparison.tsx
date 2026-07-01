// DealComparison — the same headline, priced three ways.
//
// Takes the commercial pricing (which is the headline totalIncremental priced
// against the three AdFixus deal models) and shows, for each, what the publisher
// pays AdFixus vs keeps NET. The recommended revenue-share (capped) model is
// highlighted. Every "incremental" here is the same number as the reveal.

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
import type { CapiCommercialResult } from '@/lib/capiCommercial';
import { formatCapiCurrency } from '@/lib/capiRoi';

interface DealComparisonProps {
  commercial: CapiCommercialResult;
}

export const DealComparison = ({ commercial }: DealComparisonProps) => {
  const { incremental, deals } = commercial;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          What you pay AdFixus, what you keep
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The same <span className="text-primary">{formatCapiCurrency(incremental)}</span> of
          incremental revenue, priced three ways. The revenue-share model with the $30K
          per-campaign cap keeps the most in your pocket while keeping AdFixus invested in your
          growth.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {deals.map((deal) => (
          <Card
            key={deal.type}
            className={`glass-card p-5 ${
              deal.isRecommended ? 'border-primary/40 ring-1 ring-primary/20' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{deal.label}</span>
              {deal.isRecommended && (
                <Badge className="gap-1 bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Recommended
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{deal.tagline}</p>

            <div className="mt-5 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">You keep (net / yr)</div>
                <div className="text-2xl font-bold text-success">
                  {formatCapiCurrency(deal.publisherNet)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(deal.netShare * 100)}% of the incremental
                </div>
              </div>
              <div className="border-t border-border/60 pt-3">
                <div className="text-xs text-muted-foreground">You pay AdFixus / yr</div>
                <div className="text-lg font-semibold text-foreground">
                  {formatCapiCurrency(deal.adfixusFee)}
                </div>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              {deal.basis}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
