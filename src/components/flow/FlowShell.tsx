// FlowShell — the shared guided-flow shell for every AdFixus tool.
//
// Full-viewport, centred, dark. A tiny fixed AdFixus wordmark top-left, an
// optional slim row of progress dots. Renders exactly ONE step at a time and
// animates transitions with AnimatePresence: a gentle fade + 12px y + slight
// scale, spring easing (~0.4s). Respects prefers-reduced-motion.
//
// Keep this file identical (structure, names, motion, timing) across
// adfixus-id-simulator, adfixus-capi-calculator and adfixus-sales — it is what
// makes the three tools feel like one family.

import { type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** Canonical transition — a soft spring, ~0.4s. Shared by every step. */
export const FLOW_SPRING = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 26,
  mass: 0.9,
};

interface FlowShellProps {
  /** Zero-based index of the visible step. */
  stepIndex: number;
  /** Total number of steps — drives the progress dots. */
  stepCount: number;
  /** The single visible step. Its `key` (via stepIndex) drives the transition. */
  children: ReactNode;
  /** Hide the progress dots (e.g. on a single-screen reveal). Default: shown. */
  showProgress?: boolean;
}

const WORDMARK = '/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png';

export const FlowShell = ({
  stepIndex,
  stepCount,
  children,
  showProgress = true,
}: FlowShellProps) => {
  const reduce = useReducedMotion();

  const variants = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 },
  };

  return (
    <div className="relative min-h-dvh-safe hero-gradient overflow-hidden">
      {/* Tiny fixed wordmark, top-left. Forced white for the dark bg. */}
      <div className="pointer-events-none fixed left-5 top-5 z-50 sm:left-8 sm:top-7">
        <img
          src={WORDMARK}
          alt="AdFixus"
          className="h-6 w-auto opacity-90 sm:h-7"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Slim progress dots, top-centre. */}
      {showProgress && stepCount > 1 && (
        <div className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 sm:top-8">
          {Array.from({ length: stepCount }, (_, i) => {
            const active = i === stepIndex;
            return (
              <motion.span
                key={i}
                className="block h-1.5 rounded-full"
                animate={{
                  width: active ? 22 : 6,
                  backgroundColor: active
                    ? 'hsl(195 95% 50%)'
                    : i < stepIndex
                      ? 'hsl(195 95% 50% / 0.4)'
                      : 'hsl(0 0% 30%)',
                }}
                transition={reduce ? { duration: 0 } : FLOW_SPRING}
              />
            );
          })}
        </div>
      )}

      {/* One step, centred, huge whitespace. */}
      <div className="relative z-10 mx-auto flex min-h-dvh-safe w-full max-w-5xl flex-col items-center justify-center px-6 py-24 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={reduce ? { duration: 0.15 } : FLOW_SPRING}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
