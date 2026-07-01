import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { formatYAxisCurrency } from '@/utils/formatting';
import type { ROIResults, ChartData } from '@/types/roi';

interface ROIChartsProps {
  results: ROIResults;
}

export function ROICharts({ results }: ROIChartsProps) {
  const revenueChartData: ChartData[] = [
    { 
      name: 'Current', 
      value: results.currentRevenue, 
      fill: 'hsl(var(--muted-foreground))' 
    },
    { 
      name: 'With CAPI', 
      value: results.projectedRevenue, 
      fill: 'hsl(var(--primary))'
    },
  ];

  return (
    <div className="h-64 mb-16">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        Revenue Comparison
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatYAxisCurrency} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}