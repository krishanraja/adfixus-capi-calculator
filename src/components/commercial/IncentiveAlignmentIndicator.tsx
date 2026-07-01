// Incentive Alignment Indicator — partnership level, not "value leakage".
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { IncentiveAlignment, CommercialModelType } from '@/types/commercialModel';

interface IncentiveAlignmentIndicatorProps {
  alignment: IncentiveAlignment;
  modelType: CommercialModelType;
  postCapBenefit?: number;
}

export const IncentiveAlignmentIndicator = ({
  alignment,
  modelType,
  postCapBenefit = 0,
}: IncentiveAlignmentIndicatorProps) => {
  const scheme = (() => {
    switch (alignment.partnershipLevel) {
      case 'Full Partnership':
        return { border: 'border-success/40', text: 'text-success', bar: 'bg-success', Icon: CheckCircle2, bg: 'bg-success/5' };
      case 'Limited Partnership':
        return { border: 'border-warning/40', text: 'text-warning', bar: 'bg-warning', Icon: AlertTriangle, bg: 'bg-warning/5' };
      default:
        return { border: 'border-muted-foreground/40', text: 'text-muted-foreground', bar: 'bg-muted-foreground', Icon: Users, bg: 'bg-muted/20' };
    }
  })();

  const { Icon } = scheme;

  return (
    <div className={`rounded-xl border-2 ${scheme.border} ${scheme.bg} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${scheme.text}`} />
          <span className={`text-sm font-semibold ${scheme.text}`}>{alignment.partnershipLevel}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Alignment:</span>
          <span className={`text-lg font-bold ${scheme.text}`}>{alignment.alignmentScore}%</span>
        </div>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div className={`h-full transition-all duration-500 ${scheme.bar}`} style={{ width: `${alignment.alignmentScore}%` }} />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{alignment.description}</p>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Partner investment level:</span>
          <span className={`font-semibold ${scheme.text}`}>{alignment.investmentLevel}</span>
        </div>
      </div>

      {modelType === 'annual-cap' && postCapBenefit > 0 && (
        <div className="mt-3 p-3 bg-success/10 rounded-lg">
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">After cap: 100% of incremental goes to publisher</span>
          </div>
          <p className="text-xs text-success/80 mt-1">
            Post-cap benefit: ${(postCapBenefit / 1000).toFixed(0)}K over 36 months
          </p>
        </div>
      )}
    </div>
  );
};
