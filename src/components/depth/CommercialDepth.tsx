// CommercialDepth - the full analysis behind the reveal, demoted into the
// DepthDrawer.
//
// This is the commercial detail that RECONCILES to the headline: the same
// totalIncremental, decomposed into its three levers, priced against the three
// AdFixus deal models ($30K-cap revenue share vs annual cap vs flat fee),
// grounded in a per-campaign cap table derived from the addressable book, and
// projected over a three-year ramp. All the model's levers are adjustable here.
//
// Nothing here invents a second number; every figure traces to the same inputs
// and rates as the reveal.

import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import type { CapiRoiState } from '@/hooks/useCapiRoi';
import { formatCapiCurrency, VERTICALS } from '@/lib/capiRoi';
import { LeverSliders } from './LeverSliders';
import { LeverBreakdown } from './LeverBreakdown';
import { DealComparison } from './DealComparison';
import { CapCampaignTable } from './CapCampaignTable';
import { ThreeYearRamp } from './ThreeYearRamp';

interface CommercialDepthProps {
  state: CapiRoiState;
  bookingUrl: string;
}

const CARSALES_QUOTE =
  'Having the AdFixus ID let us build products that won back roughly $1.8M in new revenue we were not seeing before. Our largest partner grew spend from $300K to $1M in a single booking.';

export const CommercialDepth = ({ state, bookingUrl }: CommercialDepthProps) => {
  const { inputs, result, commercial, ramp, cumulativeThreeYear } = state;
  const vertical = VERTICALS[inputs.vertical];

  return (
    <div className="space-y-14">
      {/* ---- 1. The headline, restated, and its inputs ---- */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Incremental annual ad revenue from your own CAPI
          </p>
          <h2 className="mt-2 text-4xl font-bold gradient-text sm:text-5xl">
            {formatCapiCurrency(result.totalIncremental)}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            On {formatCapiCurrency(result.annualAdRevenue)} of open-web ad revenue in {vertical.label.toLowerCase()},
            with a {Math.round(result.performanceShare * 100)}% direct-sold / performance book of{' '}
            {formatCapiCurrency(result.addressable)}.
          </p>
        </div>

        <LeverBreakdown result={result} variant="full" />
      </section>

      {/* ---- 2. The levers, all adjustable ---- */}
      <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="glass-card p-5">
            <LeverSliders state={state} />
          </Card>
        </aside>

        <div className="space-y-14">
          {/* 3. The three-year ramp */}
          <ThreeYearRamp ramp={ramp} cumulative={cumulativeThreeYear} />

          {/* 4. The commercial split: what you pay AdFixus vs keep */}
          <DealComparison commercial={commercial} />

          {/* 5. The $30K per-campaign cap economics, grounded in your book */}
          <CapCampaignTable shape={commercial.shape} />

          {/* 6. Proof point */}
          <Card className="glass-card space-y-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Proof point
              </span>
            </div>
            <blockquote className="relative">
              <Quote className="absolute -left-2 -top-2 h-8 w-8 text-primary/20" />
              <p className="pl-6 text-sm leading-relaxed text-foreground md:text-base">
                {CARSALES_QUOTE}
              </p>
            </blockquote>
            <div className="border-t border-primary/10 pt-3 text-xs text-muted-foreground">
              Carsales + AdFixus: +300% addressable reach and a CAPI track worth about $60M, +22%.
            </div>
          </Card>

          {/* 7. CTA */}
          <div className="py-6 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Ready to stand up your own Conversions API with the AdFixus team?
            </p>
            <Button
              size="lg"
              onClick={() => window.open(bookingUrl, '_blank')}
              className="btn-gradient gap-2 border-0"
            >
              <Phone className="h-4 w-4" />
              Book a meeting
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
