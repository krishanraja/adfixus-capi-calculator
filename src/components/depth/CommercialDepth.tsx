// CommercialDepth - the full analysis behind the reveal, demoted into the
// DepthDrawer and organised so it fits ONE screen at a time (no long scroll).
//
// A persistent recap strip (the headline number + the inputs it rests on + one
// CTA) sits above three tabs:
//   1. Breakdown        - the three levers, decomposed, with every assumption adjustable.
//   2. You pay vs keep  - the same number priced three ways, plus the three-year ramp.
//   3. Per campaign     - the $30K per-campaign cap economics, grounded in the book.
//
// Everything still RECONCILES to the same totalIncremental; nothing invents a
// second number. Tabs keep each view calm and legible instead of overwhelming.

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Phone, Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { CapiRoiState } from '@/hooks/useCapiRoi';
import { useFitScale } from '@/hooks/useFitScale';
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

type TabId = 'breakdown' | 'keep' | 'campaign';

const TABS: { id: TabId; label: string }[] = [
  { id: 'breakdown', label: 'Breakdown' },
  { id: 'keep', label: 'You pay vs keep' },
  { id: 'campaign', label: 'Per campaign' },
];

export const CommercialDepth = ({ state, bookingUrl }: CommercialDepthProps) => {
  const { inputs, result, commercial, ramp, cumulativeThreeYear } = state;
  const vertical = VERTICALS[inputs.vertical];
  const [tab, setTab] = useState<TabId>('breakdown');
  const reduce = useReducedMotion();
  // Scale the active tab down to fit the panel so it never scrolls, at any height.
  const { frameRef, contentRef, scale } = useFitScale(true, tab);

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.22 },
      };

  return (
    <div className="flex h-full flex-col">
      {/* ---- Persistent recap: the number, its inputs, and one CTA ---- */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border/60 pb-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Incremental annual ad revenue
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold gradient-text sm:text-4xl">
              {formatCapiCurrency(result.totalIncremental)}
            </span>
            <span className="text-xs text-muted-foreground">
              on a ~{formatCapiCurrency(result.annualAdRevenue)} book ·{' '}
              {Math.round(result.performanceShare * 100)}% performance ·{' '}
              {formatCapiCurrency(result.addressable)} addressable
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open(bookingUrl, '_blank')}
          className="btn-gradient inline-flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          <Phone className="h-4 w-4" />
          Book a meeting
        </button>
      </div>

      {/* ---- Tab bar ---- */}
      <div className="mt-4 flex flex-shrink-0 items-center gap-1.5">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="depth-tab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---- Tab content (scaled to fit the panel; never scrolls) ---- */}
      <div ref={frameRef} className="relative mt-5 flex-1 overflow-hidden">
        <div
          className="w-full"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <div ref={contentRef} className="w-full">
            <AnimatePresence mode="wait">
              <motion.div key={tab} {...fade}>
                {tab === 'breakdown' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <LeverBreakdown result={result} variant="full" />
                <Card className="glass-card h-fit p-5">
                  <LeverSliders state={state} />
                </Card>
              </div>
            )}

            {tab === 'keep' && (
              <div className="space-y-6">
                <DealComparison commercial={commercial} />
                <ThreeYearRamp ramp={ramp} cumulative={cumulativeThreeYear} compact />
              </div>
            )}

            {tab === 'campaign' && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <CapCampaignTable shape={commercial.shape} flagshipSpend={inputs.flagshipSpend} />
                <Card className="glass-card flex h-fit flex-col gap-3 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/10 p-5">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Proof point
                    </span>
                  </div>
                  <blockquote className="relative">
                    <Quote className="absolute -left-1 -top-1 h-6 w-6 text-primary/20" />
                    <p className="pl-5 text-sm leading-relaxed text-foreground">{CARSALES_QUOTE}</p>
                  </blockquote>
                  <p className="mt-auto border-t border-primary/10 pt-3 text-xs text-muted-foreground">
                    Carsales + AdFixus: +300% addressable reach, a CAPI track worth about $60M, +22%.
                  </p>
                </Card>
              </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reconciliation footnote - quiet, always true. */}
      <p className="mt-4 flex-shrink-0 text-center text-[11px] text-muted-foreground">
        Every figure reconciles to the same {formatCapiCurrency(result.totalIncremental)} on{' '}
        {vertical.label.toLowerCase()}. Move any assumption and the headline updates.
      </p>
    </div>
  );
};
