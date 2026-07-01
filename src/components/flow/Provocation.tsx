// Provocation — step 1 of the guided flow.
//
// ONE bold editorial line (44–72px) that reframes identity for the AI era, a
// quiet supporting sentence, and a single primary button. Nothing else on
// screen. Shared shape across all three AdFixus tools; only the words differ.

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FLOW_SPRING } from './FlowShell';

interface ProvocationProps {
  /** A short kicker above the headline (uppercase, tracked). */
  eyebrow?: string;
  /** The bold editorial headline. Pass a string or rich nodes for accents. */
  headline: ReactNode;
  /** One quiet supporting sentence. */
  support: ReactNode;
  /** Primary button label. */
  ctaLabel: string;
  onContinue: () => void;
}

export const Provocation = ({
  eyebrow,
  headline,
  support,
  ctaLabel,
  onContinue,
}: ProvocationProps) => {
  const reduce = useReducedMotion();

  const stagger = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { ...FLOW_SPRING, delay },
        };

  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <motion.p
          {...stagger(0.05)}
          className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-primary sm:text-sm"
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.h1
        {...stagger(0.12)}
        className="text-balance text-[2.75rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[4.25rem]"
      >
        {headline}
      </motion.h1>

      <motion.p
        {...stagger(0.22)}
        className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {support}
      </motion.p>

      <motion.div {...stagger(0.32)} className="mt-11">
        <button
          type="button"
          onClick={onContinue}
          className="btn-gradient group inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </div>
  );
};
