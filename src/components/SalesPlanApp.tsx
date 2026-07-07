// SalesPlanApp - the Apple-grade guided-flow surface for the publisher CAPI ROI.
//
// The question it answers: if you stood up your OWN Conversions API on an AdFixus
// identity backbone, how much incremental annual ad revenue would it be worth?
//
// The visitor is a publisher revenue / sales leader who wants to sell better,
// conversion-measured campaigns to their big advertisers. So the flow speaks in
// THEIR terms and never asks for sensitive P&L revenue:
//   0. Provocation - "Walled gardens took about half of open-web ad revenue with
//      one thing you do not have: your own Conversions API."
//   1. Ask         - "Picture your biggest advertiser. What do they spend with
//      you a year?" (a concrete, non-sensitive anchor) plus a quiet "how big is
//      your book?" that scales it. Revenue is estimated, never demanded.
//   2. Reveal      - the headline incremental as the hero, a three-lever strip
//      that substantiates it, one CTA, and a quiet, supporting signal band.
//
// Everything richer - the adjustable model, the three deal models, the $30K-cap
// per-campaign economics and the three-year ramp - lives behind "Explore the full
// model" and RECONCILES to the same headline number. It is authored to fit one
// screen at a time (tabbed), so nothing scrolls and nothing is lost.

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
import { AdvertiserControl } from '@/components/flow/AdvertiserControl';
import { LeverBreakdown } from '@/components/depth/LeverBreakdown';
import { CommercialDepth } from '@/components/depth/CommercialDepth';

const BOOKING_URL =
  import.meta.env.VITE_MEETING_BOOKING_URL ||
  'https://outlook.office.com/book/SalesTeambooking@adfixus.com';

type Step = 0 | 1 | 2;

export default function SalesPlanApp() {
  const state = useCapiRoi();
  const { inputs, result, setFlagshipSpend, setBookScale } = state;
  const [step, setStep] = useState<Step>(0);

  const vertical = VERTICALS[inputs.vertical];

  // Bridge intensity is derived from the addressable share of the book - a real
  // reflection of the inputs, never a fabricated "match rate".
  const bridgeIntensity = 0.35 + result.performanceShare * 0.6;

  return (
    <TooltipProvider>
      <FlowShell stepIndex={step} stepCount={3} showProgress={step < 2} showWordmark={false}>
        {step === 0 && (
          <Provocation
            eyebrow="Your own Conversions API"
            headline={
              <>
                Walled gardens took about half of open-web ad revenue with one thing you do not have:
                your own <span className="gradient-text">Conversions API</span>.
              </>
            }
            support="Facebook and Google sell a 100%-accurate outcomes product because advertisers send conversions straight back to them. AdFixus gives you the durable, privacy-safe identity backbone to run the same server-to-server CAPI yourself, and sell those outcomes to your biggest advertisers."
            ctaLabel="See what it's worth"
            onContinue={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <AskStep
            eyebrow="Start with one advertiser"
            question={
              <>
                Picture your <span className="gradient-text">biggest advertiser</span>. What do they
                spend with you a year?
              </>
            }
            hint="A ballpark is plenty. It's their number, not yours, and it stays in your browser."
            ctaLabel="Reveal the number"
            onContinue={() => setStep(2)}
            onBack={() => setStep(0)}
          >
            <AdvertiserControl
              flagshipSpend={inputs.flagshipSpend}
              bookScale={inputs.bookScale}
              onFlagshipChange={setFlagshipSpend}
              onBookScaleChange={setBookScale}
            />
          </AskStep>
        )}

        {step === 2 && (
          <Reveal
            eyebrow="Your own CAPI · what it's worth"
            hero={
              <span className="gradient-text">
                <AnimatedNumber value={result.totalIncremental} format={formatCapiCurrency} />
              </span>
            }
            meaning={
              <>
                Extra ad revenue a year from running your own Conversions API: outcome budgets won
                back, a CPM premium on enriched inventory, and advertisers who stay because
                measurement finally works.
              </>
            }
            highlights={<LeverBreakdown result={result} variant="compact" />}
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
            exploreAction={
              <DepthDrawer label="Explore the full model" title="The full CAPI ROI model">
                <CommercialDepth state={state} bookingUrl={BOOKING_URL} />
              </DepthDrawer>
            }
            visual={
              <SignalBridge
                variant="band"
                intensity={bridgeIntensity}
                conversionNoun={vertical.conversionNoun}
              />
            }
          />
        )}
      </FlowShell>
    </TooltipProvider>
  );
}
