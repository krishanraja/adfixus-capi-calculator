// DealComparison - the same headline, priced three ways.
//
// Takes the commercial pricing (the headline totalIncremental priced against the
// three AdFixus deal models) and shows, for each, what the publisher pays AdFixus
// vs keeps NET. The recommended revenue-share (capped) model is highlighted.
// Every "incremental" here is the same number as the reveal.

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
    <div className="space-y-3">
      <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">
        The same <span className="font-semibold text-primary">{formatCapiCurrency(incremental)}</span>{' '}
        of incremental revenue, priced three ways. The capped revenue-share keeps the most in your
        pocket while keeping AdFixus invested in your growth.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {deals.map((deal) => (
          <Card
            key={deal.type}
            className={`glass-card flex flex-col p-4 ${
              deal.isRecommended ? 'border-primary/50 ring-1 ring-primary/25' : ''
            }`}
          >
            {/* Header: title on its own line, badge pinned top-right (no collision). */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-base font-semibold text-foreground">{deal.label}</span>
              {deal.isRecommended && (
                <Badge className="flex-shrink-0 gap-1 whitespace-nowrap bg-primary text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Recommended
                </Badge>
              )}
            </div>
            <p className="mt-1 min-h-[2rem] text-xs leading-snug text-muted-foreground">
              {deal.tagline}
            </p>

            <div className="mt-3">
              <div className="text-xs text-muted-foreground">You keep (net / yr)</div>
              <div className="text-2xl font-bold tabular-nums text-success">
                {formatCapiCurrency(deal.publisherNet)}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(deal.netShare * 100)}% of the incremental
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between border-t border-border/60 pt-2.5">
              <span className="text-xs text-muted-foreground">You pay AdFixus / yr</span>
              <span className="text-base font-semibold tabular-nums text-foreground">
                {formatCapiCurrency(deal.adfixusFee)}
              </span>
            </div>

            <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
              <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              <span className="text-pretty">{deal.basis}</span>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
