// LeverSliders - the model's assumptions, exposed for the curious.
//
// Every rate that drives the headline is a slider here: the three lever rates
// (win-back, CPM uplift, enriched share, retention) plus the performance share.
// Adjusting any of them recomputes the headline and everything downstream - the
// drawer and the reveal always reconcile because they read the same state.

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import type { CapiRoiState } from '@/hooks/useCapiRoi';

interface LeverSlidersProps {
  state: CapiRoiState;
}

interface RowProps {
  label: string;
  tooltip: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

const Row = ({ label, tooltip, value, min, max, step, display, onChange }: RowProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground/60" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </Label>
      <span className="text-sm font-semibold tabular-nums text-primary">{display}</span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
  </div>
);

export const LeverSliders = ({ state }: LeverSlidersProps) => {
  const { inputs, assumptions, setPerformanceShare, setAssumption } = state;
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">The levers behind the number</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every assumption is here and adjustable. Move any of them and the headline updates.
        </p>
      </div>

      <Row
        label="Direct-sold / performance share"
        tooltip="The share of your ad sales that is direct-sold or performance-based. This is the CAPI-addressable book. Defaulted by vertical."
        value={inputs.performanceShare}
        min={0.1}
        max={0.9}
        step={0.01}
        display={pct(inputs.performanceShare)}
        onChange={setPerformanceShare}
      />

      <Row
        label="Lever A · Win-back rate"
        tooltip="Share of the addressable book recovered and grown by running your own CAPI to win outcome budgets back from the walled gardens. Carsales' CAPI track was +22%."
        value={assumptions.winBackRate}
        min={0.05}
        max={0.4}
        step={0.01}
        display={pct(assumptions.winBackRate)}
        onChange={(v) => setAssumption('winBackRate', v)}
      />

      <Row
        label="Lever B · Enriched inventory share"
        tooltip="Share of total ad revenue delivered on CAPI-enriched / lookalike inventory that can carry a CPM premium."
        value={assumptions.enrichedShare}
        min={0.1}
        max={0.7}
        step={0.01}
        display={pct(assumptions.enrichedShare)}
        onChange={(v) => setAssumption('enrichedShare', v)}
      />

      <Row
        label="Lever B · CPM uplift"
        tooltip="Price premium on that enriched inventory. The deck cites +15% CPM on CAPI-enriched / lookalike inventory."
        value={assumptions.cpmUplift}
        min={0.05}
        max={0.3}
        step={0.01}
        display={pct(assumptions.cpmUplift)}
        onChange={(v) => setAssumption('cpmUplift', v)}
      />

      <Row
        label="Lever C · Retention value"
        tooltip="Repeat and renewed spend from advertisers who stay because measurement finally works. Derived from the deck's +40% campaign retention."
        value={assumptions.retentionValue}
        min={0.02}
        max={0.2}
        step={0.01}
        display={pct(assumptions.retentionValue)}
        onChange={(v) => setAssumption('retentionValue', v)}
      />
    </div>
  );
};
