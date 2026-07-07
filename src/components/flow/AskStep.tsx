// AskStep - one question per screen.
//
// A large, tactile control (a single slider, a segmented choice, or one input)
// with a smart default, so the user can just hit Continue. Big touch targets,
// generous space, one focal point. The control itself is passed in as children
// so each tool can reuse its existing engine-bound inputs unchanged.

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FLOW_SPRING } from './FlowShell';

interface AskStepProps {
  eyebrow?: string;
  /** The single question, as an editorial line (not a tiny form label). */
  question: ReactNode;
  /** Optional one-line clarifier under the question. */
  hint?: ReactNode;
  /** The single tactile control (slider / segmented / input). */
  children: ReactNode;
  ctaLabel?: string;
  onContinue: () => void;
  /** Optional quiet "back" affordance. */
  onBack?: () => void;
}

export const AskStep = ({
  eyebrow,
  question,
  hint,
  children,
  ctaLabel = 'Continue',
  onContinue,
  onBack,
}: AskStepProps) => {
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
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <motion.p
          {...stagger(0.05)}
          className="mb-[clamp(0.5rem,1.8vh,1.25rem)] text-xs font-medium uppercase tracking-[0.25em] text-primary sm:text-sm"
        >
          {eyebrow}
        </motion.p>
      )}

      <motion.h2
        {...stagger(0.12)}
        className="fluid-question text-balance font-bold tracking-tight text-foreground"
      >
        {question}
      </motion.h2>

      {hint && (
        <motion.p
          {...stagger(0.2)}
          className="fluid-mt-sm mx-auto max-w-md text-balance text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {hint}
        </motion.p>
      )}

      {/* The single control - generous space around it. */}
      <motion.div {...stagger(0.28)} className="fluid-mt-lg">
        {children}
      </motion.div>

      <motion.div
        {...stagger(0.4)}
        className="fluid-mt-lg flex items-center justify-center gap-6"
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back
          </button>
        )}
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
