// Reveal - the payoff screen.
//
// Result-dominant: the hero number counts up first and stays the focal point,
// then one line of meaning, a compact substantiation strip (`highlights`, the
// lever breakdown), one calm CTA beside a quiet `exploreAction`, and finally a
// demoted, supporting `visual` at the bottom (e.g. the SignalBridge band). The
// number leads; the visual never competes with it. Respects reduced motion.
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
  /** The hero number, already wrapped in <AnimatedNumber> by the caller. */
  hero: ReactNode;
  /** One tight line of meaning beneath the number. */
  meaning: ReactNode;
  /** Compact substantiation directly under the meaning (e.g. the lever strip). */
  highlights?: ReactNode;
  /** One calm primary CTA. */
  cta: ReactNode;
  /** A quiet inline action beside the CTA (e.g. "Explore the full model"). */
  exploreAction?: ReactNode;
  /**
   * A demoted, supporting visual (e.g. the SignalBridge band) rendered quietly
   * at the bottom. The number stays the hero; this is reinforcement.
   */
  visual?: ReactNode;
}

export const Reveal = ({
  eyebrow,
  hero,
  meaning,
  highlights,
  cta,
  exploreAction,
  visual,
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
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      {eyebrow && (
        <motion.p
          {...settle(0.05)}
          className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-primary sm:mb-4"
        >
          {eyebrow}
        </motion.p>
      )}

      {/* The number is the hero - large, first, dominant. */}
      <motion.div
        {...settle(0.12)}
        className="fluid-number font-bold tracking-tight"
      >
        {hero}
      </motion.div>

      <motion.p
        {...settle(0.22)}
        className="fluid-mt-sm mx-auto max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
      >
        {meaning}
      </motion.p>

      {highlights && (
        <motion.div {...settle(0.3)} className="fluid-mt-md w-full">
          {highlights}
        </motion.div>
      )}

      <motion.div
        {...settle(0.38)}
        className="fluid-mt-md flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6"
      >
        {cta}
        {exploreAction}
      </motion.div>

      {visual && (
        <motion.div
          {...settle(0.48)}
          className="fluid-mt-lg hidden w-full max-w-2xl opacity-80 sm:block"
        >
          {visual}
        </motion.div>
      )}
    </div>
  );
};
