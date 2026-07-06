// LeverBreakdown - the three-lever decomposition of the headline.
//
// Shows how totalIncremental splits into Win-back (A), Higher CPM (B) and
// Retention (C), each with its dollar value, share of the total, and its
// derivation. Used under the reveal and inside the drawer. Reconciles exactly:
// the three values sum to totalIncremental.

import type { CapiRoiResult } from '@/lib/capiRoi';
import { formatCapiCurrency } from '@/lib/capiRoi';

interface LeverBreakdownProps {
  result: CapiRoiResult;
  /** Compact = the three-line strip under the reveal; full = the drawer card. */
  variant?: 'compact' | 'full';
}

export const LeverBreakdown = ({ result, variant = 'full' }: LeverBreakdownProps) => {
  const { levers, totalIncremental } = result;
  const ordered = [levers.winBack, levers.cpm, levers.retention];
  const share = (v: number) => (totalIncremental > 0 ? Math.round((v / totalIncremental) * 100) : 0);

  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {ordered.map((lever) => (
          <div
            key={lever.key}
            className="rounded-xl border border-border/70 bg-card/40 px-3 py-3 text-center sm:px-4"
          >
            <div className="text-xl font-semibold tabular-nums text-primary sm:text-2xl">
              {formatCapiCurrency(lever.value)}
            </div>
            <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">
              {lever.shortLabel}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">The three levers, in full</h3>
      <div className="space-y-3">
        {ordered.map((lever, i) => (
          <div
            key={lever.key}
            className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-card/40 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium text-foreground">{lever.label}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{lever.basis}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-lg font-semibold text-primary">
                {formatCapiCurrency(lever.value)}
              </div>
              <div className="text-xs text-muted-foreground">{share(lever.value)}% of total</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
        <span className="text-sm font-medium text-foreground">Total incremental / yr</span>
        <span className="text-lg font-bold text-primary">
          {formatCapiCurrency(totalIncremental)}
        </span>
      </div>
    </div>
  );
};
