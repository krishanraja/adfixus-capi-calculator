# AdFixus CAPI — The Publisher ↔ Advertiser Data Bridge

A public, embeddable **lead magnet** for AdFixus. It makes one idea land in under a
minute: **CAPI (Conversions API) is the data bridge between a publisher and its
advertisers** — and today that bridge is broken for the anonymous majority
(Safari/ITP, logged-out visitors, the wider open web). The conversions still
happen; advertisers just can't attribute them, so they quietly pull budget.

The tool shows a publisher what **restoring that signal** — a durable,
verified-human identity at the edge plus CAPI — is worth in incremental annual
revenue, then invites them to book a meeting.

It runs on the shared `src/core` engine (scope `id-capi`), so the numbers a
prospect sees match what the AdFixus sales team will quote.

> Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
> All three share one design system and one calculation engine — see
> **[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md)** and
> **[HANDOVER.md](HANDOVER.md)**.

## The guided flow (what a visitor sees)

An Apple-grade, three-screen guided flow — provocation → one question → payoff.
Almost no input required; all the depth is one calm link away.

1. **Provocation** — *"Your advertisers only credit the conversions they can see."*
   (`src/components/flow/Provocation.tsx`)
2. **One question** — a single slider: how much of your conversion signal could a
   durable ID restore? Baseline ~30% → 75%+. That's the only lever.
   (`src/components/flow/AskStep.tsx` + `MatchRateControl.tsx`)
3. **Reveal** — the animated **Signal Bridge** visual (the conversion signal
   flowing back across the publisher↔advertiser bridge as coverage rises), one
   hero number (net incremental annual publisher revenue), and one CTA
   (**Book a meeting**). (`src/components/flow/Reveal.tsx` + `src/components/bridge/*`)

Everything richer — the full bridge narrative, the interactive signal-coverage
grid, the fully-configurable inputs, the campaign ramp, the per-campaign
($30K-cap) economics, the three commercial deal models, and a downloadable
PDF — lives behind the **"See the full plan"** drawer
(`src/components/flow/DepthDrawer.tsx` → `src/components/salesplan/FullPlan.tsx`).
Nothing is lost; it is simply demoted.

## Architecture (guided UI → hook → core engine)

```
guided flow UI            src/components/flow/*  + bridge/*   (the 3-screen surface)
        │
        ▼
useSalesPlan()            src/hooks/useSalesPlan.ts           (one control → engine inputs)
        │
        ▼
@/core engine             src/core/  (calculateCapiBenefits, scope 'id-capi')
        │
        ├─ campaign ramp + $30K-cap economics   src/utils/campaignEconomicsCalculator.ts
        └─ three deal models (share / cap / flat) src/utils/commercialCalculations.ts
```

- **The one screen the visitor touches** (`SalesPlanApp.tsx`) drives a single
  input — the restored match rate — through `useSalesPlan` into
  `calculateCapiBenefits(...)` and reads `results.capiCapabilities`. The hero
  number is net annual CAPI-incremental revenue after the AdFixus revenue share.
- **The engine is shared and verified** (`src/core`). It is byte-identical across
  the three AdFixus tools. Run the golden-values self-check to confirm the math
  (see below).
- **Commercial modelling** (only shown inside the depth drawer): the campaign
  ramp and per-campaign economics live in `src/utils/campaignEconomicsCalculator.ts`;
  the three deal models (revenue-share / annual-cap / flat-fee) live in
  `src/utils/commercialCalculations.ts`. The **12.5% share applies to CAPI
  incremental revenue only**, with a **$30K/campaign monthly cap**.

## Run it

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # → dist/  (static SPA)
npm run preview
npm run lint
```

No environment setup is required to run it. The only optional variable is
`VITE_MEETING_BOOKING_URL` (the "Book a meeting" link); see `.env.example`. A
built-in fallback URL is used if it is unset.

## Verify the math

The shared engine ships a dependency-free golden-values regression check:

```bash
npx esbuild src/core/selfcheck.ts --bundle --platform=node --format=cjs \
  --outfile=/tmp/afx.cjs && node /tmp/afx.cjs
```

It prints PASS/FAIL for each golden value and exits non-zero on drift. Because
`src/core/` is identical in every repo, all three tools produce identical numbers.

## Deploy on Vercel (public)

Static SPA — deploy on Vercel (or any static host):

```bash
npm run build    # → dist/
```

On Vercel, framework preset **Vite** (output `dist/`); add the SPA rewrite
`/* → /index.html`. Set `VITE_MEETING_BOOKING_URL` if you want to override the
booking link. This tool is **public** — no auth.

## Embed it in adfixus.com

The app reports its height to the parent page so it iframes cleanly with no inner
scrollbar (`src/core/embed/embed.ts`, called from `src/main.tsx`).

```html
<iframe id="afx" src="https://YOUR-HOST/" style="width:100%;border:0;" scrolling="no"></iframe>
<script>
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://YOUR-HOST') return;
    if (e.data?.type === 'setHeight') {
      document.getElementById('afx').style.height = e.data.height + 'px';
    }
  });
</script>
```

The embed validates parent origin `https://www.adfixus.com` by default; pass a
different `parentOrigin` to `initAdfixusEmbed` to embed elsewhere. Full protocol
in **[docs/ADFIXUS_CORE_SPEC.md](docs/ADFIXUS_CORE_SPEC.md) §5**.

## Key facts

- **100% client-side.** No backend, no login, no API keys, no secrets, no
  database. The PDF is generated in the browser (pdfmake). Nothing is transmitted.
- **One env var** (`VITE_MEETING_BOOKING_URL`, a public link). See `.env.example`.
  Never put a secret in a `VITE_*` variable — those are baked into the client.
- **Canonical dark + bright-cyan brand**, shared with the other two tools.

## File map

```
src/
  main.tsx                      entry; boots the app + initAdfixusEmbed
  App.tsx                       router (single "/" route + 404)
  pages/Index.tsx               <SalesPlanApp/> + SEO/OG tags
  components/
    SalesPlanApp.tsx            the 3-screen guided flow (the whole visible surface)
    flow/                       shared guided-flow shell (identical across tools)
      FlowShell.tsx             full-viewport shell + progress dots + motion
      Provocation.tsx           screen 1
      AskStep.tsx               screen 2 (holds one control)
      MatchRateControl.tsx      the single match-rate slider
      Reveal.tsx                screen 3 (visual + hero number + CTA); AnimatedNumber
      DepthDrawer.tsx           "See the full plan" drawer holding FullPlan
    bridge/                     the data-bridge visuals
      SignalBridge.tsx          the animated publisher↔advertiser bridge (the reveal)
      BridgeHero.tsx / SignalCoverage.tsx   bridge narrative + interactive coverage grid
    salesplan/                  the full plan (inside the drawer)
      FullPlan.tsx              composes the entire deep plan + PDF download
      InputsPanel / PlanSummary / CampaignRamp / MobilizeSalesTeam
    commercial/                 deal-model + campaign-economics UI (inside the drawer)
    ui/                         shadcn/ui primitives (only the ones actually used)
  hooks/
    useSalesPlan.ts             inputs → @/core; the app's single source of numbers
    use-toast.ts                toast state
  core/                         SHARED, VERIFIED engine — identical across the 3 tools
    engine/                     unifiedCalculationEngine + domain aggregation + public API
    constants/                  benchmarks, risk scenarios, readiness factors, pricing
    types/                      domain + scenario/override types
    embed/embed.ts              iframe height-reporting module
    selfcheck.ts                golden-values regression test (run via esbuild)
    index.ts                    @/core barrel
  utils/
    campaignEconomicsCalculator.ts   campaign ramp + per-campaign ($30K-cap) economics
    commercialCalculations.ts        the three deal models + 36-month projection
    pdfGenerator.ts                  client-side PDF (pdfmake), brand-skinned
    formatting.ts                    currency/number formatting helpers
  index.css                     canonical dark-cyan design tokens (identical across tools)
docs/ADFIXUS_CORE_SPEC.md       single source of truth for engine, design, embed protocol
```

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind 3 · shadcn/ui (Radix) · framer-motion ·
Recharts · pdfmake · React Router.
