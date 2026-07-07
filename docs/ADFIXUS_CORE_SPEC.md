# AdFixus Core: Canonical Specification

**This file is the single source of truth for the shared design system, the
calculation engine (math + assumptions), the `AssumptionOverrides` surface, and
the iframe-embedding protocol used across all three AdFixus tools.** It is
vendored, byte-identical, into each repo at `docs/ADFIXUS_CORE_SPEC.md`. If you
change the core, change it here and re-sync `src/core/` into every repo (see
section 7, Keeping repos in sync).

---

## 1. The three tools (which one draws which slice)

| Repo | Audience | Purpose | Draws |
|------|----------|---------|-------|
| **adfixus-id-simulator** | Public lead magnet | Measure **ID durability** for an open-web publisher, via the shared engine (`calculateIdDurability`, scope `id-only`) | `results.idInfrastructure` (Safari addressability recovery + CPM delta + CDP savings) |
| **adfixus-capi-calculator** | Public lead magnet | **The publisher CAPI ROI tool**, what standing up your own Conversions API is worth, via a self-contained 3-lever model (`src/lib/capiRoi.ts`) + commercial deal models behind a depth drawer | `totalIncremental` (3 levers: win-back, CPM uplift, retention) + revenue-share / annual-cap / flat-fee deal models |
| **adfixus-sales** | Internal (team-only) | **Target Business Report Card**, live enrichment + v6 rubric + full ROI/commercial, via the shared engine (scope `id-capi-performance`) | the full stack + `pricingConfig` + commercial modelling |

All three are React 18 + Vite + TypeScript + Tailwind + shadcn/ui, share the
**guided-flow shell** (`src/components/flow/*`: provocation, one question, reveal,
depth drawer), and are **iframe-embeddable into adfixus.com**.

- The **two lead magnets are 100% client-side**: no backend, no login, no secrets,
  no lead form, no PDF. Their single CTA opens a booking link
  (`VITE_MEETING_BOOKING_URL`); there is no form and no lead store.
- **adfixus-sales has a serverless backend** (Vercel `api/*`) that holds all the
  third-party enrichment keys server-side and is reached through
  `src/lib/proxyClient.ts`. It is **team-only**, served behind Vercel
  authentication on `adfixus-sales.vercel.app`; confidential data lives only
  behind the proxy, never in the client bundle or the repo. See **docs/PROXY.md**
  (adfixus-sales only) for the endpoint + env-var runbook.

> **Note on the CAPI tool and the shared engine.** The id-simulator and sales tools
> compute their headline through the shared `src/core` engine. The capi-calculator
> computes its headline through a self-contained model in `src/lib/capiRoi.ts`
> (documented in section 3.6), because a publisher never knows the technical inputs
> the engine needs (match rate, campaign shape). It still vendors `src/core` for the
> shared design tokens, the guided-flow shell, and the embed module, and it reuses
> the ported $30K-cap campaign economics (section 3.7).

---

## 2. The AdFixus core (`src/core/`)

Vendored identically into each repo. Import via the `@/core` alias.

```
src/core/
  engine/
    unifiedCalculationEngine.ts   # the ROI engine
    domainAggregation.ts          # aggregate 1..N domains, weighted by pageviews
    index.ts                      # public API + convenience wrappers
  constants/
    benchmarks.ts                 # industry benchmarks (addressability, CAPI, media, operational)
    riskScenarios.ts              # conservative / moderate / optimistic multipliers
    readinessFactors.ts           # 8 business-readiness factors + presets
    pricingConfig.ts              # editable AdFixus rate card (SALES ONLY, never in a lead magnet)
  types/
    domain.ts                     # CoreDomain + singleDomain() helper
    scenarios.ts                  # inputs / results / scenario / AssumptionOverrides types
  embed/embed.ts                  # iframe height-reporting module
  selfcheck.ts                    # dependency-free golden-values test
  index.ts                        # re-exports everything above
```

> The core is shared benefit math + embed + design. Lead capture is **not** part
> of it: the two public lead magnets use a booking-link CTA, not a form. A tool
> that needs to persist leads adds its own adapter (see section 6).

### 2.1 Engine API

**Convenience wrappers (lead magnets)**: benefits only, no pricing, from a handful
of simple inputs (`SimpleSiteInputs`):

```ts
import { calculateIdDurability, calculateCapiBenefits } from '@/core';

// id-simulator (scope 'id-only'): read result.idInfrastructure
const id = calculateIdDurability({
  monthlyPageviews: 5_000_000,
  displayCPM: 4.5, videoCPM: 12,
  adsPerPage: 3.2, displayVideoSplit: 80, safariShare: 0.35,
});
id.idInfrastructure.monthlyUplift; // headline ID-durability number

// engine CAPI slice (scope 'id-capi'): read result.capiCapabilities
// (Used by sales and by the core self-check. The capi-calculator lead magnet
//  does NOT use this for its headline; see section 3.6.)
const capi = calculateCapiBenefits({ monthlyPageviews: 5_000_000, capiLineItemShare: 0.6 });
capi.capiCapabilities.monthlyUplift; // engine CAPI incremental
```

Both wrappers accept an optional second arg `{ deployment?, risk?, overrides? }`.

**Full engine (sales)**: the one call everything else is built on:

```ts
import { UnifiedCalculationEngine, singleDomain, DEFAULT_PRICING } from '@/core';

const results = UnifiedCalculationEngine.calculate(
  inputs,      // { domains: CoreDomain[], displayCPM, videoCPM, capiLineItemShare, ... }
  scenario,    // { deployment: 'single' | 'multi' | 'full', scope: 'id-only' | 'id-capi' | 'id-capi-performance' }
  risk,        // 'conservative' | 'moderate' | 'optimistic'
  overrides,   // AssumptionOverrides | undefined  (readiness sliders + benchmark/pricing overrides)
  pricing,     // PricingConfig | undefined  (sales only; every field is a UI slider)
);
```

Signature:
`UnifiedCalculationEngine.calculate(inputs, scenario, risk, overrides?, pricing?) -> UnifiedResults`

`scope` selects the benefit stack:
- `id-only`: **ID Infrastructure** only.
- `id-capi`: + **CAPI Capabilities**.
- `id-capi-performance`: + **Media Performance**.

`UnifiedCalculationEngine.generateMonthlyProjection(results)` returns the
month-by-month ramp used by the charts.

### 2.2 The `AssumptionOverrides` surface

The 4th argument lets any tool override defaults without editing the core. It is
a partial, deep-mergeable object (see `types/scenarios.ts`) covering:

- **ID Infrastructure overrides**: `safariBaselineAddressability`,
  `safariWithDurableId`, `targetSafariAddressability`, `cpmUpliftFactor`,
  `cdpCostReduction`.
- **CAPI overrides**: `capiServiceFee`, `capiMatchRate`, `capiYearlyCampaigns`,
  `capiAvgCampaignSpend`, `capiLineItemShare`.
- **Media Performance overrides**: `premiumInventoryShare`, `premiumYieldUplift`.
- **`readinessFactors`**: a nested object of the 8 business-readiness sliders
  (`salesReadiness`, `technicalDeploymentMonths`, `advertiserBuyIn`,
  `organizationalOwnership`, `marketConditions`, `trainingGaps`,
  `integrationDelays`, `resourceAvailability`). These modulate risk-scenario
  efficiency and, for CAPI, drive campaign volume/spend multipliers. Presets
  live in `constants/readinessFactors.ts`.

Pricing is **not** part of `AssumptionOverrides`; it is the separate 5th argument
`PricingConfig` and is used only by the sales tool.

---

## 3. Formulas & assumptions

Sections 3.1 to 3.5 describe the **shared engine** (used by id-simulator and sales).
Sections 3.6 and 3.7 describe the **capi-calculator's self-contained CAPI ROI
model**, which does not route through the engine.

The engine models three stacked benefit categories. Each is computed at "base",
then multiplied by (a) risk-scenario efficiency factors, then (b) the adoption
rate, then (c) a deployment multiplier. Totals are the sum of adopted components.

### 3.1 ID Infrastructure (always included)
- Impressions = `pageviews x adsPerPage`; split display/video by `displayVideoSplit`.
- Current revenue = `(displayImpr/1000) x displayCPM + (videoImpr/1000) x videoCPM`.
- **Safari addressability recovery:** newly-addressable Safari impressions =
  `impressions x SAFARI_SHARE(0.35) x safariAddressabilityImprovement`
  where improvement = `targetSafariAddressability(default 0.35) - 0`.
- **CPM uplift is a delta, not the full CPM.** Newly-addressable Safari inventory
  today earns *contextual* CPM (`CONTEXTUAL_CPM_RATIO = 0.72` of addressable). The
  uplift is `addressableCPM - contextualCPM` where `addressableCPM = CPM x (1 + CPM_IMPROVEMENT_FACTOR 0.25)`.
- **CDP savings:** fixed `CDP_MONTHLY_SAVINGS = $3,500/mo` (configurable).
- Total addressability moves from `BASELINE_TOTAL_ADDRESSABILITY = 65%` to `65% + SAFARI_SHARE x improvement` (about 72 to 77%).

### 3.2 CAPI Capabilities in the engine (`id-capi`, `id-capi-performance`)
- Match rate improves `BASELINE_MATCH_RATE 30%` to `IMPROVED_MATCH_RATE 75%`.
- Campaign volume is an **output** of Business Readiness, not a manual input:
  `BASE_YEARLY_CAMPAIGNS 12 x volumeMultiplier` (bounded 0.7 to 1.4x), `BASE_AVG_CAMPAIGN_SPEND $75K x spendMultiplier` (up to 1.15x), distributed across 12 months (POC-then-scale campaign ramp).
- CAPI-eligible spend = `monthlyCampaignSpend x capiLineItemShare`.
- Conversion uplift = `CONVERSION_RATE_MULTIPLIER 1.40 - 1` (i.e. +40%).
- Net publisher benefit = `conversionTrackingRevenue + labourSavings - serviceFees`,
  where labour savings = `40 hrs x $75`, service fee = `improvedEligibleSpend x capiServiceFeeRate (0.125)`.

> This engine CAPI slice is used by **adfixus-sales** and by the core self-check.
> The **capi-calculator** does not use it for its headline; see section 3.6.

### 3.3 Media Performance (`id-capi-performance` only)
- Premium yield = `premiumImpressions(PREMIUM_INVENTORY_SHARE 0.20) x CPM x YIELD_UPLIFT 0.15`.
- Make-good savings = `directSold(0.40 of revenue) x (BASELINE_MAKEGOOD 0.05 - IMPROVED_MAKEGOOD 0.02)`.
- ROAS improves `2.5` to `3.5` (reporting only).

### 3.4 Risk scenarios (efficiency + adoption)
`conservative / moderate / optimistic` scale ramp-up months, adoption rate,
addressability efficiency, CAPI deployment rate, CPM-uplift realization, sales
effectiveness, and CDP-savings realization. See `constants/riskScenarios.ts` for
exact values. Readiness factors (`constants/readinessFactors.ts`, 8 sliders) further
modulate these and drive CAPI campaign volume.

### 3.5 Golden values (engine regression guard)
For inputs `{5,000,000 pageviews, $4.50 display / $12 video CPM, 3.2 ads/page, 80% display, 35% Safari}`, moderate risk:

| Metric | Value |
|--------|-------|
| Current monthly revenue | **$96,000** |
| ID-only monthly uplift | **$5,298** |
| Improved addressability | **77.3%** |
| CDP monthly savings | **$3,500** |
| CAPI monthly uplift (id-capi) | **$6,488** |

Run the check in any repo:
```bash
npx esbuild src/core/selfcheck.ts --bundle --platform=node --format=cjs \
  --outfile=/tmp/afx.cjs && node /tmp/afx.cjs
```
It exits non-zero if any value drifts. Because `src/core/` is byte-identical in
every repo, all three produce identical numbers by construction.

### 3.6 The capi-calculator CAPI ROI model (`src/lib/capiRoi.ts`)

The capi-calculator computes its headline from a single publisher-knowable anchor,
not from the engine. This is deliberate: a publisher never knows their match rate,
campaign count, or addressability, so nothing technical is asked. **The tool never
asks for a match rate, and never demands a revenue figure.**

Surface inputs (the only things asked in the guided flow): the advertiser anchor,
`flagshipSpend` (the single biggest advertiser's annual spend) plus a `bookScale`
segmented choice (`BOOK_SCALES`: handful / dozens / hundreds to factors 5 / 12 / 30).
`annualAdRevenue` is ESTIMATED via `deriveRevenueFromBook(flagshipSpend, bookScale)`
(default 'dozens' gives about $12M) and is overridable only in the explore panel;
`vertical` and `performanceShare` have per-vertical defaults and are adjustable there
too.

```
addressable      = annualAdRevenue x performanceShare      (direct-sold / performance book)

Lever A win-back = addressable x winBackRate               (0.22; Carsales CAPI track +22%)
Lever B CPM      = (annualAdRevenue x enrichedShare) x cpmUplift   (0.35 x 0.15; deck +15% CPM)
Lever C retention= addressable x retentionValue            (0.08; from +40% campaign retention)

totalIncremental = A + B + C          <- the headline
```

Default assumption rates (`DEFAULT_ASSUMPTIONS`): `winBackRate` 0.22, `enrichedShare`
0.35, `cpmUplift` 0.15, `retentionValue` 0.08. Per-vertical default performance share
(`VERTICALS`): auto 0.50, education 0.45, retail 0.50, finance 0.45, travel 0.45,
other 0.40. The rates are not exposed as raw sliders (they are meaningless to a
revenue leader); a single **Cautious / Balanced / Bold** dial in the explore panel
(`ESTIMATE_STANCES`, Balanced == the defaults) scales all three levers together, and
each lever card still shows its exact basis, so every figure traces to an input or a
named, adjustable assumption. The levers are non-overlapping: A
prices budget on the addressable book, B prices an inventory premium on a different
slice, C prices durability of the book over time. A three-year ramp
(`RAMP_YEARS` 0.55 / 1.0 / 1.2) projects the same total forward.

Worked example ($20M, auto, 40% performance share): addressable $8.0M, A $1.76M,
B $1.05M, C $0.64M, `totalIncremental` $3.45M/yr.

### 3.7 The commercial deal models (`src/lib/capiCommercial.ts`)

`priceCapiRoi` takes the SAME `totalIncremental` and prices it three ways, so the
drawer decomposes and prices the headline rather than showing a second number:

- **Revenue share (recommended):** 12.5% of CAPI incremental, with a
  **$30K/campaign/month cap** (fully aligned; the "magic of the cap" for large
  advertisers). Its `DealModel.label` is `Revenue share`; the cap is conveyed in the
  card tagline.
- **Annual cap:** 12.5% up to a $1.2M Year-1 cap, then 100% to the publisher.
- **Flat fee:** a fixed $1M annual fee regardless of performance.

The campaign shape (avg spend + count) that feeds the $30K-cap table is derived from
`addressable` (`deriveCampaignShape`), so the cap table reconciles to the same
inputs. The per-campaign cap math reuses the ported Vox economics in
`src/utils/campaignEconomicsCalculator.ts` with the constants in
`src/types/campaignEconomics.ts` (`REVENUE_SHARE_RATE` 12.5%, `CAMPAIGN_CAP` $30K,
`CONVERSION_IMPROVEMENT` 40%, `CAP_THRESHOLD` $600K). These deal models are the
*publisher's* revenue split (what they pay AdFixus vs keep), not an AdFixus rate-card
quote.

---

## 4. Design system (canonical)

Dark theme, AdFixus bright-cyan accent. Defined as HSL tokens in each repo's
`src/index.css` (`:root`) with a matching `tailwind.config.ts`. Both files are
**identical across the three repos**; copy, do not diverge.

Key tokens: `--background: 0 0% 0%` (black), `--foreground: 0 0% 100%`,
`--primary: 195 95% 50%` (cyan), `--primary-glow: 195 95% 60%`, `--radius: 1rem`,
`--card: 0 0% 6%`, semantic `--success / --warning / --error`, status
`--revenue-gain / --revenue-loss`. Body font: **Montserrat** (loaded via Google
Fonts `<link>` in `index.html`). Utility classes: `.glass-card`, `.gradient-text`,
`.btn-gradient`, `.hero-gradient`, `.shimmer`, `.animate-fade-in`.

> Note: adfixus.com is currently a *light* site. The dark-cyan look is canonical.
> If seamless blending into the live site becomes the priority, flip the token
> values in `src/index.css` (one file) to a light variant; nothing else needs to
> change.

---

## 5. Iframe embedding protocol

Every tool calls `initAdfixusEmbed({ appName })` in `src/main.tsx` (this repo uses
`appName: 'AdFixus-CAPI-Calculator'`). The module (`src/core/embed/embed.ts`)
reports content height to the parent via `postMessage` so the parent iframe resizes
to fit (no inner scrollbar). It validates the parent origin (default
`https://www.adfixus.com`), throttles with a `ResizeObserver`, guards against
feedback loops (only sends when height changes more than 10px, capped at `maxHeight`
5000px), and answers `ping` (returns `pong`) and `requestHeight` messages.

**Child to parent message:** `{ type: 'setHeight', height: <px>, source: <appName>, trigger }`.

**Parent-page snippet (put on adfixus.com):**
```html
<iframe id="afx" src="https://YOUR-HOST/" style="width:100%;border:0;" scrolling="no"></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://YOUR-HOST') return;
    if (e.data?.type === 'setHeight') {
      document.getElementById('afx').style.height = e.data.height + 'px';
    }
  });
  // Optional: ask the child to (re)report its height after your layout settles.
  // document.getElementById('afx').contentWindow.postMessage({ type: 'requestHeight' }, 'https://YOUR-HOST');
</script>
```
`initAdfixusEmbed` defaults `parentOrigin` to `https://www.adfixus.com`. To embed
on another origin, pass `initAdfixusEmbed({ appName, parentOrigin })`.

---

## 6. Lead capture & PDF

- **Lead capture is tool-specific, not part of the core.** The two public lead
  magnets do **not** collect a form and do **not** generate a PDF; their single CTA
  opens the booking link (`VITE_MEETING_BOOKING_URL`) in a new tab. A tool that
  needs to persist leads (e.g. **adfixus-sales**) adds its own adapter (client-side
  `localStorage`, or a server-side `POST /api/lead` via Resend through its proxy),
  keeping any credentials server-side, never in a `VITE_` var.
- **PDF** is a sales-tool concern only. The capi-calculator's rich detail lives
  inside the **"Explore the full model"** depth panel as live, reconciling UI; it does
  not export a file. (An unused `pdfmake` dependency may remain in
  `package.json`; there is no PDF code on the CAPI path.)

---

## 7. Keeping repos in sync

The **shared engine + design** must stay **identical** across the three repos:
`src/core/engine/`, `src/core/constants/`, `src/core/types/`,
`src/core/embed/embed.ts`, `src/core/selfcheck.ts`, `src/index.css`,
`tailwind.config.ts`, and this `docs/ADFIXUS_CORE_SPEC.md`. When you change one,
copy it to the others and run the self-check in each.

> **Divergence note (capi-calculator).** The guided-flow shell
> `src/components/flow/*` was historically kept byte-identical across the three
> tools, but **this repo has intentionally diverged it** for the no-scroll iframe +
> result-dominant redesign: `FlowShell` gained a `showWordmark` prop, `Reveal` was
> restructured (`hero` / `meaning` / `highlights` / `cta` / `exploreAction` /
> `visual`), `AskStep` and `DepthDrawer` (now tabbed, no-scroll) were reworked, and
> the file set changed (`AdvertiserControl` added; `RevenueControl` /
> `VerticalControl` removed). Keep the motion, timing, and design tokens aligned
> with the family, but the shell is no longer synced verbatim here.

Tool-specific pieces are **not** synced: each tool's headline model and hook (for
the capi-calculator, `src/lib/capiRoi.ts` + `src/lib/capiCommercial.ts` +
`src/hooks/useCapiRoi.ts`), its bridge/depth components, any lead adapter, and its
scope. There is deliberately no shared npm package (kept simple for handover);
promoting the core to a private package is a good future step.
