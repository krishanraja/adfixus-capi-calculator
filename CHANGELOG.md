# Changelog

All notable changes to **adfixus-capi-calculator**, the public AdFixus lead magnet
for **the publisher CAPI ROI tool** (what standing up your own Conversions API is
worth).

> **Current architecture (authoritative):** a 100% client-side React SPA with an
> Apple-grade guided flow (provocation, annual-ad-revenue slider, vertical, reveal,
> depth drawer). It asks only publisher-knowable inputs and **never asks for a
> match rate**. The headline is a self-contained **3-lever CAPI ROI model** in
> `src/lib/capiRoi.ts` (win-back + CPM uplift + retention on publisher-knowable
> inputs); `src/lib/capiCommercial.ts` prices that same total against three deal
> models (revenue-share with a $30K/campaign/month cap, annual cap, flat fee),
> reusing the $30K-cap economics in `src/utils/campaignEconomicsCalculator.ts`.
> Everything reads from one hook (`src/hooks/useCapiRoi.ts`), so headline and drawer
> always reconcile. Iframe-embeddable into adfixus.com. **No backend, no login, no
> lead form, no PDF, no secrets.** Older entries below predate the current build.

---

## [5.0.0] - Publisher-knowable CAPI ROI model (current, commit f6394ec)

### Changed
- **Rebuilt the tool around inputs a publisher actually knows.** Removed the "match
  rate" input (no publisher knows their match rate) and the meaningless hero number.
  The surface now asks only annual open-web ad revenue and vertical; the direct-sold
  / performance share is a slider in the drawer, and everything else technical
  (addressability, campaign shape) is derived internally. **The tool never asks for
  a match rate.**
- **New headline model** `src/lib/capiRoi.ts` (`calculateCapiRoi`): three
  non-overlapping levers on `addressable = annualAdRevenue x performanceShare`.
  A win-back (`addressable x winBackRate` 0.22, Carsales +22%), B higher CPM
  (`annualAdRevenue x enrichedShare` 0.35 `x cpmUplift` 0.15, deck +15%), C retention
  (`addressable x retentionValue` 0.08, from +40% retention). The hero reveal is
  their sum, with a live three-lever breakdown. Every figure traces to an input or a
  named, adjustable assumption.
- **Per-vertical profiles** (`VERTICALS`) set the default performance share (auto
  0.50, education 0.45, retail 0.50, finance 0.45, travel 0.45, other 0.40) and the
  conversion framing; the lever rates themselves are vertical-agnostic so the model
  stays legible.
- **New commercial pricing** `src/lib/capiCommercial.ts` (`priceCapiRoi`): prices the
  same `totalIncremental` against revenue-share (12.5%, $30K/campaign/month cap),
  annual cap ($1.2M), and flat fee ($1M), so the drawer decomposes and prices the
  headline rather than showing a second number. Campaign shape is derived from
  `addressable` via `deriveCampaignShape`.
- **Depth drawer** (`depth/CommercialDepth.tsx`) decomposes and prices the SAME
  headline: the three levers (adjustable via `depth/LeverSliders`), the three-year
  ramp (0.55 / 1.0 / 1.2), the three deal models (`depth/DealComparison`), and the
  $30K-cap per-campaign economics grounded in the addressable book
  (`depth/CapCampaignTable`). Headline and drawer reconcile.
- **Rewrote the signal-bridge copy and visual** to be concrete (real conversion
  events flowing back to the advertiser). Bridge intensity is derived from the
  addressable share of the book, never a fabricated "match rate". Removed the
  fabricated "conversions seen 77%" meter and every number not derived from inputs.

### Removed
- The old match-rate surface: `useSalesPlan`, `salesplan/*`, `commercial/*`,
  `bridge/BridgeHero` + `bridge/SignalCoverage`, `flow/MatchRateControl`, the PDF
  generator, `commercialCalculations.ts`, `types/commercialModel.ts`, and the
  now-unused `formatting.ts`. The public tool no longer produces a PDF.

---

## [4.0.0] - Production cleanup

### Removed
- **Dead code:** the unused `Navigation.tsx`, `src/App.css`, `use-mobile`, the
  unused `leadAdapter` (the guided flow captures no leads), about 30 unreferenced
  shadcn/ui primitives, a stray Lovable image and `placeholder.svg`, and the
  leftover `bun.lockb` (the repo uses npm).
- **Unused dependencies:** `@hookform/resolvers`, `react-hook-form`, `zod`,
  `@tailwindcss/typography`, and the `@radix-ui/*` packages backing the deleted UI
  primitives (38 packages pruned).

### Changed
- Rewrote `README.md`, `HANDOVER.md`, `docs/ADFIXUS_CORE_SPEC.md`, and corrected
  `SECURITY.md` to the guided-flow reality (no lead form, one env var).
- Fixed lint: ESM import for the Tailwind plugin (was `require()`); removed dead
  `eslint-disable` directives. `npm run build` and `npm run lint` are clean (only
  expected vendored-shadcn / FlowShell react-refresh warnings remain).
- Untracked `.env` (`git rm --cached`); gitignored `.env`, `.env.local`, `.vercel`.

## [3.1.0] - Guided flow + signal-bridge reveal

### Reframed
- Reframed the reveal around the animated `SignalBridge`: restore the conversion
  signal first, with the full economics / deal models demoted behind a depth drawer.
- Wrapped everything in the shared Apple-grade guided-flow shell
  (`src/components/flow/*`).

## [3.0.0] - CAPI simulator on the shared core

### Rebuilt
- Rebuilt as a **publisher sales-plan simulator**: campaign ramp + $30K-cap
  economics + side-by-side commercial deal models (revenue-share / annual-cap /
  flat-fee), then driven by the shared `src/core` engine (`calculateCapiBenefits`,
  scope `id-capi`). Replaced the old per-format `roiCalculations.ts` with the
  verified engine. (Note: version 5.0.0 later moved the CAPI ROI math to the
  self-contained `src/lib/capiRoi.ts` model, so this tool no longer routes the
  headline through the shared engine.)
- Re-skinned to the canonical **dark + bright-cyan** design system and added the
  shared **embed module** (`src/core/embed/embed.ts`).

### Docs
- Rewrote `README.md`, `HANDOVER.md`, `SECURITY.md`; synced
  `docs/ADFIXUS_CORE_SPEC.md`.

### Removed
- All Supabase / backend remnants; the tool is 100% client-side.

---

## [2.0.0] - Developer Handoff Release (historical)

### Major Changes
- **Removed Supabase dependency:** eliminated all backend dependencies for
  simplified deployment.
- **Pure client-side architecture:** all functionality now runs entirely in the
  browser.
- **Streamlined dependencies:** removed unused packages to reduce bundle size and
  security surface.

### New Features
- **Environment-based configuration:** meeting booking URL now configurable via
  environment variables.

### Technical Improvements
- **Dependency cleanup:** removed unused UI components and packages.
- **Bundle optimization:** reduced package count by about 40%.
- **Static deployment ready:** no backend requirements for hosting.

### Configuration Changes

```bash
# Old (Supabase-based)
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...

# New (static deployment)
VITE_MEETING_BOOKING_URL=https://outlook.office.com/book/...
VITE_COMPANY_NAME=AdFixus
```

### Deployment Changes
- **Before:** required Supabase backend + Resend email service.
- **After:** pure static site deployment (Netlify, Vercel, S3, etc.).

### Security Improvements
- **Eliminated backend attack surface:** no server-side code to secure.
- **Reduced dependency vulnerabilities:** about 40% fewer packages to monitor.
- **No secrets required:** all configuration is public environment variables.
- **Client-side only:** no data transmission to external services.

### Breaking Changes
- **Environment variables:** complete change in required variables.
- **Deployment architecture:** no longer requires backend services.

---

## [1.x.x] - Previous Releases
Previous versions included Supabase integration for email functionality and various
UI components that have since been streamlined for the developer handoff.
