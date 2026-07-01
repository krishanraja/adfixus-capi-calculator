// Reveal - the payoff screen.
//
// The result arrives as a beautiful, simple answer: an optional hero visual, a
// hero number that counts up, a single line of meaning, a small settle
// animation, then ONE calm CTA. This screen should feel good.
//
// `AnimatedNumber` is the shared count-up used by every tool's reveal.

import { type ReactNode, useEffect } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { FLOW_SPRING } from './FlowShell';

/**
 * Count-up number, shared across tools. Animates from 0 → `value` and formats
 * each frame with `format`. Respects prefers-reduced-motion (snaps to final).
 */
export const AnimatedNumber = ({
  value,
  format,
  durationMs = 1100,
  className,
}: {
  value: number;
  format: (n: number) => string;
  durationMs?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (n) => format(n));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: durationMs / 1000,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo - settles gently
    });
    return controls.stop;
  }, [value, durationMs, reduce, mv]);

  return <motion.span className={className}>{text}</motion.span>;
};

interface RevealProps {
  eyebrow?: string;
  /** Optional hero visual (e.g. the SignalBridge) shown above the number. */
  visual?: ReactNode;
  /** The hero number, already wrapped in <AnimatedNumber> by the caller. */
  hero: ReactNode;
  /** One single line of meaning beneath the number. */
  meaning: ReactNode;
  /** One calm CTA. */
  cta: ReactNode;
  /** A quiet secondary affordance (e.g. "See the full plan"). */
  secondary?: ReactNode;
}

export const Reveal = ({
  eyebrow,
  visual,
  hero,
  meaning,
  cta,
  secondary,
}: RevealProps) => {
  const reduce = useReducedMotion();

  const settle = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { ...FLOW_SPRING, delay },
        };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
      {eyebrow && (
        <motion.p
          {...settle(0.05)}
          className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-primary sm:text-sm"
        >
          {eyebrow}
        </motion.p>
      )}

      {visual && (
        <motion.div {...settle(0.12)} className="mb-10 w-full">
          {visual}
        </motion.div>
      )}

      <motion.div
        {...settle(visual ? 0.24 : 0.14)}
        className="text-6xl font-bold leading-none tracking-tight sm:text-7xl md:text-8xl"
      >
        {hero}
      </motion.div>

      <motion.p
        {...settle(visual ? 0.34 : 0.24)}
        className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {meaning}
      </motion.p>

      <motion.div {...settle(visual ? 0.44 : 0.34)} className="mt-10">
        {cta}
      </motion.div>

      {secondary && (
        <motion.div {...settle(visual ? 0.52 : 0.42)} className="mt-6">
          {secondary}
        </motion.div>
      )}
    </div>
  );
};
