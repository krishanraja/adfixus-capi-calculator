# Handover: adfixus-capi-calculator (Your Own Conversions API, ROI)

## The AdFixus tool family (read this first)

You are taking over **three** related tools that share one brand, one design
system, and one calculation engine (`src/core`):

| Repo | What it is | Access |
|------|------------|--------|
| **adfixus-id-simulator** | Public lead magnet: configurable **ID durability** simulator | Public, embeddable |
| **adfixus-capi-calculator** (this repo) | Public lead magnet: **the publisher CAPI ROI tool**, what standing up your own Conversions API is worth | Public, embeddable |
| **adfixus-sales** | Internal **Target Business Report Card** (live enrichment + v6 rubric) | Team-only (Vercel SSO) |

The shared engine, design tokens, and embedding protocol are documented once, for
all three, in **[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** (identical
in every repo).

## What this repo is for

A public, embeddable **lead magnet** built around one idea for an open-web
publisher (a Carsales/Chegg type being sold on AdFixus): **walled gardens took
about half of open-web ad revenue with one thing you do not have, your own
Conversions API.** AdFixus gives the publisher a durable, accurate, privacy-safe
identity backbone so it can run its own server-to-server CAPI: advertisers send
conversion events directly to the publisher, restoring the measurement lost to
cookie/ITP blocking, so the publisher can sell a 100%-accurate outcomes product
like the walled gardens and win those outcome budgets back.

The tool asks only what a publisher actually knows (annual open-web ad revenue,
vertical, and, in the drawer, the direct-sold / performance share of sales),
derives everything technical internally, and shows the **incremental annual ad
revenue** standing up their own CAPI could be worth, then invites them to book a
meeting. **It never asks for a match rate.** It is designed to be **iframed into
adfixus.com**.

## The guided flow (the visible surface)

`src/components/SalesPlanApp.tsx` renders an Apple-grade guided flow: smart
defaults, almost no input, all depth one link away.

1. **Provocation** (`flow/Provocation.tsx`): *"Walled gardens took about half of
   open-web ad revenue with one thing you do not have: your own Conversions API."*
2. **Ask, revenue** (`flow/AskStep.tsx` + `flow/RevenueControl.tsx`): one slider,
   annual open-web ad revenue (default about $20M; a *traffic + CPM* alternative
   derives it).
3. **Ask, vertical** (`flow/AskStep.tsx` + `flow/VerticalControl.tsx`): a segmented
   choice that sets the conversion framing and the default performance share.
4. **Reveal** (`flow/Reveal.tsx` + `bridge/SignalBridge.tsx`): the animated CAPI
   bridge (real conversion events flowing back as measurable outcomes), one hero
   number (total incremental annual ad revenue), the three-lever breakdown, a
   Carsales benchmark line, one CTA (Book a meeting), and a quiet **"See the full
   model"** link.

That link opens `flow/DepthDrawer.tsx` then **`depth/CommercialDepth.tsx`**, which
holds all the detail and **reconciles to the same headline number**: the three
levers restated and adjustable, plus the direct-sold / performance share slider
(`depth/LeverSliders`, `depth/LeverBreakdown`), the three-year ramp
(`depth/ThreeYearRamp`), the three deal models showing what you pay AdFixus vs keep
NET (`depth/DealComparison`), and the $30K-cap per-campaign economics
(`depth/CapCampaignTable`).

## Architecture: where the math lives

```
guided flow UI       src/components/flow/*  + bridge/*
        |
        v
useCapiRoi()         src/hooks/useCapiRoi.ts        (inputs + assumptions, single source of truth)
        |
        |- calculateCapiRoi()   src/lib/capiRoi.ts          (the 3-lever headline)
        |- priceCapiRoi()       src/lib/capiCommercial.ts    (headline -> 3 deal models)
                                    |- $30K-cap economics    src/utils/campaignEconomicsCalculator.ts
```

- **100% client-side.** No backend, no login, no database, no secrets.
- **The whole visible surface reads from one hook.** `SalesPlanApp` and the depth
  drawer both consume `src/hooks/useCapiRoi.ts`, which holds the inputs and lever
  assumptions and derives BOTH the headline (`calculateCapiRoi`) and the commercial
  pricing (`priceCapiRoi`), so they always reconcile.
- **The headline model** is `src/lib/capiRoi.ts`: three non-overlapping levers
  (win-back, CPM uplift, retention) on publisher-knowable inputs. Every number
  traces to an input or a named, adjustable assumption. Match rate, campaign count,
  and addressability are DERIVED, never asked.
- **The commercial pricing** is `src/lib/capiCommercial.ts`: it takes the SAME
  `totalIncremental` and prices it against three deal models (revenue-share with a
  **$30K/campaign/month cap**, annual cap, flat fee). The per-campaign cap math
  reuses `src/utils/campaignEconomicsCalculator.ts` (ported from the Vox engine);
  the campaign shape is derived from `addressable` via `deriveCampaignShape`, so the
  cap table reconciles to the same inputs.
- **No lead capture.** The single CTA opens the booking link
  (`VITE_MEETING_BOOKING_URL`) in a new tab; there is no form, no localStorage
  store, no PII, no PDF.
- The shared `src/core` engine is retained for the tool family and for the
  `core/embed` iframe module, but the CAPI ROI path no longer routes through it; the
  model is self-contained in `src/lib`.

## The reconciliation principle (one number, decomposed)

There is exactly **one headline number**: `totalIncremental` from
`calculateCapiRoi`. The drawer never invents a second one. It **decomposes** that
number three ways (the three levers), **projects** it (the three-year ramp is the
same total times a ramp factor), and **prices** it (each deal model's `incremental`
is that same total). If you add a figure to the surface, it must trace back to this
one number or to a named, adjustable assumption; otherwise it does not belong.

Worked example ($20M revenue, auto, 40% performance share):

```
addressable = $20M x 0.40                 = $8.0M
A win-back  = $8.0M x 0.22                 = $1.76M
B CPM       = ($20M x 0.35) x 0.15         = $1.05M
C retention = $8.0M x 0.08                 = $0.64M
totalIncremental                          = $3.45M / yr
revenue-share fee about $0.43M, publisher keeps about $3.02M (88%)
3-year ramp (0.55 / 1.0 / 1.2)            about $9.5M cumulative
```

## How to change the assumption rates and vertical profiles

- **The three levers and their default rates** (`winBackRate` 0.22, `enrichedShare`
  0.35, `cpmUplift` 0.15, `retentionValue` 0.08) live in `DEFAULT_ASSUMPTIONS` in
  `src/lib/capiRoi.ts`. Each is also a live slider in the drawer
  (`depth/LeverSliders.tsx`), which reads and writes the same hook state.
- **The per-vertical profiles** (`VERTICALS` in `src/lib/capiRoi.ts`) set each
  vertical's default `performanceShare` (auto 0.50, education 0.45, retail 0.50,
  finance 0.45, travel 0.45, other 0.40), its `label`, and its `conversionNoun`
  (the outcome copy, e.g. auto = "test-drive bookings and enquiries"). Changing a
  vertical resets `performanceShare` to that vertical's default (see `setVertical`
  in `useCapiRoi.ts`), keeping the framing and the addressable book consistent.
- **The default entry point** is `DEFAULT_INPUTS` in `src/lib/capiRoi.ts` (about
  $20M, auto, 50% performance share).
- **The deal models** (12.5% share, $30K/campaign/month cap, $1.2M annual cap, $1M
  flat fee) live in `DEAL_PARAMS` in `src/lib/capiCommercial.ts`; the per-campaign
  cap constants (`REVENUE_SHARE_RATE`, `CAMPAIGN_CAP`, `CONVERSION_IMPROVEMENT`,
  `CAP_THRESHOLD`) live in `src/types/campaignEconomics.ts`. The deal models shown
  here are the *publisher's* revenue split (what they pay AdFixus vs keep), not an
  AdFixus rate-card quote.
- **The three-year ramp** factors are `RAMP_YEARS` (0.55 / 1.0 / 1.2) in
  `src/lib/capiRoi.ts`.

## Design system

Dark theme, AdFixus bright-cyan accent, **identical** to the other two tools. HSL
tokens in `src/index.css` (`:root`) + `tailwind.config.ts`: `--background: 0 0% 0%`
(black), `--primary: 195 95% 50%` (cyan), `--primary-glow: 195 95% 60%`,
`--card: 0 0% 6%`, `--radius: 1rem`; body font **Montserrat** (Google Fonts
`<link>` in `index.html`). The shared guided-flow shell (`src/components/flow/*`)
is kept byte-identical across the three tools so they feel like one family. Full
token list + utility classes in the core spec section 4.

## What you need to do next

1. **Run it:** `npm install && npm run dev` (port 8080). No env needed.
2. **Verify the math:** open the drawer and confirm the three levers sum to the
   headline, and the deal models all price the same `totalIncremental` (the worked
   $20M / auto / 40% example above).
3. **Check quality:** `npm run build` and `npm run lint` both pass. The only lint
   warnings left are `react-refresh/only-export-components` in vendored shadcn/ui
   primitives and the shared `FlowShell`, expected and safe to leave.
4. **Deploy:** static SPA on Vercel (preset Vite, output `dist/`) or any static
   host; add the SPA rewrite `/* -> /index.html`. Public, no auth.
5. **Embed on adfixus.com:** use the iframe + `message` snippet from the core spec
   (section 5); it auto-resizes.

## Ideas for development

- Let a prospect toggle the deal-model inputs (share %, cap) live in the drawer and
  watch the three-year projection update, the same way the lever rates already do.
- Persist a shareable permalink of the inputs + assumptions (query-string encoded),
  so a rep can send a prospect their exact model.
- Add a "see the ID-durability story too" CTA into the id-simulator (the shared
  engine already computes both under `id-capi`).
- Ground more of the levers in real benchmarks per vertical (today the lever rates
  are vertical-agnostic on purpose to keep the model legible; only `performanceShare`
  varies by vertical).
- Light analytics and A/B-tested provocation copy.
- Promote `src/core/` to a shared private npm package across the three repos (today
  it is vendored identically; see core spec section 7).
