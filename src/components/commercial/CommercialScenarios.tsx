// Commercial Model Comparison — three commercial models for CAPI revenue share.
// The 12.5% revenue share applies ONLY to CAPI incremental revenue.
import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import type { UnifiedResults } from '@/core';
import {
  generateAllScenarios,
  generateWaterfall,
  formatCommercialCurrency,
  getCapiMonthlyIncremental,
} from '@/utils/commercialCalculations';
import { RevenueIsolation } from './RevenueIsolation';
import { ScenarioCard } from './ScenarioCard';
import { CumulativeRevenueChart } from './CumulativeRevenueChart';
import { ValueWaterfall } from './ValueWaterfall';
import { IncentiveAlignmentIndicator } from './IncentiveAlignmentIndicator';

interface CommercialScenariosProps {
  results: UnifiedResults;
}

export const CommercialScenarios = ({ results }: CommercialScenariosProps) => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [showValueStory, setShowValueStory] = useState(false);

  const scenarios = useMemo(() => generateAllScenarios(results), [results]);
  const selectedScenario = scenarios[selectedScenarioIdx];
  const recommendedScenario = scenarios.find((s) => s.model.isRecommended) || scenarios[0];
  const capiMonthly = getCapiMonthlyIncremental(results);

  return (
    <div className="space-y-8">
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">What this shows:</strong> The 12.5% revenue share
              applies <em>only</em> to CAPI campaign incremental revenue (
              <strong className="text-foreground">{formatCommercialCurrency(capiMonthly)}/mo</strong> at
              steady state). Compare how three commercial models split that upside between you and your
              partner.
            </p>
          </div>
        </div>
      </Card>

      <RevenueIsolation
        baseRevenue={recommendedScenario.baseRevenue}
        incrementalRevenue={recommendedScenario.incrementalRevenue}
      />

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">
          CAPI Commercial Models
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((scenario, idx) => (
            <ScenarioCard
              key={scenario.model.type}
              scenario={scenario}
              isSelected={selectedScenarioIdx === idx}
              onSelect={() => setSelectedScenarioIdx(idx)}
            />
          ))}
        </div>
      </section>

      {!selectedScenario.model.isRecommended && (
        <IncentiveAlignmentIndicator
          alignment={selectedScenario.incentiveAlignment}
          modelType={selectedScenario.model.type}
          postCapBenefit={selectedScenario.postCapBenefit}
        />
      )}

      <Collapsible open={showValueStory} onOpenChange={setShowValueStory}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            {showValueStory ? 'Hide' : 'Show'} 36-Month Projection
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {selectedScenario.model.label}: 36-Month Cumulative Revenue
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  selectedScenario.model.isRecommended
                    ? 'bg-success/10 text-success'
                    : selectedScenario.model.type === 'flat-fee'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-warning/10 text-warning'
                }`}
              >
                {selectedScenario.model.tagline}
              </span>
            </div>
            <CumulativeRevenueChart
              data={selectedScenario.monthlyProjection}
              modelType={selectedScenario.model.type}
              showPostCapBenefit
            />
          </Card>

          <Card className="p-6 space-y-6">
            <h3 className="font-semibold text-foreground">Value Flow Comparison</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {scenarios.map((scenario) => (
                <ValueWaterfall
                  key={scenario.model.type}
                  steps={generateWaterfall(scenario)}
                  modelLabel={scenario.model.label}
                  isRecommended={scenario.model.isRecommended}
                />
              ))}
            </div>
          </Card>

          <div className="text-center py-6 border-t border-b border-border">
            <p className="text-sm font-medium text-muted-foreground italic max-w-2xl mx-auto">
              "Revenue share creates a partnership. The other models create a vendor relationship."
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
