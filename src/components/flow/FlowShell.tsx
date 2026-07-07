// FlowShell - the guided-flow shell for the AdFixus tools.
//
// Full-viewport, centred, dark. An optional tiny fixed AdFixus wordmark top-left
// (see `showWordmark`, suppressed in the iframe embed), an optional slim row of
// progress dots. Renders exactly ONE step at a time and animates transitions with
// AnimatePresence: a gentle fade + 12px y + slight scale, spring easing (~0.4s).
// Respects prefers-reduced-motion.
//
// NO-SCROLL GUARANTEE. The whole tool is meant to be a single screen that never
// scrolls. Two contexts:
//   - Standalone (not in an iframe): the shell is exactly one viewport tall
//     (`h-dvh-safe`, overflow hidden) and the step content is SCALED DOWN to fit
//     whenever it is taller than the viewport, so it can never overflow. Content
//     that already fits renders at scale 1, centred.
//   - Embedded (iframe on adfixus.com): the parent auto-resizes the iframe to the
//     reported content height (see core/embed), so the tool is already a single
//     screen there. We keep the natural, growing layout in that case and do not
//     scale (scaling against the iframe's own height would fight the auto-resize).
//
// This shell began as the byte-identical family shell shared with
// adfixus-id-simulator and adfixus-sales; it has since diverged in this repo (the
// `showWordmark` prop and the no-scroll fit-to-viewport behaviour). Keep motion and
// timing aligned with the family where you can, but it is no longer identical.

import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/** Canonical transition - a soft spring, ~0.4s. Shared by every step. */
export const FLOW_SPRING = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 26,
  mass: 0.9,
};

/** True when this document is rendered inside an iframe (the embed case). */
function detectEmbedded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent access throws - that only happens when embedded.
    return true;
  }
}

interface FlowShellProps {
  /** Zero-based index of the visible step. */
  stepIndex: number;
  /** Total number of steps - drives the progress dots. */
  stepCount: number;
  /** The single visible step. Its `key` (via stepIndex) drives the transition. */
  children: ReactNode;
  /** Hide the progress dots (e.g. on a single-screen reveal). Default: shown. */
  showProgress?: boolean;
  /**
   * Show the AdFixus wordmark top-left. Default true for the shared shell, but
   * tools embedded in an iframe on adfixus.com pass false to avoid a redundant
   * (and mis-scaled) second logo on the host page.
   */
  showWordmark?: boolean;
}

const WORDMARK = '/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png';

export const FlowShell = ({
  stepIndex,
  stepCount,
  children,
  showProgress = true,
  showWordmark = true,
}: FlowShellProps) => {
  const reduce = useReducedMotion();
  const [embedded] = useState(detectEmbedded);

  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Fit the current step into the available frame by scaling it down (never up).
  // Only runs standalone; embedded relies on the parent auto-resizing the iframe.
  const fit = useCallback(() => {
    if (embedded) return;
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const cs = getComputedStyle(frame);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const availH = frame.clientHeight - padY;
    const availW = frame.clientWidth - padX;

    // offset* is the natural (unscaled) layout box - an ancestor transform does
    // not change it, so measuring here is stable and never feeds back on scale.
    const contentH = content.offsetHeight;
    const contentW = content.offsetWidth;
    if (contentH <= 0 || contentW <= 0 || availH <= 0) return;

    const next = Math.min(1, availH / contentH, availW / contentW);
    setScale((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
  }, [embedded]);

  useLayoutEffect(() => {
    fit();
  }, [fit, stepIndex, children]);

  useEffect(() => {
    if (embedded) return;
    fit();
    const ro = new ResizeObserver(() => fit());
    if (contentRef.current) ro.observe(contentRef.current);
    if (frameRef.current) ro.observe(frameRef.current);
    window.addEventListener('resize', fit);
    // Fonts landing late can change the natural height - refit once they do.
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(() => fit());
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [embedded, fit]);

  const variants = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    exit: reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 },
  };

  const step = (
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
  );

  return (
    <div
      className={`relative hero-gradient overflow-hidden ${
        embedded ? 'min-h-dvh-safe' : 'h-dvh-safe'
      }`}
    >
      {/* Tiny fixed wordmark, top-left. Forced white for the dark bg. Hidden when
          embedded so the host page's own AdFixus branding is not duplicated. */}
      {showWordmark && (
        <div className="pointer-events-none fixed left-5 top-5 z-50 sm:left-8 sm:top-7">
          <img
            src={WORDMARK}
            alt="AdFixus"
            className="h-6 w-auto opacity-90 sm:h-7"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      )}

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

      {embedded ? (
        // Embedded: natural, growing layout - the parent resizes the iframe to fit.
        <div className="relative z-10 mx-auto flex min-h-dvh-safe w-full max-w-5xl flex-col items-center justify-center px-6 py-12 sm:px-8 sm:py-16">
          {step}
        </div>
      ) : (
        // Standalone: fit the step into exactly one viewport (scale down if needed).
        <div
          ref={frameRef}
          className="absolute inset-0 z-10 flex items-center justify-center px-6 py-14 sm:px-8 sm:py-16"
        >
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="w-full max-w-5xl"
          >
            <div ref={contentRef} className="w-full">
              {step}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
