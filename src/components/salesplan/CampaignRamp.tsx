import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CapiConfiguration } from '@/core';

interface CampaignRampProps {
  config: CapiConfiguration;
}

const QUARTERS = [
  { name: 'POC (Q1)', months: [0, 1, 2], color: 'hsl(195 95% 40%)' },
  { name: 'Q2', months: [3, 4, 5], color: 'hsl(195 95% 48%)' },
  { name: 'Q3', months: [6, 7, 8], color: 'hsl(195 95% 55%)' },
  { name: 'Q4', months: [9, 10, 11], color: 'hsl(195 95% 62%)' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-3 text-xs">
      <div className="font-medium text-foreground">{d.label}</div>
      <div className="text-muted-foreground mt-1">
        {d.campaigns.toFixed(1)} campaigns · {d.phase}
      </div>
    </div>
  );
};

export const CampaignRamp = ({ config }: CampaignRampProps) => {
  const dist = config.monthlyDistribution;

  const phaseFor = (i: number) => QUARTERS.find((q) => q.months.includes(i))?.name ?? '';
  const colorFor = (i: number) => QUARTERS.find((q) => q.months.includes(i))?.color ?? 'hsl(195 95% 50%)';

  const chartData = dist.map((campaigns, i) => ({
    label: `M${i + 1}`,
    campaigns,
    phase: phaseFor(i),
    color: colorFor(i),
  }));

  const quarterTotals = QUARTERS.map((q) => ({
    name: q.name,
    campaigns: q.months.reduce((sum, m) => sum + (dist[m] || 0), 0),
    color: q.color,
  }));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Monthly campaign ramp</span>
          <Badge variant="outline" className="text-xs">
            {config.yearlyCampaigns} campaigns / year
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          A phased rollout: prove value in a POC, then accelerate through Q2 → Q4.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(0 0% 65%)' }} stroke="hsl(0 0% 30%)" tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(0 0% 65%)' }} stroke="hsl(0 0% 30%)" tickLine={false} allowDecimals />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(0 0% 100% / 0.04)' }} />
            <Bar dataKey="campaigns" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phase</TableHead>
              <TableHead className="text-right">Campaigns to target</TableHead>
              <TableHead className="text-right">Spend (at avg)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quarterTotals.map((q) => (
              <TableRow key={q.name}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: q.color }} />
                    {q.name}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{q.campaigns.toFixed(1)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${((q.campaigns * config.avgCampaignSpend) / 1000).toFixed(0)}K
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
