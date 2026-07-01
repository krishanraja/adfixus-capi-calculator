# AdFixus CAPI — What Your Own Conversions API Is Worth

A public, embeddable **lead magnet** for AdFixus. It makes one idea land in under a
minute for an open-web publisher (think Carsales, Chegg):

> Walled gardens took about half of open-web ad revenue with one thing you do not
> have: **your own Conversions API.**

Facebook and Google sell a 100%-accurate outcomes product because advertisers send
conversions straight back to them. AdFixus gives a publisher the durable,
privacy-safe **identity backbone** to run the same server-to-server CAPI itself —
so it can win outcome budgets back, charge a CPM premium on enriched inventory,
and keep advertisers who stay because measurement finally works.

The tool asks two things a publisher actually knows (annual open-web ad revenue
and vertical), derives everything technical internally, and reveals the
**incremental annual ad revenue** standing up their own CAPI could be worth — then
invites them to book a meeting.

> Part of the AdFixus tool family (with `adfixus-id-simulator` and `adfixus-sales`).
> All three share the same guided-flow shell and design system — see
> **[HANDOVER.md](HANDOVER.md)**.

## The guided flow (what a visitor sees)

An Apple-grade guided flow — provocation → two effortless questions → payoff.
Smart defaults mean a visitor can reach the reveal with almost no input.

1. **Provocation** — *"Walled gardens took about half of open-web ad revenue with
   one thing you do not have: your own Conversions API."*
   (`src/components/flow/Provocation.tsx`)
2. **Ask · revenue** — one slider: roughly how much open-web ad revenue do you make
   a year? (smart default ~$20M; a quiet *traffic + CPM* alternative derives it).
   (`src/components/flow/RevenueControl.tsx`)
3. **Ask · vertical** — a segmented choice (auto / education / retail / finance /
   travel / other) that sets the conversion framing and the default addressable
   share. (`src/components/flow/VerticalControl.tsx`)
4. **Reveal** — the animated **Signal Bridge** (real conversion events flowing back
   from the advertiser as measurable outcomes), one hero number (total incremental
   annual ad revenue), the **three-lever breakdown**, a Carsales benchmark line,
   and one CTA. (`src/components/flow/Reveal.tsx` + `src/components/bridge/*`)

Everything richer — the adjustable levers, the three-year ramp, the three deal
models (what you pay AdFixus vs keep NET) and the $30K-cap per-campaign
economics — lives behind the **"See the full model"** drawer
(`src/components/flow/DepthDrawer.tsx` → `src/components/depth/CommercialDepth.tsx`).
It **reconciles to the same headline number**; nothing is invented, nothing lost.

## The model (every number traces to an input or a named assumption)

`src/lib/capiRoi.ts` — three non-overlapping levers on publisher-knowable inputs:

```
addressable      = annualAdRevenue × performanceShare        (direct-sold / performance book)

Lever A win-back = addressable × winBackRate   (0.22; Carsales CAPI track +22%)
Lever B CPM      = (annualAdRevenue × enrichedShare) × cpmUplift   (0.35 × 0.15; deck +15% CPM)
Lever C retention= addressable × retentionValue (0.08; from +40% campaign retention)

totalIncremental = A + B + C          ← the headline
```

Levers are deliberately non-overlapping: A prices **budget** on the addressable
book, B prices an **inventory** premium, C prices **durability** of the book over
time. All rates are adjustable sliders in the drawer.

`src/lib/capiCommercial.ts` takes that same `totalIncremental` and prices it three
ways so a publisher sees what they pay AdFixus vs keep NET:

- **Revenue share (capped)** — 12.5% of CAPI incremental, with a **$30K per
  campaign per month cap** (the "magic of the cap" for large advertisers).
- **Annual cap** — 12.5% up to a $1.2M annual cap, then 100% to the publisher.
- **Flat fee** — a fixed annual fee regardless of performance.

The campaign shape (avg spend + count) that feeds the $30K-cap table is **derived
from `addressable`**, so the cap table reconciles to the same inputs. The cap math
reuses `src/utils/campaignEconomicsCalculator.ts` (ported from the Vox engine).

### Sample reconciliation ($20M revenue, auto, 40% performance share)

```
addressable = $20M × 0.40                 = $8.0M
A win-back  = $8.0M × 0.22                 = $1.76M
B CPM       = ($20M × 0.35) × 0.15         = $1.05M
C retention = $8.0M × 0.08                 = $0.64M
totalIncremental                          = $3.45M / yr
revenue-share fee ≈ $0.43M → publisher keeps ≈ $3.02M (88%)
3-year ramp (0.55 / 1.0 / 1.2)            ≈ $9.5M cumulative
```

## Architecture (guided UI → hook → model)

```
guided flow UI       src/components/flow/*  + bridge/*      (the guided surface)
        │
        ▼
useCapiRoi()         src/hooks/useCapiRoi.ts                (inputs + assumptions → model)
        │
        ├─ calculateCapiRoi()   src/lib/capiRoi.ts          (the 3-lever headline)
        └─ priceCapiRoi()       src/lib/capiCommercial.ts    (headline → 3 deal models)
                                    └─ $30K-cap economics    src/utils/campaignEconomicsCalculator.ts
```

The reveal and the drawer read the **same `useCapiRoi` state**, so they always
reconcile. There is no second, unrelated number anywhere on the surface.

## Run it

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # → dist/  (static SPA)
npm run preview
npm run lint
```

No environment setup is required. The only optional variable is
`VITE_MEETING_BOOKING_URL` (the "Book a meeting" link); see `.env.example`. A
built-in fallback URL is used if it is unset.

## Deploy on Vercel (public)

Static SPA. On Vercel, framework preset **Vite** (output `dist/`); add the SPA
rewrite `/* → /index.html`. Set `VITE_MEETING_BOOKING_URL` to override the booking
link. This tool is **public** — no auth.

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
different `parentOrigin` to `initAdfixusEmbed` to embed elsewhere.

## Key facts

- **100% client-side.** No backend, no login, no API keys, no secrets, no database.
  Nothing is transmitted.
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
    SalesPlanApp.tsx            the guided flow (the whole visible surface)
    flow/                       shared guided-flow shell (identical across tools)
      FlowShell.tsx             full-viewport shell + progress dots + motion
      Provocation.tsx           step 0
      AskStep.tsx               ask-step wrapper (holds one control)
      RevenueControl.tsx        annual ad revenue slider (+ traffic/CPM alternative)
      VerticalControl.tsx       segmented vertical choice
      Reveal.tsx                the payoff (visual + hero number + CTA); AnimatedNumber
      DepthDrawer.tsx           "See the full model" drawer
    bridge/
      SignalBridge.tsx          the animated CAPI bridge visual (real events flowing back)
    depth/                      the full model, demoted into the drawer (reconciles to headline)
      CommercialDepth.tsx       composes the whole deep model
      LeverBreakdown.tsx        the 3-lever decomposition (compact + full)
      LeverSliders.tsx          all lever assumptions, adjustable
      DealComparison.tsx        3 deal models: pay AdFixus vs keep NET
      CapCampaignTable.tsx      $30K per-campaign cap economics (derived from addressable)
      ThreeYearRamp.tsx         3-year ramp chart
  hooks/
    useCapiRoi.ts               inputs + assumptions → the whole model (single source)
    use-toast.ts                toast state
  lib/
    capiRoi.ts                  the 3-lever ROI model (the headline)
    capiCommercial.ts           prices the headline against the 3 deal models
    utils.ts                    cn() classname helper
  core/
    embed/embed.ts              iframe height-reporting module (shared)
    ...                         shared engine (retained for the tool family; not on the CAPI path)
  utils/
    campaignEconomicsCalculator.ts   per-campaign ($30K-cap) economics (ported from Vox)
  index.css                     canonical dark-cyan design tokens (identical across tools)
```

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind 3 · shadcn/ui (Radix) · framer-motion ·
Recharts · React Router.
