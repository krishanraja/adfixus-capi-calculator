// AdvertiserControl - the guided-flow anchor for a publisher sales leader.
//
// Instead of asking a revenue leader to type their P&L into an unknown iframe,
// we anchor on the one number they always know and are happy to ballpark: what
// their single biggest advertiser spends with them a year. That is concrete,
// non-sensitive (it is the advertiser's number, not the publisher's), and it is
// exactly the relationship they would sell a conversion-measured campaign into.
//
// A quiet "how big is your book?" segmented control scales that anchor to an
// estimated book. We never ask for revenue; we estimate it and let the publisher
// refine it later. A privacy line makes explicit that nothing is stored.

import { Lock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  BOOK_SCALES,
  deriveRevenueFromBook,
  formatCapiCurrency,
  type BookScale,
} from '@/lib/capiRoi';

interface AdvertiserControlProps {
  flagshipSpend: number;
  bookScale: BookScale;
  onFlagshipChange: (v: number) => void;
  onBookScaleChange: (v: BookScale) => void;
}

const SCALE_ORDER: BookScale[] = ['handful', 'dozens', 'hundreds'];

export const AdvertiserControl = ({
  flagshipSpend,
  bookScale,
  onFlagshipChange,
  onBookScaleChange,
}: AdvertiserControlProps) => {
  const estimatedBook = deriveRevenueFromBook(flagshipSpend, bookScale);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* The live figure - the focal point of the screen. */}
      <div className="flex items-end justify-center">
        <span className="text-5xl font-bold tabular-nums text-foreground sm:text-6xl">
          {formatCapiCurrency(flagshipSpend)}
        </span>
        <span className="mb-1 ml-1 text-lg text-muted-foreground sm:mb-1.5 sm:text-xl">/yr</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        your biggest advertiser&rsquo;s annual spend with you
      </p>

      <div className="mt-7 px-1">
        <Slider
          value={[flagshipSpend]}
          min={100_000}
          max={3_000_000}
          step={50_000}
          onValueChange={(v) => onFlagshipChange(v[0])}
          aria-label="Your biggest advertiser's annual spend"
          className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
        />
        <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
          <span>$100K</span>
          <span>$3M+</span>
        </div>
      </div>

      {/* Book scale - scales the anchor to an estimated book without ever asking
          for a P&L revenue figure. */}
      <div className="mt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Advertisers like that, across your book
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {SCALE_ORDER.map((id) => {
            const s = BOOK_SCALES[id];
            const active = bookScale === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onBookScaleChange(id)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-3 text-center transition-all ${
                  active
                    ? 'border-primary/60 bg-primary/10 shadow-[0_0_18px_hsl(195_95%_50%/0.14)]'
                    : 'border-border bg-card/40 hover:border-primary/30'
                }`}
              >
                <div
                  className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}
                >
                  {s.label}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {s.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estimate + privacy reassurance. */}
      <p className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3 flex-shrink-0 text-primary/70" />
        <span>
          We&rsquo;ll estimate your book at{' '}
          <span className="font-semibold text-foreground">
            ~{formatCapiCurrency(estimatedBook)}
          </span>
          . Nothing you enter is stored; it stays in your browser.
        </span>
      </p>
    </div>
  );
};
