// SalesPlanApp — the Apple-grade guided-flow surface for the CAPI data bridge.
//
// The default path is three screens and almost no input:
//   1. Provocation — "Your advertisers only credit the conversions they can see."
//   2. AskStep     — ONE control: the restored match rate (30% → 75%+), smart
//                    default already set.
//   3. Reveal      — the SignalBridge visual (the conversion signal restored) +
//                    a single number for what closing the bridge is worth, and
//                    one calm CTA.
//
// ALL the existing depth — the bridge narrative, the interactive signal-coverage
// grid, the full configurable inputs, the sales plan, campaign ramp, $30K-cap
// per-campaign economics and the deal-model comparison — is unchanged and lives
// behind the DepthDrawer ("See the full plan"). Nothing lost, just demoted.

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SignalBridge } from '@/components/bridge/SignalBridge';
import { FullPlan } from '@/components/salesplan/FullPlan';
import { useSalesPlan, BASELINE_MATCH_RATE } from '@/hooks/useSalesPlan';
import {
  formatCommercialCurrency,
  getCapiMonthlyIncremental,
} from '@/utils/commercialCalculations';
import {
  FlowShell,
  Provocation,
  AskStep,
  Reveal,
  AnimatedNumber,
  DepthDrawer,
} from '@/components/flow';
import { MatchRateControl } from '@/components/flow/MatchRateControl';

const BOOKING_URL =
  import.meta.env.VITE_MEETING_BOOKING_URL ||
  'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

type Step = 0 | 1 | 2;

export default function SalesPlanApp() {
  const { inputs, update, plan } = useSalesPlan();
  const { results } = plan;
  const [step, setStep] = useState<Step>(0);

  // The single "what closing the bridge is worth" number — net annual publisher
  // benefit after revenue share, identical to the PlanSummary hero.
  const annualCapiIncremental = getCapiMonthlyIncremental(results) * 12;
  const netAnnualBenefit =
    annualCapiIncremental * (1 - (results.pricing.capiServiceFeeRate ?? 0.125));

  return (
    <TooltipProvider>
      <FlowShell stepIndex={step} stepCount={3} showProgress={step < 2}>
        {step === 0 && (
          <Provocation
            eyebrow="The publisher ↔ advertiser data bridge"
            headline={
              <>
                Your advertisers only credit the conversions they can{' '}
                <span className="gradient-text">see</span>.
              </>
            }
            support="Across the anonymous majority — Safari and ITP, logged-out visitors, an ever-larger slice of the open web — the conversion signal you send is broken. The outcomes still happen; advertisers just can't attribute them to you, so they quietly pull budget."
            ctaLabel="Show me the gap"
            onContinue={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <AskStep
            eyebrow="One question"
            question={
              <>
                How much of your conversion signal could a durable ID{' '}
                <span className="gradient-text">restore</span>?
              </>
            }
            hint="A durable, verified-human identity at the edge plus CAPI typically lifts match rate from ~30% toward 75%+. This is the only lever we need to show you what it's worth."
            ctaLabel="See what it's worth"
            onContinue={() => setStep(2)}
            onBack={() => setStep(0)}
          >
            <MatchRateControl
              value={inputs.matchRateImproved}
              baseline={BASELINE_MATCH_RATE}
              onChange={(v) => update('matchRateImproved', v)}
            />
          </AskStep>
        )}

        {step === 2 && (
          <Reveal
            eyebrow="The bridge, closed"
            visual={
              <div className="glass-card rounded-2xl border-primary/10 p-4 sm:p-8">
                <SignalBridge
                  coverage={inputs.matchRateImproved}
                  baseline={BASELINE_MATCH_RATE}
                />
              </div>
            }
            hero={
              <span className="gradient-text">
                <AnimatedNumber value={netAnnualBenefit} format={formatCommercialCurrency} />
              </span>
            }
            meaning="Net incremental publisher revenue a year — the conversions you already earn, finally reaching your advertisers as a clean, verified-human signal. Attribution restored, budget follows."
            cta={
              <button
                type="button"
                onClick={() => window.open(BOOKING_URL, '_blank')}
                className="btn-gradient inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
              >
                <Phone className="h-4 w-4" />
                Book a meeting
              </button>
            }
            secondary={
              <DepthDrawer
                label="See the full plan"
                title="The full CAPI data-bridge plan"
                subtitle="Signal coverage, the sales plan, campaign economics and deal models — all configurable."
              >
                <FullPlan
                  inputs={inputs}
                  update={update}
                  results={results}
                  bookingUrl={BOOKING_URL}
                />
              </DepthDrawer>
            }
          />
        )}
      </FlowShell>
    </TooltipProvider>
  );
}
