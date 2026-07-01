// Scenario Card — one card per commercial model scenario.
import { Check, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScenarioComparison } from '@/types/commercialModel';
import { formatCommercialCurrency, generateWaterfall } from '@/utils/commercialCalculations';
import { CompactWaterfall } from './ValueWaterfall';

interface ScenarioCardProps {
  scenario: ScenarioComparison;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ScenarioCard = ({ scenario, isSelected, onSelect }: ScenarioCardProps) => {
  const { model, incentiveAlignment } = scenario;
  const waterfall = generateWaterfall(scenario);

  const getBorderClass = () => {
    if (model.isRecommended) return 'border-success/50 bg-success/5';
    if (model.type === 'flat-fee') return 'border-muted-foreground/30 bg-muted/20';
    return 'border-warning/30 bg-warning/5';
  };

  const getIcon = () => {
    if (model.isRecommended) return <Check className="h-4 w-4 text-success" />;
    if (model.type === 'flat-fee') return <Users className="h-4 w-4 text-muted-foreground" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  return (
    <Card
      className={`p-5 space-y-4 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 ${getBorderClass()} ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-semibold">{model.label}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
        </div>
        {model.isRecommended && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-success text-success-foreground shrink-0">
            Recommended
          </span>
        )}
      </div>

      <div
        className={`text-xs font-medium ${
          model.isRecommended
            ? 'text-success'
            : model.type === 'flat-fee'
              ? 'text-muted-foreground'
              : 'text-warning'
        }`}
      >
        {model.tagline}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Publisher Keeps
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatCommercialCurrency(scenario.publisherNetGain)}
          </div>
          <div className={`text-xs ${model.isRecommended ? 'text-success' : 'text-muted-foreground'}`}>
            {scenario.netPublisherGainPercentage.toFixed(0)}% of incremental
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">ROI Multiple</div>
          <div className="text-lg font-bold text-foreground">{scenario.roiMultiple.toFixed(1)}x</div>
          <div className="text-xs text-muted-foreground">over 36 months</div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Partner Alignment
          </span>
          <span
            className={`text-xs font-semibold ${
              incentiveAlignment.alignmentScore >= 80
                ? 'text-success'
                : incentiveAlignment.alignmentScore >= 50
                  ? 'text-warning'
                  : 'text-muted-foreground'
            }`}
          >
            {incentiveAlignment.alignmentScore}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              incentiveAlignment.alignmentScore >= 80
                ? 'bg-success'
                : incentiveAlignment.alignmentScore >= 50
                  ? 'bg-warning'
                  : 'bg-muted-foreground'
            }`}
            style={{ width: `${incentiveAlignment.alignmentScore}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {incentiveAlignment.partnershipLevel}
        </p>
      </div>

      {model.type === 'annual-cap' && scenario.postCapBenefit > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-success">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wide font-medium">Post-Cap Benefit</span>
          </div>
          <div className="text-sm font-bold text-success mt-1">
            {formatCommercialCurrency(scenario.postCapBenefit)}
          </div>
          <div className="text-[10px] text-muted-foreground">100% to publisher after cap</div>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <CompactWaterfall steps={waterfall} modelLabel="Value Flow" isRecommended={model.isRecommended} />
      </div>
    </Card>
  );
};
