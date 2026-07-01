# Handover — adfixus-capi-calculator (The CAPI Data Bridge)

## The AdFixus tool family (read this first)

You are taking over **three** related tools that share one brand, one design
system, and one calculation engine (`src/core`):

| Repo | What it is | Access |
|------|------------|--------|
| **adfixus-id-simulator** | Public lead magnet — configurable **ID durability** simulator | Public, embeddable |
| **adfixus-capi-calculator** (this repo) | Public lead magnet — **the CAPI data bridge**: restore the conversion signal, see what it's worth | Public, embeddable |
| **adfixus-sales** | Internal **Target Business Report Card** (live enrichment + v6 rubric) | Team-only (Vercel SSO) |

The shared engine, design tokens, and embedding protocol are documented once, for
all three, in **[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** (identical
in every repo).

## What this repo is for

A public, embeddable **lead magnet** built around one idea for an open-web
publisher: **walled gardens took about half of open-web ad revenue with one thing
you do not have — your own Conversions API.** AdFixus gives the publisher a
durable, privacy-safe identity backbone so it can run its own server-to-server
CAPI, win outcome budgets back, and give its advertisers a clean data bridge.

The tool asks only what a publisher actually knows (annual open-web ad revenue and
vertical), derives everything technical internally, and shows the **incremental
annual ad revenue** standing up their own CAPI could be worth — then invites them
to book a meeting. It is designed to be **iframed into adfixus.com**.

## The guided flow (the visible surface)

`src/components/SalesPlanApp.tsx` renders an Apple-grade guided flow — smart
defaults, almost no input, all depth one link away:

1. **Provocation** (`flow/Provocation.tsx`) — *"Walled gardens took about half of
   open-web ad revenue with one thing you do not have: your own Conversions API."*
2. **Ask · revenue** (`flow/AskStep.tsx` + `flow/RevenueControl.tsx`) — one slider:
   annual open-web ad revenue (default ~$20M; a *traffic + CPM* alternative derives
   it).
3. **Ask · vertical** (`flow/AskStep.tsx` + `flow/VerticalControl.tsx`) — a
   segmented choice that sets the conversion framing and the default addressable
   share.
4. **Reveal** (`flow/Reveal.tsx` + `bridge/SignalBridge.tsx`) — the animated CAPI
   bridge (real conversion events flowing back as measurable outcomes), one hero
   number (total incremental annual ad revenue), the three-lever breakdown, a
   Carsales benchmark line, one CTA (Book a meeting), and a quiet **"See the full
   model"** link.

That link opens `flow/DepthDrawer.tsx` → **`depth/CommercialDepth.tsx`**, which
holds all the detail and **reconciles to the same headline number**: the three
levers restated and adjustable (`depth/LeverSliders`, `depth/LeverBreakdown`), the
three-year ramp (`depth/ThreeYearRamp`), the three deal models — what you pay
AdFixus vs keep NET (`depth/DealComparison`), and the $30K-cap per-campaign
economics (`depth/CapCampaignTable`).

## Architecture — where the math lives

- **100% client-side.** No backend, no login, no database, no secrets.
- **The whole visible surface reads from one hook.** `SalesPlanApp` and the depth
  drawer both consume `src/hooks/useCapiRoi.ts`, which holds the inputs and lever
  assumptions and derives BOTH the headline and the commercial pricing — so they
  always reconcile.
- **The headline model** is `src/lib/capiRoi.ts` (`calculateCapiRoi`): three
  non-overlapping levers (win-back, CPM uplift, retention) on publisher-knowable
  inputs. Every number traces to an input or a named, adjustable assumption.
- **The commercial pricing** is `src/lib/capiCommercial.ts` (`priceCapiRoi`): it
  takes the SAME `totalIncremental` and prices it against three deal models
  (revenue-share with a **$30K/campaign/month cap**, annual cap, flat fee). The
  per-campaign cap math reuses `src/utils/campaignEconomicsCalculator.ts` (ported
  from the Vox engine); the campaign shape is derived from `addressable`, so the
  cap table reconciles to the same inputs.
- **No lead capture.** The single CTA opens the booking link
  (`VITE_MEETING_BOOKING_URL`) in a new tab; there is no form, no localStorage
  store, no PII.
- The shared `src/core` engine is retained for the tool family and for the
  `core/embed` iframe module, but the CAPI ROI path no longer routes through it —
  the model is self-contained in `src/lib`.

## How to change assumptions / benchmarks

- **The three levers and their default rates** (`winBackRate` 0.22, `enrichedShare`
  0.35, `cpmUplift` 0.15, `retentionValue` 0.08) and the per-vertical defaults live
  in `src/lib/capiRoi.ts` (`DEFAULT_ASSUMPTIONS`, `VERTICALS`). Each is also a live
  slider in the drawer (`depth/LeverSliders.tsx`).
- **The deal models** (12.5% share, $30K/campaign/month cap, $1.2M annual cap, $1M
  flat fee) live in `src/lib/capiCommercial.ts` (`DEAL_PARAMS`); the per-campaign
  cap constants (`REVENUE_SHARE_RATE`, `CAMPAIGN_CAP`, `CONVERSION_IMPROVEMENT`,
  `CAP_THRESHOLD`) live in `src/types/campaignEconomics.ts`.
- **The three-year ramp** factors are `RAMP_YEARS` in `src/lib/capiRoi.ts`.
- The deal models shown here are the *publisher's* revenue split (what they pay
  AdFixus vs keep), not an AdFixus rate-card quote.

## Design system

Dark theme, AdFixus bright-cyan accent — **identical** to the other two tools. HSL
tokens in `src/index.css` (`:root`) + `tailwind.config.ts`: `--background: 0 0% 0%`
(black), `--primary: 195 95% 50%` (cyan), `--primary-glow: 195 95% 60%`,
`--card: 0 0% 6%`, `--radius: 1rem`; body font **Montserrat** (Google Fonts
`<link>` in `index.html`). The shared guided-flow shell (`src/components/flow/*`)
is kept byte-identical across the three tools so they feel like one family. Full
token list + utility classes in the core spec §4.

## What you need to do next

1. **Run it:** `npm install && npm run dev` (port 8080). No env needed.
2. **Verify the math:** open the drawer and confirm the three levers sum to the
   headline, and the deal models all price the same `totalIncremental`
   (README has a worked $20M / auto / 40% example).
3. **Check quality:** `npm run build` and `npm run lint` both pass. The only lint
   warnings left are `react-refresh/only-export-components` in vendored shadcn/ui
   primitives and the shared `FlowShell` — expected and safe to leave.
4. **Deploy:** static SPA on Vercel (preset Vite, output `dist/`) or any static
   host; add the SPA rewrite `/* → /index.html`. Public — no auth.
5. **Embed on adfixus.com:** use the iframe + `message` snippet from the core spec
   (§5); it auto-resizes.

## Ideas for development

- Add a "see the ID-durability story too" CTA into the id-simulator (the engine
  already computes both under `id-capi`).
- Let a prospect toggle deal-model inputs (share %, cap) live in the drawer and
  watch the 36-month projection update.
- Shareable permalinks; light analytics; A/B-tested provocation copy.
- Promote `src/core/` to a shared private npm package across the three repos
  (today it's vendored identically — see core spec §7).
