// LeverSliders - the model's inputs and assumptions, exposed for the curious.
//
// This is where the guided flow's smart estimates become fully adjustable:
//   - Outcome you'd sell (vertical) - sets the conversion framing + the default
//     addressable share. This is the refinement of the thing we did NOT force as
//     a guided-flow step.
//   - Your book (revenue) - the estimate derived from the advertiser anchor,
//     here overridable directly. Nothing is stored; it stays in the browser.
//   - Direct-sold / performance share, and the three lever rates.
//
// Adjusting any of them recomputes the headline and everything downstream - the
// drawer and the reveal always reconcile because they read the same state.

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Lock } from 'lucide-react';
import type { CapiRoiState } from '@/hooks/useCapiRoi';
import { VERTICALS, formatCapiCurrency, type Vertical } from '@/lib/capiRoi';

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
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3 w-3 cursor-help text-muted-foreground/60" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </Label>
      <span className="text-xs font-semibold tabular-nums text-primary">{display}</span>
    </div>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} />
  </div>
);

const OUTCOME_ORDER: Vertical[] = ['auto', 'education', 'retail', 'finance', 'travel', 'other'];

export const LeverSliders = ({ state }: LeverSlidersProps) => {
  const { inputs, assumptions, setVertical, setRevenue, setPerformanceShare, setAssumption } = state;
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Adjust the model</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Every input is here. Move any of them and the headline updates.
        </p>
      </div>

      {/* Outcome you'd sell - the refined "vertical". */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Outcome you&rsquo;d sell</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {OUTCOME_ORDER.map((id) => {
            const active = inputs.vertical === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setVertical(id)}
                aria-pressed={active}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border bg-card/40 text-muted-foreground hover:border-primary/30'
                }`}
              >
                {VERTICALS[id].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your book - the estimated revenue, overridable. */}
      <Row
        label="Your book (est. ad revenue)"
        tooltip="Estimated from your biggest advertiser and book size. Override it here if you know it. Nothing you enter is stored; it stays in your browser."
        value={inputs.annualAdRevenue}
        min={1_000_000}
        max={200_000_000}
        step={1_000_000}
        display={formatCapiCurrency(inputs.annualAdRevenue)}
        onChange={setRevenue}
      />

      <Row
        label="Direct-sold / performance share"
        tooltip="The share of your ad sales that is direct-sold or performance-based. This is the CAPI-addressable book. Defaulted by the outcome you'd sell."
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

      <p className="flex items-center gap-1.5 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3 flex-shrink-0 text-primary/70" />
        Everything is computed in your browser. Nothing is stored or sent.
      </p>
    </div>
  );
};
