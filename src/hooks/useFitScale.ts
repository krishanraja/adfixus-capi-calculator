// useFitScale - scale a content element DOWN so it always fits its frame.
//
// The no-scroll guarantee. Attach `frameRef` to a bounded box (fixed height,
// overflow hidden) and `contentRef` to the natural-size content inside it; apply
// the returned `scale` as a CSS transform on a wrapper around the content. The
// content is scaled down (never up) so it can never overflow the frame, so the
// frame never scrolls. Content that already fits renders at scale 1.
//
// Measuring `content.offset*` reports the natural (unscaled) layout box - an
// ancestor transform does not change it - so the measurement never feeds back on
// the scale. Re-measures on frame/content resize, window resize, font load, and
// whenever `key` changes (e.g. the active step or tab).

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export function useFitScale(enabled: boolean, key: unknown) {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const fit = useCallback(() => {
    if (!enabled) {
      setScale((p) => (p !== 1 ? 1 : p));
      return;
    }
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const cs = getComputedStyle(frame);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const availH = frame.clientHeight - padY;
    const availW = frame.clientWidth - padX;
    const contentH = content.offsetHeight;
    const contentW = content.offsetWidth;
    if (contentH <= 0 || contentW <= 0 || availH <= 0) return;

    const next = Math.min(1, availH / contentH, availW / contentW);
    setScale((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
  }, [enabled]);

  // `key` is included so a re-measure fires when the swapped-in content changes.
  useLayoutEffect(() => {
    fit();
  }, [fit, key]);

  useEffect(() => {
    if (!enabled) return;
    fit();
    const ro = new ResizeObserver(() => fit());
    if (contentRef.current) ro.observe(contentRef.current);
    if (frameRef.current) ro.observe(frameRef.current);
    window.addEventListener('resize', fit);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready?.then(() => fit());
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [enabled, fit, key]);

  return { frameRef, contentRef, scale };
}
