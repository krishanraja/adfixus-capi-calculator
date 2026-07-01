// RevenueControl - the single tactile control for the CAPI revenue AskStep.
//
// One big, calm slider for annual open-web ad revenue, with a quiet "traffic +
// CPM" alternative that DERIVES revenue for publishers who think in impressions.
// Big numbers, generous space, one focal point. Smart default already set so the
// user can just hit Continue.

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCapiCurrency } from '@/lib/capiRoi';

interface RevenueControlProps {
  /** Annual open-web ad revenue, $. */
  value: number;
  onChange: (v: number) => void;
}

type Mode = 'revenue' | 'traffic';

// Derive annual revenue from monthly pageviews + a blended CPM.
// revenue = pageviews/mo × 12 × adsPerPage × CPM / 1000.
const ADS_PER_PAGE = 2;
function trafficToRevenue(monthlyPageviews: number, cpm: number): number {
  return (monthlyPageviews * 12 * ADS_PER_PAGE * cpm) / 1000;
}

export const RevenueControl = ({ value, onChange }: RevenueControlProps) => {
  const [mode, setMode] = useState<Mode>('revenue');
  const [monthlyPageviews, setMonthlyPageviews] = useState(30_000_000);
  const [cpm, setCpm] = useState(6);

  const applyTraffic = (pv: number, c: number) => {
    setMonthlyPageviews(pv);
    setCpm(c);
    onChange(Math.round(trafficToRevenue(pv, c)));
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* The live figure - the focal point of the screen. */}
      <div className="flex items-end justify-center">
        <span className="text-6xl font-bold tabular-nums text-foreground sm:text-7xl">
          {formatCapiCurrency(value)}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        annual open-web ad revenue
      </p>

      {/* Mode toggle - revenue directly, or derive it from traffic. */}
      <div className="mt-8 inline-flex rounded-full border border-border p-1 text-xs">
        <button
          type="button"
          onClick={() => setMode('revenue')}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === 'revenue'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Revenue
        </button>
        <button
          type="button"
          onClick={() => setMode('traffic')}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            mode === 'traffic'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Traffic + CPM
        </button>
      </div>

      {mode === 'revenue' ? (
        <div className="mt-8 px-1">
          <Slider
            value={[value]}
            min={2_000_000}
            max={200_000_000}
            step={1_000_000}
            onValueChange={(v) => onChange(v[0])}
            aria-label="Annual open-web ad revenue"
            className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
          />
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>$2M</span>
            <span>$200M</span>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6 px-1 text-left">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly pageviews</span>
              <span className="font-semibold text-primary tabular-nums">
                {(monthlyPageviews / 1_000_000).toFixed(0)}M
              </span>
            </div>
            <Slider
              value={[monthlyPageviews]}
              min={2_000_000}
              max={500_000_000}
              step={2_000_000}
              onValueChange={(v) => applyTraffic(v[0], cpm)}
              aria-label="Monthly pageviews"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blended CPM</span>
              <span className="font-semibold text-primary tabular-nums">${cpm.toFixed(2)}</span>
            </div>
            <Slider
              value={[cpm]}
              min={1}
              max={25}
              step={0.5}
              onValueChange={(v) => applyTraffic(monthlyPageviews, v[0])}
              aria-label="Blended CPM"
            />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Derived from your traffic. You can switch back to enter revenue directly.
          </p>
        </div>
      )}
    </div>
  );
};
