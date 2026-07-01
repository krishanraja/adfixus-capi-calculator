// SalesPlanApp — the Apple-grade guided-flow surface for the publisher CAPI ROI.
//
// The question it answers: if you stood up your OWN Conversions API on an AdFixus
// identity backbone, how much incremental annual ad revenue would it be worth?
//
// The default path is a short, guided flow with almost no input — every question
// asks one thing a publisher actually knows:
//   0. Provocation — "Walled gardens took about half of open-web ad revenue with
//      one thing you do not have: your own Conversions API."
//   1. AskStep     — annual open-web ad revenue (slider, smart default ~$20M,
//                    with a quiet traffic + CPM alternative).
//   2. AskStep     — vertical (segmented; sets framing + the addressable default).
//   3. Reveal      — the signal-bridge visual + the headline incremental, with
//                    the three-lever breakdown and a Carsales benchmark line.
//
// All the commercial detail — the adjustable levers, the three-year ramp, the
// $30K-cap per-campaign economics and the three-deal comparison (what you pay
// AdFixus vs keep NET) — lives behind the DepthDrawer ("See the full model"),
// and RECONCILES to the same headline number. Nothing invented, nothing lost.

import { useState } from 'react';
import { Phone } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SignalBridge } from '@/components/bridge/SignalBridge';
import { useCapiRoi } from '@/hooks/useCapiRoi';
import { formatCapiCurrency, VERTICALS } from '@/lib/capiRoi';
import {
  FlowShell,
  Provocation,
  AskStep,
  Reveal,
  AnimatedNumber,
  DepthDrawer,
} from '@/components/flow';
import { RevenueControl } from '@/components/flow/RevenueControl';
import { VerticalControl } from '@/components/flow/VerticalControl';
import { LeverBreakdown } from '@/components/depth/LeverBreakdown';
import { CommercialDepth } from '@/components/depth/CommercialDepth';

const BOOKING_URL =
  import.meta.env.VITE_MEETING_BOOKING_URL ||
  'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

type Step = 0 | 1 | 2 | 3;

export default function SalesPlanApp() {
  const state = useCapiRoi();
  const { inputs, result, setRevenue, setVertical } = state;
  const [step, setStep] = useState<Step>(0);

  const vertical = VERTICALS[inputs.vertical];

  // Bridge intensity is derived from the addressable share of the book — a real
  // reflection of the inputs, never a fabricated "match rate". More of the book
  // addressable → a brighter, fuller bridge.
  const bridgeIntensity = 0.35 + result.performanceShare * 0.6;

  return (
    <TooltipProvider>
      <FlowShell stepIndex={step} stepCount={4} showProgress={step < 3}>
        {step === 0 && (
          <Provocation
            eyebrow="Your own Conversions API"
            headline={
              <>
                Walled gardens took about half of open-web ad revenue with one thing you do not have:
                your own <span className="gradient-text">Conversions API</span>.
              </>
            }
            support="Facebook and Google sell a 100%-accurate outcomes product because advertisers send conversions straight back to them. AdFixus gives you the durable, privacy-safe identity backbone to run the same server-to-server CAPI yourself, and win those outcome budgets back."
            ctaLabel="See what it's worth"
            onContinue={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <AskStep
            eyebrow="One number to start"
            question={
              <>
                Roughly how much <span className="gradient-text">open-web ad revenue</span> do you
                make a year?
              </>
            }
            hint="A ballpark is plenty. Everything technical is derived from here, never asked."
            ctaLabel="Continue"
            onContinue={() => setStep(2)}
            onBack={() => setStep(0)}
          >
            <RevenueControl value={inputs.annualAdRevenue} onChange={setRevenue} />
          </AskStep>
        )}

        {step === 2 && (
          <AskStep
            eyebrow="Your vertical"
            question={
              <>
                Where do your <span className="gradient-text">humans transact</span>?
              </>
            }
            hint="This sets the conversion framing and how much of your book is outcome-addressable. You can fine-tune it later."
            ctaLabel="Reveal the number"
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          >
            <VerticalControl value={inputs.vertical} onChange={setVertical} />
          </AskStep>
        )}

        {step === 3 && (
          <Reveal
            eyebrow={`Your own CAPI · ${vertical.label.toLowerCase()}`}
            visual={
              <div className="glass-card rounded-2xl border-primary/10 p-4 sm:p-8">
                <SignalBridge
                  intensity={bridgeIntensity}
                  conversionNoun={vertical.conversionNoun}
                />
              </div>
            }
            hero={
              <span className="gradient-text">
                <AnimatedNumber value={result.totalIncremental} format={formatCapiCurrency} />
              </span>
            }
            meaning={
              <>
                Incremental annual ad revenue from standing up your own Conversions API: outcome
                budgets won back, a CPM premium on enriched inventory, and advertisers who stay
                because measurement finally works. Carsales' CAPI track: about $60M, +22%.
              </>
            }
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
              <div className="w-full space-y-6">
                <LeverBreakdown result={result} variant="compact" />
                <DepthDrawer
                  label="See the full model"
                  title="The full CAPI ROI model"
                  subtitle="The three levers, the three-year ramp, and what you pay AdFixus vs keep NET. All adjustable, all reconciling to the number above."
                >
                  <CommercialDepth state={state} bookingUrl={BOOKING_URL} />
                </DepthDrawer>
              </div>
            }
          />
        )}
      </FlowShell>
    </TooltipProvider>
  );
}
