// Revenue Isolation Visual — makes it clear the share only touches incremental revenue.
import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface RevenueIsolationProps {
  baseRevenue: number;
  incrementalRevenue: number;
}

export const RevenueIsolation = ({ baseRevenue, incrementalRevenue }: RevenueIsolationProps) => {
  const total = baseRevenue + incrementalRevenue;
  const basePercent = total > 0 ? (baseRevenue / total) * 100 : 0;
  const incrementalPercent = total > 0 ? (incrementalRevenue / total) * 100 : 0;

  return (
    <div className="glass-card border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Revenue Isolation
        </h3>
        <span className="text-xs text-muted-foreground">36-month projection</span>
      </div>

      <div className="relative h-16 rounded-lg overflow-hidden flex">
        <div
          className="h-full bg-muted flex items-center justify-center transition-all duration-500"
          style={{ width: `${basePercent}%` }}
        >
          {basePercent > 25 && (
            <span className="text-xs font-medium text-muted-foreground">
              {formatCommercialCurrency(baseRevenue)}
            </span>
          )}
        </div>
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center transition-all duration-500"
          style={{ width: `${incrementalPercent}%` }}
        >
          {incrementalPercent > 15 && (
            <span className="text-xs font-bold text-primary-foreground">
              {formatCommercialCurrency(incrementalRevenue)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-muted-foreground">
            Base Revenue <span className="font-medium">(Untouched)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-primary to-primary-glow" />
          <span className="text-foreground font-medium">
            CAPI Incremental <span className="text-primary">(Net-new)</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground border-t border-border pt-3 mt-2">
        The revenue-share model applies <span className="font-semibold text-foreground">ONLY</span> to
        incremental CAPI revenue. Base revenue remains untouched.
      </p>
    </div>
  );
};
