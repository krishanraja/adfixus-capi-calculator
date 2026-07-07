// LeverSliders - "Refine your estimate": the explore-panel controls, written for
// the actual visitor (a publisher revenue leader / C-suite), not for the model.
//
// The earlier version exposed the raw model parameters ("Lever B · Enriched
// inventory share", "Lever C · Retention value"). Those are meaningless to a
// revenue leader and invited the fair question "what am I even sliding?". This
// panel instead offers only things a publisher understands:
//   - What you'd sell campaigns on (the vertical / outcome).
//   - Your annual ad revenue (the estimate, adjustable - never demanded).
//   - How much you sell directly (the direct-sold share CAPI can lift).
//   - How bold the estimate is (one Cautious/Balanced/Bold dial that scales all
//     three upside levers together - see ESTIMATE_STANCES).
// Every control carries always-visible helper text, so nothing depends on a hover
// tooltip. Adjusting any of them recomputes the headline; the reveal and the
// breakdown reconcile because they read the same hook state.

import { Slider } from '@/components/ui/slider';
import { Lock } from 'lucide-react';
import type { CapiRoiState } from '@/hooks/useCapiRoi';
import {
  VERTICALS,
  ESTIMATE_STANCES,
  formatCapiCurrency,
  type Vertical,
  type EstimateStance,
} from '@/lib/capiRoi';

interface LeverSlidersProps {
  state: CapiRoiState;
}

const OUTCOME_ORDER: Vertical[] = ['auto', 'education', 'retail', 'finance', 'travel', 'other'];
const STANCE_ORDER: EstimateStance[] = ['cautious', 'balanced', 'bold'];

/** A labelled slider with a live value and always-visible helper line. */
const SliderField = ({
  label,
  help,
  value,
  min,
  max,
  step,
  display,
  onChange,
  ariaLabel,
}: {
  label: string;
  help: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  ariaLabel: string;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-primary">{display}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
      aria-label={ariaLabel}
    />
    <p className="text-[11px] leading-snug text-muted-foreground">{help}</p>
  </div>
);

export const LeverSliders = ({ state }: LeverSlidersProps) => {
  const { inputs, stance, setVertical, setRevenue, setPerformanceShare, setStance } = state;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Refine your estimate</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Everything here is something you already know. Move any of it and the headline updates.
        </p>
      </div>

      {/* What you'd sell campaigns on. */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">What you&rsquo;d sell campaigns on</span>
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
        <p className="text-[11px] leading-snug text-muted-foreground">
          Sets the conversion your advertisers care about (e.g. {VERTICALS[inputs.vertical].conversionNoun}).
        </p>
      </div>

      {/* Your annual ad revenue - the estimate, adjustable. */}
      <SliderField
        label="Your annual ad revenue"
        help="We estimated this from your biggest advertiser and book size. Slide it if you know the real figure - it stays in your browser."
        value={inputs.annualAdRevenue}
        min={1_000_000}
        max={200_000_000}
        step={1_000_000}
        display={formatCapiCurrency(inputs.annualAdRevenue)}
        onChange={setRevenue}
        ariaLabel="Your annual ad revenue"
      />

      {/* How much you sell directly - the addressable book. */}
      <SliderField
        label="How much you sell directly"
        help="Share of your ad sales you sell direct or on performance (vs open programmatic). That direct book is what your own CAPI lifts."
        value={inputs.performanceShare}
        min={0.1}
        max={0.9}
        step={0.01}
        display={`${Math.round(inputs.performanceShare * 100)}%`}
        onChange={setPerformanceShare}
        ariaLabel="Share of ad sales sold directly"
      />

      {/* How bold - the single upside dial that replaces the raw lever rates. */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">How bold is this estimate?</span>
        <div className="grid grid-cols-3 gap-1.5">
          {STANCE_ORDER.map((id) => {
            const s = ESTIMATE_STANCES[id];
            const active = stance === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStance(id)}
                aria-pressed={active}
                className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                  active
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border bg-card/40 hover:border-primary/30'
                }`}
              >
                <span
                  className={`block text-xs font-semibold ${active ? 'text-primary' : 'text-foreground'}`}
                >
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">
                  {s.sublabel}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Scales how much upside we assume - budgets won back, the CPM premium, and repeat spend -
          without you touching a single rate.
        </p>
      </div>

      <p className="flex items-center gap-1.5 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3 flex-shrink-0 text-primary/70" />
        Everything is computed in your browser. Nothing is stored or sent.
      </p>
    </div>
  );
};
