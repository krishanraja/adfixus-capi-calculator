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

A public, embeddable **lead magnet** built around one idea: **CAPI is the data
bridge between a publisher and its advertisers**, and today that bridge is broken
for the anonymous majority (Safari/ITP, logged-out visitors, the wider open web).
The conversions happen; advertisers can't attribute them, so budget drifts away.

The tool shows a publisher what **restoring that signal** (a durable,
verified-human ID at the edge + CAPI) is worth in incremental annual revenue,
then invites them to book a meeting. It is designed to be **iframed into
adfixus.com**.

## The guided flow (the visible surface)

`src/components/SalesPlanApp.tsx` renders an Apple-grade, three-screen flow —
almost no input, all depth one link away:

1. **Provocation** (`flow/Provocation.tsx`) — the broken-signal insight.
2. **One question** (`flow/AskStep.tsx` + `flow/MatchRateControl.tsx`) — a single
   slider: how much of the conversion signal a durable ID could restore
   (~30% → 75%+). **This is the only lever the visitor touches.**
3. **Reveal** (`flow/Reveal.tsx` + `bridge/SignalBridge.tsx`) — the animated
   publisher↔advertiser bridge, one hero number (net incremental annual publisher
   revenue), one CTA (Book a meeting), and a quiet **"See the full plan"** link.

That link opens `flow/DepthDrawer.tsx` → **`salesplan/FullPlan.tsx`**, which holds
ALL the existing depth: the bridge narrative (`bridge/BridgeHero`,
`bridge/SignalCoverage`), the fully-configurable inputs, the campaign ramp, the
per-campaign ($30K-cap) economics, the three commercial deal models, and the PDF
download. Nothing was removed in the guided-flow rebuild — it was demoted.

## Architecture — where the math lives

- **100% client-side.** No backend, no login, no database, no secrets.
- **The whole visible surface reads from one hook.** `SalesPlanApp` and `FullPlan`
  both consume `src/hooks/useSalesPlan.ts`, which turns the inputs into a call to
  `calculateCapiBenefits(inputs, { risk, overrides })` from `@/core` (scope
  `id-capi`) and reads `results.capiCapabilities`. The reveal's hero number is
  `getCapiMonthlyIncremental(results) × 12 × (1 − serviceFeeRate)`.
- **Core benefit math lives in `src/core`** — the shared, verified engine
  (identical across the three tools). Charts use
  `UnifiedCalculationEngine.generateMonthlyProjection(results)`.
- **Sales-plan / commercial math lives in `src/utils`** (only surfaced inside the
  depth drawer):
  - `campaignEconomicsCalculator.ts` — campaign ramp + per-campaign economics
    (incl. the $30K monthly cap).
  - `commercialCalculations.ts` + `src/types/commercialModel.ts` — the three deal
    models, a 36-month projection, and incentive-alignment scoring. **The 12.5%
    share applies to CAPI incremental revenue only** — never the full deal.
- **No lead capture.** The guided flow's single CTA opens the booking link
  (`VITE_MEETING_BOOKING_URL`) in a new tab; there is no form, no localStorage
  lead store, no PII. (The older `leadAdapter` was removed in the cleanup.)

## How to change assumptions / benchmarks

- **CAPI benefit assumptions** (match rate, conversion multiplier, service-fee
  rate, campaign volume/spend): `src/core/constants/benchmarks.ts` and the
  readiness-driven volume model; or override per-run via `AssumptionOverrides`
  (core spec §2.2). Re-run the golden-values self-check after (core spec §3.5).
- **Deal models** (share %, caps/floors, flat fee, ramp curve): the constants at
  the top of `src/types/commercialModel.ts` and the `RAMP_UP_CURVE` in
  `src/utils/commercialCalculations.ts`. The **$30K/campaign monthly cap** default
  is `capiCampaignCapMonthly` in `src/core/constants/pricingConfig.ts`.
- **The baseline vs. restored match rate** shown throughout the flow:
  `BASELINE_MATCH_RATE` and `DEFAULT_INPUTS.matchRateImproved` in
  `src/hooks/useSalesPlan.ts`.
- This repo is scope `id-capi`, so it never renders ID-Infrastructure or Media
  Performance slices, and it never imports the AdFixus rate card (`pricingConfig`)
  into the UI — the deal models shown here are the *publisher's* revenue split,
  not the AdFixus quote.

## Design system

Dark theme, AdFixus bright-cyan accent — **identical** to the other two tools. HSL
tokens in `src/index.css` (`:root`) + `tailwind.config.ts`: `--background: 0 0% 0%`
(black), `--primary: 195 95% 50%` (cyan), `--primary-glow: 195 95% 60%`,
`--card: 0 0% 6%`, `--radius: 1rem`; body font **Montserrat** (Google Fonts
`<link>` in `index.html`). The PDF generator is re-skinned to match. The shared
guided-flow shell (`src/components/flow/*`) is kept byte-identical across the three
tools so they feel like one family. Full token list + utility classes in the core
spec §4.

## What you need to do next

1. **Run it:** `npm install && npm run dev` (port 8080). No env needed.
2. **Verify the math:** run the golden-values self-check (README / core spec §3.5).
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
