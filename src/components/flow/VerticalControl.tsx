// VerticalControl — a single segmented choice for the publisher's vertical.
//
// Picking a vertical sets the conversion framing and the default performance
// share (the CAPI-addressable portion of ad sales). One tactile control, big
// touch targets, generous space.

import { VERTICALS, type Vertical } from '@/lib/capiRoi';

interface VerticalControlProps {
  value: Vertical;
  onChange: (v: Vertical) => void;
}

const ORDER: Vertical[] = ['auto', 'education', 'retail', 'finance', 'travel', 'other'];

export const VerticalControl = ({ value, onChange }: VerticalControlProps) => {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ORDER.map((id) => {
          const v = VERTICALS[id];
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`rounded-xl border px-4 py-5 text-left transition-all ${
                active
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_20px_hsl(195_95%_50%/0.15)]'
                  : 'border-border bg-card/40 hover:border-primary/30'
              }`}
              aria-pressed={active}
            >
              <div
                className={`text-base font-semibold ${
                  active ? 'text-primary' : 'text-foreground'
                }`}
              >
                {v.label}
              </div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">
                {v.conversionNoun}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
