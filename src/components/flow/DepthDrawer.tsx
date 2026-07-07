// DepthDrawer - progressive depth, hidden by default.
//
// A quiet "Explore the full model" affordance that expands (slide + scale + fade)
// into a fixed-height panel holding ALL the existing richness - sliders/config,
// charts, deal models, provenance - organised into tabs so it fits one screen
// without long scrolling (overflow-y is only a safety net for very short
// viewports). Nothing is lost; it is simply demoted behind one calm link.
//
// Historically a shared shape across the three AdFixus tools; this repo's version
// has diverged for the no-scroll iframe redesign (fixed-height, text-left reset,
// content authored to fit one panel). Only the trigger label and content differ.

import { type ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

interface DepthDrawerProps {
  /** The quiet trigger label, e.g. "See the full plan". */
  label: string;
  /** Heading shown at the top of the opened surface. */
  title: string;
  /** Optional one-line subtitle under the title. */
  subtitle?: ReactNode;
  /** All the demoted richness. */
  children: ReactNode;
}

export const DepthDrawer = ({ label, title, subtitle, children }: DepthDrawerProps) => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer owns the viewport.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="depth-backdrop"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.25 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              key="depth-panel"
              // text-left: the drawer is a DOM descendant of the (centered) Reveal,
              // so reset inherited text-align here - every child aligns explicitly.
              className="absolute inset-x-0 bottom-0 top-4 mx-auto flex max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-background text-left shadow-2xl sm:top-6"
              initial={reduce ? { opacity: 0 } : { y: '4%', opacity: 0, scale: 0.985 }}
              animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { y: '4%', opacity: 0, scale: 0.985 }}
              transition={
                reduce
                  ? { duration: 0.12 }
                  : { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }
              }
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky header */}
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border/60 bg-background/95 px-5 py-3.5 backdrop-blur-xl sm:px-8 sm:py-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body - the demoted richness. Content is authored to fit one
                  panel (tabbed), so it does not scroll in normal use; overflow
                  stays auto as a safety net for very short viewports only. */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-6">
                <div className="mx-auto h-full w-full max-w-5xl">{children}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
