import { useState } from 'react';
import { Download, Phone, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { BridgeHero } from '@/components/bridge/BridgeHero';
import { SignalCoverage } from '@/components/bridge/SignalCoverage';
import { InputsPanel } from '@/components/salesplan/InputsPanel';
import { PlanSummary } from '@/components/salesplan/PlanSummary';
import { CampaignRamp } from '@/components/salesplan/CampaignRamp';
import { MobilizeSalesTeam } from '@/components/salesplan/MobilizeSalesTeam';
import { CampaignEconomicsTable } from '@/components/commercial/CampaignEconomicsTable';
import { CommercialScenarios } from '@/components/commercial/CommercialScenarios';
import { ProofPointCard } from '@/components/commercial/ProofPointCard';
import { useSalesPlan, BASELINE_MATCH_RATE } from '@/hooks/useSalesPlan';
import { buildSalesPlanPdf } from '@/utils/pdfGenerator';

const BOOKING_URL =
  import.meta.env.VITE_MEETING_BOOKING_URL ||
  'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

export default function SalesPlanApp() {
  const { inputs, update, reset, plan } = useSalesPlan();
  const { results } = plan;
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
    <TooltipProvider>
      <div className="min-h-dvh-safe hero-gradient">
        <Navigation onReset={reset} />

        <main className="container mx-auto px-4 py-10 space-y-16">
          {/* ---- 1. LEAD: the bridge idea + the signal being restored ---- */}
          <BridgeHero coverage={inputs.matchRateImproved} baseline={BASELINE_MATCH_RATE} />

          {/* ---- 2. INTERACTIVE: how much of your signal is invisible today ---- */}
          <SignalCoverage
            matchRate={inputs.matchRateImproved}
            baseline={BASELINE_MATCH_RATE}
            onMatchRateChange={(v) => update('matchRateImproved', v)}
          />

          {/* ---- Transition to the payoff ---- */}
          <div className="flex flex-col items-center text-center gap-3 pt-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
              <ArrowDown className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium">
              What closing the bridge is worth
            </p>
            <p className="text-sm text-muted-foreground max-w-xl">
              Now put numbers to it. Model your property below and see the revenue the restored
              signal unlocks — and a concrete plan to mobilise your team to sell it.
            </p>
          </div>

          {/* ---- 3. PAYOFF: the sales plan / economics / deal models ---- */}
          <div className="grid lg:grid-cols-[380px_1fr] gap-8">
            {/* Inputs — sticky on desktop */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Model your property</h2>
                <p className="text-sm text-muted-foreground">
                  Your inputs shape both the signal above and the plan below.
                </p>
              </div>
              <InputsPanel inputs={inputs} update={update} />
            </aside>

            {/* Results / the sales plan */}
            <div className="space-y-10 stagger-fade">
              <PlanSummary results={results} />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={handleDownload} disabled={isGenerating} className="btn-gradient border-0 gap-2">
                  <Download className="h-4 w-4" />
                  {isGenerating ? 'Generating…' : 'Download the plan (PDF)'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(BOOKING_URL, '_blank')}
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

              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to close the bridge with the AdFixus team?
                </p>
                <Button
                  size="lg"
                  onClick={() => window.open(BOOKING_URL, '_blank')}
                  className="btn-gradient border-0 gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Book a meeting
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
