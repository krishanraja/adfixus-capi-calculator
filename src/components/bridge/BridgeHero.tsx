// BridgeHero — the lead. Frames CAPI as the data bridge between publisher and
// advertiser and hosts the central signal-restoration visual. Consultative,
// insight-led; the provocation comes before any number.

import { SignalBridge } from './SignalBridge';

interface BridgeHeroProps {
  /** Restored match rate, 0..1 — drives the central visual live. */
  coverage: number;
  baseline: number;
}

export const BridgeHero = ({ coverage, baseline }: BridgeHeroProps) => {
  const restoredPct = Math.round(coverage * 100);
  const basePct = Math.round(baseline * 100);

  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-4 animate-fade-in">
        <p className="text-xs sm:text-sm text-primary uppercase tracking-[0.2em] font-medium">
          The publisher ↔ advertiser data bridge
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-foreground">
          Your advertisers only credit the conversions they can{' '}
          <span className="gradient-text">see</span>.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          Across the anonymous majority — Safari and ITP, logged-out visitors, an ever-larger
          slice of the open web — the conversion signal a publisher sends its advertisers is
          broken. The outcomes still happen; the advertiser just can&apos;t attribute them to you.
          So they under-credit the property and quietly pull budget.
        </p>
        <p className="text-base md:text-lg text-foreground leading-relaxed">
          A durable, verified-human identity at the edge plus CAPI restores a{' '}
          <span className="text-primary font-medium">clean, full-coverage conversion signal</span>{' '}
          across all your traffic. Advertisers see the true conversions — and budget and CPMs
          follow the evidence.
        </p>
      </div>

      {/* The central visual: the gap closing. */}
      <div className="glass-card rounded-2xl p-4 sm:p-8 border-primary/10">
        <SignalBridge coverage={coverage} baseline={baseline} />
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        Right now a typical property returns a verified signal on roughly{' '}
        <span className="text-foreground font-medium">{basePct}%</span> of conversions. AdFixus
        closes the gap to about{' '}
        <span className="text-primary font-medium">{restoredPct}%</span>. Everything below is what
        closing that gap is worth — and how to mobilise your team to sell it.
      </p>
    </section>
  );
};
