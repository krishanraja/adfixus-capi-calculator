# Handover — adfixus-capi-calculator (CAPI Sales-Plan Simulator)

## The AdFixus tool family (read this first)

You are taking over **three** related tools that share one brand, one design
system, and one calculation engine (`src/core`):

| Repo | What it is | Access |
|------|------------|--------|
| **adfixus-id-simulator** | Public lead magnet — configurable **ID durability** simulator | Public, embeddable |
| **adfixus-capi-calculator** (this repo) | Public lead magnet — **CAPI Sales-Plan** simulator (ramp + deal models) | Public, embeddable |
| **adfixus-sales** | Internal **Target Business Report Card** (live enrichment + v6 rubric) | Team-only (Vercel SSO) |

The shared engine, design tokens, and embedding protocol are documented once, for
all three, in **[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** (identical
in every repo).

## What this repo is for

A publisher enters a few business metrics and gets a concrete **CAPI sales plan**:
match-rate lift (30% → 75%), a POC-to-scale **campaign ramp**, the incremental
CAPI revenue, the **$30K-per-campaign-cap** economics, and a side-by-side
comparison of three **commercial deal models** (revenue-share / annual-cap /
flat-fee) — with a downloadable PDF. It is designed to be **iframed into
adfixus.com** as a lead magnet.

## Architecture — where the math lives

- **100% client-side.** No backend, no login, no secrets.
- **Core benefit math lives in `src/core`.** The UI hook
  `src/hooks/useSalesPlan.ts` calls `calculateCapiBenefits(inputs, { risk,
  overrides })` from `@/core` (scope `id-capi`) and reads
  `results.capiCapabilities`. Charts use
  `UnifiedCalculationEngine.generateMonthlyProjection(results)`.
- **Sales-plan / commercial math lives in `src/utils`:**
  - `campaignEconomicsCalculator.ts` — the campaign ramp + per-campaign economics
    (incl. the $30K monthly cap).
  - `commercialCalculations.ts` + `src/types/commercialModel.ts` — the three deal
    models, a 36-month projection, and the incentive-alignment scoring. **The 12.5%
    share applies to CAPI incremental revenue only** — never the full deal.
- **UI:** `src/components/salesplan/*` (inputs, campaign ramp, plan summary,
  mobilize-sales-team) and `src/components/commercial/*` (scenario cards, revenue
  isolation, cumulative-revenue chart, incentive-alignment indicator).
- **Leads:** captured to `localStorage["adfixus_leads"]` via the pluggable
  `leadAdapter`; swap in a CRM later without touching the UI.

## How to change assumptions / benchmarks

- **CAPI benefit assumptions** (match rate, conversion multiplier, service-fee
  rate, campaign volume/spend): `src/core/constants/benchmarks.ts` and the
  readiness-driven volume model; or override per-run via `AssumptionOverrides`
  (core spec §2.2). Re-run the golden-values self-check after (core spec §3.5).
- **Deal models** (share %, caps/floors, flat fee, ramp curve): the constants at
  the top of `src/types/commercialModel.ts` and the `RAMP_UP_CURVE` in
  `src/utils/commercialCalculations.ts`. The **$30K/campaign monthly cap** default
  is `capiCampaignCapMonthly` in `src/core/constants/pricingConfig.ts`.
- This repo is `id-capi`, so it never renders ID-Infrastructure or Media
  Performance slices; keep the pricing rate card (`pricingConfig`) out of the
  public UI — the deal-model economics here are the publisher's revenue split, not
  the AdFixus rate card.

## Design system

Dark theme, AdFixus bright-cyan accent — **identical** to the other two tools. HSL
tokens in `src/index.css` (`:root`) + `tailwind.config.ts`: `--background: 0 0% 0%`
(black), `--primary: 195 95% 50%` (cyan), `--primary-glow: 195 95% 60%`,
`--card: 0 0% 6%`, `--radius: 1rem`; body font **Montserrat** (Google Fonts
`<link>` in `index.html`). The PDF generator is re-skinned to match. Full token
list + utility classes in the core spec §4.

## What you need to do next

1. **Run it:** `npm install && npm run dev` (port 8080). No env needed.
2. **Verify the math:** run the golden-values self-check (README / core spec §3.5).
3. **Deploy:** static SPA on Vercel (preset Vite, output `dist/`) or any static
   host; add the SPA rewrite `/* → /index.html`. Public — no auth.
4. **Embed on adfixus.com:** use the iframe + `message` snippet from the core spec
   (§5); it auto-resizes.

## Ideas for development

- Show the ID-durability + CAPI stories together (the engine computes both under
  `id-capi`), with a "see the full picture" CTA into the id-simulator.
- Let a prospect toggle deal-model inputs (share %, cap) live and watch the
  36-month projection update.
- Shareable permalinks; light analytics; A/B-tested framing.
- Promote `src/core/` to a shared private npm package across the three repos (today
  it's vendored identically — see core spec §7).
