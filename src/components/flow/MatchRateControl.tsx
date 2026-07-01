// MatchRateControl — the single tactile control for the CAPI AskStep.
//
// One big, calm slider that moves the restored match rate from the baseline
// (~30%) up to 75%+ — the one lever that decides how much of the conversion
// signal reaches the advertiser. Bound to the same engine input the full plan
// uses, so nothing is duplicated. Big numbers, generous space, one focal point.

import { Slider } from '@/components/ui/slider';

interface MatchRateControlProps {
  /** Restored match rate, 0..1. */
  value: number;
  /** Baseline match rate, 0..1 (the share visible before AdFixus). */
  baseline: number;
  onChange: (v: number) => void;
}

export const MatchRateControl = ({ value, baseline, onChange }: MatchRateControlProps) => {
  const restoredPct = Math.round(value * 100);
  const basePct = Math.round(baseline * 100);
  const recovered = Math.round((value - baseline) * 100);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* The live figure — the focal point of the screen. */}
      <div className="flex items-end justify-center gap-3">
        <span className="text-7xl font-bold tabular-nums text-foreground sm:text-8xl">
          {restoredPct}
          <span className="text-4xl align-top text-primary sm:text-5xl">%</span>
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        restored from a typical <span className="text-foreground">{basePct}%</span> baseline
        <span className="mx-2 text-border">·</span>
        <span className="font-medium text-primary">+{recovered}%</span> of conversions made visible
      </p>

      <div className="mt-10 px-1">
        <Slider
          value={[value]}
          min={baseline}
          max={0.95}
          step={0.01}
          onValueChange={(v) => onChange(v[0])}
          aria-label="Restored match rate"
          className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
        />
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>{basePct}% — anonymous majority dark</span>
          <span>95% — near-full coverage</span>
        </div>
      </div>
    </div>
  );
};
