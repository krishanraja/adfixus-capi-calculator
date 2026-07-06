// SignalBridge - the emotional core of the CAPI story.
//
// A central, animated visual of real conversion events flowing back from the
// advertiser to the publisher as measurable outcomes, across the CAPI bridge.
// Left: the publisher's audience, much of it anonymous / Safari-blind until a
// durable ID lights it up. Middle: the CAPI bridge - a durable, verified-human
// ID backbone carrying real conversion events (purchases, sign-ups, test-drives)
// back to the publisher. Right: the advertiser, sending outcomes the publisher
// can finally attribute and price.
//
// `intensity` (0..1) scales how much of the audience is illuminated and how
// bright the signal flows - it is derived from the publisher's own inputs, never
// a fabricated number. Restrained motion; dark; cyan glow. Pure SVG/CSS.

import { useMemo } from 'react';

interface SignalBridgeProps {
  /**
   * Bridge intensity, 0..1 - how lit the field and flow are. Derived from the
   * publisher's addressable book, not a made-up "match rate".
   */
  intensity?: number;
  /** The conversion event noun for this vertical, e.g. "test-drive bookings". */
  conversionNoun?: string;
  /**
   * "full" is the tall hero visual. "band" is a slim, supporting horizontal
   * strip for the reveal, where the NUMBER is the hero and the bridge is quiet
   * reinforcement rather than the dominant element.
   */
  variant?: 'full' | 'band';
}

// Deterministic pseudo-random so the field is stable across renders.
function seeded(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

interface Node {
  cx: number;
  cy: number;
  r: number;
  /** Threshold above which this node is "restored" (lit). Lower = always-on. */
  threshold: number;
  delay: number;
}

export const SignalBridge = ({
  intensity = 0.7,
  conversionNoun = 'conversions',
  variant = 'full',
}: SignalBridgeProps) => {
  const clamped = Math.max(0, Math.min(1, intensity));

  // A field of audience nodes on the left (the publisher's traffic). Their
  // `threshold` is spread 0..1; a node lights once intensity ≥ threshold.
  // (Computed unconditionally so hook order is stable across variants.)
  const nodes = useMemo<Node[]>(() => {
    const out: Node[] = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      const cx = 40 + seeded(i) * 210;
      const cy = 30 + seeded(i + 100) * 300;
      const r = 2 + seeded(i + 200) * 2.4;
      const threshold = seeded(i + 300);
      out.push({ cx, cy, r, threshold, delay: seeded(i + 400) * 2 });
    }
    return out;
  }, []);

  if (variant === 'band') {
    return <SignalBridgeBand intensity={clamped} conversionNoun={conversionNoun} />;
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 360"
        className="h-auto w-full"
        role="img"
        aria-label="Conversion events flowing back to the publisher across the CAPI bridge"
      >
        <defs>
          <linearGradient id="sb-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(195 95% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(195 95% 60%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(195 95% 50%)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(195 95% 55%)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(195 95% 55%)" stopOpacity="0" />
          </radialGradient>
          <filter id="sb-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        {/* ---- LEFT: the publisher's audience field ---- */}
        <text x="20" y="20" className="fill-muted-foreground" fontSize="12" letterSpacing="1.5">
          YOUR AUDIENCE
        </text>

        {nodes.map((n, i) => {
          const restored = clamped >= n.threshold;
          const alwaysOn = n.threshold <= 0.25;
          return (
            <g key={i}>
              {/* the invisible/anonymous state - faint outline */}
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill="none"
                stroke="hsl(0 0% 100%)"
                strokeOpacity={restored ? 0 : 0.14}
                strokeWidth={1}
                style={{ transition: 'stroke-opacity 0.6s ease' }}
              />
              {/* the restored/verified state - lit cyan node */}
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill="hsl(195 95% 55%)"
                fillOpacity={restored ? (alwaysOn ? 0.95 : 0.85) : 0}
                style={{
                  transition: `fill-opacity 0.7s ease ${n.delay * 0.12}s`,
                  filter: restored ? 'drop-shadow(0 0 3px hsl(195 95% 55%))' : 'none',
                }}
              />
            </g>
          );
        })}

        {/* ---- MIDDLE: the CAPI bridge ---- */}
        <line x1="300" y1="120" x2="620" y2="120" stroke="hsl(0 0% 22%)" strokeWidth="1" />
        <line x1="300" y1="240" x2="620" y2="240" stroke="hsl(0 0% 22%)" strokeWidth="1" />

        {/* The live signal beam - brightness scales with intensity */}
        <rect
          x="300"
          y="150"
          width="320"
          height="60"
          fill="url(#sb-glow)"
          opacity={0.3 + clamped * 0.7}
          style={{ transition: 'opacity 0.6s ease' }}
        />
        <line
          x1="300"
          y1="180"
          x2="620"
          y2="180"
          stroke="url(#sb-flow)"
          strokeWidth={2 + clamped * 3}
          opacity={0.4 + clamped * 0.6}
          style={{ transition: 'stroke-width 0.6s ease, opacity 0.6s ease' }}
        >
          <animate attributeName="x1" values="620;300" dur="2.4s" repeatCount="indefinite" />
        </line>

        {/* Flowing verified-conversion packets - moving right→left, back to you */}
        {[0, 1, 2, 3, 4].map((i) => {
          const active = clamped > i / 6;
          return (
            <circle
              key={`pkt-${i}`}
              r={3}
              fill="hsl(195 95% 65%)"
              opacity={active ? 0.9 : 0}
              filter="url(#sb-soft)"
              style={{ transition: 'opacity 0.5s ease' }}
            >
              <animate
                attributeName="cx"
                values="620;300"
                dur={`${2 + i * 0.35}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${168 + i * 6};${168 + i * 6}`}
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        <text
          x="460"
          y="110"
          textAnchor="middle"
          className="fill-primary"
          fontSize="12"
          letterSpacing="2"
          fontWeight="600"
        >
          YOUR CONVERSIONS API
        </text>
        <text
          x="460"
          y="262"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="11"
          letterSpacing="1"
        >
          durable, verified-human ID at the edge
        </text>

        {/* ---- RIGHT: the advertiser ---- */}
        <text
          x="880"
          y="20"
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize="12"
          letterSpacing="1.5"
        >
          YOUR ADVERTISER
        </text>

        {/* Advertiser panel - real conversion events being sent back */}
        <g transform="translate(700, 60)">
          <rect
            x="0"
            y="0"
            width="150"
            height="240"
            rx="10"
            fill="hsl(0 0% 8%)"
            stroke="hsl(0 0% 18%)"
          />
          {/* Event rows lighting up server-to-server */}
          {[0, 1, 2, 3, 4, 5].map((row) => {
            const lit = clamped > row / 7;
            return (
              <g key={`evt-${row}`} transform={`translate(16, ${26 + row * 34})`}>
                <rect
                  x="0"
                  y="0"
                  width="12"
                  height="12"
                  rx="3"
                  fill={lit ? 'hsl(195 95% 55%)' : 'hsl(0 0% 18%)'}
                  style={{
                    transition: `fill 0.5s ease ${row * 0.08}s`,
                    filter: lit ? 'drop-shadow(0 0 3px hsl(195 95% 55%))' : 'none',
                  }}
                />
                <rect
                  x="22"
                  y="3"
                  width={lit ? 88 : 60}
                  height="6"
                  rx="3"
                  fill={lit ? 'hsl(195 95% 55% / 0.5)' : 'hsl(0 0% 16%)'}
                  style={{ transition: 'width 0.5s ease, fill 0.5s ease' }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Caption / legend - concrete, no fabricated numbers */}
      <div className="mt-4 flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20" />
          Anonymous / Safari-blind: invisible to your advertiser today
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(195_95%_55%)]" />
          Verified {conversionNoun} flowing back as measurable outcomes
        </span>
      </div>
    </div>
  );
};

// SignalBridgeBand - the slim, supporting variant used on the reveal.
//
// A quiet horizontal strip: a small cluster of audience dots on the left, a live
// CAPI beam with conversion packets flowing back through the middle, and a compact
// advertiser chip on the right. It reinforces the story without competing with the
// hero number for attention.
const SignalBridgeBand = ({
  intensity,
  conversionNoun,
}: {
  intensity: number;
  conversionNoun: string;
}) => {
  const dots = useMemo<Node[]>(() => {
    const out: Node[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      // Cluster around the beam centre-line (y=60) so the band reads as one
      // cohesive left-to-right flow, not three scattered fragments.
      const cx = 20 + seeded(i) * 200;
      const cy = 36 + seeded(i + 100) * 48;
      const r = 1.6 + seeded(i + 200) * 1.8;
      const threshold = seeded(i + 300);
      out.push({ cx, cy, r, threshold, delay: seeded(i + 400) * 2 });
    }
    return out;
  }, []);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 120"
        className="h-auto w-full"
        role="img"
        aria-label={`Verified ${conversionNoun} flowing back to you across your Conversions API`}
      >
        <defs>
          <linearGradient id="sbb-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(195 95% 50%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(195 95% 62%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(195 95% 50%)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="sbb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(195 95% 55%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(195 95% 55%)" stopOpacity="0" />
          </radialGradient>
          <filter id="sbb-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        {/* Left: audience cluster */}
        {dots.map((n, i) => {
          const restored = intensity >= n.threshold;
          return (
            <circle
              key={i}
              cx={n.cx}
              cy={n.cy}
              r={n.r}
              fill="hsl(195 95% 55%)"
              stroke="hsl(0 0% 100%)"
              strokeOpacity={restored ? 0 : 0.14}
              strokeWidth={1}
              fillOpacity={restored ? 0.85 : 0}
              style={{
                transition: `fill-opacity 0.6s ease ${n.delay * 0.1}s, stroke-opacity 0.5s ease`,
                filter: restored ? 'drop-shadow(0 0 2px hsl(195 95% 55%))' : 'none',
              }}
            />
          );
        })}

        {/* Middle: the CAPI beam */}
        <text
          x="450"
          y="18"
          textAnchor="middle"
          className="fill-primary"
          fontSize="11"
          letterSpacing="2.5"
          fontWeight="600"
        >
          YOUR CONVERSIONS API
        </text>
        <rect
          x="250"
          y="46"
          width="400"
          height="28"
          fill="url(#sbb-glow)"
          opacity={0.3 + intensity * 0.7}
        />
        <line
          x1="250"
          y1="60"
          x2="650"
          y2="60"
          stroke="url(#sbb-flow)"
          strokeWidth={1.5 + intensity * 3}
          opacity={0.5 + intensity * 0.5}
        >
          <animate attributeName="x1" values="650;250" dur="2.4s" repeatCount="indefinite" />
        </line>
        {[0, 1, 2, 3].map((i) => {
          const active = intensity > i / 5;
          return (
            <circle
              key={`bpkt-${i}`}
              r={2.6}
              fill="hsl(195 95% 68%)"
              opacity={active ? 0.9 : 0}
              filter="url(#sbb-soft)"
              cy={60}
              style={{ transition: 'opacity 0.5s ease' }}
            >
              <animate
                attributeName="cx"
                values="650;250"
                dur={`${2 + i * 0.35}s`}
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
        <text
          x="450"
          y="98"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
          letterSpacing="0.5"
        >
          durable, verified-human ID at the edge
        </text>

        {/* Right: advertiser chip */}
        <g transform="translate(686, 22)">
          <rect x="0" y="0" width="196" height="76" rx="8" fill="hsl(0 0% 8%)" stroke="hsl(0 0% 18%)" />
          {[0, 1, 2].map((row) => {
            const lit = intensity > row / 4;
            return (
              <g key={`bevt-${row}`} transform={`translate(14, ${18 + row * 20})`}>
                <rect
                  x="0"
                  y="0"
                  width="10"
                  height="10"
                  rx="2.5"
                  fill={lit ? 'hsl(195 95% 55%)' : 'hsl(0 0% 18%)'}
                  style={{
                    transition: `fill 0.5s ease ${row * 0.08}s`,
                    filter: lit ? 'drop-shadow(0 0 2px hsl(195 95% 55%))' : 'none',
                  }}
                />
                <rect
                  x="18"
                  y="2.5"
                  width={lit ? 150 : 96}
                  height="5"
                  rx="2.5"
                  fill={lit ? 'hsl(195 95% 55% / 0.5)' : 'hsl(0 0% 16%)'}
                  style={{ transition: 'width 0.5s ease, fill 0.5s ease' }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
