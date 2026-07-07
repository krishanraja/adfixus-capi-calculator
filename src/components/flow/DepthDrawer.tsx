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
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

interface DepthDrawerProps {
  /** The quiet trigger label, e.g. "Explore the full model". */
  label: string;
  /** Accessible dialog label for the opened panel (the recap inside is the visible header). */
  title: string;
  /** All the demoted richness. */
  children: ReactNode;
}

export const DepthDrawer = ({ label, title, children }: DepthDrawerProps) => {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  // Portal target readiness (the panel renders into document.body).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

      {/* Portalled to document.body so the fixed overlay is positioned against the
          viewport, free of any ancestor's stacking/overflow context. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="depth-backdrop"
                className="fixed inset-0 z-[100] bg-black/70 text-left backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.1 : 0.25 }}
                onClick={() => setOpen(false)}
              >
                {/* Content-height sheet, anchored to the bottom and capped at the
                    viewport. It is as tall as its content and only its body scrolls
                    - and only when a window is genuinely too short. No transform
                    scaling: content is always full-size and legible. */}
                <motion.div
                  key="depth-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[calc(100dvh-1.25rem)] max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-background text-left shadow-2xl"
                  initial={reduce ? { opacity: 0 } : { y: '4%', opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: '4%', opacity: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.12 }
                      : { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 }
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground sm:right-6"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                    <div className="mx-auto w-full max-w-5xl">{children}</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
