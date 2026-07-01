// 36-Month Cumulative Revenue Chart — one chart type, one per scenario.
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { MonthlyCommercialData } from '@/types/commercialModel';
import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface CumulativeRevenueChartProps {
  data: MonthlyCommercialData[];
  modelType: 'revenue-share' | 'flat-fee' | 'annual-cap';
  showPostCapBenefit?: boolean;
  compact?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-3 text-xs">
      <div className="font-medium mb-2 text-foreground">Month {label?.replace('M', '')}</div>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium text-foreground">{formatCommercialCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export const CumulativeRevenueChart = ({
  data,
  modelType,
  showPostCapBenefit = true,
  compact = false,
}: CumulativeRevenueChartProps) => {
  const chartData = data
    .filter((_, i) => (compact ? i % 3 === 0 : true))
    .map((d) => ({
      ...d,
      'Incremental Revenue': d.cumulativeIncremental,
      'Publisher Net Gain': d.cumulativePublisherGain,
      'Share of Upside': d.cumulativeAdfixusShare,
      'Post-Cap Benefit': d.cumulativePostCapBenefit,
    }));

  const height = compact ? 200 : 300;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncremental" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(195 95% 50%)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(195 95% 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPublisher" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 0% 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0 0% 55%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPostCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 71% 55%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(142 71% 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />

          <XAxis
            dataKey="monthLabel"
            tick={{ fontSize: 10, fill: 'hsl(0 0% 65%)' }}
            stroke="hsl(0 0% 30%)"
            tickLine={false}
            interval={compact ? 2 : 5}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(0 0% 65%)' }}
            stroke="hsl(0 0% 30%)"
            tickLine={false}
            tickFormatter={(value) => formatCommercialCurrency(value)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {!compact && <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(0 0% 65%)' }} />}

          <ReferenceLine x="M12" stroke="hsl(0 0% 40%)" strokeDasharray="3 3" label={{ value: 'Y1', fontSize: 10, fill: 'hsl(0 0% 65%)' }} />
          <ReferenceLine x="M24" stroke="hsl(0 0% 40%)" strokeDasharray="3 3" label={{ value: 'Y2', fontSize: 10, fill: 'hsl(0 0% 65%)' }} />

          {showPostCapBenefit && modelType === 'annual-cap' && (
            <Area
              type="monotone"
              dataKey="Post-Cap Benefit"
              stroke="hsl(142 71% 55%)"
              fill="url(#colorPostCap)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}

          <Area type="monotone" dataKey="Incremental Revenue" stroke="hsl(195 95% 50%)" fill="url(#colorIncremental)" strokeWidth={2} />
          <Area type="monotone" dataKey="Publisher Net Gain" stroke="hsl(142 71% 45%)" fill="url(#colorPublisher)" strokeWidth={2} />
          <Area type="monotone" dataKey="Share of Upside" stroke="hsl(0 0% 55%)" fill="url(#colorFees)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
