// FullPlan — the complete, dense CAPI data-bridge analysis.
//
// This is the EXISTING depth, unchanged: the bridge narrative, the interactive
// signal-coverage grid, the full configurable inputs, the sales plan, campaign
// ramp, per-campaign ($30K-cap) economics, and the deal-model comparison. In
// the Apple-grade surface it is demoted behind the DepthDrawer ("See the full
// plan") — hidden by default, nothing lost.

import { useState } from 'react';
import { Download, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BridgeHero } from '@/components/bridge/BridgeHero';
import { SignalCoverage } from '@/components/bridge/SignalCoverage';
import { InputsPanel } from '@/components/salesplan/InputsPanel';
import { PlanSummary } from '@/components/salesplan/PlanSummary';
import { CampaignRamp } from '@/components/salesplan/CampaignRamp';
import { MobilizeSalesTeam } from '@/components/salesplan/MobilizeSalesTeam';
import { CampaignEconomicsTable } from '@/components/commercial/CampaignEconomicsTable';
import { CommercialScenarios } from '@/components/commercial/CommercialScenarios';
import { ProofPointCard } from '@/components/commercial/ProofPointCard';
import { BASELINE_MATCH_RATE, type SalesPlanInputs } from '@/hooks/useSalesPlan';
import type { UnifiedResults } from '@/core';
import { buildSalesPlanPdf } from '@/utils/pdfGenerator';

interface FullPlanProps {
  inputs: SalesPlanInputs;
  update: <K extends keyof SalesPlanInputs>(key: K, value: SalesPlanInputs[K]) => void;
  results: UnifiedResults;
  bookingUrl: string;
}

export const FullPlan = ({ inputs, update, results, bookingUrl }: FullPlanProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const capiConfig = results.capiCapabilities?.capiConfiguration;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await buildSalesPlanPdf(inputs, results);
      toast({ title: 'Plan downloaded', description: 'Your CAPI data-bridge plan is ready.' });
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Could not generate the PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* ---- 1. The bridge idea + the signal being restored ---- */}
      <BridgeHero coverage={inputs.matchRateImproved} baseline={BASELINE_MATCH_RATE} />

      {/* ---- 2. How much of your signal is invisible today ---- */}
      <SignalCoverage
        matchRate={inputs.matchRateImproved}
        baseline={BASELINE_MATCH_RATE}
        onMatchRateChange={(v) => update('matchRateImproved', v)}
      />

      {/* ---- 3. The sales plan / economics / deal models ---- */}
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Inputs — sticky on desktop */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Model your property</h2>
            <p className="text-sm text-muted-foreground">
              Your inputs shape both the signal above and the plan below.
            </p>
          </div>
          <InputsPanel inputs={inputs} update={update} />
        </aside>

        {/* Results / the sales plan */}
        <div className="stagger-fade space-y-10">
          <PlanSummary results={results} />

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="btn-gradient gap-2 border-0"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating…' : 'Download the plan (PDF)'}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(bookingUrl, '_blank')}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Book a meeting
            </Button>
          </div>

          {capiConfig && <CampaignRamp config={capiConfig} />}

          <MobilizeSalesTeam results={results} />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Per-campaign economics</h2>
            <CampaignEconomicsTable avgCampaignSpend={inputs.avgCampaignSpend} />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Commercial model comparison</h2>
            <CommercialScenarios results={results} />
          </section>

          <ProofPointCard />

          <div className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Ready to close the bridge with the AdFixus team?
            </p>
            <Button
              size="lg"
              onClick={() => window.open(bookingUrl, '_blank')}
              className="btn-gradient gap-2 border-0"
            >
              <Phone className="h-4 w-4" />
              Book a meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
