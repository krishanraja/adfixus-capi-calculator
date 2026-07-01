// SignalBridge — the emotional core of the CAPI story.
//
// A central, animated visual of the conversion signal being restored across the
// publisher↔advertiser bridge. Left: the publisher's real audience, most of it
// anonymous / Safari-blind / dark. Middle: the CAPI "bridge" — a durable,
// verified-human ID lighting up the previously-invisible traffic. Right: the
// advertiser, finally seeing true conversions flowing back.
//
// `coverage` (0..1) is the restored match rate. As it rises, more of the
// anonymous "dark" particles re-illuminate and flow across the bridge — the gap
// closes. Restrained motion; dark; cyan glow. Pure SVG/CSS, no deps.

import { useMemo } from 'react';

interface SignalBridgeProps {
  /** Restored match rate, 0..1 (baseline ~0.30, AdFixus ~0.75). */
  coverage: number;
  /** Baseline match rate, 0..1 — the share visible before AdFixus. */
  baseline?: number;
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

export const SignalBridge = ({ coverage, baseline = 0.3 }: SignalBridgeProps) => {
  const clamped = Math.max(0, Math.min(1, coverage));
  const pct = Math.round(clamped * 100);

  // A field of audience nodes on the left (the publisher's traffic). Their
  // `threshold` is spread 0..1; a node is "restored" once coverage ≥ threshold.
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

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 360"
        className="w-full h-auto"
        role="img"
        aria-label={`Conversion signal coverage restored to ${pct} percent`}
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
          PUBLISHER AUDIENCE
        </text>

        {nodes.map((n, i) => {
          const restored = clamped >= n.threshold;
          const alwaysOn = n.threshold <= baseline;
          return (
            <g key={i}>
              {/* the invisible/anonymous state — faint outline */}
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
              {/* the restored/verified state — lit cyan node */}
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
        {/* Bridge rails */}
        <line x1="300" y1="120" x2="620" y2="120" stroke="hsl(0 0% 22%)" strokeWidth="1" />
        <line x1="300" y1="240" x2="620" y2="240" stroke="hsl(0 0% 22%)" strokeWidth="1" />

        {/* The live signal beam — brightness scales with coverage */}
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
          <animate
            attributeName="x1"
            values="300;620"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </line>

        {/* Flowing verified-conversion packets across the bridge */}
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
                values="300;620"
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
          CAPI · VERIFIED-HUMAN SIGNAL
        </text>
        <text
          x="460"
          y="262"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="11"
          letterSpacing="1"
        >
          durable first-party ID at the edge
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
          ADVERTISER
        </text>

        {/* Advertiser "conversions seen" meter — fills with coverage */}
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
          <rect
            x="0"
            y={240 - clamped * 240}
            width="150"
            height={clamped * 240}
            rx="10"
            fill="url(#sb-glow)"
            opacity="0.9"
            style={{ transition: 'y 0.6s ease, height 0.6s ease' }}
          />
          <line
            x1="0"
            y1={240 - baseline * 240}
            x2="150"
            y2={240 - baseline * 240}
            stroke="hsl(0 84% 60%)"
            strokeOpacity="0.6"
            strokeDasharray="4 4"
          />
          <text
            x="75"
            y="130"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="34"
            fontWeight="700"
          >
            {pct}%
          </text>
          <text x="75" y="152" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
            conversions seen
          </text>
        </g>
      </svg>

      {/* Caption / legend */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/20" />
          Anonymous / Safari-blind — invisible to the advertiser
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_hsl(195_95%_55%)]" />
          Verified human — conversion restored across the bridge
        </span>
      </div>
    </div>
  );
};
