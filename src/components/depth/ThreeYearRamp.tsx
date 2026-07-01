// ThreeYearRamp - how the headline compounds as CAPI adoption ramps.
//
// Year 1 is partial as the first advertisers come online; Year 2 near-full;
// Year 3 compounds as more of the book moves to outcome-based buying. Each bar
// is the headline totalIncremental × the ramp factor, so it reconciles to the
// reveal.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import type { RampPoint } from '@/lib/capiRoi';
import { formatCapiCurrency } from '@/lib/capiRoi';

interface ThreeYearRampProps {
  ramp: RampPoint[];
  cumulative: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RampTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background/95 p-3 text-xs shadow-lg backdrop-blur">
      <div className="font-medium text-foreground">Year {d.year}</div>
      <div className="mt-1 text-muted-foreground">
        {formatCapiCurrency(d.incremental)} incremental · {Math.round(d.factor * 100)}% of run-rate
      </div>
    </div>
  );
};

const SHADES = ['hsl(195 95% 42%)', 'hsl(195 95% 52%)', 'hsl(195 95% 62%)'];

export const ThreeYearRamp = ({ ramp, cumulative }: ThreeYearRampProps) => {
  const data = ramp.map((p) => ({ ...p, label: `Year ${p.year}` }));

  return (
    <Card className="glass-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Three-year ramp</h3>
          <p className="text-sm text-muted-foreground">
            As adoption ramps, the incremental compounds.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{formatCapiCurrency(cumulative)}</div>
          <div className="text-xs text-muted-foreground">cumulative over 3 years</div>
        </div>
      </div>

      <div className="mt-6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'hsl(0 0% 65%)' }}
              stroke="hsl(0 0% 30%)"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(0 0% 65%)' }}
              stroke="hsl(0 0% 30%)"
              tickLine={false}
              tickFormatter={(v) => formatCapiCurrency(v)}
            />
            <Tooltip content={<RampTooltip />} cursor={{ fill: 'hsl(0 0% 100% / 0.04)' }} />
            <Bar dataKey="incremental" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={SHADES[i] ?? SHADES[SHADES.length - 1]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
