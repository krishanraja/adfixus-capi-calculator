// SignalCoverage — the interactive "how much are you actually invisible?" panel.
//
// Insight before quantification: shows what share of a publisher's conversions
// are currently invisible to advertisers (the anonymous majority + Safari/ITP),
// and lets the user drag the restored match rate (30% → 75%+) to watch the
// invisible slice become measurable and addressable. This is the evidence layer
// behind the hero — grounded in the same match-rate the plan below is built on.

import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { EyeOff, Eye, Users, Radio } from 'lucide-react';

interface SignalCoverageProps {
  /** Restored match rate, 0..1. */
  matchRate: number;
  /** Baseline match rate, 0..1. */
  baseline: number;
  onMatchRateChange: (v: number) => void;
}

const StatBlock = ({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) => (
  <div className="rounded-xl border border-border p-4 space-y-1">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
      <Icon className={`h-3.5 w-3.5 ${accent}`} /> {label}
    </div>
    <div className={`text-3xl font-bold tabular-nums ${accent}`}>{value}</div>
    <div className="text-xs text-muted-foreground">{sub}</div>
  </div>
);

export const SignalCoverage = ({ matchRate, baseline, onMatchRateChange }: SignalCoverageProps) => {
  const restoredPct = Math.round(matchRate * 100);
  const basePct = Math.round(baseline * 100);
  const invisibleNow = Math.round((1 - baseline) * 100);
  const stillInvisible = Math.round((1 - matchRate) * 100);
  const recovered = Math.round((matchRate - baseline) * 100);

  // A 100-cell grid: each cell is 1% of conversions. Colour by state.
  const cells = Array.from({ length: 100 }, (_, i) => {
    const pctPoint = i + 1;
    if (pctPoint <= basePct) return 'always'; // seen before AdFixus
    if (pctPoint <= restoredPct) return 'recovered'; // now restored by CAPI
    return 'dark'; // still invisible
  });

  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs text-primary uppercase tracking-[0.2em] font-medium">
          The signal today, and what it could be
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Most of your conversions never reach the advertiser
        </h2>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          Every square is 1% of the conversions happening on your property. The dark ones are
          invisible to your advertisers today — happening, but unattributable. Drag the restored
          match rate to watch durable identity + CAPI light them back up.
        </p>
      </div>

      <Card className="glass-card p-6 space-y-6">
        {/* 100-cell conversion grid */}
        <div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}
          >
            {cells.map((state, i) => (
              <div
                key={i}
                className="aspect-square rounded-[2px]"
                style={{
                  backgroundColor:
                    state === 'always'
                      ? 'hsl(195 95% 50%)'
                      : state === 'recovered'
                        ? 'hsl(195 95% 55% / 0.55)'
                        : 'hsl(0 0% 14%)',
                  border:
                    state === 'dark' ? '1px solid hsl(0 0% 20%)' : '1px solid transparent',
                  boxShadow:
                    state === 'always' ? '0 0 6px hsl(195 95% 50% / 0.5)' : 'none',
                  transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-[2px] bg-primary shadow-[0_0_6px_hsl(195_95%_50%/0.5)]" />
              Seen today ({basePct}%)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-[2px] bg-primary/50" />
              Restored by CAPI (+{recovered}%)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-[2px] border border-[hsl(0_0%_20%)] bg-[hsl(0_0%_14%)]" />
              Still invisible ({stillInvisible}%)
            </span>
          </div>
        </div>

        {/* The lever */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Restored match rate with AdFixus + CAPI
            </Label>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {restoredPct}%{' '}
              <span className="text-muted-foreground font-normal">from {basePct}%</span>
            </span>
          </div>
          <Slider
            value={[matchRate]}
            min={baseline}
            max={0.95}
            step={0.01}
            onValueChange={(v) => onMatchRateChange(v[0])}
          />
        </div>

        {/* Evidence blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBlock
            icon={EyeOff}
            label="Invisible today"
            value={`${invisibleNow}%`}
            sub="of conversions the advertiser can't attribute to you"
            accent="text-destructive"
          />
          <StatBlock
            icon={Eye}
            label="Made measurable"
            value={`+${recovered}%`}
            sub="anonymous conversions turned into verified, credited outcomes"
            accent="text-primary"
          />
          <StatBlock
            icon={Users}
            label="Now addressable"
            value={`${restoredPct}%`}
            sub="of your audience becomes an audience advertisers can buy"
            accent="text-success"
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/15 p-4">
          <Radio className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            The lift isn&apos;t new traffic — it&apos;s the conversions you already earn, finally
            reaching the advertiser as a clean, verified-human signal. That&apos;s the bridge doing
            its job: attribution restored, budget follows.
          </p>
        </div>
      </Card>
    </section>
  );
};
